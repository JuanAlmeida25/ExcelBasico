# Guía de Actividades Excel · Ficha 3312002

Guía interactiva en Vue 3 + Vite: teoría, actividades por fase con archivos de práctica,
progreso del aprendiz, un foro, asistencia con firma digital y perfil de administrador.
Para ver la guía hay que entrar con documento y PIN (o con la clave de admin).

## Comandos

```bash
npm install
npm run dev      # página + API con un Redis en memoria (se borra al apagar); ADMIN_KEY en .env.local para el admin
vercel dev       # página + API contra el Upstash de verdad, como en producción
npm test         # pruebas con node --test (no necesitan base de datos)
npm run build
python3 scripts/generar_datos.py   # vuelve a generar los .xlsx y .csv de práctica
```

## Inicio de sesión, foro, asistencia y perfil de administrador

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

- **Sin sesión:** solo ve la pantalla de entrada. Ojo: es una puerta de la página; la teoría va en el paquete
  del navegador igual. Lo que sí protege el servidor son el foro, las notas, los registros y la asistencia.
- **Aprendiz:** se registra una vez con nombre, tipo y número de documento, ficha y un PIN de 4 números
  (se guarda cifrado; no se aceptan los facilitos como 1234, 0000 o un año). Su cuenta arranca **pendiente**
  hasta que el profe la aprueba: así nadie se registra con la cédula de otro y firma por él. Ya aprobado,
  en **👤 Mi cuenta** deja su firma una sola vez. Responde cada pregunta del foro una vez y borra la suya; ve su nota. Los compañeros no ven su documento.
  La sesión vive en la pestaña: al cerrarla, se sale solo (pensado para los PC del salón).
  3 PIN malos desde el mismo lugar bloquean ese documento ahí 15 minutos; 10 fallos desde varios lados lo bloquean
  en todas partes. Por IP solo cuentan los fallos (un salón entero entra sin problema) y a los 40 por hora se frena.
- **Administrador:** calificar de 0 a 100 con retroalimentación (aprueba desde 70), borrar cualquier respuesta y,
  en el **Panel del Profe**: notas del foro (CSV), **Aprendices** (✔ aprobar, corregir datos, PIN nuevo, borrar firma o cuenta, CSV)
  y **Asistencia** (casillas por día de clase y la planilla del formato SENA con las firmas, para guardar como PDF;
  solo salen los aprobados). **Salir de Admin** cierra la sesión del admin en todos los equipos, hasta en el del salón.

Los días de la asistencia salen de las fechas de la portada (`src/datos/guia.js`), de lunes a viernes.
El registro y la asistencia son los mismos de Razonar; en Redis van con prefijo `tic:` porque comparten la base.

**Cambio de cuentas (nov. 2026):** antes eran usuario y contraseña (`usuario:*` en Redis). Esas ya no sirven:
cada aprendiz se registra otra vez con su documento. Sus respuestas viejas se quedan en el foro y en el panel
salen como "(sin cuenta)", pero ya no las puede borrar él mismo. Para borrar las cuentas viejas de Redis
(Ley 1581: lo que no se usa no se guarda), una sola vez:

```bash
vercel env pull .env.local
node --env-file=.env.local scripts/limpiar_cuentas_viejas.js              # solo cuenta lo que haría
node --env-file=.env.local scripts/limpiar_cuentas_viejas.js --confirmar  # lo hace de verdad
```

### Seguridad, para tener en cuenta

- `vercel.json` pone un CSP (qué puede cargar y ejecutar la página): solo scripts propios y las fuentes de Google.
  Si agregas algo de otro dominio, hay que agregarlo ahí o el navegador lo bloquea.
- En `npm run dev` la API corre de verdad. Si `.env.local` trae `KV_REST_API_URL`, **le pegas a la base de producción**
  (sale un aviso). Con `vite --host` la API de prueba queda abierta a todo el wifi (también avisa).

Las preguntas del foro están en `src/datos/foro.js`.
