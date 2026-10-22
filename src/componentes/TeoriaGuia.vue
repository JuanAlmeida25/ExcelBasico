<script setup>
import { ref, computed } from 'vue'
import MiniHoja from './MiniHoja.vue'

const props = defineProps({
  temas: { type: Array, required: true },
  fases: { type: Array, required: true },
  temaActivo: { type: String, default: null }
})

const busqueda = ref('')

// se muestra un solo tema a la vez: el del link, o el primero si el link no trae ninguno (o trae uno inventado)
const idActivo = computed(() =>
  props.temas.some((tema) => tema.id === props.temaActivo) ? props.temaActivo : props.temas[0].id
)
const indiceActivo = computed(() => props.temas.findIndex((tema) => tema.id === idActivo.value))
const anterior = computed(() => props.temas[indiceActivo.value - 1] || null)
const siguiente = computed(() => props.temas[indiceActivo.value + 1] || null)

// sin tildes ni mayúsculas, para que "buscarv" encuentre "BUSCARV" y "funcion" encuentre "Función"
const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const textoBuscable = Object.fromEntries(props.temas.map((tema) => [
  tema.id,
  normalizar([
    tema.titulo,
    tema.resumen,
    ...(tema.sintaxis || []).map((s) => s.formula),
    ...(tema.terminos || []).map((t) => t.termino)
  ].join(' '))
]))

const visibles = computed(() => {
  const consulta = normalizar(busqueda.value.trim())
  if (!consulta) return new Set(props.temas.map((tema) => tema.id))
  return new Set(props.temas.filter((tema) => textoBuscable[tema.id].includes(consulta)).map((tema) => tema.id))
})

const faseDe = (id) => props.fases.find((fase) => fase.id === id)

const grupos = computed(() => props.fases.map((fase) => ({
  fase,
  temas: props.temas.filter((tema) => tema.fase === fase.id && visibles.value.has(tema.id))
})).filter((grupo) => grupo.temas.length))

const faseDeActividad = (codigo) => codigo.split('.')[0]
</script>

<template>
  <section class="teoria">
    <header class="teoria-encabezado">
      <h2><span class="celda">T1</span> Teoría de Excel</h2>
      <p>Todo lo que necesitas saber para las actividades, tema por tema. Léelo antes de practicar o vuelve cuando te enredes.</p>
    </header>

    <div class="teoria-cuerpo">
      <aside class="teoria-indice">
        <label class="buscador">
          <span aria-hidden="true">🔍</span>
          <input v-model="busqueda" type="search" placeholder="Buscar tema o función…" aria-label="Buscar en la teoría">
        </label>

        <nav aria-label="Temas de teoría">
          <div v-for="grupo in grupos" :key="grupo.fase.id" class="indice-grupo" :style="{ '--color-nivel': grupo.fase.color }">
            <p class="indice-fase">{{ grupo.fase.icono }} Fase {{ grupo.fase.id }} · {{ grupo.fase.nivel }}</p>
            <a
              v-for="tema in grupo.temas"
              :key="tema.id"
              :href="`#teoria-${tema.id}`"
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
          :id="`teoria-${tema.id}`"
          :key="tema.id"
          class="tema"
          :style="{ '--color-nivel': faseDe(tema.fase).color }"
        >
          <header class="tema-encabezado">
            <span class="tema-icono" aria-hidden="true">{{ tema.icono }}</span>
            <div>
              <p class="fase-nivel">Fase {{ tema.fase }} · {{ faseDe(tema.fase).nivel }}</p>
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
            <h4>Conceptos clave</h4>
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

          <div v-if="tema.ejemplos" class="tema-bloque">
            <h4>Ejemplo</h4>
            <figure v-for="ejemplo in tema.ejemplos" :key="ejemplo.titulo" class="ejemplo">
              <figcaption>{{ ejemplo.titulo }}</figcaption>
              <MiniHoja :columnas="ejemplo.columnas" :filas="ejemplo.filas" :formula="ejemplo.formula" />
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

          <footer class="tema-practica">
            <span>✍️ Practícalo en:</span>
            <a
              v-for="codigo in tema.actividades"
              :key="codigo"
              :href="`#fase-${faseDeActividad(codigo)}-${codigo}`"
            >Actividad {{ codigo }} →</a>
          </footer>

          <nav class="tema-navegacion" aria-label="Otros temas">
            <a v-if="anterior" :href="`#teoria-${anterior.id}`" class="tema-anterior">← {{ anterior.titulo }}</a>
            <a v-if="siguiente" :href="`#teoria-${siguiente.id}`" class="tema-siguiente">{{ siguiente.titulo }} →</a>
          </nav>
        </article>
      </div>
    </div>
  </section>
</template>
