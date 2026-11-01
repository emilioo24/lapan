// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { ALMACEN_BASE, ALMACEN_ORIGIN } from '../../shared/config.mjs';

export default defineConfig({
  site: ALMACEN_ORIGIN,
  base: ALMACEN_BASE,
  // Carpeta de imágenes compartida por los dos sitios
  publicDir: '../../public',
  outDir: './dist',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  vite: {
    plugins: [tailwindcss()],
    server: { fs: { allow: ['../..'] } },
  },
});
