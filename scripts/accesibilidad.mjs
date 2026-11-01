import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const b = await chromium.launch({ channel: 'msedge' });
for (const ruta of ['', 'almacen/']) {
  for (const w of [375, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.goto('http://localhost:4321/' + ruta, { waitUntil: 'networkidle' });
    await p.addScriptTag({ content: axe });
    const r = await p.evaluate(async () => (await axe.run(document, { exclude: [['iframe']], runOnly: ['wcag2a', 'wcag2aa'] })).violations
      .map(v => `${v.id} (${v.impact}): ${v.nodes.length} → ${v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' ' + (n.any[0]?.message ?? '')).join(' || ')}`));
    const ocultos = await p.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity !== '1').length);
    console.log(`\n[${ruta || 'resto'} ${w}] violaciones: ${r.length}  · ocultos con reduced-motion: ${ocultos}`); r.forEach(x => console.log('  ', x));
    await p.close();
  }
}
// Menú móvil
const p = await b.newPage({ viewport: { width: 375, height: 812 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.click('#menu-btn'); await p.waitForTimeout(700);
await p.screenshot({ path: (process.argv[2] ?? '.') + '/menu.png' });
console.log('\nmenú abierto:', await p.getAttribute('#menu-btn', 'aria-expanded'));
await p.keyboard.press('Escape');
console.log('tras Escape:', await p.getAttribute('#menu-btn', 'aria-expanded'));
const p2 = await b.newPage({ viewport: { width: 375, height: 812 } });
await p2.goto('http://localhost:4321/almacen/', { waitUntil: 'networkidle' });
await p2.screenshot({ path: (process.argv[2] ?? '.') + '/alm-nav.png', clip: { x: 0, y: 0, width: 375, height: 80 } });
await b.close();
