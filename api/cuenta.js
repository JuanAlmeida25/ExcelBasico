// Cuentas de los aprendices: registrarse, ingresar y saber quién soy.
//   GET  /api/cuenta                      → { usuario, nombre } o { usuario: null }
//   POST /api/cuenta?accion=registro      { usuario, nombre, clave }
//   POST /api/cuenta?accion=ingresar      { usuario, clave }

import { redis, redisVarios } from './_lib/redis.js'
import { endpoint, quienEs } from './_lib/http.js'
import {
  cifrarClave, verificarClave, crearSesion, ipDe, contarIntento, yaSePaso, MENSAJE_LIMITE
} from './_lib/seguridad.js'
import { validarUsuario, validarNombre, validarClave } from './_lib/validar.js'

const MAX_REGISTROS_POR_HORA = 5
const MAX_FALLOS_INGRESO = 8
const VENTANA_FALLOS = 15 * 60

async function leerUsuario(usuario) {
  const guardado = await redis(['GET', `usuario:${usuario}`])
  return guardado ? JSON.parse(guardado) : null
}

async function registro(req, res) {
  if (await contarIntento(redisVarios, `registro:${ipDe(req)}`, MAX_REGISTROS_POR_HORA, 60 * 60)) {
    return res.status(429).json({ error: MENSAJE_LIMITE })
  }

  const usuario = validarUsuario(req.body?.usuario)
  const nombre = validarNombre(req.body?.nombre)
  const clave = validarClave(req.body?.clave)
  const error = usuario.error || nombre.error || clave.error
  if (error) return res.status(400).json({ error })

  const cuenta = {
    usuario: usuario.valor,
    nombre: nombre.valor,
    hash: await cifrarClave(clave.valor),
    creado: new Date().toISOString()
  }
  // NX: solo la guarda si no existe, así dos personas no se quedan con el mismo usuario al tiempo
  const guardado = await redis(['SET', `usuario:${cuenta.usuario}`, JSON.stringify(cuenta), 'NX'])
  if (!guardado) return res.status(409).json({ error: 'Ese usuario ya existe. Escoge otro o ingresa con tu contraseña.' })
  await redis(['SADD', 'usuarios', cuenta.usuario])

  const { token, expira } = crearSesion('aprendiz', cuenta.usuario)
  res.status(201).json({ usuario: cuenta.usuario, nombre: cuenta.nombre, token, expira })
}

async function ingresar(req, res) {
  const usuario = validarUsuario(req.body?.usuario).valor || ''
  const llave = `ingreso:${ipDe(req)}:${usuario}`
  if (await yaSePaso(redis, llave, MAX_FALLOS_INGRESO)) return res.status(429).json({ error: MENSAJE_LIMITE })

  const cuenta = usuario && await leerUsuario(usuario)
  // mismo mensaje si no existe el usuario o si la clave está mala: no le regalamos pistas a nadie
  if (!cuenta || !(await verificarClave(req.body?.clave, cuenta.hash))) {
    await contarIntento(redisVarios, llave, MAX_FALLOS_INGRESO, VENTANA_FALLOS)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' })
  }

  await redis(['DEL', `limite:${llave}`])
  const { token, expira } = crearSesion('aprendiz', cuenta.usuario)
  res.json({ usuario: cuenta.usuario, nombre: cuenta.nombre, token, expira })
}

export default endpoint({
  async GET(req, res) {
    const { usuario } = quienEs(req)
    // si el profe borró la cuenta, la sesión vieja ya no sirve
    const cuenta = usuario && await leerUsuario(usuario)
    res.json(cuenta ? { usuario: cuenta.usuario, nombre: cuenta.nombre } : { usuario: null })
  },

  async POST(req, res) {
    if (req.query.accion === 'registro') return registro(req, res)
    if (req.query.accion === 'ingresar') return ingresar(req, res)
    res.status(400).json({ error: 'Acción no válida' })
  }
})
