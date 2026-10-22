import { ref, readonly } from 'vue'
import { api, sesionGuardada, sesionAdminGuardada, guardarSesion, guardarSesionAdmin } from '../servicios/api.js'

// Estado compartido por toda la página: el foro y la barra de arriba ven la misma sesión
const aprendiz = ref(null) // { usuario, nombre }
const esAdmin = ref(false)
let revisada = false

async function revisarSesiones() {
  if (revisada) return
  revisada = true

  const guardada = sesionGuardada()
  if (guardada) {
    aprendiz.value = { usuario: guardada.usuario, nombre: guardada.nombre }
    // confirmamos con el servidor por si el profe borró la cuenta o venció la firma
    try {
      const { usuario, nombre } = await api.miCuenta()
      if (usuario) aprendiz.value = { usuario, nombre }
      else salir()
    } catch {
      // sin conexión dejamos la sesión local; el servidor igual la valida al publicar
    }
  }

  if (sesionAdminGuardada()) {
    esAdmin.value = true
    try {
      const { admin } = await api.sesionAdmin()
      if (!admin) salirAdmin()
    } catch {
      // igual que arriba: el servidor decide al momento de calificar o borrar
    }
  }
}

function recordar({ usuario, nombre, token, expira }) {
  guardarSesion({ usuario, nombre, token, expira })
  aprendiz.value = { usuario, nombre }
}

async function registrar(datos) {
  recordar(await api.registrar(datos))
}

async function ingresar(datos) {
  recordar(await api.ingresar(datos))
}

function salir() {
  guardarSesion(null)
  aprendiz.value = null
}

async function entrarAdmin(clave) {
  guardarSesionAdmin(await api.entrarAdmin(clave))
  esAdmin.value = true
}

function salirAdmin() {
  guardarSesionAdmin(null)
  esAdmin.value = false
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
    ingresar,
    salir,
    entrarAdmin,
    salirAdmin,
    atenderError
  }
}
