import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resumenPorAprendiz, generarCsv, estadoNota } from '../src/utils/panel.js'

const cuentas = [
  { usuario: 'ana', nombre: 'Ana Pérez' },
  { usuario: 'beto', nombre: 'Beto Díaz' },
  { usuario: 'caro', nombre: 'Carolina Ruiz' }
]

test('desde 70 se aprueba', () => {
  assert.equal(estadoNota(70), 'aprobado')
  assert.equal(estadoNota(69), 'no-aprobado')
  assert.equal(estadoNota(null), 'sin-calificar')
})

test('resumen por aprendiz: promedio, pendientes y estados', () => {
  const respuestas = [
    { usuario: 'ana', nombre: 'Ana Pérez', calificacion: 80 },
    { usuario: 'ana', nombre: 'Ana Pérez', calificacion: 91 },
    { usuario: 'beto', nombre: 'Beto Díaz', calificacion: 50 },
    { usuario: 'beto', nombre: 'Beto Díaz', calificacion: null }
  ]
  const filas = resumenPorAprendiz(cuentas, respuestas, 5)
  const de = (u) => filas.find((f) => f.usuario === u)

  assert.deepEqual([de('ana').respondidas, de('ana').nota, de('ana').estado], [2, 86, 'aprobado'])
  // a Beto le falta una por calificar: no se le pone estado final todavía
  assert.deepEqual([de('beto').nota, de('beto').pendientes, de('beto').estado], [50, 1, 'sin-calificar'])
  assert.deepEqual([de('caro').respondidas, de('caro').estado], [0, 'sin-respuestas'])
  assert.deepEqual(filas.map((f) => f.usuario), ['ana', 'beto', 'caro'])
})

test('si borraron la cuenta, sus respuestas igual aparecen', () => {
  const filas = resumenPorAprendiz([], [{ usuario: 'viejo', nombre: 'Usuario Viejo', calificacion: 75 }], 5)
  assert.equal(filas[0].conCuenta, false)
  assert.equal(filas[0].estado, 'aprobado')
})

test('el CSV va con BOM, punto y coma, y desactiva fórmulas peligrosas', () => {
  const csv = generarCsv(
    [{ nombre: '=HYPERLINK("http://malo")', nota: 90 }, { nombre: 'Pérez; Ana', nota: null }],
    [{ titulo: 'Aprendiz', valor: (f) => f.nombre }, { titulo: 'Nota', valor: (f) => f.nota }]
  )
  assert.ok(csv.startsWith('﻿Aprendiz;Nota\r\n'))
  assert.ok(csv.includes(`"'=HYPERLINK(""http://malo"")";90`))
  assert.ok(csv.includes('"Pérez; Ana";\r\n'))
})
