// Aquí vive todo el contenido de la guía. Si cambia una actividad, se toca aquí y no en los componentes.
// Los textos con <code> se pintan con v-html; son datos nuestros, nada que venga de la calle.

export const portada = {
  titulo: 'Guía de Actividades',
  competencia: 'Utilizar herramientas informáticas de acuerdo con las necesidades de manejo de información',
  programa: 'Coordinación en Sistemas Integrados de Gestión',
  ficha: '3312002',
  herramienta: 'Microsoft Excel',
  // iso para la máquina, texto para la gente
  fechas: {
    inicio: { iso: '2026-10-22', texto: '22 oct' },
    fin: { iso: '2026-11-26', texto: '26 nov' },
    anio: '2026'
  }
}

// Pega aquí el link de la carpeta compartida (en Drive: Compartir > Copiar enlace).
// Mientras esté vacío, la página avisa que el link está pendiente en vez de mandar a la nada.
export const drive = {
  enlace: 'https://drive.google.com/drive/folders/1vSFhs7-mpUMmQPbNZfEc3TpfSbUuf-pN?usp=sharing'
}

export const datosGenerales = {
  competencia: 'Utilizar herramientas informáticas de acuerdo con las necesidades de manejo de información.',
  resultado: 'Al finalizar la guía, el aprendiz estará en capacidad de registrar, procesar, analizar y presentar información propia de un Sistema Integrado de Gestión (SIG), utilizando Excel desde operaciones básicas hasta la construcción de matrices de diagnóstico, riesgos, responsabilidades e indicadores.',
  duracion: '24 horas distribuidas en 4 fases de 6 horas cada una.'
}

