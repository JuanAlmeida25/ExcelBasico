<script setup>
import { ref } from 'vue'
import PanelAprendices from './PanelAprendices.vue'
import PanelAsistencia from './PanelAsistencia.vue'

// El panel tiene dos partes; cada una pide sus datos cuando se abre
const vistas = [
  { id: 'aprendices', nombre: '👥 Aprendices' },
  { id: 'asistencia', nombre: '✅ Asistencia' }
]
const vista = ref('aprendices')
</script>

<template>
  <section class="panel-profe">
    <header class="panel-cabeza">
      <div>
        <h2><span class="celda">P1</span> 👨‍🏫 Panel del Profe</h2>
        <p>Quién está registrado, quién falta por aprobar y la asistencia de la ficha.</p>
      </div>
    </header>

    <div class="panel-filtros panel-vistas" role="tablist" aria-label="Partes del panel">
      <button
        v-for="v in vistas"
        :key="v.id"
        type="button"
        role="tab"
        class="panel-chip"
        :class="{ activo: vista === v.id }"
        :aria-selected="vista === v.id"
        @click="vista = v.id"
      >{{ v.nombre }}</button>
    </div>

    <PanelAprendices v-if="vista === 'aprendices'" />
    <PanelAsistencia v-else />
  </section>
</template>
