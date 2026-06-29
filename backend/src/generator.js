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
    <div class="marca marca-escudo"><strong>CE</strong><span>Centro Español</span></div>
    <div class="marca marca-hospital"><strong>+</strong><span>Hospital Ambulante</span></div>
    <div class="marca marca-flamenca">♟</div>
    <div class="marca marca-guitarra">♬</div>
    <div class="marca marca-notas">♪ ♫ ♩</div>
    <div class="marca marca-abanico">▰▰▰</div>
    <aside class="lateral">
      <div class="firma">Antonia</div>
      <div class="tarjeta-codigo"><span>Cartón Nº</span><strong>${carton.numero}</strong><span>Código:</span><b>${carton.codigo}</b><i>♥</i></div>
    </aside>
    <section class="contenido">
      <header>
        <h1><span>⌁</span>BINGO CANTADO SOLIDARIO<span>⌁</span></h1>
        <h2>A beneficio del Hospital Ambulante</h2>
        <p>“Contagiando salud y solidaridad”</p>
        <div class="separador"><span>𝄞</span><i></i><b>♥</b><i></i><span>♪</span></div>
        <div class="colabora"><span>•</span><strong>Colabora: Grupo Antonia</strong><span>•</span></div>
        <div class="flamencas">⌁ Expresiones Flamencas ⌁</div>
      </header>
      <div class="grilla">${carton.celdas.map((celda) => `<div class="celda"><strong>(${celda.numero})</strong><span>${escapeHtml(celda.cancion)}</span></div>`).join('')}</div>
    </section>
  </article>`;
}

export function generarHtml(cartones) {
  const hojas = [];
  for (let i = 0; i < cartones.length; i += 4) hojas.push(cartones.slice(i, i + 4));
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cartones Bingo</title><style>
    @page { size: A4 landscape; margin: 5mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #090909; background: #fff; font-family: Arial, Helvetica, sans-serif; }
    .hoja { width: 287mm; height: 200mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; page-break-after: always; position: relative; }
    .hoja:last-child { page-break-after: auto; }
    .slot { position: relative; padding: 2.2mm 4.2mm 3mm; min-width: 0; min-height: 0; }
    .slot::before, .slot::after { content: "✂"; position: absolute; color: #111; font-size: 14px; line-height: 1; z-index: 3; }
    .slot::before { left: -1.5mm; top: -1.8mm; }
    .slot::after { right: -1.5mm; bottom: -1.8mm; transform: rotate(180deg); }
    .slot:nth-child(odd) { border-right: 1px dashed #6f6f6f; }
    .slot:nth-child(-n+2) { border-bottom: 1px dashed #6f6f6f; }
    .carton { height: 100%; position: relative; overflow: hidden; padding: 2mm 4mm 3mm 31mm; background: radial-gradient(circle at 95% 80%, rgba(150,150,150,.14), transparent 16mm), radial-gradient(circle at 8% 82%, rgba(150,150,150,.13), transparent 19mm), #fff; }
    .carton::before { content: ""; position: absolute; inset: 1.2mm; border: 1px solid transparent; pointer-events: none; }
    .marca { position: absolute; z-index: 0; user-select: none; }
    .marca-escudo { left: 8mm; top: 3mm; width: 18mm; height: 22mm; border: 1.5px solid #222; border-radius: 4mm 4mm 7mm 7mm; background: linear-gradient(135deg,#d71919,#ffd238); color: #c40000; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-7deg); box-shadow: 0 1px 0 #fff inset; }
    .marca-escudo strong { font-family: Georgia, serif; font-size: 18px; color: #ffef3a; letter-spacing: -2px; }
    .marca-escudo span { margin-top: 1mm; padding: .5mm 1.5mm; border-radius: 8px; background: #ffc928; color: #111; font-size: 6px; font-weight: 700; transform: rotate(-5deg); }
    .marca-hospital { right: 4mm; top: 10mm; width: 24mm; height: 24mm; border-radius: 50%; background: radial-gradient(circle at 50% 45%, #fff 0 17%, #77c9ef 18% 36%, #ed1b24 37% 100%); border: 2px solid #ff1f1f; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #e00000; text-align: center; }
    .marca-hospital strong { font-size: 18px; line-height: .8; }
    .marca-hospital span { width: 20mm; padding: .5mm; background: #e00000; color: #ffe400; border-radius: 2px; font-size: 5.5px; font-weight: 900; text-transform: uppercase; transform: rotate(-9deg); }
    .marca-flamenca { left: 23mm; top: 18mm; color: #b50000; font-size: 29mm; line-height: 1; opacity: .95; transform: rotate(-3deg); }
    .marca-guitarra { left: 5mm; bottom: 38mm; color: rgba(0,0,0,.15); font-size: 18mm; transform: rotate(-24deg); }
    .marca-notas { right: 4mm; bottom: 38mm; width: 22mm; color: rgba(0,0,0,.18); font-size: 8mm; line-height: 1.4; transform: rotate(-15deg); }
    .marca-abanico { right: 8mm; bottom: 4mm; color: rgba(200,0,0,.35); font-size: 7mm; transform: rotate(-8deg); }
    .lateral { position: absolute; left: 5mm; top: 28mm; bottom: 5mm; width: 24mm; z-index: 1; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
    .firma { align-self: flex-start; color: #c40000; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-style: italic; font-weight: 700; margin-left: 1mm; }
    .tarjeta-codigo { width: 21mm; min-height: 28mm; border: 1.2px dotted #e00000; border-radius: 4px; background: rgba(255,255,255,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2mm 1mm 0; }
    .tarjeta-codigo span { font-size: 8px; font-weight: 700; margin-bottom: 1mm; }
    .tarjeta-codigo strong { font-size: 25px; line-height: 1; letter-spacing: .5px; margin-bottom: 3mm; }
    .tarjeta-codigo b { color: #df0000; font-size: 10px; margin-top: .5mm; }
    .tarjeta-codigo i { color: #df0000; font-style: normal; font-size: 16px; line-height: .6; transform: translateY(2mm); }
    .contenido { position: relative; z-index: 1; height: 100%; display: grid; grid-template-rows: auto 1fr; align-items: start; }
    header { height: 39mm; text-align: center; padding-right: 25mm; }
    h1 { margin: 0; color: #b40000; font-family: Impact, 'Arial Narrow', Arial, sans-serif; font-size: 25px; line-height: 1; letter-spacing: .9px; font-weight: 900; white-space: nowrap; }
    h1 span { color: #c40000; font-family: Georgia, serif; font-size: 15px; vertical-align: 20%; padding: 0 3mm; }
    h2 { margin: 1.5mm 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; line-height: 1; font-weight: 900; }
    p { margin: 2mm 0 0; color: #d40000; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; line-height: 1; font-style: italic; font-weight: 900; }
    .separador { margin: 1.5mm auto 0; width: 70mm; display: flex; align-items: center; justify-content: center; gap: 1.5mm; color: #111; }
    .separador i { flex: 1; border-top: 1px dotted #333; }
    .separador b { color: #d40000; font-size: 13px; }
    .separador span { font-size: 15px; line-height: 1; }
    .colabora { margin-top: .8mm; display: flex; justify-content: center; align-items: center; gap: 3mm; color: #d40000; font-size: 12px; }
    .colabora strong { color: #111; }
    .flamencas { color: #d40000; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-style: italic; font-weight: 900; line-height: 1.1; }
    .grilla { margin: 1mm 20mm 0 0; justify-self: stretch; align-self: stretch; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); border: 1.2px solid #222; background: #fff; }
    .celda { min-width: 0; min-height: 0; border-right: 1px solid #333; border-bottom: 1px solid #333; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1mm 2mm; }
    .celda:nth-child(3n) { border-right: 0; }
    .celda:nth-last-child(-n+3) { border-bottom: 0; }
    .celda strong { color: #e00000; font-size: 11px; line-height: 1.1; margin-bottom: 1mm; }
    .celda span { font-size: 12px; line-height: 1.08; font-weight: 900; }
  </style></head><body>${hojas.map((hoja) => `<section class="hoja">${hoja.map((carton) => `<div class="slot">${renderCarton(carton)}</div>`).join('')}</section>`).join('')}</body></html>`;
}

export const nombreArchivo = (numeroInicial, cantidad) => `cartones-bingo-GA-${pad4(numeroInicial)}-${pad4(numeroInicial + cantidad - 1)}.pdf`;
