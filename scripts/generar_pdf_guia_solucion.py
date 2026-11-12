#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera el PDF con la Guía Integral de Resolución Paso a Paso del Taller de Excel:
'Guia_Solucion_Taller_Excel_SIG.pdf'

Cubre desde el reconocimiento del entorno, referencias absolutas ($), operaciones
aritméticas, funciones estadísticas básicas (SUMA, PROMEDIO, MAX, MIN, CONTAR, CONTARA),
hasta la Función SI con los operadores lógicos Y (AND) y O (OR), y Formato Condicional.
Contextualizado en la empresa ficticia Lácteos del Caribe S.A.S. (Ficha 3312002 SIG).
"""

from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak
)
from reportlab.pdfgen import canvas

# Colores de identidad corporativa
VERDE_SENA = colors.HexColor("#107C41")
VERDE_OSCURO = colors.HexColor("#0D5E32")
VERDE_SUAVE = colors.HexColor("#E8F5E9")
AZUL_MARINO = colors.HexColor("#1E40AF")
AZUL_SUAVE = colors.HexColor("#DBEAFE")
GRIS_TEXTO = colors.HexColor("#1F2937")
GRIS_SUAVE = colors.HexColor("#F9FAFB")
GRIS_BORDE = colors.HexColor("#D1D5DB")
AMARILLO_ALERTA = colors.HexColor("#FEF3C7")
AMARILLO_TEXTO = colors.HexColor("#92400E")
ROJO_ALERTA = colors.HexColor("#FEE2E2")
ROJO_TEXTO = colors.HexColor("#991B1B")


class NumberedCanvas(canvas.Canvas):
    """Genera encabezados y pies de página dinámicos con 'Página X de Y'."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        
        # Encabezado superior a partir de la página 2
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(VERDE_SENA)
            self.drawString(36, 756, "LÁCTEOS DEL CARIBE S.A.S. | COORDINACIÓN EN SISTEMAS INTEGRADOS DE GESTIÓN (SIG)")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#4B5563"))
            self.drawRightString(576, 756, "Guía de solución · Ficha 3312002")
            
            self.setStrokeColor(GRIS_BORDE)
            self.setLineWidth(0.5)
            self.line(36, 749, 576, 749)

        # Pie de página en todas las hojas
        self.setStrokeColor(GRIS_BORDE)
        self.setLineWidth(0.5)
        self.line(36, 38, 576, 38)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#4B5563"))
        self.drawString(36, 28, "Competencia TIC: Manejo de hojas de cálculo | Taller hasta la función SI con Y y O")
        
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.setFont("Helvetica-Bold", 7.5)
        self.drawRightString(576, 28, page_str)
        self.restoreState()


