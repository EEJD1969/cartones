import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canciones } from './songs.js';

const pad4 = (n) => String(n).padStart(4, '0');
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const totalCanciones = canciones.length;
const assetsDir = join(dirname(fileURLToPath(import.meta.url)), 'assets');

function pngDataUri(nombreArchivo) {
  return `data:image/png;base64,${readFileSync(join(assetsDir, nombreArchivo)).toString('base64')}`;
}

const imagenes = {
  escudo: pngDataUri('escudo.png'),
  hospital: pngDataUri('hospital.png'),
  flamenca: pngDataUri('flamenca.png'),
  guitarra: pngDataUri('guitarra.png'),
  notas: pngDataUri('notas.png'),
  abanico: pngDataUri('abanico.png')
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function validarParametros(body) {
  const errores = [];
  const cantidad = Number(body?.cantidad);
  const numeroInicial = Number(body?.numeroInicial);

  if (body?.cantidad === undefined || body?.cantidad === '') errores.push('cantidad requerida');
  else if (!Number.isInteger(cantidad) || cantidad < 1) errores.push('cantidad inválida');
  else if (cantidad > 500) errores.push('cantidad máxima 500');

  if (body?.numeroInicial === undefined || body?.numeroInicial === '') errores.push('número inicial requerido');
  else if (!Number.isInteger(numeroInicial) || numeroInicial < 1) errores.push('número inicial inválido');

  return { errores, cantidad, numeroInicial };
}

export function generarCartones(cantidad, numeroInicial) {
  if (totalCanciones !== 100) throw new Error('La lista de canciones debe contener exactamente 100 canciones');

  return Array.from({ length: cantidad }, (_, index) => {
    const numeroCarton = numeroInicial + index;
    const numeros = shuffle(Array.from({ length: totalCanciones }, (_, i) => i + 1)).slice(0, 9);

    return {
      numero: pad4(numeroCarton),
      codigo: `GA-${pad4(numeroCarton)}`,
      celdas: numeros.map((numero) => ({ numero, cancion: canciones[numero - 1] }))
    };
  });
}

function imagenDecorativa(clase, src, alt = '') {
  return `<img class="decoracion ${clase}" src="${src}" alt="${alt}" aria-hidden="true">`;
}

function renderCarton(carton) {
  return `<article class="carton">
    <aside class="lateral">
      <span>Cartón Nº</span>
      <strong>${carton.numero}</strong>
      <span>Código</span>
      <strong>${carton.codigo}</strong>
    </aside>
    <section class="contenido">
      ${imagenDecorativa('escudo', imagenes.escudo)}
      ${imagenDecorativa('hospital', imagenes.hospital)}
      ${imagenDecorativa('flamenca', imagenes.flamenca)}
      ${imagenDecorativa('guitarra', imagenes.guitarra)}
      ${imagenDecorativa('notas', imagenes.notas)}
      ${imagenDecorativa('abanico', imagenes.abanico)}
      <header>
        <h1>BINGO CANTADO SOLIDARIO</h1>
        <h2>A beneficio del Hospital Ambulante</h2>
        <p>“Contagiando salud y solidaridad”</p>
      </header>
      <div class="grilla">${carton.celdas.map((celda) => `<div class="celda"><strong>${celda.numero}</strong><span>${escapeHtml(celda.cancion)}</span></div>`).join('')}</div>
      <footer><span>Grupo Antonia</span><span>Expresiones Flamencas</span></footer>
    </section>
  </article>`;
}

export function generarHtml(cartones) {
  const hojas = [];
  for (let i = 0; i < cartones.length; i += 4) hojas.push(cartones.slice(i, i + 4));

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cartones Bingo</title><style>
    @page { size: A4 landscape; margin: 7mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #2a1711; background: #fff; }
    .hoja { width: 283mm; height: 196mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; page-break-after: always; position: relative; }
    .hoja:last-child { page-break-after: auto; }
    .slot { padding: 4mm; position: relative; }
    .slot:nth-child(odd) { border-right: 1.2px dashed #9b7a6c; }
    .slot:nth-child(-n+2) { border-bottom: 1.2px dashed #9b7a6c; }
    .carton { height: 100%; border: 2px solid #7c1f17; border-radius: 8px; display: flex; overflow: hidden; background: #fff8eb; box-shadow: inset 0 0 0 1.3px #efc7a9; }
    .lateral { width: 29mm; background: linear-gradient(180deg, #8e1d16, #62130f); color: #fff6df; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; text-align: center; padding: 3mm; border-right: 2px solid #d4a15d; }
    .lateral span { font-size: 9px; text-transform: uppercase; letter-spacing: .8px; }
    .lateral strong { font-size: 18px; line-height: 1; }
    .contenido { flex: 1; padding: 3mm 4mm; display: flex; flex-direction: column; gap: 2mm; position: relative; overflow: hidden; background: radial-gradient(circle at 13% 16%, rgba(218, 45, 35, .08), transparent 23%), radial-gradient(circle at 87% 18%, rgba(219, 155, 47, .14), transparent 24%), linear-gradient(180deg, #fffaf0 0%, #fff4e2 100%); }
    header { text-align: center; border-bottom: 1.4px solid #d8a37a; padding: 0 18mm 1.5mm; min-height: 22mm; position: relative; z-index: 2; }
    h1 { margin: 0; color: #c51619; font-size: 19px; letter-spacing: .6px; font-weight: 900; text-shadow: 0 1px 0 #fff; }
    h2 { margin: .7mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #3b2118; font-weight: 700; }
    p { margin: .7mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 9.5px; font-style: italic; color: #7a2019; }
    .grilla { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1.4mm; position: relative; z-index: 2; }
    .celda { border: 1.5px solid #c98a66; border-radius: 6px; background: rgba(255,255,255,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; min-width: 0; box-shadow: 0 1px 0 rgba(122, 32, 25, .12); }
    .celda strong { color: #d71920; font-size: 20px; line-height: 1; }
    .celda span { margin-top: 1mm; font-size: 8.5px; line-height: 1.05; font-weight: 700; }
    footer { display: flex; justify-content: space-between; gap: 2mm; color: #7a2019; font-size: 8.8px; font-weight: 800; border-top: 1.4px solid #d8a37a; padding-top: 1.2mm; position: relative; z-index: 2; }
    .decoracion { position: absolute; display: block; object-fit: contain; pointer-events: none; user-select: none; }
    .escudo { left: 4mm; top: 3mm; width: 14mm; height: 16mm; z-index: 3; }
    .hospital { right: 4mm; top: 3mm; width: 16mm; height: 17mm; z-index: 3; }
    .flamenca { left: 4mm; top: 21mm; width: 15mm; height: 22mm; z-index: 1; filter: drop-shadow(0 1px 1px rgba(80, 35, 20, .18)); }
    .guitarra { left: 6mm; bottom: 11mm; width: 18mm; height: 24mm; z-index: 0; opacity: .16; filter: grayscale(1); transform: rotate(-13deg); }
    .notas { left: 48%; top: 45%; width: 34mm; height: 20mm; z-index: 0; opacity: .14; filter: grayscale(1); transform: translate(-50%, -50%) rotate(-3deg); }
    .abanico { right: 4mm; bottom: 4mm; width: 24mm; height: 20mm; z-index: 1; filter: drop-shadow(0 1px 1px rgba(80, 35, 20, .16)); }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja">${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
