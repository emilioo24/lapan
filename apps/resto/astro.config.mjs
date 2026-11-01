// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { RESTO_BASE, RESTO_ORIGIN } from '../../shared/config.mjs';

export default defineConfig({
  site: RESTO_ORIGIN,
  base: RESTO_BASE,
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
