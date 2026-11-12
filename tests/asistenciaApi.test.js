// Prueba la firma del aprendiz y /api/asistencia contra el Redis de mentiras

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { crearRedisMemoria, URL_MEMORIA } from '../herramientas/redisMemoria.js'
import aprendices from '../api/aprendices.js'
import asistencia from '../api/asistencia.js'
import admin from '../api/admin.js'
import { hojasDeAsistencia, esDiaDeClase } from '../src/utils/ficha.js'

const fetchOriginal = globalThis.fetch
// Un PNG de 1×1 de verdad, para no cargar una firma completa en la prueba
const FIRMA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

async function llamar(manejador, { metodo = 'GET', query = {}, cuerpo, tokenAdmin, tokenAprendiz } = {}) {
  const headers = { 'x-forwarded-for': '1.1.1.1' }
  if (tokenAdmin) headers['x-admin-token'] = tokenAdmin
  if (tokenAprendiz) headers.authorization = `Bearer ${tokenAprendiz}`
  const res = {
    estado: 200,
    cuerpo: null,
    setHeader() {},
    status(c) { this.estado = c; return this },
    json(v) { this.cuerpo = v; return this },
  }
  await manejador({ method: metodo, query, body: cuerpo, headers }, res)
  return res
}

const tokenDelProfe = async () => (await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' } })).cuerpo.token
// Registra y, si no se dice otra cosa, el profe lo aprueba de una (como pasa en clase)
async function registrar(documento = '1020304050', nombre = 'Laura Gómez', { aprobar = true } = {}) {
  const { token } = (await llamar(aprendices, { metodo: 'POST', query: { accion: 'registrar' }, cuerpo: { nombre, documento, tipoDocumento: 'TI', ficha: '', pin: '4821' } })).cuerpo
  if (aprobar) await llamar(aprendices, { metodo: 'POST', query: { accion: 'aprobar' }, cuerpo: { documento, aprobado: true }, tokenAdmin: await tokenDelProfe() })
  return token
}
const perfil = (tokenAprendiz, cuerpo) => llamar(aprendices, { metodo: 'POST', query: { accion: 'perfil' }, cuerpo, tokenAprendiz })
const marcar = async (fecha, documentos, presente = true) =>
  llamar(asistencia, { metodo: 'PUT', cuerpo: { fecha, documentos, presente }, tokenAdmin: await tokenDelProfe() })

beforeEach(() => {
  globalThis.fetch = crearRedisMemoria().envolverFetch(fetchOriginal)
  process.env.KV_REST_API_URL = URL_MEMORIA
  process.env.KV_REST_API_TOKEN = 'token'
  process.env.SESION_SECRETO = 'x'.repeat(40)
  process.env.ADMIN_KEY = 'clave-del-profe'
})

test('las hojas del formato cubren la ficha de 2 en 2 semanas, de lunes a viernes', () => {
  const hojas = hojasDeAsistencia()
  // la ficha va del jueves 22 de octubre al jueves 26 de noviembre: 3 hojas
  assert.deepEqual(hojas.map((h) => [h.desde, h.hasta]), [['2026-10-19', '2026-10-30'], ['2026-11-02', '2026-11-13'], ['2026-11-16', '2026-11-27']])
  assert.equal(hojas[0].dias[0].nombre, 'Lunes')
  assert.equal(hojas[0].dias[3].dentroDeLaFicha, true) // jueves 22, arranca la ficha
  assert.equal(hojas[0].dias[2].dentroDeLaFicha, false) // miércoles 21, todavía no
  assert.equal(esDiaDeClase('2026-10-24'), false) // sábado
  assert.equal(esDiaDeClase('2026-11-26'), true) // último día
  assert.equal(esDiaDeClase('2026-11-27'), false) // ya terminó la ficha
  assert.equal(hojas[2].dias[8].dentroDeLaFicha, true) // jueves 26
  assert.equal(hojas[2].dias[9].dentroDeLaFicha, false) // viernes 27
  assert.equal(esDiaDeClase('2026-13-01'), false)
})

test('el aprendiz firma una sola vez', async () => {
  const token = await registrar()
  const res = await perfil(token, { firma: FIRMA })
  assert.equal(res.estado, 200)
  assert.equal(res.cuerpo.aprendiz.tieneFirma, true)
  assert.equal((await perfil(token, { firma: FIRMA })).estado, 409)
  assert.equal((await llamar(aprendices, { tokenAprendiz: token })).cuerpo.aprendiz.tieneFirma, true)
  // Al volver a entrar con el PIN ya sabe que firmó, y no se la vuelve a pedir
  const entrada = await llamar(aprendices, { metodo: 'POST', query: { accion: 'entrar' }, cuerpo: { documento: '1020304050', pin: '4821' } })
  assert.equal(entrada.cuerpo.aprendiz.tieneFirma, true)
})

test('un pendiente no firma, no se marca y no sale en la planilla', async () => {
  const token = await registrar('1020304050', 'Pedro Impostor', { aprobar: false })
  const firmar = await perfil(token, { firma: FIRMA })
  assert.equal(firmar.estado, 403)
  assert.match(firmar.cuerpo.error, /aprobar/)
  assert.equal((await marcar('2026-10-22', ['1020304050'])).estado, 400)
  const { cuerpo } = await llamar(asistencia, { query: { accion: 'planilla' }, tokenAdmin: await tokenDelProfe() })
  assert.deepEqual(cuerpo.aprendices, [])
})

test('la firma tiene que ser un PNG de verdad, no cualquier base64', async () => {
  const token = await registrar()
  assert.equal((await perfil(token, { firma: 'data:image/png;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+' })).estado, 400)
})

test('sin sesión no se firma, y solo se aceptan imágenes PNG', async () => {
  assert.equal((await perfil(undefined, { firma: FIRMA })).estado, 401)
  const token = await registrar()
  assert.equal((await perfil(token, { firma: 'data:text/html;base64,PHNjcmlwdD4=' })).estado, 400)
  assert.equal((await perfil(token, { firma: 'javascript:alert(1)' })).estado, 400)
  assert.equal((await perfil(token, { firma: 'data:image/png;base64,' + 'A'.repeat(200_000) })).estado, 400)
})

test('el aprendiz completa su tipo de documento', async () => {
  const token = await registrar()
  assert.equal((await perfil(token, { tipoDocumento: 'XX' })).estado, 400)
  assert.equal((await perfil(token, { tipoDocumento: 'CC' })).cuerpo.aprendiz.tipoDocumento, 'CC')
})

test('el profe le borra la firma para que la haga otra vez', async () => {
  const token = await registrar()
  await perfil(token, { firma: FIRMA })
  assert.equal((await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050', solo: 'firma' } })).estado, 401)
  await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050', solo: 'firma' }, tokenAdmin: await tokenDelProfe() })
  assert.equal((await perfil(token, { firma: FIRMA })).estado, 200)
  // Borrar solo la firma no borra al aprendiz
  const { cuerpo } = await llamar(aprendices, { query: { accion: 'lista' }, tokenAdmin: await tokenDelProfe() })
  assert.equal(cuerpo.aprendices.length, 1)
  assert.equal(cuerpo.aprendices[0].tieneFirma, true)
})

test('el encabezado arranca con la ficha y el programa de la guía', async () => {
  const { cuerpo } = await llamar(asistencia, { tokenAdmin: await tokenDelProfe() })
  assert.deepEqual(cuerpo.encabezado, { ficha: '3312002', programa: 'Coordinación en Sistemas Integrados de Gestión', codigoCentro: '' })
})

test('la asistencia es solo del profe', async () => {
  assert.equal((await llamar(asistencia)).estado, 401)
  assert.equal((await llamar(asistencia, { query: { accion: 'planilla' } })).estado, 401)
  assert.equal((await llamar(asistencia, { metodo: 'PUT', cuerpo: { fecha: '2026-10-22', documentos: ['1020304050'], presente: true } })).estado, 401)
})

test('marca y desmarca la asistencia de un día, de a uno o a todos', async () => {
  await registrar('1020304050', 'Laura Gómez')
  await registrar('55555555', 'Andrés Epinayú')
  assert.equal((await marcar('2026-10-22', ['1020304050', '55555555'])).cuerpo.presentes.length, 2)
  assert.deepEqual((await marcar('2026-10-22', ['55555555'], false)).cuerpo.presentes, ['1020304050'])
  await marcar('2026-10-23', ['55555555'])
  const { cuerpo } = await llamar(asistencia, { tokenAdmin: await tokenDelProfe() })
  assert.deepEqual(cuerpo.asistencia, { '2026-10-22': ['1020304050'], '2026-10-23': ['55555555'] })
})

test('no deja marcar fines de semana ni días fuera de la ficha', async () => {
  assert.equal((await marcar('2026-10-24', ['1020304050'])).estado, 400)
  assert.equal((await marcar('2026-10-21', ['1020304050'])).estado, 400)
  assert.equal((await marcar('2026-11-27', ['1020304050'])).estado, 400)
  assert.equal((await marcar('2026-10-22', [])).estado, 400)
})

test('la planilla trae aprendices en orden, su tipo de documento y solo las firmas que existen', async () => {
  const tokenLaura = await registrar('1020304050', 'Laura Gómez')
  await registrar('3030303030', 'Andrés Epinayú')
  await perfil(tokenLaura, { firma: FIRMA })
  await marcar('2026-10-22', ['1020304050', '3030303030'])
  const profe = await tokenDelProfe()
  await llamar(asistencia, { metodo: 'PUT', query: { accion: 'encabezado' }, cuerpo: { ficha: '3312002', programa: 'Coordinación en Sistemas Integrados de Gestión', codigoCentro: '9227' }, tokenAdmin: profe })

  const { cuerpo } = await llamar(asistencia, { query: { accion: 'planilla' }, tokenAdmin: profe })
  assert.deepEqual(cuerpo.aprendices.map((a) => a.nombre), ['Andrés Epinayú', 'Laura Gómez'])
  assert.equal(cuerpo.aprendices[0].tipoDocumento, 'TI')
  assert.deepEqual(Object.keys(cuerpo.firmas), ['1020304050'])
  assert.equal(cuerpo.encabezado.programa, 'Coordinación en Sistemas Integrados de Gestión')
  assert.equal(cuerpo.asistencia['2026-10-22'].length, 2)
})
