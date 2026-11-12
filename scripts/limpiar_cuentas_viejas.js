// Limpieza de una sola vez: borra las cuentas viejas de usuario y contraseña que quedaron en Redis.
// Es por la Ley 1581: si ya no se usan, no hay por qué guardarlas.
// El foro ya no existe en la guía, pero sus respuestas (con notas) siguen en Redis: solo se borran si lo pides.
//
//   node --env-file=.env.local scripts/limpiar_cuentas_viejas.js                           → solo cuenta lo que haría
//   node --env-file=.env.local scripts/limpiar_cuentas_viejas.js --confirmar               → borra las cuentas viejas
//   node --env-file=.env.local scripts/limpiar_cuentas_viejas.js --confirmar --borrar-foro → y también las respuestas del foro
//
// Necesita KV_REST_API_URL y KV_REST_API_TOKEN (los de producción: `vercel env pull .env.local`).

import { redis } from '../api/_lib/redis.js'

const HASH_FORO = 'foro:respuestas'

export async function limpiarCuentasViejas({ confirmar = false, borrarForo = false } = {}) {
  const usuarios = await redis(['SMEMBERS', 'usuarios'])
  const respuestas = await redis(['HLEN', HASH_FORO])

  if (confirmar) {
    if (usuarios.length) await redis(['DEL', 'usuarios', ...usuarios.map((u) => `usuario:${u}`)])
    if (borrarForo) await redis(['DEL', HASH_FORO])
  }
  return { cuentas: usuarios.length, respuestas, hecho: confirmar, foroBorrado: confirmar && borrarForo }
}

// Solo corre si lo llaman directo desde la terminal (las pruebas lo importan sin correrlo)
if (import.meta.url === `file://${process.argv[1]}`) {
  const confirmar = process.argv.includes('--confirmar')
  const borrarForo = process.argv.includes('--borrar-foro')
  const { cuentas, respuestas, foroBorrado } = await limpiarCuentasViejas({ confirmar, borrarForo })
  console.log(
    confirmar
      ? `Listo: se borraron ${cuentas} cuentas viejas.${foroBorrado ? ` Y ${respuestas} respuestas del foro.` : ''}`
      : `Hay ${cuentas} cuentas viejas y ${respuestas} respuestas del foro guardadas. Para borrar las cuentas, corre otra vez con --confirmar (y --borrar-foro si también quieres borrar el foro).`
  )
}
