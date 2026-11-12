import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generarCsv } from '../src/utils/panel.js'

test('el CSV va con BOM, punto y coma, y desactiva fórmulas peligrosas', () => {
  const csv = generarCsv(
    [{ nombre: '=HYPERLINK("http://malo")', nota: 90 }, { nombre: 'Pérez; Ana', nota: null }],
    [{ titulo: 'Aprendiz', valor: (f) => f.nombre }, { titulo: 'Nota', valor: (f) => f.nota }]
  )
  assert.ok(csv.startsWith('﻿Aprendiz;Nota\r\n'))
  assert.ok(csv.includes(`"'=HYPERLINK(""http://malo"")";90`))
  assert.ok(csv.includes('"Pérez; Ana";\r\n'))
})