// celda: la "dirección" decorativa de cada sección, como si la guía fuera una hoja de Excel
export const fases = [
  {
    id: 1,
    celda: 'B2',
    nivel: 'Básico',
    icono: '🌱',
    color: '#107c41',
    titulo: 'Fundamentos de Excel y registro de información',
    horas: 6,
    objetivo: 'Reconocer el entorno de Excel y realizar operaciones básicas de registro y formato de datos.',
    actividades: [
      {
        codigo: '1.1',
        nombre: 'Explorando el entorno de Excel',
        descripcion: 'Identificar libros, hojas, celdas, rangos, filas y columnas. Navegar por la cinta de opciones y personalizar la barra de acceso rápido.',
        evidencia: 'Mapa conceptual del entorno de Excel.',
        formulas: []
      },
      {
        codigo: '1.2',
        nombre: 'Registro de datos del SIG',
        descripcion: 'Crear un libro llamado <code>Registro_SIG.xlsx</code> con tres hojas: <code>Procesos</code>, <code>Documentos</code> y <code>Responsables</code>. Ingresar datos alfanuméricos y numéricos básicos (nombre del proceso, código del documento, fecha, versión).',
        evidencia: 'Archivo <code>Registro_SIG.xlsx</code> con datos ingresados.',
        formulas: []
      },
      {
        codigo: '1.3',
        nombre: 'Formatos de celda y formato condicional básico',
        descripcion: 'Aplicar formatos de fecha, número y texto. Usar formato condicional para resaltar documentos vencidos o procesos sin responsable asignado.',
        evidencia: 'Hoja con formatos aplicados y reglas condicionales funcionales.',
        formulas: []
      },
      {
        codigo: '1.4',
        nombre: 'Fórmulas y funciones elementales',
        descripcion: 'Calcular el costo de elaboración multiplicando las horas por la tarifa fija (<code>$B$2</code>) y obtener el total, promedio y cantidad de documentos en una sola hoja.',
        evidencia: 'Hoja <code>Presupuesto_SIG</code> con fórmulas de costo y resumen operando correctamente.',
        formulas: ['=SUMA()', '=PROMEDIO()', '=CONTAR()', '$B$2']
      }
    ]
  },
  {
    id: 2,
    celda: 'C3',
    nivel: 'Intermedio',
    icono: '⚙️',
    color: '#0e7490',
    titulo: 'Funciones lógicas, búsqueda y tablas',
    horas: 6,
    objetivo: 'Aplicar funciones de búsqueda y lógicas para consolidar información y generar reportes sencillos.',
    actividades: [
      {
        codigo: '2.1',
        nombre: 'Función SI y SI anidada: Control de vigencias y criticidad',
        descripcion: 'Evaluar vencimientos y clasificar la prioridad de acción mediante <code>=SI()</code> anidada y fechas límite. Sigue los parámetros y el problema detallado en la hoja <code>Enunciado_Caso</code> del archivo.',
        evidencia: 'Hoja <code>Control_Vigencias</code> con días restantes, estados y prioridades funcionando.',
        formulas: ['=SI()', '=Y()', '$B$2', '<', '<=']
      },
      {
        codigo: '2.2',
        nombre: 'BUSCARV / BUSCARX: Consolidación relacional de auditoría',
        descripcion: 'Unificar las 3 fuentes de datos con <code>BUSCARV</code> o <code>BUSCARX</code>, blindando con <code>SI.ERROR</code> para que procesos sin responsable no generen <code>#N/D</code>. Revisa las directrices en <code>Enunciado_Caso</code>.',
        evidencia: 'Consolidado relacional completo y formateado sin errores <code>#N/D</code>.',
        formulas: ['=BUSCARV()', '=BUSCARX()', '=SI.ERROR()', 'FALSO / 0']
      },
      {
        codigo: '2.3',
        nombre: 'Tablas de datos, filtros y subtotales dinámicos',
        descripcion: 'Convertir datos crudos a tabla oficial (Ctrl+T), usar referencias estructuradas (<code>[@Campo]</code>), activar subtotales y resolver los 3 retos de auditoría planteados en la hoja <code>Consultas_Auditoria</code>.',
        evidencia: 'Tabla estructurada con subtotales activos y respuestas a las consultas de auditoría.',
        formulas: ['Ctrl+T', '=SUBTOTALES()', '[@Columna]']
      },
      {
        codigo: '2.4',
        nombre: 'Gráficos básicos para informes: Dashboard ejecutivo',
        descripcion: 'Construir tablas de frecuencias con <code>=CONTAR.SI()</code> e insertar dos gráficos ejecutivos formateados (columnas por proceso y circular de estados) según las instrucciones de <code>Enunciado_Caso</code>.',
        evidencia: 'Dos gráficos vinculados a tablas de frecuencias formuladas, con títulos y etiquetas claras.',
        formulas: ['=CONTAR.SI()']
      }
    ]
  },
  {
    id: 3,
    celda: 'D4',
    nivel: 'Avanzado',
    icono: '📊',
    color: '#7c3aed',
    titulo: 'Análisis de datos y tablas dinámicas',
    horas: 6,
    objetivo: 'Utilizar tablas dinámicas y funciones avanzadas para analizar información del SIG y construir indicadores sencillos.',
    actividades: [
      {
        codigo: '3.1',
        nombre: 'Tabla dinámica: Diagnóstico multidimensional de madurez',
        descripcion: 'Construir una tabla dinámica jerárquica, configurar la vista porcentual como % del total de filas, insertar segmentadores de datos (slicers) y responder al diagnóstico gerencial en la hoja <code>Diagnostico_Dinamico</code>.',
        evidencia: 'Tabla dinámica jerárquica con vista porcentual, segmentadores y diagnóstico redactado.',
        formulas: ['Tabla dinámica', 'Jerarquía de filas', '% de filas', 'Slicers']
      },
      {
        codigo: '3.2',
        nombre: 'Funciones estadísticas condicionales con protección de error',
        descripcion: 'Estructurar el tablero de eficiencia con <code>CONTAR.SI</code>, <code>CONTAR.SI.CONJUNTO</code> y <code>PROMEDIO.SI</code>. Resolver el reto técnico de Gestión ambiental (0 documentos) aplicando <code>SI.ERROR</code> para evitar <code>#¡DIV/0!</code>.',
        evidencia: 'Tablero de métricas formulado y 100% protegido contra divisiones por cero.',
        formulas: ['=CONTAR.SI()', '=CONTAR.SI.CONJUNTO()', '=PROMEDIO.SI()', '=SI.ERROR()']
      },
      {
        codigo: '3.3',
        nombre: 'Matriz de indicadores básica y semáforo de metas',
        descripcion: 'Construir la matriz de control calculando brechas (Resultado - Meta), evaluando con <code>=SI()</code> anidada y aplicando formato condicional con semáforos de 3 niveles según las reglas de tolerancia del archivo.',
        evidencia: 'Matriz de indicadores con brechas, evaluación cualitativa y semáforos funcionales.',
        formulas: ['=Resultado - Meta', '=SI() anidado', 'Formato condicional']
      },
      {
        codigo: '3.4',
        nombre: 'Validación de datos y aseguramiento de calidad',
        descripcion: 'Blindar el formulario de captura con validaciones de lista, fechas, enteros y longitud de texto con alertas tipo Detener. Auditar y corregir los 8 registros defectuosos en <code>Auditoria_Registros</code> usando círculos de invalidez.',
        evidencia: 'Formulario con validación activa, mensajes de alto y hoja de auditoría corregida.',
        formulas: ['Validación de datos', 'Listas desplegables', 'Rodear datos no válidos']
      }
    ]
  },
  {
    id: 4,
    celda: 'E5',
    nivel: 'Matrices',
    icono: '🧩',
    color: '#ea580c',
    titulo: 'Construcción de matrices propias de un SIG',
    horas: 6,
    objetivo: 'Diseñar y construir en Excel matrices fundamentales para la coordinación de un Sistema Integrado de Gestión, integrando los conocimientos de las fases anteriores.',
    actividades: [
      {
        codigo: '4.1',
        nombre: 'Matriz de identificación y caracterización de procesos',
        descripcion: 'Integrar los 10 procesos corporativos desde 4 fuentes, calculando cobertura documental con <code>CONTAR.SI</code> y alertando en rojo procesos con 0 documentos mediante formato condicional con fórmula (<code>=$E2=0</code>).',
        evidencia: 'Matriz de procesos completa con fórmulas relacionales, conteo y alerta condicional.',
        formulas: ['=BUSCARV()', '=CONTAR.SI()', 'Formato condicional con fórmula']
      },
      {
        codigo: '4.2',
        nombre: 'Matriz de riesgos: Probabilidad × Impacto cuantitativa',
        descripcion: 'Construir la matriz cuantitativa de riesgos calculando severidad (P × I), clasificando en 4 niveles (Bajo a Extremo) con fórmula y aplicando semáforo de 4 colores. Resolver el caso detallado en <code>Enunciado_Caso</code>.',
        evidencia: 'Matriz de riesgos con escalas validadas (1-5), cálculo automático, 4 colores y controles.',
        formulas: ['=Probabilidad*Impacto', '=SI() anidado / BUSCARV', 'Formato condicional 4 colores']
      },
      {
        codigo: '4.3',
        nombre: 'Matriz RACI: Gobernanza y auditoría de duplicidad',
        descripcion: 'Construir la matriz RACI restringiendo celdas a R, A, C, I y programar la fórmula de auditoría de gobernanza (exactamente una "A" por actividad) para detectar y corregir conflictos de autoridad del caso.',
        evidencia: 'Matriz RACI completa con validación, 4 colores y fórmula de auditoría sin errores.',
        formulas: ['=CONTAR.SI(rango; "A")', '=SI() anidado', 'Validación R;A;C;I']
      },
      {
        codigo: '4.4',
        nombre: 'Matriz de seguimiento a indicadores: Cuadro de mando',
        descripcion: 'Construir el Dashboard Gerencial calculando % de cumplimiento, tendencias con símbolos (▲, ▼, ―), 3 tarjetas KPI ejecutivas y gráfico comparativo Meta vs. Resultado, siguiendo las especificaciones de <code>Enunciado_Caso</code>.',
        evidencia: 'Dashboard ejecutivo con tarjetas KPI, semáforos, tendencias y gráfico comparativo.',
        formulas: ['=T3 / Meta', '=SI() anidado para tendencias', '=PROMEDIO()', '=CONTAR.SI()']
      }
    ]
  }
]

