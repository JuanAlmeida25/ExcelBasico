<script setup>
import { ref, computed } from 'vue'
import SubirDrive from './SubirDrive.vue'

const props = defineProps({
  entregable: { type: Object, required: true }
})

const indiceActivo = ref(0)
const hojaActiva = computed(() => props.entregable.hojas[indiceActivo.value])
</script>

<template>
  <section class="seccion">
    <h2><span class="celda">G7</span> Entregable final</h2>
    <p>
      Un libro de Excel llamado <code class="archivo">{{ entregable.archivo }}</code>
      con, como mínimo, estas hojas. Dale clic a cada pestaña 👇
    </p>

    <div class="libro">
      <div class="libro-hoja" role="tabpanel">
        <p class="libro-fase">{{ hojaActiva.fase }}</p>
        <h3>{{ hojaActiva.nombre }}</h3>
        <p>{{ hojaActiva.descripcion }}</p>
      </div>

      <div class="pestanas" role="tablist">
        <button
          v-for="(hoja, indice) in entregable.hojas"
          :key="hoja.nombre"
          type="button"
          role="tab"
          class="pestana"
          :class="{ activa: indice === indiceActivo }"
          :aria-selected="indice === indiceActivo"
          @click="indiceActivo = indice"
        >{{ hoja.nombre }}</button>
      </div>
    </div>

    <SubirDrive class="subir-drive-final" :archivo="`el libro ${entregable.archivo}`" />

    <!-- en papel no hay clics, así que se imprimen todas de una -->
    <ol class="solo-impresion">
      <li v-for="hoja in entregable.hojas" :key="hoja.nombre">
        <code>{{ hoja.nombre }}</code> ({{ hoja.fase }}): {{ hoja.descripcion }}
      </li>
    </ol>
  </section>
</template>
