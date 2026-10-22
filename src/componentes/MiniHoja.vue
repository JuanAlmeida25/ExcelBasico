<script setup>
// Una hojita de Excel dibujada, para que los ejemplos de teoría se vean como en el programa
const props = defineProps({
  columnas: { type: Array, required: true },
  filas: { type: Array, required: true },
  formula: { type: Object, default: null }
})

const letras = props.columnas.map((_, indice) => String.fromCharCode(65 + indice))

const esObjeto = (celda) => celda !== null && typeof celda === 'object'

function mostrar(celda) {
  const valor = esObjeto(celda) ? celda.v : celda
  // coma decimal como en Excel en español, y sin puntos de miles para no confundir con el valor guardado
  return typeof valor === 'number'
    ? valor.toLocaleString('es-CO', { useGrouping: false, maximumFractionDigits: 2 })
    : valor
}

function clases(celda) {
  if (!esObjeto(celda)) return typeof celda === 'number' ? 'numero' : null
  return [
    celda.tono && `tono-${celda.tono}`,
    celda.activa && 'activa',
    typeof celda.v === 'number' && 'numero'
  ]
}
</script>

<template>
  <div class="mini-hoja">
    <div v-if="formula" class="mini-formula">
      <span class="mini-celda">{{ formula.celda }}</span>
      <span class="mini-fx">fx</span>
      <code>{{ formula.texto }}</code>
    </div>
    <div class="mini-scroll">
      <table>
        <thead>
          <tr>
            <th class="esquina"></th>
            <th v-for="letra in letras" :key="letra">{{ letra }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="fila-encabezado">
            <th>1</th>
            <td v-for="columna in columnas" :key="columna">{{ columna }}</td>
          </tr>
          <tr v-for="(fila, indiceFila) in filas" :key="indiceFila">
            <th>{{ indiceFila + 2 }}</th>
            <td v-for="(celda, indiceCelda) in fila" :key="indiceCelda" :class="clases(celda)">
              {{ mostrar(celda) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
