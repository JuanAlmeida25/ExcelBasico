<script setup>
const props = defineProps({
  fases: { type: Array, required: true },
  hechas: { type: Object, required: true }
})

function hechasEnFase(fase) {
  return fase.actividades.filter((actividad) => props.hechas[actividad.codigo]).length
}
</script>

<template>
  <nav class="mapa-niveles" aria-label="Niveles de la guía">
    <a
      v-for="fase in fases"
      :key="fase.id"
      class="nivel"
      :class="{ completo: hechasEnFase(fase) === fase.actividades.length }"
      :href="`#fase-${fase.id}`"
      :style="{ '--color-nivel': fase.color }"
    >
      <span class="nivel-icono">{{ fase.icono }}</span>
      <span class="nivel-nombre">Nivel {{ fase.id }} · {{ fase.nivel }}</span>
      <span class="nivel-conteo">{{ hechasEnFase(fase) }}/{{ fase.actividades.length }}</span>
    </a>
  </nav>
</template>
