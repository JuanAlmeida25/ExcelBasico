"""
Genera los archivos de práctica (.xlsx y .csv) de cada actividad de la guía.

Todo es de una empresa ficticia, Lácteos del Caribe S.A.S., así que nadie se va a
quejar de que sacamos sus documentos. Se corre una sola vez (o cuando cambien los datos):

    python3 scripts/generar_datos.py

Deja los archivos en public/datos/ y el índice en src/datos/archivos.json,
que es el que lee la página para pintar los botones de descarga.
"""

import csv
import json
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

RAIZ = Path(__file__).resolve().parent.parent
CARPETA_SALIDA = RAIZ / "public" / "datos"
INDICE = RAIZ / "src" / "datos" / "archivos.json"

# fecha fija para que todos los aprendices obtengan los mismos estados, sin importar el día que abran el archivo
FECHA_CORTE = date(2026, 10, 22)
DIAS_POR_VENCER = 30

VERDE_EXCEL = PatternFill("solid", fgColor="107C41")
FUENTE_ENCABEZADO = Font(bold=True, color="FFFFFF")


# ---------------------------------------------------------------------------
# Datos base de la empresa
# ---------------------------------------------------------------------------

RESPONSABLES = [
    ("R01", "Laura Pimienta", "Coordinadora SIG"),
    ("R02", "Andrés Brito", "Jefe de producción"),
    ("R03", "Marelvis Ospino", "Directora comercial"),
    ("R04", "Kevin Fragozo", "Líder de logística"),
    ("R05", "Yesenia Uriana", "Jefe de talento humano"),
    ("R06", "Camilo Iguarán", "Coordinador de compras"),
    ("R07", "Daniela Epiayú", "Profesional SST"),
    ("R08", "Rafael Mendoza", "Gerente general"),
]

# Mantenimiento queda sin responsable a propósito (actividad 1.3)
PROCESOS = [
    ("PE-01", "Direccionamiento estratégico", "Estratégico", "R08"),
    ("PE-02", "Gestión de la calidad", "Estratégico", "R01"),
    ("PM-01", "Producción", "Misional", "R02"),
    ("PM-02", "Comercial y ventas", "Misional", "R03"),
    ("PM-03", "Logística y distribución", "Misional", "R04"),
    ("PA-01", "Talento humano", "Apoyo", "R05"),
    ("PA-02", "Compras", "Apoyo", "R06"),
    ("PA-03", "Mantenimiento", "Apoyo", ""),
    ("PA-04", "Seguridad y salud en el trabajo", "Apoyo", "R07"),
    ("PA-05", "Gestión ambiental", "Apoyo", "R01"),
]

TIPOS_DOCUMENTO = {
    "PO": "Política",
    "PL": "Plan",
    "PR": "Procedimiento",
    "FO": "Formato",
    "IN": "Instructivo",
    "MA": "Manual",
}

# (proceso, tipo, nombre, versión, aprobado, vence, días de revisión)
# Gestión ambiental no tiene documentos a propósito (actividad 4.1)
DOCUMENTOS_CRUDOS = [
    ("PE-01", "PO", "Política del SIG", 3, "2024-02-10", "2027-02-10", 12),
    ("PE-01", "PL", "Plan estratégico 2025-2028", 1, "2025-01-15", "2026-11-05", 20),
    ("PE-01", "PR", "Revisión por la dirección", 2, "2023-09-01", "2025-09-01", 9),
    ("PE-01", "FO", "Acta de revisión por la dirección", 2, "2024-06-12", "2026-10-30", 5),
    ("PE-02", "MA", "Manual del SIG", 4, "2024-03-01", "2027-03-01", 25),
    ("PE-02", "PR", "Control de documentos", 5, "2025-05-20", "2027-05-20", 8),
    ("PE-02", "PR", "Auditorías internas", 3, "2023-08-15", "2025-08-15", 14),
    ("PE-02", "PR", "Acciones correctivas", 2, "2024-10-10", "2026-11-12", 10),
    ("PE-02", "FO", "Listado maestro de documentos", 6, "2025-07-01", "2027-07-01", 3),
    ("PE-02", "FO", "Plan de auditoría", 2, "2024-01-20", "2026-01-20", 6),
    ("PM-01", "PR", "Control de producción", 3, "2024-11-05", "2026-11-15", 15),
    ("PM-01", "IN", "Limpieza y desinfección de equipos", 4, "2025-02-14", "2027-02-14", 7),
    ("PM-01", "IN", "Pasteurización", 2, "2023-06-30", "2025-06-30", 18),
    ("PM-01", "FO", "Registro de temperatura", 5, "2025-09-01", "2027-09-01", 2),
    ("PM-01", "FO", "Control de lotes", 3, "2024-04-18", "2026-04-18", 4),
    ("PM-01", "PR", "Producto no conforme", 2, "2025-03-03", "2027-03-03", 11),
    ("PM-02", "PR", "Atención de PQRS", 3, "2024-08-08", "2026-11-20", 9),
    ("PM-02", "PR", "Ventas y cotizaciones", 2, "2025-04-11", "2027-04-11", 6),
    ("PM-02", "FO", "Encuesta de satisfacción", 4, "2023-12-01", "2025-12-01", 4),
    ("PM-02", "FO", "Registro de PQRS", 2, "2025-06-06", "2027-06-06", 3),
    ("PM-03", "PR", "Despacho y entrega", 3, "2024-05-22", "2026-05-22", 12),
    ("PM-03", "IN", "Cargue de vehículos", 1, "2025-08-19", "2027-08-19", 5),
    ("PM-03", "FO", "Lista de chequeo de vehículos", 2, "2024-10-01", "2026-11-01", 2),
    ("PM-03", "FO", "Control de inventario", 4, "2025-01-09", "2027-01-09", 6),
    ("PA-01", "PR", "Selección y contratación", 4, "2024-07-15", "2026-07-15", 16),
    ("PA-01", "PR", "Inducción y reinducción", 3, "2025-02-02", "2027-02-02", 8),
    ("PA-01", "FO", "Evaluación de desempeño", 2, "2024-09-30", "2026-11-10", 7),
    ("PA-01", "PL", "Plan de capacitación 2026", 1, "2026-01-10", "2026-12-31", 10),
    ("PA-02", "PR", "Compras y evaluación de proveedores", 3, "2023-11-11", "2025-11-11", 13),
    ("PA-02", "FO", "Orden de compra", 5, "2025-05-05", "2027-05-05", 2),
    ("PA-02", "FO", "Evaluación de proveedores", 2, "2024-12-12", "2026-12-12", 5),
    ("PA-03", "PR", "Mantenimiento preventivo", 2, "2024-03-25", "2026-03-25", 14),
    ("PA-03", "FO", "Hoja de vida de equipos", 3, "2025-07-07", "2027-07-07", 4),
    ("PA-03", "FO", "Solicitud de mantenimiento", 1, "2025-10-15", "2026-11-08", 3),
    ("PA-04", "PL", "Plan de emergencias", 3, "2025-03-18", "2027-03-18", 21),
    ("PA-04", "PR", "Reporte de incidentes y accidentes", 2, "2024-06-01", "2026-06-01", 9),
    ("PA-04", "MA", "Manual de SST", 2, "2024-02-28", "2026-11-18", 19),
    ("PA-04", "FO", "Inspección de EPP", 4, "2025-08-08", "2027-08-08", 3),
    ("PA-04", "IN", "Trabajo en alturas", 2, "2023-10-20", "2025-10-20", 12),
    ("PA-04", "FO", "Matriz de peligros", 3, "2025-01-30", "2027-01-30", 17),
]

# (indicador, fórmula, proceso, meta, T1, T2, T3) — todos son "entre más alto, mejor"
INDICADORES = [
    ("Documentos vigentes", "Documentos vigentes / Total de documentos × 100", "PE-02", 90, 72, 78, 80),
    ("Satisfacción del cliente", "Clientes satisfechos / Clientes encuestados × 100", "PM-02", 85, 82, 86, 88),
    ("Cumplimiento del plan de auditorías", "Auditorías realizadas / Auditorías programadas × 100", "PE-02", 100, 60, 80, 95),
    ("Acciones correctivas cerradas a tiempo", "Acciones cerradas a tiempo / Acciones abiertas × 100", "PE-02", 80, 55, 62, 70),
    ("Cumplimiento del plan de capacitación", "Capacitaciones realizadas / Capacitaciones programadas × 100", "PA-01", 90, 70, 85, 92),
    ("Entregas a tiempo", "Pedidos entregados a tiempo / Pedidos totales × 100", "PM-03", 95, 93, 91, 96),
    ("Proveedores evaluados", "Proveedores evaluados / Proveedores activos × 100", "PA-02", 100, 40, 65, 85),
    ("Mantenimientos preventivos ejecutados", "Mantenimientos ejecutados / Mantenimientos programados × 100", "PA-03", 90, 88, 75, 70),
]

