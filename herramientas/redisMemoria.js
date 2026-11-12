// Un Redis de mentiras en memoria que contesta como la API REST de Upstash (traído de Razonar,
// con los comandos de hash que usan los perfiles). Lo usan las pruebas y `npm run dev` (vite.config.js).

export const URL_MEMORIA = 'http://redis.memoria.local'

// El reloj se puede cambiar en las pruebas, para no esperar 15 minutos de verdad a que algo se venza
export function crearRedisMemoria({ reloj = () => Date.now() } = {}) {
  const datos = new Map()
  const vencimientos = new Map()

  // Las llaves vencidas se borran cuando alguien las vuelve a tocar, como hace Redis en el fondo
  function limpiarVencida(llave) {
    if (vencimientos.has(llave) && vencimientos.get(llave) <= reloj()) {
      datos.delete(llave)
      vencimientos.delete(llave)
    }
  }

  function ejecutar([comando, ...args]) {
    const [llave] = args
    if (llave !== undefined) limpiarVencida(llave)
    switch (String(comando).toUpperCase()) {
      case 'GET':
        return typeof datos.get(llave) === 'string' ? datos.get(llave) : null
      case 'SET': {
        const opciones = args.slice(2).map((a) => String(a).toUpperCase())
        if (opciones.includes('NX') && datos.has(llave)) return null
        if (opciones.includes('XX') && !datos.has(llave)) return null
        datos.set(llave, String(args[1]))
        const ex = opciones.indexOf('EX')
        if (ex >= 0) vencimientos.set(llave, reloj() + Number(args[2 + ex + 1]) * 1000)
        else vencimientos.delete(llave)
        return 'OK'
      }
      case 'DEL':
        return args.filter((l) => {
          limpiarVencida(l)
          vencimientos.delete(l)
          return datos.delete(l)
        }).length
      case 'EXISTS':
        return datos.has(llave) ? 1 : 0
      case 'INCR':
      case 'DECR': {
        const nuevo = Number(datos.get(llave) || 0) + (String(comando).toUpperCase() === 'INCR' ? 1 : -1)
        datos.set(llave, String(nuevo))
        return nuevo
      }
      case 'EXPIRE': {
        if (!datos.has(llave)) return 0
        if (String(args[2] || '').toUpperCase() === 'NX' && vencimientos.has(llave)) return 0
        vencimientos.set(llave, reloj() + Number(args[1]) * 1000)
        return 1
      }
      case 'TTL':
        if (!datos.has(llave)) return -2
        return vencimientos.has(llave) ? Math.ceil((vencimientos.get(llave) - reloj()) / 1000) : -1
      case 'SADD': {
        const conjunto = datos.get(llave) instanceof Set ? datos.get(llave) : new Set()
        datos.set(llave, conjunto)
        const antes = conjunto.size
        args.slice(1).forEach((x) => conjunto.add(String(x)))
        return conjunto.size - antes
      }
      case 'SREM': {
        if (!(datos.get(llave) instanceof Set)) return 0
        return args.slice(1).filter((x) => datos.get(llave).delete(String(x))).length
      }
      case 'SMEMBERS':
        return datos.get(llave) instanceof Set ? [...datos.get(llave)] : []
      case 'MGET':
        args.forEach(limpiarVencida)
        return args.map((l) => (typeof datos.get(l) === 'string' ? datos.get(l) : null))
      case 'HGET':
        return datos.get(llave) instanceof Map ? datos.get(llave).get(args[1]) ?? null : null
      case 'HSET': {
        const hash = datos.get(llave) instanceof Map ? datos.get(llave) : new Map()
        datos.set(llave, hash)
        let nuevos = 0
        for (let i = 1; i < args.length; i += 2) {
          if (!hash.has(args[i])) nuevos++
          hash.set(args[i], String(args[i + 1]))
        }
        return nuevos
      }
      case 'HSETNX': {
        const hash = datos.get(llave) instanceof Map ? datos.get(llave) : new Map()
        datos.set(llave, hash)
        if (hash.has(args[1])) return 0
        hash.set(args[1], String(args[2]))
        return 1
      }
      case 'HDEL':
        return datos.get(llave) instanceof Map && datos.get(llave).delete(args[1]) ? 1 : 0
      case 'HLEN':
        return datos.get(llave) instanceof Map ? datos.get(llave).size : 0
      case 'HGETALL':
        return datos.get(llave) instanceof Map ? [...datos.get(llave)].flat() : []
      default:
        throw new Error(`Comando no simulado: ${comando}`)
    }
  }

  // Reemplazo de fetch: lo que vaya a URL_MEMORIA lo contesta este Redis; lo demás sigue normal
  function envolverFetch(fetchOriginal) {
    return async (url, opciones = {}) => {
      if (!String(url).startsWith(URL_MEMORIA)) return fetchOriginal(url, opciones)
      const cuerpo = JSON.parse(opciones.body)
      const resultado = String(url).endsWith('/pipeline')
        ? cuerpo.map((c) => ({ result: ejecutar(c) }))
        : { result: ejecutar(cuerpo) }
      return { ok: true, status: 200, json: async () => resultado }
    }
  }

  return { datos, ejecutar, envolverFetch }
}
