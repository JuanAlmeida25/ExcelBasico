<script setup>
// Un solo componente para las 4 fases: copiar y pegar tablas es cosa del siglo pasado
import archivos from '../datos/archivos.json'
import SubirDrive from './SubirDrive.vue'
import { temasPorActividad } from '../datos/teoria.js'

defineProps({
  fase: { type: Object, required: true },
  hechas: { type: Object, required: true },
  siguiente: { type: Object, default: null }
})

defineEmits(['alternar'])

// BASE_URL es './' (ver vite.config.js), así los links sirven aunque la guía viva en una subcarpeta
const rutaDatos = (nombre) => `${import.meta.env.BASE_URL}datos/${nombre}`
</script>

<template>
  <section class="seccion fase" :style="{ '--color-nivel': fase.color }">
    <header class="fase-encabezado">
      <span class="fase-icono" aria-hidden="true">{{ fase.icono }}</span>
      <div>
        <p class="fase-nivel">Fase {{ fase.id }} · Nivel {{ fase.nivel.toLowerCase() }} · {{ fase.horas }} horas</p>
        <h2><span class="celda">{{ fase.celda }}</span> {{ fase.titulo }}</h2>
      </div>
    </header>
    <p class="fase-objetivo"><strong>Objetivo:</strong> {{ fase.objetivo }}</p>
    <p class="empresa-ficticia">
      🏭 Los archivos de práctica son de <strong>Lácteos del Caribe S.A.S.</strong>, una empresa inventada para la guía.
    </p>

    <div class="rejilla-actividades">
      <article
        v-for="actividad in fase.actividades"
        :id="`fase-${fase.id}-${actividad.codigo}`"
        :key="actividad.codigo"
        class="actividad"
        :class="{ hecha: hechas[actividad.codigo] }"
      >
        <div class="actividad-cabeza">
          <span class="actividad-codigo">{{ actividad.codigo }}</span>
          <label class="marcar">
            <input
              type="checkbox"
              :checked="!!hechas[actividad.codigo]"
              @change="$emit('alternar', actividad.codigo)"
            >
            <span>{{ hechas[actividad.codigo] ? '¡Hecha!' : 'Marcar' }}</span>
          </label>
        </div>

        <h3>{{ actividad.nombre }}</h3>
        <p v-html="actividad.descripcion"></p>

        <div v-if="temasPorActividad[actividad.codigo]" class="ver-teoria">
          <span>📚 Teoría:</span>
          <a v-for="tema in temasPorActividad[actividad.codigo]" :key="tema.id" :href="`#teoria-${tema.id}`">
            {{ tema.titulo }}
          </a>
        </div>

        <ul v-if="actividad.formulas.length" class="chips" aria-label="Fórmulas y atajos">
          <li v-for="formula in actividad.formulas" :key="formula">{{ formula }}</li>
        </ul>

        <div v-if="archivos[actividad.codigo]" class="descargas">
          <p class="descargas-nota">{{ archivos[actividad.codigo].nota }}</p>
          <a class="boton-excel" :href="rutaDatos(archivos[actividad.codigo].xlsx)" download>
            📥 Descargar Excel
          </a>
          <details class="descargas-csv">
            <summary>o en CSV ({{ archivos[actividad.codigo].csv.length }})</summary>
            <ul>
              <li v-for="csv in archivos[actividad.codigo].csv" :key="csv.archivo">
                <a :href="rutaDatos(csv.archivo)" download>{{ csv.hoja }}.csv</a>
              </li>
            </ul>
          </details>
          <p class="solo-impresion">Archivo: {{ archivos[actividad.codigo].xlsx }}</p>
        </div>

        <div class="evidencia">
          <p><strong>📎 Evidencia:</strong> <span v-html="actividad.evidencia"></span></p>
          <SubirDrive />
        </div>
      </article>
    </div>

    <!-- aquí entra el foro de la fase, si tiene -->
    <slot />

    <a v-if="siguiente" class="boton-siguiente" :href="`#${siguiente.id}`">
      Siguiente: {{ siguiente.etiqueta }} →
    </a>
  </section>
</template>
