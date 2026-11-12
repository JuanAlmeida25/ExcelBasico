// El registro de aprendices: dónde se guarda, cómo se guarda el PIN y cómo saber quién está pidiendo.
// Igual que en Razonar, pero con prefijo tic: porque las dos guías comparten la misma base de Redis.
//
// Cada aprendiz vive en dos llaves:
//   aprendiz:<doc>  lo que no se toca después de registrarse (huella del PIN, versión, fecha). Solo lo escriben
//                   el registro (NX) y el reinicio de PIN (XX), así nadie resucita una cuenta borrada.
//   perfil:<doc>    un hash con lo que se edita (nombre, tipo de documento, ficha, aprobado). Cada cambio es un HSET
//                   de un campo, así dos cambios al mismo tiempo no se pisan.

import crypto from 'node:crypto'
import { redis, redisVarios, parsearHash } from './redis.js'
import { leerSesion, igualesSeguro } from './seguridad.js'
import { tokenDe } from './http.js'

export const PREFIJO_APRENDICES = 'tic:aprendices'
export const LLAVE_INDICE_APRENDICES = `${PREFIJO_APRENDICES}:documentos`
export const llaveAprendiz = (documento) => `${PREFIJO_APRENDICES}:aprendiz:${documento}`
export const llavePerfil = (documento) => `${PREFIJO_APRENDICES}:perfil:${documento}`
// La firma va aparte: es una imagen y no hace falta cargarla cada vez que se lee el registro
export const llaveFirma = (documento) => `${PREFIJO_APRENDICES}:firma:${documento}`

// Los que pide el formato de asistencia del SENA
export const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PPT', 'PEP']

// Solo PNG de verdad: "iVBORw0KGgo" es la firma de todo archivo PNG (89 50 4E 47…) pasada a base64.
// Y de tamaño razonable: una firma dibujada pesa unos 10 KB, no 5 MB
export const FIRMA_VALIDA = /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]+={0,2}$/
export const MAX_LARGO_FIRMA = 150_000

export const PIN_VALIDO = /^\d{4}$/

// La versión va en cada sesión: si cambia, las sesiones viejas se mueren. Es al azar y no un contador,
// porque un contador vuelve a 1 al borrar y registrar otra vez, y la sesión del de antes revivía
export const nuevaVersion = () => crypto.randomBytes(8).toString('hex')

// El PIN nunca se guarda tal cual: se guarda su huella con sal. Ni mirando Redis se lee
export function huellaPin(pin, sal = crypto.randomBytes(16).toString('hex')) {
  return { sal, huella: crypto.scryptSync(String(pin), sal, 32).toString('hex') }
}

// Para cuando el documento no existe: se hace el cálculo igual, así el tiempo de respuesta no delata quién está registrado
let huellaDeMentiras = null
const registroDeMentiras = () => (huellaDeMentiras ??= huellaPin('no-existe'))

export function pinCorrecto(pin, registro) {
  const contra = registro?.huella && registro?.sal ? registro : registroDeMentiras()
  if (typeof pin !== 'string') return false
  const coincide = igualesSeguro(huellaPin(pin, contra.sal).huella, contra.huella)
  return coincide && contra !== huellaDeMentiras
}

// Junta las dos llaves en un solo registro. El perfil manda sobre lo que se escribió al registrarse
function juntar(fila, perfil) {
  if (!fila) return null
  const base = JSON.parse(fila)
  const cambios = parsearHash(perfil)
  return { ...base, ...cambios, aprobado: cambios.aprobado === true }
}

export async function leerAprendiz(documento) {
  const [fila, perfil] = await redisVarios([['GET', llaveAprendiz(documento)], ['HGETALL', llavePerfil(documento)]])
  return juntar(fila, perfil)
}

// Varios de una, en un solo viaje a Redis
export async function leerAprendices(documentos) {
  if (!documentos.length) return []
  const resultados = await redisVarios(documentos.flatMap((d) => [['GET', llaveAprendiz(d)], ['HGETALL', llavePerfil(d)]]))
  return documentos.map((_, i) => juntar(resultados[2 * i], resultados[2 * i + 1])).filter(Boolean)
}

// Cambia campos del perfil sin tocar lo demás (los valores van en JSON, como el resto de hashes)
export function cambiarPerfil(documento, cambios) {
  return redis(['HSET', llavePerfil(documento), ...Object.entries(cambios).flatMap(([campo, valor]) => [campo, JSON.stringify(valor)])])
}

// Lo que se puede mostrar: todo menos la huella, la sal y la versión
export const datosPublicos = ({ nombre, documento, tipoDocumento = '', ficha, fecha, aprobado = false }) =>
  ({ nombre, documento, tipoDocumento, ficha, fecha, aprobado })

// La sesión viaja en Authorization: Bearer y lleva la "versión" del PIN:
// si el profe se lo reinicia o borra la cuenta, las sesiones viejas de ese aprendiz se mueren solas
export async function aprendizDeLaPeticion(req) {
  const sujeto = leerSesion(tokenDe(req), 'aprendiz')
  if (!sujeto) return null
  let documento, version
  try {
    ({ documento, version } = JSON.parse(sujeto))
  } catch {
    return null // un token de las cuentas viejas (usuario/contraseña): toca entrar otra vez
  }
  const registro = typeof documento === 'string' && (await leerAprendiz(documento))
  if (!registro || registro.version !== version) return null
  return registro
}
