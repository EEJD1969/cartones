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
      <aside class="datos">
        <span class="datos-label">Cartón Nº</span>
        <strong>${carton.numero}</strong>
        <span class="datos-label">Código:</span>
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
    .slot { padding: 0; position: relative; min-width: 0; min-height: 0; }
    .slot:nth-child(odd)::after { content: ''; position: absolute; top: 0; right: 0; height: 100%; border-right: 1px dashed #555; }
    .slot:nth-child(-n+2)::before { content: ''; position: absolute; left: 0; bottom: 0; width: 100%; border-bottom: 1px dashed #555; }
    .carton { height: 100%; position: relative; padding: 0; background: #fff; overflow: hidden; }
    .contenido { height: 100%; position: relative; overflow: hidden; background: transparent; }
    .carton-template { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: fill; display: block; pointer-events: none; user-select: none; }
    .contenido { --grid-x: calc(46.4mm + 18px); --grid-y: calc(41.54mm + 16px); --cell-width: calc(24.67mm - 2px); --cell-height: calc(16.9mm - 2px); }
    .datos { position: absolute; left: 6.5mm; bottom: calc(13mm - 7px); z-index: 3; width: 22mm; min-height: 31mm; border: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.8mm; background: transparent; text-align: center; }
    .datos-label { font-size: 11px; line-height: 1; font-weight: 900; }
    .datos strong { font-size: 19px; line-height: 1; }
    .datos em { color: #e00000; font-style: normal; font-size: 10px; font-weight: 900; }
    .grilla { position: absolute; z-index: 2; left: var(--grid-x); top: var(--grid-y); width: calc(var(--cell-width) * 3); height: calc(var(--cell-height) * 3); display: grid; grid-template-columns: repeat(3, var(--cell-width)); grid-template-rows: repeat(3, var(--cell-height)); }
    .celda { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; min-width: 0; }
    .celda strong { color: #f00000; font-size: 12px; line-height: 1; font-weight: 900; }
    .celda span { margin-top: 1.5mm; color: #0a0a0a; font-size: 11px; line-height: 1.12; font-weight: 800; }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja">${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
