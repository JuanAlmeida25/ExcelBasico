#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera el archivo de ejercicio práctico integral en Excel:
'Ejercicio_Practico_Excel_Hasta_Funcion_SI.xlsx'

Actualizado: Reemplaza el SI anidado por Función SI simple combinada
con los operadores lógicos Y (AND) y O (OR).
Contextualizado en la empresa ficticia Lácteos del Caribe S.A.S. (Ficha 3312002 SIG).
"""

from datetime import date
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import CellIsRule

# Paleta de colores institucionales
VERDE_OSCURO = "107C41"    # Verde Excel / SENA
VERDE_MEDIO = "15803D"     # Subtítulos y secciones
VERDE_CLARO = "DCFCE7"     # Fondo suave verde
AZUL_HEADER = "1E40AF"     # Pestaña estudiante
AZUL_CLARO = "DBEAFE"      # Fondo suave azul
NARANJA_HEADER = "C2410C"  # Pestaña solución
NARANJA_CLARO = "FFEDD5"   # Fondo suave naranja
GRIS_TEXTO = "1F2937"
GRIS_BORDE = "D1D5DB"
AMARILLO_INPUT = "FEF9C3"  # Celdas que el estudiante debe calcular

borde_fino = Border(
    left=Side(style="thin", color=GRIS_BORDE),
    right=Side(style="thin", color=GRIS_BORDE),
    top=Side(style="thin", color=GRIS_BORDE),
    bottom=Side(style="thin", color=GRIS_BORDE),
)

# 15 documentos del SIG de Lácteos del Caribe S.A.S.
DATOS_DOCUMENTOS = [
    # (Codigo, Nombre, Proceso, Tipo, Responsable, Horas, Emision, Vencimiento, Avance)
    ("PE-01-MN-01", "Manual del Sistema Integrado de Gestión", "PE-01 Direccionamiento estratégico", "Manual", "Laura Pimienta", 24, date(2025, 10, 15), date(2026, 10, 15), 0.95),
    ("PE-01-PL-01", "Plan estratégico institucional 2026-2029", "PE-01 Direccionamiento estratégico", "Plan", "Rafael Mendoza", 18, date(2025, 11, 5), date(2026, 11, 5), 0.80),
    ("PE-02-PR-01", "Procedimiento de control documental y registros", "PE-02 Gestión de la calidad", "Procedimiento", "Laura Pimienta", 12, date(2026, 1, 20), date(2027, 1, 20), 1.00),
    ("PE-02-PR-02", "Procedimiento de auditorías internas del SIG", "PE-02 Gestión de la calidad", "Procedimiento", "Laura Pimienta", 14, date(2025, 10, 18), date(2026, 10, 18), 0.60),
    ("PM-01-PR-01", "Procedimiento operativo de pasteurización de leche", "PM-01 Producción", "Procedimiento", "Andrés Brito", 16, date(2025, 10, 30), date(2026, 10, 30), 0.75),
    ("PM-01-IN-01", "Instructivo de calibración de termorregistradores", "PM-01 Producción", "Instructivo", "Andrés Brito", 8, date(2026, 3, 15), date(2027, 3, 15), 1.00),
    ("PM-02-PR-01", "Procedimiento de atención a PQRS de clientes", "PM-02 Comercial y ventas", "Procedimiento", "Marelvis Ospino", 10, date(2025, 12, 12), date(2026, 12, 12), 0.85),
    ("PM-03-PR-01", "Procedimiento de cadena de frío y transporte", "PM-03 Logística y distribución", "Procedimiento", "Kevin Fragozo", 12, date(2025, 11, 10), date(2026, 11, 10), 0.90),
    ("PA-01-PL-01", "Plan anual de capacitación y entrenamiento", "PA-01 Talento humano", "Plan", "Yesenia Uriana", 20, date(2025, 10, 1), date(2026, 10, 1), 0.50),
    ("PA-01-PR-01", "Procedimiento de inducción y reinducción", "PA-01 Talento humano", "Procedimiento", "Yesenia Uriana", 10, date(2026, 2, 28), date(2027, 2, 28), 1.00),
    ("PA-02-PR-01", "Procedimiento de selección y evaluación de proveedores", "PA-02 Compras", "Procedimiento", "Camilo Iguarán", 15, date(2025, 11, 8), date(2026, 11, 8), 0.70),
    ("PA-03-PL-01", "Plan maestro de mantenimiento preventivo de maquinaria", "PA-03 Mantenimiento", "Plan", "Andrés Brito", 16, date(2026, 4, 15), date(2027, 4, 15), 1.00),
    ("PA-04-PR-01", "Procedimiento de identificación de peligros y valoración de riesgos", "PA-04 SST", "Procedimiento", "Daniela Epiayú", 22, date(2025, 9, 5), date(2026, 9, 5), 0.40),
    ("PA-04-PL-01", "Plan de preparación y atención ante emergencias", "PA-04 SST", "Plan", "Daniela Epiayú", 25, date(2025, 11, 15), date(2026, 11, 15), 0.85),
    ("PA-05-PR-01", "Procedimiento de gestión integral de residuos sólidos (PGIR)", "PA-05 Gestión ambiental", "Procedimiento", "Laura Pimienta", 14, date(2026, 6, 30), date(2027, 6, 30), 0.90)
]


def crear_hoja_instrucciones(ws):
    ws.title = "📖 Guía y Enunciado"
    ws.sheet_properties.tabColor = "107C41"
    ws.views.sheetView[0].showGridLines = True

    # Título principal
    ws.merge_cells("A1:K1")
    top_cell = ws["A1"]
    top_cell.value = "TALLER PRÁCTICO INTEGRAL: FUNDAMENTOS HASTA FUNCIÓN SI (CON Y Y O)"
    top_cell.font = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
    top_cell.fill = PatternFill("solid", fgColor=VERDE_OSCURO)
    top_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 38

    # Subtítulo institucional
    ws.merge_cells("A2:K2")
    sub_cell = ws["A2"]
    sub_cell.value = "Programa: Coordinación en Sistemas Integrados de Gestión | Ficha: 3312002 | Empresa: Lácteos del Caribe S.A.S."
    sub_cell.font = Font(name="Calibri", size=11, bold=True, color="1F2937")
    sub_cell.fill = PatternFill("solid", fgColor="E5E7EB")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 24

    # Contexto del caso
    ws["A4"] = "1. CONTEXTO DEL CASO PRÁCTICO"
    ws["A4"].font = Font(name="Calibri", size=12, bold=True, color=VERDE_OSCURO)
    ws.row_dimensions[4].height = 22

    texto_contexto = (
        "La empresa Lácteos del Caribe S.A.S. se encuentra preparando la auditoría de seguimiento de su Sistema Integrado de Gestión (SIG).\n"
        "La Coordinación SIG cuenta con un listado de 15 documentos clave, pero la matriz está incompleta:\n"
        "Faltan los cálculos del presupuesto de elaboración, los días restantes respecto a la fecha de corte (22/10/2026), y el análisis lógico de riesgos.\n\n"
        "En lugar de estructuras complejas anidadas, la gerencia solicitó evaluar los documentos mediante la Función SI simple combinada con los operadores "
        "lógicos Y (para exigir que se cumplan todas las condiciones simultáneamente) y O (para alertar si se cumple al menos una de las condiciones de riesgo)."
    )
    ws.merge_cells("A5:K5")
    c5 = ws["A5"]
    c5.value = texto_contexto
    c5.font = Font(name="Calibri", size=10)
    c5.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[5].height = 70

    # Tabla de Contenidos Temáticos
    ws["A7"] = "2. CONTENIDO TEMÁTICO INTEGRADO EN ESTE EJERCICIO"
    ws["A7"].font = Font(name="Calibri", size=12, bold=True, color=VERDE_OSCURO)
    ws.row_dimensions[7].height = 22

    encabezados_temas = ["Tema", "Concepto Clave", "Aplicación en el Ejercicio", "Fórmula o Herramienta en Excel"]
    ws.row_dimensions[8].height = 24
    for col_idx, enc in enumerate(encabezados_temas, start=1):
        cell = ws.cell(row=8, column=col_idx, value=enc)
        cell.font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor=VERDE_MEDIO)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = borde_fino

    filas_temas = [
        ("1. Entorno de Excel", "Libros, hojas, celdas, navegación y paneles", "Estructura de hojas, nombres claros e inmovilización de paneles", "Vista > Inmovilizar paneles"),
        ("2. Formatos de Celda", "Tipos de datos: texto, fecha, moneda, porcentaje y número", "Formatear fechas (dd/mm/aaaa), moneda ($ sin decimales), % avance", "Formato de celdas (Ctrl + 1)"),
        ("3. Referencias Absolutas ($)", "Fijar celdas de parámetros para arrastrar fórmulas sin error", "Multiplicar horas por Tarifa fija ($C$5) y restar Fecha de Corte ($C$4)", "Símbolo $ o tecla F4 ($C$4, $C$5)"),
        ("4. Fórmulas Aritméticas", "Operaciones matemáticas elementales (*, -)", "Costo = Horas × Tarifa; Días restantes = Fecha Vencimiento - Fecha Corte", "=F9*$C$5   |   =H9-$C$4"),
        ("5. Funciones Estadísticas", "Resumen de rangos de datos numéricos y alfanuméricos", "Total horas/costo, costo promedio, máximo, mínimo, recuentos", "=SUMA(), =PROMEDIO(), =MAX(), =MIN(), =CONTAR(), =CONTARA()"),
        ("6. Función SI con operador Y", "Exige que TODAS las condiciones evaluadas sean verdaderas a la vez", "Identificar si está en ventana crítica: Días >= 0 Y Días <= 30", '=SI(Y(J9>=0; J9<=$C$6); "POR VENCER"; "NORMAL")'),
        ("7. Función SI con operador O", "Devuelve verdadero si AL MENOS UNA de las condiciones se cumple", "Alertar revisión urgente si: Ya venció (Días < 0) O Avance < 60%", '=SI(O(J9<0; M9<0.6); "URGENTE"; "CONFORME")'),
        ("8. Formato Condicional", "Alertas visuales automáticas basadas en texto y valores", "Colores automáticos: Amarillo para 'POR VENCER', Rojo para 'URGENTE', Verde 'CONFORME'", "Inicio > Formato condicional > Resaltar celdas")
    ]

    for row_idx, fila in enumerate(filas_temas, start=9):
        ws.row_dimensions[row_idx].height = 24
        fill_color = "F9FAFB" if row_idx % 2 == 0 else "FFFFFF"
        for col_idx, val in enumerate(fila, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name="Calibri", size=9.5)
            cell.fill = PatternFill("solid", fgColor=fill_color)
            cell.border = borde_fino
            cell.alignment = Alignment(horizontal="center" if col_idx == 1 else "left", vertical="center")

    # Requerimientos detallados paso a paso
    start_req = 18
    ws.cell(row=start_req, column=1, value="3. GUÍA PASO A PASO PARA RESOLVER EL TALLER").font = Font(name="Calibri", size=12, bold=True, color=VERDE_OSCURO)
    ws.row_dimensions[start_req].height = 22

    pasos = [
        ("Paso 1: Parámetros del SIG", "En la hoja '🎯 Taller_Estudiante' revise las celdas C4:C6 (Fecha de corte: 22/10/2026, Tarifa: $35.000, Alerta: 30 días). Sus fórmulas deben enlazar estas celdas fijadas con signo $ ($C$4, $C$5, $C$6)."),
        ("Paso 2: Costo de Elaboración (Columna I)", "En la celda I9 escriba la fórmula que multiplica las Horas Estimadas (F9) por la Tarifa fija ($C$5):\n=F9*$C$5\nCopie la fórmula hacia abajo hasta la fila 23."),
        ("Paso 3: Días para Vencimiento (Columna J)", "En la celda J9 reste la Fecha de Vencimiento (H9) menos la Fecha de Corte ($C$4):\n=H9-$C$4\nCopie la fórmula hacia abajo. Un valor negativo indica que el documento ya venció."),
        ("Paso 4: Ventana Crítica con SI y función Y (Columna K)", "En la celda K9 evalúe si el documento está dentro de la ventana de alerta (entre 0 y 30 días para vencer):\nAmbas condiciones deben cumplirse simultáneamente (Días >= 0 Y Días <= $C$6).\nFórmula exacta: =SI(Y(J9>=0; J9<=$C$6); \"POR VENCER\"; \"NORMAL\"). Luego arrastre hasta la fila 23."),
        ("Paso 5: Revisión Urgente con SI y función O (Columna L)", "En la celda L9 determine si el documento requiere intervención urgente en la auditoría:\nBasta con que se cumpla AL MENOS UNA de dos alertas: que ya esté vencido (J9 < 0) O que su porcentaje de avance sea menor al 60% (M9 < 0,6).\nFórmula exacta: =SI(O(J9<0; M9<0.6); \"URGENTE\"; \"CONFORME\"). Luego arrastre hasta la fila 23."),
        ("Paso 6: Cuadro Resumen Ejecutivo (Celdas C26 a C32)", "Formule las estadísticas generales del portafolio documental:\n• C26 (Total docs): =CONTARA(A9:A23)\n• C27 (Docs con horas): =CONTAR(F9:F23)\n• C28 (Presupuesto total): =SUMA(I9:I23)\n• C29 (Costo promedio): =PROMEDIO(I9:I23)\n• C30 (Costo máximo): =MAX(I9:I23)\n• C31 (Costo mínimo): =MIN(I9:I23)\n• C32 (Promedio de avance): =PROMEDIO(M9:M23)"),
        ("Paso 7: Formato Condicional (Semáforo SIG)", "Aplique las reglas de Formato Condicional para resaltar las alertas:\n• En Columna K: 'POR VENCER' en amarillo pastel (#FFEB9C) y 'NORMAL' en verde pastel (#C6EFCE).\n• En Columna L: 'URGENTE' en rojo pastel (#FFC7CE) y 'CONFORME' en verde pastel (#C6EFCE)."),
        ("Paso 8: Validación de Resultados", "Una vez resuelto, consulte la pestaña '💡 Solucion_Docente' para comparar y verificar que todas las cifras y comportamientos coincidan.")
    ]

    for idx, (titulo_paso, detalle_paso) in enumerate(pasos, start=start_req + 1):
        ws.row_dimensions[idx].height = 42 if "\n" in detalle_paso else 26
        cell_t = ws.cell(row=idx, column=1, value=titulo_paso)
        cell_t.font = Font(name="Calibri", size=9.5, bold=True, color="1F2937")
        cell_t.border = borde_fino
        cell_t.alignment = Alignment(horizontal="left", vertical="center")

        ws.merge_cells(start_row=idx, start_column=2, end_row=idx, end_column=11)
        cell_d = ws.cell(row=idx, column=2, value=detalle_paso)
        cell_d.font = Font(name="Calibri", size=9.5)
        cell_d.border = borde_fino
        cell_d.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)

    # Anchos de columna en hoja de instrucciones
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 30
    ws.column_dimensions["C"].width = 40
    ws.column_dimensions["D"].width = 35
    for c_letter in ["E", "F", "G", "H", "I", "J", "K"]:
        ws.column_dimensions[c_letter].width = 14


def construir_hoja_datos(ws, es_solucion=False):
    tab_name = "💡 Solucion_Docente" if es_solucion else "🎯 Taller_Estudiante"
    tab_color = NARANJA_HEADER if es_solucion else AZUL_HEADER
    ws.title = tab_name
    ws.sheet_properties.tabColor = tab_color
    ws.views.sheetView[0].showGridLines = True

    color_primario = "9A3412" if es_solucion else "1E40AF"
    color_suave = "FFEDD5" if es_solucion else "DBEAFE"

    # Inmovilizar paneles en C9 (columnas A y B, y filas 1 a 8 fijas al hacer scroll)
    ws.freeze_panes = "C9"

    # Título del archivo
    ws.merge_cells("A1:M1")
    t1 = ws["A1"]
    t1.value = f"LÁCTEOS DEL CARIBE S.A.S. — CONTROL DOCUMENTAL DEL SIG ({'SOLUCIONARIO OFICIAL' if es_solucion else 'TALLER DE PRÁCTICA'})"
    t1.font = Font(name="Calibri", size=13, bold=True, color="FFFFFF")
    t1.fill = PatternFill("solid", fgColor=color_primario)
    t1.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    # Bloque de Parámetros de la Auditoría (Filas 3 a 6)
    ws["A3"] = "PARÁMETROS DEL SIG:"
    ws["A3"].font = Font(name="Calibri", size=10, bold=True, color="1F2937")
    ws["A3"].alignment = Alignment(horizontal="left", vertical="center")

    params = [
        (4, "Fecha de corte de auditoría:", date(2026, 10, 22), "DD/MM/AAAA", "$C$4"),
        (5, "Tarifa fija por hora ($ COP):", 35000, "$ #,##0", "$C$5"),
        (6, "Alerta por vencer (días límite):", 30, "0", "$C$6")
    ]

    for r_idx, label, valor, num_fmt, ref_label in params:
        ws.row_dimensions[r_idx].height = 20
        cell_lbl = ws.cell(row=r_idx, column=2, value=label)
        cell_lbl.font = Font(name="Calibri", size=9.5, bold=True)
        cell_lbl.alignment = Alignment(horizontal="right", vertical="center")

        cell_val = ws.cell(row=r_idx, column=3, value=valor)
        cell_val.font = Font(name="Calibri", size=10, bold=True, color=color_primario)
        cell_val.fill = PatternFill("solid", fgColor=color_suave)
        cell_val.alignment = Alignment(horizontal="center", vertical="center")
        cell_val.number_format = num_fmt
        cell_val.border = borde_fino

        cell_ref = ws.cell(row=r_idx, column=4, value=f"← Celda fija {ref_label}")
        cell_ref.font = Font(name="Calibri", size=8.5, italic=True, color="6B7280")
        cell_ref.alignment = Alignment(horizontal="left", vertical="center")

    # Cuadro explicativo a la derecha de los parámetros (G3:M6)
    ws.merge_cells("G3:M6")
    c_nota = ws["G3"]
    if es_solucion:
        c_nota.value = "NOTA PARA EL DOCENTE / VERIFICACIÓN TÉCNICA:\nEsta hoja contiene todas las fórmulas activas. Las columnas I, J, K, L y el Cuadro Resumen se calculan con fórmulas nativas de Excel: Referencias absolutas ($), Operadores matemáticos, Función SI con función Y, Función SI con función O, y Funciones estadísticas (SUMA, PROMEDIO, MAX, MIN, CONTAR, CONTARA)."
    else:
        c_nota.value = "INSTRUCCIONES PARA EL APRENDIZ:\n1. Calcule las columnas I, J, K y L usando fórmulas (no escriba valores fijos).\n2. Use el signo $ para fijar parámetros ($C$4, $C$5 y $C$6).\n3. En Columna K use: =SI(Y(J9>=0; J9<=$C$6); \"POR VENCER\"; \"NORMAL\").\n4. En Columna L use: =SI(O(J9<0; M9<0.6); \"URGENTE\"; \"CONFORME\").\n5. Complete el Cuadro Resumen Ejecutivo (C26:C32)."
    c_nota.font = Font(name="Calibri", size=9, italic=True, color="1F2937")
    c_nota.fill = PatternFill("solid", fgColor="F3F4F6")
    c_nota.alignment = Alignment(wrap_text=True, vertical="center")
    for r in range(3, 7):
        for c in range(7, 14):
            ws.cell(row=r, column=c).border = borde_fino

    # Encabezados de la Tabla Principal (Fila 8)
    headers = [
        ("A", "Código Doc.", 14, "Texto", "475569"),
        ("B", "Nombre del Documento SIG", 36, "Texto", "475569"),
        ("C", "Proceso SIG", 28, "Texto", "475569"),
        ("D", "Tipo", 15, "Texto", "475569"),
        ("E", "Responsable", 20, "Texto", "475569"),
        ("F", "Horas Estimadas", 15, "Número", "475569"),
        ("G", "Fecha Emisión", 14, "Fecha (dd/mm/aaaa)", "475569"),
        ("H", "Fecha Vencimiento", 16, "Fecha (dd/mm/aaaa)", "475569"),
        ("I", "Costo Elaboración ($)", 18, "Fórmula con $C$5", color_primario),
        ("J", "Días para Vencer", 16, "Resta con $C$4", color_primario),
        ("K", "Ventana Crítica (SI con Y)", 19, "Función SI con Y", color_primario),
        ("L", "Revisión Urgente (SI con O)", 19, "Función SI con O", color_primario),
        ("M", "% Avance", 12, "Porcentaje", "475569")
    ]

    ws.row_dimensions[8].height = 28
    for col_letter, title_text, width, _, fill_hex in headers:
        ws.column_dimensions[col_letter].width = width
        cell = ws[f"{col_letter}8"]
        cell.value = title_text
        cell.font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor=fill_hex)
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = borde_fino

    # Llenado de filas de datos (Filas 9 a 23)
    start_row = 9
    for i, item in enumerate(DATOS_DOCUMENTOS):
        r = start_row + i
        ws.row_dimensions[r].height = 20
        fill_row = "F9FAFB" if i % 2 == 1 else "FFFFFF"

        codigo, nombre, proceso, tipo_doc, resp, horas, f_emi, f_venc, avance = item

        # Col A: Código
        cA = ws.cell(row=r, column=1, value=codigo)
        cA.alignment = Alignment(horizontal="center", vertical="center")
        cA.font = Font(name="Calibri", size=9.5)
        cA.fill = PatternFill("solid", fgColor=fill_row)
        cA.border = borde_fino

        # Col B: Nombre
        cB = ws.cell(row=r, column=2, value=nombre)
        cB.alignment = Alignment(horizontal="left", vertical="center")
        cB.font = Font(name="Calibri", size=9.5)
        cB.fill = PatternFill("solid", fgColor=fill_row)
        cB.border = borde_fino

        # Col C: Proceso
        cC = ws.cell(row=r, column=3, value=proceso)
        cC.alignment = Alignment(horizontal="left", vertical="center")
        cC.font = Font(name="Calibri", size=9)
        cC.fill = PatternFill("solid", fgColor=fill_row)
        cC.border = borde_fino

        # Col D: Tipo
        cD = ws.cell(row=r, column=4, value=tipo_doc)
        cD.alignment = Alignment(horizontal="center", vertical="center")
        cD.font = Font(name="Calibri", size=9.5)
        cD.fill = PatternFill("solid", fgColor=fill_row)
        cD.border = borde_fino

        # Col E: Responsable
        cE = ws.cell(row=r, column=5, value=resp)
        cE.alignment = Alignment(horizontal="left", vertical="center")
        cE.font = Font(name="Calibri", size=9.5)
        cE.fill = PatternFill("solid", fgColor=fill_row)
        cE.border = borde_fino

        # Col F: Horas
        cF = ws.cell(row=r, column=6, value=horas)
        cF.alignment = Alignment(horizontal="right", vertical="center")
        cF.font = Font(name="Calibri", size=9.5)
        cF.fill = PatternFill("solid", fgColor=fill_row)
        cF.number_format = "#,##0"
        cF.border = borde_fino

        # Col G: Fecha Emisión
        cG = ws.cell(row=r, column=7, value=f_emi)
        cG.alignment = Alignment(horizontal="center", vertical="center")
        cG.font = Font(name="Calibri", size=9.5)
        cG.fill = PatternFill("solid", fgColor=fill_row)
        cG.number_format = "DD/MM/AAAA"
        cG.border = borde_fino

        # Col H: Fecha Vencimiento
        cH = ws.cell(row=r, column=8, value=f_venc)
        cH.alignment = Alignment(horizontal="center", vertical="center")
        cH.font = Font(name="Calibri", size=9.5)
        cH.fill = PatternFill("solid", fgColor=fill_row)
        cH.number_format = "DD/MM/AAAA"
        cH.border = borde_fino

        # Col M: % Avance
        cM = ws.cell(row=r, column=13, value=avance)
        cM.alignment = Alignment(horizontal="right", vertical="center")
        cM.font = Font(name="Calibri", size=9.5)
        cM.fill = PatternFill("solid", fgColor=fill_row)
        cM.number_format = "0.0%"
        cM.border = borde_fino

        # Columnas a calcular: I, J, K, L
        if es_solucion:
            # Col I: Costo Elaboración = Horas * Tarifa ($C$5)
            cI = ws.cell(row=r, column=9, value=f"=F{r}*$C$5")
            cI.number_format = "$ #,##0"
            cI.alignment = Alignment(horizontal="right", vertical="center")
            cI.font = Font(name="Calibri", size=9.5, bold=True)
            cI.fill = PatternFill("solid", fgColor=fill_row)
            cI.border = borde_fino

            # Col J: Días para Vencer = Fecha Vencimiento - Fecha de Corte ($C$4)
            cJ = ws.cell(row=r, column=10, value=f"=H{r}-$C$4")
            cJ.number_format = "#,##0"
            cJ.alignment = Alignment(horizontal="right", vertical="center")
            cJ.font = Font(name="Calibri", size=9.5, bold=True)
            cJ.fill = PatternFill("solid", fgColor=fill_row)
            cJ.border = borde_fino

            # Col K: Función SI con Y (Ventana Crítica: Días >= 0 Y Días <= $C$6)
            # En inglés para openpyxl: =IF(AND(J8>=0, J8<=$C$6), "POR VENCER", "NORMAL")
            cK = ws.cell(row=r, column=11, value=f'=IF(AND(J{r}>=0, J{r}<=$C$6), "POR VENCER", "NORMAL")')
            cK.alignment = Alignment(horizontal="center", vertical="center")
            cK.font = Font(name="Calibri", size=9.5, bold=True)
            cK.fill = PatternFill("solid", fgColor=fill_row)
            cK.border = borde_fino

            # Col L: Función SI con O (Revisión Urgente: Días < 0 O Avance < 0.6)
            # En inglés para openpyxl: =IF(OR(J8<0, M8<0.6), "URGENTE", "CONFORME")
            cL = ws.cell(row=r, column=12, value=f'=IF(OR(J{r}<0, M{r}<0.6), "URGENTE", "CONFORME")')
            cL.alignment = Alignment(horizontal="center", vertical="center")
            cL.font = Font(name="Calibri", size=9.5, bold=True)
            cL.fill = PatternFill("solid", fgColor=fill_row)
            cL.border = borde_fino
        else:
            # En la hoja del estudiante, dejamos las celdas vacías con fondo amarillo sutil para indicar cálculo
            for col_calc, fmt in [(9, "$ #,##0"), (10, "#,##0"), (11, "@"), (12, "@")]:
                c_calc = ws.cell(row=r, column=col_calc)
                c_calc.value = None
                c_calc.fill = PatternFill("solid", fgColor=AMARILLO_INPUT)
                c_calc.border = borde_fino
                c_calc.number_format = fmt
                c_calc.alignment = Alignment(horizontal="center" if col_calc in [11, 12] else "right", vertical="center")

    # Fila de Totales de Control (Fila 24)
    ws.row_dimensions[24].height = 22
    ws.merge_cells("A24:E24")
    lbl_tot = ws["A24"]
    lbl_tot.value = "TOTALES / PROMEDIOS DE CONTROL:"
    lbl_tot.font = Font(name="Calibri", size=9.5, bold=True, color="1F2937")
    lbl_tot.alignment = Alignment(horizontal="right", vertical="center")
    lbl_tot.fill = PatternFill("solid", fgColor="E5E7EB")
    for col_i in range(1, 6):
        ws.cell(row=24, column=col_i).border = borde_fino

    # Total horas en F24
    cF_tot = ws.cell(row=24, column=6)
    cF_tot.value = "=SUM(F9:F23)"
    cF_tot.font = Font(name="Calibri", size=9.5, bold=True)
    cF_tot.number_format = "#,##0"
    cF_tot.alignment = Alignment(horizontal="right", vertical="center")
    cF_tot.fill = PatternFill("solid", fgColor="E5E7EB")
    cF_tot.border = borde_fino

    for col_i in [7, 8]:
        c_v = ws.cell(row=24, column=col_i, value="")
        c_v.fill = PatternFill("solid", fgColor="E5E7EB")
        c_v.border = borde_fino

    # Total Costo en I24
    cI_tot = ws.cell(row=24, column=9)
    cI_tot.value = "=SUM(I9:I23)"
    cI_tot.font = Font(name="Calibri", size=9.5, bold=True, color=color_primario)
    cI_tot.number_format = "$ #,##0"
    cI_tot.alignment = Alignment(horizontal="right", vertical="center")
    cI_tot.fill = PatternFill("solid", fgColor="E5E7EB")
    cI_tot.border = borde_fino

    # Promedio días en J24
    cJ_tot = ws.cell(row=24, column=10)
    cJ_tot.value = "=AVERAGE(J9:J23)"
    cJ_tot.font = Font(name="Calibri", size=9.5, bold=True)
    cJ_tot.number_format = "#,##0"
    cJ_tot.alignment = Alignment(horizontal="right", vertical="center")
    cJ_tot.fill = PatternFill("solid", fgColor="E5E7EB")
    cJ_tot.border = borde_fino

    for col_i in [11, 12]:
        c_v = ws.cell(row=24, column=col_i, value="")
        c_v.fill = PatternFill("solid", fgColor="E5E7EB")
        c_v.border = borde_fino

    # Promedio avance en M24
    cM_tot = ws.cell(row=24, column=13)
    cM_tot.value = "=AVERAGE(M9:M23)"
    cM_tot.font = Font(name="Calibri", size=9.5, bold=True)
    cM_tot.number_format = "0.0%"
    cM_tot.alignment = Alignment(horizontal="right", vertical="center")
    cM_tot.fill = PatternFill("solid", fgColor="E5E7EB")
    cM_tot.border = borde_fino

    # CUADRO DE RESUMEN EJECUTIVO (Filas 26 a 32)
    ws.merge_cells("A26:D26")
    c_res = ws["A26"]
    c_res.value = "CUADRO RESUMEN EJECUTIVO (FUNCIONES BÁSICAS)"
    c_res.font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    c_res.fill = PatternFill("solid", fgColor=color_primario)
    c_res.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[26].height = 24

    resumen_items = [
        (27, "Total de documentos registrados en el SIG:", "=COUNTA(A9:A23)", "0", "Función =CONTARA(A9:A23)"),
        (28, "Documentos con horas estimadas registradas:", "=COUNT(F9:F23)", "0", "Función =CONTAR(F9:F23)"),
        (29, "Inversión total presupuestada en documentos:", "=SUM(I9:I23)", "$ #,##0", "Función =SUMA(I9:I23)"),
        (30, "Costo promedio por documento elaborado:", "=AVERAGE(I9:I23)", "$ #,##0", "Función =PROMEDIO(I9:I23)"),
        (31, "Documento de mayor costo (Costo Máximo):", "=MAX(I9:I23)", "$ #,##0", "Función =MAX(I9:I23)"),
        (32, "Documento de menor costo (Costo Mínimo):", "=MIN(I9:I23)", "$ #,##0", "Función =MIN(I9:I23)"),
        (33, "Promedio general de avance en implementación:", "=AVERAGE(M9:M23)", "0.0%", "Función =PROMEDIO(M9:M23)")
    ]

    for row_res, descrip, form_val, n_fmt, ayuda_texto in resumen_items:
        ws.row_dimensions[row_res].height = 22
        ws.merge_cells(start_row=row_res, start_column=1, end_row=row_res, end_column=2)
        c_d = ws.cell(row=row_res, column=1, value=descrip)
        c_d.font = Font(name="Calibri", size=9.5, bold=True)
        c_d.alignment = Alignment(horizontal="left", vertical="center")
        c_d.border = borde_fino
        ws.cell(row=row_res, column=2).border = borde_fino

        c_val = ws.cell(row=row_res, column=3)
        if es_solucion:
            c_val.value = form_val
            c_val.fill = PatternFill("solid", fgColor=color_suave)
        else:
            c_val.value = None
            c_val.fill = PatternFill("solid", fgColor=AMARILLO_INPUT)
        c_val.font = Font(name="Calibri", size=10, bold=True, color=color_primario)
        c_val.number_format = n_fmt
        c_val.alignment = Alignment(horizontal="right", vertical="center")
        c_val.border = borde_fino

        c_ayu = ws.cell(row=row_res, column=4, value=f"← {ayuda_texto}")
        c_ayu.font = Font(name="Calibri", size=8.5, italic=True, color="6B7280")
        c_ayu.alignment = Alignment(horizontal="left", vertical="center")

    # CUADRO DE CONVENCIONES DE LAS CONDICIONES LÓGICAS (Col G a K, Filas 26 a 30)
    ws.merge_cells("G26:K26")
    c_sem_tit = ws["G26"]
    c_sem_tit.value = "CRITERIOS DE LAS REGLAS LÓGICAS (Y / O)"
    c_sem_tit.font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    c_sem_tit.fill = PatternFill("solid", fgColor="374151")
    c_sem_tit.alignment = Alignment(horizontal="center", vertical="center")

    sem_items = [
        (27, "Columna K (con Y)", "POR VENCER", "FFEB9C", "9C6500", "Y(J9>=0; J9<=$C$6)", "Cumple ambas: no ha vencido Y faltan <= 30 días."),
        (28, "Columna K (con Y)", "NORMAL", "C6EFCE", "006100", "Falso", "No está en ventana crítica (vence más adelante o ya venció)."),
        (29, "Columna L (con O)", "URGENTE", "FFC7CE", "9C0006", "O(J9<0; M9<0.6)", "Cumple al menos una: o ya venció (Días < 0) O avance < 60%."),
        (30, "Columna L (con O)", "CONFORME", "C6EFCE", "006100", "Falso", "Ninguna condición de alarma: está al día y avance >= 60%.")
    ]

    for row_s, col_origen, estado_lbl, bg_color, txt_color, formula_criterio, explicacion in sem_items:
        ws.row_dimensions[row_s].height = 22
        cell_orig = ws.cell(row=row_s, column=7, value=col_origen)
        cell_orig.font = Font(name="Calibri", size=8.5, bold=True)
        cell_orig.alignment = Alignment(horizontal="center", vertical="center")
        cell_orig.border = borde_fino

        cell_est = ws.cell(row=row_s, column=8, value=estado_lbl)
        cell_est.font = Font(name="Calibri", size=9, bold=True, color=txt_color)
        cell_est.fill = PatternFill("solid", fgColor=bg_color)
        cell_est.alignment = Alignment(horizontal="center", vertical="center")
        cell_est.border = borde_fino

        cell_crit = ws.cell(row=row_s, column=9, value=formula_criterio)
        cell_crit.font = Font(name="Calibri", size=8.5)
        cell_crit.alignment = Alignment(horizontal="center", vertical="center")
        cell_crit.border = borde_fino

        ws.merge_cells(start_row=row_s, start_column=10, end_row=row_s, end_column=11)
        cell_obs = ws.cell(row=row_s, column=10, value=explicacion)
        cell_obs.font = Font(name="Calibri", size=8.5, italic=True)
        cell_obs.alignment = Alignment(horizontal="left", vertical="center")
        cell_obs.border = borde_fino
        ws.cell(row=row_s, column=11).border = borde_fino

    # Formato Condicional en rango de Ventana Crítica (K) y Revisión Urgente (L)
    rango_k = "K9:K23"
    rango_l = "L9:L23"

    # Reglas para columna K (SI con Y)
    regla_por_vencer = CellIsRule(operator="equal", formula=['"POR VENCER"'], fill=PatternFill("solid", fgColor="FFEB9C"), font=Font(color="9C6500", bold=True))
    regla_normal_k = CellIsRule(operator="equal", formula=['"NORMAL"'], fill=PatternFill("solid", fgColor="C6EFCE"), font=Font(color="006100", bold=True))
    ws.conditional_formatting.add(rango_k, regla_por_vencer)
    ws.conditional_formatting.add(rango_k, regla_normal_k)

    # Reglas para columna L (SI con O)
    regla_urgente = CellIsRule(operator="equal", formula=['"URGENTE"'], fill=PatternFill("solid", fgColor="FFC7CE"), font=Font(color="9C0006", bold=True))
    regla_conforme = CellIsRule(operator="equal", formula=['"CONFORME"'], fill=PatternFill("solid", fgColor="C6EFCE"), font=Font(color="006100", bold=True))
    ws.conditional_formatting.add(rango_l, regla_urgente)
    ws.conditional_formatting.add(rango_l, regla_conforme)


def main():
    wb = openpyxl.Workbook()
    default_sheet = wb.active

    # 1. Pestaña de Instrucciones y Guía
    ws_instrucciones = wb.create_sheet(title="📖 Guía y Enunciado")
    crear_hoja_instrucciones(ws_instrucciones)

    # 2. Pestaña para el Estudiante (para resolver)
    ws_estudiante = wb.create_sheet(title="🎯 Taller_Estudiante")
    construir_hoja_datos(ws_estudiante, es_solucion=False)

    # 3. Pestaña con la Solución Oficial para el Docente
    ws_solucion = wb.create_sheet(title="💡 Solucion_Docente")
    construir_hoja_datos(ws_solucion, es_solucion=True)

    # Remover hoja por defecto
    wb.remove(default_sheet)

    # Pestaña activa al abrir: la primera (Guía)
    wb.active = 0

    ruta_salida = Path("Ejercicio_Practico_Excel_Hasta_Funcion_SI.xlsx").resolve()
    wb.save(ruta_salida)
    print(f"Archivo actualizado exitosamente en:\n{ruta_salida}")

    # Guardar también en public/datos
    carpeta_public = Path("public/datos").resolve()
    if carpeta_public.exists():
        ruta_public = carpeta_public / "Ejercicio_Practico_Excel_Hasta_Funcion_SI.xlsx"
        wb.save(ruta_public)
        print(f"Copia guardada en public/datos:\n{ruta_public}")


if __name__ == "__main__":
    main()
