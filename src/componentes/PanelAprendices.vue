<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../servicios/api.js'
import { useSesion } from '../composables/useSesion.js'
import { TIPOS_DOCUMENTO } from '../datos/tiposDocumento.js'
import { generarCsv } from '../utils/panel.js'

// La lista de aprendices registrados: corregir datos, reiniciar el PIN olvidado y sacar la lista a Excel
const cargando = ref(true)
const error = ref('')
const aprendices = ref([])
const busqueda = ref('')
const editando = ref(null)
const guardando = ref(false)
// El PIN nuevo se muestra una sola vez, para dictárselo al aprendiz
const pinNuevo = ref(null)

const filtrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  if (!texto) return aprendices.value
  return aprendices.value.filter((a) => `${a.nombre} ${a.documento} ${a.ficha}`.toLowerCase().includes(texto))
})
const bloqueados = computed(() => aprendices.value.filter((a) => a.bloqueado).length)
const sinFirma = computed(() => aprendices.value.filter((a) => !a.tieneFirma).length)
const pendientes = computed(() => aprendices.value.filter((a) => !a.aprobado).length)

const fecha = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

const sesion = useSesion()

function atenderError(e) {
  sesion.atenderError(e, true)
  error.value = e.message
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    aprendices.value = (await api.listaAprendices()).aprendices
  } catch (e) {
    atenderError(e)
  } finally {
    cargando.value = false
  }
}

function editar(a) {
  editando.value = { documento: a.documento, nombre: a.nombre, tipoDocumento: a.tipoDocumento, ficha: a.ficha }
  error.value = ''
}

async function guardarCambios() {
  guardando.value = true
  error.value = ''
  try {
    const { documento, nombre, tipoDocumento, ficha } = editando.value
    const { aprendiz } = await api.corregirAprendiz(documento, { nombre, tipoDocumento, ficha })
    const i = aprendices.value.findIndex((a) => a.documento === documento)
    if (i >= 0) aprendices.value[i] = { ...aprendices.value[i], ...aprendiz }
    editando.value = null
  } catch (e) {
    atenderError(e)
  } finally {
    guardando.value = false
  }
}

// Aprobar es decir "sí, este es quien dice ser": mira que el nombre y el documento cuadren con el aprendiz de verdad
async function aprobar(a, aprobado) {
  if (!aprobado && !window.confirm(`¿Quitarle la aprobación a ${a.nombre}? No podrá firmar y sale de la asistencia.`)) return
  error.value = ''
  try {
    await api.aprobarAprendiz(a.documento, aprobado)
    a.aprobado = aprobado
  } catch (e) {
    atenderError(e)
  }
}

async function reiniciar(a) {
  if (!window.confirm(`¿Darle un PIN nuevo a ${a.nombre}? El viejo deja de servir y se le cierra la sesión donde la tenga abierta.`)) return
  error.value = ''
  try {
    const { pin } = await api.reiniciarPin(a.documento)
    pinNuevo.value = { nombre: a.nombre, documento: a.documento, pin }
    a.bloqueado = false
  } catch (e) {
    atenderError(e)
  }
}

async function borrarFirma(a) {
  if (!window.confirm(`¿Borrar la firma de ${a.nombre}? Tendrá que firmar otra vez desde su cuenta.`)) return
  error.value = ''
  try {
    await api.borrarFirma(a.documento)
    a.tieneFirma = false
  } catch (e) {
    atenderError(e)
  }
}

async function borrar(a) {
  if (!window.confirm(`¿Borrar el registro de ${a.nombre} (${a.documento})? Se tendrá que registrar otra vez.`)) return
  error.value = ''
  try {
    await api.borrarAprendiz(a.documento)
    aprendices.value = aprendices.value.filter((x) => x.documento !== a.documento)
    if (pinNuevo.value?.documento === a.documento) pinNuevo.value = null
  } catch (e) {
    atenderError(e)
  }
}

