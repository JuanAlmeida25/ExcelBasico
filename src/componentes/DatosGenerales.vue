<script setup>
defineProps({
  datos: { type: Object, required: true }
})
</script>

<template>
  <section class="seccion">
    <h2><span class="celda">A1</span> Datos generales</h2>
    <div class="datos-generales">
      <article class="tarjeta">
        <h3>🧠 Competencia</h3>
        <p>{{ datos.competencia }}</p>
      </article>
      <article class="tarjeta tarjeta-ancha">
        <h3>🏁 Resultado de aprendizaje esperado</h3>
        <p>{{ datos.resultado }}</p>
      </article>
      <article class="tarjeta">
        <h3>⏱️ Duración estimada</h3>
        <p>{{ datos.duracion }}</p>
      </article>
    </div>
  </section>
</template>
