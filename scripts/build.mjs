// Build de los dos sitios.
//   pnpm build:demo        → dist/ (resto en /, almacén en /almacen/) — para GitHub Pages o local
//   pnpm build:produccion  → dist/resto y dist/almacen, cada uno con su CNAME
import { execSync } from 'node:child_process';
import { rmSync, cpSync, writeFileSync, mkdirSync } from 'node:fs';

const modo = process.argv[2] === 'produccion' ? 'production' : 'demo';
const env = { ...process.env, SITE_MODE: modo };
const run = (cmd) => execSync(cmd, { stdio: 'inherit', env });

console.log(`\n▶ Build en modo ${modo}${modo === 'demo' ? ` · DEMO_BASE=${env.DEMO_BASE ?? '/'}` : ''}\n`);
run('pnpm --filter resto build');
run('pnpm --filter almacen build');

rmSync('dist', { recursive: true, force: true });
if (modo === 'demo') {
  cpSync('apps/resto/dist', 'dist', { recursive: true });
  cpSync('apps/almacen/dist', 'dist/almacen', { recursive: true });
  writeFileSync('dist/.nojekyll', '');
  console.log('\n✓ Demo lista en dist/  (almacén en dist/almacen/)');
} else {
  mkdirSync('dist', { recursive: true });
  cpSync('apps/resto/dist', 'dist/resto', { recursive: true });
  cpSync('apps/almacen/dist', 'dist/almacen', { recursive: true });
  writeFileSync('dist/resto/CNAME', 'lapan.com.ar\n');
  writeFileSync('dist/almacen/CNAME', 'almacen.lapan.com.ar\n');
  for (const d of ['resto', 'almacen']) writeFileSync(`dist/${d}/.nojekyll`, '');
  console.log('\n✓ Producción lista: dist/resto → lapan.com.ar · dist/almacen → almacen.lapan.com.ar');
}