# (código, descripción, proceso, probabilidad, impacto, control, responsable)
RIESGOS = [
    ("R-01", "Uso de documentos obsoletos en producción", "PM-01", 4, 4, "Listado maestro y retiro de copias obsoletas", "R02"),
    ("R-02", "Incumplimiento de requisitos legales ambientales", "PA-05", 3, 5, "Matriz legal con seguimiento trimestral", "R01"),
    ("R-03", "Accidente por trabajo en alturas", "PA-04", 2, 5, "Permisos de trabajo y uso de EPP certificado", "R07"),
    ("R-04", "Pérdida de clientes por PQRS sin respuesta", "PM-02", 3, 4, "Seguimiento semanal de PQRS abiertas", "R03"),
    ("R-05", "Materia prima no conforme del proveedor", "PA-02", 3, 3, "Evaluación y reevaluación de proveedores", "R06"),
    ("R-06", "Falla de equipos por falta de mantenimiento", "PA-03", 4, 3, "Plan de mantenimiento preventivo", "R02"),
    ("R-07", "Rotación de personal clave", "PA-01", 2, 3, "Plan de sucesión y entrenamiento cruzado", "R05"),
    ("R-08", "Retrasos en entregas por fallas logísticas", "PM-03", 3, 2, "Rutas alternas y vehículo de respaldo", "R04"),
    ("R-09", "Pérdida de información del SIG", "PE-02", 2, 4, "Copias de seguridad semanales en la nube", "R01"),
    ("R-10", "Contaminación cruzada del producto", "PM-01", 2, 5, "Instructivo de limpieza y desinfección", "R02"),
    ("R-11", "Hallazgos de auditoría sin cierre", "PE-02", 4, 2, "Plan de acción con fechas y responsables", "R01"),
    ("R-12", "Derrame de químicos de limpieza", "PA-04", 1, 4, "Kit antiderrames y capacitación", "R07"),
]

ACTIVIDADES_RACI = [
    "Elaborar documentos del SIG",
    "Aprobar documentos",
    "Controlar el listado maestro",
    "Planear auditorías internas",
    "Ejecutar auditorías internas",
    "Tratar no conformidades",
    "Realizar la revisión por la dirección",
    "Medir indicadores",
    "Gestionar riesgos",
    "Capacitar al personal en el SIG",
]
ROLES_RACI = ["Gerente general", "Coordinadora SIG", "Líderes de proceso", "Auditor interno", "Talento humano", "Colaboradores"]


# ---------------------------------------------------------------------------
# Datos derivados
# ---------------------------------------------------------------------------

NOMBRE_PROCESO = {codigo: nombre for codigo, nombre, _, _ in PROCESOS}
TIPO_PROCESO = {codigo: tipo for codigo, _, tipo, _ in PROCESOS}
RESPONSABLE_PROCESO = {codigo: responsable for codigo, _, _, responsable in PROCESOS}
NOMBRE_RESPONSABLE = {codigo: nombre for codigo, nombre, _ in RESPONSABLES}


def correo(nombre):
    # quitamos tildes a lo bruto para que el correo no quede con "ó"
    limpio = nombre.lower()
    for con, sin in zip("áéíóúñ", "aeioun"):
        limpio = limpio.replace(con, sin)
    return limpio.replace(" ", ".") + "@example.com"


def estado(vence):
    dias = (vence - FECHA_CORTE).days
    if dias < 0:
        return "Vencido"
    if dias <= DIAS_POR_VENCER:
        return "Por vencer"
    return "Vigente"


def armar_documentos():
    documentos = []
    consecutivos = {}
    for proceso, tipo, nombre, version, aprobado, vence, dias_revision in DOCUMENTOS_CRUDOS:
        llave = (proceso, tipo)
        consecutivos[llave] = consecutivos.get(llave, 0) + 1
        vence = date.fromisoformat(vence)
        documentos.append({
            "codigo": f"{proceso}-{tipo}-{consecutivos[llave]:02d}",
            "nombre": nombre,
            "tipo": TIPOS_DOCUMENTO[tipo],
            "proceso": proceso,
            "version": version,
            "aprobado": date.fromisoformat(aprobado),
            "vence": vence,
            "dias_revision": dias_revision,
            "estado": estado(vence),
        })
    return documentos


DOCUMENTOS = armar_documentos()


# ---------------------------------------------------------------------------
# Escritura de archivos
# ---------------------------------------------------------------------------

def escribir_xlsx(ruta, hojas):
    libro = Workbook()
    libro.remove(libro.active)
    for nombre_hoja, encabezados, filas in hojas:
        hoja = libro.create_sheet(nombre_hoja)
        hoja.append(encabezados)
        for fila in filas:
            hoja.append(list(fila))
        for celda in hoja[1]:
            celda.fill = VERDE_EXCEL
            celda.font = FUENTE_ENCABEZADO
            celda.alignment = Alignment(vertical="center", wrap_text=True)
        hoja.freeze_panes = "A2"
        # ancho de columna a ojo según el texto más largo, con tope para que no quede kilométrica
        for indice, encabezado in enumerate(encabezados, start=1):
            valores = [encabezado] + [fila[indice - 1] for fila in filas if indice - 1 < len(fila)]
            largo = max(len(str(v)) if v is not None else 0 for v in valores)
            hoja.column_dimensions[get_column_letter(indice)].width = min(max(largo + 3, 10), 60)
        for fila in hoja.iter_rows(min_row=2):
            for celda in fila:
                if isinstance(celda.value, date):
                    celda.number_format = "DD/MM/YYYY"

        if nombre_hoja == "Presupuesto_SIG":
            hoja.freeze_panes = "A5"
            hoja.merge_cells("C1:E1")
            hoja.merge_cells("C2:E2")
            for celda in hoja[4]:
                celda.fill = VERDE_EXCEL
                celda.font = FUENTE_ENCABEZADO
                celda.alignment = Alignment(vertical="center", wrap_text=True)
            hoja["B2"].number_format = "$#,##0"
            hoja["B2"].font = Font(bold=True)
            hoja["C2"].alignment = Alignment(vertical="center", wrap_text=True)
            for r in range(21, 25):
                hoja.cell(row=r, column=3).font = Font(bold=True)
                hoja.cell(row=r, column=3).alignment = Alignment(horizontal="right")
            hoja.column_dimensions["A"].width = 16
            hoja.column_dimensions["B"].width = 38
            hoja.column_dimensions["C"].width = 32
            hoja.column_dimensions["D"].width = 22
            hoja.column_dimensions["E"].width = 22
    libro.properties.creator = "Guía TIC Excel - Ficha 3312002"
    libro.save(ruta)


def escribir_csv(ruta, encabezados, filas):
    # punto y coma y BOM: así el Excel en español lo abre derechito y sin tildes rotas
    with open(ruta, "w", newline="", encoding="utf-8-sig") as archivo:
        escritor = csv.writer(archivo, delimiter=";")
        escritor.writerow(encabezados)
        for fila in filas:
            escritor.writerow([
                valor.strftime("%d/%m/%Y") if isinstance(valor, date) else ("" if valor is None else valor)
                for valor in fila
            ])


def vacio(n):
    return [None] * n


# ---------------------------------------------------------------------------
# Hojas por actividad
# ---------------------------------------------------------------------------

def hoja_responsables():
    return (
        "Responsables",
        ["ID", "Nombre", "Cargo", "Correo"],
        [(codigo, nombre, cargo, correo(nombre)) for codigo, nombre, cargo in RESPONSABLES],
    )


def hoja_procesos(con_responsable_id=True):
    if con_responsable_id:
        return ("Procesos", ["Código", "Proceso", "Tipo", "ID responsable"], PROCESOS)
    return ("Procesos", ["Código", "Proceso", "Tipo"], [p[:3] for p in PROCESOS])


def hoja_parametros_estado():
    return (
        "Parametros",
        ["Parámetro", "Valor"],
        [
            ("Fecha de corte", FECHA_CORTE),
            ("Días para considerar 'Por vencer'", DIAS_POR_VENCER),
        ],
    )


def hoja_enunciado(codigo, titulo, situacion, mision, requerimientos, reto_tecnico):
    filas = [
        ("Código de Actividad", codigo),
        ("Título del Caso", titulo),
        ("Organización", "Lácteos del Caribe S.A.S. - Sistema Integrado de Gestión"),
        ("1. Situación Problema", situacion),
        ("2. Misión del Aprendiz", mision),
    ]
    for idx, req in enumerate(requerimientos, start=1):
        filas.append((f"Requerimiento {idx}", req))
    filas.append(("Dificultad Clave / Regla Técnica", reto_tecnico))
    return ("Enunciado_Caso", ["Sección", "Detalle del Requerimiento / Parámetros del Caso"], filas)


