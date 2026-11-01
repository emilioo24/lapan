# Lapan · sitios web (demo)

Dos sitios hechos con **Astro 7 + Tailwind 4**, que comparten imágenes, estilos y datos:

| Sitio | Carpeta | Producción | Demo |
|---|---|---|---|
| Restaurante | `apps/resto` | `https://lapan.com.ar` | `/` |
| Almacén | `apps/almacen` | `https://almacen.lapan.com.ar` | `/almacen/` |

```
lapan/
├─ apps/resto/              ← sitio del restaurante
├─ apps/almacen/            ← sitio del almacén
├─ public/img/              ← imágenes COMPARTIDAS (logos SVG + fotos .webp)
├─ shared/
│  ├─ config.mjs            ← ÚNICO lugar de las URLs cruzadas (RESTO_URL / ALMACEN_URL)
│  ├─ negocio.mjs           ← datos reales del negocio (horarios, WhatsApp, puntajes…)
│  ├─ tokens.css            ← paleta y tipografías
│  ├─ base.css              ← botones, guarda de azulejo, animaciones
│  ├─ animaciones.ts        ← entradas al hacer scroll, contadores, parallax
│  └─ components/           ← Foto, Icono, Guarda, Seo, WhatsAppFlotante…
├─ originales/              ← fotos y logos tal como los mandó el cliente (no se publican)
├─ scripts/                 ← optimizar fotos, build, preview, capturas, accesibilidad
└─ .github/workflows/deploy.yml
```

## Desarrollo local

Necesitás Node 22+ y pnpm.

```bash
pnpm install
pnpm dev            # restaurante → http://localhost:4321/
pnpm dev:almacen    # almacén     → http://localhost:4321/almacen/

pnpm build          # arma dist/ con los dos sitios juntos (resto en /, almacén en /almacen/)
pnpm preview        # sirve dist/ → http://localhost:4321/
```

Otros comandos:

- `pnpm fotos`: regenera las `.webp` de `public/img/fotos/` a partir de `originales/fotos/`. Para sumar una foto nueva, agregala al mapa `FOTOS` de `scripts/optimizar-fotos.mjs`.
- `pnpm capturas`: capturas a 375 px y 1440 px de las dos páginas, guardadas en `capturas/`. Requiere tener `pnpm preview` corriendo.
- `pnpm accesibilidad`: auditoría WCAG AA con axe-core. También requiere `pnpm preview` corriendo.

## URLs cruzadas

Se configuran **solo** en [`shared/config.mjs`](shared/config.mjs) y se eligen con variables de entorno en el build:

| Variable | Valores | Efecto |
|---|---|---|
| `SITE_MODE` | `demo` (por defecto) · `production` | demo: `RESTO_URL=<base>`, `ALMACEN_URL=<base>almacen/`. Producción: los dominios reales |
| `DEMO_BASE` | `/` (por defecto) · `/<repo>/` | Ruta base de la demo (GitHub Pages la necesita) |
| `DEMO_ORIGIN` | ej. `https://usuario.github.io` | Para las URLs absolutas de Open Graph |

---

## Publicar la demo en GitHub Pages

1. Creá un repositorio en GitHub (ej. `lapan`) y subí este proyecto:
   ```bash
   git init
   git add .
   git commit -m "Demo Lapan"
   git branch -M main
   git remote add origin https://github.com/<usuario>/lapan.git
   git push -u origin main
   ```
2. En el repo, entrá a **Settings → Pages → Build and deployment → Source** y elegí **GitHub Actions**.
3. Listo: cada `push` a `main` corre `.github/workflows/deploy.yml` y publica:
   - Restaurante: `https://<usuario>.github.io/lapan/`
   - Almacén: `https://<usuario>.github.io/lapan/almacen/`

   El workflow calcula solo la ruta base a partir del nombre del repo. Si el repo se llama `<usuario>.github.io`, la demo queda en la raíz.

## Pasar a producción con los dominios del cliente

GitHub Pages admite **un sitio por repositorio**. Por eso el almacén se publica en un segundo repo, y el mismo workflow se encarga de las dos cosas.

1. **Repo del almacén.** Creá un repo vacío, por ejemplo `<usuario>/lapan-almacen`, con un primer commit (aunque sea un README).
2. **Token.** Creá un *fine-grained personal access token* con permiso **Contents: Read and write** solo sobre `lapan-almacen`. En el repo principal, guardalo en **Settings → Secrets and variables → Actions → Secrets** como `ALMACEN_TOKEN`.
3. **Variables.** En el repo principal, **Settings → Secrets and variables → Actions → Variables**:
   - `SITE_MODE` = `production`
   - `ALMACEN_REPO` = `<usuario>/lapan-almacen`
4. **Correr el deploy.** Hacé un push o corré el workflow a mano (pestaña **Actions → Deploy a GitHub Pages → Run workflow**). Esto:
   - publica `dist/resto` en el Pages del repo principal;
   - empuja `dist/almacen` a la rama `gh-pages` de `lapan-almacen`, con `CNAME` = `almacen.lapan.com.ar`.
5. **Pages del almacén.** En `lapan-almacen`: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.
6. **Dominios.**
   - Repo principal: **Settings → Pages → Custom domain** = `lapan.com.ar`, y activá **Enforce HTTPS**.
   - Repo `lapan-almacen`: **Custom domain** = `almacen.lapan.com.ar`, y activá **Enforce HTTPS**.
7. **DNS** (en el proveedor del dominio `lapan.com.ar`, por ejemplo NIC Argentina + el DNS que usen):

   | Tipo | Nombre | Valor |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<usuario>.github.io` |
   | CNAME | `almacen` | `<usuario>.github.io` |

   GitHub sabe a qué repo mandar cada subdominio por el *Custom domain* configurado en cada uno. Si querés, verificá el dominio en **Settings → Pages** de tu cuenta para que nadie más pueda reclamarlo.

Para probar el build de producción en local: `pnpm build:produccion` arma `dist/resto/` y `dist/almacen/`, cada uno con su `CNAME`.

---

## Pendientes para confirmar con el cliente

Están marcados en el código con `TODO`:

- **Fotos que faltan:** almuerzos, cenas, panes sin gluten, hierbas y hebras, huevos y productos de almacén. Mientras tanto se muestran bloques de color (`<!-- TODO: foto -->`).
- Horario de cada momento del día (desayuno, brunch, etc.).
- Fechas exactas del horario de invierno (el indicador "Abierto ahora" asume del 21/6 al 21/9).
- Qué trae cada box y con cuánta anticipación se encarga.
- Dirección del almacén, formas de pago y zona o costo de delivery.
- Surtido del almacén y si hay lista de precios.
- Que los puntajes de Google y Tripadvisor estén al día antes de publicar.

## Accesibilidad y rendimiento

- Contraste WCAG AA verificado con axe-core (0 violaciones a 375 px y 1440 px), `alt` en todas las fotos, foco visible y enlace "Saltar al contenido".
- Las animaciones se apagan con `prefers-reduced-motion`. Si JavaScript no carga, el contenido se ve igual.
- Fotos en `.webp` de 600 y 1200 px con `srcset`: pasan de unos 30 MB a 1,9 MB.
