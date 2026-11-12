<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../servicios/api.js'
import { useSesion } from '../composables/useSesion.js'
import { hojasDeAsistencia, textoFecha } from '../utils/ficha.js'
import { imprimirPlanilla } from '../utils/planillaAsistencia.js'

// Asistencia con checkboxes: el profe marca quién vino y la planilla del SENA sale con la firma de cada uno
const hojas = hojasDeAsistencia()
const hoy = textoFecha(new Date())
// Arranca en la hoja de esta semana; si la ficha no ha empezado o ya terminó, en la primera
const hojaActiva = ref(Math.max(0, hojas.findIndex((h) => h.desde <= hoy && hoy <= h.hasta)))
const hoja = computed(() => hojas[hojaActiva.value])

const cargando = ref(true)
const error = ref('')
const aprendices = ref([])
const pendientes = ref(0)
const asistencia = ref({})
const encabezado = ref({ ficha: '', programa: '', codigoCentro: '' })
const guardandoEncabezado = ref(false)
const encabezadoGuardado = ref(false)
const imprimiendo = ref(false)

const fechaCorta = (texto) => texto.split('-').reverse().join('/').slice(0, 5)
const vino = (fecha, documento) => (asistencia.value[fecha] || []).includes(documento)
const presentes = (fecha) => aprendices.value.filter((a) => vino(fecha, a.documento)).length
const todosVinieron = (fecha) => aprendices.value.length > 0 && presentes(fecha) === aprendices.value.length

// Marcados que no tienen firma: su casilla sale vacía en la planilla y toca que firmen a mano
const marcadosSinFirma = computed(() =>
  aprendices.value.filter((a) => !a.tieneFirma && hoja.value.dias.some((d) => vino(d.fecha, a.documento))),
)

const sesion = useSesion()

function atenderError(e) {
  sesion.atenderError(e, true)
  error.value = e.message
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [datos, lista] = await Promise.all([api.asistencia(), api.listaAprendices()])
    asistencia.value = datos.asistencia
    encabezado.value = datos.encabezado
    // solo los aprobados: uno pendiente puede ser alguien con cédula ajena
    aprendices.value = lista.aprendices.filter((a) => a.aprobado)
    pendientes.value = lista.aprendices.length - aprendices.value.length
  } catch (e) {
    atenderError(e)
  } finally {
    cargando.value = false
  }
}

// Se marca de una vez en pantalla y, si el servidor dice que no, se devuelve
async function marcar(fecha, documentos, presente) {
  const antes = asistencia.value[fecha] || []
  asistencia.value = {
    ...asistencia.value,
    [fecha]: presente ? [...new Set([...antes, ...documentos])] : antes.filter((d) => !documentos.includes(d)),
  }
  error.value = ''
  try {
    const { presentes: confirmados } = await api.marcarAsistencia(fecha, documentos, presente)
    asistencia.value = { ...asistencia.value, [fecha]: confirmados }
  } catch (e) {
    asistencia.value = { ...asistencia.value, [fecha]: antes }
    atenderError(e)
  }
}

const marcarTodos = (fecha) => marcar(fecha, aprendices.value.map((a) => a.documento), !todosVinieron(fecha))

async function guardarEncabezado() {
  guardandoEncabezado.value = true
  error.value = ''
  try {
    encabezado.value = (await api.guardarEncabezado(encabezado.value)).encabezado
    encabezadoGuardado.value = true
    setTimeout(() => (encabezadoGuardado.value = false), 2500)
  } catch (e) {
    atenderError(e)
  } finally {
    guardandoEncabezado.value = false
  }
}

