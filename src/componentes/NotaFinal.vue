<script setup>
defineProps({
  texto: { type: String, required: true }
})
</script>

<template>
  <aside class="nota">
    <span class="nota-icono" aria-hidden="true">💡</span>
    <div>
      <strong>Nota final</strong>
      <p>{{ texto }}</p>
    </div>
  </aside>
</template>
