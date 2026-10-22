import { ref, computed, watch } from 'vue'

const CLAVE = 'tic-excel-progreso'

// en modo incógnito o con el almacenamiento bloqueado esto revienta, así que va con casco
function leerGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

export function useProgreso(codigos) {
  const hechas = ref(leerGuardado())

  watch(hechas, (valor) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(valor))
    } catch {
      // si no se pudo guardar, el progreso vive hasta que cierren la pestaña y ya
    }
  }, { deep: true })

  // solo se cuentan códigos que existen, por si quedó basura de una versión vieja de la guía
  const cantidadHechas = computed(() => codigos.filter((codigo) => hechas.value[codigo]).length)
  const porcentaje = computed(() => Math.round((cantidadHechas.value / codigos.length) * 100))

  function alternar(codigo) {
    hechas.value[codigo] = !hechas.value[codigo]
  }

  function reiniciar() {
    hechas.value = {}
  }

  return { hechas, cantidadHechas, porcentaje, alternar, reiniciar }
}
