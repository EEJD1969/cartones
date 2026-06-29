import { canciones } from './songs.js';

const pad4 = (n) => String(n).padStart(4, '0');
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const totalCanciones = canciones.length;

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

function placeholder(clase, texto) {
  return `<span class="decoracion ${clase}" aria-hidden="true">${texto}</span>`;
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
      ${placeholder('escudo', 'Escudo')}
      ${placeholder('hospital', 'Hospital')}
      ${placeholder('flamenca', 'Flamenca')}
      ${placeholder('guitarra', 'Guitarra')}
      ${placeholder('notas', '♪ ♫')}
      ${placeholder('abanico', 'Abanico')}
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
    .contenido { flex: 1; padding: 3mm 4mm; display: flex; flex-direction: column; gap: 2mm; position: relative; overflow: hidden; background: radial-gradient(circle at 12% 14%, rgba(218, 45, 35, .09), transparent 24%), radial-gradient(circle at 88% 18%, rgba(219, 155, 47, .15), transparent 25%), #fff9ee; }
    header { text-align: center; border-bottom: 1.4px solid #d8a37a; padding: 0 16mm 1.5mm; min-height: 22mm; position: relative; z-index: 1; }
    h1 { margin: 0; color: #c51619; font-size: 19px; letter-spacing: .6px; font-weight: 900; text-shadow: 0 1px 0 #fff; }
    h2 { margin: .7mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #3b2118; font-weight: 700; }
    p { margin: .7mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 9.5px; font-style: italic; color: #7a2019; }
    .grilla { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 1.4mm; position: relative; z-index: 1; }
    .celda { border: 1.5px solid #c98a66; border-radius: 6px; background: rgba(255,255,255,.94); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm; min-width: 0; box-shadow: 0 1px 0 rgba(122, 32, 25, .12); }
    .celda strong { color: #d71920; font-size: 20px; line-height: 1; }
    .celda span { margin-top: 1mm; font-size: 8.5px; line-height: 1.05; font-weight: 700; }
    footer { display: flex; justify-content: space-between; gap: 2mm; color: #7a2019; font-size: 8.8px; font-weight: 800; border-top: 1.4px solid #d8a37a; padding-top: 1.2mm; position: relative; z-index: 1; }
    .decoracion { position: absolute; z-index: 0; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(124, 31, 23, .38); color: rgba(124, 31, 23, .46); background: rgba(255, 241, 213, .72); font-size: 7px; font-weight: 800; text-transform: uppercase; }
    .escudo { left: 4mm; top: 4mm; width: 13mm; height: 15mm; border-radius: 50% 50% 45% 45%; }
    .hospital { right: 4mm; top: 4mm; width: 19mm; height: 13mm; border-radius: 4px; }
    .flamenca { left: 3mm; bottom: 8mm; width: 14mm; height: 22mm; border-radius: 50% 50% 45% 45%; transform: rotate(-6deg); }
    .guitarra { right: 3mm; bottom: 9mm; width: 12mm; height: 24mm; border-radius: 50%; transform: rotate(11deg); }
    .notas { right: 20mm; top: 21mm; border: 0; background: transparent; color: rgba(197, 22, 25, .42); font-size: 14px; }
    .abanico { left: 18mm; bottom: 7mm; width: 20mm; height: 10mm; border-radius: 20mm 20mm 3mm 3mm; transform: rotate(5deg); }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja">${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
