// Prueba los endpoints completos contra un Redis de mentiras en memoria:
// interceptamos fetch y respondemos como lo haría la API REST de Upstash.

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import cuenta from '../api/cuenta.js'
import admin from '../api/admin.js'
import foro from '../api/foro.js'

let datos

function ejecutar([comando, ...args]) {
  const [llave] = args
  switch (comando.toUpperCase()) {
    case 'GET': return datos.get(llave) ?? null
    case 'SET': {
      if (args.includes('NX') && datos.has(llave)) return null
      datos.set(llave, args[1])
      return 'OK'
    }
    case 'DEL': return datos.delete(llave) ? 1 : 0
    case 'INCR': {
      const nuevo = Number(datos.get(llave) || 0) + 1
      datos.set(llave, String(nuevo))
      return nuevo
    }
    case 'EXPIRE': return 1
    case 'SADD': (datos.get(llave) || datos.set(llave, new Set()).get(llave)).add(args[1]); return 1
    case 'SREM': return datos.get(llave)?.delete(args[1]) ? 1 : 0
    case 'SMEMBERS': return [...(datos.get(llave) || [])]
    case 'MGET': return args.map((l) => datos.get(l) ?? null)
    case 'HGET': return datos.get(llave)?.get(args[1]) ?? null
    case 'HSET': (datos.get(llave) || datos.set(llave, new Map()).get(llave)).set(args[1], args[2]); return 1
    case 'HSETNX': {
      const hash = datos.get(llave) || datos.set(llave, new Map()).get(llave)
      if (hash.has(args[1])) return 0
      hash.set(args[1], args[2])
      return 1
    }
    case 'HDEL': return datos.get(llave)?.delete(args[1]) ? 1 : 0
    case 'HGETALL': return [...(datos.get(llave) || new Map())].flat()
    default: throw new Error(`Comando no simulado: ${comando}`)
  }
}

globalThis.fetch = async (url, { body }) => {
  const cuerpo = JSON.parse(body)
  const resultado = String(url).endsWith('/pipeline')
    ? cuerpo.map((c) => ({ result: ejecutar(c) }))
    : { result: ejecutar(cuerpo) }
  return { ok: true, json: async () => resultado }
}

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

const registrar = (usuario, extra = {}) => llamar(cuenta, {
  metodo: 'POST',
  query: { accion: 'registro' },
  cuerpo: { usuario, nombre: `Aprendiz ${usuario}`, clave: 'clave-segura' },
  ...extra
})

beforeEach(() => {
  datos = new Map()
  process.env.KV_REST_API_URL = 'https://redis.de.mentiras'
  process.env.KV_REST_API_TOKEN = 'token'
  process.env.SESION_SECRETO = 's'.repeat(40)
  process.env.ADMIN_KEY = 'clave-del-profe'
})

test('registro, ingreso y "quién soy"', async () => {
  const creado = await registrar('ana')
  assert.equal(creado.estado, 201)
  assert.equal(creado.cuerpo.usuario, 'ana')
  // la contraseña nunca se guarda en texto plano
  assert.ok(!datos.get('usuario:ana').includes('clave-segura'))

  assert.equal((await registrar('ANA')).estado, 409, 'el usuario no distingue mayúsculas')

  const malo = await llamar(cuenta, { metodo: 'POST', query: { accion: 'ingresar' }, cuerpo: { usuario: 'ana', clave: 'otra' } })
  assert.equal(malo.estado, 401)

  const bueno = await llamar(cuenta, { metodo: 'POST', query: { accion: 'ingresar' }, cuerpo: { usuario: 'ana', clave: 'clave-segura' } })
  assert.equal(bueno.estado, 200)

  const yo = await llamar(cuenta, { token: bueno.cuerpo.token })
  assert.deepEqual(yo.cuerpo, { usuario: 'ana', nombre: 'Aprendiz ana' })
})

test('después de 8 claves malas se bloquea el ingreso', async () => {
  await registrar('beto')
  const intento = (clave) => llamar(cuenta, { metodo: 'POST', query: { accion: 'ingresar' }, cuerpo: { usuario: 'beto', clave } })
  for (let i = 0; i < 8; i++) assert.equal((await intento('mala')).estado, 401)
  // ni con la buena entra mientras dure el bloqueo
  assert.equal((await intento('clave-segura')).estado, 429)
})

