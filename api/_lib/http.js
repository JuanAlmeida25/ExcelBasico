// Ayudas comunes de los endpoints: errores, método permitido y quién hace la petición.

import { redis } from './redis.js'
import { leerSesion } from './seguridad.js'

export function tokenDe(req) {
  const cabecera = req.headers.authorization || ''
  return cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : ''
}

// La cabecera Authorization trae la sesión del aprendiz (la lee aprendizDeLaPeticion); X-Admin-Token, la del admin.
// Van separadas porque el profe puede estar logueado también como aprendiz para probar.

// Cada sesión del admin lleva la versión vigente. "Salir de Admin" la sube y todas las sesiones del admin
// se mueren, hasta la que alguien haya copiado del PC del salón (como en Razonar)
export const LLAVE_VERSION_ADMIN = 'tic:admin:version'

export async function versionAdmin() {
  return Number(await redis(['GET', LLAVE_VERSION_ADMIN])) || 0
}

// Solo se le pregunta a Redis si la firma del token es buena: un token inventado no gasta comandos
export async function esAdmin(req) {
  const sujeto = leerSesion(texto(req.headers['x-admin-token']), 'admin')
  if (!sujeto) return false
  return sujeto === `v${await versionAdmin()}`
}

export async function exigirAdmin(req, res) {
  if (await esAdmin(req)) return true
  res.status(401).json({ error: 'Tu sesión de administrador venció. Vuelve a ingresar.', sesionVencida: true })
  return false
}

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

// Envuelve el endpoint: nada de cachés, y cualquier error termina en un JSON entendible
export function endpoint(manejadores) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    const manejador = manejadores[req.method]
    if (!manejador) {
      res.setHeader('Allow', Object.keys(manejadores).join(', '))
      return res.status(405).json({ error: 'Método no permitido' })
    }
    try {
      await manejador(req, res)
    } catch (error) {
      if (error.status) return res.status(error.status).json({ error: error.message })
      console.error(error)
      res.status(500).json({ error: 'Algo se dañó en el servidor. Inténtalo otra vez en un ratico.' })
    }
  }
}
