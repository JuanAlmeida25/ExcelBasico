// Perfil de administrador (el profe), igualito al del foro de Licenciamiento.
//   POST   /api/admin                    { clave } → sesión de 8 horas
//   GET    /api/admin?accion=sesion      → { admin, configurado }
//   GET    /api/admin?accion=resumen     → cuentas y respuestas para el Panel del Profe
//   DELETE /api/admin?usuario=pepito     → borra la cuenta (para el que olvidó la contraseña)

import { redis, redisVarios, parsearHash } from './_lib/redis.js'
import { endpoint, quienEs } from './_lib/http.js'
import {
  adminConfigurado, esClaveAdmin, crearSesion, ipDe, contarIntento, yaSePaso, MENSAJE_LIMITE
} from './_lib/seguridad.js'
import { validarUsuario } from './_lib/validar.js'

const MAX_FALLOS = 8
const VENTANA_FALLOS = 15 * 60

function exigirAdmin(req, res) {
  if (quienEs(req).admin) return true
  res.status(401).json({ error: 'Tu sesión de administrador venció. Vuelve a ingresar.', sesionVencida: true })
  return false
}

async function resumen(req, res) {
  if (!exigirAdmin(req, res)) return
  const usuarios = await redis(['SMEMBERS', 'usuarios'])
  const [guardados, respuestas] = await redisVarios([
    // MGET con la lista vacía revienta, por eso el comodín
    ['MGET', ...(usuarios.length ? usuarios.map((u) => `usuario:${u}`) : ['usuario:__nadie__'])],
    ['HGETALL', 'foro:respuestas']
  ])
  const cuentas = guardados
    .filter(Boolean)
    .map((json) => {
      const { usuario, nombre, creado } = JSON.parse(json)
      return { usuario, nombre, creado }
    })
  res.json({ cuentas, respuestas: Object.values(parsearHash(respuestas)) })
}

export default endpoint({
  async POST(req, res) {
    if (!adminConfigurado()) {
      return res.status(503).json({ error: 'El modo administrador no está activado: falta ADMIN_KEY en Vercel.' })
    }
    const llave = `admin:${ipDe(req)}`
    if (await yaSePaso(redis, llave, MAX_FALLOS)) return res.status(429).json({ error: MENSAJE_LIMITE })

    if (!esClaveAdmin(req.body?.clave)) {
      await contarIntento(redisVarios, llave, MAX_FALLOS, VENTANA_FALLOS)
      return res.status(401).json({ error: 'Clave de administrador incorrecta.' })
    }
    await redis(['DEL', `limite:${llave}`])
    const { token, expira } = crearSesion('admin', 'admin')
    res.json({ token, expira })
  },

  async GET(req, res) {
    if (req.query.accion === 'resumen') return resumen(req, res)
    res.json({ admin: quienEs(req).admin, configurado: adminConfigurado() })
  },

  async DELETE(req, res) {
    if (!exigirAdmin(req, res)) return
    const usuario = validarUsuario(req.query.usuario)
    if (usuario.error) return res.status(400).json({ error: 'Usuario no válido' })
    // Sus respuestas se quedan: si se vuelve a registrar con el mismo usuario, recupera su historial
    const [borrado] = await redisVarios([
      ['DEL', `usuario:${usuario.valor}`],
      ['SREM', 'usuarios', usuario.valor]
    ])
    if (!borrado) return res.status(404).json({ error: 'Esa cuenta no existe' })
    res.json({ ok: true })
  }
})
