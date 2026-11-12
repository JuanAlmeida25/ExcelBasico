// Registro de aprendices: nombre, documento, ficha y un PIN de 4 dígitos para entrar a la guía.
// Reemplaza las cuentas viejas de usuario y contraseña (api/cuenta.js), copiado de Razonar.
//   POST   /api/aprendices?accion=registrar     { nombre, documento, ficha, pin } → sesión del aprendiz (queda pendiente)
//   POST   /api/aprendices?accion=entrar        { documento, pin } → sesión (3 fallos = 15 min bloqueado)
//   GET    /api/aprendices                      → { aprendiz } el que tiene la sesión abierta (con tieneFirma), o null
//   POST   /api/aprendices?accion=perfil        { tipoDocumento?, firma? } → el aprendiz completa sus datos (la firma, una sola vez y ya aprobado)
//   GET    /api/aprendices?accion=lista         → todos los registrados (solo admin)
//   PUT    /api/aprendices                      { documento, nombre, tipoDocumento, ficha } → corrige datos (solo admin)
//   POST   /api/aprendices?accion=aprobar       { documento, aprobado } → el profe confirma que sí es quien dice (solo admin)
//   POST   /api/aprendices?accion=reiniciar-pin { documento } → PIN nuevo al azar (solo admin)
//   DELETE /api/aprendices?documento=…          → borra el registro (solo admin)
//   DELETE /api/aprendices?documento=…&solo=firma → borra solo la firma, para que la haga otra vez (solo admin)
//
// Por qué "aprobar": el registro es abierto, y cualquiera que sepa la cédula de un compañero podía registrarse
// primero y firmar por él en la planilla del SENA. Ahora, hasta que el profe no lo apruebe, no firma ni sale en la asistencia.

import crypto from 'node:crypto'
import { redis, redisVarios } from './_lib/redis.js'
import { endpoint, exigirAdmin } from './_lib/http.js'
import { crearSesion, ipDe, contarIntento, yaSePaso, MENSAJE_LIMITE } from './_lib/seguridad.js'
import {
  PREFIJO_APRENDICES,
  LLAVE_INDICE_APRENDICES,
  llaveAprendiz,
  llavePerfil,
  llaveFirma,
  TIPOS_DOCUMENTO,
  FIRMA_VALIDA,
  MAX_LARGO_FIRMA,
  PIN_VALIDO,
  nuevaVersion,
  huellaPin,
  pinCorrecto,
  leerAprendiz,
  leerAprendices,
  cambiarPerfil,
  datosPublicos,
  aprendizDeLaPeticion,
} from './_lib/aprendices.js'
import { pinTrivial, MENSAJE_PIN_TRIVIAL } from '../src/utils/pin.js'

// 3 PIN malos seguidos desde el mismo lugar y ese documento queda bloqueado ahí 15 minutos.
// El bloqueo es por documento + IP: así un gracioso desde su celular no deja por fuera a un compañero que está en el salón.
export const MAX_FALLOS_PIN = 3
export const MINUTOS_BLOQUEO = 15
// Pero si los fallos vienen de muchos lados (alguien cambiando de red), a los 10 se bloquea el documento en todas partes
export const MAX_FALLOS_DOCUMENTO = 10
const llaveFallos = (documento, ip) => `${PREFIJO_APRENDICES}:fallos:${documento}:${ip}`
const llaveFallosTotal = (documento) => `${PREFIJO_APRENDICES}:fallos:${documento}:total`
// Las IPs que fallaron con ese documento, para que el profe las pueda limpiar todas al reiniciar el PIN
const llaveIpsFallidas = (documento) => `${PREFIJO_APRENDICES}:fallos:${documento}:ips`

// Por IP solo cuentan los PIN malos, no los buenos: un salón entero sale por la misma IP y entra bien sin problema.
// 40 fallos en una hora ya es alguien probando "1234" con las cédulas de todos
const MAX_FALLOS_POR_IP = 40
const MAX_REGISTROS_POR_IP = 60
const VENTANA_IP = 60 * 60

