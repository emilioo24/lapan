import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CATEGORIAS, PRODUCTOS, ENVIO, type Producto } from './catalogo';
import {
  ars, fotoUrl, carrito, carritoListo, cargarCarrito, agregar, cambiarCantidad, cantidadTotal, subtotal,
  cantidadDe, costoEnvio, aviso, entregaInmediata,
} from './estado';
import { Icono } from './Icono';

type Props = { base: string; checkoutUrl: string };

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* ─────────────────────────── Tienda ─────────────────────────── */
export default function Tienda({ base, checkoutUrl }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState<Producto | null>(null);
  const [verCarrito, setVerCarrito] = useState(false);
  const [activa, setActiva] = useState(CATEGORIAS[0].id);
  const [repartiendo, setRepartiendo] = useState<boolean | null>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarCarrito();
    setRepartiendo(entregaInmediata());
    // Si llegamos con #cat-xxx (desde las tarjetas de la home), bajamos a esa categoría
    const id = location.hash.replace('#cat-', '');
    if (id && CATEGORIAS.some((c) => c.id === id)) {
      setTimeout(() => document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth' }), 250);
    }
  }, []);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return PRODUCTOS;
    return PRODUCTOS.filter((p) => normalizar([p.nombre, p.descripcion, ...(p.etiquetas ?? [])].join(' ')).includes(q));
  }, [busqueda]);

  const categoriasVisibles = CATEGORIAS.filter((c) => filtrados.some((p) => p.categoria === c.id));

  // Chip activo según la categoría visible
  useEffect(() => {
    const io = new IntersectionObserver((ents) => {
      for (const e of ents) if (e.isIntersecting) setActiva(e.target.id.replace('cat-', ''));
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('[data-categoria]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [categoriasVisibles.length]);

  useEffect(() => {
    const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-chip="${activa}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activa]);

  const destacados = PRODUCTOS.filter((p) => p.destacado);

  return (
    <>
      {/* Cabecera de la tienda */}
      <section class="bg-salvia pt-24 pb-8 sm:pt-28">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <a href={base} class="inline-flex items-center gap-1.5 text-sm font-medium text-oliva-2 hover:underline">
            <Icono n="volver" class="size-4" /> Inicio del almacén
          </a>
          <h1 class="mt-3 font-display text-4xl font-extrabold text-oliva-2 sm:text-5xl">
            Hacé tu <em class="text-oliva">pedido</em>
          </h1>
          <ul class="mt-4 flex flex-wrap gap-2 text-sm">
            <li class="chip bg-crema-alm !py-1.5 font-medium text-oliva-2 ring-1 ring-oliva/15">
              <span class={`size-2 rounded-full ${repartiendo === null ? 'bg-oliva/40' : repartiendo ? 'bg-[#2f8a3c] animate-pulse' : 'bg-[#b5832b]'}`} />
              {repartiendo === null ? 'Delivery Lun a Sáb' : repartiendo ? 'Repartiendo ahora' : 'Programá tu entrega'}
            </li>
            <li class="chip bg-crema-alm !py-1.5 font-medium text-oliva-2 ring-1 ring-oliva/15"><Icono n="reloj" class="size-4" /> 9–13 y 16–20 h</li>
            <li class="chip bg-crema-alm !py-1.5 font-medium text-oliva-2 ring-1 ring-oliva/15"><Icono n="moto" class="size-4" /> Envío {ars(ENVIO.costo)} · gratis desde {ars(ENVIO.gratisDesde)}</li>
          </ul>
        </div>
      </section>

      {/* Buscador + categorías (fijos al scrollear) */}
      <div class="sticky top-[60px] z-30 border-b border-oliva/10 bg-crema-alm/95 backdrop-blur-md sm:top-[66px]">
        <div class="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
          <label class="relative block lg:max-w-[calc(100%-404px)]">
            <span class="sr-only">Buscar productos</span>
            <span class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-oliva"><Icono n="buscar" class="size-5" /></span>
            <input
              type="search" value={busqueda} onInput={(e) => setBusqueda((e.target as HTMLInputElement).value)}
              placeholder="Buscá pan, hibisco, huevos…"
              class="h-12 w-full rounded-full border-0 bg-white pr-4 pl-12 text-oliva-2 ring-1 ring-oliva/20 placeholder:text-oliva-2/50 focus:ring-2 focus:ring-oliva focus:outline-none"
            />
          </label>
          <div ref={chipsRef} class="chips-tienda -mx-4 flex gap-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-0" role="navigation" aria-label="Categorías">
            {categoriasVisibles.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`} data-chip={c.id} aria-current={activa === c.id ? 'true' : undefined}
                 class={`chip shrink-0 !py-2 text-sm font-bold whitespace-nowrap transition-colors ${activa === c.id ? 'bg-oliva text-white' : 'bg-white text-oliva-2 ring-1 ring-oliva/15 hover:bg-salvia/60'}`}>
                <Icono n={c.icono} class="size-4" /> {c.nombre}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:px-8 lg:pb-20">
        <div>
          {/* Los más pedidos */}
          {!busqueda && (
            <section class="pt-8" aria-labelledby="t-destacados">
              <h2 id="t-destacados" class="flex items-center gap-2 font-display text-2xl font-extrabold text-oliva-2">
                <Icono n="brillo" class="size-5 text-fucsia" /> Los más pedidos
              </h2>
              <ul class="chips-tienda -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                {destacados.map((p) => (
                  <li key={p.id} class="w-40 shrink-0 snap-start sm:w-44">
                    <button type="button" onClick={() => setAbierto(p)}
                            class="group w-full overflow-hidden rounded-[20px] bg-white text-left ring-1 ring-oliva/10 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(62,71,34,.6)]">
                      <Miniatura p={p} base={base} class="aspect-square w-full" grande />
                      <div class="p-3">
                        <p class="line-clamp-1 font-bold text-oliva-2">{p.nombre}</p>
                        <p class="text-sm text-oliva-2/80">{p.variantes ? 'Desde ' : ''}{ars(p.precio)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Categorías */}
          {categoriasVisibles.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} data-categoria class="scroll-mt-44 pt-10" aria-labelledby={`t-${c.id}`}>
              <div class="flex items-baseline justify-between gap-3">
                <h2 id={`t-${c.id}`} class="font-display text-2xl font-extrabold text-oliva-2">{c.nombre}</h2>
                <span class="rounded-full bg-oliva/10 px-2.5 py-0.5 text-xs font-bold text-oliva">{c.etiqueta}</span>
              </div>
              <ul class="mt-4 grid gap-3 md:grid-cols-2">
                {filtrados.filter((p) => p.categoria === c.id).map((p) => (
                  <li key={p.id}><TarjetaProducto p={p} base={base} onAbrir={() => setAbierto(p)} /></li>
                ))}
              </ul>
            </section>
          ))}

          {!categoriasVisibles.length && (
            <div class="mt-12 rounded-[22px] bg-white p-10 text-center ring-1 ring-oliva/10">
              <p class="font-display text-2xl font-bold text-oliva-2">No encontramos “{busqueda}”</p>
              <p class="mt-2 text-oliva-2/85">Probá con otra palabra o mirá todas las categorías.</p>
              <button type="button" class="btn btn-oliva mt-6" onClick={() => setBusqueda('')}>Ver todo</button>
            </div>
          )}
          <p class="mt-10 flex items-start gap-2 text-sm text-oliva-2/85">
            <Icono n="info" class="mt-0.5 size-4 shrink-0" /> Demo: productos y precios de ejemplo. No se realiza ningún cobro.
          </p>
        </div>

        {/* Carrito lateral (desktop) */}
        <aside class="hidden lg:block" aria-label="Tu pedido">
          <div class="sticky top-[200px] mt-8 rounded-[22px] bg-white ring-1 ring-oliva/10 shadow-[0_20px_40px_-30px_rgba(62,71,34,.5)]">
            <PanelCarrito base={base} checkoutUrl={checkoutUrl} />
          </div>
        </aside>
      </div>

      <BarraCarrito onAbrir={() => setVerCarrito(true)} />
      <Hoja abierta={verCarrito} onCerrar={() => setVerCarrito(false)} titulo="Tu pedido">
        <PanelCarrito base={base} checkoutUrl={checkoutUrl} enHoja onCerrar={() => setVerCarrito(false)} />
      </Hoja>
      <ModalProducto p={abierto} base={base} onCerrar={() => setAbierto(null)} />
      <Aviso />
    </>
  );
}

/* ─────────────────────────── Piezas ─────────────────────────── */

function Miniatura({ p, base, class: clase = '', grande = false }: { p: Pick<Producto, 'foto' | 'alt' | 'icono' | 'fondo' | 'nombre'>; base: string; class?: string; grande?: boolean }) {
  if (p.foto) {
    return (
      <div class={`overflow-hidden bg-crema-alm ${clase}`}>
        <img src={fotoUrl(base, p.foto, 600)} alt={p.alt ?? p.nombre} loading="lazy" decoding="async"
             class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
    );
  }
  // TODO: foto (bloque de color mientras tanto)
  return (
    <div class={`grid place-items-center ${clase}`} style={{ background: p.fondo }} role="img" aria-label={`${p.nombre} (foto a confirmar)`}>
      <span class="text-oliva/80"><Icono n={p.icono} class={grande ? 'size-12' : 'size-9'} /></span>
    </div>
  );
}

function TarjetaProducto({ p, base, onAbrir }: { p: Producto; base: string; onAbrir: () => void }) {
  const cant = carritoListo.value ? cantidadDe(p.id) : 0;
  return (
    <button type="button" onClick={onAbrir} aria-label={`${p.nombre}, ${p.variantes ? 'desde ' : ''}${ars(p.precio)}${cant ? `, ${cant} en tu pedido` : ''}`}
            class="tarjeta-producto group flex h-full w-full gap-4 rounded-[20px] bg-white p-3.5 text-left ring-1 ring-oliva/10 transition hover:ring-oliva/30 hover:shadow-[0_16px_30px_-22px_rgba(62,71,34,.6)] sm:p-4">
      <div class="flex min-w-0 flex-1 flex-col">
        <h3 class="font-display text-lg leading-snug font-semibold text-oliva-2">{p.nombre}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-oliva-2/85">{p.descripcion}</p>
        <div class="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <span class="font-bold text-oliva-2">{p.variantes ? <span class="text-sm font-medium">Desde </span> : null}{ars(p.precio)}</span>
          {p.etiquetas?.includes('Sin gluten') && <span class="rounded-full bg-[#E3F0E9] px-2 py-0.5 text-xs font-bold text-[#1d5a37]">Sin gluten</span>}
        </div>
      </div>
      <div class="relative shrink-0">
        <Miniatura p={p} base={base} class="size-24 rounded-2xl sm:size-28" />
        <span class={`absolute -right-1.5 -bottom-1.5 grid size-9 place-items-center rounded-full shadow-md ring-2 ring-white transition-transform group-hover:scale-110 ${cant ? 'bg-oliva text-white' : 'bg-white text-oliva'}`} aria-hidden="true">
          {cant ? <span class="text-sm font-bold">{cant}</span> : <Icono n="mas" class="size-5" />}
        </span>
      </div>
    </button>
  );
}

/** Diálogo nativo: foco atrapado, Escape y fondo gratis. En el celular se ve como hoja que sube. */
export function Hoja({ abierta, onCerrar, titulo, children, ancho = 'sm:max-w-lg' }: { abierta: boolean; onCerrar: () => void; titulo: string; children: any; ancho?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);
  return (
    <dialog ref={ref} class={`hoja ${ancho}`} aria-label={titulo} onClose={onCerrar}
            onClick={(e) => { if (e.target === ref.current) onCerrar(); }}>
      {abierta && children}
    </dialog>
  );
}

function ModalProducto({ p, base, onCerrar }: { p: Producto | null; base: string; onCerrar: () => void }) {
  const [varId, setVarId] = useState<string | undefined>();
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState('');
  useEffect(() => { setVarId(p?.variantes?.[0].id); setCantidad(1); setNota(''); }, [p]);

  const v = p?.variantes?.find((x) => x.id === varId);
  const unitario = v?.precio ?? p?.precio ?? 0;

  return (
    <Hoja abierta={!!p} onCerrar={onCerrar} titulo={p?.nombre ?? 'Producto'}>
      {p && (
        <form method="dialog" class="flex max-h-[92dvh] flex-col"
              onSubmit={(e) => { e.preventDefault(); agregar(p, v, cantidad, nota); onCerrar(); }}>
          <div class="overflow-y-auto">
            <div class="relative">
              <Miniatura p={p} base={base} class="aspect-[16/10] w-full" grande />
              <button type="button" onClick={onCerrar} aria-label="Cerrar"
                      class="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/95 text-oliva-2 shadow-md hover:bg-white">
                <Icono n="cerrar" class="size-5" />
              </button>
            </div>
            <div class="p-5 sm:p-6">
              <div class="flex flex-wrap gap-1.5">
                {p.etiquetas?.map((t) => <span key={t} class="rounded-full bg-salvia px-2.5 py-0.5 text-xs font-bold text-oliva-2">{t}</span>)}
              </div>
              <h2 class="mt-2 font-display text-3xl font-extrabold text-oliva-2">{p.nombre}</h2>
              <p class="mt-2 text-oliva-2/80">{p.descripcion}</p>

              {p.variantes && (
                <fieldset class="mt-6">
                  <legend class="flex w-full items-center justify-between text-sm font-bold tracking-wide text-oliva-2 uppercase">
                    Elegí la presentación <span class="rounded-full bg-oliva/10 px-2 py-0.5 text-[11px] text-oliva normal-case">Obligatorio</span>
                  </legend>
                  <div class="mt-3 grid gap-2">
                    {p.variantes.map((x) => (
                      <label key={x.id} class={`opcion flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 ring-1 transition ${varId === x.id ? 'bg-salvia/50 ring-2 ring-oliva' : 'bg-crema-alm ring-oliva/15 hover:ring-oliva/40'}`}>
                        <span class="flex items-center gap-3">
                          <input type="radio" name="variante" value={x.id} checked={varId === x.id} onChange={() => setVarId(x.id)} class="size-5 accent-[#55602F]" />
                          <span class="font-medium text-oliva-2">{x.nombre}</span>
                        </span>
                        <span class="font-bold text-oliva-2">{ars(x.precio)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <label class="mt-6 block">
                <span class="text-sm font-bold tracking-wide text-oliva-2 uppercase">¿Alguna aclaración?</span>
                <textarea value={nota} onInput={(e) => setNota((e.target as HTMLTextAreaElement).value)} maxLength={140} rows={2}
                          placeholder="Ej: cortado en rodajas, para regalo…"
                          class="mt-2 w-full resize-none rounded-2xl border-0 bg-crema-alm px-4 py-3 text-oliva-2 ring-1 ring-oliva/15 placeholder:text-oliva-2/45 focus:ring-2 focus:ring-oliva focus:outline-none" />
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3 border-t border-oliva/10 bg-white p-4 sm:px-6">
            <Contador valor={cantidad} min={1} onCambio={setCantidad} etiqueta={p.nombre} />
            <button type="submit" class="btn btn-oliva flex-1 justify-between !px-5">
              <span>Agregar</span><span>{ars(unitario * cantidad)}</span>
            </button>
          </div>
        </form>
      )}
    </Hoja>
  );
}

export function Contador({ valor, onCambio, min = 0, etiqueta, chico = false }: { valor: number; onCambio: (n: number) => void; min?: number; etiqueta: string; chico?: boolean }) {
  const t = chico ? 'size-8' : 'size-11';
  return (
    <div class="flex items-center rounded-full bg-crema-alm ring-1 ring-oliva/15" role="group" aria-label={`Cantidad de ${etiqueta}`}>
      <button type="button" class={`grid ${t} place-items-center rounded-full text-oliva-2 hover:bg-salvia/60 disabled:opacity-35`}
              onClick={() => onCambio(valor - 1)} disabled={valor <= min} aria-label="Restar uno">
        <Icono n={valor === 1 && min === 0 ? 'basura' : 'menos'} class="size-4" />
      </button>
      <span class={`${chico ? 'w-6 text-sm' : 'w-8'} text-center font-bold text-oliva-2 tabular-nums`} aria-live="polite">{valor}</span>
      <button type="button" class={`grid ${t} place-items-center rounded-full text-oliva-2 hover:bg-salvia/60`}
              onClick={() => onCambio(valor + 1)} aria-label="Sumar uno">
        <Icono n="mas" class="size-4" />
      </button>
    </div>
  );
}

export function PanelCarrito({ base, checkoutUrl, enHoja = false, onCerrar }: { base: string; checkoutUrl: string; enHoja?: boolean; onCerrar?: () => void }) {
  const items = carrito.value;
  const sub = subtotal.value;
  const envio = costoEnvio(sub);
  const falta = Math.max(0, ENVIO.gratisDesde - sub);

  return (
    <div class={`flex flex-col ${enHoja ? 'max-h-[88dvh]' : 'max-h-[calc(100dvh-230px)]'}`}>
      <div class="flex items-center justify-between border-b border-oliva/10 px-5 py-4">
        <h2 class="flex items-center gap-2 font-display text-2xl font-extrabold text-oliva-2">
          <Icono n="bolsa" class="size-5 text-oliva" /> Tu pedido
        </h2>
        {enHoja && (
          <button type="button" onClick={onCerrar} aria-label="Cerrar" class="grid size-10 place-items-center rounded-full bg-crema-alm text-oliva-2">
            <Icono n="cerrar" class="size-5" />
          </button>
        )}
      </div>

      {!items.length ? (
        <div class="px-6 py-10 text-center">
          <span class="mx-auto grid size-16 place-items-center rounded-full bg-salvia text-oliva"><Icono n="canasta" class="size-8" /></span>
          <p class="mt-4 font-display text-xl font-bold text-oliva-2">Todavía no agregaste nada</p>
          <p class="mt-1 text-sm text-oliva-2/85">Elegí algo rico del almacén y aparece acá.</p>
        </div>
      ) : (
        <>
          <ul class="flex-1 divide-y divide-oliva/10 overflow-y-auto px-5">
            {items.map((it) => (
              <li key={it.clave} class="item-carrito flex gap-3 py-4">
                <Miniatura p={{ ...it, alt: it.nombre }} base={base} class="size-14 shrink-0 rounded-xl" />
                <div class="min-w-0 flex-1">
                  <p class="font-bold leading-tight text-oliva-2">{it.nombre}</p>
                  {it.variante && <p class="text-sm text-oliva-2/85">{it.variante}</p>}
                  {it.nota && <p class="mt-0.5 line-clamp-1 text-xs text-oliva-2/85 italic">“{it.nota}”</p>}
                  <div class="mt-2 flex items-center justify-between gap-2">
                    <Contador chico valor={it.cantidad} onCambio={(n) => cambiarCantidad(it.clave, n - it.cantidad)} etiqueta={it.nombre} />
                    <span class="font-bold text-oliva-2 tabular-nums">{ars(it.precio * it.cantidad)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div class="border-t border-oliva/10 px-5 pt-4 pb-5">
            {falta > 0 ? (
              <div class="mb-4 rounded-2xl bg-crema-alm p-3">
                <p class="text-sm text-oliva-2">Te faltan <strong>{ars(falta)}</strong> para el <strong>envío gratis</strong></p>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-oliva/15">
                  <div class="h-full rounded-full bg-oliva transition-[width] duration-500" style={{ width: `${Math.min(100, (sub / ENVIO.gratisDesde) * 100)}%` }} />
                </div>
              </div>
            ) : (
              <p class="mb-4 flex items-center gap-2 rounded-2xl bg-[#E3F0E9] p-3 text-sm font-bold text-[#1d5a37]"><Icono n="checkCirculo" class="size-4" /> ¡Tenés envío gratis!</p>
            )}
            <dl class="grid gap-1.5 text-oliva-2">
              <div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">{ars(sub)}</dd></div>
              <div class="flex justify-between"><dt>Envío</dt><dd class="tabular-nums">{envio ? ars(envio) : 'Gratis'}</dd></div>
              <div class="mt-1 flex justify-between text-lg font-extrabold"><dt>Total</dt><dd class="tabular-nums">{ars(sub + envio)}</dd></div>
            </dl>
            <a href={checkoutUrl} class="btn btn-oliva mt-4 w-full justify-between !px-5">
              <span>Continuar</span><Icono n="derecha" class="flecha size-5" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function BarraCarrito({ onAbrir }: { onAbrir: () => void }) {
  const n = carritoListo.value ? cantidadTotal.value : 0;
  if (!n) return null;
  return (
    <div class="barra-carrito fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <button type="button" onClick={onAbrir}
              class="flex w-full items-center gap-3 rounded-2xl bg-oliva px-4 py-3.5 text-white shadow-[0_16px_34px_-12px_rgba(62,71,34,.8)]">
        <span key={n} class="contador-salto grid size-8 place-items-center rounded-full bg-salvia text-sm font-extrabold text-oliva-2">{n}</span>
        <span class="flex-1 text-left font-bold">Ver mi pedido</span>
        <span class="font-bold tabular-nums">{ars(subtotal.value)}</span>
      </button>
    </div>
  );
}

export function Aviso() {
  const a = aviso.value;
  return (
    <div class="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4" aria-live="polite">
      {a && (
        <p key={a.id} class="aviso flex items-center gap-2 rounded-full bg-oliva-2 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <span class="grid size-5 place-items-center rounded-full bg-salvia text-oliva-2"><Icono n="check" class="size-3.5" /></span>
          Agregaste {a.texto}
        </p>
      )}
    </div>
  );
}
