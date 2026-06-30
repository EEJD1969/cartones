import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canciones } from './songs.js';

const pad4 = (n) => String(n).padStart(4, '0');
const escapeHtml = (value) => String(value).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const totalCanciones = canciones.length;
const assetsDir = join(dirname(fileURLToPath(import.meta.url)), 'assets');

function pngDataUri(nombreArchivo) {
  return `data:image/png;base64,${readFileSync(join(assetsDir, nombreArchivo)).toString('base64')}`;
}

const imagenes = {
  template: pngDataUri('template/carton-template.png')
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


function renderCarton(carton) {
  return `<article class="carton">
    <section class="contenido">
      <img class="carton-template" src="${imagenes.template}" alt="" aria-hidden="true">
      <header>
        <h1>BINGO CANTADO SOLIDARIO</h1>
        <h2>A beneficio del Hospital Ambulante</h2>
        <p>“Contagiando salud y solidaridad”</p>
        <div class="separador"><span>𝄞</span><i></i><b>♥</b><i></i><span>♪</span></div>
        <div class="colabora"><span>• Colabora: Grupo Antonia •</span><strong>Expresiones Flamencas</strong></div>
      </header>
      <aside class="datos">
        <span>Cartón Nº</span>
        <strong>${carton.numero}</strong>
        <span>Código:</span>
        <em>${carton.codigo}</em>
      </aside>
      <div class="grilla">${carton.celdas.map((celda) => `<div class="celda"><strong>(${celda.numero})</strong><span>${escapeHtml(celda.cancion)}</span></div>`).join('')}</div>
    </section>
  </article>`;
}

export function generarHtml(cartones) {
  const hojas = [];
  for (let i = 0; i < cartones.length; i += 4) hojas.push(cartones.slice(i, i + 4));

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cartones Bingo</title><style>
    @page { size: A4 landscape; margin: 4mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #050505; background: #fff; }
    .hoja { width: 289mm; height: 202mm; display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); page-break-after: always; position: relative; background: #fff; border: 1px dashed #555; }
    .hoja:last-child { page-break-after: auto; }
    .tijera { position: absolute; z-index: 6; color: #111; font-size: 13px; line-height: 1; }
    .tijera-vertical-sup { top: -2.6mm; left: 50%; transform: translateX(-50%) rotate(90deg); }
    .tijera-vertical-inf { bottom: -2.6mm; left: 50%; transform: translateX(-50%) rotate(-90deg); }
    .tijera-horizontal-izq { left: -2.6mm; top: 50%; transform: translateY(-50%); }
    .tijera-horizontal-der { right: -2.6mm; top: 50%; transform: translateY(-50%) rotate(180deg); }
    .slot { padding: 0; position: relative; min-width: 0; min-height: 0; }
    .slot:nth-child(odd)::after { content: ''; position: absolute; top: 0; right: 0; height: 100%; border-right: 1px dashed #555; }
    .slot:nth-child(-n+2)::before { content: ''; position: absolute; left: 0; bottom: 0; width: 100%; border-bottom: 1px dashed #555; }
    .carton { height: 100%; position: relative; padding: 0; background: #fff; overflow: hidden; }
    .contenido { height: 100%; position: relative; overflow: hidden; background: transparent; }
    .carton-template { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: fill; display: block; pointer-events: none; user-select: none; }
    header { text-align: center; min-height: 39mm; padding: 4mm 31mm 0; position: relative; z-index: 2; }
    h1 { margin: 0; color: #c30000; font-family: Impact, 'Arial Narrow', Arial, sans-serif; font-size: 22px; line-height: 1.04; letter-spacing: .45px; font-weight: 900; }
    h2 { margin: 2mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 13.5px; font-weight: 700; }
    p { margin: 1.2mm 0 0; color: #d00000; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-style: italic; font-weight: 700; }
    .separador { display: flex; align-items: center; justify-content: center; gap: 1.4mm; margin: 1.2mm auto .8mm; width: 58mm; color: #101010; font-size: 16px; }
    .separador i { height: 0; flex: 1; border-top: 1px dotted #111; }
    .separador b { color: #d00000; font-size: 16px; line-height: 1; }
    .colabora { display: flex; flex-direction: column; align-items: center; gap: .7mm; font-size: 11px; font-weight: 700; }
    .colabora strong { color: #d00000; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-style: italic; }
    .datos { position: absolute; left: 6.5mm; bottom: 13mm; z-index: 3; width: 22mm; min-height: 31mm; border: 0; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2mm; background: rgba(255,255,255,.88); text-align: center; }
    .datos span { font-size: 8.5px; font-weight: 700; }
    .datos strong { font-size: 19px; line-height: 1; }
    .datos em { color: #e00000; font-style: normal; font-size: 10px; font-weight: 900; }
    .grilla { position: absolute; z-index: 2; right: 20.1mm; bottom: 23.3mm; width: 74mm; height: 52mm; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); border: .9px solid #343434; background: #fff; }
    .celda { border-right: .9px solid #343434; border-bottom: .9px solid #343434; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; min-width: 0; }
    .celda:nth-child(3n) { border-right: 0; }
    .celda:nth-child(n+7) { border-bottom: 0; }
    .celda strong { color: #f00000; font-size: 12px; line-height: 1; font-weight: 900; }
    .celda span { margin-top: 1.5mm; color: #0a0a0a; font-size: 11px; line-height: 1.12; font-weight: 800; }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja"><span class="tijera tijera-vertical-sup">✂</span><span class="tijera tijera-vertical-inf">✂</span><span class="tijera tijera-horizontal-izq">✂</span><span class="tijera tijera-horizontal-der">✂</span>${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