export const criterios = [
  { criterio: 'Manejo correcto del entorno y registro de datos', ponderacion: 15, evidencia: 'Fase 1 completa' },
  { criterio: 'Aplicación de funciones lógicas y búsqueda', ponderacion: 20, evidencia: 'Fase 2 completa' },
  { criterio: 'Uso de tablas dinámicas y análisis de datos', ponderacion: 20, evidencia: 'Fase 3 completa' },
  { criterio: 'Construcción de matrices SIG con formato condicional y validación', ponderacion: 35, evidencia: 'Fase 4 completa (matriz de riesgos y RACI)' },
  { criterio: 'Presentación y claridad de la información', ponderacion: 10, evidencia: 'Todos los archivos entregados' }
]

export const entregable = {
  archivo: 'SIG_Excel_Coordinacion_Ficha3312002.xlsx',
  hojas: [
    { nombre: 'Registro_SIG', fase: 'Fase 1', descripcion: 'Las hojas Procesos, Documentos y Responsables con sus datos, formatos y fórmulas básicas.' },
    { nombre: 'Consolidado', fase: 'Fase 2', descripcion: 'Documento, proceso y responsable unidos con BUSCARV/BUSCARX, columna Estado, filtros y gráficos.' },
    { nombre: 'Indicadores', fase: 'Fase 3', descripcion: 'Matriz de indicadores con semáforo, conteos condicionales y validación de datos.' },
    { nombre: 'Matriz_Procesos', fase: 'Fase 4', descripcion: 'Proceso → Tipo → Responsable → Documentos → Indicador, resaltando los procesos sin documentación.' },
    { nombre: 'Matriz_Riesgos', fase: 'Fase 4', descripcion: 'Probabilidad × Impacto con nivel automático y colores verde, amarillo, naranja y rojo.' },
    { nombre: 'Matriz_RACI', fase: 'Fase 4', descripcion: 'Actividades del SIG contra roles, con R, A, C, I validadas y cada letra con su color.' },
    { nombre: 'Cuadro_Mando', fase: 'Fase 4', descripcion: 'Meta vs. Resultado, % de cumplimiento, semáforos, tendencia y tarjeta con el promedio general.' }
  ]
}

export const recomendaciones = [
  { icono: '🎯', titulo: 'Contextualizar siempre', texto: 'Cada actividad debe usar datos reales o simulados de un SIG (procesos, documentos, riesgos, roles), evitando ejercicios genéricos.' },
  { icono: '🪜', titulo: 'Progresión acumulativa', texto: 'Los archivos de una fase deben servir como insumo para la siguiente, de modo que el aprendiz evidencie la utilidad práctica de Excel en la coordinación de un SIG.' },
  { icono: '🤝', titulo: 'Evaluación entre pares', texto: 'En la Fase 4, los aprendices pueden intercambiar sus matrices y aplicar una lista de chequeo para verificar la correcta aplicación de formato condicional, validación de datos y fórmulas.' }
]

export const notaFinal = 'Esta guía articula la competencia informática con los resultados de aprendizaje propios del programa Coordinación en Sistemas Integrados de Gestión (Ficha 3312002), asegurando que el uso de Excel no sea un fin en sí mismo, sino una herramienta transversal para el manejo eficiente de la información del SIG.'
