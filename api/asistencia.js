// Asistencia de la ficha (igual que en Razonar): el profe marca quién vino cada día y la planilla del SENA sale con las firmas.
// Todo es solo del admin; el aprendiz solo deja su firma una vez (POST /api/aprendices?accion=perfil).
// Solo cuentan los aprendices que el profe aprobó: uno pendiente puede ser alguien registrado con cédula ajena.
//   GET /api/asistencia                     → { encabezado, asistencia: { 'AAAA-MM-DD': [documentos] } }
//   GET /api/asistencia?accion=planilla     → lo mismo + aprendices y sus firmas, para imprimir el formato
//   PUT /api/asistencia                     { fecha, documentos: [...], presente } → marca o desmarca
//   PUT /api/asistencia?accion=encabezado   { ficha, programa, codigoCentro } → datos de arriba del formato

import { redis, redisVarios } from './_lib/redis.js'
import { endpoint, exigirAdmin } from './_lib/http.js'
import { LLAVE_INDICE_APRENDICES, llaveFirma, leerAprendices, datosPublicos } from './_lib/aprendices.js'
import { esDiaDeClase } from '../src/utils/ficha.js'
import { portada } from '../src/datos/guia.js'

const PREFIJO = 'tic:asistencia'
const LLAVE_FECHAS = `${PREFIJO}:fechas`
const LLAVE_ENCABEZADO = `${PREFIJO}:encabezado`
const llaveDia = (fecha) => `${PREFIJO}:dia:${fecha}`

const texto = (valor, largo) => (typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ').slice(0, largo) : '')
const soloDigitos = (valor) => (typeof valor === 'string' || typeof valor === 'number' ? String(valor).replace(/\D/g, '') : '')

async function leerAsistencia() {
  const fechas = (await redis(['SMEMBERS', LLAVE_FECHAS])).sort()
  const listas = fechas.length ? await redisVarios(fechas.map((f) => ['SMEMBERS', llaveDia(f)])) : []
  return Object.fromEntries(fechas.map((f, i) => [f, listas[i]]))
}

async function leerEncabezado() {
  const fila = await redis(['GET', LLAVE_ENCABEZADO])
  // Mientras el profe no lo cambie, sale con la ficha y el programa de la guía
  return fila ? JSON.parse(fila) : { ficha: portada.ficha, programa: portada.programa, codigoCentro: '' }
}

async function planilla(res) {
  const aprendices = (await leerAprendices(await redis(['SMEMBERS', LLAVE_INDICE_APRENDICES])))
    .filter((a) => a.aprobado)
    .map(datosPublicos)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const firmas = aprendices.length ? await redis(['MGET', ...aprendices.map((a) => llaveFirma(a.documento))]) : []
  res.json({
    encabezado: await leerEncabezado(),
    asistencia: await leerAsistencia(),
    aprendices,
    firmas: Object.fromEntries(aprendices.map((a, i) => [a.documento, firmas[i]]).filter(([, f]) => f)),
  })
}

export default endpoint({
  async GET(req, res) {
    if (!(await exigirAdmin(req, res))) return
    if (req.query?.accion === 'planilla') return planilla(res)
    res.json({ encabezado: await leerEncabezado(), asistencia: await leerAsistencia() })
  },

  async PUT(req, res) {
    if (!(await exigirAdmin(req, res))) return

    if (req.query?.accion === 'encabezado') {
      const encabezado = {
        ficha: soloDigitos(req.body?.ficha).slice(0, 12),
        programa: texto(req.body?.programa, 120),
        codigoCentro: soloDigitos(req.body?.codigoCentro).slice(0, 10),
      }
      await redis(['SET', LLAVE_ENCABEZADO, JSON.stringify(encabezado)])
      return res.json({ encabezado })
    }

    const { fecha, presente } = req.body || {}
    if (typeof fecha !== 'string' || !esDiaDeClase(fecha)) {
      return res.status(400).json({ error: 'Esa fecha no es un día de clase de la ficha (de lunes a viernes).' })
    }
    if (typeof presente !== 'boolean') return res.status(400).json({ error: 'Se esperaba presente: true o false.' })
    let documentos = Array.isArray(req.body?.documentos) ? [...new Set(req.body.documentos.map(soloDigitos).filter(Boolean))].slice(0, 200) : []
    if (!documentos.length) return res.status(400).json({ error: 'Falta a quién marcar.' })
    // Para marcar que vino, tiene que estar aprobado; desmarcar sí se deja con cualquiera
    if (presente) {
      const aprobados = new Set((await leerAprendices(documentos)).filter((a) => a.aprobado).map((a) => a.documento))
      documentos = documentos.filter((d) => aprobados.has(d))
      if (!documentos.length) return res.status(400).json({ error: 'Ese aprendiz todavía no está aprobado. Apruébalo en 👥 Aprendices.' })
    }

    await redisVarios(
      presente
        ? [['SADD', llaveDia(fecha), ...documentos], ['SADD', LLAVE_FECHAS, fecha]]
        : [['SREM', llaveDia(fecha), ...documentos]],
    )
    res.json({ fecha, presentes: await redis(['SMEMBERS', llaveDia(fecha)]) })
  },
})