def actividades():
    d = DOCUMENTOS

    return {
        "1.1": {
            "archivo": "1.1_Explorando_entorno",
            "nota": "Exploración del entorno de Excel, reconocimiento de celdas, rangos y cinta de opciones.",
            "hojas": [
                ("Datos", ["ID", "Nombre", "Cargo", "Correo"],
                 [(c, n, cargo, correo(n)) for c, n, cargo in RESPONSABLES]),
                ("Retos", ["N°", "Reto", "Tu respuesta"], [
                    (1, "¿En qué celda de la hoja Datos está el nombre 'Kevin Fragozo'?", None),
                    (2, "¿Cuántas filas y cuántas columnas tiene el rango A1:D9 de la hoja Datos?", None),
                    (3, "Selecciona el rango A2:A9 de la hoja Datos. ¿Qué muestra la barra de estado abajo a la derecha?", None),
                    (4, "Cambia el nombre de la hoja Datos por 'Mi_Equipo'. ¿Cómo lo hiciste?", None),
                    (5, "Agrega el botón 'Ordenar' a la barra de acceso rápido. ¿Dónde quedó?", None),
                    (6, "Usa Ctrl + → en una fila vacía. ¿Cuál es la última columna de Excel?", None),
                    (7, "Usa Ctrl + ↓ en una columna vacía. ¿Cuántas filas tiene una hoja?", None),
                ]),
            ],
        },
        "1.2": {
            "archivo": "1.2_Registro_SIG_fuente",
            "nota": "Creación del libro Registro_SIG.xlsx e ingreso de datos estructurados de procesos y líderes.",
            "hojas": [
                hoja_procesos(con_responsable_id=False),
                ("Documentos", ["Código", "Documento", "Código proceso", "Fecha de aprobación", "Versión"],
                 [(x["codigo"], x["nombre"], x["proceso"], x["aprobado"], x["version"]) for x in d]),
                hoja_responsables(),
            ],
        },
        "1.3": {
            "archivo": "1.3_Formatos_condicionales",
            "nota": "Aplicación de formatos de celda y reglas de formato condicional para resaltar alertas.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Versión", "Fecha de aprobación", "Fecha de vencimiento"],
                 [(x["codigo"], x["nombre"], x["version"], x["aprobado"], x["vence"]) for x in d]),
                ("Procesos", ["Código", "Proceso", "Tipo", "Responsable"],
                 [(c, n, t, NOMBRE_RESPONSABLE.get(r, "")) for c, n, t, r in PROCESOS]),
            ],
        },
        "1.4": {
            "archivo": "1.4_Formulas_basicas",
            "nota": "Cálculo del costo de documentación con tarifa fija ($B$2) y resumen con SUMA, PROMEDIO y CONTAR en una sola hoja.",
            "hojas": [
                ("Presupuesto_SIG",
                 ["Parámetro", "Valor", "Instrucciones de la Actividad", "", ""],
                 [
                     ("Tarifa fija por hora ($)", 28500, "1. En la columna 'Costo ($)' calcula =Horas * $B$2 (fijando B2 con $). 2. Completa el resumen al final con SUMA, PROMEDIO y CONTAR.", None, None),
                     ("", "", "", "", ""),
                     ("Código", "Documento", "Proceso", "Horas de elaboración", "Costo ($)"),
                 ] + [
                     (x["codigo"], x["nombre"], NOMBRE_PROCESO[x["proceso"]], 4 + (x["dias_revision"] % 7) * 2, None)
                     for x in d[:15]
                 ] + [
                     ("", "", "", "", ""),
                     ("", "", "Total de horas", None, None),
                     ("", "", "Promedio de horas", None, None),
                     ("", "", "Costo total liquidado", None, None),
                     ("", "", "Cantidad de documentos", None, None),
                 ]),
            ],
        },
        "2.1": {
            "archivo": "2.1_Funcion_SI",
            "nota": "Control de vigencias documentales y clasificación de criticidad mediante fórmulas lógicas condicionales con función SI.",
            "hojas": [
                hoja_enunciado(
                    "2.1",
                    "Control de vigencias y semáforo de criticidad documental",
                    "La auditoría externa de certificación ISO 9001 / ISO 14001 está próxima. Un solo documento crítico vencido generará una No Conformidad Mayor para Lácteos del Caribe.",
                    "Automatizar el control de vigencias de los 24 documentos del inventario evaluando fechas límite con =SI() anidada y determinando prioridad de acción.",
                    [
                        "Días Restantes: Restar la fecha de vencimiento menos la fecha fija de corte (Parametros!$B$2).",
                        "Estado Documental: Usar =SI() anidado: si Días < 0 -> 'Vencido'; si Días <= 30 -> 'Por vencer'; de lo contrario -> 'Vigente'.",
                        "Prioridad de Acción SIG: Si Estado = 'Vencido' Y Criticidad = 'Alta' -> 'URGENTE: Bloquear Proceso'; si está vencido o por vencer -> 'Atención Inmediata'; de lo contrario -> 'Al día'."
                    ],
                    "Los documentos vencidos tienen días negativos. El orden de las condiciones en =SI() debe evaluar primero < 0 para no clasificar incorrectamente los archivos vencidos."
                ),
                hoja_parametros_estado(),
                ("Control_Vigencias", ["Código", "Documento", "Proceso", "Criticidad", "Fecha de vencimiento", "Días para vencer", "Estado Documental", "Prioridad de Acción SIG"],
                 [(x["codigo"], x["nombre"], NOMBRE_PROCESO[x["proceso"]],
                   "Alta" if x["tipo"] in ("Manual", "Plan", "Política") or "Pasteurización" in x["nombre"] else ("Media" if x["tipo"] == "Procedimiento" else "Operativa"),
                   x["vence"], None, None, None)
                  for x in d]),
            ],
        },
        "2.2": {
            "archivo": "2.2_BUSCARV_consolidado",
            "nota": "Consolidación relacional de documentos, procesos y líderes mediante BUSCARV/BUSCARX con control de errores.",
            "hojas": [
                hoja_enunciado(
                    "2.2",
                    "Consolidación relacional de auditoría con blindaje de errores",
                    "La información del SIG está fragmentada en 3 hojas independientes: inventario de documentos (códigos), catálogo de procesos y directorio de responsables.",
                    "Construir la hoja Consolidado_Auditoria cruzando las fuentes con BUSCARV o BUSCARX, envolviendo con SI.ERROR para reemplazar errores #N/D por 'SIN ASIGNAR'.",
                    [
                        "Cruce de Proceso: Extraer Nombre del Proceso y Macroproceso (Tipo) desde la hoja Procesos.",
                        "Cruce de Responsable: Traer Nombre del Responsable y Correo Corporativo desde la hoja Responsables cruzando el ID responsable.",
                        "Tratamiento de Excepciones: El proceso PA-03 Mantenimiento no tiene responsable asignado y generará #N/D. Envolver con =SI.ERROR(BUSCARV(...); 'SIN ASIGNAR')."
                    ],
                    "En BUSCARV el código buscado debe estar en la columna 1 del rango y el 4to argumento debe ser coincidencia exacta (FALSO o 0). Todo el cruce de líderes debe protegerse con SI.ERROR."
                ),
                ("Documentos", ["Código", "Documento", "Código proceso"],
                 [(x["codigo"], x["nombre"], x["proceso"]) for x in d]),
                hoja_procesos(),
                hoja_responsables(),
                ("Consolidado_Auditoria", ["Código Documento", "Documento", "Código Proceso", "Nombre del Proceso", "Macroproceso (Tipo)", "Responsable Líder", "Correo Corporativo"],
                 [(x["codigo"], x["nombre"], x["proceso"], None, None, None, None) for x in d]),
            ],
        },
        "2.3": {
            "archivo": "2.3_Tablas_y_filtros",
            "nota": "Estructuración del inventario en Tablas de Excel con referencias estructuradas, filtros y subtotales dinámicos.",
            "hojas": [
                hoja_enunciado(
                    "2.3",
                    "Auditoría interactiva con Tablas de Excel y subtotales dinámicos",
                    "En el Comité de Calidad mensual se requiere auditar el estado documental en tiempo real mediante filtros sin desconfigurar fórmulas ni rangos.",
                    "Transformar el listado plano en una Tabla Oficial de Excel nombrada Tabla_SIG, agregar columna calculada estructurada, activar fila de subtotales y resolver 3 retos de auditoría.",
                    [
                        "Tabla Oficial: Convertir Datos_Crudos en Tabla con Ctrl+T y nombrarla Tabla_SIG.",
                        "Columna Estructurada: Crear columna Dias_Faltantes con fórmula de tabla: [@Fecha de vencimiento] - Parametros!$B$2.",
                        "Fila de Subtotales: Activar totales dinámicos con SUBTOTALES para recuento y promedio de días de revisión.",
                        "Consultas de Comité: Filtrar la tabla y responder las 3 preguntas en la hoja Consultas_Auditoria."
                    ],
                    "Las fórmulas normales (SUMA/CONTAR) calculan filas ocultas. Comprueba que la fila de totales use SUBTOTALES (códigos 103/109) para reflejar solo lo filtrado."
                ),
                ("Parametros", ["Parámetro", "Valor"], [("Fecha de corte de auditoría", FECHA_CORTE)]),
                ("Datos_Crudos", ["Código", "Documento", "Tipo", "Proceso", "Tipo de proceso", "Versión", "Fecha de aprobación", "Fecha de vencimiento", "Estado", "Días de revisión"],
                 [(x["codigo"], x["nombre"], x["tipo"], NOMBRE_PROCESO[x["proceso"]], TIPO_PROCESO[x["proceso"]], x["version"], x["aprobado"], x["vence"], x["estado"], x["dias_revision"])
                  for x in d]),
                ("Consultas_Auditoria", ["N°", "Pregunta de Auditoría en Comité", "Tu Respuesta Formulada / Filtrada"], [
                    (1, "¿Cuántos documentos en estado 'Vencido' pertenecen a procesos de tipo 'Misional'?", None),
                    (2, "¿Cuál es el promedio de días de revisión para los documentos del proceso 'Seguridad y salud en el trabajo'?", None),
                    (3, "Aplica un filtro por Estado = 'Por vencer'. ¿Qué valor dinámico muestra la fila de subtotales para el recuento total?", None),
                ]),
            ],
        },
        "2.4": {
            "archivo": "2.4_Graficos",
            "nota": "Construcción de tablas de frecuencias con CONTAR.SI y diseño de gráficos ejecutivos de barras y circular.",
            "hojas": [
                hoja_enunciado(
                    "2.4",
                    "Dashboard visual ejecutivo y reporte de distribución SIG",
                    "El Comité Directivo dispone de solo 5 minutos para evaluar el estado documental. Se requiere un informe gráfico ejecutivo de 1 página con tablas de frecuencias formuladas.",
                    "Construir 2 tablas de frecuencias con =CONTAR.SI() en Informe_Grafico y diseñar un Gráfico de Columnas (carga por proceso) y un Gráfico Circular (proporción de estados).",
                    [
                        "Frecuencias por Proceso: Calcular la cantidad de documentos por proceso con =CONTAR.SI().",
                        "Frecuencias por Estado: Calcular cantidad y % de participación por estado (Vigente, Por vencer, Vencido) con =CONTAR.SI().",
                        "Gráfico de Columnas: Representar la carga documental por proceso con títulos claros y etiquetas numéricas.",
                        "Gráfico Circular / Anillos: Representar la proporción de vigencias destacando el sector 'Vencido' en color rojo de alerta."
                    ],
                    "No se aceptan gráficos generados contando filas manualmente. Sus series deben estar enlazadas a las tablas formuladas con CONTAR.SI()."
                ),
                ("Base_Documentos", ["Código", "Documento", "Proceso", "Estado"],
                 [(x["codigo"], x["nombre"], NOMBRE_PROCESO[x["proceso"]], x["estado"]) for x in d]),
                ("Informe_Grafico", ["Proceso", "Total Documentos (=CONTAR.SI)", "", "Estado Documental", "Cantidad (=CONTAR.SI)", "% Participación"],
                 [(p[1], None, None, e, None, None) for p, e in zip(
                     PROCESOS,
                     ["Vigente", "Por vencer", "Vencido"] + [None] * (len(PROCESOS) - 3)
                 )]),
            ],
        },
        "3.1": {
            "archivo": "3.1_Tabla_dinamica",
            "nota": "Análisis multidimensional de madurez documental mediante Tabla Dinámica con jerarquías y segmentadores.",
            "hojas": [
                hoja_enunciado(
                    "3.1",
                    "Análisis multidimensional y diagnóstico SIG con Tablas Dinámicas",
                    "Para la Revisión por la Dirección (ISO 9001:2015), la Coordinación SIG debe diagnosticar qué macroprocesos concentran el mayor cuello de botella documental.",
                    "Construir una Tabla Dinámica en la hoja Diagnostico_Dinamico con jerarquía de filas, vista porcentual de filas, segmentadores de datos (Slicers) y conclusión ejecutiva.",
                    [
                        "Crear Tabla Dinámica: En hoja Diagnostico_Dinamico con origen en Base_Auditoria.",
                        "Jerarquía y Valores: Filas = 'Tipo de proceso' y 'Proceso'; Columnas = 'Estado'; Valores = Recuento de 'Código'.",
                        "Vista Porcentual: Duplicar campo de valor y configurarlo como '% del total de filas' para identificar la tasa de riesgo por proceso.",
                        "Segmentadores Interactivos: Agregar segmentación por 'Tipo de proceso' y 'Responsable'.",
                        "Conclusión Diagnóstica: Redactar en la celda designada cuál es el proceso más crítico y la acción preventiva propuesta."
                    ],
                    "Configura la base de porcentaje como '% del total de filas' (no del total general) para que cada proceso sume 100% y la comparación sea rigurosa."
                ),
                ("Base_Auditoria", ["Código", "Documento", "Tipo de documento", "Proceso", "Tipo de proceso", "Responsable", "Fecha de vencimiento", "Estado"],
                 [(x["codigo"], x["nombre"], x["tipo"], NOMBRE_PROCESO[x["proceso"]], TIPO_PROCESO[x["proceso"]],
                   NOMBRE_RESPONSABLE.get(RESPONSABLE_PROCESO[x["proceso"]], "Sin asignar"), x["vence"], x["estado"])
                  for x in d]),
                ("Diagnostico_Dinamico", ["Paso / Elemento del Dashboard", "Instrucciones de Construcción y Entrega"], [
                    ("Espacio para Tabla Dinámica", "Inserta aquí la Tabla Dinámica jerárquica a partir de Base_Auditoria (rango A1:H25)."),
                    ("Configuración de Filas", "Nivel 1: Tipo de proceso | Nivel 2: Proceso"),
                    ("Configuración de Columnas", "Campo: Estado (Vigente, Por vencer, Vencido)"),
                    ("Configuración de Valores", "Recuento de Código y % del total de filas"),
                    ("Segmentadores de Datos", "Inserta Slicers para 'Tipo de proceso' y 'Responsable'"),
                    ("Conclusión Diagnóstica", "Escribe aquí tu análisis gerencial: ¿Qué proceso requiere auditoría extraordinaria inmediata?"),
                ]),
            ],
        },
        "3.2": {
            "archivo": "3.2_Conteo_condicional",
            "nota": "Cálculo de indicadores de rendimiento procesal con funciones estadísticas y blindaje contra divisiones entre cero.",
            "hojas": [
                hoja_enunciado(
                    "3.2",
                    "Métricas de rendimiento procesal y estadísticas condicionales",
                    "El SIG evalúa la eficiencia de los procesos de Lácteos del Caribe midiendo la tasa de vigencia documental y los tiempos de revisión técnica.",
                    "Construir el tablero de métricas por proceso usando CONTAR.SI, CONTAR.SI.CONJUNTO y PROMEDIO.SI, protegiendo las fórmulas contra divisiones por cero con SI.ERROR.",
                    [
                        "Total Documentos: =CONTAR.SI() en Base_Documentos por proceso.",
                        "Documentos Vigentes: =CONTAR.SI.CONJUNTO() por proceso y estado 'Vigente'.",
                        "% Cobertura Vigente: Vigentes / Total formateado en porcentaje con un decimal.",
                        "Promedio Días Revisión: =PROMEDIO.SI() por proceso.",
                        "Blindaje contra Errores: PA-05 Gestión Ambiental no tiene documentos (0/0 genera #¡DIV/0!). Aplica =SI.ERROR(Vigentes/Total; 0) y =SI.ERROR(PROMEDIO.SI(...); 0)."
                    ],
                    "Un informe directivo no puede contener errores #¡DIV/0!. El uso de SI.ERROR es obligatorio para aprobar la auditoría de la hoja."
                ),
                ("Base_Documentos", ["Código", "Proceso", "Estado", "Días de revisión"],
                 [(x["codigo"], NOMBRE_PROCESO[x["proceso"]], x["estado"], x["dias_revision"]) for x in d]),
                ("Tablero_Eficiencia", ["Código", "Proceso", "Total Documentos (=CONTAR.SI)", "Vigentes (=CONTAR.SI.CONJUNTO)", "% Cobertura Vigente", "Promedio Días Revisión (=PROMEDIO.SI)"],
                 [(c, n, None, None, None, None) for c, n, _, _ in PROCESOS]),
            ],
        },
        "3.3": {
            "archivo": "3.3_Matriz_indicadores",
            "nota": "Construcción de matriz de indicadores con cálculo de brechas y semaforización condicional en 3 niveles.",
            "hojas": [
                hoja_enunciado(
                    "3.3",
                    "Matriz de indicadores y semaforización dinámica de metas",
                    "Los 8 procesos reportaron resultados frente a sus metas operativas. Se requiere una matriz que califique automáticamente la eficacia y semaforice las desviaciones.",
                    "Estructurar la matriz de indicadores calculando la brecha (Resultado - Meta), evaluando el estado cualitativo con SI anidado y aplicando formato condicional de 3 semáforos.",
                    [
                        "Cálculo de la Brecha: =Resultado - Meta (muestra la desviación matemática frente a la meta corporativa).",
                        "Estado Cualitativo con SI anidado: si Resultado >= Meta -> 'Conforme'; si Resultado >= Meta - 10 -> 'En Observación'; de lo contrario -> 'Crítico'.",
                        "Semáforo Condicional: Aplicar formato condicional: Verde (Conforme), Amarillo (En Observación) y Rojo (Crítico).",
                        "Alerta CAPA: Resaltar en negrita y rojo los indicadores en estado Crítico que requieran plan de acción correctiva inmediato."
                    ],
                    "Cada indicador tiene una meta distinta (80%, 90%, 95%, 100%). No compares contra un número fijo: las fórmulas condicionales deben comparar celdas relativas (Resultado vs Meta)."
                ),
                ("Reglas_Tolerancia", ["Nivel de Estado", "Condición Matemática", "Acción Requerida", "Color del Semáforo"], [
                    ("Conforme", "Resultado ≥ Meta", "Mantener seguimiento regular", "Verde"),
                    ("En Observación", "Meta - 10 ≤ Resultado < Meta", "Revisión en comité de proceso", "Amarillo"),
                    ("Crítico", "Resultado < Meta - 10", "Apertura obligatoria de Acción Correctiva (CAPA)", "Rojo"),
                ]),
                ("Matriz_Semaforo", ["Código", "Indicador", "Proceso", "Meta (%)", "Resultado Real (%)", "Brecha (Resultado - Meta)", "Estado Cualitativo (=SI)", "Semáforo (Formato Condicional)"],
                 [(f"IND-{idx:02d}", i[0], NOMBRE_PROCESO[i[2]], i[3], i[6], None, None, None) for idx, i in enumerate(INDICADORES, 1)]),
            ],
        },
        "3.4": {
            "archivo": "3.4_Validacion_datos",
            "nota": "Blindaje de captura de datos con listas desplegables, restricciones estrictas y auditoría de registros.",
            "hojas": [
                hoja_enunciado(
                    "3.4",
                    "Blindaje de captura y aseguramiento de calidad de datos SIG",
                    "El personal registra novedades con constantes errores de digitación (nombres cortados, códigos inválidos, fechas incongruentes), arruinando búsquedas y reportes.",
                    "Blindar el formulario de captura con validaciones de lista, longitud, fecha y entero, configurar mensajes de alto restrictivos y corregir 8 registros corruptos.",
                    [
                        "Listas Desplegables: En Proceso y Estado, configurar validación por lista referenciando Listas_Maestras.",
                        "Longitud de Código: En Código, restringir la longitud del texto a exactamente 12 caracteres (ej. PM-01-PR-01).",
                        "Fechas y Versiones: Validar Fecha entre 01/01/2020 y 31/12/2026, y Versión número entero >= 1.",
                        "Mensajes y Alertas: Configurar Mensaje de Entrada orientativo y Mensaje de Error estilo 'Detener / Alto'.",
                        "Auditoría con Círculos: En Auditoria_Registros, activar 'Rodear con un círculo datos no válidos' y corregir los 8 registros corruptos."
                    ],
                    "El estilo de alerta debe ser 'Detener' (no Información ni Advertencia) para bloquear físicamente el guardado de datos inválidos."
                ),
                ("Listas_Maestras", ["Procesos Oficiales", "Estados Válidos", "Responsables Autorizados"],
                 [(p[1], e, r[1]) for p, e, r in zip(
                     PROCESOS,
                     ["Vigente", "Por vencer", "Vencido"] + [None] * (len(PROCESOS) - 3),
                     RESPONSABLES + [(None, None, None)] * (len(PROCESOS) - len(RESPONSABLES)),
                 )]),
                ("Formulario_Captura", ["Código (12 caracteres)", "Documento", "Proceso (Lista)", "Fecha Aprobación (2020-2026)", "Versión (Entero >=1)", "Estado (Lista)", "Responsable"], [
                    (None, None, None, None, None, None, None) for _ in range(8)
                ]),
                ("Auditoria_Registros", ["Código", "Documento", "Proceso", "Fecha Aprobación", "Versión", "Estado", "Responsable"], [
                    ("PM-01-PR-01", "Control de producción", "Produccion", "15/11/2024", 3, "Por vencer", "Andrés Brito"),
                    ("PE-02-MA-01", "Manual del SIG", "Gestión de la calidad", "01/03/2024", 4, "vijente", "Laura Pimienta"),
                    ("PA-02-FO-01", "Orden de compra", "  Compras", "05/05/2025", 5, "Vigente", "Camilo Iguarán"),
                    ("PM-02-PR-01", "Atención de PQRS", "Comercial", "08/08/2024", 3, "Por vencer", "Marelvis Ospino"),
                    ("PA-04-IN-01", "Trabajo en alturas", "SST", "20/10/2023", 2, "Vencido", "Daniela Epiayú"),
                    ("PM-03-PR-01", "Despacho y entrega", "Logística y distribución", "22/05/2024", 0, "vencido", "Kevin Fragozo"),
                    ("PA-01-PR-01", "Selección y contratación", "Talento Humano", "15/07/2024", 4, "Vencido", "Yesenia Uriana"),
                    ("PE-01-PO-01", "Política del SIG", "Direccionamiento estratégico", "10/02/2030", 3, "Vigente", "Rafael Mendoza"),
                    ("PE-01-PL-1", "Plan estratégico 2025-2028", "Direccionamiento estratégico", "15/01/2025", 1, "Por vencer", "Rafael Mendoza"),
                    ("PM-01-FO-01", "Registro de temperatura", "Producción", "01/09/2025", 5, "Vigente", "Andrés Brito"),
                ]),
            ],
        },
        "4.1": {
            "archivo": "4.1_Matriz_procesos",
            "nota": "Matriz de caracterización articulando procesos, líderes, cobertura documental y alertas en rojo.",
            "hojas": [
                hoja_enunciado(
                    "4.1",
                    "Matriz maestra de caracterización e interacción de procesos SIG",
                    "Para la auditoría de renovación ISO 9001, Bureau Veritas exige el Mapa de Interacción y Caracterización de Procesos con responsables, cobertura documental e indicadores.",
                    "Integrar en Matriz_Caracterizacion los 10 procesos corporativos desde 4 fuentes, calculando cobertura documental con CONTAR.SI y alertando procesos sin documentación.",
                    [
                        "Cruce de Responsable: Traer el Líder oficial desde Maestro_Responsables con BUSCARV o BUSCARX.",
                        "Cobertura Documental: Contar los documentos reales de cada proceso con =CONTAR.SI(Inventario_Documentos!$C$2:$C$50; Codigo_Proceso).",
                        "Indicador Asignado: Vincular el indicador principal desde Catalogo_Indicadores con BUSCARV.",
                        "Alerta Condicional: Configurar formato condicional con fórmula (=$E2=0) para resaltar en rojo cualquier proceso con 0 documentos (Gestión Ambiental)."
                    ],
                    "Articula las cuatro hojas sin romper las referencias relativas ni perder la sincronización al filtrar procesos."
                ),
                ("Matriz_Caracterizacion", ["Código", "Proceso", "Tipo de Proceso", "Responsable Líder", "Documentos Asociados (=CONTAR.SI)", "Indicador Principal", "Alerta Cobertura"],
                 [(c, n, t, None, None, None, None) for c, n, t, _ in PROCESOS]),
                hoja_procesos(),
                hoja_responsables(),
                ("Inventario_Documentos", ["Código", "Documento", "Código proceso"],
                 [(x["codigo"], x["nombre"], x["proceso"]) for x in d]),
                ("Catalogo_Indicadores", ["Indicador", "Código proceso"], [(i[0], i[2]) for i in INDICADORES]),
            ],
        },
        "4.2": {
            "archivo": "4.2_Matriz_riesgos",
            "nota": "Evaluación cuantitativa de riesgos (Probabilidad × Impacto), clasificación por severidad y semáforo de 4 colores.",
            "hojas": [
                hoja_enunciado(
                    "4.2",
                    "Matriz cuantitativa de evaluación y control de riesgos SIG",
                    "Lácteos del Caribe enfrenta riesgos operativos y de SST: amoníaco en cavas, contaminación en pasteurización, alturas y sanciones ambientales.",
                    "Construir la matriz cuantitativa de riesgos con cálculo de severidad (P×I), clasificación por escala de severidad, semaforización de 4 colores y control obligatorio.",
                    [
                        "Validación de Escalas: Restringir Probabilidad e Impacto a números enteros del 1 al 5.",
                        "Severidad Inherente: Formular Nivel de Riesgo = Probabilidad * Impacto (1 a 25).",
                        "Clasificación Automática: Clasificar con SI anidado o BUSCARV aproximado apoyado en Escala_Severidad: 1-4 Bajo, 5-9 Medio, 10-16 Alto, 17-25 Extremo.",
                        "Semaforización 4 Colores: Verde (Bajo), Amarillo (Medio), Naranja (Alto) y Rojo (Extremo).",
                        "Acción Inmediata: Si el riesgo es Alto o Extremo -> 'CONTROL PRIORITARIO REQUERIDO'; de lo contrario -> 'Monitoreo Periódico'."
                    ],
                    "Configura las 4 reglas condicionales ordenadamente para que los riesgos extremos (rojos) no queden ocultos por rangos menores."
                ),
                ("Escala_Severidad", ["Rango Mínimo", "Rango Máximo", "Nivel Cualitativo", "Color Asociado", "Acción de Control"], [
                    (1, 4, "Bajo", "Verde", "Monitoreo periódico"),
                    (5, 9, "Medio", "Amarillo", "Procedimiento estándar y seguimiento"),
                    (10, 16, "Alto", "Naranja", "Control preventivo inmediato y responsable"),
                    (17, 25, "Extremo", "Rojo", "Control prioritario urgente y plan de contingencia"),
                ]),
                ("Matriz_Riesgos", ["Código", "Descripción del Riesgo", "Proceso", "Probabilidad (1-5)", "Impacto (1-5)", "Nivel de Riesgo (=P*I)", "Clasificación Severidad", "Tipo de Control", "Responsable", "Acción Inmediata"],
                 [(c, desc, NOMBRE_PROCESO[p], prob, imp, None, None, ctrl, NOMBRE_RESPONSABLE[r], None)
                  for c, desc, p, prob, imp, ctrl, r in RIESGOS]),
            ],
        },
        "4.3": {
            "archivo": "4.3_Matriz_RACI",
            "nota": "Diseño de matriz RACI de gobernanza con validación de roles y fórmula de auditoría.",
            "hojas": [
                hoja_enunciado(
                    "4.3",
                    "Matriz RACI de gobernanza y auditoría de duplicidad de roles",
                    "En la planta ocurrieron incidentes de calidad porque nadie asumió la aprobación del retiro de lotes defectuosos debido a confusión en la asignación de roles.",
                    "Construir la matriz RACI para 8 actividades del SIG, aplicar validación por lista (R;A;C;I), formato condicional de 4 colores y programar fórmula de auditoría de gobernanza.",
                    [
                        "Restricción Matricial: Configurar validación de datos en cuadrícula (actividades vs roles) restringida a R; A; C; I.",
                        "Formato Condicional: 4 colores diferenciados: R (Azul), A (Púrpura / Nivel decisorio), C (Ámbar), I (Gris).",
                        "Regla de Gobernanza: Cada actividad debe tener EXACTAMENTE UN Aprobador ('A').",
                        "Fórmula de Auditoría: En Control Auditoría Gobernanza programar: =SI(CONTAR.SI(B2:G2;'A')=1; 'CONFORME'; SI(CONTAR.SI(B2:G2;'A')=0; 'ERROR: Falta Aprobador'; 'ERROR: Múltiples Aprobadores')).",
                        "Corrección: Resaltar en rojo los errores y corregir las letras para que todas las actividades queden en estado CONFORME."
                    ],
                    "La fórmula lógica horizontal debe contar la letra 'A' en cada fila y diagnosticar con precisión si falta o sobra autoridad aprobatoria."
                ),
                ("Leyenda_RACI", ["Letra", "Rol RACI", "Responsabilidad en el SIG"], [
                    ("R", "Responsable", "Ejecuta materialmente la actividad del SIG"),
                    ("A", "Aprobador", "Autoridad final que aprueba y responde ante auditoría (único por actividad)"),
                    ("C", "Consultado", "Experto técnico consultado antes de la toma de decisiones"),
                    ("I", "Informado", "Personal notificado de los resultados de la actividad"),
                ]),
                ("Matriz_RACI", ["Actividad"] + ROLES_RACI + ["Control Auditoría Gobernanza"], [
                    (ACTIVIDADES_RACI[0], "I", "A", "R", "C", "C", "I", None),
                    (ACTIVIDADES_RACI[1], "A", "A", "R", "I", "I", "I", None),  # doble A deliberada
                    (ACTIVIDADES_RACI[2], "I", "R", "C", "I", "I", "I", None),  # falta A deliberada
                    (ACTIVIDADES_RACI[3], "I", "A", "C", "R", "I", "I", None),
                    (ACTIVIDADES_RACI[4], "I", "A", "I", "R", "I", "I", None),
                    (ACTIVIDADES_RACI[5], "I", "A", "R", "C", "I", "I", None),
                    (ACTIVIDADES_RACI[6], "A", "R", "C", "I", "I", "I", None),
                    (ACTIVIDADES_RACI[7], "I", "A", "R", "I", "I", "I", None),
                ]),
            ],
        },
        "4.4": {
            "archivo": "4.4_Cuadro_de_mando",
            "nota": "Construcción de Cuadro de Mando Integral con tarjetas KPI, análisis de tendencias y gráfico comparativo.",
            "hojas": [
                hoja_enunciado(
                    "4.4",
                    "Cuadro de mando integral (Dashboard Ejecutivo SIG)",
                    "Al cierre del periodo, la Gerencia General y la Junta Directiva exigen un Dashboard de Control Gerencial de alto impacto visual para evaluar el SIG.",
                    "Diseñar el Cuadro de Mando Integral calculando % cumplimiento, tendencias dinámicas con símbolos tipográficos, 3 tarjetas KPI ejecutivas y gráfico comparativo.",
                    [
                        "% Cumplimiento T3: Dividir =T3 / Meta con formato porcentual.",
                        "Tendencia T3 vs T2: Evaluar con SI anidado: si T3 > T2 -> '▲ Favorable'; si T3 < T2 -> '▼ Desfavorable'; si T3 = T2 -> '― Estable'.",
                        "Semáforo Gerencial: Verde (>= 100%), Amarillo (90% a 99.9%), Rojo (< 90%).",
                        "Tarjetas KPI Ejecutivas: Diseñar en cabecera: a) % Promedio Cumplimiento SIG, b) Indicadores en Crisis (Rojos), c) Metas Cumplidas.",
                        "Gráfico Comparativo: Columnas agrupadas comparando serie Meta vs serie Resultado Real T3 con leyenda y etiquetas claras."
                    ],
                    "Integra cálculos matemáticos, caracteres tipográficos de tendencia (▲, ▼, ―) y un gráfico de doble serie con estética corporativa."
                ),
                ("Criterios_Semaforo", ["Rango Cumplimiento", "Color Semáforo", "Significado Gerencial"], [
                    ("≥ 100%", "Verde", "Meta superada o cumplida a cabalidad"),
                    ("90% a 99.9%", "Amarillo", "Desempeño cercano a la meta (en tolerancia)"),
                    ("< 90%", "Rojo", "Desempeño crítico (incumplimiento de meta)"),
                ]),
                ("Datos_Historicos", ["Código", "Indicador", "Proceso", "Meta (%)", "T1 (%)", "T2 (%)", "T3 (%)"],
                 [(f"IND-{idx:02d}", i[0], NOMBRE_PROCESO[i[2]], i[3], i[4], i[5], i[6]) for idx, i in enumerate(INDICADORES, 1)]),
                ("Dashboard_Gerencial", ["Indicador", "Proceso", "Meta (%)", "T1 (%)", "T2 (%)", "T3 (%)", "% Cumplimiento T3", "Tendencia T3 vs T2", "Semáforo Gerencial"],
                 [(i[0], NOMBRE_PROCESO[i[2]], i[3], i[4], i[5], i[6], None, None, None) for i in INDICADORES]),
            ],
        },
    }


