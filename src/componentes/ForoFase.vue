<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import CuentaAprendiz from './CuentaAprendiz.vue'
import RespuestaForo from './RespuestaForo.vue'
import { useSesion } from '../composables/useSesion.js'
import { api } from '../servicios/api.js'
import { forosPorFase } from '../datos/foro.js'

const props = defineProps({
  fase: { type: Number, required: true }
})

const foro = forosPorFase[props.fase]
const { aprendiz, esAdmin, salir, atenderError } = useSesion()

const respuestas = ref([])
const cargando = ref(true)
const errorCarga = ref('')
const borradores = reactive({})
const errores = reactive({})
const enviando = reactive({})

const dePregunta = (id) => respuestas.value.filter((r) => r.pregunta === id)
const yaRespondio = (id) => aprendiz.value && respuestas.value.some((r) => r.pregunta === id && r.usuario === aprendiz.value.usuario)
const respondidas = computed(() => foro.preguntas.filter((p) => yaRespondio(p.id)).length)

async function cargar() {
  cargando.value = true
  errorCarga.value = ''
  try {
    respuestas.value = (await api.respuestas(props.fase)).respuestas
  } catch (e) {
    errorCarga.value = e.message
  } finally {
    cargando.value = false
  }
}

async function responder(pregunta) {
  errores[pregunta] = ''
  enviando[pregunta] = true
  try {
    const { respuesta } = await api.responder(pregunta, borradores[pregunta] || '')
    respuestas.value.push(respuesta)
    borradores[pregunta] = ''
  } catch (e) {
    atenderError(e)
    errores[pregunta] = e.message
  } finally {
    enviando[pregunta] = false
  }
}

async function borrar(respuesta) {
  const ajena = respuesta.usuario !== aprendiz.value?.usuario
  const pregunta = ajena
    ? `¿Borrar la respuesta de ${respuesta.nombre}? No se puede deshacer.`
    : '¿Borrar tu respuesta? Si ya tenía nota, también se pierde.'
  if (!confirm(pregunta)) return
  try {
    await api.borrarRespuesta(respuesta.id)
    respuestas.value = respuestas.value.filter((r) => r.id !== respuesta.id)
  } catch (e) {
    atenderError(e, ajena)
    alert(e.message)
  }
}

async function calificar(respuesta, { calificacion, retroalimentacion }) {
  try {
    const { respuesta: calificada } = await api.calificar(respuesta.id, calificacion, retroalimentacion)
    respuestas.value = respuestas.value.map((r) => (r.id === calificada.id ? calificada : r))
  } catch (e) {
    atenderError(e, true)
    alert(e.message)
  }
}

onMounted(cargar)
</script>

<template>
  <section class="foro" aria-labelledby="titulo-foro">
    <header class="foro-encabezado">
      <span class="foro-icono" aria-hidden="true">💬</span>
      <div>
        <h2 id="titulo-foro">{{ foro.titulo }}</h2>
        <p>{{ foro.descripcion }}</p>
      </div>
    </header>

    <div class="foro-sesion">
      <template v-if="aprendiz">
        <span>👋 Hola, <strong>{{ aprendiz.nombre }}</strong> (@{{ aprendiz.usuario }}) · respondiste {{ respondidas }} de {{ foro.preguntas.length }}</span>
        <button type="button" class="boton-secundario" @click="salir">Salir</button>
      </template>
      <template v-else>
        <p><strong>Para responder, ingresa con tu cuenta o créala.</strong> Leer el foro sí lo puede hacer cualquiera.</p>
        <CuentaAprendiz />
      </template>
    </div>

    <p v-if="cargando" class="foro-estado">Cargando el foro…</p>
    <p v-else-if="errorCarga" class="mensaje-error" role="alert">
      {{ errorCarga }} <button type="button" class="boton-secundario" @click="cargar">Reintentar</button>
    </p>

    <ol v-else class="foro-preguntas">
      <li v-for="(pregunta, indice) in foro.preguntas" :key="pregunta.id" class="foro-pregunta">
        <h3><span class="foro-numero">{{ indice + 1 }}</span> {{ pregunta.texto }}</h3>

        <form
          v-if="aprendiz && !yaRespondio(pregunta.id)"
          class="foro-responder"
          @submit.prevent="responder(pregunta.id)"
        >
          <label :for="`respuesta-${pregunta.id}`" class="solo-lectores">Tu respuesta</label>
          <textarea
            :id="`respuesta-${pregunta.id}`"
            v-model="borradores[pregunta.id]"
            rows="4"
            maxlength="2000"
            placeholder="Escribe tu respuesta…"
          ></textarea>
          <div class="foro-responder-pie">
            <small>{{ (borradores[pregunta.id] || '').length }}/2000</small>
            <button class="boton-primario" type="submit" :disabled="enviando[pregunta.id]">
              {{ enviando[pregunta.id] ? 'Publicando…' : 'Publicar respuesta' }}
            </button>
          </div>
          <p v-if="errores[pregunta.id]" class="mensaje-error" role="alert">{{ errores[pregunta.id] }}</p>
        </form>

        <p class="foro-conteo">
          {{ dePregunta(pregunta.id).length || 'Todavía no hay' }}
          {{ dePregunta(pregunta.id).length === 1 ? 'respuesta' : 'respuestas' }}
          <template v-if="!dePregunta(pregunta.id).length">. ¡Estrénala! 🎉</template>
        </p>
        <div class="foro-respuestas">
          <RespuestaForo
            v-for="respuesta in dePregunta(pregunta.id)"
            :key="respuesta.id"
            :respuesta="respuesta"
            :es-mia="respuesta.usuario === aprendiz?.usuario"
            :es-admin="esAdmin"
            @borrar="borrar(respuesta)"
            @calificar="calificar(respuesta, $event)"
          />
        </div>
      </li>
    </ol>
  </section>
</template>
