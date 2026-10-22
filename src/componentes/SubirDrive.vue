<script setup>
import { drive } from '../datos/guia.js'

defineProps({
  archivo: { type: String, default: 'el archivo de la evidencia' }
})
</script>

<template>
  <div class="subir-drive">
    <p>
      <strong>📤 Dónde subirla:</strong> en el Drive compartido, añade {{ archivo }}
      dentro de la carpeta con tu nombre.
    </p>
    <a
      v-if="drive.enlace"
      class="boton-drive"
      :href="drive.enlace"
      target="_blank"
      rel="noopener"
    >Abrir Drive compartido ↗</a>
    <span v-else class="drive-pendiente">⏳ El link del Drive todavía no está listo</span>
    <span v-if="drive.enlace" class="solo-impresion">{{ drive.enlace }}</span>
  </div>
</template>
