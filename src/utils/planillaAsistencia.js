// Arma la planilla de asistencia con el mismo formato del SENA (Libro1.xlsx) y la manda a imprimir.
// En el cuadro de imprimir se escoge "Guardar como PDF". Sin librerías: es HTML con estilos de impresión.

const FILAS_POR_HOJA = 20 // las mismas del formato
const FIRMA_VALIDA = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/

const esc = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const fechaCorta = (texto) => texto.split('-').reverse().join('/')

// Los nombres de la planilla van en mayúscula, como se llenan a mano en el SENA
const mayuscula = (texto) => String(texto ?? '').toLocaleUpperCase('es-CO')

function paginasDeUnaHoja(hoja, { encabezado, aprendices, asistencia, firmas }, logo) {
  const anio = hoja.desde.slice(0, 4)
  const grupos = []
  for (let i = 0; i < Math.max(aprendices.length, 1); i += FILAS_POR_HOJA) grupos.push(aprendices.slice(i, i + FILAS_POR_HOJA))

  return grupos.map((grupo) => {
    const filas = Array.from({ length: FILAS_POR_HOJA }, (_, i) => {
      const a = grupo[i]
      if (!a) return `<tr class="fila"><td></td><td></td><td></td>${hoja.dias.map(() => '<td></td>').join('')}</tr>`
      const firma = FIRMA_VALIDA.test(firmas[a.documento] || '') ? firmas[a.documento] : null
      const celdas = hoja.dias
        .map((d) => {
          const vino = (asistencia[d.fecha] || []).includes(a.documento)
          return `<td class="firma">${vino && firma ? `<img src="${firma}" alt="">` : ''}</td>`
        })
        .join('')
      return `<tr class="fila"><td class="centro">${esc(a.tipoDocumento)}</td><td class="centro">${esc(a.documento)}</td><td class="nombre">${esc(mayuscula(a.nombre))}</td>${celdas}</tr>`
    }).join('')

    return `<section class="pagina">
  <table class="cabeza">
    <colgroup><col style="width:60%"><col style="width:22%"><col style="width:18%"></colgroup>
    <tr>
      <td></td>
      <td class="logo"><img src="${esc(logo)}" alt="SENA"></td>
      <td class="version"><div>Versión: 01</div><div class="siga">Documento<br>No controlado por el SIGA</div></td>
    </tr>
  </table>
  <div class="barra">Proceso Gestión de Formación Profesional Integral</div>
  <div class="barra">Formato Asistencia a la Formacion Profesional Integral</div>
  <table class="datos">
    <colgroup>
      <col style="width:15%"><col style="width:4%"><col style="width:7%"><col style="width:9%"><col style="width:12%">
      <col style="width:6%"><col style="width:11%"><col style="width:26%"><col style="width:4%"><col style="width:6%">
    </colgroup>
    <tr>
      <th>Código de la Regional</th><td class="derecha">44</td><th>Regional</th><td>GUAJIRA</td>
      <th>Código del Centro</th><td>${esc(encabezado.codigoCentro)}</td>
      <th>Centro de Formación</th><td>CENTRO AGROEMPRESARIAL Y ACUICOLA</td>
      <th>Año</th><td>${esc(anio)}</td>
    </tr>
  </table>
  <table class="datos">
    <colgroup><col style="width:15%"><col style="width:11%"><col style="width:16%"><col style="width:40%"><col style="width:8%"><col style="width:10%"></colgroup>
    <tr>
      <th>FICHA</th><td>${esc(encabezado.ficha)}</td>
      <th>Programa de Formación</th><td>${esc(mayuscula(encabezado.programa))}</td>
      <th>Municipio</th><td>FONSECA</td>
    </tr>
  </table>
  <table class="lista">
    <colgroup><col style="width:5%"><col style="width:10%"><col style="width:25%">${hoja.dias.map(() => '<col style="width:6%">').join('')}</colgroup>
    <thead>
      <tr>
        <th rowspan="3">Tipo Doc</th><th rowspan="3">Documento de Identidad</th><th rowspan="3">Nombres y Apellidos</th>
        <th colspan="10">Firma de los aprendices participantes</th>
      </tr>
      <tr><th colspan="5" class="izquierda">Del: ${fechaCorta(hoja.desde)}</th><th colspan="5" class="izquierda">Hasta: ${fechaCorta(hoja.hasta)}</th></tr>
      <tr>${hoja.dias.map((d) => `<th class="dia">${d.nombre}<small>${fechaCorta(d.fecha).slice(0, 5)}</small></th>`).join('')}</tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>
</section>`
  })
}

