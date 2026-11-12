#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera un archivo de Excel ultra sencillo y amigable para aprender y practicar
los tipos de gráficos más usados en Excel.
Archivo de salida: Practica_Graficos_Sencilla.xlsx
"""

from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, LineChart, PieChart, Reference

def crear_libro_sencillo():
    wb = openpyxl.Workbook()

    # Colores amigables
    AZUL_HEADER = "1D4ED8"
    VERDE_HEADER = "047857"
    NARANJA_HEADER = "C2410C"
    MORADO_HEADER = "6D28D9"
    GRIS_CLARO = "F8FAFC"
    GRIS_BORDE = "CBD5E1"
    BLANCO = "FFFFFF"
    TEXTO = "0F172A"

    borde = Border(
        left=Side(style="thin", color=GRIS_BORDE),
        right=Side(style="thin", color=GRIS_BORDE),
        top=Side(style="thin", color=GRIS_BORDE),
        bottom=Side(style="thin", color=GRIS_BORDE),
    )

    borde_total = Border(
        top=Side(style="thin", color=TEXTO),
        bottom=Side(style="double", color=TEXTO),
        left=Side(style="thin", color=GRIS_BORDE),
        right=Side(style="thin", color=GRIS_BORDE),
    )

    # =========================================================================
    # HOJA 1: COLUMNAS (COMPARACIÓN)
    # =========================================================================
    ws1 = wb.active
    ws1.title = "1. Columnas"
    ws1.views.sheetView[0].showGridLines = True

    ws1["B2"] = "📊 EJERCICIO 1: GRÁFICO DE COLUMNAS"
    ws1["B2"].font = Font(name="Segoe UI", size=14, bold=True, color="1E3A8A")
    ws1["B3"] = "¿Para qué sirve? Para comparar valores entre distintas tiendas o categorías."
    ws1["B3"].font = Font(name="Segoe UI", size=10.5, italic=True, color="475569")

    headers1 = ["Sucursal", "Enero", "Febrero"]
    datos1 = [
        ["Tienda Norte", 12500, 15300],
        ["Tienda Sur", 9800, 11200],
        ["Tienda Centro", 18400, 19800],
        ["Tienda Occidente", 8200, 9400],
    ]

    for c_i, h in enumerate(headers1, start=2):
        cell = ws1.cell(row=5, column=c_i, value=h)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
        cell.fill = PatternFill("solid", fgColor=AZUL_HEADER)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = borde

    for r_i, (suc, m1, m2) in enumerate(datos1, start=6):
        c_suc = ws1.cell(row=r_i, column=2, value=suc)
        c_suc.font = Font(name="Segoe UI", size=10)
        c_suc.border = borde

        c1 = ws1.cell(row=r_i, column=3, value=m1)
        c1.font = Font(name="Segoe UI", size=10)
        c1.number_format = '"$"#,##0'
        c1.border = borde
        c1.alignment = Alignment(horizontal="right")

        c2 = ws1.cell(row=r_i, column=4, value=m2)
        c2.font = Font(name="Segoe UI", size=10)
        c2.number_format = '"$"#,##0'
        c2.border = borde
        c2.alignment = Alignment(horizontal="right")

    # Instrucciones
    pasos1 = [
        "PASOS SENCILLOS PARA CREAR TU GRÁFICO:",
        "1. Selecciona con el ratón las celdas desde B5 hasta D9 (incluyendo los títulos).",
        "2. En el menú de arriba ve a: Insertar > Gráficos > Columna Agrupada (la 1.ª opción).",
        "3. ¡Ya está creado! Cada tienda tendrá una barra para Enero y otra para Febrero.",
        "",
        "💡 TRUCO RÁPIDO:",
        "Con las celdas B5:D9 seleccionadas, presiona la combinación de teclas Alt + F1.",
        "Excel te creará el gráfico de forma automática en un solo segundo.",
    ]
    for idx, p in enumerate(pasos1):
        c = ws1.cell(row=12 + idx, column=2, value=p)
        c.font = Font(
            name="Segoe UI",
            size=10,
            bold=(idx in (0, 4)),
            color="1E3A8A" if idx in (0, 4) else "1E293B",
        )

    # Gráfico de muestra
    chart1 = BarChart()
    chart1.type = "col"
    chart1.title = "Ventas por Sucursal (Ejemplo)"
    chart1.width = 13
    chart1.height = 8.5
    data1 = Reference(ws1, min_col=3, max_col=4, min_row=5, max_row=9)
    cats1 = Reference(ws1, min_col=2, min_row=6, max_row=9)
    chart1.add_data(data1, titles_from_data=True)
    chart1.set_categories(cats1)
    ws1.add_chart(chart1, "F5")

    ws1.column_dimensions["B"].width = 20
    ws1.column_dimensions["C"].width = 14
    ws1.column_dimensions["D"].width = 14

    # =========================================================================
    # HOJA 2: BARRAS HORIZONTALES (RANKING)
    # =========================================================================
    ws2 = wb.create_sheet(title="2. Barras")
    ws2.views.sheetView[0].showGridLines = True

    ws2["B2"] = "📊 EJERCICIO 2: GRÁFICO DE BARRAS HORIZONTALES"
    ws2["B2"].font = Font(name="Segoe UI", size=14, bold=True, color=VERDE_HEADER)
    ws2["B3"] = "¿Para qué sirve? Para rankings y cuando los nombres de las cosas son largos."
    ws2["B3"].font = Font(name="Segoe UI", size=10.5, italic=True, color="475569")

    headers2 = ["Sabor de Helado", "Unidades Vendidas"]
    datos2 = [
        ["Chocolate Suizo", 540],
        ["Vainilla Tradicional", 480],
        ["Arequipe con Trocitos", 420],
        ["Frutos del Bosque", 350],
        ["Maracuyá Tropical", 290],
    ]

    for c_i, h in enumerate(headers2, start=2):
        cell = ws2.cell(row=5, column=c_i, value=h)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
        cell.fill = PatternFill("solid", fgColor=VERDE_HEADER)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = borde

    for r_i, (sabor, cant) in enumerate(datos2, start=6):
        c_s = ws2.cell(row=r_i, column=2, value=sabor)
        c_s.font = Font(name="Segoe UI", size=10)
        c_s.border = borde

        c_c = ws2.cell(row=r_i, column=3, value=cant)
        c_c.font = Font(name="Segoe UI", size=10)
        c_c.number_format = "#,##0"
        c_c.border = borde
        c_c.alignment = Alignment(horizontal="right")

    pasos2 = [
        "PASOS SENCILLOS PARA CREAR TU GRÁFICO:",
        "1. Selecciona las celdas B5:C10 (Sabores y Unidades).",
        "2. Ve a: Insertar > Gráficos > Gráfico de Barras > Barra 2D (horizontal).",
        "3. ¡Listo! Al ser horizontal, los nombres de cada sabor se leen cómodamente.",
        "",
        "💡 ¿POR QUÉ USAR BARRAS HORIZONTALES?",
        "Si usas columnas verticales, los nombres largos quedan torcidos o apretados.",
        "Con barras horizontales se leen perfectamente de izquierda a derecha.",
    ]
    for idx, p in enumerate(pasos2):
        c = ws2.cell(row=13 + idx, column=2, value=p)
        c.font = Font(
            name="Segoe UI",
            size=10,
            bold=(idx in (0, 4)),
            color="065F46" if idx in (0, 4) else "1E293B",
        )

    chart2 = BarChart()
    chart2.type = "bar"
    chart2.title = "Sabores más Vendidos (Ejemplo)"
    chart2.width = 13
    chart2.height = 8.5
    data2 = Reference(ws2, min_col=3, min_row=5, max_row=10)
    cats2 = Reference(ws2, min_col=2, min_row=6, max_row=10)
    chart2.add_data(data2, titles_from_data=True)
    chart2.set_categories(cats2)
    ws2.add_chart(chart2, "E5")

    ws2.column_dimensions["B"].width = 25
    ws2.column_dimensions["C"].width = 18

    # =========================================================================
    # HOJA 3: LÍNEAS (EVOLUCIÓN EN EL TIEMPO)
    # =========================================================================
    ws3 = wb.create_sheet(title="3. Líneas")
    ws3.views.sheetView[0].showGridLines = True

    ws3["B2"] = "📈 EJERCICIO 3: GRÁFICO DE LÍNEAS"
    ws3["B2"].font = Font(name="Segoe UI", size=14, bold=True, color=NARANJA_HEADER)
    ws3["B3"] = "¿Para qué sirve? Para ver si algo sube o baja con el paso de los meses."
    ws3["B3"].font = Font(name="Segoe UI", size=10.5, italic=True, color="475569")

    headers3 = ["Mes", "Ventas ($)"]
    datos3 = [
        ["Enero", 1500000],
        ["Febrero", 1420000],
        ["Marzo", 1850000],
        ["Abril", 2100000],
        ["Mayo", 1950000],
        ["Junio", 2600000],
    ]

    for c_i, h in enumerate(headers3, start=2):
        cell = ws3.cell(row=5, column=c_i, value=h)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
        cell.fill = PatternFill("solid", fgColor=NARANJA_HEADER)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = borde

    for r_i, (mes, val) in enumerate(datos3, start=6):
        c_m = ws3.cell(row=r_i, column=2, value=mes)
        c_m.font = Font(name="Segoe UI", size=10)
        c_m.border = borde

        c_v = ws3.cell(row=r_i, column=3, value=val)
        c_v.font = Font(name="Segoe UI", size=10)
        c_v.number_format = '"$"#,##0'
        c_v.border = borde
        c_v.alignment = Alignment(horizontal="right")

    pasos3 = [
        "PASOS SENCILLOS PARA CREAR TU GRÁFICO:",
        "1. Selecciona las celdas B5:C11 (Meses y Ventas).",
        "2. Ve a: Insertar > Gráficos de Líneas > 'Línea con marcadores' (la de los puntos).",
        "3. ¡Listo! La línea te muestra claramente la tendencia de crecimiento del semestre.",
        "",
        "💡 PREGUNTA PARA REFLEXIONAR:",
        "¿En qué mes hubo una pequeña caída? (En Febrero).",
        "¿Cuál fue el mejor mes? (Junio).",
    ]
    for idx, p in enumerate(pasos3):
        c = ws3.cell(row=14 + idx, column=2, value=p)
        c.font = Font(
            name="Segoe UI",
            size=10,
            bold=(idx in (0, 4)),
            color="9A3412" if idx in (0, 4) else "1E293B",
        )

    chart3 = LineChart()
    chart3.title = "Tendencia de Ventas (Semestre 1)"
    chart3.width = 13
    chart3.height = 8.5
    data3 = Reference(ws3, min_col=3, min_row=5, max_row=11)
    cats3 = Reference(ws3, min_col=2, min_row=6, max_row=11)
    chart3.add_data(data3, titles_from_data=True)
    chart3.set_categories(cats3)
    ws3.add_chart(chart3, "E5")

    ws3.column_dimensions["B"].width = 16
    ws3.column_dimensions["C"].width = 18

    # =========================================================================
    # HOJA 4: CIRCULAR / PASTEL (PORCENTAJES DE UN TOTAL)
    # =========================================================================
    ws4 = wb.create_sheet(title="4. Circular (Pastel)")
    ws4.views.sheetView[0].showGridLines = True

    ws4["B2"] = "🥧 EJERCICIO 4: GRÁFICO CIRCULAR (PASTEL)"
    ws4["B2"].font = Font(name="Segoe UI", size=14, bold=True, color=MORADO_HEADER)
    ws4["B3"] = "¿Para qué sirve? Para ver cómo se reparte un total (porcentajes de una torta)."
    ws4["B3"].font = Font(name="Segoe UI", size=10.5, italic=True, color="475569")

    headers4 = ["Gasto del Mes", "Valor ($)", "% del Total"]
    datos4 = [
        ["Arriendo / Vivienda", 800000, "=C6/$C$11"],
        ["Alimentación / Mercado", 500000, "=C7/$C$11"],
        ["Transporte", 250000, "=C8/$C$11"],
        ["Servicios Públicos", 200000, "=C9/$C$11"],
        ["Ahorro / Emergencias", 250000, "=C10/$C$11"],
    ]

    for c_i, h in enumerate(headers4, start=2):
        cell = ws4.cell(row=5, column=c_i, value=h)
        cell.font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
        cell.fill = PatternFill("solid", fgColor=MORADO_HEADER)
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = borde

    for r_i, (gasto, valor, form) in enumerate(datos4, start=6):
        c_g = ws4.cell(row=r_i, column=2, value=gasto)
        c_g.font = Font(name="Segoe UI", size=10)
        c_g.border = borde

        c_v = ws4.cell(row=r_i, column=3, value=valor)
        c_v.font = Font(name="Segoe UI", size=10)
        c_v.number_format = '"$"#,##0'
        c_v.border = borde
        c_v.alignment = Alignment(horizontal="right")

        c_p = ws4.cell(row=r_i, column=4, value=form)
        c_p.font = Font(name="Segoe UI", size=10)
        c_p.number_format = "0.0%"
        c_p.border = borde
        c_p.alignment = Alignment(horizontal="right")

    # Fila Total
    ws4.cell(row=11, column=2, value="TOTAL GASTOS").font = Font(name="Segoe UI", size=10, bold=True)
    ws4.cell(row=11, column=2).border = borde_total

    c_tot = ws4.cell(row=11, column=3, value="=SUM(C6:C10)")
    c_tot.font = Font(name="Segoe UI", size=10, bold=True)
    c_tot.number_format = '"$"#,##0'
    c_tot.border = borde_total
    c_tot.alignment = Alignment(horizontal="right")

    c_tot_p = ws4.cell(row=11, column=4, value="=SUM(D6:D10)")
    c_tot_p.font = Font(name="Segoe UI", size=10, bold=True)
    c_tot_p.number_format = "0.0%"
    c_tot_p.border = borde_total
    c_tot_p.alignment = Alignment(horizontal="right")

    pasos4 = [
        "PASOS SENCILLOS PARA CREAR TU GRÁFICO:",
        "1. Selecciona ÚNICAMENTE las celdas B5:C10 (NO selecciones la fila de Total).",
        "2. Ve a: Insertar > Gráfico Circular > Gráfico 2D (el pastel circular básico).",
        "3. ¡Listo! Verás qué porción se lleva la mayor parte del presupuesto.",
        "",
        "💡 REGLA DE ORO DE LOS GRÁFICOS CIRCULARES:",
        "Nunca incluyas la fila de 'TOTAL' al crear el gráfico, porque si la incluyes,",
        "el total se comerá la mitad del pastel y distorsionará todos los porcentajes.",
    ]
    for idx, p in enumerate(pasos4):
        c = ws4.cell(row=14 + idx, column=2, value=p)
        c.font = Font(
            name="Segoe UI",
            size=10,
            bold=(idx in (0, 4)),
            color="581C87" if idx in (0, 4) else "1E293B",
        )

    chart4 = PieChart()
    chart4.title = "Distribución del Gasto Mensual (Ejemplo)"
    chart4.width = 13
    chart4.height = 8.5
    data4 = Reference(ws4, min_col=3, min_row=5, max_row=10)
    cats4 = Reference(ws4, min_col=2, min_row=6, max_row=10)
    chart4.add_data(data4, titles_from_data=True)
    chart4.set_categories(cats4)
    ws4.add_chart(chart4, "F5")

    ws4.column_dimensions["B"].width = 24
    ws4.column_dimensions["C"].width = 16
    ws4.column_dimensions["D"].width = 14

    # =========================================================================
    # HOJA 5: RETO TODO EN 1 (UNA SOLA HOJA PARA PRACTICAR)
    # =========================================================================
    ws5 = wb.create_sheet(title="5. Todo en Una Hoja")
    ws5.views.sheetView[0].showGridLines = True

    ws5["B2"] = "🎯 HOJA DE PRÁCTICA RÁPIDA: LOS 3 BÁSICOS EN UN SOLO LUGAR"
    ws5["B2"].font = Font(name="Segoe UI", size=14, bold=True, color="1E3A8A")
    ws5["B3"] = "Aquí tienes 3 mini-tablas listas para que selecciones y crees tú mismo los 3 gráficos más útiles."
    ws5["B3"].font = Font(name="Segoe UI", size=10.5, italic=True, color="475569")

    # Tabla A: Columnas (Ventas Vendedores)
    ws5["B5"] = "PRÁCTICA A: Columnas"
    ws5["B5"].font = Font(name="Segoe UI", size=11, bold=True, color="1D4ED8")

    ws5["B6"] = "Vendedor"
    ws5["C6"] = "Ventas ($)"
    ws5["B6"].fill = PatternFill("solid", fgColor="1D4ED8")
    ws5["C6"].fill = PatternFill("solid", fgColor="1D4ED8")
    ws5["B6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["C6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["B6"].border = borde
    ws5["C6"].border = borde

    vends = [["Carlos", 4500], ["Ana", 6200], ["Pedro", 3900], ["María", 5800]]
    for idx, (v, val) in enumerate(vends, start=7):
        c_v = ws5.cell(row=idx, column=2, value=v)
        c_v.font = Font(name="Segoe UI", size=10)
        c_v.border = borde
        c_val = ws5.cell(row=idx, column=3, value=val)
        c_val.font = Font(name="Segoe UI", size=10)
        c_val.number_format = '"$"#,##0'
        c_val.alignment = Alignment(horizontal="right")
        c_val.border = borde

    ws5["B12"] = "👉 Selecciona B6:C10 y presiona Alt + F1"
    ws5["B12"].font = Font(name="Segoe UI", size=9.5, italic=True, color="1E40AF")

    # Tabla B: Líneas (Temperaturas)
    ws5["E5"] = "PRÁCTICA B: Líneas"
    ws5["E5"].font = Font(name="Segoe UI", size=11, bold=True, color="C2410C")

    ws5["E6"] = "Día"
    ws5["F6"] = "Temperatura (°C)"
    ws5["E6"].fill = PatternFill("solid", fgColor="C2410C")
    ws5["F6"].fill = PatternFill("solid", fgColor="C2410C")
    ws5["E6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["F6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["E6"].border = borde
    ws5["F6"].border = borde

    dias = [["Lunes", 22], ["Martes", 25], ["Miércoles", 27], ["Jueves", 23], ["Viernes", 28]]
    for idx, (d, t) in enumerate(dias, start=7):
        c_d = ws5.cell(row=idx, column=5, value=d)
        c_d.font = Font(name="Segoe UI", size=10)
        c_d.border = borde
        c_t = ws5.cell(row=idx, column=6, value=t)
        c_t.font = Font(name="Segoe UI", size=10)
        c_t.number_format = '0"°C"'
        c_t.alignment = Alignment(horizontal="right")
        c_t.border = borde

    ws5["E13"] = "👉 Selecciona E6:F11 e inserta Líneas"
    ws5["E13"].font = Font(name="Segoe UI", size=9.5, italic=True, color="9A3412")

    # Tabla C: Circular (Encuesta)
    ws5["H5"] = "PRÁCTICA C: Circular"
    ws5["H5"].font = Font(name="Segoe UI", size=11, bold=True, color="047857")

    ws5["H6"] = "Satisfacción"
    ws5["I6"] = "Clientes"
    ws5["H6"].fill = PatternFill("solid", fgColor="047857")
    ws5["I6"].fill = PatternFill("solid", fgColor="047857")
    ws5["H6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["I6"].font = Font(name="Segoe UI", size=10, bold=True, color=BLANCO)
    ws5["H6"].border = borde
    ws5["I6"].border = borde

    enc = [["Excelente", 65], ["Bueno", 25], ["Regular", 10]]
    for idx, (s, cnt) in enumerate(enc, start=7):
        c_s = ws5.cell(row=idx, column=8, value=s)
        c_s.font = Font(name="Segoe UI", size=10)
        c_s.border = borde
        c_c = ws5.cell(row=idx, column=9, value=cnt)
        c_c.font = Font(name="Segoe UI", size=10)
        c_c.number_format = "#,##0"
        c_c.alignment = Alignment(horizontal="right")
        c_c.border = borde

    ws5["H11"] = "👉 Selecciona H6:I9 e inserta Circular"
    ws5["H11"].font = Font(name="Segoe UI", size=9.5, italic=True, color="065F46")

    ws5.column_dimensions["B"].width = 16
    ws5.column_dimensions["C"].width = 14
    ws5.column_dimensions["D"].width = 4
    ws5.column_dimensions["E"].width = 14
    ws5.column_dimensions["F"].width = 18
    ws5.column_dimensions["G"].width = 4
    ws5.column_dimensions["H"].width = 16
    ws5.column_dimensions["I"].width = 14

    output_path = Path("/Users/juanalmeida/Downloads/Proyectos/WEB/TIC(EXCEL)/Practica_Graficos_Sencilla.xlsx")
    wb.save(output_path)
    print(f"Archivo sencillo guardado en: {output_path}")

if __name__ == "__main__":
    crear_libro_sencillo()
