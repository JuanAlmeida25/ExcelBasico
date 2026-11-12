<script setup>
import { ref, watch } from 'vue'
import { useSesion } from '../composables/useSesion.js'
import IngresoAprendiz from './IngresoAprendiz.vue'

// El botón de arriba: la guía se ve sin entrar, la cuenta es para la firma y la asistencia
const { aprendiz, esAdmin } = useSesion()
const abierto = ref(false)

// apenas entra (o se registra) la ventanita sobra
watch(aprendiz, (quien) => {
  if (quien) abierto.value = false
})

const primerNombre = (nombre = '') => nombre.trim().split(/\s+/)[0]
</script>

<template>
  <div v-if="!esAdmin" class="acceso-aprendiz">
    <a v-if="aprendiz" class="boton-secundario boton-cuenta" href="#cuenta" title="Mi cuenta">👤 {{ primerNombre(aprendiz.nombre) }}</a>
    <button v-else type="button" class="boton-primario boton-cuenta" @click="abierto = true">🔑 Entrar</button>

    <!-- Teleport: la barra de arriba tiene backdrop-filter y eso encierra al position: fixed dentro de la barra -->
    <Teleport to="body">
      <div v-if="abierto" class="modal-fondo modal-ingreso" @click.self="abierto = false" @keydown.esc="abierto = false">
        <IngresoAprendiz @cerrar="abierto = false" />
      </div>
    </Teleport>
  </div>
</template>
