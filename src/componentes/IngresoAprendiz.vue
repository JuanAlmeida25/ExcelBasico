<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useSesion } from '../composables/useSesion.js'
import { TIPOS_DOCUMENTO } from '../datos/tiposDocumento.js'
import { portada } from '../datos/guia.js'
import { pinTrivial, MENSAJE_PIN_TRIVIAL } from '../utils/pin.js'

// La puerta de la guía: sin entrar con documento y PIN no se ve nada (salvo el profe con su clave)
const { registrar, entrar } = useSesion()

const modo = ref('entrar')
const nombre = ref('')
const documento = ref('')
const ficha = ref(portada.ficha)
const tipoDocumento = ref('')
const pin = ref('')
const pinOtraVez = ref('')
const error = ref('')
const enviando = ref(false)

// Cuando el servidor bloquea la cuenta, se muestra la cuenta regresiva hasta que se pueda volver a intentar
const bloqueadoHasta = ref(0)
const ahora = ref(Date.now())
let reloj = null
const segundosBloqueo = computed(() => Math.max(0, Math.ceil((bloqueadoHasta.value - ahora.value) / 1000)))
const cuentaRegresiva = computed(() => {
  const s = segundosBloqueo.value
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

function arrancarReloj() {
  clearInterval(reloj)
  reloj = setInterval(() => {
    ahora.value = Date.now()
    if (!segundosBloqueo.value) {
      clearInterval(reloj)
      error.value = ''
    }
  }, 1000)
}
onBeforeUnmount(() => clearInterval(reloj))

// Solo números: en el celular sale el teclado numérico y si pegan con espacios o puntos, se limpian
const soloNumeros = (valor, largo) => valor.replace(/\D/g, '').slice(0, largo)

function cambiarModo(nuevo) {
  modo.value = nuevo
  error.value = ''
  pin.value = ''
  pinOtraVez.value = ''
}

function validar() {
  if (modo.value === 'registro') {
    if (nombre.value.trim().length < 5 || !nombre.value.trim().includes(' ')) return 'Escribe tu nombre completo (nombre y apellido).'
    if (!tipoDocumento.value) return 'Escoge tu tipo de documento.'
  }
  if (documento.value.length < 6) return 'Escribe tu número de documento (mínimo 6 números).'
  if (!/^\d{4}$/.test(pin.value)) return 'El PIN son 4 números.'
  if (modo.value === 'registro' && pinTrivial(pin.value)) return MENSAJE_PIN_TRIVIAL
  if (modo.value === 'registro' && pin.value !== pinOtraVez.value) return 'Los dos PIN no son iguales. Escríbelos otra vez.'
  return ''
}

async function enviar() {
  error.value = validar()
  if (error.value) return
  enviando.value = true
  try {
    if (modo.value === 'registro') {
      await registrar({ nombre: nombre.value, documento: documento.value, tipoDocumento: tipoDocumento.value, ficha: ficha.value, pin: pin.value })
      // recién registrado le falta la firma: que caiga directo en "Mi cuenta".
      // Va con el hash y no con un emit: apenas hay sesión esta puerta se desmonta y el aviso se perdería
      window.location.hash = 'cuenta'
    } else {
      await entrar(documento.value, pin.value)
    }
  } catch (e) {
    error.value = e.message
    if (e.datos?.bloqueado) {
      bloqueadoHasta.value = e.datos.bloqueadoHasta
      ahora.value = Date.now()
      arrancarReloj()
    }
  } finally {
    pin.value = ''
    pinOtraVez.value = ''
    enviando.value = false
  }
}
</script>

<template>
  <section class="ingreso">
    <p class="ingreso-icono" aria-hidden="true">📗</p>
    <h1>{{ portada.titulo }} · {{ portada.herramienta }}</h1>
    <p class="ingreso-sub">Ficha {{ portada.ficha }} · {{ portada.programa }}</p>
    <p>Para ver la guía, entra con tu <strong>documento</strong> y tu <strong>PIN de 4 números</strong>. ¿Primera vez? Regístrate, es un minuto.</p>

    <div class="cuenta-modos" role="tablist" aria-label="Entrar o registrarse">
      <button type="button" role="tab" :aria-selected="modo === 'entrar'" :class="{ activo: modo === 'entrar' }" @click="cambiarModo('entrar')">
        🔑 Ya tengo cuenta
      </button>
      <button type="button" role="tab" :aria-selected="modo === 'registro'" :class="{ activo: modo === 'registro' }" @click="cambiarModo('registro')">
        📋 Es mi primera vez
      </button>
    </div>

    <form class="cuenta-formulario" novalidate @submit.prevent="enviar">
      <label v-if="modo === 'registro'">
        Nombre completo
        <input v-model="nombre" autocomplete="name" maxlength="80" placeholder="Ej.: Laura Gómez Pushaina">
      </label>

      <label v-if="modo === 'registro'">
        Tipo de documento
        <select v-model="tipoDocumento">
          <option value="" disabled>Escoge uno…</option>
          <option v-for="t in TIPOS_DOCUMENTO" :key="t.valor" :value="t.valor">{{ t.texto }}</option>
        </select>
      </label>

      <label>
        Número de documento
        <input
          :value="documento"
          inputmode="numeric"
          autocomplete="username"
          placeholder="Solo números"
          @input="documento = soloNumeros($event.target.value, 15); $event.target.value = documento"
        >
      </label>

      <label v-if="modo === 'registro'">
        Ficha
        <input
          :value="ficha"
          inputmode="numeric"
          @input="ficha = soloNumeros($event.target.value, 12); $event.target.value = ficha"
        >
      </label>

      <div class="ingreso-pines" :class="{ doble: modo === 'registro' }">
        <label>
          {{ modo === 'registro' ? 'Inventa un PIN de 4 números' : 'Tu PIN' }}
          <input
            :value="pin"
            type="password"
            inputmode="numeric"
            :autocomplete="modo === 'registro' ? 'new-password' : 'current-password'"
            maxlength="4"
            placeholder="••••"
            class="ingreso-pin"
            @input="pin = soloNumeros($event.target.value, 4); $event.target.value = pin"
          >
        </label>
        <label v-if="modo === 'registro'">
          Escríbelo otra vez
          <input
            :value="pinOtraVez"
            type="password"
            inputmode="numeric"
            autocomplete="new-password"
            maxlength="4"
            placeholder="••••"
            class="ingreso-pin"
            @input="pinOtraVez = soloNumeros($event.target.value, 4); $event.target.value = pinOtraVez"
          >
        </label>
      </div>

      <p v-if="modo === 'registro'" class="cuenta-ayuda">
        🤫 Nada de 1234 ni tu cumpleaños, y no se lo digas a nadie: con tu PIN, otro podría responder el foro por ti.
        Si se te olvida, el profe te da uno nuevo.
      </p>
      <p v-else class="cuenta-ayuda">Tienes 3 intentos. Si fallas los 3, tu cuenta se bloquea 15 minutos.</p>

      <div v-if="segundosBloqueo" class="ingreso-bloqueo" role="alert">
        <strong>🔒 Cuenta bloqueada</strong>
        <p>{{ error }}</p>
        <p>Podrás intentar de nuevo en <strong class="ingreso-reloj">{{ cuentaRegresiva }}</strong></p>
      </div>
      <p v-else-if="error" class="mensaje-error" role="alert">{{ error }}</p>

      <button type="submit" class="boton-primario" :disabled="enviando || segundosBloqueo > 0">
        {{ enviando ? 'Un momentico…' : modo === 'registro' ? '📋 Registrarme' : '🔑 Entrar' }}
      </button>
    </form>

    <p class="cuenta-ayuda ingreso-aviso">
      Antes había cuentas con usuario y contraseña: esas ya no sirven. Regístrate otra vez con tu documento.
    </p>
  </section>
</template>
