// Panel del Profe: el CSV que se descarga para abrir en Excel.
// Lógica pura (sin Vue ni navegador) para poder probarla con node --test.

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