# ---------------------------------------------------------------------------
# Evaluaciones por fase
# ---------------------------------------------------------------------------

# el texto del problema vive en el JSON que también lee la página: así el Excel y la web dicen lo mismo
EVALUACIONES = json.loads((RAIZ / "src" / "datos" / "evaluaciones.json").read_text(encoding="utf-8"))

# (código, tema, proceso, fecha, horas, asistentes, responsable) — dos sin responsable a propósito
CAPACITACIONES = [
    ("CAP-01", "Interpretación de la ISO 9001:2015", "Gestión de la calidad", "2026-08-05", 16, 25, "Laura Pimienta"),
    ("CAP-02", "Formación de auditores internos", "Gestión de la calidad", "2026-09-10", 24, 12, "Laura Pimienta"),
    ("CAP-03", "Buenas prácticas de manufactura", "Producción", "2026-10-15", 8, 40, "Andrés Brito"),
    ("CAP-04", "Trabajo seguro en alturas", "Seguridad y salud en el trabajo", "2026-11-03", 20, 15, "Daniela Epiayú"),
    ("CAP-05", "Manejo de residuos y reciclaje", "Gestión ambiental", "2026-11-12", 6, 35, ""),
    ("CAP-06", "Servicio al cliente y PQRS", "Comercial y ventas", "2026-09-24", 8, 18, "Marelvis Ospino"),
    ("CAP-07", "Plan de emergencias y evacuación", "Seguridad y salud en el trabajo", "2026-11-20", 4, 60, "Daniela Epiayú"),
    ("CAP-08", "Control de documentos del SIG", "Gestión de la calidad", "2026-10-28", 6, 20, "Laura Pimienta"),
    ("CAP-09", "Mantenimiento autónomo de equipos", "Mantenimiento", "2026-12-02", 12, 10, ""),
    ("CAP-10", "Conducción preventiva", "Logística y distribución", "2026-11-25", 10, 14, "Kevin Fragozo"),
    ("CAP-11", "Evaluación de proveedores", "Compras", "2026-12-09", 4, 6, "Camilo Iguarán"),
    ("CAP-12", "Liderazgo para el SIG", "Direccionamiento estratégico", "2026-12-15", 16, 30, "Rafael Mendoza"),
]

