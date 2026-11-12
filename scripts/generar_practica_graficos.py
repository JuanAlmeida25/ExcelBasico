#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Libro de Práctica de Tipos de Gráficos en Microsoft Excel.
Archivo de salida: Practica_Tipos_de_Graficos_Excel.xlsx

Incluye:
- Hoja 0: Guía Teórica y Matriz de Decisión de Gráficos.
- Hoja 1: Columnas y Barras (Comparación y rankings).
- Hoja 2: Líneas y Tendencias (Evolución temporal y metas).
- Hoja 3: Circular y Anillos (Composición porcentual de un todo).
- Hoja 4: Dispersión XY (Correlación y línea de tendencia).
- Hoja 5: Combinado con Doble Eje (Diferentes magnitudes y unidades).
- Hoja 6: Áreas y Apilados (Evolución del total y sus partes).
- Hoja 7: Histograma y Distribución (Frecuencias estadísticas).
- Hoja 8: Radial y Cascada (Evaluación multidimensional y flujo financiero).
"""

from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import (
    BarChart,
    LineChart,
    PieChart,
    DoughnutChart,
    ScatterChart,
    AreaChart,
    RadarChart,
    Reference,
    Series,
)

# Paleta de Colores
AZUL_MARINO = "1E3A8A"    # Encabezado principal y tablas principales
AZUL_MEDIO = "2563EB"     # Acentos y títulos secundarios
AZUL_SUAVE = "EFF6FF"     # Fondos suaves de instrucciones
VERDE_SELVA = "065F46"    # Tablas secundarias / Casos B
VERDE_SUAVE = "ECFDF5"    # Fondos verdes suaves
NARANJA_ACC = "C2410C"    # Alertas y consejos pro
NARANJA_SUAVE = "FFF7ED"  # Fondos de notas
PIZARRA = "0F172A"        # Texto principal
GRIS_BORDE = "CBD5E1"     # Líneas de tablas
GRIS_CLARO = "F8FAFC"     # Filas alternas
BLANCO = "FFFFFF"

# Estilos reutilizables
borde_celda = Border(
    left=Side(style="thin", color=GRIS_BORDE),
    right=Side(style="thin", color=GRIS_BORDE),
    top=Side(style="thin", color=GRIS_BORDE),
    bottom=Side(style="thin", color=GRIS_BORDE),
)

borde_total = Border(
    top=Side(style="thin", color=PIZARRA),
    bottom=Side(style="double", color=PIZARRA),
    left=Side(style="thin", color=GRIS_BORDE),
    right=Side(style="thin", color=GRIS_BORDE),
)

font_titulo = Font(name="Segoe UI", size=15, bold=True, color="1E293B")
font_subtitulo = Font(name="Segoe UI", size=10, italic=True, color="64748B")
font_seccion = Font(name="Segoe UI", size=11, bold=True, color="1E3A8A")
font_th = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
font_td = Font(name="Segoe UI", size=10, color=PIZARRA)
font_total = Font(name="Segoe UI", size=10, bold=True, color=PIZARRA)
font_guia_tit = Font(name="Segoe UI", size=10, bold=True, color="1E3A8A")
font_guia_txt = Font(name="Segoe UI", size=9.5, color="334155")

fill_th = PatternFill("solid", fgColor=AZUL_MARINO)
fill_th_sec = PatternFill("solid", fgColor=VERDE_SELVA)
fill_zebra = PatternFill("solid", fgColor=GRIS_CLARO)
fill_caja_info = PatternFill("solid", fgColor=AZUL_SUAVE)
fill_caja_alerta = PatternFill("solid", fgColor=NARANJA_SUAVE)
fill_total = PatternFill("solid", fgColor="E2E8F0")

align_center = Alignment(horizontal="center", vertical="center")
align_left = Alignment(horizontal="left", vertical="center")
align_right = Alignment(horizontal="right", vertical="center")
align_wrap = Alignment(horizontal="left", vertical="top", wrap_text=True)


def configurar_vista(ws):
    """Asegura visualización limpia con cuadrículas visibles."""
    ws.views.sheetView[0].showGridLines = True


def ajustar_columnas(ws, min_col=1, max_col=None, padding=3):
    """Ajusta automáticamente el ancho de las columnas."""
    if max_col is None:
        max_col = ws.max_column
    for col in range(min_col, max_col + 1):
        col_letter = get_column_letter(col)
        max_len = 0
        for row in range(1, ws.max_row + 1):
            cell = ws.cell(row=row, column=col)
            # No sobredimensionar celdas combinadas de títulos
            if cell.coordinate in ws.merged_cells:
                continue
            if cell.value is not None:
                longitud = len(str(cell.value))
                if longitud > max_len and longitud < 60:
                    max_len = longitud
        ws.column_dimensions[col_letter].width = max(max_len + padding, 12)


def agregar_encabezado_hoja(ws, titulo, descripcion):
    """Agrega un encabezado corporativo elegante a la hoja."""
    ws.cell(row=2, column=2, value=titulo).font = font_titulo
    ws.cell(row=3, column=2, value=descripcion).font = font_subtitulo
    ws.row_dimensions[2].height = 24
    ws.row_dimensions[3].height = 18


def agregar_caja_instrucciones(ws, fila_inicio, col_inicio, ancho_cols, titulo, lineas_texto, es_alerta=False):
    """Agrega un cuadro de instrucciones o mejores prácticas."""
    fila_fin = fila_inicio + len(lineas_texto) + 1
    col_fin = col_inicio + ancho_cols - 1

    # Título del cuadro
    cell_tit = ws.cell(row=fila_inicio, column=col_inicio, value=titulo)
    cell_tit.font = Font(name="Segoe UI", size=10.5, bold=True, color="9A3412" if es_alerta else "1E40AF")
    fill_box = fill_caja_alerta if es_alerta else fill_caja_info

    for r in range(fila_inicio, fila_fin + 1):
        for c in range(col_inicio, col_fin + 1):
            cell = ws.cell(row=r, column=c)
            cell.fill = fill_box
            cell.border = borde_celda

    # Escribir líneas de texto
    for idx, linea in enumerate(lineas_texto):
        cell_txt = ws.cell(row=fila_inicio + 1 + idx, column=col_inicio, value=linea)
        cell_txt.font = font_guia_txt
        cell_txt.alignment = Alignment(horizontal="left", vertical="center")


# ==============================================================================
# 0. ÍNDICE Y GUÍA DE SELECCIÓN DE GRÁFICOS
# ==============================================================================
def construir_hoja_indice(wb):
    ws = wb.active
    ws.title = "0. Menú y Guía Teórica"
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "GUÍA DE SELECCIÓN Y PRÁCTICA DE GRÁFICOS EN EXCEL",
        "Aprende qué tipo de gráfico elegir según la historia que tus datos necesitan contar.",
    )

    # Introducción
    ws.cell(row=5, column=2, value="¿CÓMO SABER QUÉ GRÁFICO USAR? (MATRIZ DE DECISIÓN)").font = font_seccion

    encabezados = [
        "Tipo de Gráfico",
        "Propósito Principal",
        "¿Cuándo Usarlo?",
        "¿Cuándo NO Usarlo?",
        "Pestaña Práctica",
        "Atajo / Inserción",
    ]

    matriz = [
        (
            "Columnas Agrupadas",
            "Comparar valores discretos",
            "Pocas categorías (menos de 10) en un mismo periodo o tiempo.",
            "Muchos periodos continuos o nombres de categoría muy largos.",
            "1. Columnas y Barras",
            "Alt + F1 (Crear gráfico rápido)",
        ),
        (
            "Barras Horizontales",
            "Rankings y comparaciones",
            "Nombres de categorías largos o clasificaciones de mayor a menor.",
            "Series temporales de izquierda a derecha (el tiempo debe ir en el eje X).",
            "1. Columnas y Barras",
            "Insertar > Gráfico de Barras",
        ),
        (
            "Columnas Apiladas (100%)",
            "Composición porcentual",
            "Ver cómo se divide cada categoría en subcomponentes sumando el 100%.",
            "Cuando se quiere comparar el valor absoluto de cada segmento individual.",
            "1. Columnas y Barras",
            "Insertar > Columna apilada",
        ),
        (
            "Líneas con Marcadores",
            "Tendencia temporal continua",
            "Evolución a lo largo de meses, trimestres, años; picos y caídas.",
            "Comparar categorías sin orden lógico (ej. colores de autos).",
            "2. Líneas y Tendencias",
            "Insertar > Gráficos de Líneas",
        ),
        (
            "Circular (Pie) y Anillos",
            "Parte de un todo (100%)",
            "Máximo 4 a 6 rebanadas. Excelente para cuotas de mercado o porcentajes.",
            "Más de 7 categorías o valores muy similares difíciles de distinguir.",
            "3. Circular y Anillos",
            "Insertar > Gráfico Circular",
        ),
        (
            "Dispersión (XY)",
            "Correlación entre 2 variables",
            "Detectar si una variable numérica depende o varía respecto a otra (ej. Inversión vs Ventas).",
            "Datos categóricos o cualitativos sin escala numérica.",
            "4. Dispersión XY",
            "Insertar > Gráfico de Dispersión",
        ),
        (
            "Combinado (Doble Eje)",
            "Comparar diferentes escalas",
            "Mostrar volumen (ej. $ Ventas) y tasa relativa (ej. % Margen) juntos.",
            "Cuando ambas métricas tienen la misma unidad y escala.",
            "5. Combinado (Doble Eje)",
            "Insertar > Gráfico Combinado",
        ),
        (
            "Áreas Apiladas",
            "Evolución del total y partes",
            "Ver cómo crece el volumen global y qué porción aporta cada canal con el tiempo.",
            "Cuando hay cruces frecuentes de series que confundan la lectura.",
            "6. Áreas y Apilados",
            "Insertar > Gráfico de Áreas",
        ),
        (
            "Histograma / Cajas",
            "Distribución estadística",
            "Analizar la dispersión, concentración de datos continuos y valores atípicos (outliers).",
            "Datos discretos con muy pocas muestras o categorías simples.",
            "7. Histograma y Frecuencias",
            "Insertar > Gráfico de Estadísticas",
        ),
        (
            "Radial / Radar",
            "Evaluación multidimensional",
            "Comparar perfiles de competencias o rendimiento en 5 a 8 métricas polares.",
            "Series temporales o datos que requieran suma acumulativa.",
            "8. Radial y Cascada",
            "Insertar > Gráfico de Radar",
        ),
        (
            "Cascada (Waterfall)",
            "Puente financiero o flujo",
            "Explicar paso a paso cómo ingresos iniciales se transforman en utilidad neta.",
            "Comparaciones de categorías no aditivas.",
            "8. Radial y Cascada",
            "Insertar > Gráfico de Cascada",
        ),
    ]

    fila_inicio = 6
    for c_idx, enc in enumerate(encabezados, start=2):
        c = ws.cell(row=fila_inicio, column=c_idx, value=enc)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda
    ws.row_dimensions[fila_inicio].height = 26

    for r_idx, fila in enumerate(matriz, start=fila_inicio + 1):
        for c_idx, val in enumerate(fila, start=2):
            c = ws.cell(row=r_idx, column=c_idx, value=val)
            c.font = font_td
            c.border = borde_celda
            c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)
            if c_idx in (2, 6, 7):
                c.alignment = align_left
            elif c_idx == 6:
                c.alignment = align_center
            else:
                c.alignment = align_left
        ws.row_dimensions[r_idx].height = 22

    # Buenas Prácticas de Visualización
    fila_bp = fila_inicio + len(matriz) + 2
    ws.cell(row=fila_bp, column=2, value="💡 5 REGLAS DE ORO PARA CREAR GRÁFICOS PROFESIONALES EN EXCEL").font = font_seccion
    consejos = [
        "1. Inicia siempre el eje vertical en 0 en gráficos de columnas y barras para evitar distorsiones visuales engañosas.",
        "2. Menos es más (Elimina el 'ruido visual'): quita líneas de cuadrícula excesivas, leyendas redundantes o efectos 3D que restan claridad.",
        "3. Usa el color con propósito: emplea colores neutros (gris/azul oscuro) para la base y un color de acento llamativo para el dato clave a resaltar.",
        "4. Títulos descriptivos con conclusión: En vez de 'Ventas 2025', titula 'Las ventas crecieron un 18% impulsadas por la sucursal Norte'.",
        "5. Etiquetas de datos vs. Ejes: Si agregas etiquetas directas sobre las barras, elimina las líneas de división y el eje numérico para no duplicar datos.",
    ]
    agregar_caja_instrucciones(ws, fila_bp + 1, 2, 6, "PRINCIPIOS DE DISEÑO Y COMUNICACIÓN VISUAL", consejos, es_alerta=False)

    ajustar_columnas(ws, min_col=2, max_col=7)
    ws.column_dimensions["B"].width = 24
    ws.column_dimensions["C"].width = 25
    ws.column_dimensions["D"].width = 38
    ws.column_dimensions["E"].width = 38
    ws.column_dimensions["F"].width = 22
    ws.column_dimensions["G"].width = 28


# ==============================================================================
# 1. COLUMNAS Y BARRAS
# ==============================================================================
def construir_hoja_columnas_barras(wb):
    ws = wb.create_sheet(title="1. Columnas y Barras")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 1: GRÁFICOS DE COLUMNAS Y BARRAS",
        "Compara valores numéricos entre categorías independientes o visualiza rankings ordenados.",
    )

    # --- TABLA 1: Columnas Agrupadas ---
    ws.cell(row=5, column=2, value="CASO A: Ventas Trimestrales por Sucursal (Millones COP)").font = font_seccion
    enc1 = ["Sucursal", "Trimestre 1", "Trimestre 2", "Trimestre 3", "Trimestre 4", "Total Anual"]
    datos1 = [
        ["Bogotá D.C.", 45.2, 52.8, 61.4, 73.0],
        ["Medellín", 38.5, 41.2, 47.9, 58.6],
        ["Cali", 29.1, 33.4, 36.8, 44.5],
        ["Barranquilla", 22.4, 26.9, 31.0, 39.2],
        ["Bucaramanga", 18.3, 19.8, 24.5, 28.7],
    ]

    for c_idx, h in enumerate(enc1, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, fila in enumerate(datos1, start=7):
        ws.cell(row=r_idx, column=2, value=fila[0]).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)
        for col_i in range(1, 5):
            c = ws.cell(row=r_idx, column=2 + col_i, value=fila[col_i])
            c.font = font_td
            c.alignment = align_right
            c.number_format = '$#,##0.0"M"'
            c.border = borde_celda
            c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)
        # Total con fórmula
        c_tot = ws.cell(row=r_idx, column=7, value=f"=SUM(C{r_idx}:F{r_idx})")
        c_tot.font = font_td
        c_tot.alignment = align_right
        c_tot.number_format = '$#,##0.0"M"'
        c_tot.border = borde_celda

    # Fila de Totales
    r_tot = 7 + len(datos1)
    ws.cell(row=r_tot, column=2, value="TOTAL GENERAL").font = font_total
    ws.cell(row=r_tot, column=2).border = borde_total
    ws.cell(row=r_tot, column=2).fill = fill_total
    for col_i in range(1, 6):
        col_let = get_column_letter(2 + col_i)
        c = ws.cell(row=r_tot, column=2 + col_i, value=f"=SUM({col_let}7:{col_let}{r_tot-1})")
        c.font = font_total
        c.alignment = align_right
        c.number_format = '$#,##0.0"M"'
        c.border = borde_total
        c.fill = fill_total

    # --- TABLA 2: Barras Horizontales ---
    r_inicio_b = r_tot + 3
    ws.cell(row=r_inicio_b, column=2, value="CASO B: Ranking de Ventas por Producto (Nombres Largos)").font = font_seccion

    enc2 = ["Producto", "Unidades Vendidas", "Participación %"]
    datos2 = [
        ["Yogurt Griego Frutos Rojos 1L", 14500, "=C" + str(r_inicio_b + 2) + f"/$C${r_inicio_b + 9}"],
        ["Queso Costeño Especial 500g", 12800, "=C" + str(r_inicio_b + 3) + f"/$C${r_inicio_b + 9}"],
        ["Leche Entera Larga Vida 1000ml", 11200, "=C" + str(r_inicio_b + 4) + f"/$C${r_inicio_b + 9}"],
        ["Mantequilla Pasteurizada 250g", 8950, "=C" + str(r_inicio_b + 5) + f"/$C${r_inicio_b + 9}"],
        ["Arequipe Tradicional Casero 400g", 7400, "=C" + str(r_inicio_b + 6) + f"/$C${r_inicio_b + 9}"],
        ["Crema de Leche Familiar 500ml", 6200, "=C" + str(r_inicio_b + 7) + f"/$C${r_inicio_b + 9}"],
        ["Suero Costeño Típico 400g", 5100, "=C" + str(r_inicio_b + 8) + f"/$C${r_inicio_b + 9}"],
    ]

    for c_idx, h in enumerate(enc2, start=2):
        c = ws.cell(row=r_inicio_b + 1, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th_sec
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, (prod, unids, _) in enumerate(datos2, start=r_inicio_b + 2):
        ws.cell(row=r_idx, column=2, value=prod).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_u = ws.cell(row=r_idx, column=3, value=unids)
        c_u.font = font_td
        c_u.alignment = align_right
        c_u.number_format = "#,##0"
        c_u.border = borde_celda
        c_u.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_p = ws.cell(row=r_idx, column=4, value=f"=C{r_idx}/$C${r_inicio_b + len(datos2) + 2}")
        c_p.font = font_td
        c_p.alignment = align_right
        c_p.number_format = "0.0%"
        c_p.border = borde_celda
        c_p.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Fila total productos
    r_tot_p = r_inicio_b + len(datos2) + 2
    ws.cell(row=r_tot_p, column=2, value="TOTAL GENERAL").font = font_total
    ws.cell(row=r_tot_p, column=2).border = borde_total
    ws.cell(row=r_tot_p, column=2).fill = fill_total

    c_tot_u = ws.cell(row=r_tot_p, column=3, value=f"=SUM(C{r_inicio_b + 2}:C{r_tot_p - 1})")
    c_tot_u.font = font_total
    c_tot_u.alignment = align_right
    c_tot_u.number_format = "#,##0"
    c_tot_u.border = borde_total
    c_tot_u.fill = fill_total

    c_tot_p = ws.cell(row=r_tot_p, column=4, value=f"=SUM(D{r_inicio_b + 2}:D{r_tot_p - 1})")
    c_tot_p.font = font_total
    c_tot_p.alignment = align_right
    c_tot_p.number_format = "0.0%"
    c_tot_p.border = borde_total
    c_tot_p.fill = fill_total

    # Instrucciones de práctica a la derecha
    instrucciones = [
        "1. EJERCICIO COLUMNAS AGRUPADAS:",
        "   - Selecciona el rango B6:F11 (Sucursales y Trimestres 1 a 4).",
        "   - Ve a Insertar > Gráficos > Columna Agrupada.",
        "   - Observa cómo cada grupo representa una sucursal con 4 barras de colores.",
        "   - RETO: Haz clic en 'Cambiar entre filas y columnas' para agrupar por Trimestre.",
        "",
        "2. EJERCICIO COLUMNAS APILADAS 100%:",
        "   - Con el mismo rango B6:F11, inserta un gráfico de 'Columnas 100% Apiladas'.",
        "   - Permite visualizar qué porcentaje representó cada sucursal del total en cada periodo.",
        "",
        "3. EJERCICIO BARRAS HORIZONTALES (Ranking):",
        "   - Selecciona el rango B17:C23 (Productos y Unidades).",
        "   - Inserta un gráfico de 'Barras 2D Horizontales'.",
        "   - ¿Por qué es mejor que columnas verticales? Porque los nombres largos de los",
        "     productos se leen horizontalmente de forma natural sin inclinación.",
    ]
    agregar_caja_instrucciones(ws, 5, 9, 7, "🛠️ INSTRUCCIONES PASO A PASO PARA PRACTICAR", instrucciones)

    # Gráfico de ejemplo preinsertado (openpyxl BarChart)
    chart1 = BarChart()
    chart1.type = "col"
    chart1.style = 10
    chart1.title = "Ventas por Sucursal y Trimestre (Ejemplo)"
    chart1.y_axis.title = "Ventas (Millones COP)"
    chart1.x_axis.title = "Sucursal"
    chart1.width = 16
    chart1.height = 10

    data = Reference(ws, min_col=3, min_row=6, max_col=6, max_row=11)
    cats = Reference(ws, min_col=2, min_row=7, max_row=11)
    chart1.add_data(data, titles_from_data=True)
    chart1.set_categories(cats)
    ws.add_chart(chart1, "I19")

    ajustar_columnas(ws, min_col=2, max_col=7)


# ==============================================================================
# 2. LÍNEAS Y TENDENCIAS
# ==============================================================================
def construir_hoja_lineas(wb):
    ws = wb.create_sheet(title="2. Líneas y Tendencias")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 2: GRÁFICOS DE LÍNEAS Y TENDENCIAS",
        "Ideal para mostrar series temporales continuas, patrones estacionales y metas proyectadas.",
    )

    ws.cell(row=5, column=2, value="CASO: Evolución Mensual de Ventas vs Meta Presupuestal (2025)").font = font_seccion

    enc = ["Mes", "Ventas 2024", "Ventas 2025", "Meta 2025", "Cumplimiento %"]
    datos = [
        ["Enero", 32.5, 36.2, 35.0],
        ["Febrero", 30.1, 33.8, 35.0],
        ["Marzo", 34.0, 39.5, 38.0],
        ["Abril", 36.2, 41.0, 40.0],
        ["Mayo", 42.0, 48.6, 45.0],
        ["Junio", 44.5, 50.2, 48.0],
        ["Julio", 41.8, 46.5, 48.0],
        ["Agosto", 45.0, 52.3, 50.0],
        ["Septiembre", 43.2, 49.8, 50.0],
        ["Octubre", 47.6, 55.4, 52.0],
        ["Noviembre", 51.0, 60.1, 58.0],
        ["Diciembre", 68.5, 79.8, 72.0],
    ]

    for c_idx, h in enumerate(enc, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, fila in enumerate(datos, start=7):
        ws.cell(row=r_idx, column=2, value=fila[0]).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        for col_i in range(1, 4):
            c = ws.cell(row=r_idx, column=2 + col_i, value=fila[col_i])
            c.font = font_td
            c.alignment = align_right
            c.number_format = '$#,##0.0"M"'
            c.border = borde_celda
            c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        # Cumplimiento = Ventas 2025 / Meta 2025
        c_cumpl = ws.cell(row=r_idx, column=6, value=f"=D{r_idx}/E{r_idx}")
        c_cumpl.font = font_td
        c_cumpl.alignment = align_right
        c_cumpl.number_format = "0.0%"
        c_cumpl.border = borde_celda
        c_cumpl.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Totales / Promedio
    r_tot = 7 + len(datos)
    ws.cell(row=r_tot, column=2, value="TOTAL ANUAL").font = font_total
    ws.cell(row=r_tot, column=2).border = borde_total
    ws.cell(row=r_tot, column=2).fill = fill_total

    for col_i in (1, 2, 3):
        col_let = get_column_letter(2 + col_i)
        c = ws.cell(row=r_tot, column=2 + col_i, value=f"=SUM({col_let}7:{col_let}{r_tot-1})")
        c.font = font_total
        c.alignment = align_right
        c.number_format = '$#,##0.0"M"'
        c.border = borde_total
        c.fill = fill_total

    c_prom_cumpl = ws.cell(row=r_tot, column=6, value=f"=D{r_tot}/E{r_tot}")
    c_prom_cumpl.font = font_total
    c_prom_cumpl.alignment = align_right
    c_prom_cumpl.number_format = "0.0%"
    c_prom_cumpl.border = borde_total
    c_prom_cumpl.fill = fill_total

    # Instrucciones
    instrucciones = [
        "1. INSERCIÓN DEL GRÁFICO DE LÍNEAS:",
        "   - Selecciona el rango B6:E18 (Meses, Ventas 2024, Ventas 2025 y Meta 2025).",
        "   - Ve a Insertar > Gráficos de Líneas > Línea con marcadores.",
        "",
        "2. PERSONALIZACIÓN PROFESIONAL:",
        "   - Haz clic derecho sobre la línea 'Meta 2025' > 'Dar formato a serie de datos'.",
        "   - En el relleno y línea, cámbiala a línea discontinua (punteada) en color gris oscuro.",
        "   - Colorea la línea de 'Ventas 2025' en azul corporativo brillante y '2024' en gris suave.",
        "   - Agrega un 'Título del Gráfico' claro: 'Crecimiento de Ventas 2025 supera la Meta Anual'.",
        "",
        "3. ANÁLISIS DE TENDENCIA:",
        "   - Observa el fuerte pico estacional en el mes de Diciembre.",
        "   - Identifica en qué meses se estuvo por debajo de la meta (Febrero y Julio).",
    ]
    agregar_caja_instrucciones(ws, 5, 8, 7, "🛠️ GUÍA DE PRÁCTICA PASO A PASO", instrucciones)

    # Gráfico de líneas preinsertado
    chart_line = LineChart()
    chart_line.title = "Tendencia de Ventas vs Meta 2025"
    chart_line.style = 13
    chart_line.y_axis.title = "Ventas (Millones COP)"
    chart_line.x_axis.title = "Mes"
    chart_line.width = 16
    chart_line.height = 10

    data = Reference(ws, min_col=3, min_row=6, max_col=5, max_row=18)
    cats = Reference(ws, min_col=2, min_row=7, max_row=18)
    chart_line.add_data(data, titles_from_data=True)
    chart_line.set_categories(cats)
    ws.add_chart(chart_line, "H18")

    ajustar_columnas(ws, min_col=2, max_col=6)


# ==============================================================================
# 3. CIRCULAR Y ANILLOS
# ==============================================================================
def construir_hoja_circular(wb):
    ws = wb.create_sheet(title="3. Circular y Anillos")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 3: GRÁFICOS CIRCULARES (PIE) Y ANILLOS (DOUGHNUT)",
        "Representan proporciones porcentuales de un total (100%). Máximo recomendado: 5 a 6 sectores.",
    )

    # Tabla 1: Market Share
    ws.cell(row=5, column=2, value="CASO A: Cuota de Mercado - Sector Lácteo Regional").font = font_seccion
    enc1 = ["Empresa / Marca", "Ventas Anuales ($M)", "Cuota de Mercado %"]
    datos1 = [
        ["Lácteos del Caribe S.A.S.", 185.4],
        ["Colanta", 142.0],
        ["Alpina", 98.6],
        ["Alquería", 75.3],
        ["Otras Marcas Locales", 42.7],
    ]

    for c_idx, h in enumerate(enc1, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    r_tot1 = 7 + len(datos1)
    for r_idx, (empresa, ventas) in enumerate(datos1, start=7):
        ws.cell(row=r_idx, column=2, value=empresa).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_v = ws.cell(row=r_idx, column=3, value=ventas)
        c_v.font = font_td
        c_v.alignment = align_right
        c_v.number_format = '$#,##0.0"M"'
        c_v.border = borde_celda
        c_v.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_p = ws.cell(row=r_idx, column=4, value=f"=C{r_idx}/$C${r_tot1}")
        c_p.font = font_td
        c_p.alignment = align_right
        c_p.number_format = "0.0%"
        c_p.border = borde_celda
        c_p.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    ws.cell(row=r_tot1, column=2, value="TOTAL MERCADO").font = font_total
    ws.cell(row=r_tot1, column=2).border = borde_total
    ws.cell(row=r_tot1, column=2).fill = fill_total

    c_tot_v = ws.cell(row=r_tot1, column=3, value=f"=SUM(C7:C{r_tot1-1})")
    c_tot_v.font = font_total
    c_tot_v.alignment = align_right
    c_tot_v.number_format = '$#,##0.0"M"'
    c_tot_v.border = borde_total
    c_tot_v.fill = fill_total

    c_tot_p = ws.cell(row=r_tot1, column=4, value=f"=SUM(D7:D{r_tot1-1})")
    c_tot_p.font = font_total
    c_tot_p.alignment = align_right
    c_tot_p.number_format = "0.0%"
    c_tot_p.border = borde_total
    c_tot_p.fill = fill_total

    # Tabla 2: Presupuesto Anual (Para Anillo)
    r_inicio_2 = r_tot1 + 3
    ws.cell(row=r_inicio_2, column=2, value="CASO B: Distribución del Presupuesto Operativo Anual").font = font_seccion
    enc2 = ["Departamento / Área", "Presupuesto Asignado", "Porcentaje %"]
    datos2 = [
        ["Operaciones & Planta", 120000000],
        ["Logística & Cadena Frío", 85000000],
        ["Comercial & Marketing", 52000000],
        ["Aseguramiento Calidad (SIG)", 38000000],
        ["Talento Humano & SST", 28000000],
        ["Tecnología & Sistemas", 22000000],
    ]

    for c_idx, h in enumerate(enc2, start=2):
        c = ws.cell(row=r_inicio_2 + 1, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th_sec
        c.alignment = align_center
        c.border = borde_celda

    r_tot2 = r_inicio_2 + 2 + len(datos2)
    for r_idx, (depto, monto) in enumerate(datos2, start=r_inicio_2 + 2):
        ws.cell(row=r_idx, column=2, value=depto).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_m = ws.cell(row=r_idx, column=3, value=monto)
        c_m.font = font_td
        c_m.alignment = align_right
        c_m.number_format = '"$"#,##0'
        c_m.border = borde_celda
        c_m.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_p = ws.cell(row=r_idx, column=4, value=f"=C{r_idx}/$C${r_tot2}")
        c_p.font = font_td
        c_p.alignment = align_right
        c_p.number_format = "0.0%"
        c_p.border = borde_celda
        c_p.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    ws.cell(row=r_tot2, column=2, value="PRESUPUESTO TOTAL").font = font_total
    ws.cell(row=r_tot2, column=2).border = borde_total
    ws.cell(row=r_tot2, column=2).fill = fill_total

    c_tot_m = ws.cell(row=r_tot2, column=3, value=f"=SUM(C{r_inicio_2 + 2}:C{r_tot2 - 1})")
    c_tot_m.font = font_total
    c_tot_m.alignment = align_right
    c_tot_m.number_format = '"$"#,##0'
    c_tot_m.border = borde_total
    c_tot_m.fill = fill_total

    c_tot_m_p = ws.cell(row=r_tot2, column=4, value=f"=SUM(D{r_inicio_2 + 2}:D{r_tot2 - 1})")
    c_tot_m_p.font = font_total
    c_tot_m_p.alignment = align_right
    c_tot_m_p.number_format = "0.0%"
    c_tot_m_p.border = borde_total
    c_tot_m_p.fill = fill_total

    # Instrucciones
    instrucciones = [
        "1. GRÁFICO CIRCULAR (CASO A):",
        "   - Selecciona el rango B6:C11 (Marcas y Ventas sin incluir la fila de Total).",
        "   - Ve a Insertar > Gráfico Circular 2D.",
        "   - Haz clic en el sector de 'Lácteos del Caribe' y arrástralo ligeramente hacia afuera (explosión).",
        "   - Agrega 'Etiquetas de datos' y configúralas para que muestren 'Porcentaje' y 'Nombre de categoría'.",
        "",
        "2. GRÁFICO DE ANILLOS (CASO B):",
        "   - Selecciona el rango B16:C21.",
        "   - Inserta Gráfico de Anillos (Doughnut Chart).",
        "   - Ajusta el 'Tamaño del agujero del anillo' al 60% para un aspecto moderno y elegante.",
        "",
        "⚠️ ADVERTENCIAS DE BUENAS PRÁCTICAS:",
        "   - NUNCA uses gráficos circulares en 3D (distorsionan el ángulo visual y engañan al ojo).",
        "   - NUNCA incluyas la fila de 'TOTAL' en la selección de datos del gráfico circular.",
    ]
    agregar_caja_instrucciones(ws, 5, 7, 7, "🛠️ INSTRUCCIONES Y REGLAS DE ORO", instrucciones)

    # Gráfico circular preinsertado
    pie = PieChart()
    pie.title = "Cuota de Mercado por Marca"
    pie.width = 14
    pie.height = 9
    data = Reference(ws, min_col=3, min_row=6, max_row=11)
    labels = Reference(ws, min_col=2, min_row=7, max_row=11)
    pie.add_data(data, titles_from_data=True)
    pie.set_categories(labels)
    ws.add_chart(pie, "G20")

    ajustar_columnas(ws, min_col=2, max_col=4)


# ==============================================================================
# 4. DISPERSIÓN XY (CORRELACIÓN)
# ==============================================================================
def construir_hoja_dispersion(wb):
    ws = wb.create_sheet(title="4. Dispersión XY")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 4: GRÁFICO DE DISPERSIÓN (SCATTER PLOT) Y LÍNEA DE TENDENCIA",
        "Permite investigar si existe correlación matemática entre dos variables numéricas continuas.",
    )

    ws.cell(row=5, column=2, value="CASO: Inversión en Pauta Digital vs Nuevos Clientes Captados").font = font_seccion

    enc = ["Campaña ID", "Inversión Pauta ($ USD)", "Nuevos Clientes", "Costo Adquisición (CAC)"]
    datos = [
        ["CMP-01", 500, 38],
        ["CMP-02", 750, 52],
        ["CMP-03", 900, 68],
        ["CMP-04", 1200, 95],
        ["CMP-05", 1400, 110],
        ["CMP-06", 1600, 118],
        ["CMP-07", 1850, 142],
        ["CMP-08", 2100, 155],
        ["CMP-09", 2300, 172],
        ["CMP-10", 2600, 190],
        ["CMP-11", 2800, 205],
        ["CMP-12", 3100, 222],
        ["CMP-13", 3400, 250],
        ["CMP-14", 3700, 268],
        ["CMP-15", 4000, 285],
        ["CMP-16", 4250, 298],
    ]

    for c_idx, h in enumerate(enc, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, (cid, inv, cli) in enumerate(datos, start=7):
        c_id = ws.cell(row=r_idx, column=2, value=cid)
        c_id.font = font_td
        c_id.alignment = align_center
        c_id.border = borde_celda
        c_id.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_i = ws.cell(row=r_idx, column=3, value=inv)
        c_i.font = font_td
        c_i.alignment = align_right
        c_i.number_format = '"$"#,##0'
        c_i.border = borde_celda
        c_i.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_c = ws.cell(row=r_idx, column=4, value=cli)
        c_c.font = font_td
        c_c.alignment = align_right
        c_c.number_format = "#,##0"
        c_c.border = borde_celda
        c_c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        # CAC = Inversion / Clientes
        c_cac = ws.cell(row=r_idx, column=5, value=f"=C{r_idx}/D{r_idx}")
        c_cac.font = font_td
        c_cac.alignment = align_right
        c_cac.number_format = '"$"#,##0.00'
        c_cac.border = borde_celda
        c_cac.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Promedios
    r_tot = 7 + len(datos)
    ws.cell(row=r_tot, column=2, value="PROMEDIO GENERAL").font = font_total
    ws.cell(row=r_tot, column=2).border = borde_total
    ws.cell(row=r_tot, column=2).fill = fill_total

    c_p_i = ws.cell(row=r_tot, column=3, value=f"=AVERAGE(C7:C{r_tot-1})")
    c_p_i.font = font_total
    c_p_i.alignment = align_right
    c_p_i.number_format = '"$"#,##0'
    c_p_i.border = borde_total
    c_p_i.fill = fill_total

    c_p_c = ws.cell(row=r_tot, column=4, value=f"=AVERAGE(D7:D{r_tot-1})")
    c_p_c.font = font_total
    c_p_c.alignment = align_right
    c_p_c.number_format = "#,##0"
    c_p_c.border = borde_total
    c_p_c.fill = fill_total

    c_p_cac = ws.cell(row=r_tot, column=5, value=f"=AVERAGE(E7:E{r_tot-1})")
    c_p_cac.font = font_total
    c_p_cac.alignment = align_right
    c_p_cac.number_format = '"$"#,##0.00'
    c_p_cac.border = borde_total
    c_p_cac.fill = fill_total

    # Instrucciones
    instrucciones = [
        "1. CREACIÓN DEL GRÁFICO DE DISPERSIÓN:",
        "   - Selecciona el rango numérico C6:D22 (Inversión y Clientes con sus títulos).",
        "   - Ve a Insertar > Gráficos > Dispersión (XY) > Solo puntos (sin líneas unidas).",
        "   - Comprueba que el Eje Horizontal (X) corresponda a la Inversión ($)",
        "     y el Eje Vertical (Y) corresponda a los Nuevos Clientes.",
        "",
        "2. INSERTAR LÍNEA DE TENDENCIA (TRENDLINE):",
        "   - Haz clic sobre los puntos del gráfico > Botón '+' de elementos del gráfico.",
        "   - Marca la casilla 'Línea de tendencia' > Más opciones.",
        "   - Selecciona tipo 'Lineal' y activa las casillas inferiores:",
        "     * [x] Presentar ecuación en el gráfico (ej. y = 0.071x + 2.5)",
        "     * [x] Presentar el valor R cuadrado en el gráfico (R²)",
        "",
        "3. PREGUNTAS DE INTERPRETACIÓN ANALÍTICA:",
        "   - ¿Qué indica un valor R² superior a 0.95? (Una correlación lineal positiva casi perfecta).",
        "   - Si duplicamos la inversión a $8,000, ¿cuántos clientes proyecta el modelo?",
    ]
    agregar_caja_instrucciones(ws, 5, 7, 7, "🛠️ GUÍA DE PRÁCTICA DE DISPERSIÓN", instrucciones)

    # Gráfico de dispersión preinsertado
    scatter = ScatterChart()
    scatter.title = "Correlación: Inversión en Pauta vs Clientes"
    scatter.style = 13
    scatter.x_axis.title = "Inversión Publicitaria ($ USD)"
    scatter.y_axis.title = "Nuevos Clientes Captados"
    scatter.width = 16
    scatter.height = 10

    xvalues = Reference(ws, min_col=3, min_row=7, max_row=22)
    yvalues = Reference(ws, min_col=4, min_row=7, max_row=22)
    series = Series(yvalues, xvalues, title="Campañas 2025")
    scatter.append(series)
    ws.add_chart(scatter, "G20")

    ajustar_columnas(ws, min_col=2, max_col=5)


# ==============================================================================
# 5. COMBINADO (DOBLE EJE)
# ==============================================================================
def construir_hoja_combinado(wb):
    ws = wb.create_sheet(title="5. Combinado (Doble Eje)")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 5: GRÁFICO COMBINADO CON EJE SECUNDARIO",
        "Combina dos tipos de gráficos y dos escalas muy distintas (ej. Millones de pesos vs Porcentaje de Rentabilidad).",
    )

    ws.cell(row=5, column=2, value="CASO: Ingresos por Ventas vs Margen de Utilidad Operativa (2025)").font = font_seccion

    enc = ["Mes", "Ingresos Totales", "Costo Operativo", "Utilidad Operativa", "Margen Operativo %"]
    datos = [
        ["Enero", 48500000, 37345000],
        ["Febrero", 45200000, 35708000],
        ["Marzo", 53800000, 40888000],
        ["Abril", 58100000, 43575000],
        ["Mayo", 64500000, 47730000],
        ["Junio", 68900000, 50297000],
        ["Julio", 62400000, 46176000],
        ["Agosto", 71200000, 51264000],
        ["Septiembre", 67800000, 49494000],
        ["Octubre", 75400000, 53534000],
        ["Noviembre", 82300000, 57610000],
        ["Diciembre", 108500000, 73780000],
    ]

    for c_idx, h in enumerate(enc, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, (mes, ing, costo) in enumerate(datos, start=7):
        ws.cell(row=r_idx, column=2, value=mes).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_i = ws.cell(row=r_idx, column=3, value=ing)
        c_i.font = font_td
        c_i.alignment = align_right
        c_i.number_format = '"$"#,##0'
        c_i.border = borde_celda
        c_i.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_c = ws.cell(row=r_idx, column=4, value=costo)
        c_c.font = font_td
        c_c.alignment = align_right
        c_c.number_format = '"$"#,##0'
        c_c.border = borde_celda
        c_c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        # Utilidad = Ingreso - Costo
        c_u = ws.cell(row=r_idx, column=5, value=f"=C{r_idx}-D{r_idx}")
        c_u.font = font_td
        c_u.alignment = align_right
        c_u.number_format = '"$"#,##0'
        c_u.border = borde_celda
        c_u.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        # Margen = Utilidad / Ingreso
        c_m = ws.cell(row=r_idx, column=6, value=f"=E{r_idx}/C{r_idx}")
        c_m.font = font_td
        c_m.alignment = align_right
        c_m.number_format = "0.0%"
        c_m.border = borde_celda
        c_m.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Totales
    r_tot = 7 + len(datos)
    ws.cell(row=r_tot, column=2, value="TOTAL ANUAL").font = font_total
    ws.cell(row=r_tot, column=2).border = borde_total
    ws.cell(row=r_tot, column=2).fill = fill_total

    for col_i in (1, 2, 3):
        col_let = get_column_letter(2 + col_i)
        c = ws.cell(row=r_tot, column=2 + col_i, value=f"=SUM({col_let}7:{col_let}{r_tot-1})")
        c.font = font_total
        c.alignment = align_right
        c.number_format = '"$"#,##0'
        c.border = borde_total
        c.fill = fill_total

    # Margen ponderado
    c_m_tot = ws.cell(row=r_tot, column=6, value=f"=E{r_tot}/C{r_tot}")
    c_m_tot.font = font_total
    c_m_tot.alignment = align_right
    c_m_tot.number_format = "0.0%"
    c_m_tot.border = borde_total
    c_m_tot.fill = fill_total

    # Instrucciones
    instrucciones = [
        "1. ¿POR QUÉ SE NECESITA UN EJE SECUNDARIO?",
        "   - Si intentas graficar 'Ingresos' ($50,000,000) y 'Margen' (25% = 0.25) en un solo eje,",
        "     la línea del porcentaje quedará aplastada en el suelo (valor 0) e invisible.",
        "",
        "2. PASO A PASO PARA CREAR EL GRÁFICO COMBINADO:",
        "   - Selecciona los rangos B6:C18 (Meses e Ingresos) y, manteniendo presionada la tecla Ctrl,",
        "     selecciona F6:F18 (Margen Operativo %).",
        "   - Ve a Insertar > Gráficos > Gráfico Combinado > 'Columna agrupada - Línea en eje secundario'.",
        "",
        "3. CONFIGURACIÓN DEL EJE SECUNDARIO:",
        "   - Haz doble clic en el eje de la derecha (el de porcentajes).",
        "   - Configura límites: Mínimo 0.0 (0%) y Máximo 0.40 (40%).",
        "   - Asigna títulos de eje: Izquierdo 'Ingresos ($ COP)', Derecho 'Margen de Rentabilidad (%)'.",
    ]
    agregar_caja_instrucciones(ws, 5, 8, 7, "🛠️ GUÍA DE PRÁCTICA DEL GRÁFICO COMBINADO", instrucciones)

    # Gráfico Combinado preinsertado (BarChart + LineChart)
    chart_bar = BarChart()
    chart_bar.title = "Ingresos vs Margen Operativo"
    chart_bar.style = 10
    chart_bar.y_axis.title = "Ingresos ($ COP)"
    chart_bar.x_axis.title = "Mes"
    chart_bar.width = 16
    chart_bar.height = 10

    data_bar = Reference(ws, min_col=3, min_row=6, max_row=18)
    cats = Reference(ws, min_col=2, min_row=7, max_row=18)
    chart_bar.add_data(data_bar, titles_from_data=True)
    chart_bar.set_categories(cats)

    chart_line = LineChart()
    data_line = Reference(ws, min_col=6, min_row=6, max_row=18)
    chart_line.add_data(data_line, titles_from_data=True)
    chart_line.y_axis.title = "Margen Operativo"
    chart_line.y_axis.axId = 200
    chart_line.y_axis.crosses = "max"

    chart_bar += chart_line
    ws.add_chart(chart_bar, "H18")

    ajustar_columnas(ws, min_col=2, max_col=6)


# ==============================================================================
# 6. ÁREAS Y APILADOS
# ==============================================================================
def construir_hoja_areas(wb):
    ws = wb.create_sheet(title="6. Áreas y Apilados")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 6: GRÁFICO DE ÁREAS APILADAS",
        "Muestra tanto el volumen acumulado en el tiempo como la contribución de cada componente.",
    )

    ws.cell(row=5, column=2, value="CASO: Tráfico Web Mensual por Canal de Adquisición (Sesiones 2025)").font = font_seccion

    enc = ["Mes", "Búsqueda Orgánica", "Pauta Paga (SEM)", "Redes Sociales", "Email Marketing", "Total Sesiones"]
    datos = [
        ["Ene", 12500, 8400, 4200, 2100],
        ["Feb", 13100, 8900, 4600, 2300],
        ["Mar", 14800, 9500, 5100, 2600],
        ["Abr", 16200, 10200, 5800, 2900],
        ["May", 18500, 11800, 6900, 3400],
        ["Jun", 19200, 12400, 7400, 3800],
        ["Jul", 17900, 11500, 6800, 3500],
        ["Ago", 20400, 13100, 8200, 4100],
        ["Sep", 21800, 14200, 8900, 4500],
        ["Oct", 23500, 15600, 9800, 5200],
        ["Nov", 27000, 18500, 12400, 6800],
        ["Dic", 34000, 24000, 16500, 9500],
    ]

    for c_idx, h in enumerate(enc, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, fila in enumerate(datos, start=7):
        ws.cell(row=r_idx, column=2, value=fila[0]).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        for col_i in range(1, 5):
            c = ws.cell(row=r_idx, column=2 + col_i, value=fila[col_i])
            c.font = font_td
            c.alignment = align_right
            c.number_format = "#,##0"
            c.border = borde_celda
            c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        # Total
        c_tot = ws.cell(row=r_idx, column=7, value=f"=SUM(C{r_idx}:F{r_idx})")
        c_tot.font = font_td
        c_tot.alignment = align_right
        c_tot.number_format = "#,##0"
        c_tot.border = borde_celda

    # Total general
    r_tot = 7 + len(datos)
    ws.cell(row=r_tot, column=2, value="TOTAL ANUAL").font = font_total
    ws.cell(row=r_tot, column=2).border = borde_total
    ws.cell(row=r_tot, column=2).fill = fill_total

    for col_i in range(1, 6):
        col_let = get_column_letter(2 + col_i)
        c = ws.cell(row=r_tot, column=2 + col_i, value=f"=SUM({col_let}7:{col_let}{r_tot-1})")
        c.font = font_total
        c.alignment = align_right
        c.number_format = "#,##0"
        c.border = borde_total
        c.fill = fill_total

    # Instrucciones
    instrucciones = [
        "1. CREACIÓN DEL GRÁFICO DE ÁREAS APILADAS:",
        "   - Selecciona el rango B6:F18 (Meses y los 4 canales de tráfico sin el Total).",
        "   - Ve a Insertar > Gráficos de Líneas o Áreas > 'Área Apilada 2D'.",
        "",
        "2. INTERPRETACIÓN DE LAS FRANGAS:",
        "   - La altura superior total representa la suma de todo el tráfico que llegó a la web.",
        "   - El espesor de cada franja de color ilustra el volumen aportado por ese canal en particular.",
        "   - Observa el notable crecimiento de las Redes Sociales y Email hacia fin de año.",
        "",
        "3. ALTERNATIVA: ÁREAS 100% APILADAS:",
        "   - Prueba cambiar el tipo de gráfico a 'Área 100% Apilada'.",
        "   - En este modo, el gráfico estandariza la altura al 100% para evaluar la participación relativa.",
    ]
    agregar_caja_instrucciones(ws, 5, 9, 7, "🛠️ GUÍA DE PRÁCTICA DE ÁREAS", instrucciones)

    # Gráfico de áreas preinsertado
    area = AreaChart()
    area.grouping = "stacked"
    area.title = "Tráfico Web Acumulado por Canal (Sesiones)"
    area.style = 13
    area.y_axis.title = "Sesiones Totales"
    area.x_axis.title = "Mes"
    area.width = 16
    area.height = 10

    data = Reference(ws, min_col=3, min_row=6, max_col=6, max_row=18)
    cats = Reference(ws, min_col=2, min_row=7, max_row=18)
    area.add_data(data, titles_from_data=True)
    area.set_categories(cats)
    ws.add_chart(area, "I18")

    ajustar_columnas(ws, min_col=2, max_col=7)


# ==============================================================================
# 7. HISTOGRAMA Y FRECUENCIAS
# ==============================================================================
def construir_hoja_histograma(wb):
    ws = wb.create_sheet(title="7. Histograma y Frecuencias")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 7: HISTOGRAMA Y DISTRIBUCIÓN DE FRECUENCIAS",
        "Examina la forma de distribución, concentración, asimetría y variabilidad de un proceso.",
    )

    # Muestra de 40 envíos
    ws.cell(row=5, column=2, value="CASO: Muestra de Tiempos de Entrega de Pedidos (Días)").font = font_seccion

    enc1 = ["ID Pedido", "Días de Entrega"]
    tiempos = [
        1.2, 1.5, 1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6,
        2.7, 2.8, 2.9, 3.0, 3.1, 3.1, 3.2, 3.3, 3.4, 3.5,
        3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.4, 4.5,
        4.8, 5.0, 5.2, 5.5, 5.8, 6.2, 6.8, 7.5, 8.2, 9.4
    ]

    for c_idx, h in enumerate(enc1, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for idx, t in enumerate(tiempos, start=1):
        r = 6 + idx
        ws.cell(row=r, column=2, value=f"PED-{idx:03d}").alignment = align_center
        ws.cell(row=r, column=2).font = font_td
        ws.cell(row=r, column=2).border = borde_celda
        ws.cell(row=r, column=2).fill = fill_zebra if r % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_t = ws.cell(row=r, column=3, value=t)
        c_t.font = font_td
        c_t.alignment = align_right
        c_t.number_format = '0.0 "días"'
        c_t.border = borde_celda
        c_t.fill = fill_zebra if r % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Tabla resumen de frecuencias para graficar en versiones clásicas de Excel
    ws.cell(row=5, column=5, value="TABLA DE FRECUENCIAS POR INTERVALOS (CLASES)").font = font_seccion
    enc_freq = ["Rango (Días)", "Límite Sup.", "Frecuencia (Pedidos)", "% Relativo"]
    intervalos = [
        ("1 a 2 días", 2.0, 4),
        ("2 a 3 días", 3.0, 10),
        ("3 a 4 días", 4.0, 12),
        ("4 a 5 días", 5.0, 6),
        ("5 a 6 días", 6.0, 3),
        ("6 a 8 días", 8.0, 3),
        ("Más de 8 días", 12.0, 2),
    ]

    for c_idx, h in enumerate(enc_freq, start=5):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th_sec
        c.alignment = align_center
        c.border = borde_celda

    r_f_tot = 7 + len(intervalos)
    for idx, (rg, lim, freq) in enumerate(intervalos, start=7):
        ws.cell(row=idx, column=5, value=rg).font = font_td
        ws.cell(row=idx, column=5).border = borde_celda
        ws.cell(row=idx, column=5).fill = fill_zebra if idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        ws.cell(row=idx, column=6, value=lim).font = font_td
        ws.cell(row=idx, column=6).alignment = align_right
        ws.cell(row=idx, column=6).border = borde_celda

        ws.cell(row=idx, column=7, value=freq).font = font_td
        ws.cell(row=idx, column=7).alignment = align_right
        ws.cell(row=idx, column=7).number_format = "#,##0"
        ws.cell(row=idx, column=7).border = borde_celda

        c_rel = ws.cell(row=idx, column=8, value=f"=G{idx}/$G${r_f_tot}")
        c_rel.font = font_td
        c_rel.alignment = align_right
        c_rel.number_format = "0.0%"
        c_rel.border = borde_celda

    ws.cell(row=r_f_tot, column=5, value="TOTAL").font = font_total
    ws.cell(row=r_f_tot, column=5).border = borde_total
    ws.cell(row=r_f_tot, column=5).fill = fill_total

    ws.cell(row=r_f_tot, column=6, value="-").font = font_total
    ws.cell(row=r_f_tot, column=6).alignment = align_center
    ws.cell(row=r_f_tot, column=6).border = borde_total
    ws.cell(row=r_f_tot, column=6).fill = fill_total

    c_tot_f = ws.cell(row=r_f_tot, column=7, value=f"=SUM(G7:G{r_f_tot-1})")
    c_tot_f.font = font_total
    c_tot_f.alignment = align_right
    c_tot_f.border = borde_total
    c_tot_f.fill = fill_total

    c_tot_rel = ws.cell(row=r_f_tot, column=8, value=f"=SUM(H7:H{r_f_tot-1})")
    c_tot_rel.font = font_total
    c_tot_rel.alignment = align_right
    c_tot_rel.number_format = "0.0%"
    c_tot_rel.border = borde_total
    c_tot_rel.fill = fill_total

    # Instrucciones
    instrucciones = [
        "MÉTODO 1: HISTOGRAMA NATIVO (EXCEL 2016+):",
        "  - Selecciona la columna completa de datos C6:C46 (Días de Entrega).",
        "  - Ve a la pestaña Insertar > Gráfico de Estadísticas > Histograma.",
        "  - Excel agrupa automáticamente en rangos (bins).",
        "  - Haz clic derecho sobre el eje X > 'Dar formato a eje' > Cambia 'Ancho de rango' a 1.5 días.",
        "",
        "MÉTODO 2: CONSTRUCCIÓN CLÁSICA CON TABLA DE FRECUENCIAS:",
        "  - Selecciona el rango E6:G13 (Rango y Frecuencia).",
        "  - Inserta un Gráfico de Columnas 2D.",
        "  - Haz doble clic en las columnas y en 'Opciones de serie' cambia 'Ancho del intervalo' al 0%.",
        "  - ¡Al reducir el intervalo a 0%, las columnas quedan unidas, formando un histograma perfecto!",
        "",
        "MÉTODO 3: GRÁFICO DE CAJAS Y BIGOTES (BOX & WHISKER):",
        "  - Con C6:C46 seleccionado, ve a Insertar > Gráficos de Estadísticas > Cajas y Bigotes.",
        "  - Visualiza el valor mínimo, Q1, Mediana, Q3, valor máximo y valores atípicos (outliers).",
    ]
    agregar_caja_instrucciones(ws, 16, 5, 5, "🛠️ PASO A PASO: 3 FORMAS DE ANALIZAR DISTRIBUCIONES", instrucciones)

    # Gráfico de frecuencias preinsertado con openpyxl BarChart
    chart_hist = BarChart()
    chart_hist.type = "col"
    chart_hist.title = "Distribución de Tiempos de Entrega (Pedidos)"
    chart_hist.y_axis.title = "Cantidad de Pedidos"
    chart_hist.x_axis.title = "Intervalo de Días"
    chart_hist.width = 15
    chart_hist.height = 9

    data = Reference(ws, min_col=7, min_row=6, max_row=13)
    cats = Reference(ws, min_col=5, min_row=7, max_row=13)
    chart_hist.add_data(data, titles_from_data=True)
    chart_hist.set_categories(cats)
    ws.add_chart(chart_hist, "E30")

    ajustar_columnas(ws, min_col=2, max_col=8)


# ==============================================================================
# 8. RADIAL Y CASCADA (ESPECIALES)
# ==============================================================================
def construir_hoja_radial_cascada(wb):
    ws = wb.create_sheet(title="8. Radial y Cascada")
    configurar_vista(ws)

    agregar_encabezado_hoja(
        ws,
        "PRÁCTICA 8: GRÁFICOS ESPECIALES - RADIAL (RADAR) Y CASCADA (WATERFALL)",
        "El gráfico radial compara perfiles multidimensionales; la cascada ilustra flujos financieros acumulativos.",
    )

    # Tabla 1: Radar de Competencias
    ws.cell(row=5, column=2, value="CASO A: Evaluación de Competencias Profesionales (Radar / Telaraña)").font = font_seccion
    enc1 = ["Competencia Evaluada", "Candidato A", "Perfil Requerido (Meta)"]
    datos1 = [
        ["Análisis de Datos & TIC", 92, 85],
        ["Liderazgo y Gestión", 75, 80],
        ["Trabajo en Equipo", 88, 85],
        ["Comunicación Asertiva", 82, 80],
        ["Resolución de Problemas", 95, 90],
        ["Adaptabilidad al Cambio", 85, 80],
    ]

    for c_idx, h in enumerate(enc1, start=2):
        c = ws.cell(row=6, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, (comp, cand, req) in enumerate(datos1, start=7):
        ws.cell(row=r_idx, column=2, value=comp).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_c = ws.cell(row=r_idx, column=3, value=cand)
        c_c.font = font_td
        c_c.alignment = align_right
        c_c.number_format = '0" / 100"'
        c_c.border = borde_celda
        c_c.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_r = ws.cell(row=r_idx, column=4, value=req)
        c_r.font = font_td
        c_r.alignment = align_right
        c_r.number_format = '0" / 100"'
        c_r.border = borde_celda
        c_r.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Tabla 2: Cascada Financiera (Waterfall)
    r_wf = 15
    ws.cell(row=r_wf, column=2, value="CASO B: Estado de Resultados - Cascada Financiera (Millones COP)").font = font_seccion
    enc2 = ["Rubro Financiero", "Monto ($M)", "Tipo de Impacto"]
    datos2 = [
        ["Ventas Brutas", 125.0, "Ingreso Inicial"],
        ["Devoluciones en Ventas", -4.5, "Deducción (-)"],
        ["Costo de Ventas (Materia Prima)", -62.0, "Costo (-)"],
        ["Gastos de Distribución y Ventas", -14.2, "Gasto (-)"],
        ["Gastos Administrativos y Nómina", -16.8, "Gasto (-)"],
        ["Otros Ingresos Financieros", 3.5, "Ingreso (+)"],
        ["Impuestos de Renta (35%)", -10.8, "Impuesto (-)"],
        ["Utilidad Neta del Ejercicio", 20.2, "Total Final"],
    ]

    for c_idx, h in enumerate(enc2, start=2):
        c = ws.cell(row=r_wf + 1, column=c_idx, value=h)
        c.font = font_th
        c.fill = fill_th_sec
        c.alignment = align_center
        c.border = borde_celda

    for r_idx, (rubro, monto, tipo) in enumerate(datos2, start=r_wf + 2):
        ws.cell(row=r_idx, column=2, value=rubro).font = font_td
        ws.cell(row=r_idx, column=2).border = borde_celda
        ws.cell(row=r_idx, column=2).fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_m = ws.cell(row=r_idx, column=3, value=monto)
        c_m.font = font_td
        c_m.alignment = align_right
        c_m.number_format = '$#,##0.0"M"'
        c_m.border = borde_celda
        c_m.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

        c_t = ws.cell(row=r_idx, column=4, value=tipo)
        c_t.font = font_td
        c_t.alignment = align_center
        c_t.border = borde_celda
        c_t.fill = fill_zebra if r_idx % 2 == 0 else PatternFill("solid", fgColor=BLANCO)

    # Instrucciones
    instrucciones = [
        "1. PRÁCTICA GRÁFICO RADIAL (RADAR):",
        "   - Selecciona el rango B6:D12 (Competencias, Candidato A y Perfil Requerido).",
        "   - Ve a Insertar > Gráficos de Cascada, Embudo o Radar > Gráfico Radial con Marcadores.",
        "   - Permite comparar de un solo vistazo las fortalezas y brechas entre el perfil y el candidato.",
        "",
        "2. PRÁCTICA GRÁFICO DE CASCADA (WATERFALL):",
        "   - Selecciona el rango B16:C24 (Rubro y Monto).",
        "   - Ve a Insertar > Gráfico de Cascada o Embudo > 'Cascada'.",
        "   - PASO CRUCIAL EN EXCEL: Haz doble clic ÚNICAMENTE en la última columna ('Utilidad Neta'),",
        "     luego clic derecho y activa 'Establecer como total'.",
        "   - Verás cómo la barra de Utilidad Neta se ancla al piso (cero), cerrando el flujo visual.",
    ]
    agregar_caja_instrucciones(ws, 5, 6, 6, "🛠️ GUÍA DE PRÁCTICA DE GRÁFICOS ESPECIALES", instrucciones)

    # Gráfico radial preinsertado con openpyxl RadarChart
    radar = RadarChart()
    radar.type = "standard"
    radar.title = "Matriz de Competencias: Candidato vs Requerido"
    radar.style = 11
    radar.width = 14
    radar.height = 9

    labels = Reference(ws, min_col=2, min_row=7, max_row=12)
    data = Reference(ws, min_col=3, max_col=4, min_row=6, max_row=12)
    radar.add_data(data, titles_from_data=True)
    radar.set_categories(labels)
    ws.add_chart(radar, "F17")

    ajustar_columnas(ws, min_col=2, max_col=4)


# ==============================================================================
# FUNCIÓN PRINCIPAL
# ==============================================================================
def main():
    wb = openpyxl.Workbook()

    print("Construyendo hoja 0: Menú y Guía Teórica...")
    construir_hoja_indice(wb)

    print("Construyendo hoja 1: Columnas y Barras...")
    construir_hoja_columnas_barras(wb)

    print("Construyendo hoja 2: Líneas y Tendencias...")
    construir_hoja_lineas(wb)

    print("Construyendo hoja 3: Circular y Anillos...")
    construir_hoja_circular(wb)

    print("Construyendo hoja 4: Dispersión XY...")
    construir_hoja_dispersion(wb)

    print("Construyendo hoja 5: Combinado (Doble Eje)...")
    construir_hoja_combinado(wb)

    print("Construyendo hoja 6: Áreas y Apilados...")
    construir_hoja_areas(wb)

    print("Construyendo hoja 7: Histograma y Frecuencias...")
    construir_hoja_histograma(wb)

    print("Construyendo hoja 8: Radial y Cascada...")
    construir_hoja_radial_cascada(wb)

    output_path = Path("/Users/juanalmeida/Downloads/Proyectos/WEB/TIC(EXCEL)/Practica_Tipos_de_Graficos_Excel.xlsx")
    wb.save(output_path)
    print(f"¡Archivo generado exitosamente en: {output_path}!")


if __name__ == "__main__":
    main()
