// La pestaña de Word: cómo armar un documento bien hecho y las normas de escritura (APA 7 e ICONTEC).
// Va con la misma forma de teoria.js, pero agrupada por sección en vez de por fase.
//
// Los ejemplos son de comparar: { titulo, bien, mal, nota }. bien y mal son HTML cortico.
// Los nombres de menús son los de Word en español (Microsoft 365); en otras versiones cambian un poquito.

export const secciones = [
  { id: 'word', icono: '📝', titulo: 'Word paso a paso', color: '#2b579a' },
  { id: 'apa', icono: '🎓', titulo: 'Normas APA 7', color: '#b45309' },
  { id: 'icontec', icono: '🇨🇴', titulo: 'Normas ICONTEC', color: '#be123c' }
]

export const temasWord = [
  // ------------------------------------------------------------------ Word
  {
    id: 'pagina',
    seccion: 'word',
    icono: '📄',
    titulo: 'Configurar la página',
    resumen: 'Tamaño de hoja, márgenes y orientación antes de escribir la primera letra.',
    queEs: 'Antes de escribir hay que <strong>preparar la hoja</strong>: tamaño, márgenes y orientación. Hacerlo al final es como pintar la casa y después mover las paredes.',
    paraQue: [
      'Dejar los márgenes que pide la norma (APA o ICONTEC) desde el principio.',
      'Imprimir en tamaño carta sin que se corte nada.',
      'Poner una sola hoja horizontal para una tabla ancha sin voltear todo el documento.'
    ],
    terminos: [
      { termino: 'Tamaño carta', definicion: '21,59 × 27,94 cm. Es el que se usa en Colombia; Word a veces viene en A4 y toca cambiarlo.' },
      { termino: 'Márgenes', definicion: 'El espacio en blanco entre el borde de la hoja y el texto.' },
      { termino: 'Orientación', definicion: 'Vertical (de pie) u horizontal (acostada).' },
      { termino: 'Salto de sección', definicion: 'Parte el documento en pedazos que pueden tener márgenes, orientación o numeración distintos.' }
    ],
    pasos: [
      'Ve a <strong>Disposición > Tamaño</strong> y elige <em>Carta</em>.',
      'En <strong>Disposición > Márgenes > Márgenes personalizados</strong> escribe los de tu norma (APA: 2,54 cm en los cuatro lados; ICONTEC: 3 arriba, 3 izquierda, 2 derecha, 2 abajo).',
      'En la misma ventana, en <em>Aplicar a</em>, deja <strong>Todo el documento</strong> y dale Aceptar.',
      'Para una sola hoja horizontal: ponte al inicio de esa hoja, <strong>Disposición > Saltos > Página siguiente</strong>, y en esa sección cambia la <em>Orientación</em>. Haz otro salto al final para volver a vertical.'
    ],
    errores: [
      'Dejar el tamaño A4 que trae Word por defecto: al imprimir en carta se descuadra todo.',
      'Mover los márgenes con la regla a ojo: nunca quedan exactos. Escríbelos en la ventana.',
      'Cambiar la orientación sin salto de sección: se voltea el documento completo.'
    ],
  },
  {
    id: 'parrafo',
    seccion: 'word',
    icono: '↔️',
    titulo: 'Fuente, párrafo e interlineado',
    resumen: 'Letra, alineación, sangría y espacio entre líneas: lo que más revisa un evaluador.',
    queEs: 'La ventana <strong>Párrafo</strong> controla cómo se acomoda el texto: alineación, sangría, interlineado y espacio entre párrafos. Lo que no se arregla aquí se termina arreglando con Enter y espacios… y queda feo.',
    paraQue: [
      'Poner el interlineado doble de APA o el sencillo de ICONTEC en un solo paso.',
      'Hacer la sangría de primera línea (o la francesa de las referencias) sin usar la barra espaciadora.',
      'Quitar los espacios raros entre párrafos que Word mete por defecto.'
    ],
    terminos: [
      { termino: 'Interlineado', definicion: 'El espacio entre una línea y otra del mismo párrafo: sencillo (1,0), 1,5 o doble (2,0).' },
      { termino: 'Espaciado anterior / posterior', definicion: 'El espacio que se deja antes o después de cada párrafo. Word trae 8 pt después; APA lo quiere en 0.' },
      { termino: 'Sangría de primera línea', definicion: 'La primera línea del párrafo arranca más adentro (1,27 cm en APA).' },
      { termino: 'Sangría francesa', definicion: 'Al revés: la primera línea pegada al margen y las demás hacia adentro. Es la de las listas de referencias.' },
      { termino: 'Justificado', definicion: 'Texto alineado a ambos lados. ICONTEC lo usa mucho; APA no, porque abre huecos entre palabras.' }
    ],
    pasos: [
      'Selecciona todo con <code>Ctrl + E</code>.',
      'Elige la fuente y el tamaño en <strong>Inicio > Fuente</strong> (por ejemplo, Times New Roman 12 o Arial 12).',
      'Abre la ventana <strong>Párrafo</strong> con la flechita ↘ de la esquina del grupo Párrafo en la pestaña Inicio.',
      'En <em>Interlineado</em> elige Doble (APA) o Sencillo (ICONTEC).',
      'En <em>Espaciado</em> pon 0 pt en Anterior y Posterior, y marca <em>No agregar espacio entre párrafos del mismo estilo</em> si te lo pide la norma.',
      'En <em>Especial</em> elige <strong>Primera línea</strong> con 1,27 cm para el cuerpo del texto (APA), o <strong>Francesa</strong> para las referencias.'
    ],
    errores: [
      'Hacer la sangría con espacios o con Tab en cada párrafo: al cambiar la letra todo se corre.',
      'Usar Enter dos veces para separar párrafos en vez del espaciado del párrafo.',
      'Cambiar la letra a mano párrafo por párrafo: para eso están los estilos (siguiente tema).'
    ],
    atajos: [
      { teclas: 'Ctrl + E', accion: 'Selecciona todo el documento' },
      { teclas: 'Ctrl + N / K / S', accion: 'Negrita, cursiva, subrayado' },
      { teclas: 'Ctrl + Q / T / D / J', accion: 'Alinear a la izquierda, centrar, a la derecha, justificar' },
      { teclas: 'Ctrl + (*)', accion: 'Muestra u oculta las marcas de formato (¶): el detector de Enter y espacios de más' }
    ],
  },
  {
    id: 'estilos',
    seccion: 'word',
    icono: '🏷️',
    titulo: 'Estilos y títulos',
    resumen: 'Título 1, Título 2, Normal: la base para que la tabla de contenido salga sola.',
    queEs: 'Un <strong>estilo</strong> es un formato con nombre (letra, tamaño, color, espaciado). Si a todos tus títulos les pones el estilo <em>Título 1</em>, cambias el estilo una vez y cambian todos. Es como el uniforme del colegio: se define uno y todos quedan iguales.',
    paraQue: [
      'Que todos los títulos del mismo nivel se vean idénticos.',
      'Generar la tabla de contenido automática (Word la arma leyendo los estilos de título).',
      'Moverte por el documento con el <strong>Panel de navegación</strong> (Vista > Panel de navegación).'
    ],
    terminos: [
      { termino: 'Normal', definicion: 'El estilo del texto corriente. Configúralo primero con la letra y el párrafo de tu norma.' },
      { termino: 'Título 1, 2, 3…', definicion: 'Los niveles de títulos. Título 1 es un capítulo, Título 2 una parte de ese capítulo, y así.' },
      { termino: 'Modificar estilo', definicion: 'Clic derecho sobre el estilo > Modificar. Ahí cambias letra, color, alineación y párrafo.' }
    ],
    pasos: [
      'En <strong>Inicio > Estilos</strong>, clic derecho sobre <em>Normal</em> > <strong>Modificar</strong>. Pon la letra, el tamaño y en <em>Formato > Párrafo</em> el interlineado y la sangría de tu norma.',
      'Haz lo mismo con <em>Título 1</em> y <em>Título 2</em>: por defecto vienen azules y en otra letra, y ninguna norma los pide así. Ponlos en negro y con la letra del texto.',
      'Ahora escribe tus títulos, ponte sobre cada uno y haz clic en su estilo.',
      'Activa <strong>Vista > Panel de navegación</strong> para ver el esqueleto del documento y saltar entre títulos.'
    ],
    errores: [
      'Hacer los títulos solo con negrita y tamaño grande: se ven bien, pero Word no sabe que son títulos y no salen en la tabla de contenido.',
      'Dejar los títulos azules que trae Word por defecto.',
      'Saltarse niveles: poner un Título 3 directo debajo de un Título 1.'
    ],
    atajos: [
      { teclas: 'Ctrl + Alt + 1 / 2 / 3', accion: 'Aplica Título 1, Título 2 o Título 3' }
    ],
  },
  {
    id: 'numeracion',
    seccion: 'word',
    icono: '🔢',
    titulo: 'Encabezados y números de página',
    resumen: 'Numerar páginas, saltarse la portada y arrancar el conteo donde toca.',
    queEs: 'El <strong>encabezado</strong> y el <strong>pie de página</strong> son las franjas de arriba y abajo que se repiten en todas las hojas. Ahí van los números de página. Lo difícil es que la portada no lleve número o que el conteo empiece en otra parte: para eso están los saltos de sección.',
    paraQue: [
      'Poner el número arriba a la derecha (APA) o abajo en el centro (ICONTEC).',
      'Que la portada no muestre número.',
      'Numerar las páginas preliminares en romanos (i, ii, iii) y el cuerpo en arábigos (1, 2, 3).'
    ],
    terminos: [
      { termino: 'Primera página diferente', definicion: 'Casilla que deja la primera hoja con su propio encabezado (o sin ninguno).' },
      { termino: 'Vincular al anterior', definicion: 'Botón que hace que una sección copie el encabezado de la anterior. Hay que apagarlo para que cada sección tenga el suyo.' },
      { termino: 'Formato del número', definicion: 'Insertar > Número de página > Formato: aquí eliges romanos o arábigos y desde qué número arranca.' }
    ],
    pasos: [
      'Ve a <strong>Insertar > Número de página</strong> y elige <em>Principio de página > Número sin formato 3</em> (APA, a la derecha) o <em>Final de página > Número sin formato 2</em> (ICONTEC, centrado).',
      'Si la portada no lleva número, en la pestaña <strong>Encabezado y pie de página</strong> marca <em>Primera página diferente</em>.',
      'Para que el conteo empiece en otra hoja: ponte al final de la hoja anterior y usa <strong>Disposición > Saltos > Página siguiente</strong>.',
      'Haz doble clic en el pie de la nueva sección y apaga <strong>Vincular al anterior</strong>.',
      'En <strong>Número de página > Formato del número de página</strong> elige el tipo y en <em>Iniciar en</em> pon 1.'
    ],
    errores: [
      'Escribir los números a mano en cada hoja: el día que agregues un párrafo se desordena todo.',
      'Borrar el número de la portada y que desaparezca de todas las hojas: faltaba <em>Primera página diferente</em>.',
      'Cambiar el pie de una sección sin apagar <em>Vincular al anterior</em>: cambia también en las demás.'
    ],
  },
  {
    id: 'tabla-contenido',
    seccion: 'word',
    icono: '📑',
    titulo: 'Tabla de contenido automática',
    resumen: 'El índice que se arma solo con los títulos y sus páginas.',
    queEs: 'La <strong>tabla de contenido</strong> lista los títulos del documento con su página. Word la arma sola leyendo los estilos de título, así que si usaste estilos, esto es un clic. Si no, pues… toca volver al tema anterior.',
    paraQue: [
      'Tener el índice con las páginas correctas sin contarlas a mano.',
      'Que al hacer Ctrl + clic en un título del índice te lleve directo a esa parte.',
      'Agregar también una lista de tablas y una de figuras.'
    ],
    pasos: [
      'Ponte en la hoja donde va el índice (después de la portada).',
      'Ve a <strong>Referencias > Tabla de contenido</strong> y elige <em>Tabla automática 1</em>, o <em>Tabla de contenido personalizada</em> para escoger cuántos niveles muestra.',
      'Cada vez que cambies algo, clic derecho sobre la tabla > <strong>Actualizar campos > Actualizar toda la tabla</strong>.',
      'Para la lista de tablas o figuras: <strong>Referencias > Insertar tabla de ilustraciones</strong> (necesita que hayas puesto los títulos con Insertar título, en el tema de tablas y figuras).'
    ],
    errores: [
      'Escribir el índice a mano con puntitos: al primer cambio queda mintiendo.',
      'Entregar sin actualizar la tabla: los números de página no coinciden.',
      'Que salgan párrafos raros en el índice: tienen estilo de título sin querer. Ponles estilo Normal.'
    ],
    atajos: [
      { teclas: 'F9', accion: 'Actualiza el campo seleccionado (la tabla de contenido, por ejemplo)' }
    ],
  },
  {
    id: 'tablas-figuras',
    seccion: 'word',
    icono: '🖼️',
    titulo: 'Tablas, figuras y sus títulos',
    resumen: 'Insertar tablas e imágenes, numerarlas y que no se desacomoden.',
    queEs: 'Las tablas y figuras (gráficos, imágenes, diagramas) se numeran: Tabla 1, Figura 1… Con <strong>Insertar título</strong> Word lleva la cuenta solo y después arma la lista de tablas y figuras.',
    paraQue: [
      'Pegar una tabla o un gráfico de Excel en el informe sin que se vea pixelado.',
      'Numerar tablas y figuras automáticamente.',
      'Citarlas en el texto: "como se ve en la Tabla 2…".'
    ],
    pasos: [
      'Tabla nueva: <strong>Insertar > Tabla</strong> y eliges filas y columnas. Para traerla de Excel, copia el rango y pega con <em>Mantener formato de origen</em>.',
      'Imagen: <strong>Insertar > Imágenes</strong>. Haz clic sobre ella > <em>Opciones de diseño</em> > <strong>En línea con el texto</strong>, así no se pasea por el documento.',
      'Selecciona la tabla o figura y ve a <strong>Referencias > Insertar título</strong>. Elige el rótulo <em>Tabla</em> o <em>Figura</em> y la posición.',
      'En APA y en ICONTEC el título de las tablas va <strong>arriba</strong>. En APA el de las figuras también va arriba; en ICONTEC va debajo.',
      'Debajo de la tabla o figura escribe la fuente: de dónde sacaste los datos.'
    ],
    errores: [
      'Pegar un pantallazo de Excel como imagen: se ve borroso y no se puede corregir.',
      'Numerar a mano: si metes una tabla en la mitad, toca renumerar todas.',
      'Dejar la imagen con ajuste "Cuadrado" o "Delante del texto": al agregar un párrafo se va para otra hoja.'
    ],
  },
  {
    id: 'citas-word',
    seccion: 'word',
    icono: '🔗',
    titulo: 'Citas y bibliografía con Word',
    resumen: 'El administrador de fuentes: guardas la fuente una vez y Word arma la cita y la lista.',
    queEs: 'Word trae un <strong>administrador de fuentes</strong>: llenas los datos de cada libro, artículo o página web una sola vez, y Word escribe la cita en el texto y la lista de referencias en orden alfabético. Trae APA; ICONTEC no viene de fábrica, así que en ICONTEC toca hacerla a mano siguiendo los temas de esa sección.',
    paraQue: [
      'No escribir las referencias a mano ni preocuparse por el orden alfabético.',
      'Cambiar de estilo de citas en todo el documento con un solo clic.',
      'Que la lista de referencias tenga exactamente las fuentes citadas, ni una más ni una menos.'
    ],
    pasos: [
      'Ve a <strong>Referencias > Estilo</strong> y elige <em>APA</em> (la versión más nueva que traiga tu Word).',
      'Ponte donde va la cita y haz clic en <strong>Insertar cita > Agregar nueva fuente</strong>.',
      'Elige el <em>Tipo de fuente</em> (libro, artículo de revista, sitio web…) y llena autor, año, título, editorial o URL. Marca <em>Mostrar todos los campos</em> si te falta alguno.',
      'Para citar la misma fuente otra vez, <strong>Insertar cita</strong> y la escoges de la lista.',
      'Para poner el número de página de una cita textual: clic en la cita > flechita > <em>Modificar cita</em> > <em>Páginas</em>.',
      'Al final del documento, en una hoja nueva: <strong>Referencias > Bibliografía > Referencias</strong>.',
      'Revisa la lista contra las reglas de APA: Word a veces se come las cursivas o el DOI. Las herramientas ayudan, pero el que responde eres tú.'
    ],
    errores: [
      'Confiar ciegamente en la lista que arma Word: revísala siempre.',
      'Copiar la referencia de cualquier página web generadora sin verificar que los datos estén bien.',
      'Agregar fuentes que nunca citaste: en APA la lista solo lleva lo que se citó en el texto.'
    ],
  },
  {
    id: 'revision',
    seccion: 'word',
    icono: '🔍',
    titulo: 'Revisar antes de entregar',
    resumen: 'Ortografía, control de cambios, comentarios y guardar en PDF.',
    queEs: 'La pestaña <strong>Revisar</strong> es el control de calidad del documento: ortografía, conteo de palabras, comentarios y control de cambios para trabajar en equipo. Un SIG sin revisión no es SIG, y un informe tampoco.',
    paraQue: [
      'Encontrar los errores de ortografía antes que el instructor.',
      'Que un compañero te corrija y tú decidas qué cambios aceptar.',
      'Entregar en PDF para que nadie te desacomode el formato.'
    ],
    terminos: [
      { termino: 'Control de cambios', definicion: 'Con esto activo, todo lo que se borra o agrega queda marcado en color hasta que lo aceptas o rechazas.' },
      { termino: 'Comentario', definicion: 'Una nota al margen sobre una parte del texto, sin cambiarlo.' }
    ],
    pasos: [
      'Corre <strong>Revisar > Ortografía y gramática</strong> (o <code>F7</code>) y lee cada sugerencia: Word no siempre tiene la razón.',
      'Activa <strong>Revisar > Control de cambios</strong> antes de pasarle el documento a otra persona.',
      'Al recibirlo, usa <strong>Aceptar</strong> o <strong>Rechazar</strong> cambio por cambio.',
      'Antes de entregar, desactiva el control de cambios y borra los comentarios que queden.',
      'Guarda en PDF con <strong>Archivo > Guardar como > PDF</strong> (o <em>Exportar > Crear PDF</em>).'
    ],
    errores: [
      'Entregar con los cambios y comentarios todavía visibles.',
      'Aceptar todas las sugerencias de ortografía sin leer: a veces "corrige" nombres propios.',
      'Mandar el .docx cuando piden PDF: en otro computador se le corren las imágenes.'
    ],
    atajos: [
      { teclas: 'F7', accion: 'Ortografía y gramática' },
      { teclas: 'Ctrl + Enter', accion: 'Salto de página (no más Enter, Enter, Enter…)' },
      { teclas: 'Ctrl + G', accion: 'Guardar' }
    ],
  },

  // ------------------------------------------------------------------ APA 7
  {
    id: 'apa-formato',
    seccion: 'apa',
    icono: '📐',
    titulo: 'Formato general APA',
    resumen: 'Márgenes, letra, interlineado, sangría y números de página según APA 7.',
    queEs: 'APA (de la <em>American Psychological Association</em>) es la norma más usada en el mundo para trabajos académicos. Va por la <strong>7.ª edición</strong> (2019). Lo que más la distingue: interlineado doble, sangría de primera línea y texto alineado a la izquierda (no justificado).',
    paraQue: [
      'Entregar informes y trabajos con el formato que piden la mayoría de instituciones.',
      'Que el documento se lea cómodo: el interlineado doble deja espacio para leer y corregir.'
    ],
    terminos: [
      { termino: 'Márgenes', definicion: '2,54 cm (1 pulgada) en los cuatro lados.' },
      { termino: 'Letra', definicion: 'Una legible y la misma en todo el texto: Times New Roman 12, Arial 11, Calibri 11, Georgia 11 o Lucida Sans Unicode 10.' },
      { termino: 'Interlineado', definicion: 'Doble en todo, incluso en las referencias. Sin espacio extra antes ni después de los párrafos.' },
      { termino: 'Sangría', definicion: 'Primera línea de cada párrafo a 1,27 cm. En las referencias, sangría francesa de 1,27 cm.' },
      { termino: 'Alineación', definicion: 'A la izquierda, con el borde derecho irregular. No se justifica.' },
      { termino: 'Número de página', definicion: 'Arriba a la derecha, en todas las páginas, incluida la portada.' }
    ],
    ejemplos: [
      {
        titulo: 'Un párrafo en APA',
        bien: '<p class="muestra-apa">La gestión documental es la base del SIG, porque sin documentos vigentes no hay forma de demostrar que los procesos se cumplen como se planearon.</p>',
        mal: '<p class="muestra-justificado">La gestión documental es la base del SIG, porque sin documentos vigentes no hay forma de demostrar que los procesos se cumplen como se planearon.</p>',
        nota: 'Bien: sangría de primera línea, alineado a la izquierda y con aire entre líneas. Mal: justificado, sin sangría y apeñuscado.'
      }
    ],
    errores: [
      'Justificar el texto: APA lo pide alineado a la izquierda.',
      'Dejar el espaciado de 8 pt que trae Word después de cada párrafo.',
      'Poner la referencia de una entrega en "APA 6": la 6.ª edición ya no está vigente.'
    ],
  },
  {
    id: 'apa-portada',
    seccion: 'apa',
    icono: '🪪',
    titulo: 'Portada y títulos APA',
    resumen: 'Qué lleva la portada de estudiante y cómo se ven los cinco niveles de títulos.',
    queEs: 'APA 7 tiene dos portadas: la <strong>profesional</strong> (para publicar) y la <strong>de estudiante</strong>, que es la que te toca. Los títulos se organizan en <strong>cinco niveles</strong>, y casi nunca se necesitan más de tres.',
    paraQue: [
      'Armar una portada limpia, sin logos gigantes ni bordes de colores.',
      'Que el lector entienda la jerarquía del documento solo mirando los títulos.'
    ],
    pasos: [
      'Número de página arriba a la derecha (sí, también en la portada).',
      'Baja tres o cuatro líneas y escribe el <strong>título en negrita</strong>, centrado.',
      'Deja una línea en blanco y, centrados y sin negrita: nombre del autor, programa e institución, nombre de la asignatura o competencia, nombre del instructor y fecha de entrega.',
      'Todo a doble espacio. La portada de estudiante no lleva encabezado de titulillo (<em>running head</em>), a menos que tu instructor lo pida.'
    ],
    terminos: [
      { termino: 'Nivel 1', definicion: '<strong>Centrado, en Negrita, con Mayúsculas Iniciales</strong>. El texto empieza en párrafo nuevo.' },
      { termino: 'Nivel 2', definicion: '<strong>Alineado a la Izquierda, en Negrita</strong>. Texto en párrafo nuevo.' },
      { termino: 'Nivel 3', definicion: '<strong><em>A la Izquierda, en Negrita y Cursiva</em></strong>. Texto en párrafo nuevo.' },
      { termino: 'Nivel 4', definicion: '<strong>Con sangría, en negrita, terminado en punto.</strong> El texto sigue en la misma línea.' },
      { termino: 'Nivel 5', definicion: '<strong><em>Con sangría, negrita y cursiva, terminado en punto.</em></strong> El texto sigue en la misma línea.' }
    ],
    ejemplos: [
      {
        titulo: 'Portada de estudiante',
        bien: '<div class="muestra-portada"><span class="muestra-num">1</span><p><strong>Control Documental del Sistema Integrado de Gestión de Lácteos del Caribe S.A.S.</strong></p><p>&nbsp;</p><p>Nombre Apellido</p><p>Coordinación en Sistemas Integrados de Gestión, SENA</p><p>Competencia: Gestión de la información</p><p>Instructor: Nombre Apellido</p><p>27 de octubre de 2026</p></div>',
        nota: 'En APA no se usan mayúsculas sostenidas en la portada, ni logos ni bordes. Si tu institución pide el logo, ese es un ajuste de ella, no de APA.'
      }
    ],
    errores: [
      'Escribir el título en MAYÚSCULA SOSTENIDA: en APA va con mayúsculas iniciales.',
      'Poner "Introducción" como título al inicio del texto: APA repite el título del trabajo en vez de escribir "Introducción".',
      'Numerar los títulos (1., 1.1): APA no los numera; eso es de ICONTEC.'
    ],
  },
  {
    id: 'apa-citas',
    seccion: 'apa',
    icono: '💬',
    titulo: 'Citas en el texto APA',
    resumen: 'Autor y año: citas parentéticas, narrativas, textuales cortas y en bloque.',
    queEs: 'APA usa el sistema <strong>autor-fecha</strong>: cada vez que usas una idea ajena pones el apellido del autor y el año. Así el lector la busca en la lista de referencias. Citar no es adorno: usar ideas ajenas sin citarlas es plagio.',
    paraQue: [
      'Darle el crédito a quien tuvo la idea.',
      'Respaldar lo que dices con fuentes confiables.',
      'Que el lector pueda ir a la fuente original.'
    ],
    terminos: [
      { termino: 'Parentética', definicion: 'Autor y año entre paréntesis al final: <em>…es clave (Pérez, 2021).</em>' },
      { termino: 'Narrativa', definicion: 'El autor hace parte de la frase y el año va entre paréntesis: <em>Pérez (2021) afirma que…</em>' },
      { termino: 'Paráfrasis', definicion: 'Dices la idea del autor con tus palabras. Lleva autor y año; el número de página es opcional.' },
      { termino: 'Cita textual corta', definicion: 'Menos de 40 palabras copiadas tal cual. Va entre comillas y con página: <em>(Pérez, 2021, p. 15)</em>.' },
      { termino: 'Cita en bloque', definicion: '40 palabras o más. Párrafo aparte, sin comillas, todo con sangría de 1,27 cm y la cita después del punto final.' }
    ],
    sintaxis: [
      {
        formula: 'Un autor:        (Pérez, 2021)            Pérez (2021)\nDos autores:     (Pérez y Gómez, 2021)    Pérez y Gómez (2021)\nTres o más:      (Pérez et al., 2021)     Pérez et al. (2021)\nInstitución:     (Servicio Nacional de Aprendizaje [SENA], 2023) → luego (SENA, 2023)\nSin fecha:       (Pérez, s. f.)\nTextual:         (Pérez, 2021, p. 15)     (Pérez, 2021, pp. 15-16)',
        partes: [
          { nombre: 'et al.', explicacion: 'Desde la primera cita, cuando son tres autores o más. Significa "y otros".' },
          { nombre: 'y', explicacion: 'En español se usa "y" entre dos autores. En documentos en inglés va "&" dentro del paréntesis.' },
          { nombre: '[SENA]', explicacion: 'La sigla de una institución se presenta la primera vez entre corchetes y de ahí en adelante se usa sola.' },
          { nombre: 's. f.', explicacion: '"Sin fecha", cuando la fuente no dice el año.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Cita textual corta',
        bien: 'Según la norma, la organización debe "conservar la información documentada como evidencia de los resultados alcanzados" (International Organization for Standardization [ISO], 2015, p. 9).',
        mal: 'Según la norma, la organización debe conservar la información documentada como evidencia de los resultados alcanzados.',
        nota: 'Mal: está copiado palabra por palabra, sin comillas y sin cita. Eso es plagio aunque sea sin querer. El número de página del ejemplo es ilustrativo: siempre ponlo de tu fuente.'
      }
    ],
    errores: [
      'Poner el nombre completo o la inicial en la cita: solo va el apellido.',
      'Citar en el texto algo que no aparece en las referencias (o al revés).',
      'Usar "et al." con dos autores: con dos se nombran los dos siempre.',
      'Citar a Wikipedia o a un blog sin autor: busca la fuente original.'
    ],
  },
  {
    id: 'apa-referencias',
    seccion: 'apa',
    icono: '📚',
    titulo: 'Lista de referencias APA',
    resumen: 'Cómo se escribe cada referencia: libro, artículo, página web y norma técnica.',
    queEs: 'La <strong>lista de referencias</strong> va al final, en hoja aparte, con el título <strong>Referencias</strong> centrado y en negrita. Lleva solo las fuentes que citaste, en orden alfabético por el apellido del primer autor, a doble espacio y con sangría francesa.',
    paraQue: [
      'Que cualquiera pueda encontrar las fuentes que usaste.',
      'Demostrar que tu trabajo se apoya en información confiable.'
    ],
    sintaxis: [
      {
        formula: 'Libro:\nApellido, A. A. (Año). Título del libro en cursiva (2.ª ed.). Editorial.',
        partes: [
          { nombre: 'A. A.', explicacion: 'Iniciales del nombre, con punto y espacio.' },
          { nombre: 'Título', explicacion: 'En <em>cursiva</em> y solo con la primera letra en mayúscula (y los nombres propios).' },
          { nombre: '(2.ª ed.)', explicacion: 'Solo si no es la primera edición. La ciudad de la editorial ya no se pone en APA 7.' }
        ]
      },
      {
        formula: 'Artículo de revista:\nApellido, A. A., y Apellido, B. B. (Año). Título del artículo. Nombre de la Revista, volumen(número), páginas. https://doi.org/xxxx',
        partes: [
          { nombre: 'Nombre de la Revista, volumen', explicacion: 'En <em>cursiva</em>. El número va entre paréntesis y sin cursiva.' },
          { nombre: 'https://doi.org/…', explicacion: 'El DOI (el código único del artículo) en forma de link, sin "Recuperado de".' }
        ]
      },
      {
        formula: 'Página web:\nAutor u Organización. (Año, día de mes). Título de la página en cursiva. Nombre del sitio. URL',
        partes: [
          { nombre: 'Nombre del sitio', explicacion: 'Se omite si es el mismo autor.' },
          { nombre: 'Fecha de consulta', explicacion: 'Solo si la página cambia todo el tiempo (por ejemplo, un indicador en tiempo real): <em>Recuperado el 27 de octubre de 2026, de URL</em>.' }
        ]
      },
      {
        formula: 'Norma técnica:\nOrganización. (Año). Título de la norma en cursiva (Código de la norma). Editorial si es otra. URL',
        partes: [
          { nombre: 'Código', explicacion: 'Entre paréntesis después del título, por ejemplo (ISO 9001:2015) o (NTC-ISO 9001:2015).' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Así se ve en la hoja',
        bien: '<div class="muestra-referencias"><p class="muestra-centro"><strong>Referencias</strong></p><p>International Organization for Standardization. (2015). <em>Sistemas de gestión de la calidad — Requisitos</em> (ISO 9001:2015).</p><p>Lácteos del Caribe S.A.S. (2026). <em>Procedimiento de control de documentos</em> (PM-01-PR-01). Documento interno.</p></div>',
        nota: 'Fíjate en la sangría francesa: la primera línea pegada al margen y las demás hacia adentro. Lácteos del Caribe es la empresa simulada de la guía; un documento interno se referencia así cuando el lector puede pedirlo.'
      }
    ],
    errores: [
      'Ordenar por orden de aparición: en APA va en orden alfabético.',
      'Titular la lista "Bibliografía": en APA se llama <strong>Referencias</strong>.',
      'Poner la cursiva en el título del artículo en vez de en el nombre de la revista.',
      'Pegar URL largas de búsqueda de Google: pon el link directo a la fuente.'
    ],
  },
  {
    id: 'apa-tablas',
    seccion: 'apa',
    icono: '📊',
    titulo: 'Tablas y figuras APA',
    resumen: 'Número en negrita, título en cursiva y nota debajo.',
    queEs: 'En APA las tablas y figuras tienen la misma estructura: <strong>número</strong> arriba en negrita, <strong>título</strong> en la línea siguiente en cursiva, el contenido, y una <strong>nota</strong> debajo si hace falta explicar algo o decir de dónde salió.',
    paraQue: [
      'Presentar los datos de tus hojas de Excel dentro del informe con un formato serio.',
      'Que cada tabla se entienda sola, sin tener que leer todo el texto.'
    ],
    pasos: [
      '<strong>Tabla 1</strong> en negrita, alineado a la izquierda, arriba de la tabla.',
      'En la línea siguiente, el título en <em>cursiva con Mayúsculas Iniciales</em>.',
      'La tabla sin líneas verticales: solo la línea de arriba, la de debajo de los encabezados y la del final.',
      'Debajo: <em>Nota.</em> en cursiva seguido de la explicación o la fuente: <em>Nota.</em> Datos tomados de…',
      'Las figuras igual: <strong>Figura 1</strong>, título en cursiva, la imagen o gráfico, y la nota.',
      'En el texto siempre se mencionan antes de que aparezcan: "como se ve en la Tabla 1…".'
    ],
    ejemplos: [
      {
        titulo: 'Una tabla en APA',
        bien: '<div class="muestra-tabla"><p><strong>Tabla 1</strong></p><p><em>Documentos Vigentes por Proceso</em></p><table><thead><tr><th>Proceso</th><th>Documentos</th><th>Vigentes</th></tr></thead><tbody><tr><td>Gestión de calidad</td><td>12</td><td>10</td></tr><tr><td>Producción</td><td>18</td><td>15</td></tr></tbody></table><p><em>Nota.</em> Datos de la matriz de control documental de Lácteos del Caribe S.A.S. (2026).</p></div>',
        nota: 'Sin cuadrícula completa ni colores de fondo: solo las líneas horizontales necesarias.'
      }
    ],
    errores: [
      'Poner el título de la tabla debajo: en APA va arriba, tanto en tablas como en figuras.',
      'Pegar la tabla con todos los bordes y colores de Excel.',
      'Meter una tabla o figura que nunca se menciona en el texto.'
    ],
  },

  // ------------------------------------------------------------------ ICONTEC
  {
    id: 'icontec-formato',
    seccion: 'icontec',
    icono: '📏',
    titulo: 'Formato general ICONTEC',
    resumen: 'Márgenes, letra, interlineado y numeración según la NTC 1486.',
    queEs: 'Las normas ICONTEC son las <strong>Normas Técnicas Colombianas (NTC)</strong> para trabajos escritos. Son tres que trabajan juntas: la <strong>NTC 1486</strong> (presentación del trabajo), la <strong>NTC 5613</strong> (referencias) y la <strong>NTC 4490</strong> (referencias de fuentes electrónicas). Muchas instituciones las adaptan, así que pide siempre la versión que usa tu programa.',
    paraQue: [
      'Entregar trabajos en el formato que piden muchas instituciones y entidades en Colombia.',
      'Presentar informes técnicos con la estructura clásica de portada, contenido, capítulos numerados y anexos.'
    ],
    terminos: [
      { termino: 'Papel', definicion: 'Tamaño carta.' },
      { termino: 'Márgenes', definicion: 'Superior 3 cm, izquierdo 3 cm, derecho 2 cm, inferior 2 cm. El izquierdo es más ancho por el empaste.' },
      { termino: 'Letra', definicion: 'Una legible, normalmente Arial 12, y la misma en todo el documento.' },
      { termino: 'Interlineado', definicion: 'Sencillo, dejando una línea en blanco entre párrafos. Algunas instituciones piden 1,5: revisa la guía de la tuya.' },
      { termino: 'Alineación', definicion: 'Justificada casi siempre, y sin sangría al empezar los párrafos.' },
      { termino: 'Número de página', definicion: 'En arábigos, centrado abajo. La portada cuenta pero no se le pone el número.' }
    ],
    ejemplos: [
      {
        titulo: 'Un párrafo en ICONTEC',
        bien: '<p class="muestra-justificado">La gestión documental es la base del SIG, porque sin documentos vigentes no hay forma de demostrar que los procesos se cumplen como se planearon.</p>',
        nota: 'Justificado, sin sangría e interlineado sencillo. Fíjate que es casi lo contrario de APA: por eso hay que saber cuál te piden antes de empezar.'
      }
    ],
    errores: [
      'Mezclar normas: márgenes de ICONTEC con citas de APA y portada de quién sabe dónde.',
      'Poner el número de página en la portada.',
      'Usar un margen izquierdo de 2 cm: el de ICONTEC es de 3 cm.'
    ],
  },
  {
    id: 'icontec-estructura',
    seccion: 'icontec',
    icono: '🗂️',
    titulo: 'Estructura del trabajo ICONTEC',
    resumen: 'Portada, preliminares, cuerpo y complementarios, con títulos numerados.',
    queEs: 'ICONTEC organiza el trabajo en tres partes: <strong>preliminares</strong> (lo que va antes del texto), <strong>cuerpo</strong> (el trabajo como tal) y <strong>complementarios</strong> (lo de apoyo al final). Los títulos van <strong>numerados</strong> con números arábigos.',
    paraQue: [
      'Que el trabajo tenga un orden que cualquier evaluador reconoce.',
      'Ubicar cada capítulo rápido gracias a la numeración.'
    ],
    terminos: [
      { termino: 'Preliminares', definicion: 'Cubierta, portada, dedicatoria y agradecimientos (opcionales), contenido, listas de tablas y figuras, glosario y resumen.' },
      { termino: 'Cuerpo', definicion: 'Introducción, capítulos (objetivos, desarrollo, resultados…) y conclusiones.' },
      { termino: 'Complementarios', definicion: 'Bibliografía, anexos e índices.' },
      { termino: 'Primer nivel', definicion: 'Título en MAYÚSCULA SOSTENIDA, negrita y centrado, y cada uno en hoja nueva: <strong>1. OBJETIVOS</strong>.' },
      { termino: 'Niveles siguientes', definicion: 'Al margen izquierdo y con numeración decimal: <strong>1.1 Objetivo general</strong>. Sin punto después del último número y máximo cuatro niveles.' }
    ],
    ejemplos: [
      {
        titulo: 'Portada ICONTEC',
        bien: '<div class="muestra-portada muestra-icontec"><p><strong>CONTROL DOCUMENTAL DEL SISTEMA INTEGRADO DE GESTIÓN DE LÁCTEOS DEL CARIBE S.A.S.</strong></p><p>&nbsp;</p><p>NOMBRE APELLIDO</p><p>&nbsp;</p><p>Informe de la competencia Gestión de la información</p><p>Instructor<br>NOMBRE APELLIDO</p><p>&nbsp;</p><p>SERVICIO NACIONAL DE APRENDIZAJE – SENA<br>COORDINACIÓN EN SISTEMAS INTEGRADOS DE GESTIÓN<br>CIUDAD<br>2026</p></div>',
        nota: 'Todo centrado, en mayúscula sostenida y repartido en la hoja de arriba a abajo: título, autor, tipo de trabajo, instructor, institución, programa, ciudad y año.'
      }
    ],
    errores: [
      'Poner punto después del último número del título: es <code>1.1 Objetivo general</code>, no <code>1.1. Objetivo general</code>.',
      'Pasarse de cuatro niveles de numeración (1.1.1.1.1): mejor reorganiza el capítulo.',
      'Arrancar un capítulo en la mitad de la hoja: cada título de primer nivel va en hoja nueva (usa <code>Ctrl + Enter</code>).'
    ],
  },
  {
    id: 'icontec-citas',
    seccion: 'icontec',
    icono: '🦶',
    titulo: 'Citas y notas al pie ICONTEC',
    resumen: 'La cita con número y la referencia en el pie de página.',
    queEs: 'El sistema clásico de ICONTEC es la <strong>cita con número</strong>: al final de la cita pones un número chiquito (superíndice) y abajo, en el pie de la página, la referencia de dónde salió. Word numera las notas solo. Algunas instituciones aceptan también autor-año entre paréntesis; pregunta cuál usan.',
    paraQue: [
      'Mostrar de dónde sale cada idea sin interrumpir la lectura.',
      'Agregar aclaraciones cortas sin meterlas en el texto.'
    ],
    terminos: [
      { termino: 'Cita corta', definicion: 'Hasta cinco renglones: va dentro del párrafo, entre comillas, con el número al final.' },
      { termino: 'Cita larga', definicion: 'Más de cinco renglones: en párrafo aparte, sin comillas, con sangría a ambos lados e interlineado sencillo.' },
      { termino: 'Nota al pie', definicion: 'El texto que aparece abajo de la página con el mismo número de la cita.' },
      { termino: 'Ibíd.', definicion: 'Abreviatura de "en el mismo lugar": se usa cuando la nota es de la misma fuente que la nota anterior.' }
    ],
    pasos: [
      'Ponte justo después de las comillas de cierre de la cita.',
      'Ve a <strong>Referencias > Insertar nota al pie</strong>. Word pone el número y te lleva abajo de la página.',
      'Escribe ahí la referencia completa de la fuente, con el formato del siguiente tema.',
      'Las notas van en letra más pequeña que el texto y a espacio sencillo; Word ya las trae así.'
    ],
    ejemplos: [
      {
        titulo: 'Cita con nota al pie',
        bien: 'La organización debe "conservar la información documentada como evidencia de los resultados alcanzados"<sup>1</sup>.<hr><small><sup>1</sup> INSTITUTO COLOMBIANO DE NORMAS TÉCNICAS Y CERTIFICACIÓN. Sistemas de gestión de la calidad. Requisitos. NTC-ISO 9001. Bogotá: ICONTEC, 2015. p. 9.</small>',
        nota: 'El número de página es ilustrativo: siempre ponlo de tu fuente.'
      }
    ],
    errores: [
      'Escribir el numerito a mano con superíndice: si mueves un párrafo, se desordena la numeración.',
      'Poner la cita textual sin comillas ni nota: sigue siendo plagio aunque la fuente aparezca en la bibliografía.'
    ],
  },
  {
    id: 'icontec-bibliografia',
    seccion: 'icontec',
    icono: '📖',
    titulo: 'Referencias y bibliografía ICONTEC',
    resumen: 'APELLIDO, Nombre. Título. Ciudad: Editorial, año.',
    queEs: 'En ICONTEC (NTC 5613 y NTC 4490) el autor va con el <strong>APELLIDO EN MAYÚSCULA SOSTENIDA</strong> y el nombre completo, y los datos se separan con punto. La lista va al final con el título <strong>BIBLIOGRAFÍA</strong>, en orden alfabético.',
    paraQue: [
      'Armar las notas al pie y la bibliografía con el formato colombiano.',
      'Referenciar normas técnicas, leyes y documentos de internet, que en un SIG se citan todo el tiempo.'
    ],
    sintaxis: [
      {
        formula: 'Libro:\nAPELLIDO, Nombre. Título del libro. Edición. Ciudad: Editorial, año. número de páginas p.',
        partes: [
          { nombre: 'APELLIDO, Nombre', explicacion: 'Apellidos en mayúscula sostenida y el nombre completo, no solo la inicial.' },
          { nombre: 'Edición', explicacion: 'Solo si no es la primera: <em>2 ed.</em>' },
          { nombre: 'Ciudad: Editorial', explicacion: 'A diferencia de APA 7, aquí sí va la ciudad.' }
        ]
      },
      {
        formula: 'Artículo de revista:\nAPELLIDO, Nombre. Título del artículo. En: Nombre de la revista. Mes, año. vol. 00, no. 0, p. 00-00.',
        partes: [
          { nombre: 'En:', explicacion: 'Indica que el artículo está dentro de una publicación más grande.' }
        ]
      },
      {
        formula: 'Documento de internet:\nAPELLIDO, Nombre. Título [en línea]. Ciudad: Editorial, año. [Consultado el día de mes de año]. Disponible en internet: <URL>',
        partes: [
          { nombre: '[en línea]', explicacion: 'Avisa que la fuente es electrónica (NTC 4490).' },
          { nombre: '[Consultado…]', explicacion: 'La fecha en que tú lo leíste, porque las páginas cambian.' }
        ]
      },
      {
        formula: 'Norma técnica:\nINSTITUCIÓN. Título de la norma. Código. Ciudad: Editorial, año.',
        partes: [
          { nombre: 'INSTITUCIÓN', explicacion: 'Cuando el autor es una entidad, va su nombre completo en mayúscula sostenida.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'La misma fuente en las dos normas',
        bien: '<p><strong>ICONTEC:</strong> INSTITUTO COLOMBIANO DE NORMAS TÉCNICAS Y CERTIFICACIÓN. Sistemas de gestión de la calidad. Requisitos. NTC-ISO 9001. Bogotá: ICONTEC, 2015.</p><p><strong>APA 7:</strong> Instituto Colombiano de Normas Técnicas y Certificación. (2015). <em>Sistemas de gestión de la calidad. Requisitos</em> (NTC-ISO 9001:2015).</p>',
        nota: 'Mismos datos, distinto orden y distinta ropa. Por eso hay que escoger una norma y no mezclar.'
      }
    ],
    errores: [
      'Escribir el nombre del autor con inicial como en APA: en ICONTEC va completo.',
      'Olvidar <em>[en línea]</em> y la fecha de consulta en las fuentes de internet.',
      'Titular la lista "Referencias" en un trabajo ICONTEC: es <strong>BIBLIOGRAFÍA</strong>.'
    ],
  },
  {
    id: 'apa-vs-icontec',
    seccion: 'icontec',
    icono: '⚖️',
    titulo: 'APA vs. ICONTEC: comparación rápida',
    resumen: 'Las diferencias más importantes en una sola tabla, para no mezclarlas.',
    queEs: 'APA e ICONTEC piden cosas distintas, y muchas veces opuestas. El error más común es <strong>mezclarlas</strong>. Antes de escribir, pregunta cuál pide tu instructor y quédate con esa de principio a fin.',
    paraQue: [
      'Revisar de un vistazo si tu documento cumple la norma que te pidieron.',
      'No confundir las reglas de una con las de la otra.'
    ],
    tabla: {
      columnas: ['Aspecto', 'APA 7', 'ICONTEC'],
      filas: [
        ['Márgenes', '2,54 cm en todos los lados', 'Sup. 3, izq. 3, der. 2, inf. 2 cm'],
        ['Interlineado', 'Doble en todo', 'Sencillo, con línea en blanco entre párrafos'],
        ['Alineación', 'Izquierda', 'Justificada'],
        ['Sangría', 'Primera línea a 1,27 cm', 'Sin sangría'],
        ['Número de página', 'Arriba a la derecha, también en la portada', 'Abajo centrado; la portada no lo muestra'],
        ['Títulos', 'Sin numerar, 5 niveles', 'Numerados (1., 1.1), primer nivel en mayúscula sostenida'],
        ['Portada', 'Mayúsculas iniciales, sin mayúscula sostenida', 'Todo en mayúscula sostenida y centrado'],
        ['Citas', 'Autor y año: (Pérez, 2021)', 'Número y nota al pie (o autor-año, según la institución)'],
        ['Autor en la lista', 'Pérez, J. A.', 'PÉREZ, Juan Andrés'],
        ['Título de la lista', 'Referencias', 'BIBLIOGRAFÍA'],
        ['Título de tablas y figuras', 'Ambos arriba', 'Tablas arriba, figuras abajo']
      ]
    },
    errores: [
      'Empezar a escribir sin saber qué norma piden.',
      'Usar plantillas de internet que mezclan las dos normas.'
    ],
  }
]
