// Prueba el admin y las sesiones contra el Redis de mentiras en memoria.
// Los aprendices entran con documento y PIN (api/aprendices.js); el registro en sí se prueba en aprendicesApi.

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { crearRedisMemoria, URL_MEMORIA } from '../herramientas/redisMemoria.js'
import aprendices from '../api/aprendices.js'
import admin from '../api/admin.js'

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

test('un token de las cuentas viejas (usuario/contraseña) ya no sirve', async () => {
  const { crearSesion } = await import('../api/_lib/seguridad.js')
  const { token } = crearSesion('aprendiz', 'ana')
  assert.equal((await llamar(aprendices, { token })).cuerpo.aprendiz, null)
})

test('solo el admin ve la lista de aprendices, y sin la huella del PIN', async () => {
  const ana = await registrar('ana')
  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'mala' } })).estado, 401)
  const tokenAdmin = await tokenDelProfe()

  const lista = await llamar(aprendices, { query: { accion: 'lista' }, tokenAdmin })
  assert.deepEqual(lista.cuerpo.aprendices.map((c) => c.documento), [DOCUMENTOS.ana])
  assert.ok(!('huella' in lista.cuerpo.aprendices[0]), 'el panel nunca recibe la huella del PIN')

  assert.equal((await llamar(aprendices, { query: { accion: 'lista' }, token: ana })).estado, 401)
})

test('el admin borra una cuenta y la sesión vieja deja de servir', async () => {
  const ana = await registrar('ana')
  const tokenAdmin = await tokenDelProfe()

  assert.equal((await llamar(aprendices, { metodo: 'DELETE', tokenAdmin, query: { documento: DOCUMENTOS.ana } })).estado, 200)
  assert.equal((await llamar(aprendices, { token: ana })).cuerpo.aprendiz, null)
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
  assert.equal((await llamar(aprendices, { query: { accion: 'lista' }, tokenAdmin: enElSalon })).estado, 401)
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
