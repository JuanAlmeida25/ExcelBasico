// Respuestas del foro.
//   GET    /api/foro?fase=1           → respuestas de esa fase (cualquiera las puede leer)
//   POST   /api/foro                  { pregunta, texto }   (aprendiz con sesión)
//   DELETE /api/foro?id=…             (el autor o el admin)
//   PATCH  /api/foro?id=…             { calificacion, retroalimentacion }   (solo admin)
//
// Todo vive en un hash "foro:respuestas". El id es pregunta:usuario, así cada aprendiz
// responde una sola vez por pregunta y Redis lo garantiza con HSETNX.

import { redis, redisVarios, parsearHash } from './_lib/redis.js'
import { endpoint, quienEs } from './_lib/http.js'
import { contarIntento, MENSAJE_LIMITE } from './_lib/seguridad.js'
import { texto, validarRespuesta, validarCalificacion } from './_lib/validar.js'
import { forosPorFase, idsPreguntas } from '../src/datos/foro.js'

const HASH = 'foro:respuestas'
const MAX_PUBLICACIONES_POR_MINUTO = 5

async function leerRespuesta(id) {
  const guardada = await redis(['HGET', HASH, id])
  return guardada ? JSON.parse(guardada) : null
}

export default endpoint({
  async GET(req, res) {
    const foro = forosPorFase[req.query.fase]
    if (!foro) return res.status(404).json({ error: 'Esa fase no tiene foro' })
    const ids = new Set(foro.preguntas.map((p) => p.id))
    const todas = Object.values(parsearHash(await redis(['HGETALL', HASH])))
    const respuestas = todas
      .filter((r) => ids.has(r.pregunta))
      .sort((a, b) => a.creado.localeCompare(b.creado))
    res.json({ respuestas })
  },

  async POST(req, res) {
    const { usuario } = quienEs(req)
    if (!usuario) return res.status(401).json({ error: 'Ingresa con tu usuario para responder.', sesionVencida: true })

    const cuentaJson = await redis(['GET', `usuario:${usuario}`])
    if (!cuentaJson) return res.status(401).json({ error: 'Tu cuenta ya no existe. Regístrate de nuevo.', sesionVencida: true })

    const pregunta = texto(req.body?.pregunta)
    if (!idsPreguntas.includes(pregunta)) return res.status(400).json({ error: 'Esa pregunta no existe' })
    const respuesta = validarRespuesta(req.body?.texto)
    if (respuesta.error) return res.status(400).json({ error: respuesta.error })

    if (await contarIntento(redisVarios, `publicar:${usuario}`, MAX_PUBLICACIONES_POR_MINUTO, 60)) {
      return res.status(429).json({ error: MENSAJE_LIMITE })
    }

    const nueva = {
      id: `${pregunta}:${usuario}`,
      pregunta,
      usuario,
      nombre: JSON.parse(cuentaJson).nombre,
      texto: respuesta.valor,
      creado: new Date().toISOString(),
      calificacion: null,
      retroalimentacion: '',
      calificadoEn: null
    }
    const guardada = await redis(['HSETNX', HASH, nueva.id, JSON.stringify(nueva)])
    if (!guardada) {
      return res.status(409).json({ error: 'Ya respondiste esta pregunta. Si quieres cambiarla, bórrala y publícala de nuevo.' })
    }
    res.status(201).json({ respuesta: nueva })
  },

  async DELETE(req, res) {
    const { usuario, admin } = quienEs(req)
    const respuesta = await leerRespuesta(texto(req.query.id))
    if (!respuesta) return res.status(404).json({ error: 'Esa respuesta ya no existe' })
    if (!admin && respuesta.usuario !== usuario) {
      return res.status(403).json({ error: 'Solo el autor o el administrador pueden borrar esta respuesta.' })
    }
    await redis(['HDEL', HASH, respuesta.id])
    res.json({ ok: true })
  },

  async PATCH(req, res) {
    if (!quienEs(req).admin) {
      return res.status(401).json({ error: 'Tu sesión de administrador venció. Vuelve a ingresar.', sesionVencida: true })
    }
    const respuesta = await leerRespuesta(texto(req.query.id))
    if (!respuesta) return res.status(404).json({ error: 'Esa respuesta ya no existe' })
    const nota = validarCalificacion(req.body?.calificacion, req.body?.retroalimentacion)
    if (nota.error) return res.status(400).json({ error: nota.error })

    const calificada = { ...respuesta, ...nota.valor, calificadoEn: new Date().toISOString() }
    await redis(['HSET', HASH, calificada.id, JSON.stringify(calificada)])
    res.json({ respuesta: calificada })
  }
})
