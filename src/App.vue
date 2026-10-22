<script setup>
import { computed } from 'vue'
import BarraFormulas from './componentes/BarraFormulas.vue'
import PestanasGuia from './componentes/PestanasGuia.vue'
import PortadaGuia from './componentes/PortadaGuia.vue'
import DatosGenerales from './componentes/DatosGenerales.vue'
import MapaNiveles from './componentes/MapaNiveles.vue'
import FaseActividades from './componentes/FaseActividades.vue'
import CriteriosEvaluacion from './componentes/CriteriosEvaluacion.vue'
import EntregableFinal from './componentes/EntregableFinal.vue'
import RecomendacionesDidacticas from './componentes/RecomendacionesDidacticas.vue'
import NotaFinal from './componentes/NotaFinal.vue'
import TeoriaGuia from './componentes/TeoriaGuia.vue'
import { temas } from './datos/teoria.js'
import { useProgreso } from './composables/useProgreso.js'
import { usePestanaActiva } from './composables/usePestanaActiva.js'
import {
  portada,
  datosGenerales,
  fases,
  criterios,
  entregable,
  recomendaciones,
  notaFinal
} from './datos/guia.js'

const codigos = fases.flatMap((fase) => fase.actividades.map((actividad) => actividad.codigo))
const { hechas, cantidadHechas, porcentaje, alternar, reiniciar } = useProgreso(codigos)

const pestanas = computed(() => [
  { id: 'inicio', icono: '🏠', etiqueta: 'Inicio' },
  { id: 'teoria', icono: '📚', etiqueta: 'Teoría' },
  ...fases.map((fase) => {
    const listas = fase.actividades.filter((actividad) => hechas.value[actividad.codigo]).length
    return {
      id: `fase-${fase.id}`,
      icono: fase.icono,
      etiqueta: `Fase ${fase.id}`,
      color: fase.color,
      conteo: `${listas}/${fase.actividades.length}`,
      completa: listas === fase.actividades.length
    }
  }),
  { id: 'evaluacion', icono: '📋', etiqueta: 'Evaluación' },
  { id: 'recomendaciones', icono: '💡', etiqueta: 'Recomendaciones' }
])

const { activa } = usePestanaActiva(pestanas.value.map((pestana) => pestana.id), 'inicio')

// a qué pestaña lleva el botón "Siguiente" al final de cada fase
function siguienteDe(fase) {
  const proxima = fases.find((otra) => otra.id === fase.id + 1)
  return proxima
    ? { id: `fase-${proxima.id}`, etiqueta: `Fase ${proxima.id} · ${proxima.nivel}` }
    : { id: 'evaluacion', etiqueta: 'Evaluación' }
}

function reiniciarConPermiso() {
  if (confirm('¿Seguro que quieres borrar todo tu progreso?')) reiniciar()
}
</script>

<template>
  <div class="cabecera-fija">
    <BarraFormulas
      :hechas="cantidadHechas"
      :total="codigos.length"
      :porcentaje="porcentaje"
      @reiniciar="reiniciarConPermiso"
    />
    <PestanasGuia :pestanas="pestanas" :activa="activa" />
  </div>

  <!-- v-show y no v-if: al imprimir se muestran todos los paneles de una -->
  <div v-show="activa === 'inicio'" class="panel">
    <PortadaGuia :portada="portada" :fases="fases" />
    <main class="contenedor">
      <DatosGenerales :datos="datosGenerales" />
      <MapaNiveles :fases="fases" :hechas="hechas" />
    </main>
  </div>

  <main v-show="activa === 'teoria'" class="panel contenedor contenedor-panel">
    <TeoriaGuia :temas="temas" :fases="fases" />
  </main>

  <main
    v-for="fase in fases"
    v-show="activa === `fase-${fase.id}`"
    :key="fase.id"
    class="panel contenedor contenedor-panel"
  >
    <FaseActividades
      :fase="fase"
      :hechas="hechas"
      :siguiente="siguienteDe(fase)"
      @alternar="alternar"
    />
  </main>

  <main v-show="activa === 'evaluacion'" class="panel contenedor contenedor-panel">
    <CriteriosEvaluacion :criterios="criterios" />
    <EntregableFinal :entregable="entregable" />
  </main>

  <main v-show="activa === 'recomendaciones'" class="panel contenedor contenedor-panel">
    <RecomendacionesDidacticas :recomendaciones="recomendaciones" />
    <NotaFinal :texto="notaFinal" />
  </main>
</template>
