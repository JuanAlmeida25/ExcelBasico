import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validarRespuesta, validarCalificacion
} from '../api/_lib/validar.js'

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
