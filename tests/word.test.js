import { test } from 'node:test'
import assert from 'node:assert/strict'
import { secciones, temasWord } from '../src/datos/word.js'

test('los ids de los temas de Word no se repiten', () => {
  const ids = temasWord.map((tema) => tema.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('cada tema trae lo que el componente pinta sí o sí', () => {
  for (const tema of temasWord) {
    for (const campo of ['icono', 'titulo', 'resumen', 'queEs']) {
      assert.ok(tema[campo], `${tema.id} no tiene ${campo}`)
    }
    assert.ok(tema.paraQue?.length, `${tema.id} no tiene paraQue`)
    assert.ok(tema.errores?.length, `${tema.id} no tiene errores`)
  }
})

test('todo tema cae en una sección que existe y ninguna sección queda vacía', () => {
  const ids = secciones.map((seccion) => seccion.id)
  for (const tema of temasWord) assert.ok(ids.includes(tema.seccion), `${tema.id} tiene sección ${tema.seccion}`)
  for (const id of ids) assert.ok(temasWord.some((tema) => tema.seccion === id), `la sección ${id} está vacía`)
})

test('los ejemplos y la tabla de comparación están completos', () => {
  for (const tema of temasWord) {
    for (const ejemplo of tema.ejemplos || []) assert.ok(ejemplo.titulo && ejemplo.bien, `ejemplo cojo en ${tema.id}`)
    if (tema.tabla) {
      for (const fila of tema.tabla.filas) assert.equal(fila.length, tema.tabla.columnas.length, `fila cojita en ${tema.id}: ${fila[0]}`)
    }
  }
})
