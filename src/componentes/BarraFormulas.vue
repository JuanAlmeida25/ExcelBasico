<script setup>
import { computed } from 'vue'

const props = defineProps({
  hechas: { type: Number, required: true },
  total: { type: Number, required: true },
  porcentaje: { type: Number, required: true }
})

defineEmits(['reiniciar'])

const mensaje = computed(() => {
  if (props.hechas === 0) return 'Arranca por la 1.1 👇'
  if (props.hechas === props.total) return '¡Coronaste! 🎉'
  return `Llevas ${props.hechas} de ${props.total} 💪`
})
</script>

<template>
  <div class="barra-formulas" role="status">
    <div class="cuadro-nombre">A1</div>
    <div class="fx">fx</div>
    <code class="formula">=APRENDER("Excel"; "SIG")</code>

    <div class="progreso">
      <span class="progreso-texto">{{ mensaje }}</span>
      <div
        class="progreso-pista"
        role="progressbar"
        :aria-valuenow="porcentaje"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Progreso de actividades"
      >
        <div class="progreso-relleno" :style="{ width: porcentaje + '%' }"></div>
      </div>
      <strong class="progreso-numero">{{ porcentaje }}%</strong>
      <button
        v-if="hechas > 0"
        class="boton-reiniciar"
        type="button"
        title="Borrar progreso"
        @click="$emit('reiniciar')"
      >↺</button>
    </div>
  </div>
</template>
