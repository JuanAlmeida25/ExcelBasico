<script setup>
defineProps({
  recomendaciones: { type: Array, required: true }
})
</script>

<template>
  <section class="seccion">
    <h2><span class="celda">H8</span> Recomendaciones didácticas</h2>
    <div class="recomendaciones">
      <article v-for="item in recomendaciones" :key="item.titulo" class="tarjeta">
        <span class="recomendacion-icono" aria-hidden="true">{{ item.icono }}</span>
        <h3>{{ item.titulo }}</h3>
        <p>{{ item.texto }}</p>
      </article>
    </div>
  </section>
</template>
