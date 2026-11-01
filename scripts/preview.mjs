// Servidor estático mínimo para ver dist/ como en GitHub Pages.
// Uso: pnpm preview   (respeta DEMO_BASE, por defecto "/")
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const BASE = ('/' + (process.env.DEMO_BASE ?? '/') + '/').replace(/\/+/g, '/');
const PORT = Number(process.env.PORT ?? 4321);
const ROOT = path.resolve('dist');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!url.startsWith(BASE)) { res.writeHead(302, { Location: BASE }); return res.end(); }
  let file = path.join(ROOT, url.slice(BASE.length));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404');
  }
}).listen(PORT, () => console.log(`▶ http://localhost:${PORT}${BASE}  ·  almacén: http://localhost:${PORT}${BASE}almacen/`));
