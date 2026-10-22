// Ayudas comunes de los endpoints: errores, método permitido y quién hace la petición.

import { leerSesion } from './seguridad.js'

export function tokenDe(req) {
  const cabecera = req.headers.authorization || ''
  return cabecera.startsWith('Bearer ') ? cabecera.slice(7).trim() : ''
}

// La cabecera Authorization trae la sesión del aprendiz; X-Admin-Token, la del admin.
// Van separadas porque el profe puede estar logueado también como aprendiz para probar.
export function quienEs(req) {
  return {
    usuario: leerSesion(tokenDe(req), 'aprendiz'),
    admin: leerSesion(texto(req.headers['x-admin-token']), 'admin') === 'admin'
  }
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
