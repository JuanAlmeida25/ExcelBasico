<script setup>
import { ref, computed } from 'vue'
import { estadoNota } from '../utils/panel.js'

const props = defineProps({
  respuesta: { type: Object, required: true },
  esMia: { type: Boolean, default: false },
  esAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['borrar', 'calificar'])

const calificando = ref(false)
const nota = ref(props.respuesta.calificacion ?? '')
const retro = ref(props.respuesta.retroalimentacion || '')

const calificada = computed(() => props.respuesta.calificacion !== null && props.respuesta.calificacion !== undefined)
// la nota solo la ven el autor y el profe; entre compañeros no hace falta andar comparando
const verNota = computed(() => calificada.value && (props.esMia || props.esAdmin))
const estado = computed(() => estadoNota(props.respuesta.calificacion))

const fecha = computed(() =>
  new Date(props.respuesta.creado).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
)

function abrirCalificar() {
  nota.value = props.respuesta.calificacion ?? ''
  retro.value = props.respuesta.retroalimentacion || ''
  calificando.value = true
}

function guardarNota() {
  emit('calificar', { calificacion: Number(nota.value), retroalimentacion: retro.value })
  calificando.value = false
}
</script>

<template>
  <article class="respuesta" :class="{ mia: esMia }">
    <header class="respuesta-cabeza">
      <span class="respuesta-avatar" aria-hidden="true">{{ respuesta.nombre.charAt(0).toUpperCase() }}</span>
      <div>
        <strong>{{ respuesta.nombre }}</strong>
        <span class="respuesta-usuario">@{{ respuesta.usuario }}<template v-if="esMia"> · tú</template></span>
      </div>
      <time :datetime="respuesta.creado">{{ fecha }}</time>
    </header>

    <!-- texto plano a propósito: nada de v-html con lo que escriben los aprendices -->
    <p class="respuesta-texto">{{ respuesta.texto }}</p>

    <div v-if="verNota" class="respuesta-nota" :class="estado">
      <span class="estado-tag" :class="estado">
        ⭐ {{ respuesta.calificacion }}/100 · {{ estado === 'aprobado' ? 'Aprobado' : 'No aprobado' }}
      </span>
      <p v-if="respuesta.retroalimentacion">{{ respuesta.retroalimentacion }}</p>
    </div>

    <form v-if="calificando" class="calificar" @submit.prevent="guardarNota">
      <label>
        Nota (0 a 100)
        <input v-model="nota" type="number" min="0" max="100" step="1" required>
      </label>
      <label>
        Retroalimentación
        <textarea v-model="retro" rows="3" maxlength="1000" placeholder="Qué estuvo bien y qué le falta…"></textarea>
      </label>
      <div class="calificar-botones">
        <button type="button" class="boton-secundario" @click="calificando = false">Cancelar</button>
        <button type="submit" class="boton-primario">Guardar nota</button>
      </div>
    </form>

    <footer v-if="esAdmin || esMia" class="respuesta-acciones">
      <button v-if="esAdmin && !calificando" type="button" class="boton-secundario" @click="abrirCalificar">
        ⭐ {{ calificada ? 'Cambiar nota' : 'Calificar' }}
      </button>
      <button type="button" class="boton-peligro" @click="emit('borrar')">
        🗑️ {{ esAdmin && !esMia ? 'Borrar (Admin)' : 'Borrar mi respuesta' }}
      </button>
    </footer>
  </article>
</template>