const texto = (valor, largo) => (typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ').slice(0, largo) : '')
const soloDigitos = (valor) => (typeof valor === 'string' || typeof valor === 'number' ? String(valor).replace(/\D/g, '') : '')
const pinDe = (valor) => (typeof valor === 'string' || typeof valor === 'number' ? String(valor).trim() : '')

function validarNombre(nombre) {
  return nombre.length >= 5 && nombre.includes(' ') ? '' : 'Escribe tu nombre completo (nombre y apellido).'
}

function validarDocumento(documento) {
  return documento.length >= 6 && documento.length <= 15 ? '' : 'Escribe tu número de documento, solo números (entre 6 y 15 dígitos).'
}

// Lo que ve el aprendiz de sí mismo: sus datos, si ya lo aprobaron y si ya dejó la firma
async function comoSeVe(registro) {
  return { ...datosPublicos(registro), tieneFirma: Boolean(await redis(['EXISTS', llaveFirma(registro.documento)])) }
}

async function abrirSesion(registro) {
  const { token, expira } = crearSesion('aprendiz', JSON.stringify({ documento: registro.documento, version: registro.version }))
  return { token, expira, aprendiz: await comoSeVe(registro) }
}

function responderBloqueo(res, segundos, primeraVez) {
  const minutos = Math.max(1, Math.ceil(segundos / 60))
  res.status(429).json({
    error: primeraVez
      ? `🔒 Fallaste el PIN ${MAX_FALLOS_PIN} veces. Por seguridad, tu cuenta queda bloqueada ${MINUTOS_BLOQUEO} minutos. Si se te olvidó, pídele al profe que te lo reinicie.`
      : `🔒 Tu cuenta sigue bloqueada por fallar el PIN. Inténtalo otra vez en ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}, o pídele al profe que te lo reinicie.`,
    bloqueado: true,
    bloqueadoHasta: Date.now() + segundos * 1000,
  })
}

async function registrar(req, res) {
  if (await contarIntento(redisVarios, `tic:aprendices:registrar:${ipDe(req)}`, MAX_REGISTROS_POR_IP, VENTANA_IP)) {
    return res.status(429).json({ error: MENSAJE_LIMITE })
  }
  const nombre = texto(req.body?.nombre, 80)
  const documento = soloDigitos(req.body?.documento)
  const ficha = soloDigitos(req.body?.ficha).slice(0, 12)
  const tipoDocumento = req.body?.tipoDocumento
  const pin = pinDe(req.body?.pin)

  const error = validarNombre(nombre) || validarDocumento(documento)
  if (error) return res.status(400).json({ error })
  if (!TIPOS_DOCUMENTO.includes(tipoDocumento)) return res.status(400).json({ error: 'Escoge tu tipo de documento.' })
  if (!PIN_VALIDO.test(pin)) return res.status(400).json({ error: 'El PIN debe tener exactamente 4 números.' })
  if (pinTrivial(pin)) return res.status(400).json({ error: MENSAJE_PIN_TRIVIAL })

  const registro = { nombre, documento, tipoDocumento, ficha, fecha: new Date().toISOString(), version: nuevaVersion(), ...huellaPin(pin) }
  // NX: si ese documento ya está registrado, no se pisa (si no, cualquiera le cambiaría el PIN a otro)
  const guardado = await redis(['SET', llaveAprendiz(documento), JSON.stringify(registro), 'NX'])
  if (guardado !== 'OK') {
    return res.status(409).json({ error: 'Ese documento ya está registrado. Entra con tu PIN; si se te olvidó o no fuiste tú, avísale al profe.' })
  }
  // Perfil limpio (por si quedó basura de una cuenta borrada) y pendiente hasta que el profe lo apruebe
  await redisVarios([
    ['DEL', llavePerfil(documento)],
    ['HSET', llavePerfil(documento), 'aprobado', 'false'],
    ['SADD', LLAVE_INDICE_APRENDICES, documento],
  ])
  res.json(await abrirSesion({ ...registro, aprobado: false }))
}

async function entrar(req, res) {
  const ip = ipDe(req)
  const llaveIp = `tic:aprendices:fallos-ip:${ip}`
  if (await yaSePaso(redis, llaveIp, MAX_FALLOS_POR_IP)) return res.status(429).json({ error: MENSAJE_LIMITE })

  const documento = soloDigitos(req.body?.documento)
  const pin = pinDe(req.body?.pin)
  const error = validarDocumento(documento)
  if (error) return res.status(400).json({ error })

  // Primero se cuenta y después se revisa: así 10 intentos al mismo tiempo no se cuelan todos
  const llave = llaveFallos(documento, ip)
  const llaveTotal = llaveFallosTotal(documento)
  const [intento, , total] = await redisVarios([
    ['INCR', llave],
    ['EXPIRE', llave, MINUTOS_BLOQUEO * 60, 'NX'],
    ['INCR', llaveTotal],
    ['EXPIRE', llaveTotal, MINUTOS_BLOQUEO * 60, 'NX'],
    ['SADD', llaveIpsFallidas(documento), ip],
    ['EXPIRE', llaveIpsFallidas(documento), MINUTOS_BLOQUEO * 60],
  ])
  if (intento > MAX_FALLOS_PIN) return responderBloqueo(res, Math.max(await redis(['TTL', llave]), 1), false)
  if (total > MAX_FALLOS_DOCUMENTO) return responderBloqueo(res, Math.max(await redis(['TTL', llaveTotal]), 1), false)

  // pinCorrecto calcula igual aunque el documento no exista: el tiempo de respuesta no delata a nadie
  const registro = await leerAprendiz(documento)
  if (pinCorrecto(pin, registro) && registro) {
    // Le devolvemos el intento al total: los aciertos no cuentan como fallos (DECR deja quieto el vencimiento)
    await redisVarios([['DEL', llave], ['DECR', llaveTotal]])
    return res.json(await abrirSesion(registro))
  }

  await contarIntento(redisVarios, llaveIp, MAX_FALLOS_POR_IP, VENTANA_IP)
  if (intento === MAX_FALLOS_PIN) {
    // Los 15 minutos se cuentan desde el tercer fallo, no desde el primero
    await redis(['EXPIRE', llave, MINUTOS_BLOQUEO * 60])
    return responderBloqueo(res, MINUTOS_BLOQUEO * 60, true)
  }
  if (total === MAX_FALLOS_DOCUMENTO) {
    await redis(['EXPIRE', llaveTotal, MINUTOS_BLOQUEO * 60])
    return responderBloqueo(res, MINUTOS_BLOQUEO * 60, true)
  }
  const quedan = MAX_FALLOS_PIN - intento
  // Mismo mensaje si el documento no existe: así nadie averigua quién está registrado
  res.status(401).json({
    error: `Documento o PIN incorrecto. Te ${quedan === 1 ? 'queda 1 intento' : `quedan ${quedan} intentos`}; al ${MAX_FALLOS_PIN}.º fallo la cuenta se bloquea ${MINUTOS_BLOQUEO} minutos.`,
    intentosRestantes: quedan,
  })
}

// El aprendiz completa lo que le falta: el tipo de documento (los que se registraron antes no lo tienen) y la firma
async function perfil(req, res) {
  const registro = await aprendizDeLaPeticion(req)
  if (!registro) return res.status(401).json({ error: 'Tu sesión venció. Entra otra vez con tu documento y PIN.', sesionVencida: true })
  const { tipoDocumento, firma } = req.body || {}

  if (tipoDocumento !== undefined) {
    if (!TIPOS_DOCUMENTO.includes(tipoDocumento)) return res.status(400).json({ error: 'Escoge tu tipo de documento.' })
    await cambiarPerfil(registro.documento, { tipoDocumento })
    registro.tipoDocumento = tipoDocumento
  }

  if (firma !== undefined) {
    if (!registro.aprobado) {
      return res.status(403).json({ error: 'Todavía no puedes firmar: el profe tiene que aprobar tu cuenta primero. Pídeselo en clase.' })
    }
    if (typeof firma !== 'string' || firma.length > MAX_LARGO_FIRMA || !FIRMA_VALIDA.test(firma)) {
      return res.status(400).json({ error: 'La firma no llegó bien. Bórrala y hazla otra vez.' })
    }
    // Una sola vez: si ya firmó, solo el profe se la puede borrar para que la repita
    if ((await redis(['SET', llaveFirma(registro.documento), firma, 'NX'])) !== 'OK') {
      return res.status(409).json({ error: 'Ya tienes tu firma guardada. Si quedó mal, pídele al profe que te la borre.' })
    }
  }

  res.json({ aprendiz: await comoSeVe(registro) })
}

async function lista(req, res) {
  if (!(await exigirAdmin(req, res))) return
  const documentos = await redis(['SMEMBERS', LLAVE_INDICE_APRENDICES])
  const registros = await leerAprendices(documentos)
  const extras = registros.length
    ? await redisVarios(registros.flatMap((r) => [['GET', llaveFallosTotal(r.documento)], ['EXISTS', llaveFirma(r.documento)]]))
    : []
  const aprendices = registros
    // EXISTS y no GET para la firma: aquí basta saber si firmó, sin bajar todas las imágenes
    .map((r, i) => ({ ...datosPublicos(r), bloqueado: Number(extras[2 * i]) >= MAX_FALLOS_PIN, tieneFirma: Boolean(extras[2 * i + 1]) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  res.json({ aprendices })
}

async function aprobar(req, res) {
  if (!(await exigirAdmin(req, res))) return
  const documento = soloDigitos(req.body?.documento)
  if (typeof req.body?.aprobado !== 'boolean') return res.status(400).json({ error: 'Se esperaba aprobado: true o false.' })
  const registro = documento && (await leerAprendiz(documento))
  if (!registro) return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
  await cambiarPerfil(documento, { aprobado: req.body.aprobado })
  res.json({ aprendiz: datosPublicos({ ...registro, aprobado: req.body.aprobado }) })
}

// Un PIN al azar que no sea de los facilitos (si sale 1234, se tira otra vez)
function pinAlAzar() {
  let pin
  do pin = String(crypto.randomInt(0, 10000)).padStart(4, '0')
  while (pinTrivial(pin))
  return pin
}

async function reiniciarPin(req, res) {
  if (!(await exigirAdmin(req, res))) return
  const documento = soloDigitos(req.body?.documento)
  const fila = documento && (await redis(['GET', llaveAprendiz(documento)]))
  if (!fila) return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
  // PIN al azar que el profe le dicta al aprendiz; la versión nueva cierra sus sesiones abiertas
  const pin = pinAlAzar()
  const actualizado = { ...JSON.parse(fila), ...huellaPin(pin), version: nuevaVersion() }
  // XX: si justo lo borraron mientras tanto, no se revive
  if ((await redis(['SET', llaveAprendiz(documento), JSON.stringify(actualizado), 'XX'])) !== 'OK') {
    return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
  }
  // Se le quitan los bloqueos de todas las IPs donde falló
  const ips = await redis(['SMEMBERS', llaveIpsFallidas(documento)])
  await redis(['DEL', llaveFallosTotal(documento), llaveIpsFallidas(documento), ...ips.map((ip) => llaveFallos(documento, ip))])
  res.json({ pin, aprendiz: datosPublicos(await leerAprendiz(documento)) })
}

export default endpoint({
  async GET(req, res) {
    if (req.query?.accion === 'lista') return lista(req, res)
    const registro = await aprendizDeLaPeticion(req)
    res.json({ aprendiz: registro ? await comoSeVe(registro) : null })
  },

  async POST(req, res) {
    if (req.query?.accion === 'registrar') return registrar(req, res)
    if (req.query?.accion === 'entrar') return entrar(req, res)
    if (req.query?.accion === 'aprobar') return aprobar(req, res)
    if (req.query?.accion === 'reiniciar-pin') return reiniciarPin(req, res)
    if (req.query?.accion === 'perfil') return perfil(req, res)
    res.status(400).json({ error: 'Acción desconocida.' })
  },

  async PUT(req, res) {
    if (!(await exigirAdmin(req, res))) return
    const documento = soloDigitos(req.body?.documento)
    const registro = documento && (await leerAprendiz(documento))
    if (!registro) return res.status(404).json({ error: 'Ese aprendiz no está registrado.' })
    const nombre = texto(req.body?.nombre, 80)
    const error = validarNombre(nombre)
    if (error) return res.status(400).json({ error })
    const tipoDocumento = TIPOS_DOCUMENTO.includes(req.body?.tipoDocumento) ? req.body.tipoDocumento : registro.tipoDocumento || ''
    const cambios = { nombre, tipoDocumento, ficha: soloDigitos(req.body?.ficha).slice(0, 12) }
    await cambiarPerfil(documento, cambios)
    res.json({ aprendiz: datosPublicos({ ...registro, ...cambios }) })
  },

  async DELETE(req, res) {
    if (!(await exigirAdmin(req, res))) return
    const documento = soloDigitos(req.query?.documento)
    if (!documento) return res.status(400).json({ error: 'Falta el documento.' })
    if (req.query?.solo === 'firma') {
      await redis(['DEL', llaveFirma(documento)])
      return res.json({ ok: true })
    }
    const ips = await redis(['SMEMBERS', llaveIpsFallidas(documento)])
    await redisVarios([
      ['DEL', llaveAprendiz(documento), llavePerfil(documento), llaveFirma(documento), llaveFallosTotal(documento), llaveIpsFallidas(documento), ...ips.map((ip) => llaveFallos(documento, ip))],
      ['SREM', LLAVE_INDICE_APRENDICES, documento],
    ])
    res.json({ ok: true })
  },
})
