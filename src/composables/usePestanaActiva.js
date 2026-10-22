import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// La pestaña vive en el link (#fase-2), así el botón "atrás" funciona y se puede compartir directo.
// También acepta links a algo dentro de una pestaña: #teoria-buscarv abre Teoría y baja hasta BUSCARV.
export function usePestanaActiva(ids, porDefecto) {
  function leerDelLink() {
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (ids.includes(hash)) return { pestana: hash, ancla: null }
    const duena = ids.find((id) => hash.startsWith(`${id}-`))
    return duena ? { pestana: duena, ancla: hash } : { pestana: porDefecto, ancla: null }
  }

  const inicial = leerDelLink()
  const activa = ref(inicial.pestana)
  // lo que va después de la pestaña en el link (#teoria-buscarv → teoria-buscarv), por si alguien lo necesita
  const anclaActiva = ref(inicial.ancla)

  async function irAlLink() {
    const { pestana, ancla } = leerDelLink()
    activa.value = pestana
    anclaActiva.value = ancla
    // hay que esperar a que la pestaña se muestre; con el panel escondido no hay a dónde bajar
    await nextTick()
    const destino = ancla && document.getElementById(ancla)
    if (destino) destino.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
  }

  onMounted(() => {
    window.addEventListener('hashchange', irAlLink)
    if (leerDelLink().ancla) irAlLink()
  })
  onUnmounted(() => window.removeEventListener('hashchange', irAlLink))

  return { activa, ancla: anclaActiva }
}
