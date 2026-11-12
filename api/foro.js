// Respuestas del foro.
//   GET    /api/foro?fase=1           → respuestas de esa fase (aprendiz con sesión o admin)
//   POST   /api/foro                  { pregunta, texto }   (aprendiz con sesión)
//   DELETE /api/foro?id=…             (el autor o el admin)
//   PATCH  /api/foro?id=…             { calificacion, retroalimentacion }   (solo admin)
//
// Todo vive en un hash "foro:respuestas". El id es pregunta:huella-del-documento, así cada aprendiz
// responde una sola vez por pregunta (Redis lo garantiza con HSETNX) y el id no deja ver su documento.
// Los compañeros no ven documentos ajenos: solo el admin. Cada uno sabe cuáles son suyas por "esMia".

import { redis, redisVarios, parsearHash } from './_lib/redis.js'
import { endpoint, esAdmin, exigirAdmin } from './_lib/http.js'
import { contarIntento, huellaPrivada, MENSAJE_LIMITE } from './_lib/seguridad.js'
import { aprendizDeLaPeticion } from './_lib/aprendices.js'
import { texto, validarRespuesta, validarCalificacion } from './_lib/validar.js'
import { forosPorFase, idsPreguntas } from '../src/datos/foro.js'

const HASH = 'foro:respuestas'
const MAX_PUBLICACIONES_POR_MINUTO = 5

const SIN_SESION = { error: 'Tu sesión venció. Entra otra vez con tu documento y PIN.', sesionVencida: true }

// Las respuestas de las cuentas viejas traen "usuario" en vez de "documento": esas ya no son de nadie
const esDe = (respuesta, aprendiz) => Boolean(aprendiz && respuesta.documento && respuesta.documento === aprendiz.documento)

function paraMostrar(respuesta, aprendiz, admin) {
  const { documento, usuario, ...publica } = respuesta
  return { ...publica, ...(admin ? { documento: documento || usuario || '' } : {}), esMia: esDe(respuesta, aprendiz) }
}

async function leerRespuesta(id) {
  const guardada = await redis(['HGET', HASH, id])
  return guardada ? JSON.parse(guardada) : null
}

export default endpoint({
  async GET(req, res) {
    const admin = await esAdmin(req)
    const aprendiz = await aprendizDeLaPeticion(req)
    if (!admin && !aprendiz) return res.status(401).json(SIN_SESION)
    const foro = forosPorFase[req.query.fase]
    if (!foro) return res.status(404).json({ error: 'Esa fase no tiene foro.' })
    const ids = new Set(foro.preguntas.map((p) => p.id))
    const todas = Object.values(parsearHash(await redis(['HGETALL', HASH])))
    const respuestas = todas
      .filter((r) => ids.has(r.pregunta))
      .sort((a, b) => a.creado.localeCompare(b.creado))
      .map((r) => paraMostrar(r, aprendiz, admin))
    res.json({ respuestas })
  },

  async POST(req, res) {
    const aprendiz = await aprendizDeLaPeticion(req)
    if (!aprendiz) return res.status(401).json(SIN_SESION)

    const pregunta = texto(req.body?.pregunta)
    if (!idsPreguntas.includes(pregunta)) return res.status(400).json({ error: 'Esa pregunta no existe.' })
    const respuesta = validarRespuesta(req.body?.texto)
    if (respuesta.error) return res.status(400).json({ error: respuesta.error })

    if (await contarIntento(redisVarios, `publicar:${aprendiz.documento}`, MAX_PUBLICACIONES_POR_MINUTO, 60)) {
      return res.status(429).json({ error: MENSAJE_LIMITE })
    }

    const nueva = {
      id: `${pregunta}:${huellaPrivada(aprendiz.documento)}`,
      pregunta,
      documento: aprendiz.documento,
      nombre: aprendiz.nombre,
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
    res.status(201).json({ respuesta: paraMostrar(nueva, aprendiz, await esAdmin(req)) })
  },

  async DELETE(req, res) {
    const admin = await esAdmin(req)
    const aprendiz = admin ? null : await aprendizDeLaPeticion(req)
    const respuesta = await leerRespuesta(texto(req.query.id))
    if (!respuesta) return res.status(404).json({ error: 'Esa respuesta ya no existe.' })
    if (!admin && !esDe(respuesta, aprendiz)) {
      return res.status(403).json({ error: 'Solo el autor o el administrador pueden borrar esta respuesta.' })
    }
    await redis(['HDEL', HASH, respuesta.id])
    res.json({ ok: true })
  },

  async PATCH(req, res) {
    if (!(await exigirAdmin(req, res))) return
    const respuesta = await leerRespuesta(texto(req.query.id))
    if (!respuesta) return res.status(404).json({ error: 'Esa respuesta ya no existe.' })
    const nota = validarCalificacion(req.body?.calificacion, req.body?.retroalimentacion)
    if (nota.error) return res.status(400).json({ error: nota.error })

    const calificada = { ...respuesta, ...nota.valor, calificadoEn: new Date().toISOString() }
    await redis(['HSET', HASH, calificada.id, JSON.stringify(calificada)])
    res.json({ respuesta: paraMostrar(calificada, null, true) })
  }
})
