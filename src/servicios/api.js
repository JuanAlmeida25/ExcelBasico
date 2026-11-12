// Cliente de la API. La sesión del admin vive en localStorage; la del aprendiz en sessionStorage,
// como en Razonar: en el PC del salón, al cerrar la pestaña nadie queda adentro.

const CLAVE_APRENDIZ = 'tic-excel-aprendiz'
const CLAVE_ADMIN = 'tic-excel-admin'

// El almacenamiento puede no existir (modo incógnito estricto), así que siempre con casco.
// Se pasa como función para que hasta tocar localStorage quede dentro del try
const local = () => localStorage
const deLaPestana = () => sessionStorage

function leerGuardado(clave, almacen = local) {
  try {
    const sesion = JSON.parse(almacen().getItem(clave) || 'null')
    return sesion && sesion.expira > Date.now() ? sesion : null
  } catch {
    return null
  }
}

function guardar(clave, valor, almacen = local) {
  try {
    if (valor) almacen().setItem(clave, JSON.stringify(valor))
    else almacen().removeItem(clave)
  } catch {
    // sin almacenamiento, la sesión dura hasta recargar y ya
  }
}

export const sesionGuardada = () => leerGuardado(CLAVE_APRENDIZ, deLaPestana)
export const sesionAdminGuardada = () => leerGuardado(CLAVE_ADMIN)
export function guardarSesion(sesion) {
  guardar(CLAVE_APRENDIZ, sesion, deLaPestana)
  // la de las cuentas viejas (usuario y contraseña) ya no sirve: que no estorbe
  guardar('tic-excel-sesion', null)
}
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
    error.datos = datos
    throw error
  }
  return datos
}

export const api = {
  registrarAprendiz: (datos) => pedir('aprendices?accion=registrar', { metodo: 'POST', cuerpo: datos }),
  entrarAprendiz: (documento, pin) => pedir('aprendices?accion=entrar', { metodo: 'POST', cuerpo: { documento, pin } }),
  quienSoy: () => pedir('aprendices'),
  completarPerfil: (datos) => pedir('aprendices?accion=perfil', { metodo: 'POST', cuerpo: datos }),
  listaAprendices: () => pedir('aprendices?accion=lista'),
  corregirAprendiz: (documento, datos) => pedir('aprendices', { metodo: 'PUT', cuerpo: { documento, ...datos } }),
  aprobarAprendiz: (documento, aprobado) => pedir('aprendices?accion=aprobar', { metodo: 'POST', cuerpo: { documento, aprobado } }),
  reiniciarPin: (documento) => pedir('aprendices?accion=reiniciar-pin', { metodo: 'POST', cuerpo: { documento } }),
  borrarFirma: (documento) => pedir(`aprendices?documento=${encodeURIComponent(documento)}&solo=firma`, { metodo: 'DELETE' }),
  borrarAprendiz: (documento) => pedir(`aprendices?documento=${encodeURIComponent(documento)}`, { metodo: 'DELETE' }),

  asistencia: () => pedir('asistencia'),
  planillaAsistencia: () => pedir('asistencia?accion=planilla'),
  marcarAsistencia: (fecha, documentos, presente) => pedir('asistencia', { metodo: 'PUT', cuerpo: { fecha, documentos, presente } }),
  guardarEncabezado: (encabezado) => pedir('asistencia?accion=encabezado', { metodo: 'PUT', cuerpo: encabezado }),

  entrarAdmin: (clave) => pedir('admin', { metodo: 'POST', cuerpo: { clave } }),
  sesionAdmin: () => pedir('admin?accion=sesion'),
  cerrarSesionesAdmin: () => pedir('admin?accion=salir', { metodo: 'POST' })
}
