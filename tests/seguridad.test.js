import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  crearSesion, leerSesion, esClaveAdmin, adminConfigurado, huellaPrivada, DURACION_SESION
} from '../api/_lib/seguridad.js'

beforeEach(() => {
  process.env.SESION_SECRETO = 'x'.repeat(40)
  delete process.env.ADMIN_KEY
})

test('la huella privada no deja ver el documento y cambia con el secreto', () => {
  const huella = huellaPrivada('1020304050')
  assert.equal(huella, huellaPrivada('1020304050'))
  assert.ok(!huella.includes('1020304050'))
  assert.notEqual(huella, huellaPrivada('1020304051'))
  process.env.SESION_SECRETO = 'y'.repeat(40)
  assert.notEqual(huella, huellaPrivada('1020304050'))
})

test('la sesión firmada devuelve el usuario, aunque tenga puntos', () => {
  const { token } = crearSesion('aprendiz', 'juan.perez')
  assert.equal(leerSesion(token, 'aprendiz'), 'juan.perez')
})

test('una sesión de aprendiz no sirve como sesión de admin', () => {
  const { token } = crearSesion('aprendiz', 'admin')
  assert.equal(leerSesion(token, 'admin'), null)
})

test('la sesión vencida o manoseada no sirve', () => {
  const ahora = Date.now()
  const { token } = crearSesion('admin', 'admin', ahora)
  assert.equal(leerSesion(token, 'admin', ahora + DURACION_SESION.admin + 1), null)

  const partes = token.split('.')
  partes[1] = Buffer.from('otro').toString('base64url')
  assert.equal(leerSesion(partes.join('.'), 'admin', ahora), null)
  assert.equal(leerSesion('basura', 'admin'), null)
})

test('la sesión firmada con otro secreto no sirve', () => {
  const { token } = crearSesion('aprendiz', 'ana')
  process.env.SESION_SECRETO = 'y'.repeat(40)
  assert.equal(leerSesion(token, 'aprendiz'), null)
})

test('sin SESION_SECRETO no se crean sesiones', () => {
  delete process.env.SESION_SECRETO
  assert.throws(() => crearSesion('aprendiz', 'ana'), { status: 503 })
})

test('sin ADMIN_KEY el modo admin queda apagado (no hay clave por defecto)', () => {
  assert.equal(adminConfigurado(), false)
  assert.equal(esClaveAdmin(''), false)
  assert.equal(esClaveAdmin('2501'), false)
})

test('con ADMIN_KEY solo pasa esa clave', () => {
  process.env.ADMIN_KEY = 'clave-del-profe'
  assert.equal(adminConfigurado(), true)
  assert.equal(esClaveAdmin('clave-del-profe'), true)
  assert.equal(esClaveAdmin('clave-del-prof'), false)
})
