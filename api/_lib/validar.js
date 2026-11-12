// Reglas de los datos que llegan del navegador. Sin dependencias, para probarlas con node --test.
// Los mensajes van listos para mostrárselos al aprendiz tal cual.

export const LIMITES = {
  respuesta: { min: 10, max: 2000 },
  retroalimentacion: { max: 1000 }
}

export const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

export function validarRespuesta(valor) {
  const respuesta = texto(valor)
  const { min, max } = LIMITES.respuesta
  if (respuesta.length < min) return { error: `Tu respuesta está muy corta: escribe al menos ${min} caracteres.` }
  if (respuesta.length > max) return { error: `Tu respuesta pasa de ${max} caracteres. Resúmela un poquito.` }
  return { valor: respuesta }
}

export function validarCalificacion(nota, retro) {
  // ojo: Number(null) y Number('') dan 0, y un cero regalado por un campo vacío no es justo
  const numero = typeof nota === 'number' || (typeof nota === 'string' && nota.trim() !== '') ? Number(nota) : NaN
  if (!Number.isInteger(numero) || numero < 0 || numero > 100) {
    return { error: 'La calificación debe ser un número entero entre 0 y 100.' }
  }
  const retroalimentacion = texto(retro)
  if (retroalimentacion.length > LIMITES.retroalimentacion.max) {
    return { error: `La retroalimentación puede tener máximo ${LIMITES.retroalimentacion.max} caracteres.` }
  }
  return { valor: { calificacion: numero, retroalimentacion } }
}