# (id, detectado, proceso, tipo, descripción, responsable, compromiso, cierre)
# H-05 trae un responsable que no existe (R09) para el SI.ERROR, y H-03 se cerró aunque su compromiso ya pasó
HALLAZGOS = [
    ("H-01", "2026-07-14", "PM-01", "No conformidad mayor", "Registros de temperatura incompletos en pasteurización", "R02", "2026-09-30", None),
    ("H-02", "2026-07-14", "PE-02", "No conformidad menor", "Listado maestro de documentos desactualizado", "R01", "2026-08-31", "2026-08-25"),
    ("H-03", "2026-07-15", "PA-04", "No conformidad mayor", "Trabajos en alturas sin permiso firmado", "R07", "2026-08-15", "2026-08-10"),
    ("H-04", "2026-07-15", "PM-02", "Observación", "PQRS respondidas fuera de término", "R03", "2026-11-30", None),
    ("H-05", "2026-07-16", "PA-03", "No conformidad menor", "Equipos sin hoja de vida actualizada", "R09", "2026-10-31", None),
    ("H-06", "2026-07-16", "PA-02", "No conformidad menor", "Proveedores críticos sin reevaluación", "R06", "2026-10-10", None),
    ("H-07", "2026-07-17", "PM-03", "Observación", "Listas de chequeo de vehículos sin firma", "R04", "2026-11-15", None),
    ("H-08", "2026-07-17", "PA-01", "No conformidad menor", "Inducciones sin registro de asistencia", "R05", "2026-11-05", None),
    ("H-09", "2026-07-18", "PE-01", "Observación", "Revisión por la dirección sin análisis de riesgos", "R08", "2026-12-15", None),
    ("H-10", "2026-07-18", "PM-01", "No conformidad mayor", "Producto no conforme sin tratamiento documentado", "R02", "2026-10-30", None),
    ("H-11", "2026-07-21", "PA-05", "No conformidad mayor", "Vertimientos sin permiso vigente", "R01", "2026-09-15", None),
    ("H-12", "2026-07-21", "PA-04", "Observación", "Extintores con inspección vencida", "R07", "2026-08-30", "2026-09-05"),
    ("H-13", "2026-07-22", "PE-02", "No conformidad menor", "Acciones correctivas sin análisis de causa", "R01", "2026-10-20", None),
    ("H-14", "2026-07-22", "PM-02", "No conformidad menor", "Encuesta de satisfacción con muestra insuficiente", "R03", "2026-11-28", None),
    ("H-15", "2026-07-23", "PA-01", "Observación", "Perfiles de cargo desactualizados", "R05", "2026-10-25", None),
]

