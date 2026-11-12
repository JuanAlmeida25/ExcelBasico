// Perfil de administrador (el profe).
//   POST   /api/admin                    { clave } → sesión de 8 horas
//   GET    /api/admin?accion=sesion      → { admin, configurado }
//   POST   /api/admin?accion=salir       → cierra TODAS las sesiones del admin (en todos los equipos)
// Borrar cuentas, reiniciar PIN y demás ya viven en /api/aprendices.

import { redis, redisVarios } from './_lib/redis.js'
import { endpoint, esAdmin, versionAdmin, LLAVE_VERSION_ADMIN } from './_lib/http.js'
import {
  adminConfigurado, esClaveAdmin, crearSesion, ipDe, contarIntento, MENSAJE_LIMITE
} from './_lib/seguridad.js'

const MAX_FALLOS = 8
const VENTANA_FALLOS = 15 * 60

export default endpoint({
  async POST(req, res) {
    if (req.query.accion === 'salir') {
      if (await esAdmin(req)) await redis(['INCR', LLAVE_VERSION_ADMIN])
      return res.json({ ok: true })
    }
    if (!adminConfigurado()) {
      return res.status(503).json({ error: 'El modo administrador no está activado: falta ADMIN_KEY en Vercel.' })
    }
    // Se suma primero y se decide después: así 200 intentos al mismo tiempo no se cuelan todos antes de anotar
    const llave = `admin:${ipDe(req)}`
    if (await contarIntento(redisVarios, llave, MAX_FALLOS, VENTANA_FALLOS)) return res.status(429).json({ error: MENSAJE_LIMITE })

    if (!esClaveAdmin(req.body?.clave)) return res.status(401).json({ error: 'Clave de administrador incorrecta.' })
    await redis(['DEL', `limite:${llave}`])
    const { token, expira } = crearSesion('admin', `v${await versionAdmin()}`)
    res.json({ token, expira })
  },

  async GET(req, res) {
    res.json({ admin: await esAdmin(req), configurado: adminConfigurado() })
  }
})