// Las firmas se piden solo al imprimir: son imágenes y no hace falta cargarlas para marcar
async function imprimir(todas) {
  imprimiendo.value = true
  error.value = ''
  try {
    const datos = await api.planillaAsistencia()
    imprimirPlanilla(todas ? hojas : [hoja.value], datos)
  } catch (e) {
    atenderError(e)
  } finally {
    imprimiendo.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <section class="panel-seccion">
    <h2>✅ Asistencia</h2>
    <p class="panel-nota">
      Cada aprendiz firma <strong>una sola vez</strong> desde 👤 Mi cuenta. Tú marcas con el checkbox quién vino
      y, al imprimir, su firma cae sola en la casilla de ese día del formato del SENA.
    </p>

    <p v-if="error" class="mensaje-error" role="alert">⚠️ {{ error }}</p>

    <details class="encabezado" :open="!encabezado.ficha">
      <summary>🗂️ Datos del encabezado de la planilla</summary>
      <form class="campos" @submit.prevent="guardarEncabezado">
        <div>
          <label for="enc-ficha">Número de ficha</label>
          <input id="enc-ficha" v-model="encabezado.ficha" inputmode="numeric" maxlength="12" placeholder="Ej.: 3312002" />
        </div>
        <div class="ancho">
          <label for="enc-programa">Programa de formación</label>
          <input id="enc-programa" v-model="encabezado.programa" maxlength="120" placeholder="Ej.: Coordinación en Sistemas Integrados de Gestión" />
        </div>
        <div>
          <label for="enc-centro">Código del centro</label>
          <input id="enc-centro" v-model="encabezado.codigoCentro" inputmode="numeric" maxlength="10" placeholder="Ej.: 9227" />
        </div>
        <div class="boton-guardar">
          <button class="boton-primario" :disabled="guardandoEncabezado">
            {{ guardandoEncabezado ? 'Guardando…' : encabezadoGuardado ? '✔ Guardado' : '💾 Guardar' }}
          </button>
        </div>
      </form>
      <p class="panel-nota">Regional Guajira (44), Centro Agroempresarial y Acuícola y Fonseca ya vienen puestos, como en el Libro 1.</p>
    </details>

    <div class="panel-filtros" role="tablist" aria-label="Hojas de la planilla">
      <button
        v-for="(h, i) in hojas"
        :key="h.desde"
        type="button"
        class="panel-chip"
        role="tab"
        :aria-selected="hojaActiva === i"
        :class="{ activo: hojaActiva === i }"
        @click="hojaActiva = i"
      >
        Hoja {{ i + 1 }}: {{ fechaCorta(h.desde) }} al {{ fechaCorta(h.hasta) }}
      </button>
    </div>

    <p v-if="!cargando && pendientes" class="panel-nota">
      ⏳ {{ pendientes }} {{ pendientes === 1 ? 'aprendiz está pendiente' : 'aprendices están pendientes' }} de aprobar y no
      {{ pendientes === 1 ? 'sale' : 'salen' }} aquí. {{ pendientes === 1 ? 'Apruébalo' : 'Apruébalos' }} en 👥 Aprendices.
    </p>
    <p v-if="cargando" class="panel-nota">Cargando asistencia…</p>
    <p v-else-if="!aprendices.length" class="panel-nota">Todavía no hay aprendices aprobados. Cuando los apruebes, salen aquí.</p>

    <template v-else>
      <div class="tabla-scroll">
        <table class="asistencia">
          <thead>
            <tr>
              <th class="quien">Aprendiz</th>
              <th v-for="d in hoja.dias" :key="d.fecha" :class="{ hoy: d.fecha === hoy, fuera: !d.dentroDeLaFicha }">
                <span class="dia">{{ d.nombre.slice(0, 3) }}</span>
                <span class="fecha">{{ fechaCorta(d.fecha) }}</span>
                <label v-if="d.dentroDeLaFicha" class="todos" :title="`Marcar a todos el ${d.nombre} ${fechaCorta(d.fecha)}`">
                  <input type="checkbox" :checked="todosVinieron(d.fecha)" @change="marcarTodos(d.fecha)" />
                  <span>{{ presentes(d.fecha) }}/{{ aprendices.length }}</span>
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in aprendices" :key="a.documento">
              <th class="quien" scope="row">
                {{ a.nombre }}
                <small>{{ a.tipoDocumento || '¿?' }} {{ a.documento }} · {{ a.tieneFirma ? '✍️ firmó' : 'sin firma' }}</small>
              </th>
              <td v-for="d in hoja.dias" :key="d.fecha" :class="{ hoy: d.fecha === hoy, fuera: !d.dentroDeLaFicha }">
                <input
                  v-if="d.dentroDeLaFicha"
                  type="checkbox"
                  :checked="vino(d.fecha, a.documento)"
                  :aria-label="`${a.nombre} vino el ${d.nombre} ${fechaCorta(d.fecha)}`"
                  @change="marcar(d.fecha, [a.documento], $event.target.checked)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="marcadosSinFirma.length" class="mensaje-error">
        ✍️ {{ marcadosSinFirma.length === 1 ? 'Este aprendiz está marcado' : 'Estos aprendices están marcados' }}, pero
        no ha{{ marcadosSinFirma.length === 1 ? '' : 'n' }} hecho su firma:
        <strong>{{ marcadosSinFirma.map((a) => a.nombre).join(', ') }}</strong>. En la planilla su casilla sale vacía para que firmen a mano.
      </p>

      <div class="acciones">
        <button class="boton-primario" :disabled="imprimiendo" @click="imprimir(false)">
          {{ imprimiendo ? 'Preparando…' : `🖨️ Planilla de la hoja ${hojaActiva + 1} (PDF)` }}
        </button>
        <button class="boton-secundario" :disabled="imprimiendo" @click="imprimir(true)">🖨️ Toda la ficha ({{ hojas.length }} hojas)</button>
        <button class="boton-secundario" :disabled="cargando" @click="cargar">🔄 Actualizar</button>
      </div>
      <p class="panel-nota">En el cuadro de imprimir escoge <strong>«Guardar como PDF»</strong>, tamaño carta y horizontal.</p>
    </template>
  </section>
</template>

<style scoped>
.panel-nota {
  color: var(--texto-suave);
  margin-bottom: 8px;
}

.encabezado {
  border: 2px solid var(--borde);
  border-radius: 14px;
  padding: 10px 14px;
  margin: 8px 0 14px;
}

.encabezado summary {
  cursor: pointer;
  font-weight: 800;
}

.campos {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-top: 10px;
}

.campos input {
  margin: 0;
}

.tabla-scroll {
  overflow-x: auto;
  margin-bottom: 12px;
}

.asistencia {
  min-width: 720px;
}

.asistencia th,
.asistencia td {
  text-align: center;
  padding: 6px 4px;
}

.asistencia .quien {
  text-align: left;
  min-width: 190px;
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.quien small {
  display: block;
  font-weight: 400;
  color: var(--texto-suave);
  font-size: 0.78rem;
}

thead .dia,
thead .fecha {
  display: block;
}

thead .dia {
  font-weight: 800;
}

thead .fecha {
  font-size: 0.75rem;
  color: var(--texto-suave);
}

.todos {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.72rem;
  margin: 4px 0 0;
  cursor: pointer;
}

.asistencia input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--verde);
  cursor: pointer;
}

.hoy {
  background: #fef9c3;
}

.fuera {
  background: repeating-linear-gradient(-45deg, #f6f7fa 0 6px, #eceff4 6px 12px);
}

.fuera .fecha,
.fuera .dia {
  opacity: 0.5;
}

.acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .campos {
    grid-template-columns: 1fr;
  }
}
</style>
