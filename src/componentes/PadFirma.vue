<script setup>
import { ref, onMounted } from 'vue'

// Un recuadro para firmar con el dedo (celular) o con el mouse. Sin librerías: un canvas y eventos de puntero
const lienzo = ref(null)
const vacio = ref(true)
let contexto = null
let dibujando = false
// Hasta dónde llegó la firma, para recortarla y que en la planilla llene bien la casilla
let caja = null

const ANCHO = 600
const ALTO = 220

onMounted(() => {
  // Se dibuja al doble de resolución para que no salga pixelada al imprimir
  lienzo.value.width = ANCHO * 2
  lienzo.value.height = ALTO * 2
  contexto = lienzo.value.getContext('2d')
  contexto.scale(2, 2)
  contexto.lineWidth = 2.6
  contexto.lineCap = 'round'
  contexto.lineJoin = 'round'
  contexto.strokeStyle = '#0b1f4d'
})

function punto(evento) {
  const marco = lienzo.value.getBoundingClientRect()
  return { x: ((evento.clientX - marco.left) / marco.width) * ANCHO, y: ((evento.clientY - marco.top) / marco.height) * ALTO }
}

function estirarCaja({ x, y }) {
  caja = caja ? { x1: Math.min(caja.x1, x), y1: Math.min(caja.y1, y), x2: Math.max(caja.x2, x), y2: Math.max(caja.y2, y) } : { x1: x, y1: y, x2: x, y2: y }
}

function empezar(evento) {
  evento.preventDefault()
  lienzo.value.setPointerCapture(evento.pointerId)
  dibujando = true
  const p = punto(evento)
  contexto.beginPath()
  contexto.moveTo(p.x, p.y)
  // Un toquecito también deja marca (el punto de la i)
  contexto.lineTo(p.x + 0.1, p.y + 0.1)
  contexto.stroke()
  estirarCaja(p)
}

function mover(evento) {
  if (!dibujando) return
  evento.preventDefault()
  const p = punto(evento)
  contexto.lineTo(p.x, p.y)
  contexto.stroke()
  estirarCaja(p)
  vacio.value = false
}

function terminar() {
  dibujando = false
}

function limpiar() {
  contexto.clearRect(0, 0, ANCHO, ALTO)
  caja = null
  vacio.value = true
}

// Devuelve la firma recortada a lo que se dibujó, en PNG con fondo transparente
function aImagen() {
  if (vacio.value || !caja) return null
  const margen = 6
  const x = Math.max(0, caja.x1 - margen) * 2
  const y = Math.max(0, caja.y1 - margen) * 2
  const ancho = Math.min(ANCHO * 2 - x, (caja.x2 - caja.x1 + margen * 2) * 2)
  const alto = Math.min(ALTO * 2 - y, (caja.y2 - caja.y1 + margen * 2) * 2)
  const recorte = document.createElement('canvas')
  recorte.width = ancho
  recorte.height = alto
  recorte.getContext('2d').drawImage(lienzo.value, x, y, ancho, alto, 0, 0, ancho, alto)
  return recorte.toDataURL('image/png')
}

defineExpose({ limpiar, aImagen, vacio })
</script>

<template>
  <div class="pad">
    <canvas
      ref="lienzo"
      class="lienzo"
      role="img"
      aria-label="Recuadro para dibujar tu firma con el dedo o el mouse"
      @pointerdown="empezar"
      @pointermove="mover"
      @pointerup="terminar"
      @pointercancel="terminar"
      @pointerleave="terminar"
    ></canvas>
    <span v-if="vacio" class="guia" aria-hidden="true">Firma aquí ✍️</span>
    <span class="linea" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.pad {
  position: relative;
  border: 2px dashed var(--borde);
  border-radius: 14px;
  background: white;
  aspect-ratio: 600 / 220;
  width: 100%;
  max-width: 600px;
}

.lienzo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Sin esto, en el celular al firmar se mueve la página en vez de dibujar */
  touch-action: none;
  cursor: crosshair;
}

.guia {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--texto-suave);
  font-weight: 700;
  pointer-events: none;
}

.linea {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 22%;
  border-bottom: 1.5px solid var(--borde);
  pointer-events: none;
}
</style>
