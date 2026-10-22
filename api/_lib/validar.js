// Reglas de los datos que llegan del navegador. Sin dependencias, para probarlas con node --test.
// Los mensajes van listos para mostrárselos al aprendiz tal cual.

export const LIMITES = {
  usuario: { min: 3, max: 30 },
  nombre: { min: 3, max: 80 },
  clave: { min: 6, max: 72 },
  respuesta: { min: 10, max: 2000 },
  retroalimentacion: { max: 1000 }
}

export const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

// Usuario en minúscula para que "Juan" y "juan" no sean dos cuentas distintas
export function validarUsuario(valor) {
  const usuario = texto(valor).toLowerCase()
  const { min, max } = LIMITES.usuario
  if (!new RegExp(`^[a-z0-9._-]{${min},${max}}$`).test(usuario)) {
    return { error: `El usuario debe tener entre ${min} y ${max} caracteres: letras sin tildes, números, punto, guion o guion bajo.` }
  }
  return { valor: usuario }
}

export function validarNombre(valor) {
  const nombre = texto(valor).replace(/\s+/g, ' ')
  const { min, max } = LIMITES.nombre
  if (nombre.length < min || nombre.length > max) {
    return { error: `Escribe tu nombre completo (entre ${min} y ${max} caracteres).` }
  }
  return { valor: nombre }
}

// La contraseña no se recorta: si alguien la quiso con espacios, es su contraseña
export function validarClave(valor) {
  const { min, max } = LIMITES.clave
  if (typeof valor !== 'string' || valor.length < min || valor.length > max) {
    return { error: `La contraseña debe tener entre ${min} y ${max} caracteres.` }
  }
  return { valor }
}

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
