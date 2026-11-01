// Animaciones compartidas: entradas al hacer scroll, contadores, parallax suave.
// Todo respeta prefers-reduced-motion.

const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Entradas al hacer scroll ([data-reveal]) y guardas que corren */
const io = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        if (!(e.target as HTMLElement).hasAttribute('data-guarda')) io.unobserve(e.target);
      } else if ((e.target as HTMLElement).hasAttribute('data-guarda')) {
        e.target.classList.remove('is-visible');
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);
document.querySelectorAll('[data-reveal], [data-guarda]').forEach((el) => io.observe(el));

/* Respaldo: si un scroll muy rápido (o un salto con un link) pasa por encima de un
   elemento sin que el observer lo vea, lo mostramos igual. */
let pendientes = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
let programado = false;
const revisar = () => {
  programado = false;
  const limite = innerHeight * 0.95;
  pendientes = pendientes.filter((el) => {
    if (el.classList.contains('is-visible')) return false;
    if (el.getBoundingClientRect().top < limite) { el.classList.add('is-visible'); io.unobserve(el); return false; }
    return true;
  });
  if (!pendientes.length) removeEventListener('scroll', alScroll);
};
const alScroll = () => { if (!programado) { programado = true; setTimeout(revisar, 120); } };
addEventListener('scroll', alScroll, { passive: true });

/* Escalonado automático: hijos directos de [data-stagger] */
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((grupo) => {
  [...grupo.children].forEach((hijo, i) => (hijo as HTMLElement).style.setProperty('--i', String(i)));
});

/* 2. Contadores: <span data-contar="4.6" data-decimales="1" data-sufijo=" mil"> */
const formato = (n: number, dec: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

const ioContar = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      ioContar.unobserve(e.target);
      const el = e.target as HTMLElement;
      const fin = parseFloat(el.dataset.contar!);
      const dec = parseInt(el.dataset.decimales ?? '0', 10);
      if (reducir) { el.textContent = formato(fin, dec); continue; }
      const dur = 1600;
      const t0 = performance.now();
      const paso = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = formato(fin * ease, dec);
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    }
  },
  { threshold: 0.6 },
);
document.querySelectorAll('[data-contar]').forEach((el) => ioContar.observe(el));

/* 3. Parallax suave: [data-parallax="0.08"] */
if (!reducir) {
  const capas = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (capas.length) {
    let pendiente = false;
    const actualizar = () => {
      pendiente = false;
      const vh = window.innerHeight;
      for (const c of capas) {
        const r = c.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const v = parseFloat(c.dataset.parallax || '0.08');
        const centro = r.top + r.height / 2 - vh / 2;
        c.style.setProperty('--py', `${(-centro * v).toFixed(1)}px`);
      }
    };
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
    actualizar();
  }
}

/* 4. Inclinación 3D suave al pasar el mouse: [data-tilt] (solo con mouse) */
if (!reducir && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}