// El mismo generador del CSV de notas: punto y coma, BOM y sin fórmulas coladas
function exportarCsv() {
  const contenido = generarCsv(aprendices.value, [
    { titulo: 'Nombre', valor: (a) => a.nombre },
    { titulo: 'Tipo doc', valor: (a) => a.tipoDocumento },
    { titulo: 'Documento', valor: (a) => a.documento },
    { titulo: 'Ficha', valor: (a) => a.ficha },
    { titulo: 'Aprobado', valor: (a) => (a.aprobado ? 'Sí' : 'No') },
    { titulo: 'Firmó', valor: (a) => (a.tieneFirma ? 'Sí' : 'No') },
    { titulo: 'Registrado', valor: (a) => fecha(a.fecha) }
  ])
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }))
  enlace.download = `aprendices-${new Date().toISOString().slice(0, 10)}.csv`
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

onMounted(cargar)
</script>

<template>
  <section class="panel-seccion">
    <h2>👥 Aprendices registrados</h2>
    <p class="panel-nota">
      Cada aprendiz se registra solo con su documento y un PIN de 4 números (el PIN se guarda cifrado: ni tú lo puedes ver).
      Si falla el PIN 3 veces, su cuenta se bloquea 15 minutos. Si se le olvidó, dale <strong>PIN nuevo</strong> y díctaselo.
    </p>
    <p class="panel-nota">
      Cada cuenta nueva llega <strong>pendiente</strong>: antes de darle <strong>✔ Aprobar</strong>, mira que el nombre y el
      documento sean de ese aprendiz. Sin aprobar no puede firmar ni sale en la asistencia. Si alguien se registró con la cédula
      de otro, bórrala y que el dueño se registre.
    </p>

    <p v-if="error" class="mensaje-error" role="alert">⚠️ {{ error }}</p>

    <div v-if="pinNuevo" class="pin-nuevo" role="status">
      <p>PIN nuevo de <strong>{{ pinNuevo.nombre }}</strong>:</p>
      <p class="numero-pin">{{ pinNuevo.pin }}</p>
      <p class="panel-nota">Díctaselo ya: no se vuelve a mostrar. Puede seguir usándolo; si quiere otro, se lo vuelves a reiniciar.</p>
      <button class="boton-secundario chico" @click="pinNuevo = null">Listo, ya se lo dije</button>
    </div>

    <div v-if="aprendices.length" class="cifras">
      <div><span>Registrados</span><strong>{{ aprendices.length }}</strong></div>
      <div><span>Bloqueados ahora</span><strong>{{ bloqueados }}</strong></div>
      <div><span>Sin firma todavía</span><strong>{{ sinFirma }}</strong></div>
      <div><span>Pendientes de aprobar</span><strong>{{ pendientes }}</strong></div>
    </div>

    <div class="herramientas">
      <label class="solo-lectores" for="buscar-aprendiz">Buscar por nombre, documento o ficha</label>
      <input id="buscar-aprendiz" v-model="busqueda" placeholder="🔎 Buscar por nombre, documento o ficha" />
      <button class="boton-secundario" :disabled="cargando" @click="cargar">🔄 Actualizar</button>
      <button class="boton-primario" :disabled="!aprendices.length" @click="exportarCsv">⬇️ Exportar CSV</button>
    </div>

    <p v-if="cargando" class="panel-nota">Cargando aprendices…</p>
    <p v-else-if="!aprendices.length" class="panel-nota">Todavía nadie se ha registrado. Diles que le den al botón 🔑 Entrar de arriba y luego a «Es mi primera vez».</p>
    <p v-else-if="!filtrados.length" class="panel-nota">Nadie coincide con «{{ busqueda }}».</p>

    <div v-else class="tabla-scroll">
      <table>
        <thead>
          <tr><th>Aprendiz</th><th>Documento</th><th>Ficha</th><th>Firma</th><th>Registrado</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="a in filtrados" :key="a.documento">
            <template v-if="editando?.documento === a.documento">
              <td>
                <label class="solo-lectores" :for="`nombre-${a.documento}`">Nombre</label>
                <input :id="`nombre-${a.documento}`" v-model="editando.nombre" maxlength="80" />
              </td>
              <td>
                <label class="solo-lectores" :for="`tipo-${a.documento}`">Tipo de documento</label>
                <select :id="`tipo-${a.documento}`" v-model="editando.tipoDocumento" class="corto">
                  <option v-for="t in TIPOS_DOCUMENTO" :key="t.valor" :value="t.valor">{{ t.valor }}</option>
                </select>
                {{ a.documento }}
              </td>
              <td>
                <label class="solo-lectores" :for="`ficha-${a.documento}`">Ficha</label>
                <input :id="`ficha-${a.documento}`" v-model="editando.ficha" inputmode="numeric" maxlength="12" class="corto" />
              </td>
              <td>{{ a.tieneFirma ? '✔' : '—' }}</td>
              <td>{{ fecha(a.fecha) }}</td>
              <td class="acciones">
                <button class="boton-primario chico" :disabled="guardando" @click="guardarCambios">{{ guardando ? 'Guardando…' : '💾 Guardar' }}</button>
                <button class="boton-secundario chico" @click="editando = null">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>
                <strong>{{ a.nombre }}</strong>
                <small v-if="!a.aprobado" class="pendiente">⏳ Pendiente de aprobar</small>
                <small v-if="a.bloqueado" class="bloqueado">🔒 Bloqueado por fallar el PIN</small>
              </td>
              <td>
                <span v-if="a.tipoDocumento" class="tipo">{{ a.tipoDocumento }}</span>
                <span v-else class="tipo falta" title="Todavía no ha escogido su tipo de documento">¿?</span>
                {{ a.documento }}
              </td>
              <td>{{ a.ficha || '—' }}</td>
              <td>
                <span v-if="a.tieneFirma" class="firmo">✔ Firmó</span>
                <span v-else class="sin-firma">Falta</span>
              </td>
              <td>{{ fecha(a.fecha) }}</td>
              <td class="acciones">
                <button v-if="!a.aprobado" class="boton-primario chico" @click="aprobar(a, true)">✔ Aprobar</button>
                <button class="boton-secundario chico" @click="editar(a)">✏️ Corregir</button>
                <button class="boton-secundario chico" @click="reiniciar(a)">🔑 PIN nuevo</button>
                <button v-if="a.tieneFirma" class="boton-secundario chico" @click="borrarFirma(a)">✍️ Borrar firma</button>
                <button v-if="a.aprobado" class="boton-secundario chico" @click="aprobar(a, false)">Quitar aprobación</button>
                <button class="boton-peligro chico" @click="borrar(a)">🗑️</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.panel-nota {
  color: var(--texto-suave);
  margin-bottom: 8px;
}

