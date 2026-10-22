<script setup>
defineProps({
  pestanas: { type: Array, required: true },
  activa: { type: String, required: true }
})
</script>

<template>
  <nav class="pestanas-guia" aria-label="Secciones de la guía">
    <a
      v-for="pestana in pestanas"
      :key="pestana.id"
      :href="`#${pestana.id}`"
      class="pestana-guia"
      :class="{ activa: pestana.id === activa, completa: pestana.completa }"
      :style="pestana.color ? { '--color-nivel': pestana.color } : null"
      :aria-current="pestana.id === activa ? 'page' : null"
    >
      <span aria-hidden="true">{{ pestana.icono }}</span>
      {{ pestana.etiqueta }}
      <small v-if="pestana.conteo" class="pestana-conteo">{{ pestana.completa ? '✔' : pestana.conteo }}</small>
    </a>
  </nav>
</template>
