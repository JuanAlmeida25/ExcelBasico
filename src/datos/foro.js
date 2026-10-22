// Preguntas del foro por fase. Lo usa la página y también la API (api/foro.js),
// así nadie puede publicar en una pregunta que no existe.

export const forosPorFase = {
  1: {
    titulo: 'Foro de la Fase 1',
    descripcion: 'Responde cada pregunta con tus palabras y con lo que te pasó en tus archivos. Lee lo que escribieron tus compañeros: de los errores ajenos también se aprende.',
    preguntas: [
      { id: 'f1-p1', texto: '¿Cuál es la diferencia entre un libro, una hoja, una celda y un rango? Da un ejemplo con tu Registro_SIG.xlsx.' },
      { id: 'f1-p2', texto: '¿Por qué una fecha escrita como texto no sirve para calcular? ¿Te pasó en tu archivo? ¿Cómo te diste cuenta?' },
      { id: 'f1-p3', texto: '¿Qué regla de formato condicional usaste para resaltar el proceso sin responsable, y por qué escogiste esa?' },
      { id: 'f1-p4', texto: 'Con tus palabras: ¿cuándo usas $B$2 y cuándo B2? ¿Qué pasó cuando copiaste la fórmula sin el $?' },
      { id: 'f1-p5', texto: '¿Qué fue lo más difícil de la Fase 1 y cómo lo resolviste?' }
    ]
  }
}

export const idsPreguntas = Object.values(forosPorFase).flatMap((foro) => foro.preguntas.map((p) => p.id))

// Desde 70 se aprueba, igual que en el foro de Licenciamiento
export const NOTA_APROBATORIA = 70
