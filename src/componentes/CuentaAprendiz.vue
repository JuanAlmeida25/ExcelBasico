<script setup>
import { ref, reactive } from 'vue'
import { useSesion } from '../composables/useSesion.js'

const { registrar, ingresar } = useSesion()

const modo = ref('ingresar') // o 'registro'
const datos = reactive({ usuario: '', nombre: '', clave: '', repetir: '' })
const error = ref('')
const enviando = ref(false)

function cambiarModo(nuevo) {
  modo.value = nuevo
  error.value = ''
}

async function enviar() {
  error.value = ''
  if (modo.value === 'registro' && datos.clave !== datos.repetir) {
    error.value = 'Las dos contraseñas no coinciden.'
    return
  }
  enviando.value = true
  try {
    if (modo.value === 'registro') {
      await registrar({ usuario: datos.usuario, nombre: datos.nombre, clave: datos.clave })
    } else {
      await ingresar({ usuario: datos.usuario, clave: datos.clave })
    }
    datos.clave = ''
    datos.repetir = ''
  } catch (e) {
    error.value = e.message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="cuenta">
    <div class="cuenta-modos" role="tablist">
      <button
        type="button"
        role="tab"
        :class="{ activo: modo === 'ingresar' }"
        :aria-selected="modo === 'ingresar'"
        @click="cambiarModo('ingresar')"
      >Ya tengo cuenta</button>
      <button
        type="button"
        role="tab"
        :class="{ activo: modo === 'registro' }"
        :aria-selected="modo === 'registro'"
        @click="cambiarModo('registro')"
      >Crear cuenta</button>
    </div>

    <form class="cuenta-formulario" @submit.prevent="enviar">
      <label>
        Usuario
        <input v-model="datos.usuario" type="text" autocomplete="username" autocapitalize="none" required>
      </label>
      <label v-if="modo === 'registro'">
        Nombre completo
        <input v-model="datos.nombre" type="text" autocomplete="name" required>
      </label>
      <label>
        Contraseña
        <input
          v-model="datos.clave"
          type="password"
          :autocomplete="modo === 'registro' ? 'new-password' : 'current-password'"
          required
        >
      </label>
      <label v-if="modo === 'registro'">
        Repite la contraseña
        <input v-model="datos.repetir" type="password" autocomplete="new-password" required>
      </label>

      <p v-if="modo === 'registro'" class="cuenta-ayuda">
        Usuario sin tildes ni espacios (por ejemplo, <code>juan.perez</code>). Contraseña de al menos 6 caracteres:
        apúntala, porque si se te olvida le toca al profe borrarte la cuenta para que la crees otra vez.
      </p>
      <p v-if="error" class="mensaje-error" role="alert">{{ error }}</p>

      <button class="boton-primario" type="submit" :disabled="enviando">
        {{ enviando ? 'Un momento…' : modo === 'registro' ? 'Crear mi cuenta' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>