test('publicar, una sola vez por pregunta, y solo con sesión', async () => {
  const { cuerpo: { token } } = await registrar('caro')

  const sinSesion = await llamar(foro, { metodo: 'POST', cuerpo: { pregunta: 'f1-p1', texto: 'Una respuesta de prueba' } })
  assert.equal(sinSesion.estado, 401)

  const publicada = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f1-p1', texto: 'Una respuesta de prueba' } })
  assert.equal(publicada.estado, 201)
  assert.equal(publicada.cuerpo.respuesta.nombre, 'Aprendiz caro')

  const repetida = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f1-p1', texto: 'Otra respuesta más' } })
  assert.equal(repetida.estado, 409)

  const inventada = await llamar(foro, { metodo: 'POST', token, cuerpo: { pregunta: 'f9-p9', texto: 'Pregunta que no existe' } })
  assert.equal(inventada.estado, 400)

  const lista = await llamar(foro, { query: { fase: '1' } })
  assert.equal(lista.cuerpo.respuestas.length, 1)
})

test('borrar: el autor sí, otro aprendiz no, el admin sí', async () => {
  const ana = (await registrar('ana')).cuerpo.token
  const beto = (await registrar('beto', { ip: '2.2.2.2' })).cuerpo.token
  const { cuerpo: { respuesta } } = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p2', texto: 'Respuesta de Ana' } })

  assert.equal((await llamar(foro, { metodo: 'DELETE', token: beto, query: { id: respuesta.id } })).estado, 403)

  const { cuerpo: { token: tokenAdmin } } = await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' } })
  assert.equal((await llamar(foro, { metodo: 'DELETE', tokenAdmin, query: { id: respuesta.id } })).estado, 200)
  assert.equal((await llamar(foro, { query: { fase: '1' } })).cuerpo.respuestas.length, 0)
})

test('solo el admin califica, y el panel ve la nota', async () => {
  const ana = (await registrar('ana')).cuerpo.token
  const { cuerpo: { respuesta } } = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p3', texto: 'Usé celdas en blanco' } })

  const comoAprendiz = await llamar(foro, { metodo: 'PATCH', token: ana, query: { id: respuesta.id }, cuerpo: { calificacion: 100 } })
  assert.equal(comoAprendiz.estado, 401)

  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'mala' } })).estado, 401)
  const { cuerpo: { token: tokenAdmin } } = await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' } })

  const calificada = await llamar(foro, {
    metodo: 'PATCH', tokenAdmin, query: { id: respuesta.id }, cuerpo: { calificacion: 88, retroalimentacion: 'Muy bien' }
  })
  assert.equal(calificada.cuerpo.respuesta.calificacion, 88)

  const resumen = await llamar(admin, { query: { accion: 'resumen' }, tokenAdmin })
  assert.deepEqual(resumen.cuerpo.cuentas.map((c) => c.usuario), ['ana'])
  assert.ok(!('hash' in resumen.cuerpo.cuentas[0]), 'el panel nunca recibe las contraseñas cifradas')
  assert.equal(resumen.cuerpo.respuestas[0].calificacion, 88)

  assert.equal((await llamar(admin, { query: { accion: 'resumen' }, token: ana })).estado, 401)
})

test('el admin borra una cuenta y la sesión vieja deja de servir', async () => {
  const ana = (await registrar('ana')).cuerpo.token
  const { cuerpo: { token: tokenAdmin } } = await llamar(admin, { metodo: 'POST', cuerpo: { clave: 'clave-del-profe' } })

  assert.equal((await llamar(admin, { metodo: 'DELETE', tokenAdmin, query: { usuario: 'ana' } })).estado, 200)
  assert.deepEqual((await llamar(cuenta, { token: ana })).cuerpo, { usuario: null })
  const publicar = await llamar(foro, { metodo: 'POST', token: ana, cuerpo: { pregunta: 'f1-p1', texto: 'Ya no debería poder' } })
  assert.equal(publicar.estado, 401)
  // y se puede volver a registrar con el mismo usuario
  assert.equal((await registrar('ana', { ip: '3.3.3.3' })).estado, 201)
})

test('sin ADMIN_KEY no hay forma de entrar como admin', async () => {
  delete process.env.ADMIN_KEY
  assert.equal((await llamar(admin, { metodo: 'POST', cuerpo: { clave: '' } })).estado, 503)
  assert.equal((await llamar(admin, { query: { accion: 'sesion' } })).cuerpo.configurado, false)
})

test('sin base de datos conectada, el foro avisa en vez de reventar', async () => {
  delete process.env.KV_REST_API_URL
  const res = await llamar(foro, { query: { fase: '1' } })
  assert.equal(res.estado, 503)
  assert.match(res.cuerpo.error, /base de datos/)
})
