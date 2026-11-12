import { ref, readonly } from 'vue'
import { api, sesionGuardada, sesionAdminGuardada, guardarSesion, guardarSesionAdmin } from '../servicios/api.js'

// Estado compartido por toda la página: la puerta de entrada, el foro y la barra de arriba ven la misma sesión
const aprendiz = ref(sesionGuardada()?.aprendiz ?? null) // { nombre, documento, tipoDocumento, ficha, tieneFirma }
const esAdmin = ref(Boolean(sesionAdminGuardada()))
let revisada = false

async function revisarSesiones() {
  if (revisada) return
  revisada = true

  if (sesionGuardada()) {
    // confirmamos con el servidor por si el profe le reinició el PIN o le borró la cuenta
    try {
      const { aprendiz: actual } = await api.quienSoy()
      if (actual) recordar({ ...sesionGuardada(), aprendiz: actual })
      else salir()
    } catch {
      // sin conexión dejamos la sesión local; el servidor igual la valida al publicar
    }
  }

  if (sesionAdminGuardada()) {
    try {
      const { admin } = await api.sesionAdmin()
      if (!admin) salirAdmin()
    } catch {
      // igual que arriba: el servidor decide al momento de calificar o borrar
    }
  }
}

function recordar(sesion) {
  guardarSesion(sesion)
  aprendiz.value = sesion?.aprendiz ?? null
}

async function registrar(datos) {
  recordar(await api.registrarAprendiz(datos))
}

async function entrar(documento, pin) {
  recordar(await api.entrarAprendiz(documento, pin))
}

// Tipo de documento o firma: el servidor devuelve cómo quedó el aprendiz y se actualiza aquí
async function completarPerfil(datos) {
  const { aprendiz: actual } = await api.completarPerfil(datos)
  recordar({ ...sesionGuardada(), aprendiz: actual })
}

// Vuelve a preguntarle al servidor cómo está el aprendiz (por ejemplo, si el profe ya lo aprobó)
async function actualizar() {
  const { aprendiz: actual } = await api.quienSoy()
  if (actual) recordar({ ...sesionGuardada(), aprendiz: actual })
  else salir()
}

function salir() {
  recordar(null)
}

async function entrarAdmin(clave) {
  guardarSesionAdmin(await api.entrarAdmin(clave))
  esAdmin.value = true
}

function salirAdmin() {
  guardarSesionAdmin(null)
  esAdmin.value = false
}

// El botón "Salir de Admin": además de olvidar la sesión aquí, el servidor mata todas las del admin,
// por si quedó una abierta (o copiada) en otro computador
async function cerrarAdmin() {
  try {
    await api.cerrarSesionesAdmin()
  } catch {
    // sin internet igual se sale aquí; la sesión del servidor se vence sola a las 8 horas
  }
  salirAdmin()
}

// Si la API dice que la sesión venció, cerramos la que corresponda para que la pidan de nuevo
function atenderError(error, deAdmin = false) {
  if (error.sesionVencida) deAdmin ? salirAdmin() : salir()
}

export function useSesion() {
  revisarSesiones()
  return {
    aprendiz: readonly(aprendiz),
    esAdmin: readonly(esAdmin),
    registrar,
    entrar,
    completarPerfil,
    actualizar,
    salir,
    entrarAdmin,
    salirAdmin,
    cerrarAdmin,
    atenderError
  }
}
