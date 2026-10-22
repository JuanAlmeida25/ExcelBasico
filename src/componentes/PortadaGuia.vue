<script setup>
defineProps({
  portada: { type: Object, required: true },
  fases: { type: Array, required: true }
})

const columnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
</script>

<template>
  <header class="portada">
    <div class="encabezado-columnas" aria-hidden="true">
      <span v-for="letra in columnas" :key="letra">{{ letra }}</span>
    </div>

    <div class="portada-contenido">
      <p class="etiqueta">SENA · Ficha {{ portada.ficha }}</p>
      <h1>{{ portada.titulo }}<span>en {{ portada.herramienta }}</span></h1>
      <p class="portada-competencia">{{ portada.competencia }}</p>
      <p class="portada-programa">{{ portada.programa }}</p>

      <ul class="fichas-datos">
        <li><strong>{{ portada.duracion }}</strong><span>de trabajo</span></li>
        <li><strong>{{ fases.length }} fases</strong><span>de básico a matrices</span></li>
        <li><strong>{{ fases.reduce((suma, fase) => suma + fase.actividades.length, 0) }}</strong><span>actividades</span></li>
      </ul>
    </div>
  </header>
</template>
