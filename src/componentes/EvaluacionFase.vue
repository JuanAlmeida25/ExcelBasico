<script setup>
// El problema con que se cierra cada fase: se lee aquí, se resuelve en Excel y se sube al Drive
import { computed } from 'vue'
import archivos from '../datos/archivos.json'
import SubirDrive from './SubirDrive.vue'

const props = defineProps({
  fase: { type: Object, required: true },
  evaluacion: { type: Object, required: true }
})

const archivo = computed(() => archivos[props.evaluacion.codigo])
const totalPuntos = computed(() => props.evaluacion.requerimientos.reduce((suma, r) => suma + r.puntos, 0))

const rutaDatos = (nombre) => `${import.meta.env.BASE_URL}datos/${nombre}`
</script>

<template>
  <section :id="`fase-${fase.id}-evaluacion`" class="evaluacion-fase">
    <header class="evaluacion-encabezado">
      <span class="evaluacion-sello">{{ evaluacion.codigo }}</span>
      <div>
        <p class="fase-nivel">📝 Evaluación de la Fase {{ fase.id }}</p>
        <h3>{{ evaluacion.titulo }}</h3>
      </div>
    </header>

    <p class="evaluacion-instruccion">
      Lee el problema con calma, descarga el archivo y resuélvelo con lo que aprendiste en las actividades de esta fase.
      Nada de escribir los resultados a mano: <strong>todo lo que se pueda calcular va con fórmula</strong>.
    </p>

    <div class="evaluacion-caso">
      <p><strong>🧩 La situación:</strong> {{ evaluacion.situacion }}</p>
      <p><strong>🎯 Tu misión:</strong> {{ evaluacion.mision }}</p>
    </div>

    <h4 class="evaluacion-subtitulo">Lo que tienes que hacer</h4>
    <ol class="evaluacion-requerimientos">
      <li v-for="requerimiento in evaluacion.requerimientos" :key="requerimiento.titulo">
        <div class="requerimiento-cabeza">
          <strong>{{ requerimiento.titulo }}</strong>
          <span class="requerimiento-puntos">{{ requerimiento.puntos }} pts</span>
        </div>
        <p>{{ requerimiento.detalle }}</p>
        <ul class="chips" aria-label="Herramientas que debes usar">
          <li v-for="herramienta in requerimiento.herramientas" :key="herramienta">{{ herramienta }}</li>
        </ul>
      </li>
    </ol>
    <p class="evaluacion-total">Total: <strong>{{ totalPuntos }} puntos</strong></p>

    <p class="evaluacion-ojo"><strong>⚠️ Ojo:</strong> {{ evaluacion.reglaTecnica }}</p>

    <div v-if="archivo" class="descargas">
      <p class="descargas-nota">El archivo trae el enunciado en la primera hoja y los datos en las demás.</p>
      <a class="boton-excel" :href="rutaDatos(archivo.xlsx)" download>📥 Descargar el problema</a>
      <details class="descargas-csv">
        <summary>o en CSV ({{ archivo.csv.length }})</summary>
        <ul>
          <li v-for="csv in archivo.csv" :key="csv.archivo">
            <a :href="rutaDatos(csv.archivo)" download>{{ csv.hoja }}.csv</a>
          </li>
        </ul>
      </details>
      <p class="solo-impresion">Archivo: {{ archivo.xlsx }}</p>
    </div>

    <SubirDrive class="subir-drive-final" :archivo="`tu solución con el nombre ${evaluacion.entrega}`" />
  </section>
</template>
