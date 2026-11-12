// Qué PIN no se aceptan al registrarse. Lo usan el formulario (para avisar de una) y el servidor (que es el que manda).
// Con 4 números hay 10.000 PIN, pero la gente escoge siempre los mismos 20: esos son los que prueba un vivo primero.

const FACILITOS = new Set(['1212', '1122', '1313', '2121', '2323', '4545', '6969', '1004', '2580', '0852', '1478', '3698', '7777', '1357', '2468'])

export function pinTrivial(pin) {
  if (!/^\d{4}$/.test(pin)) return false
  if (/^(\d)\1{3}$/.test(pin)) return true // 0000, 1111…
  if ('0123456789'.includes(pin) || '9876543210'.includes(pin)) return true // 1234, 6789, 4321…
  if (/^(\d\d)\1$/.test(pin)) return true // 1010, 4747…
  const numero = Number(pin)
  if (numero >= 1950 && numero <= 2030) return true // parece un año de nacimiento
  return FACILITOS.has(pin)
}

export const MENSAJE_PIN_TRIVIAL = 'Ese PIN es muy fácil de adivinar (números seguidos, repetidos o un año). Inventa otro.'
