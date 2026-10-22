// Cliente mínimo para la API REST de Upstash Redis: puro fetch, sin librerías.
// Las carpetas que empiezan por "_" no se vuelven endpoints en Vercel, por eso esto vive en api/_lib.

// Vercel crea KV_REST_API_* al conectar Upstash desde Storage; las UPSTASH_* son por si se conecta a mano
function credenciales() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    const error = new Error('El foro no tiene base de datos conectada todavía.')
    error.status = 503
    throw error
  }
  return { url, token }
}

async function llamar(ruta, cuerpo) {
  const { url, token } = credenciales()
  const respuesta = await fetch(`${url}${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  })
  if (!respuesta.ok) throw new Error(`Redis respondió ${respuesta.status}`)
  return respuesta.json()
}

// Un comando: redis(['GET', 'llave'])
export async function redis(comando) {
  const { result, error } = await llamar('', comando)
  if (error) throw new Error(`Redis: ${error}`)
  return result
}

// Varios comandos en un solo viaje: redisVarios([['INCR', 'a'], ['EXPIRE', 'a', 60]])
export async function redisVarios(comandos) {
  const resultados = await llamar('/pipeline', comandos)
  return resultados.map(({ result, error }) => {
    if (error) throw new Error(`Redis: ${error}`)
    return result
  })
}

// HGETALL devuelve [campo, valor, campo, valor…]; esto lo vuelve un objeto con los valores ya parseados
export function parsearHash(lista) {
  const objeto = {}
  for (let i = 0; i < (lista || []).length; i += 2) objeto[lista[i]] = JSON.parse(lista[i + 1])
  return objeto
}
