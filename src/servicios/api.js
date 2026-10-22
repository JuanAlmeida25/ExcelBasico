// Cliente de la API del foro. Las sesiones se guardan en el navegador para no pedir la clave a cada rato.

const CLAVE_APRENDIZ = 'tic-excel-sesion'
const CLAVE_ADMIN = 'tic-excel-admin'

// localStorage puede no existir (modo incógnito estricto), así que siempre con casco
function leerGuardado(clave) {
  try {
    const sesion = JSON.parse(localStorage.getItem(clave) || 'null')
    return sesion && sesion.expira > Date.now() ? sesion : null
  } catch {
    return null
  }
}

function guardar(clave, valor) {
  try {
    if (valor) localStorage.setItem(clave, JSON.stringify(valor))
    else localStorage.removeItem(clave)
  } catch {
    // sin almacenamiento, la sesión dura hasta recargar y ya
  }
}

export const sesionGuardada = () => leerGuardado(CLAVE_APRENDIZ)
export const sesionAdminGuardada = () => leerGuardado(CLAVE_ADMIN)
export const guardarSesion = (sesion) => guardar(CLAVE_APRENDIZ, sesion)
export const guardarSesionAdmin = (sesion) => guardar(CLAVE_ADMIN, sesion)

async function pedir(ruta, { metodo = 'GET', cuerpo } = {}) {
  const cabeceras = { 'Content-Type': 'application/json' }
  const aprendiz = sesionGuardada()
  const admin = sesionAdminGuardada()
  if (aprendiz) cabeceras.Authorization = `Bearer ${aprendiz.token}`
  if (admin) cabeceras['X-Admin-Token'] = admin.token

  let respuesta
  try {
    respuesta = await fetch(`/api/${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
    })
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu internet.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const error = new Error(datos.error || `Error ${respuesta.status}`)
    error.status = respuesta.status
    error.sesionVencida = Boolean(datos.sesionVencida)
    throw error
  }
  return datos
}

export const api = {
  miCuenta: () => pedir('cuenta'),
  registrar: (datos) => pedir('cuenta?accion=registro', { metodo: 'POST', cuerpo: datos }),
  ingresar: (datos) => pedir('cuenta?accion=ingresar', { metodo: 'POST', cuerpo: datos }),

  entrarAdmin: (clave) => pedir('admin', { metodo: 'POST', cuerpo: { clave } }),
  sesionAdmin: () => pedir('admin?accion=sesion'),
  resumenAdmin: () => pedir('admin?accion=resumen'),
  borrarCuenta: (usuario) => pedir(`admin?usuario=${encodeURIComponent(usuario)}`, { metodo: 'DELETE' }),

  respuestas: (fase) => pedir(`foro?fase=${fase}`),
  responder: (pregunta, texto) => pedir('foro', { metodo: 'POST', cuerpo: { pregunta, texto } }),
  borrarRespuesta: (id) => pedir(`foro?id=${encodeURIComponent(id)}`, { metodo: 'DELETE' }),
  calificar: (id, calificacion, retroalimentacion) =>
    pedir(`foro?id=${encodeURIComponent(id)}`, { metodo: 'PATCH', cuerpo: { calificacion, retroalimentacion } })
}
