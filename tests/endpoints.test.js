// Prueba el foro y el admin completos contra el Redis de mentiras en memoria.
// Los aprendices entran con documento y PIN (api/aprendices.js); el registro en sí se prueba en aprendicesApi.

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { crearRedisMemoria, URL_MEMORIA } from '../herramientas/redisMemoria.js'
import aprendices from '../api/aprendices.js'
import admin from '../api/admin.js'
import foro from '../api/foro.js'

const fetchOriginal = globalThis.fetch
let redisFalso

// Imita lo mínimo del req/res de Vercel
async function llamar(manejador, { metodo = 'GET', query = {}, cuerpo, token, tokenAdmin, ip = '1.1.1.1' } = {}) {
  const headers = { 'x-forwarded-for': ip }
  if (token) headers.authorization = `Bearer ${token}`
  if (tokenAdmin) headers['x-admin-token'] = tokenAdmin
  const res = {
    estado: 200,
    cuerpo: null,
    setHeader() {},
    status(codigo) { this.estado = codigo; return this },
    json(valor) { this.cuerpo = valor; return this }
  }
  await manejador({ method: metodo, query, body: cuerpo, headers }, res)
  return res
}

const DOCUMENTOS = { ana: '1010101010', beto: '2020202020', caro: '3030303030' }

async function registrar(quien) {
  const res = await llamar(aprendices, {
    metodo: 'POST',
    query: { accion: 'registrar' },
    cuerpo: { nombre: `Aprendiz ${quien}`, documento: DOCUMENTOS[quien], tipoDocumento: 'CC', ficha: '3312002', pin: '4821' }
  })
  return res.cuerpo.token
}

const tokenDelProfe = async () => (await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' } })).cuerpo.token

beforeEach(() => {
  redisFalso = crearRedisMemoria()
  globalThis.fetch = redisFalso.envolverFetch(fetchOriginal)
  process.env.KV_REST_API_URL = URL_MEMORIA
  process.env.KV_REST_API_TOKEN = 'token'
  process.env.SESION_SECRETO = 's'.repeat(40)
  process.env.ADMIN_KEY = 'clave-del-profe'
})

test('el foro no se lee sin sesión (la guía tiene puerta)', async () => {
  const res = await llamar(foro, { query: { fase: '1' } })
  assert.equal(res.estado, 401)
  assert.equal(res.cuerpo.sesionVencida, true)
})

test('publicar, una sola vez por pregunta, y solo con sesión', async () => {
  const token = await registrar('caro')

  const sinSesion = await llamar(foro, { metodo: 'POST', cuerpo: { pregunta: 'f1-p1', texto: 'Una respuesta de prueba' } })
  assert.equal(sinSesion.estado, 401)

  const publicada = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f1-p1', texto: 'Una respuesta de prueba' } })
  assert.equal(publicada.estado, 201)
  assert.equal(publicada.cuerpo.respuesta.nombre, 'Aprendiz caro')
  assert.equal(publicada.cuerpo.respuesta.esMia, true)

  const repetida = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f1-p1', texto: 'Otra respuesta más' } })
  assert.equal(repetida.estado, 409)

  const inventada = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f9-p9', texto: 'Pregunta que no existe' } })
  assert.equal(inventada.estado, 400)

  const lista = await llamar(foro, { query: { fase: '1' }, token })
  assert.equal(lista.cuerpo.respuestas.length, 1)
})

test('los compañeros no ven el documento de nadie, ni en el id; el admin sí', async () => {
  const ana = await registrar('ana')
  const beto = await registrar('beto')
  await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p1', texto: 'Respuesta de Ana' } })

  const vistaDeBeto = (await llamar(foro, { query: { fase: '1' }, token: beto })).cuerpo.respuestas[0]
  assert.ok(!JSON.stringify(vistaDeBeto).includes(DOCUMENTOS.ana))
  assert.equal(vistaDeBeto.esMia, false)

  const vistaDelProfe = (await llamar(foro, { query: { fase: '1' }, tokenAdmin: await tokenDelProfe() })).cuerpo.respuestas[0]
  assert.equal(vistaDelProfe.documento, DOCUMENTOS.ana)
})

test('borrar: el autor sí, otro aprendiz no, el admin sí', async () => {
  const ana = await registrar('ana')
  const beto = await registrar('beto')
  const { cuerpo: { respuesta } } = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p2', texto: 'Respuesta de Ana' } })

  assert.equal((await llamar(foro, { metodo: 'DELETE', token: beto, query: { id: respuesta.id } })).estado, 403)

  const tokenAdmin = await tokenDelProfe()
  assert.equal((await llamar(foro, { metodo: 'DELETE', tokenAdmin, query: { id: respuesta.id } })).estado, 200)
  assert.equal((await llamar(foro, { query: { fase: '1' }, token: ana })).cuerpo.respuestas.length, 0)

  // y el autor también puede borrar la suya
  const otra = (await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p2', texto: 'Respuesta de Ana otra vez' } })).cuerpo.respuesta
  assert.equal((await llamar(foro, { metodo: 'DELETE', token: ana, query: { id: otra.id } })).estado, 200)
})

test('las respuestas de las cuentas viejas siguen ahí, pero ya no son de nadie', async () => {
  const vieja = { id: 'f1-p1:ana', pregunta: 'f1-p1', usuario: 'ana', nombre: 'Ana Vieja', texto: 'De antes', creado: '2026-10-23T10:00:00Z', calificacion: 90 }
  await redisFalso.ejecutar(['HSET', 'foro:respuestas', vieja.id, JSON.stringify(vieja)])
  const ana = await registrar('ana')

  const [mostrada] = (await llamar(foro, { query: { fase: '1' }, token: ana })).cuerpo.respuestas
  assert.equal(mostrada.esMia, false)
  assert.equal(mostrada.usuario, undefined)
  assert.equal((await llamar(foro, { metodo: 'DELETE', token: ana, query: { id: vieja.id } })).estado, 403)
  // Ana sí puede responder esa pregunta con su cuenta nueva
  assert.equal((await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p1', texto: 'Ahora con documento' } })).estado, 201)
})

test('un token de las cuentas viejas (usuario/contraseña) ya no sirve', async () => {
  const { crearSesion } = await import('../api/_lib/seguridad.js')
  const { token } = crearSesion('aprendiz', 'ana')
  assert.equal((await llamar(foro, { query: { fase: '1' }, token })).estado, 401)
  assert.equal((await llamar(aprendices, { token })).cuerpo.aprendiz, null)
})

test('solo el admin califica, y el panel ve la nota', async () => {
  const ana = await registrar('ana')
  const { cuerpo: { respuesta } } = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p3', texto: 'Usé celdas en blanco' } })

  const comoAprendiz = await llamar(foro, { metodo: 'PATCH', token: ana, query: { id: respuesta.id }, cuerpo: { calificacion: 100 } })
  assert.equal(comoAprendiz.estado, 401)

  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'mala' } })).estado, 401)
  const tokenAdmin = await tokenDelProfe()

  const calificada = await llamar(foro, {
    metodo: 'PATCH', tokenAdmin, query: { id: respuesta.id }, cuerpo: { calificacion: 88, retroalimentacion: 'Muy bien' }
  })
  assert.equal(calificada.cuerpo.respuesta.calificacion, 88)

  const resumen = await llamar(admin, { query: { accion: 'resumen' }, tokenAdmin })
  assert.deepEqual(resumen.cuerpo.cuentas.map((c) => c.documento), [DOCUMENTOS.ana])
  assert.ok(!('huella' in resumen.cuerpo.cuentas[0]), 'el panel nunca recibe la huella del PIN')
  assert.equal(resumen.cuerpo.respuestas[0].calificacion, 88)

  assert.equal((await llamar(admin, { query: { accion: 'resumen' }, token: ana })).estado, 401)
})