export function htmlPlanilla(hojas, datos, logo) {
  const paginas = hojas.flatMap((hoja) => paginasDeUnaHoja(hoja, datos, logo))
  const titulo = `Asistencia ficha ${datos.encabezado.ficha || ''} ${fechaCorta(hojas[0].desde)} a ${fechaCorta(hojas.at(-1).hasta)}`
  // CSP de la planilla: aunque algún día se cuele un dato sin escapar, aquí no corre ni un script.
  // Esta planilla vive en un iframe del mismo origen, donde está la sesión del admin
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: 'self'; style-src 'unsafe-inline'"><title>${esc(titulo.replace(/\//g, '-'))}</title>
<style>
@page { size: letter landscape; margin: 7mm; }
* { box-sizing: border-box; }
html, body { margin: 0; background: white; color: black; font-family: Cambria, "Times New Roman", serif; font-size: 8.5pt; }
.pagina { break-after: page; }
.pagina:last-child { break-after: auto; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.cabeza td { height: 17mm; vertical-align: middle; }
.logo { text-align: center; }
.logo img { height: 15mm; }
.version { text-align: center; font-size: 8pt; }
.siga { margin-top: 3mm; }
.barra { background: #595959; color: white; font-weight: bold; text-align: center; font-size: 10.5pt; padding: 1mm; border: 0.3mm solid black; border-top: 0; }
.barra:first-of-type { border-top: 0.3mm solid black; }
.datos th, .datos td { border: 0.3mm solid black; padding: 0.6mm 1.2mm; height: 5.2mm; font-size: 8.5pt; white-space: nowrap; overflow: hidden; }
.datos th { font-weight: bold; text-align: center; }
.datos td { font-weight: bold; }
.derecha { text-align: right; }
.datos + .lista { margin-top: 3mm; }
.lista th { background: #d9d9d9; border: 0.3mm solid black; font-weight: bold; padding: 0.6mm; }
.lista th.izquierda { text-align: left; }
.dia small { display: block; font-weight: normal; font-size: 7pt; }
.lista td { border: 0.3mm solid black; height: 6.25mm; padding: 0 1mm; font-size: 8pt; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.centro { text-align: center; }
.nombre { font-size: 7.5pt; }
td.firma { padding: 0.3mm; text-align: center; }
td.firma img { max-width: 100%; max-height: 5.6mm; object-fit: contain; vertical-align: middle; }
</style></head><body>${paginas.join('')}</body></html>`
}

// Un iframe escondido: así no lo frena el bloqueador de ventanas emergentes, y se imprime cuando cargan las firmas
export function imprimirPlanilla(hojas, datos) {
  const marco = document.createElement('iframe')
  marco.setAttribute('aria-hidden', 'true')
  marco.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(marco)
  const doc = marco.contentDocument
  doc.open()
  // relativo a la página: el build usa base './'
  doc.write(htmlPlanilla(hojas, datos, new URL('logo-sena.png', document.baseURI).href))
  doc.close()

  const imagenes = [...doc.images]
  Promise.all(imagenes.map((img) => (img.complete ? null : new Promise((listo) => { img.onload = img.onerror = listo }))))
    .then(() => {
      // El título del documento es el nombre que propone el navegador al guardar el PDF
      const tituloOriginal = document.title
      document.title = doc.title
      marco.contentWindow.focus()
      marco.contentWindow.print()
      document.title = tituloOriginal
      // Se quita después: en algunos navegadores print() no espera a que cierren el cuadro
      setTimeout(() => marco.remove(), 60_000)
    })
}