SEDES = ["Riohacha", "Maicao", "Valledupar", "Santa Marta"]
# Barranquilla está en las listas pero sin inspecciones, para que PROMEDIO.SI reviente y toque el SI.ERROR
SEDES_LISTA = SEDES + ["Barranquilla"]
PROCESOS_INSPECCION = ["Producción", "Logística y distribución", "Seguridad y salud en el trabajo", "Mantenimiento"]
TIPOS_INSPECCION = ["Inocuidad", "Seguridad", "Ambiental"]
MESES = [("Julio", 7), ("Agosto", 8), ("Septiembre", 9)]
# qué tan juiciosa es cada sede, para que el semáforo no salga todo del mismo color
CUMPLIMIENTO_BASE = {"Riohacha": 0.91, "Maicao": 0.76, "Valledupar": 0.86, "Santa Marta": 0.82}
INSPECTORES = ["Laura Pimienta", "Daniela Epiayú", "Andrés Brito"]

# (código, riesgo, proceso, probabilidad, impacto)
RIESGOS_FONSECA = [
    ("RP-01", "Retraso en el permiso ambiental de vertimientos", "Gestión ambiental", 4, 5),
    ("RP-02", "Cortes de energía en la zona", "Producción", 4, 4),
    ("RP-03", "Falta de mano de obra calificada en quesería", "Talento humano", 3, 3),
    ("RP-04", "Leche cruda con calidad variable de proveedores locales", "Compras", 4, 3),
    ("RP-05", "Accidentes durante el montaje de equipos", "Seguridad y salud en el trabajo", 3, 5),
    ("RP-06", "Vías en mal estado para la distribución", "Logística y distribución", 3, 2),
    ("RP-07", "Sobrecosto en la obra civil", "Direccionamiento estratégico", 2, 4),
    ("RP-08", "Inundación por temporada de lluvias", "Producción", 2, 5),
    ("RP-09", "Documentación del SIG incompleta al arrancar", "Gestión de la calidad", 5, 4),
    ("RP-10", "Robo de herramientas en la obra", "Logística y distribución", 2, 2),
    ("RP-11", "Ruido que moleste a la comunidad vecina", "Gestión ambiental", 1, 3),
]

