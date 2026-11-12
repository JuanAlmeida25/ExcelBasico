<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../servicios/api.js'
import { useSesion } from '../composables/useSesion.js'
import { resumenPorAprendiz, generarCsv, ESTADOS } from '../utils/panel.js'
import { idsPreguntas } from '../datos/foro.js'
import PanelAprendices from './PanelAprendices.vue'
import PanelAsistencia from './PanelAsistencia.vue'

const { atenderError } = useSesion()

const filas = ref([])
const cargando = ref(false)
const error = ref('')
const filtro = ref('todos')

// El panel tiene tres partes; cada una pide sus datos cuando se abre
const vistas = [
  { id: 'foro', nombre: '💬 Foro y notas' },
  { id: 'aprendices', nombre: '👥 Aprendices' },
  { id: 'asistencia', nombre: '✅ Asistencia' }
]
const vista = ref('foro')

const filtros = [{ id: 'todos', nombre: 'Todos' }, ...ESTADOS]
const nombreEstado = (id) => ESTADOS.find((e) => e.id === id)?.nombre || id

const filasFiltradas = computed(() =>
  filtro.value === 'todos' ? filas.value : filas.value.filter((f) => f.estado === filtro.value)
)

const conteo = computed(() => {
  const c = Object.fromEntries(ESTADOS.map((e) => [e.id, 0]))
  for (const f of filas.value) c[f.estado]++
  return c
})

const promedio = computed(() => {
  const notas = filas.value.filter((f) => f.nota !== null).map((f) => f.nota)
  return notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null
})

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const { cuentas, respuestas } = await api.resumenAdmin()
    filas.value = resumenPorAprendiz(cuentas, respuestas, idsPreguntas.length)
  } catch (e) {
    atenderError(e, true)
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

function exportarCsv() {
  const csv = generarCsv(filas.value, [
    { titulo: 'Aprendiz', valor: (f) => f.nombre },
    { titulo: 'Documento', valor: (f) => f.documento },
    { titulo: 'Respondidas', valor: (f) => `${f.respondidas}/${f.totalPreguntas}` },
    { titulo: 'Nota promedio', valor: (f) => f.nota },
    { titulo: 'Por calificar', valor: (f) => f.pendientes },
    { titulo: 'Estado', valor: (f) => nombreEstado(f.estado) }
  ])
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  enlace.download = `notas-foro-excel-${new Date().toISOString().slice(0, 10)}.csv`
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

onMounted(cargar)
</script>

<template>
  <section class="panel-profe">
    <header class="panel-cabeza">
      <div>
        <h2><span class="celda">P1</span> 👨‍🏫 Panel del Profe</h2>
        <p>Quién ya respondió el foro, quién está registrado y la asistencia de la ficha.</p>
      </div>
      <div v-if="vista === 'foro'" class="panel-acciones">
        <button class="boton-secundario" type="button" :disabled="cargando" @click="cargar">
          {{ cargando ? 'Actualizando…' : '↻ Actualizar' }}
        </button>
        <button class="boton-primario" type="button" :disabled="!filas.length" @click="exportarCsv">
          ⬇️ Exportar notas a CSV
        </button>
      </div>
    </header>

    <div class="panel-filtros panel-vistas" role="tablist" aria-label="Partes del panel">
      <button
        v-for="v in vistas"
        :key="v.id"
        type="button"
        role="tab"
        class="panel-chip"
        :class="{ activo: vista === v.id }"
        :aria-selected="vista === v.id"
        @click="vista = v.id"
      >{{ v.nombre }}</button>
    </div>

    <PanelAprendices v-if="vista === 'aprendices'" />
    <PanelAsistencia v-else-if="vista === 'asistencia'" />

    <template v-else>
    <p v-if="error" class="mensaje-error" role="alert">{{ error }}</p>
    <p v-else-if="cargando && !filas.length" class="foro-estado">Cargando el resumen del foro…</p>
    <p v-else-if="!filas.length" class="foro-estado">Todavía nadie se ha registrado.</p>

    <template v-else>
      <div class="panel-stats">
        <div v-for="e in ESTADOS" :key="e.id" class="panel-stat" :class="e.id">
          <b>{{ conteo[e.id] }}</b>
          <span>{{ e.nombre }}</span>
        </div>
        <div class="panel-stat">
          <b>{{ promedio ?? '—' }}</b>
          <span>Promedio de notas</span>
        </div>
      </div>

      <div class="panel-filtros" role="group" aria-label="Filtrar por estado">
        <button
          v-for="f in filtros"
          :key="f.id"
          type="button"
          class="panel-chip"
          :class="{ activo: filtro === f.id }"
          :aria-pressed="filtro === f.id"
          @click="filtro = f.id"
        >{{ f.nombre }}</button>
      </div>

      <div class="panel-tabla-wrap">
        <table class="panel-tabla">
          <thead>
            <tr>
              <th scope="col">Aprendiz</th>
              <th scope="col">Documento</th>
              <th scope="col">Respondidas</th>
              <th scope="col">Nota</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in filasFiltradas" :key="f.documento">
              <td>{{ f.nombre }}</td>
              <td>{{ f.documento }}<small v-if="!f.conCuenta" class="sin-cuenta"> (sin cuenta)</small></td>
              <td class="num">{{ f.respondidas }}/{{ f.totalPreguntas }}</td>
              <td class="num">{{ f.nota ?? '—' }}</td>
              <td>
                <span class="estado-tag" :class="f.estado">{{ nombreEstado(f.estado) }}</span>
                <small v-if="f.pendientes" class="pendientes"> {{ f.pendientes }} por calificar</small>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filasFiltradas.length" class="foro-estado">Nadie en este estado. ¡Ojalá siempre fuera así de fácil!</p>
      </div>
      <p class="panel-ayuda">Para calificar, entra a la pestaña <a href="#fase-1">Fase 1</a> y baja hasta el foro: con el modo admin activo, cada respuesta trae el botón ⭐ Calificar. Para borrar cuentas o dar PIN nuevo, ve a 👥 Aprendices.</p>
    </template>
    </template>
  </section>
</template>
