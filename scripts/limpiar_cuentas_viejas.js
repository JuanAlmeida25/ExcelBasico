// Limpieza de una sola vez: borra las cuentas viejas de usuario y contraseña que quedaron en Redis
// y les quita el "usuario" a las respuestas viejas del foro (la nota, el nombre y el texto se quedan).
// Es por la Ley 1581: si ya no se usan, no hay por qué guardarlas.
//
//   node --env-file=.env.local scripts/limpiar_cuentas_viejas.js              → solo cuenta lo que haría
//   node --env-file=.env.local scripts/limpiar_cuentas_viejas.js --confirmar  → lo hace de verdad
//
// Necesita KV_REST_API_URL, KV_REST_API_TOKEN y SESION_SECRETO (los de producción: `vercel env pull .env.local`).

import { redis, redisVarios, parsearHash } from '../api/_lib/redis.js'
import { huellaPrivada } from '../api/_lib/seguridad.js'

const HASH_FORO = 'foro:respuestas'

export async function limpiarCuentasViejas({ confirmar = false } = {}) {
  const usuarios = await redis(['SMEMBERS', 'usuarios'])
  const respuestas = Object.values(parsearHash(await redis(['HGETALL', HASH_FORO])))
  // Las viejas se reconocen porque traen "usuario" y no "documento"
  const viejas = respuestas.filter((r) => r.usuario && !r.documento)

  if (confirmar) {
    if (usuarios.length) await redis(['DEL', 'usuarios', ...usuarios.map((u) => `usuario:${u}`)])
    for (const vieja of viejas) {
      const { usuario, ...resto } = vieja
      // El id viejo era pregunta:usuario; el nuevo no deja ver quién era, igual que los de documento
      const limpia = { ...resto, id: `${vieja.pregunta}:viejo-${huellaPrivada(usuario)}` }
      await redisVarios([
        ['HSET', HASH_FORO, limpia.id, JSON.stringify(limpia)],
        ['HDEL', HASH_FORO, vieja.id],
      ])
    }
  }
  return { cuentas: usuarios.length, respuestas: viejas.length, hecho: confirmar }
}

// Solo corre si lo llaman directo desde la terminal (las pruebas lo importan sin correrlo)
if (import.meta.url === `file://${process.argv[1]}`) {
  const confirmar = process.argv.includes('--confirmar')
  const { cuentas, respuestas } = await limpiarCuentasViejas({ confirmar })
  console.log(
    confirmar
      ? `Listo: se borraron ${cuentas} cuentas viejas y se limpiaron ${respuestas} respuestas del foro.`
      : `Hay ${cuentas} cuentas viejas y ${respuestas} respuestas del foro con usuario viejo. Para limpiarlas, corre otra vez con --confirmar.`
  )
}
