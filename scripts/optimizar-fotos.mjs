// Convierte las fotos originales (3000×4000 px) a .webp livianas en public/img/fotos.
// Uso: pnpm fotos
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'originales/fotos');
const OUT = path.join(root, 'public/img/fotos');

const FOTOS = {
  '533103461_18380985541131252_7823757896344551148_n.jpg': 'croissant-frutos-rojos',
  '782386379_18440146291131252_2140543528254957649_n.jpg': 'pavlova',
  '794141164_18441351382131252_1475479351657584358_n.jpg': 'brunch-huevo-palta',
  '707407058_18423286987131252_5860813484643984745_n.jpg': 'croissant-jamon-queso',
  '841662607_18447407479131252_818992024565902315_n.jpg': 'cookie-chocolate-frambuesa',
  '485136431_18363558889131252_4288393136404509942_n.jpg': 'cookies',
  '469579244_18350134492131252_8386398449951097162_n.jpg': 'pan-dulce-pistacho',
  '657929369_18412911658131252_3478337466029443167_n.jpg': 'roscas',
  '656277923_18412911640131252_191216961819386882_n.jpg': 'box-rosca',
  '573340698_18392397043131252_838407692024815537_n.jpg': 'perro-cumple',
  '747112393_18432020257131252_192881421046630034_n.jpg': 'alfajor-10-anios',
};

await mkdir(OUT, { recursive: true });
for (const [file, name] of Object.entries(FOTOS)) {
  for (const w of [600, 1200]) {
    await sharp(path.join(SRC, file)).rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  console.log('✓', name);
}

// Imágenes para compartir (Open Graph, 1200×630)
await sharp(path.join(SRC, '782386379_18440146291131252_2140543528254957649_n.jpg')).rotate()
  .resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 80 })
  .toFile(path.join(root, 'public/img/og-resto.jpg'));
await sharp(path.join(SRC, '469579244_18350134492131252_8386398449951097162_n.jpg')).rotate()
  .resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 80 })
  .toFile(path.join(root, 'public/img/og-almacen.jpg'));
console.log('✓ og');
