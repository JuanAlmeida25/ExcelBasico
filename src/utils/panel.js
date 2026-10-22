// Panel del Profe: arma la tabla por aprendiz y el CSV de notas.
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

import { NOTA_APROBATORIA } from '../datos/foro.js'

export const ESTADOS = [
  { id: 'sin-calificar', nombre: 'Sin calificar' },
  { id: 'aprobado', nombre: 'Aprobado' },
  { id: 'no-aprobado', nombre: 'No aprobado' },
  { id: 'sin-respuestas', nombre: 'Sin respuestas' }
]

export function estadoNota(calificacion) {
  if (calificacion === null || calificacion === undefined) return 'sin-calificar'
  return Number(calificacion) >= NOTA_APROBATORIA ? 'aprobado' : 'no-aprobado'
}

// Una fila por cuenta. La nota es el promedio de las respuestas calificadas, y el estado
// queda "sin calificar" mientras falte calificar alguna de las que respondió.
// Si alguien borró su cuenta pero tiene respuestas, igual aparece (marcado sin cuenta).
export function resumenPorAprendiz(cuentas, respuestas, totalPreguntas) {
  const filas = new Map()
  const filaDe = (usuario, nombre, conCuenta) => {
    if (!filas.has(usuario)) {
      filas.set(usuario, { usuario, nombre, conCuenta, respondidas: 0, totalPreguntas, notas: [], pendientes: 0 })
    }
    return filas.get(usuario)
  }

  for (const cuenta of cuentas || []) filaDe(cuenta.usuario, cuenta.nombre, true)

  for (const respuesta of respuestas || []) {
    const fila = filaDe(respuesta.usuario, respuesta.nombre, false)
    fila.respondidas++
    if (respuesta.calificacion === null || respuesta.calificacion === undefined) fila.pendientes++
    else fila.notas.push(Number(respuesta.calificacion))
  }

  return [...filas.values()]
    .map(({ notas, pendientes, ...fila }) => {
      const nota = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null
      let estado = 'sin-respuestas'
      if (fila.respondidas) estado = pendientes ? 'sin-calificar' : estadoNota(nota)
      return { ...fila, nota, pendientes, estado }
    })
    .sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'))
}

// Excel en español (Colombia) separa columnas con punto y coma
const SEPARADOR = ';'

// Comillas cuando hacen falta, y un apóstrofo delante de lo que Excel tomaría por fórmula
// (=, +, -, @): así un nombre como "=HYPERLINK(...)" no se ejecuta al abrir el archivo
function celda(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  if (/[";\n\r]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`
  return texto
}

// columnas: [{ titulo, valor: fila => ... }]. Empieza con BOM para que Excel lea bien las tildes.
export function generarCsv(filas, columnas) {
  const lineas = [
    columnas.map((c) => celda(c.titulo)).join(SEPARADOR),
    ...filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(SEPARADOR))
  ]
  return '﻿' + lineas.join('\r\n') + '\r\n'
}
