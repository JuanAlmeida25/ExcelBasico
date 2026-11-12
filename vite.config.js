import { randomBytes } from 'node:crypto'
import { readdirSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crearRedisMemoria, URL_MEMORIA } from './herramientas/redisMemoria.js'

// En `npm run dev` corren los mismos endpoints de api/ que en Vercel (copiado de Razonar).
// Sin esto, la puerta de entrada no deja pasar a nadie en local, porque Vite solito no corre api/.
// Sin ADMIN_KEY en .env.local el modo admin queda apagado, igualito que en producción.
function apiLocal(entorno) {
  return {
    name: 'api-local',
    configureServer(servidor) {
      for (const nombre of ['ADMIN_KEY', 'SESION_SECRETO', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']) {
        if (entorno[nombre] && !process.env[nombre]) process.env[nombre] = entorno[nombre]
      }
      // Firma de sesiones al azar en cada arranque: nada de secretos escritos en el código
      if (!process.env.SESION_SECRETO) process.env.SESION_SECRETO = randomBytes(32).toString('hex')
      // Sin Upstash configurado, un Redis en memoria (se borra al apagar el servidor)
      if (!process.env.KV_REST_API_URL) {
        process.env.KV_REST_API_URL = URL_MEMORIA
        process.env.KV_REST_API_TOKEN = 'local'
        globalThis.fetch = crearRedisMemoria().envolverFetch(globalThis.fetch)
      } else {
        // Ojo: con el KV de .env.local, lo que hagas en local queda en la base de datos de producción
        servidor.config.logger.warn('⚠️  Usando el Redis de KV_REST_API_URL: lo que hagas aquí queda en la base de datos de VERDAD.')
      }
      if (servidor.config.server.host) {
        servidor.config.logger.warn('⚠️  El servidor está abierto a la red (--host): cualquiera en el wifi del salón puede usar esta API de prueba.')
      }
      if (!process.env.ADMIN_KEY) {
        servidor.config.logger.warn('⚠️  Sin ADMIN_KEY en .env.local: el modo admin queda apagado en local.')
      }

      const endpoints = readdirSync(new URL('./api', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3))

      servidor.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const nombre = url.pathname.match(/^\/api\/([\w-]+)$/)?.[1]
        if (!nombre) return next()
        if (!endpoints.includes(nombre)) {
          res.statusCode = 404
          return res.end(JSON.stringify({ error: 'Endpoint no encontrado' }))
        }

        // Tope de 1 MB, como Vercel (una firma pesa ~10 KB): que nadie tumbe el servidor local con un cuerpo gigante
        let texto = ''
        for await (const pedazo of req) {
          texto += pedazo
          if (texto.length > 1_000_000) {
            res.statusCode = 413
            return res.end(JSON.stringify({ error: 'Lo que mandaste pesa demasiado.' }))
          }
        }
        let cuerpo
        try {
          cuerpo = texto ? JSON.parse(texto) : undefined
        } catch {
          cuerpo = undefined
        }

        // Lo mínimo del req/res de Vercel que usan los endpoints
        // x-forwarded-for se reescribe con la IP real de la conexión: en Vercel lo hace la plataforma,
        // y si no, cualquiera se inventa una IP por petición y se salta los límites de intentos
        const headers = { ...req.headers, 'x-forwarded-for': req.socket?.remoteAddress || 'local' }
        const reqVercel = { method: req.method, headers, query: Object.fromEntries(url.searchParams), body: cuerpo, socket: req.socket }
        const resVercel = {
          setHeader: (n, v) => res.setHeader(n, v),
          status(codigo) {
            res.statusCode = codigo
            return this
          },
          json(valor) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(valor))
            return this
          },
        }
        try {
          // ssrLoadModule recarga el endpoint si cambias el archivo, sin reiniciar el servidor
          const { default: manejador } = await servidor.ssrLoadModule(`/api/${nombre}.js`)
          await manejador(reqVercel, resVercel)
        } catch (error) {
          console.error(error)
          resVercel.status(500).json({ error: 'Error en el servidor local.' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [vue(), apiLocal(loadEnv(mode, process.cwd(), ''))],
  // rutas relativas para que el build abra hasta desde una USB
  base: './'
}))
