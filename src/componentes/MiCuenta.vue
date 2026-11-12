<script setup>
import { ref } from 'vue'
import PadFirma from './PadFirma.vue'
import { useSesion } from '../composables/useSesion.js'
import { TIPOS_DOCUMENTO } from '../datos/tiposDocumento.js'

// Los datos del aprendiz y lo que le falta: el tipo de documento y la firma para la planilla de asistencia
const { aprendiz, completarPerfil, actualizar, salir, atenderError } = useSesion()

const pad = ref(null)
const tipoPendiente = ref('')
const error = ref('')
const guardando = ref(false)
const revisando = ref(false)

async function revisar() {
  revisando.value = true
  error.value = ''
  try {
    await actualizar()
    if (!aprendiz.value?.aprobado) error.value = 'Todavía no. Díselo al profe y vuelve a revisar.'
  } catch (e) {
    error.value = e.message
  } finally {
    revisando.value = false
  }
}

async function guardar(datos) {
  error.value = ''
  guardando.value = true
  try {
    await completarPerfil(datos)
  } catch (e) {
    atenderError(e)
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

function guardarTipo() {
  if (!tipoPendiente.value) {
    error.value = 'Escoge tu tipo de documento.'
    return
  }
  guardar({ tipoDocumento: tipoPendiente.value })
}

function guardarFirma() {
  const firma = pad.value?.aImagen()
  if (!firma) {
    error.value = 'Primero dibuja tu firma en el recuadro.'
    return
  }
  if (!confirm('¿Guardar esta firma? Solo se hace una vez y es la que va a salir en la planilla de asistencia.')) return
  guardar({ firma })
}
</script>

<template>
  <section v-if="aprendiz" class="mi-cuenta">
    <h2>👤 Mi cuenta</h2>
    <p class="cuenta-ayuda">Con tu sesión abierta, el foro sabe quién eres y el profe te pone la asistencia.</p>

    <dl class="mi-cuenta-datos">
      <div><dt>Nombre</dt><dd>{{ aprendiz.nombre }}</dd></div>
      <div><dt>Documento</dt><dd>{{ aprendiz.tipoDocumento }} {{ aprendiz.documento }}</dd></div>
      <div v-if="aprendiz.ficha"><dt>Ficha</dt><dd>{{ aprendiz.ficha }}</dd></div>
      <div><dt>Cuenta</dt><dd>{{ aprendiz.aprobado ? '✔ Aprobada' : '⏳ Pendiente' }}</dd></div>
      <div><dt>Firma</dt><dd>{{ aprendiz.tieneFirma ? '✔ Guardada' : 'Falta' }}</dd></div>
    </dl>

    <div v-if="!aprendiz.tipoDocumento" class="mi-cuenta-pendiente">
      <h3>🪪 Falta tu tipo de documento</h3>
      <p>Lo pide la planilla de asistencia del SENA.</p>
      <label class="solo-lectores" for="tipo-pendiente">Tipo de documento</label>
      <select id="tipo-pendiente" v-model="tipoPendiente">
        <option value="" disabled>Escoge uno…</option>
        <option v-for="t in TIPOS_DOCUMENTO" :key="t.valor" :value="t.valor">{{ t.texto }}</option>
      </select>
      <button type="button" class="boton-primario" :disabled="guardando" @click="guardarTipo">Guardar</button>
    </div>

    <div v-if="!aprendiz.aprobado" class="mi-cuenta-pendiente">
      <h3>⏳ Tu cuenta está pendiente</h3>
      <p>
        El profe tiene que aprobarla en clase (así nadie se registra con la cédula de otro). Mientras tanto ya puedes ver la guía
        y responder el foro; la firma y la asistencia se habilitan cuando te aprueben.
      </p>
      <button type="button" class="boton-secundario" :disabled="revisando" @click="revisar">
        {{ revisando ? 'Revisando…' : '🔄 ¿Ya me aprobaron?' }}
      </button>
    </div>

    <div v-else-if="!aprendiz.tieneFirma" class="mi-cuenta-pendiente">
      <h3>✍️ Falta tu firma</h3>
      <p>Fírmate una sola vez, como en tu documento. El profe la pone en la planilla de asistencia los días que vengas.</p>
      <PadFirma ref="pad" />
      <div class="mi-cuenta-botones">
        <button type="button" class="boton-secundario" @click="pad?.limpiar()">🧽 Borrar y repetir</button>
        <button type="button" class="boton-primario" :disabled="guardando" @click="guardarFirma">
          {{ guardando ? 'Guardando…' : '💾 Guardar mi firma' }}
        </button>
      </div>
    </div>
    <p v-if="error" class="mensaje-error" role="alert">{{ error }}</p>

    <p class="cuenta-ayuda">¿Un dato mal escrito o la firma quedó chueca? Díselo al profe y te lo corrige.</p>
    <div class="mi-cuenta-botones">
      <a class="boton-primario" href="#inicio">Ir a la guía →</a>
      <button type="button" class="boton-secundario" @click="salir">🚪 Salir</button>
    </div>
    <p class="cuenta-ayuda">Si estás en un computador del salón, dale <strong>Salir</strong> al terminar. Igual se cierra solo al cerrar la pestaña.</p>
  </section>
</template>
