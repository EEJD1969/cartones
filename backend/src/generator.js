import { canciones } from './songs.js';

const pad4 = (n) => String(n).padStart(4, '0');
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
  return Array.from({ length: cantidad }, (_, index) => {
    const numeroCarton = numeroInicial + index;
    const numeros = shuffle(Array.from({ length: 100 }, (_, i) => i + 1)).slice(0, 9);
    return {
      numero: pad4(numeroCarton),
      codigo: `GA-${pad4(numeroCarton)}`,
      celdas: shuffle(numeros).map((numero) => ({ numero, cancion: canciones[numero - 1] }))
    };
  });
}

function renderCarton(carton) {
  return `<article class="carton">
    <aside class="lateral"><span>Cartón Nº</span><strong>${carton.numero}</strong><span>Código</span><strong>${carton.codigo}</strong></aside>
    <section class="contenido">
      <header><h1>BINGO CANTADO SOLIDARIO</h1><h2>A beneficio del Hospital Ambulante</h2><p>“Contagiando salud y solidaridad”</p></header>
      <div class="grilla">${carton.celdas.map((celda) => `<div class="celda"><strong>${celda.numero}</strong><span>${escapeHtml(celda.cancion)}</span></div>`).join('')}</div>
      <footer><span>Colabora: Grupo Antonia</span><span>Expresiones Flamencas</span></footer>
    </section>
  </article>`;
}

export function generarHtml(cartones) {
  const hojas = [];
  for (let i = 0; i < cartones.length; i += 4) hojas.push(cartones.slice(i, i + 4));
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cartones Bingo</title><style>
    @page { size: A4 landscape; margin: 8mm; } * { box-sizing: border-box; } body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #20140f; background: #fff; }
    .hoja { width: 281mm; height: 194mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0; page-break-after: always; position: relative; }
    .hoja:last-child { page-break-after: auto; } .slot { padding: 4mm; position: relative; } .slot:nth-child(odd) { border-right: 1.2px dashed #8c7468; } .slot:nth-child(-n+2) { border-bottom: 1.2px dashed #8c7468; }
    .carton { height: 100%; border: 2px solid #6d1c12; border-radius: 10px; display: flex; overflow: hidden; background: linear-gradient(135deg, #fffaf3, #fff 55%, #fff4e2); }
    .lateral { width: 30mm; background: #7d1912; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; text-align: center; padding: 3mm; }
    .lateral span { font-size: 9px; text-transform: uppercase; letter-spacing: .6px; } .lateral strong { font-size: 18px; line-height: 1; }
    .contenido { flex: 1; padding: 3mm; display: flex; flex-direction: column; gap: 2mm; } header { text-align: center; border-bottom: 1px solid #e8c7b5; padding-bottom: 1.5mm; }
    h1 { margin: 0; color: #b41e19; font-size: 18px; letter-spacing: .4px; } h2 { margin: .8mm 0 0; font-size: 11px; } p { margin: .8mm 0 0; font-size: 10px; font-style: italic; color: #6d1c12; }
    .grilla { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1.5mm; }
    .celda { border: 1.4px solid #d7a08a; border-radius: 7px; background: rgba(255,255,255,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; min-width: 0; }
    .celda strong { color: #d81919; font-size: 20px; line-height: 1; } .celda span { margin-top: 1mm; font-size: 8.8px; line-height: 1.05; font-weight: 700; }
    footer { display: flex; justify-content: space-between; gap: 2mm; color: #6d1c12; font-size: 9px; font-weight: 700; border-top: 1px solid #e8c7b5; padding-top: 1.5mm; }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja">${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
