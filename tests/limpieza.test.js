// El script de limpieza de las cuentas viejas, contra el Redis de mentiras

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { crearRedisMemoria, URL_MEMORIA } from '../herramientas/redisMemoria.js'
import { limpiarCuentasViejas } from '../scripts/limpiar_cuentas_viejas.js'

let redisFalso
const fetchOriginal = globalThis.fetch

beforeEach(() => {
  redisFalso = crearRedisMemoria()
  globalThis.fetch = redisFalso.envolverFetch(fetchOriginal)
  process.env.KV_REST_API_URL = URL_MEMORIA
  process.env.KV_REST_API_TOKEN = 'token'
  process.env.SESION_SECRETO = 'x'.repeat(40)
  const { ejecutar } = redisFalso
  ejecutar(['SADD', 'usuarios', 'ana'])
  ejecutar(['SET', 'usuario:ana', JSON.stringify({ usuario: 'ana', nombre: 'Ana', hash: 'scrypt$aa$bb' })])
  ejecutar(['HSET', 'foro:respuestas', 'f1-p1:ana', JSON.stringify({ id: 'f1-p1:ana', pregunta: 'f1-p1', usuario: 'ana', nombre: 'Ana', texto: 'De antes', calificacion: 90 })])
  ejecutar(['HSET', 'foro:respuestas', 'f1-p1:xyz', JSON.stringify({ id: 'f1-p1:xyz', pregunta: 'f1-p1', documento: '1020304050', nombre: 'Laura', texto: 'Nueva' })])
})

test('sin --confirmar solo cuenta y no toca nada', async () => {
  assert.deepEqual(await limpiarCuentasViejas(), { cuentas: 1, respuestas: 1, hecho: false })
  assert.ok(redisFalso.datos.has('usuario:ana'))
})

test('con --confirmar borra las cuentas y le quita el usuario a las respuestas viejas, sin perder la nota', async () => {
  await limpiarCuentasViejas({ confirmar: true })
  assert.equal(redisFalso.datos.has('usuario:ana'), false)
  assert.equal(redisFalso.datos.has('usuarios'), false)
  const respuestas = [...redisFalso.datos.get('foro:respuestas').values()].map(JSON.parse)
  assert.equal(respuestas.length, 2)
  const vieja = respuestas.find((r) => r.nombre === 'Ana')
  assert.equal(vieja.usuario, undefined)
  assert.ok(!vieja.id.includes('ana'))
  assert.equal(vieja.calificacion, 90)
  // la nueva ni se toca
  assert.ok(respuestas.some((r) => r.id === 'f1-p1:xyz'))
})
