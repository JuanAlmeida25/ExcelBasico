<script setup>
import { computed } from 'vue'
import BarraFormulas from './componentes/BarraFormulas.vue'
import PestanasGuia from './componentes/PestanasGuia.vue'
import PortadaGuia from './componentes/PortadaGuia.vue'
import DatosGenerales from './componentes/DatosGenerales.vue'
import MapaNiveles from './componentes/MapaNiveles.vue'
import FaseActividades from './componentes/FaseActividades.vue'
import CriteriosEvaluacion from './componentes/CriteriosEvaluacion.vue'
import RecomendacionesDidacticas from './componentes/RecomendacionesDidacticas.vue'
import NotaFinal from './componentes/NotaFinal.vue'
import TeoriaGuia from './componentes/TeoriaGuia.vue'
import GuiaWord from './componentes/GuiaWord.vue'
import ForoFase from './componentes/ForoFase.vue'
import EvaluacionFase from './componentes/EvaluacionFase.vue'
import AccesoAdmin from './componentes/AccesoAdmin.vue'
import PanelProfe from './componentes/PanelProfe.vue'
import { temas } from './datos/teoria.js'
import { secciones, temasWord } from './datos/word.js'
import { forosPorFase } from './datos/foro.js'
import evaluaciones from './datos/evaluaciones.json'
import { useSesion } from './composables/useSesion.js'
import { useProgreso } from './composables/useProgreso.js'
import { usePestanaActiva } from './composables/usePestanaActiva.js'
import {
  portada,
  datosGenerales,
  fases,
  criterios,
  recomendaciones,
  notaFinal
} from './datos/guia.js'

const { esAdmin } = useSesion()

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
  { id: 'recomendaciones', icono: '💡', etiqueta: 'Recomendaciones' },
  { id: 'word', icono: '📝', etiqueta: 'Word y normas' },
  // la pestaña del profe solo se pinta con el modo admin activo
  ...(esAdmin.value ? [{ id: 'panel', icono: '👨‍🏫', etiqueta: 'Panel del Profe' }] : [])
])

// 'panel' va siempre en la lista para que el link #panel funcione apenas el profe ingrese
const { activa, ancla } = usePestanaActiva([...pestanas.value.map((pestana) => pestana.id), 'panel'], 'inicio')

// #teoria-buscarv → 'buscarv'; si no hay tema en el link, la teoría arranca con el primero
const temaEnLink = computed(() => (ancla.value?.startsWith('teoria-') ? ancla.value.slice('teoria-'.length) : null))
// lo mismo para Word: #word-apa-citas → 'apa-citas'
const temaWordEnLink = computed(() => (ancla.value?.startsWith('word-') ? ancla.value.slice('word-'.length) : null))

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
    <div class="fila-pestanas">
      <PestanasGuia :pestanas="pestanas" :activa="activa" />
      <AccesoAdmin />
    </div>
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
    <TeoriaGuia :temas="temas" :fases="fases" :tema-activo="temaEnLink" />
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
    >
      <ForoFase v-if="forosPorFase[fase.id]" :fase="fase.id" />
      <EvaluacionFase v-if="evaluaciones[fase.id]" :fase="fase" :evaluacion="evaluaciones[fase.id]" />
    </FaseActividades>
  </main>

  <main v-show="activa === 'evaluacion'" class="panel contenedor contenedor-panel">
    <CriteriosEvaluacion :criterios="criterios" />
  </main>

  <main v-show="activa === 'recomendaciones'" class="panel contenedor contenedor-panel">
    <RecomendacionesDidacticas :recomendaciones="recomendaciones" />
    <NotaFinal :texto="notaFinal" />
  </main>

  <main v-show="activa === 'word'" class="panel contenedor contenedor-panel">
    <GuiaWord :secciones="secciones" :temas="temasWord" :tema-activo="temaWordEnLink" />
  </main>

  <main v-show="activa === 'panel'" class="panel panel-admin contenedor contenedor-panel">
    <!-- v-if: el panel pide los datos frescos cada vez que se abre -->
    <PanelProfe v-if="esAdmin && activa === 'panel'" />
    <p v-else-if="!esAdmin" class="foro-estado">🔐 Esta pestaña es solo para el profe. Ingresa con "Acceso Admin" arriba a la derecha.</p>
  </main>
</template>
