// La teoría de cada tema de la guía. Los ejemplos usan los mismos datos de los archivos de práctica
// (Lácteos del Caribe S.A.S.), así lo que leen aquí cuadra con lo que abren en Excel.
//
// Las celdas de los ejemplos pueden ser un valor suelto o { v, tono, activa }:
//   tono   → color de formato condicional (verde, amarillo, naranja, rojo, azul, morado)
//   activa → la celda donde está escrita la fórmula del ejemplo
// Los separadores van con punto y coma (;), que es como viene Excel en Colombia.

export const temas = [
  // ------------------------------------------------------------------ Fase 1
  {
    id: 'entorno',
    fase: 1,
    icono: '🧭',
    titulo: 'El entorno de Excel',
    resumen: 'Libros, hojas, celdas, rangos y dónde queda cada cosa en la pantalla.',
    queEs: 'Excel es una <strong>hoja de cálculo</strong>: una cuadrícula gigante donde cada cuadrito (celda) guarda un dato o una fórmula. Antes de hacer magia con fórmulas hay que saber moverse por la casa.',
    paraQue: [
      'Ubicar cualquier dato por su dirección (por ejemplo, <code>B5</code>).',
      'Seleccionar rangos rápido para aplicar formatos, fórmulas o gráficos.',
      'Tener a mano los botones que más usas en la barra de acceso rápido.'
    ],
    terminos: [
      { termino: 'Libro', definicion: 'El archivo completo (<code>.xlsx</code>). Puede tener muchas hojas adentro.' },
      { termino: 'Hoja', definicion: 'Cada pestaña de abajo del libro (Hoja1, Procesos, Documentos…). Se renombra con doble clic.' },
      { termino: 'Columna', definicion: 'Va de arriba a abajo y se nombra con letras: A, B, C… hasta XFD (16.384 columnas).' },
      { termino: 'Fila', definicion: 'Va de lado a lado y se nombra con números: 1, 2, 3… hasta 1.048.576.' },
      { termino: 'Celda', definicion: 'El cruce de una columna y una fila. Su nombre es letra + número: <code>B5</code> es columna B, fila 5.' },
      { termino: 'Rango', definicion: 'Un grupo de celdas seguidas. <code>A1:D9</code> va desde A1 hasta D9: 4 columnas × 9 filas = 36 celdas.' },
      { termino: 'Cinta de opciones', definicion: 'La franja de arriba con las pestañas Inicio, Insertar, Fórmulas, Datos, Revisar y Vista.' },
      { termino: 'Barra de fórmulas', definicion: 'Muestra lo que hay realmente dentro de la celda: si ves 52 en la celda, aquí puede salir <code>=SUMA(C2:C5)</code>.' },
      { termino: 'Cuadro de nombres', definicion: 'A la izquierda de la barra de fórmulas. Dice en qué celda estás, y si escribes <code>D40</code> y das Enter, te lleva allá.' },
      { termino: 'Barra de estado', definicion: 'Abajo a la derecha. Al seleccionar números muestra su promedio, recuento y suma sin escribir ninguna fórmula.' },
      { termino: 'Barra de acceso rápido', definicion: 'Los iconos chiquitos de arriba (guardar, deshacer…). Con la flechita ▾ > Más comandos le agregas los que quieras.' }
    ],
    errores: [
      'Confundir el libro con la hoja: el archivo es el libro, las pestañas son hojas.',
      'Escribir encima de una celda con fórmula sin mirar la barra de fórmulas primero.',
      'Dejar las hojas como Hoja1, Hoja2, Hoja3: a los dos días nadie sabe qué hay en cada una.'
    ],
    atajos: [
      { teclas: 'Ctrl + flecha', accion: 'Salta al final de los datos (o de la hoja, si está vacía)' },
      { teclas: 'Ctrl + Shift + flecha', accion: 'Selecciona desde donde estás hasta el final de los datos' },
      { teclas: 'Ctrl + Inicio', accion: 'Vuelve a la celda A1' },
      { teclas: 'Ctrl + Re Pág / Av Pág', accion: 'Cambia de hoja' },
      { teclas: 'F2', accion: 'Edita la celda sin borrar lo que tiene' },
      { teclas: 'Ctrl + Z', accion: 'Deshacer, el mejor amigo de todos' }
    ],
    actividades: ['1.1']
  },
  {
    id: 'tipos-datos',
    fase: 1,
    icono: '🔤',
    titulo: 'Tipos de datos y formatos de celda',
    resumen: 'Texto, números, fechas y porcentajes: qué guarda Excel y cómo lo muestra.',
    queEs: 'Excel distingue el <strong>valor</strong> que guarda de la <strong>forma</strong> en que lo muestra. El formato es como la ropa: el dato es el mismo, pero se puede vestir de moneda, de porcentaje o de fecha.',
    paraQue: [
      'Que las fechas se puedan restar y ordenar, y no queden como texto muerto.',
      'Mostrar dinero con su signo y separador de miles sin cambiar el número.',
      'Que los demás lean tu hoja sin adivinar qué significa cada número.'
    ],
    terminos: [
      { termino: 'Texto', definicion: 'Letras o mezclas de letras y números (<code>PM-01-PR-01</code>). Se alinea a la izquierda.' },
      { termino: 'Número', definicion: 'Valores con los que se puede calcular. Se alinean a la derecha.' },
      { termino: 'Fecha', definicion: 'Por dentro es un número: los días contados desde el 1/1/1900. Por eso dos fechas se pueden restar.' },
      { termino: 'Porcentaje', definicion: '0,8 con formato de porcentaje se ve como 80%. Ojo: si escribes 80 y le pones %, sale 8000%.' },
      { termino: 'Lógico', definicion: 'VERDADERO o FALSO. Es lo que devuelven las comparaciones como <code>=C2>=B2</code>.' }
    ],
    pasos: [
      'Selecciona las celdas.',
      'Abre <strong>Formato de celdas</strong> con <code>Ctrl + 1</code> (o clic derecho > Formato de celdas).',
      'En la pestaña <strong>Número</strong> elige la categoría: Número, Moneda, Fecha, Porcentaje, Texto…',
      'Para fechas como 22/10/2026, usa Fecha o Personalizada con <code>dd/mm/aaaa</code>.'
    ],
    ejemplos: [
      {
        titulo: 'Mismo dato, diferente ropa',
        columnas: ['Valor guardado', 'Formato', 'Se ve así'],
        filas: [
          [46317, 'General', 46317],
          [46317, 'Fecha dd/mm/aaaa', '22/10/2026'],
          [28500, 'Moneda', '$ 28.500'],
          [0.8, 'Porcentaje', '80%']
        ],
        nota: 'El 46317 de arriba y el 22/10/2026 son el mismo valor: así guarda Excel las fechas por dentro.'
      }
    ],
    errores: [
      'Números guardados como texto: salen alineados a la izquierda con un triangulito verde, y las fórmulas los ignoran.',
      'Escribir las fechas con puntos (22.10.2026): Excel no las reconoce como fecha.',
      'Ver <code>#####</code> en una celda: no es un error, es que la columna está muy angosta. Ensánchala con doble clic en el borde.'
    ],
    atajos: [
      { teclas: 'Ctrl + 1', accion: 'Abre Formato de celdas' },
      { teclas: 'Doble clic en el borde de la columna', accion: 'Ajusta el ancho al contenido' }
    ],
    actividades: ['1.2', '1.3']
  },
  {
    id: 'formato-condicional',
    fase: 1,
    icono: '🎨',
    titulo: 'Formato condicional',
    resumen: 'Que las celdas cambien de color solas según lo que tengan.',
    queEs: 'El formato condicional le pone color a una celda <strong>solo si cumple una regla</strong>. Si el dato cambia, el color cambia solo: es un resaltador automático que no se cansa.',
    paraQue: [
      'Resaltar documentos vencidos o celdas vacías sin buscarlos a ojo.',
      'Armar semáforos (verde, amarillo, rojo) en indicadores.',
      'Pintar mapas de calor, como en la matriz de riesgos.'
    ],
    pasos: [
      'Selecciona el rango (por ejemplo, la columna Responsable).',
      'Ve a <strong>Inicio > Formato condicional</strong>.',
      'Elige el tipo de regla: <em>Resaltar reglas de celdas</em> (mayor que, igual a, texto que contiene…), <em>Barras de datos</em>, <em>Escalas de color</em> o <em>Conjuntos de íconos</em>.',
      'Para celdas vacías: <em>Nueva regla > Aplicar formato únicamente a las celdas que contengan > Celdas en blanco</em>.',
      'Para reglas a tu medida: <em>Nueva regla > Utilice una fórmula</em>. La fórmula debe dar VERDADERO o FALSO.',
      'Todas las reglas se revisan y se borran en <em>Formato condicional > Administrar reglas</em>.'
    ],
    ejemplos: [
      {
        titulo: 'Procesos sin responsable en rojo',
        columnas: ['Código', 'Proceso', 'Responsable'],
        filas: [
          ['PA-01', 'Talento humano', 'Yesenia Uriana'],
          ['PA-02', 'Compras', 'Camilo Iguarán'],
          ['PA-03', 'Mantenimiento', { v: '', tono: 'rojo' }],
          ['PA-04', 'Seguridad y salud en el trabajo', 'Daniela Epiayú']
        ],
        nota: 'Regla aplicada al rango C2:C5: "Celdas en blanco" con relleno rojo. Cuando le asignen responsable a Mantenimiento, el rojo se quita solo.'
      }
    ],
    errores: [
      'Aplicar la regla a una sola celda y después copiar a mano: selecciona todo el rango desde el principio.',
      'En reglas con fórmula, olvidar el <code>$</code> en la columna (<code>=$C2=""</code>): sin él, cada celda mira una columna distinta.',
      'Acumular reglas repetidas que se pisan entre sí. Límpialas en Administrar reglas.'
    ],
    actividades: ['1.3', '4.1']
  },
  {
    id: 'formulas-basicas',
    fase: 1,
    icono: '🧮',
    titulo: 'Fórmulas y funciones básicas',
    resumen: 'SUMA, PROMEDIO, CONTAR y compañía: los primeros cálculos.',
    queEs: 'Una <strong>fórmula</strong> es una instrucción que empieza con <code>=</code> y calcula algo. Una <strong>función</strong> es una fórmula que ya viene hecha, con nombre propio, como <code>SUMA</code> o <code>PROMEDIO</code>.',
    paraQue: [
      'Calcular totales, promedios y conteos que se actualizan solos cuando cambian los datos.',
      'Dejar de usar la calculadora del celular al lado del computador.'
    ],
    sintaxis: [
      {
        formula: '=SUMA(número1; [número2]; …)',
        partes: [
          { nombre: '=', explicacion: 'Le avisa a Excel que viene una fórmula. Sin él, es texto.' },
          { nombre: 'SUMA', explicacion: 'El nombre de la función.' },
          { nombre: '( )', explicacion: 'Adentro van los argumentos: los datos con los que trabaja.' },
          { nombre: 'número1', explicacion: 'Un número, una celda o un rango, como <code>C2:C5</code>.' },
          { nombre: '[número2]', explicacion: 'Lo que va entre corchetes es opcional.' }
        ]
      }
    ],
    terminos: [
      { termino: '+  -  *  /  ^', definicion: 'Suma, resta, multiplicación, división y potencia. Excel respeta el orden: primero paréntesis, luego potencia, luego * y /, y al final + y -.' },
      { termino: 'SUMA', definicion: 'Suma los números del rango.' },
      { termino: 'PROMEDIO', definicion: 'Suma y divide entre cuántos números hay.' },
      { termino: 'CONTAR', definicion: 'Cuenta las celdas que tienen <strong>números</strong>.' },
      { termino: 'CONTARA', definicion: 'Cuenta las celdas que <strong>no están vacías</strong> (texto incluido).' },
      { termino: 'MAX / MIN', definicion: 'El valor más alto y el más bajo del rango.' },
      { termino: 'Hoja!Celda', definicion: 'Para usar una celda de otra hoja: <code>Parametros!B2</code>.' }
    ],
    ejemplos: [
      {
        titulo: 'Horas de elaboración de documentos',
        columnas: ['Documento', 'Horas'],
        filas: [
          ['Política del SIG', 14],
          ['Plan estratégico 2025-2028', 16],
          ['Revisión por la dirección', 8],
          ['Acta de revisión por la dirección', 14],
          ['Total', { v: 52, activa: true }]
        ],
        formula: { celda: 'B6', texto: '=SUMA(B2:B5)' },
        nota: 'Con el mismo rango: =PROMEDIO(B2:B5) da 13 y =CONTAR(B2:B5) da 4.'
      }
    ],
    errores: [
      'Escribir la fórmula sin el <code>=</code>: Excel la toma como texto y no calcula nada.',
      'Sumar a mano (<code>=14+16+8+14</code>): si cambia un dato, el total queda mal. Usa las celdas.',
      'Usar CONTAR en una columna de texto: da 0, porque solo cuenta números. Para texto es CONTARA.'
    ],
    atajos: [
      { teclas: 'Alt + =', accion: 'Autosuma: escribe =SUMA() con el rango de arriba (en teclado español, Alt + Shift + 0)' }
    ],
    actividades: ['1.4']
  },
  {
    id: 'referencias',
    fase: 1,
    icono: '📌',
    titulo: 'Referencias relativas, absolutas y mixtas',
    resumen: 'El famoso signo $: qué celdas se mueven al copiar una fórmula y cuáles se quedan quietas.',
    queEs: 'Cuando copias una fórmula hacia abajo, Excel <strong>corre las referencias</strong>: <code>C2</code> pasa a ser <code>C3</code>, <code>C4</code>… Eso es una referencia <strong>relativa</strong>. Si quieres que una celda se quede fija, la "anclas" con <code>$</code> y se vuelve <strong>absoluta</strong>.',
    paraQue: [
      'Copiar una fórmula a cientos de filas sin reescribirla.',
      'Usar un mismo parámetro (valor hora, fecha de corte, meta) en todas las filas.'
    ],
    terminos: [
      { termino: 'C2 (relativa)', definicion: 'Se mueve en fila y columna al copiar.' },
      { termino: '$C$2 (absoluta)', definicion: 'No se mueve nunca. Ideal para parámetros.' },
      { termino: '$C2 (mixta)', definicion: 'La columna queda fija, la fila se mueve. Muy usada en formato condicional.' },
      { termino: 'C$2 (mixta)', definicion: 'La fila queda fija, la columna se mueve.' }
    ],
    ejemplos: [
      {
        titulo: 'Costo = Horas × Valor hora (Parametros!B2 = $ 28.500)',
        columnas: ['Documento', 'Horas', 'Costo'],
        filas: [
          ['Política del SIG', 14, { v: '$ 399.000', activa: true }],
          ['Plan estratégico 2025-2028', 16, '$ 456.000'],
          ['Revisión por la dirección', 8, '$ 228.000']
        ],
        formula: { celda: 'C2', texto: '=B2*Parametros!$B$2' },
        nota: 'Al copiar hacia abajo, B2 pasa a B3 y B4, pero $B$2 sigue mirando el valor hora. Sin los $, la fila 3 buscaría en B3 de Parametros, que está vacía, y daría 0.'
      }
    ],
    errores: [
      'Copiar la fórmula y que todo dé 0 o un error: casi siempre falta un $ en el parámetro.',
      'Poner $ en todo "por si acaso": entonces ninguna referencia se mueve y todas las filas dan lo mismo.'
    ],
    atajos: [
      { teclas: 'F4', accion: 'Mientras editas una referencia, la cambia: C2 → $C$2 → C$2 → $C2 (en algunos portátiles es Fn + F4)' }
    ],
    actividades: ['1.4', '2.1']
  },

  // ------------------------------------------------------------------ Fase 2
  {
    id: 'funcion-si',
    fase: 2,
    icono: '🔀',
    titulo: 'Función SI y SI anidada',
    resumen: 'Que Excel tome decisiones: si pasa esto, escribe aquello.',
    queEs: '<code>SI</code> revisa una condición y devuelve una cosa si se cumple y otra si no. Cuando hay más de dos opciones, se mete un <code>SI</code> dentro de otro: eso es un <strong>SI anidado</strong>, como muñecas rusas.',
    paraQue: [
      'Clasificar automáticamente: Vigente, Por vencer o Vencido.',
      'Escribir el color del semáforo según el resultado de un indicador.',
      'Evitar clasificar a mano 500 filas un viernes a las 5 p. m.'
    ],
    sintaxis: [
      {
        formula: '=SI(prueba_lógica; valor_si_verdadero; valor_si_falso)',
        partes: [
          { nombre: 'prueba_lógica', explicacion: 'La pregunta, por ejemplo <code>E2<0</code>. Usa <code>=  <>  >  <  >=  <=</code>.' },
          { nombre: 'valor_si_verdadero', explicacion: 'Lo que devuelve si la respuesta es sí. El texto va entre comillas: <code>"Vencido"</code>.' },
          { nombre: 'valor_si_falso', explicacion: 'Lo que devuelve si es no. Aquí puede ir otro SI.' }
        ]
      },
      {
        formula: '=Y(cond1; cond2)   =O(cond1; cond2)',
        partes: [
          { nombre: 'Y', explicacion: 'VERDADERO solo si se cumplen todas las condiciones.' },
          { nombre: 'O', explicacion: 'VERDADERO si se cumple al menos una.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Estado del documento (fecha de corte: 22/10/2026)',
        columnas: ['Documento', 'Vence', 'Días para vencer', 'Estado'],
        filas: [
          ['Política del SIG', '10/02/2027', 111, { v: 'Vigente', activa: true }],
          ['Plan estratégico 2025-2028', '05/11/2026', 14, 'Por vencer'],
          ['Revisión por la dirección', '01/09/2025', -416, 'Vencido'],
          ['Acta de revisión', '30/10/2026', 8, 'Por vencer']
        ],
        formula: { celda: 'D2', texto: '=SI(C2<0;"Vencido";SI(C2<=30;"Por vencer";"Vigente"))' },
        nota: 'Los días para vencer salen de =B2-Parametros!$B$2. Excel lee el SI anidado en orden: primero pregunta si ya se venció; si no, pregunta si le quedan 30 días o menos; si tampoco, es Vigente.'
      }
    ],
    errores: [
      'Olvidar las comillas en el texto: <code>=SI(C2<0;Vencido;…)</code> da <code>#¿NOMBRE?</code>.',
      'Poner las condiciones en desorden: si preguntas primero <code>C2<=30</code>, los vencidos (negativos) también caen en "Por vencer".',
      'Contar mal los paréntesis: cada SI abre uno y hay que cerrarlos todos al final.'
    ],
    actividades: ['2.1', '3.3']
  },
  {
    id: 'buscarv',
    fase: 2,
    icono: '🔎',
    titulo: 'BUSCARV y BUSCARX',
    resumen: 'Traer datos de otra tabla usando un código en común.',
    queEs: 'Estas funciones buscan un valor (por ejemplo, el código del proceso) en otra tabla y te traen el dato que está en la misma fila. Es como buscar a alguien en el directorio por su cédula para sacar su teléfono.',
    paraQue: [
      'Unir hojas sin copiar y pegar: el documento trae su proceso y el proceso trae su responsable.',
      'Que si cambia el responsable en la hoja Procesos, el consolidado se actualice solo.'
    ],
    sintaxis: [
      {
        formula: '=BUSCARV(valor_buscado; matriz_tabla; indicador_columnas; [ordenado])',
        partes: [
          { nombre: 'valor_buscado', explicacion: 'Qué buscas, por ejemplo el código <code>C2</code>.' },
          { nombre: 'matriz_tabla', explicacion: 'La tabla donde buscas. El valor tiene que estar en su <strong>primera columna</strong>. Ánclala con $.' },
          { nombre: 'indicador_columnas', explicacion: 'El número de la columna que quieres traer, contando desde la primera de la tabla (1, 2, 3…).' },
          { nombre: '[ordenado]', explicacion: '<code>FALSO</code> para coincidencia exacta, que es casi siempre lo que quieres. <code>VERDADERO</code> busca por rangos (lo verás en la matriz de riesgos).' }
        ]
      },
      {
        formula: '=BUSCARX(valor_buscado; matriz_buscada; matriz_devuelta; [si_no_se_encuentra])',
        partes: [
          { nombre: 'matriz_buscada', explicacion: 'La columna donde está lo que buscas.' },
          { nombre: 'matriz_devuelta', explicacion: 'La columna de donde sacas la respuesta. Puede estar a la izquierda o a la derecha.' },
          { nombre: '[si_no_se_encuentra]', explicacion: 'Qué mostrar si no lo encuentra, por ejemplo <code>"Sin proceso"</code>, en vez de <code>#N/D</code>.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Hoja Procesos (donde se busca)',
        columnas: ['Código', 'Proceso', 'Tipo', 'ID responsable'],
        filas: [
          [{ v: 'PE-01', tono: 'azul' }, { v: 'Direccionamiento estratégico', tono: 'azul' }, 'Estratégico', 'R08'],
          ['PE-02', 'Gestión de la calidad', 'Estratégico', 'R01'],
          ['PM-01', 'Producción', 'Misional', 'R02']
        ]
      },
      {
        titulo: 'Hoja Consolidado (donde se trae el dato)',
        columnas: ['Código documento', 'Código proceso', 'Proceso'],
        filas: [
          ['PE-01-PO-01', 'PE-01', { v: 'Direccionamiento estratégico', activa: true }],
          ['PE-02-MA-01', 'PE-02', 'Gestión de la calidad'],
          ['PM-01-PR-01', 'PM-01', 'Producción']
        ],
        formula: { celda: 'C2', texto: '=BUSCARV(B2;Procesos!$A$2:$D$11;2;FALSO)' },
        nota: 'Con BUSCARX sería =BUSCARX(B2;Procesos!$A$2:$A$11;Procesos!$B$2:$B$11;"Sin proceso"). BUSCARX solo existe en Excel 2021 y Microsoft 365. Ojo: en el archivo 2.2 el Consolidado no trae el código del proceso. Primero tráelo de la hoja Documentos con otro BUSCARV y después busca el nombre: búsquedas encadenadas.'
      }
    ],
    errores: [
      '<code>#N/D</code>: no encontró el valor. Revisa espacios de más o códigos mal escritos (PE-1 no es PE-01).',
      'Olvidar el <code>FALSO</code> al final: BUSCARV busca aproximado y trae datos equivocados sin avisar. Es el error más peligroso, porque no se ve.',
      'No anclar la tabla con $: al copiar hacia abajo, la tabla se corre y empiezan los #N/D.',
      'Con BUSCARV, el código tiene que estar en la primera columna de la tabla. Si no, usa BUSCARX.'
    ],
    actividades: ['2.2', '4.1']
  },
  {
    id: 'tablas-filtros',
    fase: 2,
    icono: '🗂️',
    titulo: 'Tablas, filtros y subtotales',
    resumen: 'Convertir un rango en tabla de verdad, filtrarla y sacar subtotales.',
    queEs: 'Una <strong>Tabla</strong> (Ctrl + T) es un rango con superpoderes: trae filtros, se estira sola cuando agregas filas, copia las fórmulas hacia abajo y se puede usar como fuente de gráficos y tablas dinámicas.',
    paraQue: [
      'Ver solo lo que te interesa: los documentos vencidos de Producción, por ejemplo.',
      'Sacar totales que respetan el filtro.',
      'Que los gráficos y las tablas dinámicas incluyan las filas nuevas sin tocar nada.'
    ],
    pasos: [
      'Haz clic en cualquier celda de los datos y presiona <code>Ctrl + T</code>. Confirma que "La tabla tiene encabezados" esté marcado.',
      'En <strong>Diseño de tabla</strong>, ponle un nombre (por ejemplo, <code>TablaDocumentos</code>) y elige un estilo.',
      'Usa las flechitas ▾ de los encabezados para filtrar por texto, número o fecha, y para ordenar.',
      'Activa la <strong>Fila de totales</strong> en Diseño de tabla: abajo eliges Suma, Promedio, Recuento…',
      'Para subtotales por grupo: ordena por Proceso, convierte la tabla en rango (<em>Diseño de tabla > Convertir en rango</em>) y usa <strong>Datos > Subtotal</strong>.'
    ],
    sintaxis: [
      {
        formula: '=SUBTOTALES(núm_función; ref1)',
        partes: [
          { nombre: 'núm_función', explicacion: '9 = suma, 3 = contar no vacías, 1 = promedio. Con 109, 103 o 101 también ignora las filas ocultas a mano.' },
          { nombre: 'ref1', explicacion: 'El rango a calcular. Las filas que esconde el filtro no se cuentan, y esa es la gracia.' }
        ]
      }
    ],
    errores: [
      'Dejar filas o columnas vacías en medio de los datos: Excel cree que ahí se acabó la tabla.',
      'Usar SUMA con datos filtrados: suma también lo que está oculto. Para eso está SUBTOTALES.',
      'Intentar usar Datos > Subtotal sobre una Tabla: sale gris. Primero hay que convertirla en rango.'
    ],
    atajos: [
      { teclas: 'Ctrl + T', accion: 'Crea la tabla' },
      { teclas: 'Ctrl + Shift + L', accion: 'Pone o quita los filtros' },
      { teclas: 'Alt + flecha abajo', accion: 'Abre el filtro del encabezado donde estás' }
    ],
    actividades: ['2.3']
  },
  {
    id: 'graficos',
    fase: 2,
    icono: '📈',
    titulo: 'Gráficos',
    resumen: 'Escoger el gráfico correcto y dejarlo presentable.',
    queEs: 'Un gráfico convierte números en dibujo para que se entiendan de un vistazo. El truco no es hacerlo bonito, sino <strong>escoger el tipo que responde la pregunta</strong>.',
    paraQue: [
      'Mostrar en un informe cuántos documentos tiene cada proceso.',
      'Ver qué parte del total está vencida.',
      'Comparar la meta contra el resultado en un cuadro de mando.'
    ],
    terminos: [
      { termino: 'Columnas o barras', definicion: 'Para comparar cantidades entre categorías: documentos por proceso, meta vs. resultado.' },
      { termino: 'Circular', definicion: 'Para mostrar partes de un todo, con pocas categorías (máximo 5 o 6): Vigente, Por vencer, Vencido.' },
      { termino: 'Líneas', definicion: 'Para ver la evolución en el tiempo: el indicador en T1, T2 y T3.' },
      { termino: 'Combinado', definicion: 'Columnas y línea en el mismo gráfico: el resultado en columnas y la meta como línea.' },
      { termino: 'Minigráficos', definicion: 'Gráficos chiquitos dentro de una celda (Insertar > Minigráficos). Perfectos para la tendencia en una tabla.' }
    ],
    pasos: [
      'Selecciona los datos <strong>con sus encabezados</strong>, por ejemplo Proceso y Cantidad.',
      'Ve a <strong>Insertar > Gráficos recomendados</strong> o escoge el tipo directo.',
      'Con el botón <strong>+</strong> del gráfico agrega el título, las etiquetas de datos y la leyenda.',
      'Ponle un título que diga qué se ve: "Documentos por proceso", no "Gráfico 1".'
    ],
    errores: [
      'Hacer un circular con 10 procesos: queda una pizza imposible de leer. Usa columnas.',
      'Dejar el título por defecto ("Título del gráfico"). Se nota a kilómetros.',
      'Graficar la fila de totales junto con los datos: la barra del total se come a las demás.'
    ],
    atajos: [
      { teclas: 'Alt + F1', accion: 'Inserta un gráfico rápido en la misma hoja' },
      { teclas: 'F11', accion: 'Inserta el gráfico en una hoja nueva' }
    ],
    actividades: ['2.4', '4.4']
  },

  // ------------------------------------------------------------------ Fase 3
  {
    id: 'tablas-dinamicas',
    fase: 3,
    icono: '🔄',
    titulo: 'Tablas dinámicas y segmentaciones',
    resumen: 'Resumir cientos de filas arrastrando campos, sin escribir fórmulas.',
    queEs: 'Una <strong>tabla dinámica</strong> resume una lista larga en un cuadro de doble entrada: procesos en filas, estados en columnas y, en el cruce, cuántos documentos hay. Se llama dinámica porque reorganizas todo arrastrando campos y Excel recalcula al instante.',
    paraQue: [
      'Responder preguntas como "¿qué proceso tiene más documentos vencidos?" en segundos.',
      'Cambiar el punto de vista (por responsable, por tipo de documento) sin empezar de cero.',
      'Filtrar con botones bonitos (segmentaciones) en vez de menús.'
    ],
    pasos: [
      'Haz clic dentro de los datos (mejor si ya están como Tabla) y ve a <strong>Insertar > Tabla dinámica</strong>. Elige "Nueva hoja de cálculo".',
      'En el panel de la derecha, arrastra los campos a las 4 áreas: <strong>Filas</strong> (Proceso), <strong>Columnas</strong> (Estado), <strong>Valores</strong> (Código) y <strong>Filtros</strong> si quieres.',
      'Si en Valores sale "Suma de…", haz clic en el campo > <em>Configuración de campo de valor</em> y elige <strong>Cuenta</strong>.',
      'Para mostrar porcentajes: <em>Configuración de campo de valor > Mostrar valores como > % del total de filas</em>.',
      'Segmentaciones: <strong>Análisis de tabla dinámica > Insertar segmentación de datos</strong> y marca, por ejemplo, Tipo de proceso.',
      'Si cambian los datos de origen: clic derecho sobre la tabla dinámica > <strong>Actualizar</strong>.'
    ],
    ejemplos: [
      {
        titulo: 'Cuenta de documentos: Proceso (filas) × Estado (columnas)',
        columnas: ['Proceso', 'Por vencer', 'Vencido', 'Vigente', 'Total general'],
        filas: [
          ['Direccionamiento estratégico', 2, 1, 1, 4],
          ['Gestión de la calidad', 1, 2, 3, 6],
          ['Producción', 1, 2, 3, 6],
          ['Seguridad y salud en el trabajo', 1, 2, 3, 6],
          ['… (los demás procesos)', '…', '…', '…', '…'],
          [{ v: 'Total general', tono: 'verde' }, { v: 9, tono: 'verde' }, { v: 12, tono: 'verde' }, { v: 19, tono: 'verde' }, { v: 40, tono: 'verde' }]
        ],
        nota: 'Este es el resultado real con el archivo 3.1_Tabla_dinamica.xlsx. Si cuadra, vas bien.'
      }
    ],
    errores: [
      'Datos de origen con celdas combinadas, filas vacías o encabezados repetidos: la tabla dinámica sale rara o ni se deja crear.',
      'Cambiar los datos y no darle Actualizar: la tabla dinámica no se entera sola.',
      'Poner un campo de texto en Valores y que salga "Suma": cámbialo a Cuenta.',
      'Escribir a mano dentro de la tabla dinámica: no se puede. Para cálculos extra, hazlos al lado.'
    ],
    atajos: [
      { teclas: 'Alt + F5', accion: 'Actualiza la tabla dinámica' },
      { teclas: 'Doble clic en un número', accion: 'Abre una hoja nueva con las filas que forman ese número' }
    ],
    actividades: ['3.1']
  },
  {
    id: 'conteo-condicional',
    fase: 3,
    icono: '🧾',
    titulo: 'CONTAR.SI, SUMAR.SI y PROMEDIO.SI',
    resumen: 'Contar, sumar o promediar solo lo que cumple una condición.',
    queEs: 'Son las primas de SUMA, CONTAR y PROMEDIO, pero <strong>con filtro incorporado</strong>: solo tienen en cuenta las filas que cumplen el criterio. Si necesitas varias condiciones a la vez, existen sus versiones <code>.CONJUNTO</code>.',
    paraQue: [
      'Contar cuántos documentos tiene cada proceso.',
      'Calcular el porcentaje de documentos vigentes por proceso.',
      'Sacar el tiempo promedio de revisión de un proceso.'
    ],
    sintaxis: [
      {
        formula: '=CONTAR.SI(rango; criterio)',
        partes: [
          { nombre: 'rango', explicacion: 'Dónde se revisa la condición, por ejemplo la columna Proceso.' },
          { nombre: 'criterio', explicacion: 'Qué tiene que cumplir: <code>"Producción"</code>, <code>A2</code>, <code>">10"</code>.' }
        ]
      },
      {
        formula: '=SUMAR.SI(rango; criterio; [rango_suma])   =PROMEDIO.SI(rango; criterio; [rango_promedio])',
        partes: [
          { nombre: '[rango_suma] / [rango_promedio]', explicacion: 'Los números que se suman o promedian. Deben tener el mismo tamaño que el rango.' }
        ]
      },
      {
        formula: '=CONTAR.SI.CONJUNTO(rango1; criterio1; rango2; criterio2; …)',
        partes: [
          { nombre: 'pares rango/criterio', explicacion: 'Cuenta solo si se cumplen todas: proceso = Producción <strong>y</strong> estado = Vigente.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Hoja Indicadores_Proceso',
        columnas: ['Proceso', 'Total', 'Vigentes', '% Vigentes', 'Prom. días revisión'],
        filas: [
          ['Gestión de la calidad', { v: 6, activa: true }, 3, '50%', 11],
          ['Producción', 6, 3, '50%', 9.5],
          ['Compras', 3, 2, '67%', 6.7],
          ['Gestión ambiental', 0, 0, { v: '#¡DIV/0!', tono: 'rojo' }, { v: '#¡DIV/0!', tono: 'rojo' }]
        ],
        formula: { celda: 'B2', texto: '=CONTAR.SI(Documentos!$B$2:$B$41;A2)' },
        nota: 'Vigentes: =CONTAR.SI.CONJUNTO(Documentos!$B$2:$B$41;A2;Documentos!$C$2:$C$41;"Vigente"). % Vigentes: =C2/B2. Promedio: =PROMEDIO.SI(Documentos!$B$2:$B$41;A2;Documentos!$D$2:$D$41). Los #¡DIV/0! de Gestión ambiental se arreglan en el tema de SI.ERROR.'
      }
    ],
    errores: [
      'Escribir el criterio de comparación sin comillas: es <code>">10"</code>, no <code>>10</code>.',
      'Que el rango y el rango_suma tengan tamaños distintos: el resultado queda corrido.',
      'Contar "Producción" cuando en los datos dice "Produccion": para Excel son textos distintos.'
    ],
    actividades: ['3.2', '4.1']
  },
  {
    id: 'si-error',
    fase: 3,
    icono: '🚑',
    titulo: 'SI.ERROR y los errores de Excel',
    resumen: 'Qué significa cada error y cómo mostrar algo decente en su lugar.',
    queEs: 'Cuando una fórmula no puede calcular, Excel muestra un error que empieza con <code>#</code>. Cada uno tiene su significado, y <code>SI.ERROR</code> te deja reemplazarlo por un texto o un número.',
    paraQue: [
      'Que el informe no se llene de #¡DIV/0! cuando un proceso no tiene datos.',
      'Entender qué se dañó en vez de borrar la fórmula con rabia.'
    ],
    sintaxis: [
      {
        formula: '=SI.ERROR(valor; valor_si_error)',
        partes: [
          { nombre: 'valor', explicacion: 'La fórmula normal, por ejemplo <code>C2/B2</code>.' },
          { nombre: 'valor_si_error', explicacion: 'Lo que se muestra si la fórmula da error: <code>0</code>, <code>""</code> o <code>"Sin datos"</code>.' }
        ]
      }
    ],
    terminos: [
      { termino: '#¡DIV/0!', definicion: 'Dividiste entre cero o entre una celda vacía.' },
      { termino: '#N/D', definicion: 'No se encontró el valor buscado (típico de BUSCARV).' },
      { termino: '#¿NOMBRE?', definicion: 'Excel no reconoce algo: una función mal escrita o un texto sin comillas.' },
      { termino: '#¡VALOR!', definicion: 'Operaste con un tipo de dato equivocado, como sumar un texto.' },
      { termino: '#¡REF!', definicion: 'La fórmula apuntaba a una celda que borraste.' },
      { termino: '#####', definicion: 'No es error: la columna está muy angosta para mostrar el valor.' }
    ],
    ejemplos: [
      {
        titulo: '% Vigentes sin errores feos',
        columnas: ['Proceso', 'Total', 'Vigentes', '% Vigentes'],
        filas: [
          ['Compras', 3, 2, '67%'],
          ['Gestión ambiental', 0, 0, { v: 'Sin documentos', activa: true }]
        ],
        formula: { celda: 'D3', texto: '=SI.ERROR(C3/B3;"Sin documentos")' }
      }
    ],
    errores: [
      'Envolver todo en SI.ERROR desde el principio: escondes errores de verdad, como un BUSCARV mal hecho. Úsalo cuando ya sepas por qué sale el error.'
    ],
    actividades: ['3.2']
  },
  {
    id: 'semaforos',
    fase: 3,
    icono: '🚦',
    titulo: 'Indicadores con semáforo',
    resumen: 'Comparar el resultado con la meta y pintarlo de verde, amarillo o rojo.',
    queEs: 'Un semáforo es <strong>formato condicional aplicado a un indicador</strong>: compara el resultado con la meta y le pone color. Hay dos caminos: escribir el color con un SI y pintarlo, o usar los conjuntos de íconos de Excel.',
    paraQue: [
      'Que el jefe vea en un segundo qué está bien y qué está en problemas.',
      'Que el color cambie solo cuando se actualiza el resultado.'
    ],
    pasos: [
      '<strong>Camino 1 (texto + color):</strong> en la columna Semáforo escribe un SI anidado que devuelva "Verde", "Amarillo" o "Rojo".',
      'Luego aplica <em>Formato condicional > Resaltar reglas de celdas > Es igual a…</em> tres veces, una por color.',
      '<strong>Camino 2 (reglas con fórmula):</strong> selecciona las filas y crea una regla por color con <em>Utilice una fórmula</em>, por ejemplo <code>=$D2>=$C2</code> para el verde.',
      '<strong>Camino 3 (íconos):</strong> <em>Formato condicional > Conjuntos de íconos</em>, y en <em>Administrar reglas > Editar</em> ajustas los límites y marcas "Mostrar icono únicamente".'
    ],
    ejemplos: [
      {
        titulo: 'Matriz de indicadores (verde ≥ meta, amarillo hasta 10 puntos abajo, rojo más abajo)',
        columnas: ['Indicador', 'Meta (%)', 'Resultado (%)', 'Semáforo'],
        filas: [
          ['Satisfacción del cliente', 85, 88, { v: 'Verde', tono: 'verde', activa: true }],
          ['Documentos vigentes', 90, 80, { v: 'Amarillo', tono: 'amarillo' }],
          ['Cumplimiento del plan de auditorías', 100, 95, { v: 'Amarillo', tono: 'amarillo' }],
          ['Mantenimientos preventivos ejecutados', 90, 70, { v: 'Rojo', tono: 'rojo' }]
        ],
        formula: { celda: 'D2', texto: '=SI(C2>=B2;"Verde";SI(C2>=B2-10;"Amarillo";"Rojo"))' },
        nota: 'Ojo con Documentos vigentes: 80 es exactamente meta - 10, así que todavía es amarillo. Fíjate en el >= .'
      }
    ],
    errores: [
      'Poner las reglas de color en el orden equivocado: si el rojo dice "menor que la meta", se pinta encima del amarillo.',
      'Usar conjuntos de íconos sin editar los límites: por defecto se reparten por percentiles, no por tu meta.'
    ],
    actividades: ['3.3', '4.4']
  },
  {
    id: 'validacion',
    fase: 3,
    icono: '✅',
    titulo: 'Validación de datos y listas desplegables',
    resumen: 'Que solo se pueda escribir lo que debe ir, sin errores de digitación.',
    queEs: 'La validación de datos es un <strong>portero</strong> para las celdas: decide qué se puede escribir y qué no. La forma más usada es la lista desplegable, donde el usuario escoge en vez de escribir.',
    paraQue: [
      'Evitar que unos escriban "Produccion", otros "producción" y otros "Prod.".',
      'Que las fórmulas como CONTAR.SI y BUSCARV no fallen por textos mal escritos.',
      'Limitar valores, como que la probabilidad solo pueda ir de 1 a 5.'
    ],
    pasos: [
      'Ten la lista de opciones en una hoja aparte (por ejemplo, <code>Listas!A2:A11</code>).',
      'Selecciona las celdas a validar y ve a <strong>Datos > Validación de datos</strong>.',
      'En <em>Permitir</em> elige <strong>Lista</strong>, y en <em>Origen</em> escribe <code>=Listas!$A$2:$A$11</code>. Para listas cortas también sirve escribirlas: <code>R;A;C;I</code>.',
      'En la pestaña <em>Mensaje de error</em> pon algo amable: "Escoge un proceso de la lista".',
      'Para números: <em>Permitir > Número entero > entre 1 y 5</em>.',
      'Para encontrar los datos malos que ya estaban: <strong>Datos > Validación de datos ▾ > Rodear con un círculo datos no válidos</strong>.'
    ],
    errores: [
      'Crear la validación después de llenar los datos: lo que ya estaba mal no se corrige solo. Usa "Rodear con un círculo".',
      'Que la lista de origen tenga espacios de más ("  Compras"): la opción mala también queda en el desplegable.',
      'Pegar datos encima de celdas validadas: pegar se salta la validación.'
    ],
    actividades: ['3.4', '4.1', '4.3']
  },

  // ------------------------------------------------------------------ Fase 4
  {
    id: 'matriz-riesgos',
    fase: 4,
    icono: '🔥',
    titulo: 'Matriz de riesgos en Excel',
    resumen: 'Multiplicar, clasificar por rangos con BUSCARV aproximado y colorear el nivel.',
    queEs: 'En Excel, una matriz de riesgos es una tabla donde <strong>multiplicas dos columnas</strong> (probabilidad × impacto), <strong>clasificas el resultado por rangos</strong> y lo <strong>pintas con formato condicional</strong>. Junta casi todo lo de las fases anteriores.',
    paraQue: [
      'Calcular el nivel de cada riesgo automáticamente.',
      'Aprender BUSCARV con coincidencia aproximada, ideal para clasificar por rangos.',
      'Hacer un mapa de calor 5 × 5.'
    ],
    sintaxis: [
      {
        formula: '=BUSCARV(F2;Escala!$A$2:$C$5;3;VERDADERO)',
        partes: [
          { nombre: 'F2', explicacion: 'El nivel de riesgo calculado (=D2*E2).' },
          { nombre: 'Escala!$A$2:$C$5', explicacion: 'La tabla Desde/Hasta/Nivel. La columna "Desde" tiene que estar ordenada de menor a mayor.' },
          { nombre: 'VERDADERO', explicacion: 'Coincidencia aproximada: busca el "Desde" más grande que no se pase del valor. Así 12 cae en el rango que empieza en 10, o sea Alto.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Hoja Riesgos',
        columnas: ['Código', 'Probabilidad', 'Impacto', 'Nivel de riesgo', 'Nivel'],
        filas: [
          ['R-01', 4, 4, { v: 16, activa: true }, { v: 'Alto', tono: 'naranja' }],
          ['R-03', 2, 5, 10, { v: 'Alto', tono: 'naranja' }],
          ['R-08', 3, 2, 6, { v: 'Medio', tono: 'amarillo' }],
          ['R-12', 1, 4, 4, { v: 'Bajo', tono: 'verde' }]
        ],
        formula: { celda: 'D2', texto: '=B2*C2' },
        nota: 'Escala: 1-4 Bajo, 5-9 Medio, 10-16 Alto, 17-25 Extremo. El Nivel se puede sacar con BUSCARV aproximado o con un SI anidado: =SI(D2>=17;"Extremo";SI(D2>=10;"Alto";SI(D2>=5;"Medio";"Bajo"))).'
      }
    ],
    pasos: [
      'Calcula el nivel con <code>=Probabilidad*Impacto</code> y cópialo hacia abajo.',
      'Clasifica con BUSCARV aproximado o con SI anidado.',
      'Valida Probabilidad e Impacto: número entero entre 1 y 5.',
      'Colorea la columna Nivel con <em>Resaltar reglas > Es igual a…</em>: una regla por cada nivel.',
      'Extra: arma un mapa de calor 5 × 5 (impacto en columnas, probabilidad en filas) con <code>=fila*columna</code> y aplícale <em>Escalas de color</em>.'
    ],
    errores: [
      'Usar BUSCARV aproximado con la escala desordenada: da resultados absurdos sin avisar.',
      'Escribir el nivel a mano: si cambia la probabilidad, el color queda mintiendo.'
    ],
    actividades: ['4.2']
  },
  {
    id: 'matriz-raci',
    fase: 4,
    icono: '🧑‍🤝‍🧑',
    titulo: 'Matriz de doble entrada con letras (RACI)',
    resumen: 'Cruzar actividades contra roles, limitar las letras y darle un color a cada una.',
    queEs: 'Técnicamente es una <strong>tabla de doble entrada</strong>: actividades en las filas, roles en las columnas y una letra en cada cruce. La gracia en Excel está en que solo se puedan escribir R, A, C o I, que cada letra tenga su color y que una fórmula revise que no falte el Aprobador.',
    paraQue: [
      'Practicar validación con lista escrita.',
      'Aplicar formato condicional por texto.',
      'Usar CONTAR.SI para revisar reglas fila por fila.'
    ],
    pasos: [
      'Selecciona todo el cruce (por ejemplo, <code>B2:G11</code>) > <strong>Datos > Validación > Lista</strong> > Origen: <code>R;A;C;I</code>.',
      'Formato condicional > <em>Resaltar reglas > Es igual a…</em> "R" en un color, y repite con A, C e I.',
      'Al lado de cada fila, en H2: <code>=CONTAR.SI(B2:G2;"A")</code>. Debe dar 1 (ni cero ni dos aprobadores).',
      'Regla extra para la fila: <em>Utilice una fórmula</em> <code>=$H2<>1</code> con relleno rojo claro. Así se ven solas las filas con problema.'
    ],
    ejemplos: [
      {
        titulo: 'Hoja RACI',
        columnas: ['Actividad', 'Gerente', 'Coord. SIG', 'Líderes', 'Auditor', '¿Una A?'],
        filas: [
          ['Elaborar documentos del SIG', { v: 'I', tono: 'morado' }, { v: 'A', tono: 'rojo' }, { v: 'R', tono: 'azul' }, '', { v: 1, activa: true }],
          ['Aprobar documentos', { v: 'A', tono: 'rojo' }, { v: 'R', tono: 'azul' }, { v: 'C', tono: 'amarillo' }, '', 1],
          [{ v: 'Ejecutar auditorías internas', tono: 'rojo' }, { v: 'I', tono: 'morado' }, { v: 'C', tono: 'amarillo' }, { v: 'C', tono: 'amarillo' }, { v: 'R', tono: 'azul' }, { v: 0, tono: 'rojo' }]
        ],
        formula: { celda: 'F2', texto: '=CONTAR.SI(B2:E2;"A")' },
        nota: 'La tercera fila no tiene aprobador: el CONTAR.SI da 0 y la regla con fórmula la pinta de rojo.'
      }
    ],
    errores: [
      'Dejar actividades sin ninguna R: si nadie la ejecuta, la actividad no se hace. Revísalo con otro CONTAR.SI, esta vez buscando "R".',
      'Olvidar anclar la columna en la regla de fila (<code>=$H2<>1</code>): sin el $, solo se pinta una celda.'
    ],
    actividades: ['4.3']
  },
  {
    id: 'cuadro-mando',
    fase: 4,
    icono: '🎛️',
    titulo: 'Cuadro de mando en Excel',
    resumen: 'Porcentaje de cumplimiento, tendencia con flechas, gráfico y tarjeta de resumen en una sola hoja.',
    queEs: 'Un cuadro de mando es una hoja resumen que <strong>junta fórmulas, semáforos, gráficos y una tarjeta grande</strong> para ver todo de un vistazo. No hay función nueva: es armar bien lo que ya sabes.',
    paraQue: [
      'Presentar los indicadores en una sola pantalla.',
      'Ver si cada indicador va subiendo o bajando.'
    ],
    sintaxis: [
      {
        formula: '% Cumplimiento: =F2/C2',
        partes: [
          { nombre: 'F2 / C2', explicacion: 'Resultado del último trimestre entre la meta. Dale formato de porcentaje.' }
        ]
      },
      {
        formula: 'Tendencia: =SI(F2>E2;"▲";SI(F2<E2;"▼";"►"))',
        partes: [
          { nombre: 'F2 vs E2', explicacion: 'Compara T3 con T2: sube, baja o se queda igual.' }
        ]
      },
      {
        formula: 'Tarjeta: =PROMEDIO(G2:G9)',
        partes: [
          { nombre: 'G2:G9', explicacion: 'El promedio de cumplimiento de todos los indicadores. Ponlo en una celda grande, combinada y con letra gigante.' }
        ]
      }
    ],
    ejemplos: [
      {
        titulo: 'Hoja Indicadores (cuadro de mando)',
        columnas: ['Indicador', 'Meta', 'T2', 'T3', '% Cumplimiento', 'Tendencia'],
        filas: [
          ['Satisfacción del cliente', 85, 86, 88, { v: '104%', tono: 'verde', activa: true }, '▲'],
          ['Entregas a tiempo', 95, 91, 96, { v: '101%', tono: 'verde' }, '▲'],
          ['Documentos vigentes', 90, 78, 80, { v: '89%', tono: 'rojo' }, '▲'],
          ['Mantenimientos preventivos', 90, 75, 70, { v: '78%', tono: 'rojo' }, '▼']
        ],
        formula: { celda: 'E2', texto: '=D2/B2' },
        nota: 'Semáforo del cuadro de mando: verde ≥ 100%, amarillo entre 90% y 100%, rojo < 90%. Documentos vigentes sube (▲) pero sigue en rojo: la tendencia y el semáforo cuentan cosas distintas.'
      }
    ],
    pasos: [
      'Calcula % Cumplimiento y Tendencia para cada indicador.',
      'Aplica el semáforo a % Cumplimiento.',
      'Inserta un gráfico de columnas agrupadas con Indicador, Meta y T3. Si quieres, cambia la serie Meta a línea (gráfico combinado).',
      'Agrega minigráficos de línea con T1:T3 en una columna al lado.',
      'Arma la tarjeta de resumen con el promedio general.'
    ],
    errores: [
      'Calcular el cumplimiento como T3 - Meta: eso da puntos de diferencia, no porcentaje.',
      'Llenar el cuadro de mando de colores y gráficos: si todo grita, nada se entiende. Menos es más.'
    ],
    actividades: ['4.4']
  }
]

// para encontrar rápido qué temas explican una actividad
export const temasPorActividad = temas.reduce((mapa, tema) => {
  for (const codigo of tema.actividades) {
    mapa[codigo] = [...(mapa[codigo] || []), tema]
  }
  return mapa
}, {})