ESCALA_SEVERIDAD = [
    (1, 4, "Bajo", "Verde", "Monitoreo periódico"),
    (5, 9, "Medio", "Amarillo", "Procedimiento estándar y seguimiento"),
    (10, 16, "Alto", "Naranja", "Control preventivo inmediato y responsable"),
    (17, 25, "Extremo", "Rojo", "Control prioritario urgente y plan de contingencia"),
]

ROLES_FONSECA = ["Gerente general", "Coordinadora SIG", "Líder de producción", "Contratista de obra", "Profesional SST"]
# tres errores a propósito: dos A en la licencia, ninguna A en la inspección y una X en proveedores
RACI_FONSECA = [
    ("Aprobar el presupuesto del proyecto", "A", "R", "C", "I", "I"),
    ("Tramitar el permiso ambiental", "A", "A", "I", None, "C"),
    ("Elaborar el plan de montaje", "I", "C", "A", "R", "C"),
    ("Documentar los procedimientos de la planta", "I", "A", "R", None, "C"),
    ("Inspeccionar la seguridad en la obra", "I", "I", "C", "R", "R"),
    ("Seleccionar proveedores de leche", "A", "R", "C", None, "X"),
    ("Capacitar al personal nuevo", "I", "A", "R", None, "R"),
    ("Medir los indicadores del proyecto", "C", "A", "R", "I", "R"),
]

# (código, indicador, proceso, meta, T1, T2, T3)
INDICADORES_FONSECA = [
    ("IP-01", "Avance de la obra civil (%)", "Direccionamiento estratégico", 100, 30, 62, 95),
    ("IP-02", "Equipos instalados (%)", "Producción", 100, 20, 55, 80),
    ("IP-03", "Personal contratado con inducción (%)", "Talento humano", 90, 40, 70, 92),
    ("IP-04", "Documentos del SIG aprobados (%)", "Gestión de la calidad", 95, 35, 60, 58),
    ("IP-05", "Proveedores de leche evaluados (%)", "Compras", 100, 50, 85, 100),
    ("IP-06", "Días sin accidentes en la obra (%)", "Seguridad y salud en el trabajo", 100, 100, 96, 96),
]


def hoja_enunciado_evaluacion(evaluacion):
    requerimientos = [f"{r['titulo']} ({r['puntos']} puntos): {r['detalle']}" for r in evaluacion["requerimientos"]]
    nombre, encabezados, filas = hoja_enunciado(
        evaluacion["codigo"], evaluacion["titulo"], evaluacion["situacion"],
        evaluacion["mision"], requerimientos, evaluacion["reglaTecnica"],
    )
    return nombre, encabezados, filas + [("Entrega", f"Guarda el libro como {evaluacion['entrega']} y súbelo al Drive.")]