def crear_caja_destacada(titulo, contenido_parrafos, color_fondo, color_borde, color_titulo=None, ancho=540):
    """Crea una tarjeta visual estilizada con borde y fondo para resaltar tips o fórmulas."""
    estilos = getSampleStyleSheet()
    col_tit = color_titulo or color_borde
    
    elementos = []
    if titulo:
        p_tit = Paragraph(f"<b>{titulo}</b>", ParagraphStyle(
            'CajaTit',
            parent=estilos['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11.5,
            textColor=col_tit,
            spaceAfter=3
        ))
        elementos.append(p_tit)

    for p in contenido_parrafos:
        if isinstance(p, str):
            p_obj = Paragraph(p, ParagraphStyle(
                'CajaCont',
                parent=estilos['Normal'],
                fontName='Helvetica',
                fontSize=8.2,
                leading=11,
                textColor=GRIS_TEXTO
            ))
            elementos.append(p_obj)
        else:
            elementos.append(p)

    t = Table([[elementos]], colWidths=[ancho])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), color_fondo),
        ('BOX', (0, 0), (-1, -1), 0.75, color_borde),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def construir_pdf(ruta_destino):
    doc = SimpleDocTemplate(
        str(ruta_destino),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    estilos = getSampleStyleSheet()

    # Estilos tipográficos
    estilo_titulo = ParagraphStyle(
        'TituloPortada',
        parent=estilos['Title'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=VERDE_OSCURO,
        alignment=0,
        spaceAfter=4
    )

    estilo_subtitulo = ParagraphStyle(
        'SubtituloPortada',
        parent=estilos['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13.5,
        textColor=colors.HexColor("#374151"),
        alignment=0,
        spaceAfter=10
    )

    estilo_h1 = ParagraphStyle(
        'Encabezado1',
        parent=estilos['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=VERDE_OSCURO,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    estilo_h2 = ParagraphStyle(
        'Encabezado2',
        parent=estilos['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=9.8,
        leading=13,
        textColor=AZUL_MARINO,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    estilo_cuerpo = ParagraphStyle(
        'Cuerpo',
        parent=estilos['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=GRIS_TEXTO,
        spaceAfter=5
    )

    estilo_th = ParagraphStyle(
        'TableHead',
        parent=estilos['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    estilo_td = ParagraphStyle(
        'TableData',
        parent=estilos['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=9.8,
        textColor=GRIS_TEXTO
    )

    estilo_td_center = ParagraphStyle(
        'TableDataCenter',
        parent=estilo_td,
        alignment=1
    )

    estilo_td_bold = ParagraphStyle(
        'TableDataBold',
        parent=estilo_td,
        fontName='Helvetica-Bold'
    )

    story = []

    # =========================================================================
    # PÁGINA 1: PORTADA Y FUNDAMENTOS
    # =========================================================================
    datos_header = [
        [
            Paragraph("<b>SERVICIO NACIONAL DE APRENDIZAJE · SENA</b><br/><font size='7.5'>Centro de Formación · Coordinación en Sistemas Integrados de Gestión</font>", ParagraphStyle('H1_Box', parent=estilos['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11.5, textColor=VERDE_OSCURO)),
            Paragraph("<b>FICHA: 3312002</b><br/><font size='7.5'>Empresa: Lácteos del Caribe S.A.S.</font>", ParagraphStyle('H2_Box', parent=estilos['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=GRIS_TEXTO))
        ]
    ]
    t_header = Table(datos_header, colWidths=[350, 190])
    t_header.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 1.2, VERDE_SENA),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 8))

    story.append(Paragraph("GUÍA DE SOLUCIÓN PASO A PASO", estilo_titulo))
    story.append(Paragraph("<b>Taller de Excel:</b> el signo $ en las fórmulas, operaciones básicas, funciones de resumen y la función SI combinada con Y / O.", estilo_subtitulo))

    # Ficha Técnica (sin emojis: Helvetica no los conoce y salen como cuadritos)
    resumen_caso = [
        "<b>Archivo:</b> <font face='Courier'>Ejercicio_Practico_Excel_Hasta_Funcion_SI.xlsx</font>. Trabaje en la pestaña <b>Taller_Estudiante</b>.",
        "<b>¿De qué se trata?</b> La empresa Lácteos del Caribe S.A.S. está revisando sus documentos (manuales, planes, procedimientos). "
        "Usted debe calcular cuánto cuesta hacer cada documento, cuántos días le faltan para vencerse, cuáles están a punto de vencerse, "
        "cuáles necesitan atención urgente y, al final, un pequeño resumen con totales y promedios.",
        "<b>Fecha de referencia (\"hoy\" para el ejercicio):</b> 22/10/2026, guardada en la celda <b>C4</b>."
    ]
    story.append(crear_caja_destacada("¿QUÉ VAMOS A HACER?", resumen_caso, VERDE_SUAVE, VERDE_SENA, VERDE_OSCURO))
    story.append(Spacer(1, 8))

    # 1. Estructura del libro
    story.append(Paragraph("1. Las 3 pestañas del archivo", estilo_h1))
    datos_hojas = [
        [Paragraph("Pestaña", estilo_th), Paragraph("Color", estilo_th), Paragraph("¿Para qué sirve?", estilo_th)],
        [Paragraph("<b>Enunciado</b>", estilo_td), Paragraph("Verde", estilo_td_center), Paragraph("Explica el caso, lo que se va a evaluar y los pasos a seguir. Léala primero.", estilo_td)],
        [Paragraph("<b>Taller_Estudiante</b>", estilo_td), Paragraph("Azul", estilo_td_center), Paragraph("<b>Aquí es donde usted trabaja.</b> Las celdas en amarillo claro son las que debe llenar con fórmulas.", estilo_td)],
        [Paragraph("<b>Solucion_Docente</b>", estilo_td), Paragraph("Naranja", estilo_td_center), Paragraph("Tiene el taller ya resuelto. Úsela solo al final para comparar sus resultados.", estilo_td)],
    ]
    t_hojas = Table(datos_hojas, colWidths=[120, 55, 365])
    t_hojas.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERDE_SENA),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(t_hojas)
    story.append(Spacer(1, 8))

    # 2. Parámetros y el $
    story.append(Paragraph("2. Los 3 datos fijos y para qué sirve el signo $", estilo_h1))
    story.append(Paragraph(
        "Arriba de la tabla hay tres datos que se usan en todas las filas. Como no cambian, en las fórmulas se escriben con signo $:",
        estilo_cuerpo
    ))
    datos_params = [
        [Paragraph("Dato", estilo_th), Paragraph("Celda", estilo_th), Paragraph("Valor", estilo_th), Paragraph("Se escribe así", estilo_th), Paragraph("¿Dónde se usa?", estilo_th)],
        [Paragraph("<b>Fecha de referencia (\"hoy\")</b>", estilo_td), Paragraph("<b>C4</b>", estilo_td_center), Paragraph("22/10/2026", estilo_td_center), Paragraph("$C$4", estilo_td_center), Paragraph("Para saber cuántos días faltan: =H9-$C$4", estilo_td)],
        [Paragraph("<b>Precio de una hora de trabajo</b>", estilo_td), Paragraph("<b>C5</b>", estilo_td_center), Paragraph("$ 35.000", estilo_td_center), Paragraph("$C$5", estilo_td_center), Paragraph("Para calcular el costo: =F9*$C$5", estilo_td)],
        [Paragraph("<b>Días de aviso</b>", estilo_td), Paragraph("<b>C6</b>", estilo_td_center), Paragraph("30", estilo_td_center), Paragraph("$C$6", estilo_td_center), Paragraph("Para avisar cuando falten 30 días o menos", estilo_td)],
    ]
    t_params = Table(datos_params, colWidths=[120, 40, 75, 75, 230])
    t_params.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), AZUL_MARINO),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(t_params)
    story.append(Spacer(1, 6))

    box_dolar = [
        "<b>¿Por qué hay que ponerle el signo $?</b>",
        "Cuando usted copia una fórmula hacia abajo (arrastrándola), Excel va cambiando las celdas solito: "
        "F9 se vuelve F10, luego F11, y así. Eso está bien para los datos de cada documento, "
        "pero el precio por hora está en <b>una sola celda</b> (C5). Si no le pone el $, al bajar Excel busca C6, C7... "
        "que no tienen el precio, y el resultado sale mal o en <b>$ 0</b>.",
        "El signo $ le dice a Excel: <b>\"esta celda no se mueve\"</b>.",
        "<b>Truco rápido:</b> escriba C5 en la fórmula y presione la tecla <b>F4</b> (en algunos portátiles es <b>Fn + F4</b>). "
        "Excel le pone los $ automáticamente y queda $C$5."
    ]
    story.append(crear_caja_destacada("MUY IMPORTANTE: EL SIGNO $", box_dolar, AMARILLO_ALERTA, colors.HexColor("#D97706"), AMARILLO_TEXTO))

    # =========================================================================
    # PÁGINA 2: FORMULACIÓN DE LA MATRIZ (PASOS 1 A 4)
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Llenando la tabla, columna por columna", estilo_h1))
    story.append(Paragraph(
        "En la pestaña <b>Taller_Estudiante</b>, vaya a la fila 9 (el primer documento, código PE-01-MN-01). "
        "Escriba ahí cada fórmula y después cópiela hacia abajo hasta la fila 23. "
        "En los pasos, el símbolo <b>»</b> significa \"y luego\".",
        estilo_cuerpo
    ))

    # Paso 1
    story.append(Paragraph("Paso 1: Columna I — ¿Cuánto cuesta hacer cada documento?", estilo_h2))
    p1 = [
        "<b>Escriba en la celda I9:</b> <font color='#0D5E32' size='9'><b>=F9*$C$5</b></font>",
        "<b>En palabras:</b> horas de trabajo (F9) multiplicadas (*) por el precio de una hora ($C$5).",
        "<b>Cómo hacerlo:</b> escriba = » haga clic en F9 » escriba * » haga clic en C5 » presione <b>F4</b> » presione Enter.",
        "<b>Copiar hacia abajo:</b> ponga el mouse en la esquina inferior derecha de I9 hasta que aparezca una crucecita negra "
        "y haga doble clic. La fórmula se copia sola hasta I23.",
        "<b>Para que se vea como plata:</b> seleccione de I9 a I23 » presione <b>Ctrl + 1</b> » elija <i>Moneda</i> » símbolo $ » 0 decimales."
    ]
    story.append(crear_caja_destacada("PASO 1: UNA MULTIPLICACIÓN", p1, GRIS_SUAVE, GRIS_BORDE, AZUL_MARINO))
    story.append(Spacer(1, 6))

    # Paso 2
    story.append(Paragraph("Paso 2: Columna J — ¿Cuántos días le faltan para vencerse?", estilo_h2))
    p2 = [
        "<b>Escriba en la celda J9:</b> <font color='#0D5E32' size='9'><b>=H9-$C$4</b></font>",
        "<b>En palabras:</b> fecha en que se vence el documento (H9) menos la fecha de \"hoy\" ($C$4). "
        "Excel resta fechas y le da el número de días.",
        "<b>Cómo hacerlo:</b> escriba = » clic en H9 » escriba - » clic en C4 » presione <b>F4</b> » Enter » copie hasta J23.",
        "<b>Cómo leer el resultado:</b>",
        "&nbsp;&nbsp;• Número negativo (ej. -7): el documento <b>ya se venció</b> (hace 7 días).",
        "&nbsp;&nbsp;• Entre 0 y 30: está <b>a punto de vencerse</b>.",
        "&nbsp;&nbsp;• Más de 30: está <b>al día</b>, todavía tiene tiempo."
    ]
    story.append(crear_caja_destacada("PASO 2: UNA RESTA DE FECHAS", p2, GRIS_SUAVE, GRIS_BORDE, AZUL_MARINO))
    story.append(Spacer(1, 6))

    # Paso 3: SI con Y
    story.append(Paragraph("Paso 3: Columna K — ¿Está a punto de vencerse? (SI con Y)", estilo_h2))
    p3 = [
        "<b>Escriba en la celda K9:</b> <font color='#0D5E32' size='9'><b>=SI(Y(J9&gt;=0; J9&lt;=$C$6); \"POR VENCER\"; \"NORMAL\")</b></font>",
        "<b>La función SI</b> funciona como una pregunta: <i>SI pasa esto; escriba esto; si no, escriba esto otro</i>.",
        "<b>La función Y</b> exige que se cumplan <b>las dos condiciones al mismo tiempo</b>:",
        "&nbsp;&nbsp;1. J9&gt;=0 — todavía no se ha vencido (le quedan 0 días o más).",
        "&nbsp;&nbsp;2. J9&lt;=$C$6 — le quedan 30 días o menos.",
        "Si se cumplen las dos, aparece <b>POR VENCER</b>. Si falla cualquiera (ya se venció, o le faltan más de 30 días), aparece <b>NORMAL</b>.",
        "<i>Ojo: en Excel en español las partes de la fórmula se separan con punto y coma (;) y las palabras van entre comillas (\"...\").</i>"
    ]
    story.append(crear_caja_destacada("PASO 3: SI + Y (TIENEN QUE CUMPLIRSE LAS DOS)", p3, VERDE_SUAVE, VERDE_SENA, VERDE_OSCURO))
    story.append(Spacer(1, 6))

    # Paso 4: SI con O
    story.append(Paragraph("Paso 4: Columna L — ¿Necesita revisión urgente? (SI con O)", estilo_h2))
    p4 = [
        "<b>Escriba en la celda L9:</b> <font color='#991B1B' size='9'><b>=SI(O(J9&lt;0; M9&lt;0,6); \"URGENTE\"; \"CONFORME\")</b></font>",
        "<b>La función O</b> es más relajada: basta con que se cumpla <b>al menos una</b> de las condiciones:",
        "&nbsp;&nbsp;1. J9&lt;0 — el documento ya se venció.",
        "&nbsp;&nbsp;2. M9&lt;0,6 — lleva menos del 60% de avance (0,6 es lo mismo que 60%).",
        "Si pasa cualquiera de las dos, aparece <b>URGENTE</b>. Si no pasa ninguna (no se ha vencido y lleva 60% o más), aparece <b>CONFORME</b>."
    ]
    story.append(crear_caja_destacada("PASO 4: SI + O (BASTA CON QUE SE CUMPLA UNA)", p4, ROJO_ALERTA, colors.HexColor("#EF4444"), ROJO_TEXTO))

    # =========================================================================
    # PÁGINA 3: RESUMEN EJECUTIVO Y FORMATO CONDICIONAL
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. El cuadro resumen (totales, promedios, mayor y menor)", estilo_h1))
    story.append(Paragraph(
        "Debajo de la tabla, en las celdas C27 a C33, se hace un resumen de todo. "
        "Cada celda lleva una función sencilla de Excel:",
        estilo_cuerpo
    ))

    datos_resumen = [
        [Paragraph("¿Qué se pide?", estilo_th), Paragraph("Celda", estilo_th), Paragraph("Fórmula", estilo_th), Paragraph("Debe dar", estilo_th), Paragraph("¿Qué hace la función?", estilo_th)],
        [Paragraph("<b>Cuántos documentos hay</b>", estilo_td), Paragraph("<b>C27</b>", estilo_td_center), Paragraph("=CONTARA(A9:A23)", estilo_td), Paragraph("<b>15</b>", estilo_td_center), Paragraph("Cuenta las celdas que no están vacías (sirve para textos y códigos).", estilo_td)],
        [Paragraph("<b>Cuántos tienen horas anotadas</b>", estilo_td), Paragraph("<b>C28</b>", estilo_td_center), Paragraph("=CONTAR(F9:F23)", estilo_td), Paragraph("<b>15</b>", estilo_td_center), Paragraph("Cuenta solo las celdas que tienen números.", estilo_td)],
        [Paragraph("<b>Cuánto cuestan todos juntos</b>", estilo_td), Paragraph("<b>C29</b>", estilo_td_center), Paragraph("=SUMA(I9:I23)", estilo_td), Paragraph("<b>$ 8.260.000</b>", estilo_td_center), Paragraph("Suma todos los costos.", estilo_td)],
        [Paragraph("<b>Costo promedio de un documento</b>", estilo_td), Paragraph("<b>C30</b>", estilo_td_center), Paragraph("=PROMEDIO(I9:I23)", estilo_td), Paragraph("<b>$ 550.667</b>", estilo_td_center), Paragraph("Suma todos los costos y los divide entre 15.", estilo_td)],
        [Paragraph("<b>El documento más caro</b>", estilo_td), Paragraph("<b>C31</b>", estilo_td_center), Paragraph("=MAX(I9:I23)", estilo_td), Paragraph("<b>$ 875.000</b>", estilo_td_center), Paragraph("Busca el valor más alto. Es el Plan de emergencias (25 horas).", estilo_td)],
        [Paragraph("<b>El documento más barato</b>", estilo_td), Paragraph("<b>C32</b>", estilo_td_center), Paragraph("=MIN(I9:I23)", estilo_td), Paragraph("<b>$ 280.000</b>", estilo_td_center), Paragraph("Busca el valor más bajo. Es el Instructivo de calibración (8 horas).", estilo_td)],
        [Paragraph("<b>Avance promedio</b>", estilo_td), Paragraph("<b>C33</b>", estilo_td_center), Paragraph("=PROMEDIO(M9:M23)", estilo_td), Paragraph("<b>81,3%</b>", estilo_td_center), Paragraph("Saca el promedio del % de avance de la columna M.", estilo_td)]
    ]

    t_resumen = Table(datos_resumen, colWidths=[120, 35, 135, 80, 170])
    t_resumen.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERDE_OSCURO),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRIS_SUAVE]),
    ]))
    story.append(t_resumen)
    story.append(Spacer(1, 10))

    # 5. Formato Condicional
    story.append(Paragraph("5. Ponerle colores automáticos (como un semáforo)", estilo_h1))
    story.append(Paragraph(
        "El <b>formato condicional</b> hace que Excel pinte la celda solita según lo que diga. "
        "Así, de un vistazo, se ve qué documentos están bien y cuáles tienen problemas.",
        estilo_cuerpo
    ))
    pasos_fc = [
        "<b>Columna K (de K9 a K23):</b>",
        "1. Seleccione de K9 a K23 » pestaña <b>Inicio</b> » <b>Formato condicional</b> » <b>Reglas para resaltar celdas</b> » <b>Texto que contiene...</b>",
        "2. Escriba POR VENCER » elija <i>Relleno amarillo con texto amarillo oscuro</i> » Aceptar.",
        "3. Sin quitar la selección, repita: <b>Texto que contiene...</b> » escriba NORMAL » elija <i>Relleno verde con texto verde oscuro</i> » Aceptar.",
        "<br/><b>Columna L (de L9 a L23):</b>",
        "1. Seleccione de L9 a L23 » <b>Formato condicional</b> » <b>Reglas para resaltar celdas</b> » <b>Texto que contiene...</b> » escriba URGENTE » elija <i>Relleno rojo claro con texto rojo oscuro</i> » Aceptar.",
        "2. Repita con CONFORME » elija <i>Relleno verde con texto verde oscuro</i> » Aceptar."
    ]
    story.append(crear_caja_destacada("PASO A PASO: COLORES AUTOMÁTICOS", pasos_fc, VERDE_SUAVE, VERDE_SENA, VERDE_OSCURO))

    # =========================================================================
    # PÁGINA 4: TABLA DE VERIFICACIÓN Y ERRORES COMUNES
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Revise sus resultados", estilo_h1))
    story.append(Paragraph(
        "Compare sus 15 filas con esta tabla. Si algún número no le cuadra, revise la fórmula de esa columna "
        "(casi siempre es un $ que se quedó por fuera).",
        estilo_cuerpo
    ))

    encabezados_sol = [
        Paragraph("Código", estilo_th),
        Paragraph("Documento", estilo_th),
        Paragraph("Horas", estilo_th),
        Paragraph("Vence", estilo_th),
        Paragraph("Costo (I)", estilo_th),
        Paragraph("Días (J)", estilo_th),
        Paragraph("Col. K (Y)", estilo_th),
        Paragraph("Col. L (O)", estilo_th),
        Paragraph("Avance", estilo_th)
    ]
    filas_verif = [encabezados_sol]

    datos_oficiales = [
        ("PE-01-MN-01", "Manual del SIG", "24", "15/10/2026", "$ 840.000", "-7", "NORMAL", "URGENTE", "95.0%"),
        ("PE-01-PL-01", "Plan estratégico 2026-2029", "18", "05/11/2026", "$ 630.000", "14", "POR VENCER", "CONFORME", "80.0%"),
        ("PE-02-PR-01", "Proc. control documental", "12", "20/01/2027", "$ 420.000", "90", "NORMAL", "CONFORME", "100.0%"),
        ("PE-02-PR-02", "Proc. auditorías internas", "14", "18/10/2026", "$ 490.000", "-4", "NORMAL", "URGENTE", "60.0%"),
        ("PM-01-PR-01", "Proc. pasteurización leche", "16", "30/10/2026", "$ 560.000", "8", "POR VENCER", "CONFORME", "75.0%"),
        ("PM-01-IN-01", "Inst. termorregistradores", "8", "15/03/2027", "$ 280.000", "144", "NORMAL", "CONFORME", "100.0%"),
        ("PM-02-PR-01", "Proc. PQRS clientes", "10", "12/12/2026", "$ 350.000", "51", "NORMAL", "CONFORME", "85.0%"),
        ("PM-03-PR-01", "Proc. cadena de frío", "12", "10/11/2026", "$ 420.000", "19", "POR VENCER", "CONFORME", "90.0%"),
        ("PA-01-PL-01", "Plan anual capacitación", "20", "01/10/2026", "$ 700.000", "-21", "NORMAL", "URGENTE", "50.0%"),
        ("PA-01-PR-01", "Proc. inducción personal", "10", "28/02/2027", "$ 350.000", "129", "NORMAL", "CONFORME", "100.0%"),
        ("PA-02-PR-01", "Proc. selección proveedores", "15", "08/11/2026", "$ 525.000", "17", "POR VENCER", "CONFORME", "70.0%"),
        ("PA-03-PL-01", "Plan mant. preventivo", "16", "15/04/2027", "$ 560.000", "175", "NORMAL", "CONFORME", "100.0%"),
        ("PA-04-PR-01", "Proc. identificación peligros", "22", "05/09/2026", "$ 770.000", "-47", "NORMAL", "URGENTE", "40.0%"),
        ("PA-04-PL-01", "Plan emergencias SST", "25", "15/11/2026", "$ 875.000", "24", "POR VENCER", "CONFORME", "85.0%"),
        ("PA-05-PR-01", "Proc. gestión residuos (PGIR)", "14", "30/06/2027", "$ 490.000", "251", "NORMAL", "CONFORME", "90.0%"),
    ]

    for item in datos_oficiales:
        cod, nom, h, v, c, d, vy, uo, av = item
        filas_verif.append([
            Paragraph(cod, estilo_td),
            Paragraph(nom, estilo_td),
            Paragraph(h, estilo_td_center),
            Paragraph(v, estilo_td_center),
            Paragraph(c, estilo_td_bold),
            Paragraph(d, estilo_td_center),
            Paragraph(f"<b>{vy}</b>" if vy == "POR VENCER" else vy, estilo_td_center),
            Paragraph(f"<font color='#991B1B'><b>{uo}</b></font>" if uo == "URGENTE" else uo, estilo_td_center),
            # "95.0%" queda en "95%": en Colombia el punto no es decimal y el ,0 sobra
            Paragraph(av.replace(".0%", "%"), estilo_td_center),
        ])

    t_verif = Table(filas_verif, colWidths=[65, 125, 35, 55, 60, 35, 65, 60, 40])
    t_verif.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERDE_SENA),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRIS_SUAVE]),
    ]))
    story.append(t_verif)
    story.append(Spacer(1, 8))

    # Diagnóstico de errores
    story.append(Paragraph("7. Errores que más salen y cómo arreglarlos", estilo_h1))
    errores_data = [
        [Paragraph("Lo que aparece", estilo_th), Paragraph("¿Por qué pasa?", estilo_th), Paragraph("¿Cómo se arregla?", estilo_th)],
        [Paragraph("<b>#¿NOMBRE?</b>", estilo_td), Paragraph("Escribió mal el nombre de una función, o puso una palabra sin comillas (ej. URGENTE en vez de \"URGENTE\").", estilo_td), Paragraph("Revise la ortografía y ponga las palabras entre comillas: \"URGENTE\".", estilo_td)],
        [Paragraph("<b>Al copiar hacia abajo sale $ 0</b>", estilo_td), Paragraph("Le faltó el signo $ a C5 o a C4.", estilo_td), Paragraph("Corrija la fórmula de la fila 9 (clic en C5 y F4) y vuelva a copiarla hacia abajo.", estilo_td)],
        [Paragraph("<b>#¡VALOR!</b>", estilo_td), Paragraph("La fórmula intenta hacer una cuenta con una celda que tiene texto en vez de un número o una fecha.", estilo_td), Paragraph("Revise que las fechas estén escritas como fecha (dd/mm/aaaa) y no como texto.", estilo_td)],
        [Paragraph("<b>Sale ####</b>", estilo_td), Paragraph("No es un error: el número no cabe en la columna.", estilo_td), Paragraph("Haga doble clic en la rayita que separa las letras de las columnas y se ensancha sola.", estilo_td)],
    ]
    t_errores = Table(errores_data, colWidths=[90, 225, 225])
    t_errores.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#374151")),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, GRIS_SUAVE]),
    ]))
    story.append(t_errores)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {ruta_destino}")


def main():
    ruta_salida = Path("Guia_Solucion_Taller_Excel_SIG.pdf").resolve()
    construir_pdf(ruta_salida)

    carpeta_public = Path("public/datos").resolve()
    if carpeta_public.exists():
        ruta_pub = carpeta_public / "Guia_Solucion_Taller_Excel_SIG.pdf"
        construir_pdf(ruta_pub)


if __name__ == "__main__":
    main()
