import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resumenPorAprendiz, generarCsv, estadoNota } from '../src/utils/panel.js'

const cuentas = [
  { documento: 'ana', nombre: 'Ana Pérez' },
  { documento: 'beto', nombre: 'Beto Díaz' },
  { documento: 'caro', nombre: 'Carolina Ruiz' }
]

test('desde 70 se aprueba', () => {
  assert.equal(estadoNota(70), 'aprobado')
  assert.equal(estadoNota(69), 'no-aprobado')
  assert.equal(estadoNota(null), 'sin-calificar')
})

test('resumen por aprendiz: promedio, pendientes y estados', () => {
  const respuestas = [
    { documento: 'ana', nombre: 'Ana Pérez', calificacion: 80 },
    { documento: 'ana', nombre: 'Ana Pérez', calificacion: 91 },
    { documento: 'beto', nombre: 'Beto Díaz', calificacion: 50 },
    { documento: 'beto', nombre: 'Beto Díaz', calificacion: null }
  ]
  const filas = resumenPorAprendiz(cuentas, respuestas, 5)
  const de = (u) => filas.find((f) => f.documento === u)

  assert.deepEqual([de('ana').respondidas, de('ana').nota, de('ana').estado], [2, 86, 'aprobado'])
  // a Beto le falta una por calificar: no se le pone estado final todavía
  assert.deepEqual([de('beto').nota, de('beto').pendientes, de('beto').estado], [50, 1, 'sin-calificar'])
  assert.deepEqual([de('caro').respondidas, de('caro').estado], [0, 'sin-respuestas'])
  assert.deepEqual(filas.map((f) => f.documento), ['ana', 'beto', 'caro'])
})

test('si borraron la cuenta, sus respuestas igual aparecen (también las de las cuentas viejas)', () => {
  const filas = resumenPorAprendiz([], [{ usuario: 'viejo', nombre: 'Usuario Viejo', calificacion: 75 }], 5)
  assert.equal(filas[0].documento, 'viejo')
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

test('las respuestas viejas ya limpiadas no se revuelven entre aprendices distintos', () => {
  const filas = resumenPorAprendiz([], [
    { id: 'f1-p1:viejo-AAA', nombre: 'Ana Vieja', calificacion: 90 },
    { id: 'f1-p2:viejo-AAA', nombre: 'Ana Vieja', calificacion: 70 },
    { id: 'f1-p1:viejo-BBB', nombre: 'Beto Viejo', calificacion: 50 }
  ], 5)
  assert.deepEqual(filas.map((f) => [f.nombre, f.respondidas]), [['Ana Vieja', 2], ['Beto Viejo', 1]])
})
