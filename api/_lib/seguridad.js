// Sesiones firmadas, clave de admin, huellas privadas y límites de intentos.
// Lo de aquí no toca la base de datos (salvo limitar), para poder probarlo con node --test.

import crypto from 'node:crypto'

// Compara sin que el tiempo de respuesta delate cuántos caracteres coinciden
export function igualesSeguro(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

/* ----- Clave de administrador ----- */

// Sin clave por defecto a propósito: si ADMIN_KEY no está en Vercel, el modo admin queda apagado.
// (Una clave quemada en el código la ve cualquiera que abra el repo.)
export function adminConfigurado() {
  return Boolean((process.env.ADMIN_KEY || '').trim())
}

export function esClaveAdmin(clave) {
  const real = (process.env.ADMIN_KEY || '').trim()
  return Boolean(real) && typeof clave === 'string' && clave !== '' && igualesSeguro(clave, real)
}

/* ----- Sesiones firmadas ----- */

export const DURACION_SESION = {
  aprendiz: 7 * 24 * 60 * 60 * 1000,
  admin: 8 * 60 * 60 * 1000
}

function secreto() {
  const valor = (process.env.SESION_SECRETO || '').trim()
  if (valor.length < 32) {
    const error = new Error('Falta configurar SESION_SECRETO en el servidor.')
    error.status = 503
    throw error
  }
  return valor
}

const firmar = (texto) => crypto.createHmac('sha256', secreto()).update(texto).digest('base64url')

// Una huella que no deja adivinar lo de adentro: sirve para mostrar ids sin regalar el documento de nadie.
// (Un sha256 pelado no sirve: los documentos son puros números y se sacan probando.)
export const huellaPrivada = (texto) => firmar(`huella:${texto}`).slice(0, 22)

// Token: tipo.sujeto.expira.firma. El sujeto va en base64url para que un usuario con puntos no lo descuadre.
export function crearSesion(tipo, sujeto, ahora = Date.now()) {
  const expira = ahora + DURACION_SESION[tipo]
  const datos = `${tipo}.${Buffer.from(sujeto).toString('base64url')}.${expira}`
  return { token: `${datos}.${firmar(datos)}`, expira }
}

// Devuelve el sujeto (usuario o 'admin') si el token es válido, del tipo pedido y no ha vencido
export function leerSesion(token, tipo, ahora = Date.now()) {
  if (typeof token !== 'string' || !token) return null
  const partes = token.split('.')
  if (partes.length !== 4 || partes[0] !== tipo) return null
  const expira = Number(partes[2])
  if (!Number.isFinite(expira) || expira < ahora) return null
  if (!igualesSeguro(partes[3], firmar(partes.slice(0, 3).join('.')))) return null
  return Buffer.from(partes[1], 'base64url').toString()
}

/* ----- De dónde viene la petición ----- */

export function ipDe(req) {
  // En Vercel estas cabeceras las pone la plataforma con la IP real
  const reenviada = req.headers['x-forwarded-for']
  if (typeof reenviada === 'string' && reenviada) return reenviada.split(',')[0].trim()
  return req.headers['x-real-ip'] || 'desconocida'
}

/* ----- Límite de intentos (contador con vencimiento en Redis) ----- */

export const MENSAJE_LIMITE = 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'

// Suma uno al contador y dice si ya se pasó del máximo dentro de la ventana
export async function contarIntento(redisVarios, llave, maximo, ventanaSegundos) {
  const [cuenta] = await redisVarios([
    ['INCR', `limite:${llave}`],
    ['EXPIRE', `limite:${llave}`, ventanaSegundos, 'NX']
  ])
  return cuenta > maximo
}

// Solo mira el contador, sin sumar (para revisar antes de validar una clave)
export async function yaSePaso(redis, llave, maximo) {
  return Number(await redis(['GET', `limite:${llave}`])) >= maximo
}