test('el admin borra una cuenta y la sesión vieja deja de servir', async () => {
  const ana = await registrar('ana')
  const tokenAdmin = await tokenDelProfe()

  assert.equal((await llamar(aprendices, { metodo: 'DELETE', tokenAdmin, query: { documento: DOCUMENTOS.ana } })).estado, 200)
  assert.equal((await llamar(aprendices, { token: ana })).cuerpo.aprendiz, null)
  const publicar = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p1', texto: 'Ya no debería poder' } })
  assert.equal(publicar.estado, 401)
  // y se puede volver a registrar con el mismo documento
  assert.ok(await registrar('ana'))
})

test('sin ADMIN_KEY no hay forma de entrar como admin', async () => {
  delete process.env.ADMIN_KEY
  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: '' } })).estado, 503)
  assert.equal((await llamar(admin, { query: { accion: 'sesion' } })).cuerpo.configurado, false)
})

test('sin base de datos conectada, avisa en vez de reventar', async () => {
  delete process.env.KV_REST_API_URL
  const res = await llamar(aprendices, { metodo: 'POST', query: { accion: 'entrar' }, cuerpo: { documento: DOCUMENTOS.ana, pin: '4821' } })
  assert.equal(res.estado, 503)
  assert.match(res.cuerpo.error, /base de datos/)
})

test('"Salir de Admin" cierra todas las sesiones del admin, hasta las copiadas', async () => {
  const enElSalon = await tokenDelProfe()
  const enLaCasa = await tokenDelProfe()
  assert.equal((await llamar(admin, { query: { accion: 'sesion' }, tokenAdmin: enLaCasa })).cuerpo.admin, true)
  await llamar(admin, { metodo: 'POST', query: { accion: 'salir' }, tokenAdmin: enLaCasa })
  assert.equal((await llamar(admin, { query: { accion: 'sesion' }, tokenAdmin: enElSalon })).cuerpo.admin, false)
  assert.equal((await llamar(admin, { query: { accion: 'resumen' }, tokenAdmin: enElSalon })).estado, 401)
  // y una sesión nueva sí sirve
  assert.equal((await llamar(admin, { query: { accion: 'sesion' }, tokenAdmin: await tokenDelProfe() })).cuerpo.admin, true)
})

test('"salir" sin ser admin no le cierra la sesión a nadie', async () => {
  const profe = await tokenDelProfe()
  await llamar(admin, { metodo: 'POST', query: { accion: 'salir' } })
  assert.equal((await llamar(admin, { query: { accion: 'sesion' }, tokenAdmin: profe })).cuerpo.admin, true)
})

test('una ráfaga de claves al mismo tiempo no se salta el límite de 8', async () => {
  const intentos = await Promise.all(
    Array.from({ length: 30 }, () => llamar(admin, { metodo: 'POST', cuerpo: { clave: 'adivinando' }, ip: '7.7.7.7' }))
  )
  assert.ok(intentos.filter((r) => r.estado === 401).length <= 8)
  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' }, ip: '7.7.7.7' })).estado, 429)
})
