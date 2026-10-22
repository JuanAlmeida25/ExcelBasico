import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validarUsuario, validarNombre, validarClave, validarRespuesta, validarCalificacion
} from '../api/_lib/validar.js'

test('el usuario se pasa a minúscula y sin espacios alrededor', () => {
  assert.equal(validarUsuario('  Juan.Perez ').valor, 'juan.perez')
})

test('usuarios con tildes, espacios o muy cortos no pasan', () => {
  for (const malo of ['jo', 'josé', 'juan perez', 'a'.repeat(31), '', null, '<script>']) {
    assert.ok(validarUsuario(malo).error, `debió rechazar ${malo}`)
  }
})

test('el nombre se limpia de espacios dobles', () => {
  assert.equal(validarNombre('  Ana   María  Pérez ').valor, 'Ana María Pérez')
  assert.ok(validarNombre('Al').error)
})

test('la contraseña no se recorta y respeta el mínimo', () => {
  assert.equal(validarClave('  abc  ').valor, '  abc  ')
  assert.ok(validarClave('12345').error)
  assert.ok(validarClave(123456).error)
})

test('la respuesta del foro tiene mínimo y máximo', () => {
  assert.ok(validarRespuesta('corta').error)
  assert.ok(validarRespuesta('x'.repeat(2001)).error)
  assert.equal(validarRespuesta('  Una respuesta decente  ').valor, 'Una respuesta decente')
})

test('la nota es un entero de 0 a 100', () => {
  assert.deepEqual(validarCalificacion('85', ' Bien ').valor, { calificacion: 85, retroalimentacion: 'Bien' })
  for (const mala of [-1, 101, 7.5, 'abc', null, '', '   ', undefined]) {
    assert.ok(validarCalificacion(mala, '').error, `debió rechazar ${mala}`)
  }
})