.pin-nuevo {
  background: var(--verde-claro);
  border-left: 6px solid var(--verde);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.pin-nuevo p {
  margin: 0 0 6px;
}

.numero-pin {
  font-family: inherit;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: var(--verde);
}

.cifras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 12px 0 16px;
}

.cifras div {
  background: var(--verde-claro);
  border-radius: 14px;
  padding: 10px 14px;
}

.cifras span {
  display: block;
  font-size: 0.8rem;
  color: var(--texto-suave);
  font-weight: 700;
}

.cifras strong {
  font-family: inherit;
  font-size: 1.2rem;
  color: var(--verde-oscuro);
}

.herramientas {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}

.herramientas input {
  flex: 1;
  min-width: 220px;
  margin: 0;
}

.tabla-scroll {
  overflow-x: auto;
}

td input {
  margin: 0;
  min-width: 180px;
}

td input.corto {
  min-width: 100px;
}

.tipo {
  font-size: 0.75rem;
  font-weight: 800;
  background: var(--fondo);
  border-radius: 6px;
  padding: 1px 6px;
  margin-right: 4px;
}

.tipo.falta {
  background: #fef9c3;
}

td select.corto {
  width: auto;
  margin: 0 4px 0 0;
}

.firmo {
  color: var(--verde);
  font-weight: 800;
  white-space: nowrap;
}

.sin-firma {
  color: var(--texto-suave);
}

.pendiente {
  display: block;
  color: #b45309;
  font-weight: 700;
}

.bloqueado {
  display: block;
  color: #b91c1c;
  font-weight: 700;
}

.acciones {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.boton.chico {
  padding: 5px 12px;
  font-size: 0.85rem;
}

.boton.peligro {
  color: #b91c1c;
  border-color: #b91c1c;
}
</style>
