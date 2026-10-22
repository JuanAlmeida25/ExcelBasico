<script setup>
import { computed } from 'vue'

const props = defineProps({
  criterios: { type: Array, required: true }
})

// las barras se miden contra el criterio más pesado; si no, un 35% se ve flaquito
const pesoMaximo = computed(() => Math.max(...props.criterios.map((item) => item.ponderacion)))
</script>

<template>
  <section class="seccion">
    <h2><span class="celda">F6</span> Criterios de evaluación</h2>
    <ul class="criterios">
      <li v-for="item in criterios" :key="item.criterio" class="criterio">
        <div class="criterio-texto">
          <strong>{{ item.criterio }}</strong>
          <span>{{ item.evidencia }}</span>
        </div>
        <div class="criterio-barra" aria-hidden="true">
          <div :style="{ width: (item.ponderacion / pesoMaximo) * 100 + '%' }"></div>
        </div>
        <span class="criterio-peso">{{ item.ponderacion }}%</span>
      </li>
    </ul>
  </section>
</template>
