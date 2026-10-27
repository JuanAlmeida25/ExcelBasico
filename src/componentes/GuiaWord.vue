<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  secciones: { type: Array, required: true },
  temas: { type: Array, required: true },
  temaActivo: { type: String, default: null }
})

const busqueda = ref('')

// igual que en Teoría: un tema a la vez, el del link o el primero
const idActivo = computed(() =>
  props.temas.some((tema) => tema.id === props.temaActivo) ? props.temaActivo : props.temas[0].id
)
const indiceActivo = computed(() => props.temas.findIndex((tema) => tema.id === idActivo.value))
const anterior = computed(() => props.temas[indiceActivo.value - 1] || null)
const siguiente = computed(() => props.temas[indiceActivo.value + 1] || null)

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const textoBuscable = Object.fromEntries(props.temas.map((tema) => [
  tema.id,
  normalizar([tema.titulo, tema.resumen, ...(tema.terminos || []).map((t) => t.termino)].join(' '))
]))

const visibles = computed(() => {
  const consulta = normalizar(busqueda.value.trim())
  return new Set(props.temas.filter((tema) => !consulta || textoBuscable[tema.id].includes(consulta)).map((tema) => tema.id))
})

const seccionDe = (id) => props.secciones.find((seccion) => seccion.id === id)

const grupos = computed(() => props.secciones.map((seccion) => ({
  seccion,
  temas: props.temas.filter((tema) => tema.seccion === seccion.id && visibles.value.has(tema.id))
})).filter((grupo) => grupo.temas.length))
</script>

<template>
  <section class="teoria guia-word">
    <header class="teoria-encabezado">
      <h2><span class="celda">W1</span> Documentos en Word</h2>
      <p>Cómo armar un informe bien presentado en Word y las normas de escritura que más piden: APA 7 e ICONTEC. Escoge una norma y no la mezcles.</p>
    </header>

    <div class="teoria-cuerpo">
      <aside class="teoria-indice">
        <label class="buscador">
          <span aria-hidden="true">🔍</span>
          <input v-model="busqueda" type="search" placeholder="Buscar tema o norma…" aria-label="Buscar en la guía de Word">
        </label>

        <nav aria-label="Temas de Word y normas">
          <div v-for="grupo in grupos" :key="grupo.seccion.id" class="indice-grupo" :style="{ '--color-nivel': grupo.seccion.color }">
            <p class="indice-fase">{{ grupo.seccion.icono }} {{ grupo.seccion.titulo }}</p>
            <a
              v-for="tema in grupo.temas"
              :key="tema.id"
              :href="`#word-${tema.id}`"
              :class="{ activo: tema.id === idActivo }"
              :aria-current="tema.id === idActivo ? 'page' : null"
            >{{ tema.titulo }}</a>
          </div>
          <p v-if="!grupos.length" class="sin-resultados">Nada con "{{ busqueda }}". Prueba con otra palabra 🤔</p>
        </nav>
      </aside>

      <div class="teoria-temas">
        <article
          v-for="tema in temas"
          v-show="tema.id === idActivo"
          :id="`word-${tema.id}`"
          :key="tema.id"
          class="tema"
          :style="{ '--color-nivel': seccionDe(tema.seccion).color }"
        >
          <header class="tema-encabezado">
            <span class="tema-icono" aria-hidden="true">{{ tema.icono }}</span>
            <div>
              <p class="fase-nivel">{{ seccionDe(tema.seccion).titulo }}</p>
              <h3>{{ tema.titulo }}</h3>
              <p class="tema-resumen">{{ tema.resumen }}</p>
            </div>
          </header>

          <div class="tema-bloque">
            <h4>¿Qué es?</h4>
            <p v-html="tema.queEs"></p>
          </div>

          <div class="tema-bloque">
            <h4>¿Para qué sirve?</h4>
            <ul class="lista-check">
              <li v-for="uso in tema.paraQue" :key="uso" v-html="uso"></li>
            </ul>
          </div>

          <div v-if="tema.terminos" class="tema-bloque">
            <h4>Reglas y conceptos</h4>
            <dl class="terminos">
              <div v-for="item in tema.terminos" :key="item.termino">
                <dt>{{ item.termino }}</dt>
                <dd v-html="item.definicion"></dd>
              </div>
            </dl>
          </div>

          <div v-if="tema.sintaxis" class="tema-bloque">
            <h4>¿Cómo se escribe?</h4>
            <div v-for="sintaxis in tema.sintaxis" :key="sintaxis.formula" class="sintaxis">
              <code class="sintaxis-formula">{{ sintaxis.formula }}</code>
              <ul>
                <li v-for="parte in sintaxis.partes" :key="parte.nombre">
                  <code>{{ parte.nombre }}</code> <span v-html="parte.explicacion"></span>
                </li>
              </ul>
            </div>
          </div>

          <div v-if="tema.pasos" class="tema-bloque">
            <h4>Paso a paso</h4>
            <ol class="pasos">
              <li v-for="paso in tema.pasos" :key="paso" v-html="paso"></li>
            </ol>
          </div>

          <div v-if="tema.tabla" class="tema-bloque">
            <h4>Comparación</h4>
            <div class="tabla-normas">
              <table>
                <thead>
                  <tr><th v-for="columna in tema.tabla.columnas" :key="columna">{{ columna }}</th></tr>
                </thead>
                <tbody>
                  <tr v-for="fila in tema.tabla.filas" :key="fila[0]">
                    <td v-for="(celda, i) in fila" :key="i">{{ celda }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="tema.ejemplos" class="tema-bloque">
            <h4>Ejemplo</h4>
            <figure v-for="ejemplo in tema.ejemplos" :key="ejemplo.titulo" class="ejemplo">
              <figcaption>{{ ejemplo.titulo }}</figcaption>
              <div class="comparar" :class="{ solo: !ejemplo.mal }">
                <div class="muestra muestra-bien">
                  <span class="muestra-etiqueta">✅ Así sí</span>
                  <div v-html="ejemplo.bien"></div>
                </div>
                <div v-if="ejemplo.mal" class="muestra muestra-mal">
                  <span class="muestra-etiqueta">❌ Así no</span>
                  <div v-html="ejemplo.mal"></div>
                </div>
              </div>
              <p v-if="ejemplo.nota" class="ejemplo-nota">{{ ejemplo.nota }}</p>
            </figure>
          </div>

          <div class="tema-bloque">
            <h4>Errores comunes</h4>
            <ul class="lista-errores">
              <li v-for="error in tema.errores" :key="error" v-html="error"></li>
            </ul>
          </div>

          <div v-if="tema.atajos" class="tema-bloque">
            <h4>Atajos</h4>
            <ul class="atajos">
              <li v-for="atajo in tema.atajos" :key="atajo.teclas">
                <kbd>{{ atajo.teclas }}</kbd> <span>{{ atajo.accion }}</span>
              </li>
            </ul>
          </div>

          <nav class="tema-navegacion" aria-label="Otros temas">
            <a v-if="anterior" :href="`#word-${anterior.id}`" class="tema-anterior">← {{ anterior.titulo }}</a>
            <a v-if="siguiente" :href="`#word-${siguiente.id}`" class="tema-siguiente">{{ siguiente.titulo }} →</a>
          </nav>
        </article>
      </div>
    </div>
  </section>
</template>
