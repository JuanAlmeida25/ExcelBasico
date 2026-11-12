// Días de clase de la ficha, para la asistencia (navegador y servidor).
// Las fechas salen de la portada de la guía: si cambian allá, cambia aquí solito.
import { portada } from '../datos/guia.js'

// Fecha como texto 'AAAA-MM-DD' en hora local (toISOString la corre a UTC y en Colombia de noche cambia de día)
export function textoFecha(fecha) {
  const dos = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`
}

export function leerTextoFecha(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export const inicioFicha = leerTextoFecha(portada.fechas.inicio.iso)
export const finFicha = leerTextoFecha(portada.fechas.fin.iso)

const sumarDias = (fecha, dias) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias)

export const NOMBRES_DIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

// El formato de asistencia del SENA trae 2 semanas por hoja (lunes a viernes, dos veces).
// Cada hoja arranca el lunes de la semana en que empieza la ficha, y así hasta cubrir el último día
export function hojasDeAsistencia(inicio = inicioFicha, fin = finFicha) {
  const lunes = sumarDias(inicio, -((inicio.getDay() + 6) % 7))
  const hojas = []
  for (let desde = lunes; desde <= fin; desde = sumarDias(desde, 14)) {
    const dias = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11].map((n, i) => {
      const fecha = sumarDias(desde, n)
      return { fecha: textoFecha(fecha), nombre: NOMBRES_DIA[i % 5], dentroDeLaFicha: fecha >= inicio && fecha <= fin }
    })
    hojas.push({ desde: dias[0].fecha, hasta: dias[9].fecha, dias })
  }
  return hojas
}

// Solo se puede marcar asistencia de lunes a viernes y dentro de la ficha
export function esDiaDeClase(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
  const fecha = leerTextoFecha(texto)
  if (textoFecha(fecha) !== texto) return false
  const diaSemana = fecha.getDay()
  return diaSemana >= 1 && diaSemana <= 5 && fecha >= inicioFicha && fecha <= finFicha
}
