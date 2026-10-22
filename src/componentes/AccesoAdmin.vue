<script setup>
import { ref, nextTick } from 'vue'
import { useSesion } from '../composables/useSesion.js'

const { esAdmin, entrarAdmin, salirAdmin } = useSesion()

const abierto = ref(false)
const clave = ref('')
const error = ref('')
const enviando = ref(false)
const campo = ref(null)

async function abrir() {
  clave.value = ''
  error.value = ''
  abierto.value = true
  await nextTick()
  campo.value?.focus()
}

async function entrar() {
  error.value = ''
  enviando.value = true
  try {
    await entrarAdmin(clave.value)
    abierto.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    clave.value = ''
    enviando.value = false
  }
}
</script>

<template>
  <div class="acceso-admin">
    <template v-if="esAdmin">
      <span class="admin-pill" title="Puedes calificar, borrar respuestas y ver el Panel del Profe">🛡️ Administrador activo</span>
      <button type="button" class="boton-secundario" @click="salirAdmin">Salir de Admin</button>
    </template>
    <button v-else type="button" class="boton-admin" @click="abrir">🔐 Acceso Admin</button>

    <div v-if="abierto" class="modal-fondo" @click.self="abierto = false" @keydown.esc="abierto = false">
      <form class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-admin" @submit.prevent="entrar">
        <h3 id="titulo-admin">Acceso Docente / Administrador</h3>
        <p>Ingresa la clave de administrador para calificar respuestas, moderar el foro y ver el Panel del Profe.</p>
        <label>
          Clave de administrador
          <input ref="campo" v-model="clave" type="password" autocomplete="current-password" required>
        </label>
        <p v-if="error" class="mensaje-error" role="alert">{{ error }}</p>
        <div class="modal-botones">
          <button type="button" class="boton-secundario" @click="abierto = false">Cancelar</button>
          <button type="submit" class="boton-primario" :disabled="enviando">
            {{ enviando ? 'Verificando…' : 'Ingresar como Admin' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
