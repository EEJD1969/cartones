import express from 'express';
import { chromium } from 'playwright';
import { generarCartones, generarHtml, nombreArchivo, validarParametros } from './generator.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'cartones-backend' }));

app.post('/api/generar', async (req, res) => {
  const { errores, cantidad, numeroInicial } = validarParametros(req.body);
  if (errores.length) return res.status(400).json({ errores });

  let browser;
  try {
    const cartones = generarCartones(cantidad, numeroInicial);
    const html = generarHtml(cartones);
    browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo(numeroInicial, cantidad)}"`);
    return res.send(pdf);
  } catch (error) {
    console.error('Error generando PDF', error);
    return res.status(500).json({ errores: ['No se pudo generar el PDF'] });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(port, () => console.log(`cartones-backend escuchando en ${port}`));
