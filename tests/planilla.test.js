// La planilla del formato SENA: que cada firma caiga en su casilla y nada más

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { htmlPlanilla } from '../src/utils/planillaAsistencia.js'
import { hojasDeAsistencia } from '../src/utils/ficha.js'

const FIRMA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
const [hoja1, hoja2] = hojasDeAsistencia()

const datos = (extra = {}) => ({
  encabezado: { ficha: '3312002', programa: 'Coordinación en Sistemas Integrados de Gestión', codigoCentro: '9227' },
  aprendices: [
    { nombre: 'Andrés Epinayú', documento: '3030303030', tipoDocumento: 'TI' },
    { nombre: 'Laura Gómez', documento: '1020304050', tipoDocumento: 'CC' },
  ],
  asistencia: { '2026-10-22': ['1020304050', '3030303030'], '2026-10-23': ['1020304050'] },
  firmas: { 1020304050: FIRMA },
  ...extra,
})

// Las casillas de firma de la fila de un aprendiz, en orden de lunes a viernes (dos semanas)
function casillas(html, documento) {
  const fila = html.split('<tr class="fila">').find((f) => f.includes(`>${documento}<`))
  return [...fila.matchAll(/<td class="firma">(.*?)<\/td>/g)].map((m) => m[1] !== '')
}

test('la firma sale solo los días que el profe marcó', () => {
  const html = htmlPlanilla([hoja1], datos(), '/logo-sena.png')
  // jueves 22 y viernes 23 son las casillas 4 y 5 de la primera semana
  assert.deepEqual(casillas(html, '1020304050'), [false, false, false, true, true, false, false, false, false, false])
})

test('si vino pero no ha firmado, la casilla queda vacía para firmar a mano', () => {
  const html = htmlPlanilla([hoja1], datos(), '/logo-sena.png')
  assert.ok(casillas(html, '3030303030').every((c) => !c))
})

test('lleva los datos del formato: encabezado, fechas, nombres en mayúscula y 20 filas', () => {
  const html = htmlPlanilla([hoja1], datos(), '/logo-sena.png')
  assert.match(html, /Formato Asistencia a la Formacion Profesional Integral/)
  assert.match(html, /CENTRO AGROEMPRESARIAL Y ACUICOLA/)
  assert.match(html, /COORDINACIÓN EN SISTEMAS INTEGRADOS DE GESTIÓN/)
  assert.match(html, /Del: 19\/10\/2026/)
  assert.match(html, /Hasta: 30\/10\/2026/)
  assert.match(html, /LAURA GÓMEZ/)
  assert.equal(html.split('<tr class="fila">').length - 1, 20)
})

test('más de 20 aprendices pasan a otra página, y toda la ficha son 2 hojas', () => {
  const muchos = Array.from({ length: 23 }, (_, i) => ({ nombre: `Aprendiz ${i}`, documento: String(10000000 + i), tipoDocumento: 'CC' }))
  assert.equal((htmlPlanilla([hoja1], datos({ aprendices: muchos }), '/l.png').match(/class="pagina"/g) || []).length, 2)
  assert.equal((htmlPlanilla([hoja1, hoja2], datos(), '/l.png').match(/class="pagina"/g) || []).length, 2)
})

test('un nombre con código no se mete en la planilla, ni una firma que no sea PNG', () => {
  const html = htmlPlanilla(
    [hoja1],
    datos({
      aprendices: [{ nombre: '<img src=x onerror=alert(1)>', documento: '1020304050', tipoDocumento: 'CC' }],
      firmas: { 1020304050: 'javascript:alert(1)' },
    }),
    '/l.png',
  )
  assert.ok(!html.includes('<IMG SRC=X'))
  assert.ok(!html.includes('javascript:'))
  assert.match(html, /&lt;IMG SRC=X/)
})

test('la planilla lleva su CSP: ahí adentro no corre ningún script', () => {
  const html = htmlPlanilla([hoja1], datos(), '/l.png')
  assert.match(html, /<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: 'self'; style-src 'unsafe-inline'">/)
})
