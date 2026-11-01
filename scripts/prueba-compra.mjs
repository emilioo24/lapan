// Prueba de punta a punta de la tienda: home → producto → carrito → checkout → seguimiento.
// Uso: pnpm preview (en otra terminal) y luego: pnpm prueba:compra [ancho]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] ?? 'capturas', W = Number(process.argv[3] ?? 375);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: W, height: W < 600 ? 812 : 900 } });
const errores = []; p.on('pageerror', (e) => errores.push(e.message)); p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
const foto = (n) => p.screenshot({ path: `${out}/${W}-${n}.png` });

// 0. Home del almacén → botón "Hacer mi pedido"
await p.goto('http://localhost:4321/almacen/', { waitUntil: 'networkidle' });
await p.getByRole('link', { name: 'Hacer mi pedido' }).click();
await p.waitForLoadState('networkidle'); await p.waitForTimeout(600);
console.log('tienda:', p.url());
await foto('1-tienda');

// 1. Abrir producto con variantes, elegir "Docena", cantidad 2, agregar
await p.locator('.tarjeta-producto', { hasText: 'Huevos de gallinas libres' }).click();
await p.waitForTimeout(500); await foto('2-modal');
await p.getByRole('radio', { name: /^Docena/ }).check();
await p.getByRole('button', { name: 'Sumar uno' }).click();
await p.getByRole('button', { name: /^Agregar/ }).click();
await p.waitForTimeout(400); await foto('3-agregado');

// 2. Otro producto sin variantes, buscando
await p.getByPlaceholder(/Buscá/).fill('galesa');
await p.locator('.tarjeta-producto', { hasText: 'Torta galesa' }).click();
await p.getByRole('button', { name: /^Agregar/ }).click();
await p.getByPlaceholder(/Buscá/).fill('');
await p.waitForTimeout(300);
console.log('carrito guardado:', await p.evaluate(() => localStorage.getItem('lapan-almacen-carrito-v1')));

// 3. Abrir carrito y continuar
if (W < 1024) { await p.getByRole('button', { name: /Ver mi pedido/ }).click(); await p.waitForTimeout(500); await foto('4-carrito'); }
await p.getByRole('link', { name: 'Continuar' }).last().click();
await p.waitForLoadState('networkidle'); await p.waitForTimeout(500);
console.log('checkout:', p.url());
await foto('5-checkout');

// 4. Confirmar vacío → errores
await p.getByRole('button', { name: /Confirmar pedido/ }).first().click({ force: true });
await p.waitForTimeout(700);
console.log('errores de validación:', await p.locator('[role=alert], [id$=-error]').allInnerTexts());
await foto('6-errores');

// 5. Completar
await p.getByLabel('Calle y número').fill('Urquiza 1234');
await p.getByLabel(/Piso/).fill('2° B');
await p.getByRole('radio', { name: /Programar/ }).click();
await p.locator('button[aria-pressed]').first().click(); // primer día con entrega
const franja = p.locator('button[aria-pressed]:not([disabled])').filter({ hasText: /9 a 13 h|16 a 20 h/ }).first();
await franja.click();
await p.getByLabel('Nombre').fill('Martina Gómez');
await p.getByLabel('Teléfono').fill('343 555-1234');
await p.getByRole('radio', { name: /Transferencia/ }).click();
await p.waitForTimeout(300);
await p.getByRole('button', { name: /Confirmar pedido/ }).first().click({ force: true });
await p.waitForTimeout(500); await foto('7-procesando');
await p.waitForURL(/seguimiento/, { timeout: 8000 });
await p.waitForTimeout(1500);
console.log('seguimiento:', p.url());
await foto('8-seguimiento');
await p.screenshot({ path: `${out}/${W}-9-seguimiento-full.png`, fullPage: true });
await p.waitForTimeout(18000);
await p.screenshot({ path: `${out}/${W}-10-en-camino.png`, fullPage: true });
console.log('carrito tras pedido:', await p.evaluate(() => localStorage.getItem('lapan-almacen-carrito-v1')));
console.log('pedido:', await p.evaluate(() => JSON.parse(localStorage.getItem('lapan-almacen-pedido-v1')).entrega));
console.log(errores.length ? 'ERRORES JS: ' + errores.join(' | ') : 'sin errores JS');
await b.close();
