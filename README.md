# Guía de Actividades Excel · Ficha 3312002

Guía interactiva en Vue 3 + Vite: teoría, actividades por fase con archivos de práctica,
progreso del aprendiz y un foro con cuentas y perfil de administrador.

## Comandos

```bash
npm install
npm run dev      # solo la página, sin foro (Vite no corre la carpeta api/)
vercel dev       # página + API del foro, como en producción
npm test         # pruebas con node --test (no necesitan base de datos)
npm run build
python3 scripts/generar_datos.py   # vuelve a generar los .xlsx y .csv de práctica
```

## Foro y perfil de administrador

La API vive en `api/` (funciones de Vercel) y guarda todo en **Upstash Redis**.

| Variable | Para qué | Cómo se pone |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Conexión a Redis | Vercel → Storage → Upstash for Redis → conectar al proyecto (se crean solas) |
| `SESION_SECRETO` | Firma las sesiones (mínimo 32 caracteres) | `openssl rand -hex 32 \| vercel env add SESION_SECRETO production` |
| `ADMIN_KEY` | Clave del profe para "🔐 Acceso Admin" | `vercel env add ADMIN_KEY production` |

- **No hay clave de administrador por defecto:** sin `ADMIN_KEY`, el modo admin queda apagado.
- Para trabajar en local con las variables de Vercel: `vercel env pull .env.local` y luego `vercel dev`.
- Después de agregar o cambiar variables hay que volver a desplegar (un push a `main` basta).

### Qué puede hacer cada quien

- **Cualquiera:** leer el foro.
- **Aprendiz con cuenta:** responder cada pregunta una vez y borrar su propia respuesta. Ve su nota y la retroalimentación.
- **Administrador:** calificar de 0 a 100 con retroalimentación (aprueba desde 70), borrar cualquier respuesta,
  ver el **Panel del Profe**, exportar las notas a CSV y borrar cuentas (para quien olvidó la contraseña;
  sus respuestas se conservan si se vuelve a registrar con el mismo usuario).

Las preguntas del foro están en `src/datos/foro.js`.
