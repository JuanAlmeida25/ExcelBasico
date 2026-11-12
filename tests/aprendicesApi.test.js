// Prueba /api/aprendices contra el Redis de mentiras, con un reloj que se puede adelantar

import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { crearRedisMemoria, URL_MEMORIA } from '../herramientas/redisMemoria.js'
import aprendices from '../api/aprendices.js'
import admin from '../api/admin.js'
import { aprendizDeLaPeticion } from '../api/_lib/aprendices.js'

let redisFalso
let ahora
const fetchOriginal = globalThis.fetch

async function llamar(manejador, { metodo = 'GET', query = {}, cuerpo, tokenAdmin, tokenAprendiz, ip = '1.1.1.1' } = {}) {
  const headers = { 'x-forwarded-for': ip }
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
const registrar = (datos = {}) =>
  llamar(aprendices, { metodo: 'POST', query: { accion: 'registrar' }, cuerpo: { nombre: 'Laura Gómez', documento: '1020304050', ficha: '3312002', tipoDocumento: 'CC', pin: '4821', ...datos } })
const entrar = (pin, documento = '1020304050') =>
  llamar(aprendices, { metodo: 'POST', query: { accion: 'entrar' }, cuerpo: { documento, pin } })

beforeEach(() => {
  ahora = Date.now()
  redisFalso = crearRedisMemoria({ reloj: () => ahora })
  globalThis.fetch = redisFalso.envolverFetch(fetchOriginal)
  process.env.KV_REST_API_URL = URL_MEMORIA
  process.env.KV_REST_API_TOKEN = 'token'
  process.env.SESION_SECRETO = 'x'.repeat(40)
  process.env.ADMIN_KEY = 'clave-del-profe'
})

test('se registra y queda con la sesión abierta', async () => {
  const res = await registrar()
  assert.equal(res.estado, 200)
  assert.deepEqual(res.cuerpo.aprendiz, { nombre: 'Laura Gómez', documento: '1020304050', tipoDocumento: 'CC', ficha: '3312002', fecha: res.cuerpo.aprendiz.fecha, aprobado: false, tieneFirma: false })
  const yo = await llamar(aprendices, { tokenAprendiz: res.cuerpo.token })
  assert.equal(yo.cuerpo.aprendiz.nombre, 'Laura Gómez')
})

test('el PIN no queda legible en Redis', async () => {
  await registrar()
  const guardado = redisFalso.datos.get('tic:aprendices:aprendiz:1020304050')
  assert.ok(!guardado.includes('4821'))
  assert.ok(JSON.parse(guardado).huella)
})

test('valida nombre, documento y PIN de 4 números', async () => {
  assert.equal((await registrar({ nombre: 'Laura' })).estado, 400)
  assert.equal((await registrar({ documento: '123' })).estado, 400)
  assert.equal((await registrar({ pin: '12' })).estado, 400)
  assert.equal((await registrar({ pin: '12a4' })).estado, 400)
  assert.equal((await registrar({ pin: '123456' })).estado, 400)
})

test('un documento se registra una sola vez y no se le puede cambiar el PIN a otro', async () => {
  await registrar()
  const res = await registrar({ nombre: 'Otro Vivo', pin: '5093' })
  assert.equal(res.estado, 409)
  assert.equal((await entrar('5093')).estado, 401)
  assert.equal((await entrar('4821')).estado, 200)
})

test('entra con documento y PIN; la respuesta no trae la huella', async () => {
  await registrar()
  const res = await entrar('4821')
  assert.equal(res.estado, 200)
  assert.ok(res.cuerpo.token)
  assert.equal(res.cuerpo.aprendiz.huella, undefined)
  assert.equal(res.cuerpo.aprendiz.sal, undefined)
})

test('avisa cuántos intentos quedan y al tercer fallo bloquea 15 minutos', async () => {
  await registrar()
  const primero = await entrar('0000')
  assert.equal(primero.estado, 401)
  assert.equal(primero.cuerpo.intentosRestantes, 2)
  assert.equal((await entrar('1111')).cuerpo.intentosRestantes, 1)

  const tercero = await entrar('2222')
  assert.equal(tercero.estado, 429)
  assert.equal(tercero.cuerpo.bloqueado, true)
  assert.match(tercero.cuerpo.error, /15 minutos/)

  // Bloqueado, ni con el PIN bueno entra
  assert.equal((await entrar('4821')).estado, 429)

  // A los 14 minutos sigue bloqueado; pasados los 15 se reinicia solo
  ahora += 14 * 60 * 1000
  assert.equal((await entrar('4821')).estado, 429)
  ahora += 61 * 1000
  assert.equal((await entrar('4821')).estado, 200)
})

test('el bloqueo cuenta desde el tercer fallo, no desde el primero', async () => {
  await registrar()
  await entrar('0000')
  ahora += 10 * 60 * 1000
  await entrar('1111')
  await entrar('2222')
  // 6 minutos después del primer fallo ya habrían pasado 15, pero desde el tercero solo van 6
  ahora += 6 * 60 * 1000
  assert.equal((await entrar('4821')).estado, 429)
})

test('acertar borra los fallos anteriores', async () => {
  await registrar()
  await entrar('0000')
  await entrar('1111')
  assert.equal((await entrar('4821')).estado, 200)
  assert.equal((await entrar('0000')).cuerpo.intentosRestantes, 2)
})

test('un documento que no existe da el mismo mensaje que un PIN malo', async () => {
  await registrar()
  const malo = await entrar('0000')
  const inexistente = await entrar('4821', '99999999')
  assert.equal(inexistente.estado, 401)
  assert.equal(inexistente.cuerpo.error, malo.cuerpo.error)
})

test('la lista y los cambios son solo del profe', async () => {
  await registrar()
  assert.equal((await llamar(aprendices, { query: { accion: 'lista' } })).estado, 401)
  assert.equal((await llamar(aprendices, { metodo: 'PUT', cuerpo: { documento: '1020304050', nombre: 'Hacker Malo' } })).estado, 401)
  assert.equal((await llamar(aprendices, { metodo: 'POST', query: { accion: 'reiniciar-pin' }, cuerpo: { documento: '1020304050' } })).estado, 401)
  assert.equal((await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050' } })).estado, 401)

  const { cuerpo } = await llamar(aprendices, { query: { accion: 'lista' }, tokenAdmin: await tokenDelProfe() })
  assert.equal(cuerpo.aprendices.length, 1)
  assert.equal(cuerpo.aprendices[0].huella, undefined)
  assert.equal(cuerpo.aprendices[0].bloqueado, false)
})

test('el profe ve quién está bloqueado', async () => {
  await registrar()
  for (const pin of ['0000', '1111', '2222']) await entrar(pin)
  const { cuerpo } = await llamar(aprendices, { query: { accion: 'lista' }, tokenAdmin: await tokenDelProfe() })
  assert.equal(cuerpo.aprendices[0].bloqueado, true)
})

test('el profe corrige el nombre y la ficha', async () => {
  await registrar()
  const profe = await tokenDelProfe()
  const res = await llamar(aprendices, { metodo: 'PUT', cuerpo: { documento: '1020304050', nombre: 'Laura Gómez Pushaina', ficha: '3000000' }, tokenAdmin: profe })
  assert.equal(res.estado, 200)
  assert.equal(res.cuerpo.aprendiz.nombre, 'Laura Gómez Pushaina')
  // El PIN no se toca al corregir datos
  assert.equal((await entrar('4821')).estado, 200)
})

test('reiniciar el PIN: el viejo deja de servir, se desbloquea y la sesión vieja muere', async () => {
  const { token } = (await registrar()).cuerpo
  for (const pin of ['0000', '1111', '2222']) await entrar(pin)

  const res = await llamar(aprendices, { metodo: 'POST', query: { accion: 'reiniciar-pin' }, cuerpo: { documento: '1020304050' }, tokenAdmin: await tokenDelProfe() })
  assert.match(res.cuerpo.pin, /^\d{4}$/)

  assert.equal((await llamar(aprendices, { tokenAprendiz: token })).cuerpo.aprendiz, null)
  if (res.cuerpo.pin !== '4821') assert.equal((await entrar('4821')).estado, 401)
  assert.equal((await entrar(res.cuerpo.pin)).estado, 200)
})

test('borrar el registro deja usar el documento otra vez', async () => {
  await registrar()
  const res = await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050' }, tokenAdmin: await tokenDelProfe() })
  assert.equal(res.estado, 200)
  assert.equal((await registrar({ pin: '7316' })).estado, 200)
})

test('las actividades futuras saben quién es el aprendiz por su sesión', async () => {
  const { token } = (await registrar()).cuerpo
  const req = { headers: { authorization: `Bearer ${token}` } }
  assert.equal((await aprendizDeLaPeticion(req)).documento, '1020304050')
  assert.equal(await aprendizDeLaPeticion({ headers: { authorization: 'Bearer aprendiz.e30.9999999999999.firma' } }), null)
  assert.equal(await aprendizDeLaPeticion({ headers: {} }), null)
})

test('no deja registrarse con PIN facilitos', async () => {
  for (const pin of ['0000', '1234', '9876', '1010', '2005', '1987', '6969']) {
    const res = await registrar({ pin })
    assert.equal(res.estado, 400, `debió rechazar ${pin}`)
    assert.match(res.cuerpo.error, /fácil de adivinar/)
  }
})

test('borrar y registrar otra vez: la sesión del de antes NO revive (sesión zombi)', async () => {
  const { token: delImpostor } = (await registrar({ nombre: 'Pedro Impostor' })).cuerpo
  await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050' }, tokenAdmin: await tokenDelProfe() })
  await registrar({ nombre: 'María Verdadera', pin: '7316' })
  assert.equal((await llamar(aprendices, { tokenAprendiz: delImpostor })).cuerpo.aprendiz, null)
})

test('arranca pendiente y solo el profe lo aprueba', async () => {
  const { token } = (await registrar()).cuerpo
  const aprobar = (aprobado, tokenAdmin) => llamar(aprendices, { metodo: 'POST', query: { accion: 'aprobar' }, cuerpo: { documento: '1020304050', aprobado }, tokenAdmin })
  assert.equal((await aprobar(true)).estado, 401)
  assert.equal((await aprobar(true, await tokenDelProfe())).cuerpo.aprendiz.aprobado, true)
  assert.equal((await llamar(aprendices, { tokenAprendiz: token })).cuerpo.aprendiz.aprobado, true)
  // corregir el nombre no le quita la aprobación
  await llamar(aprendices, { metodo: 'PUT', cuerpo: { documento: '1020304050', nombre: 'Laura Gómez Pushaina' }, tokenAdmin: await tokenDelProfe() })
  const yo = (await llamar(aprendices, { tokenAprendiz: token })).cuerpo.aprendiz
  assert.deepEqual([yo.nombre, yo.aprobado], ['Laura Gómez Pushaina', true])
})

test('el bloqueo es por documento + IP: fallar desde otro lado no saca al del salón', async () => {
  await registrar()
  const entrarDesde = (pin, ip) => llamar(aprendices, { metodo: 'POST', query: { accion: 'entrar' }, cuerpo: { documento: '1020304050', pin }, ip })
  for (const pin of ['0000', '1111', '2222']) await entrarDesde(pin, '6.6.6.6')
  assert.equal((await entrarDesde('4821', '6.6.6.6')).estado, 429)
  assert.equal((await entrarDesde('4821', '1.1.1.1')).estado, 200)
})

test('con fallos desde muchas IPs, a los 10 se bloquea el documento en todas partes', async () => {
  await registrar()
  const entrarDesde = (pin, ip) => llamar(aprendices, { metodo: 'POST', query: { accion: 'entrar' }, cuerpo: { documento: '1020304050', pin }, ip })
  for (let i = 0; i < 10; i++) await entrarDesde('0000', `9.9.9.${Math.floor(i / 2)}`)
  assert.equal((await entrarDesde('4821', '1.1.1.1')).estado, 429)
  // el profe reinicia el PIN y se quitan todos los bloqueos
  const { pin } = (await llamar(aprendices, { metodo: 'POST', query: { accion: 'reiniciar-pin' }, cuerpo: { documento: '1020304050' }, tokenAdmin: await tokenDelProfe() })).cuerpo
  assert.equal((await entrarDesde(pin, '9.9.9.0')).estado, 200)
})

test('por IP solo cuentan los fallos: un salón entero puede entrar bien', async () => {
  // 30 aprendices que entran 3 veces cada uno: 90 ingresos buenos desde la misma IP (antes el tope era 60)
  for (let i = 0; i < 30; i++) await registrar({ documento: String(50000000 + i), nombre: `Aprendiz Número ${i}` })
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    for (let i = 0; i < 30; i++) assert.equal((await entrar('4821', String(50000000 + i))).estado, 200, `el aprendiz ${i} debió entrar`)
  }
})

test('quien prueba un PIN contra muchas cédulas se frena a los 40 fallos por hora', async () => {
  for (let i = 0; i < 40; i++) await entrar('5093', String(70000000 + i))
  assert.equal((await entrar('5093', '79999999')).estado, 429)
})

test('el PIN nuevo que da el profe nunca es de los facilitos', async () => {
  const { pinTrivial } = await import('../src/utils/pin.js')
  await registrar()
  const profe = await tokenDelProfe()
  for (let i = 0; i < 30; i++) {
    const { pin } = (await llamar(aprendices, { metodo: 'POST', query: { accion: 'reiniciar-pin' }, cuerpo: { documento: '1020304050' }, tokenAdmin: profe })).cuerpo
    assert.equal(pinTrivial(pin), false, pin)
  }
})

test('reiniciar el PIN de una cuenta borrada no la revive', async () => {
  await registrar()
  const profe = await tokenDelProfe()
  await llamar(aprendices, { metodo: 'DELETE', query: { documento: '1020304050' }, tokenAdmin: profe })
  const res = await llamar(aprendices, { metodo: 'POST', query: { accion: 'reiniciar-pin' }, cuerpo: { documento: '1020304050' }, tokenAdmin: profe })
  assert.equal(res.estado, 404)
  assert.equal(redisFalso.datos.has('tic:aprendices:aprendiz:1020304050'), false)
})
