// Aquí vive todo el contenido de la guía. Si cambia una actividad, se toca aquí y no en los componentes.
// Los textos con <code> se pintan con v-html; son datos nuestros, nada que venga de la calle.

export const portada = {
  titulo: 'Guía de Actividades',
  competencia: 'Utilizar herramientas informáticas de acuerdo con las necesidades de manejo de información',
  programa: 'Coordinación en Sistemas Integrados de Gestión',
  ficha: '3312002',
  herramienta: 'Microsoft Excel',
  duracion: '24 horas',
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
        descripcion: 'Practicar suma, promedio, contar y referencias relativas/absolutas aplicadas a los datos registrados.',
        evidencia: 'Hoja de cálculo con fórmulas básicas operando correctamente.',
        formulas: ['=SUMA()', '=PROMEDIO()', '=CONTAR()', '$A$1']
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
        nombre: 'Función SI y SI anidada',
        descripcion: 'Crear una columna <code>Estado</code> que clasifique automáticamente los documentos según su fecha de vencimiento (Vigente, Por vencer, Vencido) usando <code>=SI()</code> anidada.',
        evidencia: 'Columna <code>Estado</code> funcionando con al menos 3 condiciones.',
        formulas: ['=SI()']
      },
      {
        codigo: '2.2',
        nombre: 'BUSCARV / BUSCARX para consolidar',
        descripcion: 'Vincular la hoja <code>Documentos</code> con la hoja <code>Procesos</code> para traer automáticamente el nombre del proceso asociado a cada documento mediante <code>BUSCARV</code> o <code>BUSCARX</code>.',
        evidencia: 'Consolidado que muestre documento, proceso y responsable sin duplicar datos manualmente.',
        formulas: ['=BUSCARV()', '=BUSCARX()']
      },
      {
        codigo: '2.3',
        nombre: 'Tablas de datos y filtros',
        descripcion: 'Convertir el rango de datos en una Tabla con formato (Ctrl+T). Aplicar filtros por proceso, estado y fecha. Generar subtotales por proceso.',
        evidencia: 'Tabla filtrada y subtotales por proceso.',
        formulas: ['Ctrl+T', '=SUBTOTALES()']
      },
      {
        codigo: '2.4',
        nombre: 'Gráficos básicos para informes',
        descripcion: 'Crear un gráfico de columnas que muestre la cantidad de documentos por proceso y un gráfico circular con la distribución porcentual de estados.',
        evidencia: 'Dos gráficos insertados y titulados correctamente.',
        formulas: []
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
        nombre: 'Tabla dinámica de documentos por proceso y estado',
        descripcion: 'Insertar una tabla dinámica que cruce <code>Proceso</code> (filas) con <code>Estado</code> (columnas) y cuente los documentos. Agregar segmentaciones de datos (slicers) para filtrar interactivamente.',
        evidencia: 'Tabla dinámica funcional con segmentación por proceso.',
        formulas: []
      },
      {
        codigo: '3.2',
        nombre: 'Funciones estadísticas y de conteo condicional',
        descripcion: 'Calcular el porcentaje de documentos vigentes por proceso usando <code>CONTAR.SI</code> y <code>SUMAR.SI</code>. Aplicar <code>PROMEDIO.SI</code> para obtener el tiempo promedio de revisión por proceso.',
        evidencia: 'Hoja con indicadores calculados y formateados como porcentaje.',
        formulas: ['=CONTAR.SI()', '=SUMAR.SI()', '=PROMEDIO.SI()']
      },
      {
        codigo: '3.3',
        nombre: 'Matriz de indicadores básica',
        descripcion: 'Construir una hoja llamada <code>Indicadores</code> con columnas: Indicador, Fórmula, Meta, Resultado, Semáforo. El semáforo debe cambiar de color automáticamente según el resultado (verde ≥ meta, amarillo cercano, rojo por debajo) usando formato condicional.',
        evidencia: 'Matriz de indicadores con semáforo funcional.',
        formulas: []
      },
      {
        codigo: '3.4',
        nombre: 'Validación de datos para asegurar calidad de la información',
        descripcion: 'Implementar listas desplegables en las columnas <code>Proceso</code>, <code>Estado</code> y <code>Responsable</code> para evitar errores de digitación.',
        evidencia: 'Celdas con validación de datos configurada.',
        formulas: []
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
        nombre: 'Matriz de identificación de procesos',
        descripcion: 'Crear una matriz que relacione Proceso → Tipo (Estratégico/Misional/Apoyo) → Responsable → Documentos asociados → Indicador. Usar validación de datos y formato condicional para resaltar procesos sin documentación asociada.',
        evidencia: 'Matriz de procesos completa y formateada.',
        formulas: []
      },
      {
        codigo: '4.2',
        nombre: 'Matriz de riesgos (probabilidad × impacto)',
        descripcion: 'Construir una matriz de riesgos con las columnas: Código del riesgo, Descripción, Probabilidad (1-5), Impacto (1-5), Nivel de riesgo (=Probabilidad×Impacto), Nivel (Bajo/Medio/Alto/Extremo), Control, Responsable. Aplicar formato condicional para colorear el nivel de riesgo (verde, amarillo, naranja, rojo).',
        evidencia: 'Matriz de riesgos con cálculo automático del nivel y colores condicionales.',
        formulas: ['=Probabilidad*Impacto']
      },
      {
        codigo: '4.3',
        nombre: 'Matriz RACI (Responsable, Aprobador, Consultado, Informado)',
        descripcion: 'Diseñar una matriz que cruce Actividades del SIG (filas) con Roles (columnas), asignando R, A, C o I según corresponda. Usar validación de datos para restringir las letras a R, A, C, I. Aplicar formato condicional para que cada letra tenga un color distintivo.',
        evidencia: 'Matriz RACI completa con roles y actividades del SIG.',
        formulas: []
      },
      {
        codigo: '4.4',
        nombre: 'Matriz de seguimiento a indicadores (cuadro de mando)',
        descripcion: 'Integrar la matriz de indicadores de la Fase 3 en una hoja resumen que muestre: Indicador, Meta, Resultado, % Cumplimiento, Semáforo, Tendencia. Insertar un gráfico de barras comparativo Meta vs. Resultado y una tarjeta de resumen con el promedio general de cumplimiento.',
        evidencia: 'Cuadro de mando con gráfico y semáforos funcionando.',
        formulas: []
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
