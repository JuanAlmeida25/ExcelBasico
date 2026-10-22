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


def actividades():
    d = DOCUMENTOS

    return {
        "1.1": {
            "archivo": "1.1_Explorando_entorno",
            "nota": "Usa la hoja Datos para responder los retos de la hoja Retos.",
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
            "nota": "Estos son los datos fuente: con ellos arma tu propio Registro_SIG.xlsx.",
            "hojas": [
                hoja_procesos(con_responsable_id=False),
                ("Documentos", ["Código", "Documento", "Código proceso", "Fecha de aprobación", "Versión"],
                 [(x["codigo"], x["nombre"], x["proceso"], x["aprobado"], x["version"]) for x in d]),
                hoja_responsables(),
            ],
        },
        "1.3": {
            "archivo": "1.3_Formatos_condicionales",
            "nota": "Las fechas y números vienen sin formato. El proceso Mantenimiento no tiene responsable: resáltalo.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Versión", "Fecha de aprobación", "Fecha de vencimiento"],
                 [(x["codigo"], x["nombre"], x["version"], x["aprobado"], x["vence"]) for x in d]),
                ("Procesos", ["Código", "Proceso", "Tipo", "Responsable"],
                 [(c, n, t, NOMBRE_RESPONSABLE.get(r, "")) for c, n, t, r in PROCESOS]),
            ],
        },
        "1.4": {
            "archivo": "1.4_Formulas_basicas",
            "nota": "El costo = Horas × Valor hora. Fija el valor hora con referencia absoluta ($B$2).",
            "hojas": [
                ("Horas_Documentacion", ["Código", "Documento", "Proceso", "Horas de elaboración", "Costo"],
                 [(x["codigo"], x["nombre"], NOMBRE_PROCESO[x["proceso"]], 4 + (x["dias_revision"] % 7) * 2, None)
                  for x in d[:15]]),
                ("Parametros", ["Parámetro", "Valor"], [("Valor hora de elaboración", 28500)]),
                ("Resumen", ["Medida", "Resultado"], [
                    ("Total de horas", None),
                    ("Promedio de horas por documento", None),
                    ("Cantidad de documentos", None),
                    ("Costo total", None),
                ]),
            ],
        },
        "2.1": {
            "archivo": "2.1_Funcion_SI",
            "nota": f"Usa la fecha de corte {FECHA_CORTE:%d/%m/%Y} de la hoja Parametros, no HOY(), para que a todos les dé igual.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Código proceso", "Fecha de vencimiento", "Días para vencer", "Estado"],
                 [(x["codigo"], x["nombre"], x["proceso"], x["vence"], None, None) for x in d]),
                hoja_parametros_estado(),
            ],
        },
        "2.2": {
            "archivo": "2.2_BUSCARV_consolidado",
            "nota": "Completa la hoja Consolidado trayendo el proceso y el responsable con BUSCARV o BUSCARX.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Código proceso"],
                 [(x["codigo"], x["nombre"], x["proceso"]) for x in d]),
                hoja_procesos(),
                hoja_responsables(),
                ("Consolidado", ["Código documento", "Documento", "Proceso", "Responsable"],
                 [(x["codigo"], x["nombre"], None, None) for x in d]),
            ],
        },
        "2.3": {
            "archivo": "2.3_Tablas_y_filtros",
            "nota": "Selecciona los datos, convierte en tabla con Ctrl+T y filtra por proceso, estado y fecha.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Tipo", "Proceso", "Versión", "Fecha de aprobación", "Fecha de vencimiento", "Estado"],
                 [(x["codigo"], x["nombre"], x["tipo"], NOMBRE_PROCESO[x["proceso"]], x["version"], x["aprobado"], x["vence"], x["estado"])
                  for x in d]),
            ],
        },
        "2.4": {
            "archivo": "2.4_Graficos",
            "nota": "Llena la hoja Resumen con CONTAR.SI y desde ahí saca los dos gráficos.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Proceso", "Estado"],
                 [(x["codigo"], x["nombre"], NOMBRE_PROCESO[x["proceso"]], x["estado"]) for x in d]),
                ("Resumen", ["Proceso", "Cantidad de documentos", "", "Estado", "Cantidad"],
                 [(n, None, None, e, None) for n, e in zip(
                     [p[1] for p in PROCESOS],
                     ["Vigente", "Por vencer", "Vencido"] + [None] * (len(PROCESOS) - 3),
                 )]),
            ],
        },
        "3.1": {
            "archivo": "3.1_Tabla_dinamica",
            "nota": "Proceso en filas, Estado en columnas, cuenta de Código en valores. Agrega segmentaciones por Tipo de proceso.",
            "hojas": [
                ("Documentos", ["Código", "Documento", "Tipo de documento", "Proceso", "Tipo de proceso", "Responsable",
                                "Fecha de vencimiento", "Estado"],
                 [(x["codigo"], x["nombre"], x["tipo"], NOMBRE_PROCESO[x["proceso"]], TIPO_PROCESO[x["proceso"]],
                   NOMBRE_RESPONSABLE.get(RESPONSABLE_PROCESO[x["proceso"]], "Sin asignar"), x["vence"], x["estado"])
                  for x in d]),
            ],
        },
        "3.2": {
            "archivo": "3.2_Conteo_condicional",
            "nota": "Ojo: Gestión ambiental no tiene documentos. Usa SI.ERROR para que el % no te dé #¡DIV/0!.",
            "hojas": [
                ("Documentos", ["Código", "Proceso", "Estado", "Días de revisión"],
                 [(x["codigo"], NOMBRE_PROCESO[x["proceso"]], x["estado"], x["dias_revision"]) for x in d]),
                ("Indicadores_Proceso", ["Proceso", "Total documentos", "Vigentes", "% Vigentes", "Promedio días de revisión"],
                 [(p[1], *vacio(4)) for p in PROCESOS]),
            ],
        },
        "3.3": {
            "archivo": "3.3_Matriz_indicadores",
            "nota": "El semáforo: verde si Resultado ≥ Meta, amarillo si está a 10 puntos o menos, rojo si está más abajo.",
            "hojas": [
                ("Indicadores", ["Indicador", "Fórmula", "Meta (%)", "Resultado (%)", "Semáforo"],
                 [(i[0], i[1], i[3], i[6], None) for i in INDICADORES]),
                ("Reglas_Semaforo", ["Color", "Condición"], [
                    ("Verde", "Resultado ≥ Meta"),
                    ("Amarillo", "Meta - 10 ≤ Resultado < Meta"),
                    ("Rojo", "Resultado < Meta - 10"),
                ]),
            ],
        },
        "3.4": {
            "archivo": "3.4_Validacion_datos",
            "nota": "La hoja Registro trae errores de digitación a propósito. Crea las listas desplegables con la hoja Listas y corrígelos.",
            "hojas": [
                ("Listas", ["Procesos", "Estados", "Responsables"],
                 [(p[1], e, r[1]) for p, e, r in zip(
                     PROCESOS,
                     ["Vigente", "Por vencer", "Vencido"] + [None] * (len(PROCESOS) - 3),
                     RESPONSABLES + [(None, None, None)] * (len(PROCESOS) - len(RESPONSABLES)),
                 )]),
                ("Registro", ["Código", "Documento", "Proceso", "Estado", "Responsable"], [
                    ("PM-01-PR-01", "Control de producción", "Produccion", "Por vencer", "Andrés Brito"),
                    ("PE-02-MA-01", "Manual del SIG", "Gestión de la calidad", "vijente", "Laura Pimienta"),
                    ("PA-02-FO-01", "Orden de compra", "  Compras", "Vigente", "Camilo Iguaran"),
                    ("PM-02-PR-01", "Atención de PQRS", "Comercial", "Por vencer", "Marelvis Ospino"),
                    ("PA-04-IN-01", "Trabajo en alturas", "SST", "Vencido", "Daniela E."),
                    ("PM-03-PR-01", "Despacho y entrega", "Logística y distribución", "vencido", "Kevin Fragoso"),
                    ("PA-01-PR-01", "Selección y contratación", "Talento Humano", "Vencido", "Yesenia Uriana"),
                    ("PE-01-PO-01", "Política del SIG", "Direccionamiento estratégico", "Vigente", "Rafael Mendoza"),
                    (None, None, None, None, None),
                    (None, None, None, None, None),
                ]),
            ],
        },
        "4.1": {
            "archivo": "4.1_Matriz_procesos",
            "nota": "Completa la matriz con las otras hojas. Gestión ambiental no tiene documentos: que se note en rojo.",
            "hojas": [
                ("Matriz_Procesos", ["Código", "Proceso", "Tipo", "Responsable", "Documentos asociados", "Indicador"],
                 [(c, n, *vacio(4)) for c, n, _, _ in PROCESOS]),
                hoja_procesos(),
                hoja_responsables(),
                ("Documentos", ["Código", "Documento", "Código proceso"],
                 [(x["codigo"], x["nombre"], x["proceso"]) for x in d]),
                ("Indicadores", ["Indicador", "Código proceso"], [(i[0], i[2]) for i in INDICADORES]),
            ],
        },
        "4.2": {
            "archivo": "4.2_Matriz_riesgos",
            "nota": "Nivel de riesgo = Probabilidad × Impacto. Clasifícalo con la hoja Escala y colorea con formato condicional.",
            "hojas": [
                ("Riesgos", ["Código", "Descripción", "Proceso", "Probabilidad (1-5)", "Impacto (1-5)",
                             "Nivel de riesgo", "Nivel", "Control", "Responsable"],
                 [(c, desc, NOMBRE_PROCESO[p], prob, imp, None, None, ctrl, NOMBRE_RESPONSABLE[r])
                  for c, desc, p, prob, imp, ctrl, r in RIESGOS]),
                ("Escala", ["Desde", "Hasta", "Nivel", "Color"], [
                    (1, 4, "Bajo", "Verde"),
                    (5, 9, "Medio", "Amarillo"),
                    (10, 16, "Alto", "Naranja"),
                    (17, 25, "Extremo", "Rojo"),
                ]),
            ],
        },
        "4.3": {
            "archivo": "4.3_Matriz_RACI",
            "nota": "La primera fila va de ejemplo. Cada actividad debe tener exactamente una A (Aprobador).",
            "hojas": [
                ("RACI", ["Actividad"] + ROLES_RACI,
                 [(ACTIVIDADES_RACI[0], "I", "A", "R", None, None, "C")]
                 + [(actividad, *vacio(len(ROLES_RACI))) for actividad in ACTIVIDADES_RACI[1:]]),
                ("Leyenda", ["Letra", "Significado", "Qué hace"], [
                    ("R", "Responsable", "Ejecuta la actividad"),
                    ("A", "Aprobador", "Da el visto bueno final y responde por el resultado"),
                    ("C", "Consultado", "Aporta su opinión antes de hacerla"),
                    ("I", "Informado", "Se le avisa cuando está lista"),
                ]),
            ],
        },
        "4.4": {
            "archivo": "4.4_Cuadro_de_mando",
            "nota": "% Cumplimiento = T3 / Meta. La tendencia compara T3 contra T2 (▲ sube, ▼ baja).",
            "hojas": [
                ("Indicadores", ["Indicador", "Proceso", "Meta (%)", "T1 (%)", "T2 (%)", "T3 (%)",
                                 "% Cumplimiento", "Semáforo", "Tendencia"],
                 [(i[0], NOMBRE_PROCESO[i[2]], i[3], i[4], i[5], i[6], *vacio(3)) for i in INDICADORES]),
                ("Reglas_Semaforo", ["Color", "Condición"], [
                    ("Verde", "% Cumplimiento ≥ 100%"),
                    ("Amarillo", "90% ≤ % Cumplimiento < 100%"),
                    ("Rojo", "% Cumplimiento < 90%"),
                ]),
            ],
        },
    }


def main():
    CARPETA_SALIDA.mkdir(parents=True, exist_ok=True)
    for viejo in CARPETA_SALIDA.glob("*"):
        if viejo.suffix in {".xlsx", ".csv"}:
            viejo.unlink()

    indice = {}
    for codigo, actividad in actividades().items():
        nombre_xlsx = f"{actividad['archivo']}.xlsx"
        escribir_xlsx(CARPETA_SALIDA / nombre_xlsx, actividad["hojas"])

        csvs = []
        for nombre_hoja, encabezados, filas in actividad["hojas"]:
            nombre_csv = f"{codigo}_{nombre_hoja}.csv"
            escribir_csv(CARPETA_SALIDA / nombre_csv, encabezados, filas)
            csvs.append({"hoja": nombre_hoja, "archivo": nombre_csv})

        indice[codigo] = {"xlsx": nombre_xlsx, "csv": csvs, "nota": actividad["nota"]}

    INDICE.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Listo: {len(indice)} actividades, archivos en {CARPETA_SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
