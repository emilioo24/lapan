// Capturas de revisión a 375 y 1440 px. Uso: pnpm preview (en otra terminal) y luego node scripts/capturas.mjs [carpeta]
import { chromium } from 'playwright-core';
const out = process.argv[2] ?? 'capturas';
const base = process.env.URL ?? 'http://localhost:4321/';
const browser = await chromium.launch({ channel: 'msedge' });
for (const [nombre, ruta] of [['resto', ''], ['almacen', 'almacen/']]) {
  for (const w of [375, 1440]) {
    const page = await browser.newPage({ viewport: { width: w, height: w < 600 ? 812 : 900 }, deviceScaleFactor: 1 });
    const errores = [];
    page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto(base + ruta, { waitUntil: 'networkidle' });
    // scrollear todo para disparar animaciones y lazy-load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(2500);
    const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    await page.screenshot({ path: `${out}/${nombre}-${w}.png`, fullPage: true });
    console.log(nombre, w, 'scrollWidth/innerWidth', ancho.join('/'), errores.length ? 'ERRORES: ' + errores.join(' | ') : 'sin errores');
    await page.close();
  }
}
await browser.close();
