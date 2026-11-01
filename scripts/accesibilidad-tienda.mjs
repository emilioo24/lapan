import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const b = await chromium.launch({ channel: 'msedge' });
for (const w of [375, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await p.goto('http://localhost:4321/almacen/pedir/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.setItem('lapan-almacen-carrito-v1', JSON.stringify([{ clave: 'h|12|', productoId: 'huevos', nombre: 'Huevos', variante: 'Docena', precio: 7200, cantidad: 2, icono: 'huevo', fondo: '#F3E6CC' }])));
  const casos = [['pedir/', null], ['pedir/', 'modal'], ['pedir/finalizar/', 'errores'], ['pedir/seguimiento/', null], ['', null]];
  for (const [r, extra] of casos) {
    await p.goto('http://localhost:4321/almacen/' + r, { waitUntil: 'networkidle' });
    if (extra === 'modal') { await p.locator('.tarjeta-producto').first().click(); await p.waitForTimeout(300); }
    if (extra === 'errores') { await p.getByRole('button', { name: /Confirmar pedido/ }).first().click({ force: true }); await p.waitForTimeout(300); }
    await p.addScriptTag({ content: axe });
    const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map(v => `${v.id}: ${v.nodes.slice(0,2).map(n => n.target.join(' ') + ' ' + (n.any[0]?.message ?? n.failureSummary ?? '').slice(0, 140)).join(' || ')}`));
    console.log(`[${w} ${r || 'home'}${extra ? ' +' + extra : ''}] ${v.length} violaciones`); v.forEach(x => console.log('   ', x));
  }
  await p.close();
}
await b.close();