def inspecciones():
    filas = []
    for i in range(30):
        mes, numero_mes = MESES[i // 10]
        sede = SEDES[i % 4]
        evaluados = 20 + (i * 7) % 15
        # un vaivén de -4 a +4 puntos para que no todas las de la misma sede saquen igual
        tasa = CUMPLIMIENTO_BASE[sede] + ((i * 13) % 9 - 4) / 100
        cumplidos = min(evaluados, round(evaluados * tasa))
        filas.append((
            f"INS-{i + 1:02d}", date(2026, numero_mes, 3 + (i % 10) * 2), mes, sede,
            PROCESOS_INSPECCION[(i // 4 + i) % 4], TIPOS_INSPECCION[i % 3],
            evaluados, cumplidos, None, INSPECTORES[i % 3],
        ))
    return filas


def columnas_parejas(*listas):
    # varias listas de distinto largo lado a lado, rellenando con vacío
    largo = max(len(lista) for lista in listas)
    return [tuple(lista[i] if i < len(lista) else None for lista in listas) for i in range(largo)]


def evaluaciones():
    ev = EVALUACIONES
    return {
        "EV1": {
            "archivo": ev["1"]["archivo"],
            "nota": "Problema de la Fase 1: presupuesto del plan de capacitación con formatos, referencias absolutas, resumen y formato condicional.",
            "hojas": [
                hoja_enunciado_evaluacion(ev["1"]),
                ("Plan_Capacitacion", ["Parámetro", "Valor"] + [""] * 8,
                 [
                     ("Valor hora del instructor ($)", 45000) + tuple(vacio(8)),
                     ("Refrigerio por asistente ($)", 8500) + tuple(vacio(8)),
                     tuple(vacio(10)),
                     ("Código", "Tema", "Proceso", "Fecha programada", "Horas", "Asistentes", "Responsable",
                      "Costo instructor ($)", "Costo refrigerios ($)", "Costo total ($)"),
                 ] + [
                     (c, t, p, date.fromisoformat(f), h, a, r, None, None, None)
                     for c, t, p, f, h, a, r in CAPACITACIONES
                 ] + [
                     tuple(vacio(10)),
                     ("Total de horas", None) + tuple(vacio(8)),
                     ("Total de asistentes", None) + tuple(vacio(8)),
                     ("Costo total del plan ($)", None) + tuple(vacio(8)),
                     ("Costo promedio por capacitación ($)", None) + tuple(vacio(8)),
                     ("Cantidad de capacitaciones", None) + tuple(vacio(8)),
                 ]),
            ],
        },
        "EV2": {
            "archivo": ev["2"]["archivo"],
            "nota": "Problema de la Fase 2: seguimiento a hallazgos de auditoría con BUSCARV, SI anidado, tablas, filtros y gráfico.",
            "hojas": [
                hoja_enunciado_evaluacion(ev["2"]),
                ("Parametros", ["Parámetro", "Valor"],
                 [("Fecha de corte", FECHA_CORTE), ("Días para considerar 'Por vencer'", 15)]),
                ("Hallazgos",
                 ["ID", "Fecha de detección", "Código proceso", "Tipo", "Descripción", "ID responsable",
                  "Fecha de compromiso", "Fecha de cierre", "Proceso", "Responsable", "Estado", "Prioridad"],
                 [(i, date.fromisoformat(det), p, t, desc, r, date.fromisoformat(comp),
                   date.fromisoformat(cierre) if cierre else None, None, None, None, None)
                  for i, det, p, t, desc, r, comp, cierre in HALLAZGOS]),
                hoja_procesos(),
                hoja_responsables(),
                ("Resumen", ["Estado", "Cantidad"],
                 [("Cerrado", None), ("Vencido", None), ("Por vencer", None), ("En término", None), ("Total", None)]),
            ],
        },
        "EV3": {
            "archivo": ev["3"]["archivo"],
            "nota": "Problema de la Fase 3: diagnóstico de inspecciones con tabla dinámica, funciones condicionales, semáforo y validación de datos.",
            "hojas": [
                hoja_enunciado_evaluacion(ev["3"]),
                ("Inspecciones", ["ID", "Fecha", "Mes", "Sede", "Proceso", "Tipo de inspección",
                                  "Ítems evaluados", "Ítems cumplidos", "% Cumplimiento", "Inspector"],
                 inspecciones()),
                ("Resumen_Sedes", ["Sede", "Inspecciones", "Promedio de cumplimiento", "Inspecciones < 80%",
                                   "Meta", "Brecha", "Estado"],
                 [(s, None, None, None, 0.85, None, None) for s in SEDES_LISTA]),
                ("Listas", ["Sedes", "Procesos", "Tipos"],
                 columnas_parejas(SEDES_LISTA, PROCESOS_INSPECCION, TIPOS_INSPECCION)),
                # cinco errores de digitación esperando a que la validación los encierre en un círculo
                ("Registro_Nuevo", ["ID", "Fecha", "Mes", "Sede", "Proceso", "Tipo de inspección",
                                    "Ítems evaluados", "Ítems cumplidos", "Inspector"],
                 [
                     ("INS-31", date(2026, 10, 2), "Octubre", "Rioacha", "Producción", "Inocuidad", 25, 22, "Laura Pimienta"),
                     ("INS-32", date(2026, 10, 5), "Octubre", "Maicao", "Mantenimiento", "Seguridad", 25, 28, "Andrés Brito"),
                     ("INS-33", date(2026, 10, 7), "Octubre", "Valledupar", "Produccion", "Ambiental", 30, 27, "Daniela Epiayú"),
                     ("INS-34", date(2026, 10, 9), "Octubre", "Santa Marta", "Logística y distribución", "Seguridad industrial", 22, 18, "Laura Pimienta"),
                     ("INS-35", date(2026, 10, 14), "Octubre", "Riohacha", "Seguridad y salud en el trabajo", "Seguridad", 20, 19.5, "Daniela Epiayú"),
                     ("INS-36", date(2026, 10, 16), "Octubre", "Barranquilla", "Producción", "Inocuidad", 24, 21, "Andrés Brito"),
                 ]),
            ],
        },
        "EV4": {
            "archivo": ev["4"]["archivo"],
            "nota": "Problema de la Fase 4: matriz de riesgos, RACI con control y cuadro de mando de la nueva planta de Fonseca.",
            "hojas": [
                hoja_enunciado_evaluacion(ev["4"]),
                ("Escala_Severidad", ["Rango Mínimo", "Rango Máximo", "Nivel Cualitativo", "Color Asociado", "Acción de Control"],
                 ESCALA_SEVERIDAD),
                ("Riesgos_Proyecto", ["Código", "Riesgo", "Proceso", "Probabilidad (1-5)", "Impacto (1-5)",
                                      "Nivel", "Clasificación", "Acción de control"],
                 [r + (None, None, None) for r in RIESGOS_FONSECA]),
                ("Resumen_Riesgos", ["Nivel", "Cantidad"], [(nivel, None) for _, _, nivel, _, _ in ESCALA_SEVERIDAD]),
                ("Leyenda_RACI", ["Letra", "Rol RACI", "Qué significa"],
                 [
                     ("R", "Responsable", "Ejecuta la actividad"),
                     ("A", "Aprobador", "Aprueba y responde por el resultado (solo uno por actividad)"),
                     ("C", "Consultado", "Se le pide opinión antes de decidir"),
                     ("I", "Informado", "Se le avisa del resultado"),
                 ]),
                ("Matriz_RACI", ["Actividad"] + ROLES_FONSECA + ["Control"], [fila + (None,) for fila in RACI_FONSECA]),
                ("Criterios_Semaforo", ["Rango Cumplimiento", "Color Semáforo", "Significado Gerencial"],
                 [
                     ("≥ 100%", "Verde", "Meta superada o cumplida a cabalidad"),
                     ("90% a 99.9%", "Amarillo", "Desempeño cercano a la meta (en tolerancia)"),
                     ("< 90%", "Rojo", "Desempeño crítico (incumplimiento de meta)"),
                 ]),
                ("Indicadores_Proyecto", ["Código", "Indicador", "Proceso", "Meta", "T1", "T2", "T3",
                                          "% Cumplimiento", "Tendencia", "Semáforo"],
                 [i + (None, None, None) for i in INDICADORES_FONSECA]),
                ("Cuadro_Mando", ["Dato", "Valor"],
                 [("Promedio general de cumplimiento", None), ("Indicadores en verde", None), ("Indicadores en rojo", None)]),
                ("Conclusiones", ["N°", "Decisión para la gerencia", "Dato que la respalda"],
                 [(n, None, None) for n in (1, 2, 3)]),
            ],
        },
    }


def main():
    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)
    for viejo in CARPETA_SALIDA.glob("*"):
        if viejo.suffix in {".xlsx", ".csv"}:
            viejo.unlink()

    indice = {}
    for codigo, actividad in {**actividades(), **evaluaciones()}.items():
        nombre_xlsx = f"{actividad['archivo']}.xlsx"
        escribir_xlsx(CARPETA_SALIDA / nombre_xlsx, actividad["hojas"])

        csvs = []
        for nombre_hoja, encabezados, filas in actividad["hojas"]:
            nombre_csv = f"{codigo}_{nombre_hoja}.csv"
            escribir_csv(CARPETA_SALIDA / nombre_csv, encabezados, filas)
            csvs.append({"hoja": nombre_hoja, "archivo": nombre_csv})

        indice[codigo] = {"xlsx": nombre_xlsx, "csv": csvs, "nota": actividad["nota"]}

    INDICE.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Listo: {len(indice)} actividades y evaluaciones, archivos en {CARPETA_SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
