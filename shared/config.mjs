// ─────────────────────────────────────────────────────────────
//  ÚNICO lugar donde se configuran las URLs cruzadas.
// ─────────────────────────────────────────────────────────────
//
//  SITE_MODE=demo        → los dos sitios viven juntos:
//                            RESTO_URL   = <DEMO_BASE>
//                            ALMACEN_URL = <DEMO_BASE>almacen/
//                          (DEMO_BASE es "/" en local y "/<repo>/" en GitHub Pages)
//
//  SITE_MODE=production  → cada sitio en su dominio:
//                            RESTO_URL   = https://lapan.com.ar/
//                            ALMACEN_URL = https://almacen.lapan.com.ar/
//
//  Se lee en tiempo de build (Node), así que funciona en astro.config.mjs
//  y en el frontmatter de los componentes .astro.

const withSlashes = (p) => ('/' + p + '/').replace(/\/+/g, '/');

export const SITE_MODE = process.env.SITE_MODE === 'production' ? 'production' : 'demo';
const DEMO_BASE = withSlashes(process.env.DEMO_BASE ?? '/');
// Origen público de la demo (para Open Graph). Ej: https://usuario.github.io
const DEMO_ORIGIN = (process.env.DEMO_ORIGIN ?? 'http://localhost:4321').replace(/\/$/, '');

const SITES = {
  demo: {
    RESTO_URL: DEMO_BASE,
    ALMACEN_URL: `${DEMO_BASE}almacen/`,
    RESTO_BASE: DEMO_BASE,
    ALMACEN_BASE: `${DEMO_BASE}almacen/`,
    RESTO_ORIGIN: DEMO_ORIGIN,
    ALMACEN_ORIGIN: DEMO_ORIGIN,
  },
  production: {
    RESTO_URL: 'https://lapan.com.ar/',
    ALMACEN_URL: 'https://almacen.lapan.com.ar/',
    RESTO_BASE: '/',
    ALMACEN_BASE: '/',
    RESTO_ORIGIN: 'https://lapan.com.ar',
    ALMACEN_ORIGIN: 'https://almacen.lapan.com.ar',
  },
};

export const {
  RESTO_URL,
  ALMACEN_URL,
  RESTO_BASE,
  ALMACEN_BASE,
  RESTO_ORIGIN,
  ALMACEN_ORIGIN,
} = SITES[SITE_MODE];

/** Ruta a un archivo de /public respetando el base del sitio. */
export const asset = (base, p) => withSlashes(base).replace(/\/$/, '') + '/' + p.replace(/^\//, '');
