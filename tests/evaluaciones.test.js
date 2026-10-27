import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fases, criterios } from '../src/datos/guia.js'

const leerJson = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf-8'))
const evaluaciones = leerJson('../src/datos/evaluaciones.json')
const archivos = leerJson('../src/datos/archivos.json')

test('cada fase cierra con su evaluación', () => {
  for (const fase of fases) assert.ok(evaluaciones[fase.id], `la fase ${fase.id} no tiene evaluación`)
})

test('cada evaluación trae el problema completo y sus puntos suman 100', () => {
  for (const [fase, ev] of Object.entries(evaluaciones)) {
    for (const campo of ['codigo', 'archivo', 'titulo', 'situacion', 'mision', 'reglaTecnica', 'entrega']) {
      assert.ok(ev[campo], `a la evaluación de la fase ${fase} le falta ${campo}`)
    }
    for (const r of ev.requerimientos) {
      assert.ok(r.titulo && r.detalle && r.herramientas.length, `requerimiento cojo en la fase ${fase}: ${r.titulo}`)
    }
    assert.equal(ev.requerimientos.reduce((suma, r) => suma + r.puntos, 0), 100, `la fase ${fase} no suma 100`)
  }
})

// si alguien cambia el JSON y no corre el generador, aquí se entera
test('el archivo de cada evaluación está generado y se puede descargar', () => {
  for (const ev of Object.values(evaluaciones)) {
    const indice = archivos[ev.codigo]
    assert.ok(indice, `${ev.codigo} no está en archivos.json: corre python3 scripts/generar_datos.py`)
    assert.equal(indice.xlsx, `${ev.archivo}.xlsx`)
    assert.ok(existsSync(new URL(`../public/datos/${indice.xlsx}`, import.meta.url)), `falta ${indice.xlsx}`)
    assert.equal(indice.csv[0].hoja, 'Enunciado_Caso', `${ev.codigo} debe arrancar con el enunciado`)
  }
})

test('los criterios suman 100 y sus links llevan a una evaluación que existe', () => {
  assert.equal(criterios.reduce((suma, c) => suma + c.ponderacion, 0), 100)
  for (const { enlace } of criterios.filter((c) => c.enlace)) {
    const fase = enlace.match(/^#fase-(\d+)-evaluacion$/)?.[1]
    assert.ok(fase && evaluaciones[fase], `link roto: ${enlace}`)
  }
})
