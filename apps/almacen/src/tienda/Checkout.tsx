import { useEffect, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { ENVIO, FRANJAS, PAGOS, ALIAS_DEMO } from './catalogo';
import {
  ars, carrito, carritoListo, cargarCarrito, subtotal, costoEnvio, cambiarCantidad, vaciar, ahoraAR,
  entregaInmediata, proximosDias, guardarPedido, nuevoNumero, leerDatos, guardarDatos, olvidarDatos,
  type Pedido, type DatosGuardados,
} from './estado';
import { Icono } from './Icono';
import { Contador } from './Tienda';

type Props = { base: string; tiendaUrl: string; seguimientoUrl: string };
type Errores = Partial<Record<'nombre' | 'telefono' | 'calle' | 'cuando' | 'pago' | 'pagaCon', string>>;

const vacio: DatosGuardados = { nombre: '', telefono: '', calle: '', depto: '', barrio: '', referencias: '' };

/** El almacén atiende Lun a Sáb de 9 a 20:30: ¿se puede retirar en media hora? */
const retiroInmediato = () => {
  const d = ahoraAR(); const h = d.getHours() + d.getMinutes() / 60;
  return d.getDay() !== 0 && h >= 9 && h <= 20;
};

export default function Checkout({ base, tiendaUrl, seguimientoUrl }: Props) {
  const [tipo, setTipo] = useState<'delivery' | 'retiro'>('delivery');
  const [cuando, setCuando] = useState<'ya' | 'programado'>('ya');
  const [dia, setDia] = useState<string>('');
  const [franja, setFranja] = useState<string>('');
  const [datos, setDatos] = useState<DatosGuardados>(vacio);
  const [recordar, setRecordar] = useState(true);
  const [pago, setPago] = useState<string>('');
  const [pagaCon, setPagaCon] = useState('');
  const [notas, setNotas] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<'idle' | 'pagando' | 'enviando'>('idle');

  useEffect(() => {
    cargarCarrito();
    setDatos({ ...vacio, ...leerDatos() });
  }, []);

  const dias = useMemo(() => proximosDias(6), []);
  const inmediata = tipo === 'delivery' ? entregaInmediata() : retiroInmediato();
  useEffect(() => { if (!inmediata) setCuando('programado'); }, [inmediata]);
  const diaSel = dias.find((d) => d.id === dia);

  const items = carrito.value;
  const sub = subtotal.value;
  const envio = costoEnvio(sub, tipo);
  const total = sub + envio;

  const set = (k: keyof DatosGuardados) => (e: JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDatos({ ...datos, [k]: e.currentTarget.value });

  if (!carritoListo.value) return <div class="min-h-[60vh]" />;

  if (!items.length && estado === 'idle') {
    return (
      <div class="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
        <span class="mx-auto grid size-20 place-items-center rounded-full bg-salvia text-oliva"><Icono n="bolsa" class="size-9" /></span>
        <h1 class="mt-6 font-display text-4xl font-extrabold text-oliva-2">Tu pedido está vacío</h1>
        <p class="mt-3 text-lg text-oliva-2/80">Elegí lo que quieras del almacén y volvé para terminar.</p>
        <a href={tiendaUrl} class="btn btn-oliva mt-8">Ir a la tienda <Icono n="derecha" class="flecha size-5" /></a>
      </div>
    );
  }

  function validar(): Errores {
    const e: Errores = {};
    if (datos.nombre.trim().length < 2) e.nombre = 'Contanos tu nombre.';
    if (datos.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Necesitamos un teléfono válido por si hay que avisarte algo.';
    if (tipo === 'delivery' && !(/\d/.test(datos.calle) && datos.calle.trim().length >= 4)) e.calle = 'Escribí la calle y el número.';
    if (cuando === 'programado' && (!dia || !franja)) e.cuando = 'Elegí el día y la franja horaria.';
    if (!pago) e.pago = 'Elegí cómo vas a pagar.';
    if (pago === 'efectivo' && pagaCon && Number(pagaCon) < total) e.pagaCon = `Tiene que ser igual o mayor a ${ars(total)}.`;
    return e;
  }

  function confirmar(ev: Event) {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) {
      const primero = document.querySelector<HTMLElement>(`[data-campo="${Object.keys(e)[0]}"]`);
      primero?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primero?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true });
      return;
    }
    const f = FRANJAS.find((x) => x.id === franja);
    const pedido: Pedido = {
      numero: nuevoNumero(),
      creado: Date.now(),
      items, subtotal: sub, envio, total,
      entrega: {
        tipo,
        direccion: tipo === 'delivery' ? [datos.calle, datos.depto, datos.barrio].filter(Boolean).join(', ') + ' · Paraná' : undefined,
        referencias: tipo === 'delivery' ? datos.referencias || undefined : undefined,
        cuando: cuando === 'ya'
          ? (tipo === 'delivery' ? 'Lo antes posible (45–60 min)' : 'Listo en 30 min')
          : `${diaSel?.titulo} ${diaSel?.sub} · ${f?.texto}`,
      },
      cliente: { nombre: datos.nombre.trim(), telefono: datos.telefono.trim() },
      pago: { metodo: pago, nombre: PAGOS.find((p) => p.id === pago)!.nombre, pagaCon: pagaCon ? Number(pagaCon) : undefined },
      notas: notas.trim() || undefined,
    };
    recordar ? guardarDatos(datos) : olvidarDatos();
    setEstado(pago === 'mercadopago' ? 'pagando' : 'enviando');
    // DEMO: simulamos el pago y el envío del pedido. En producción acá va la llamada al backend.
    setTimeout(() => {
      guardarPedido(pedido);
      vaciar();
      location.href = seguimientoUrl;
    }, pago === 'mercadopago' ? 2600 : 1400);
  }

  return (
    <>
      <div class="mx-auto max-w-6xl px-4 pt-24 pb-40 sm:px-6 sm:pt-28 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8 lg:px-8 lg:pb-20">
        <form id="form-checkout" noValidate onSubmit={confirmar} class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          <div>
            <a href={tiendaUrl} class="inline-flex items-center gap-1.5 text-sm font-medium text-oliva-2 hover:underline">
              <Icono n="volver" class="size-4" /> Seguir comprando
            </a>
            <h1 class="mt-3 font-display text-4xl font-extrabold text-oliva-2 sm:text-5xl">Finalizá tu <em class="text-oliva">pedido</em></h1>
          </div>

          {/* 1. Entrega */}
          <Seccion n={1} titulo="¿Cómo lo recibís?">
            <div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Forma de entrega">
              {([
                { id: 'delivery', titulo: 'Delivery', sub: sub >= ENVIO.gratisDesde ? 'Envío gratis' : `Envío ${ars(ENVIO.costo)}`, icono: 'moto' },
                { id: 'retiro', titulo: 'Retiro', sub: 'Sin cargo', icono: 'tienda' },
              ] as const).map((o) => (
                <button type="button" key={o.id} role="radio" aria-checked={tipo === o.id} onClick={() => setTipo(o.id)}
                        class={`flex flex-col items-start gap-2 rounded-2xl p-4 text-left ring-1 transition ${tipo === o.id ? 'bg-salvia/50 ring-2 ring-oliva' : 'bg-crema-alm ring-oliva/15 hover:ring-oliva/40'}`}>
                  <span class={`grid size-10 place-items-center rounded-xl ${tipo === o.id ? 'bg-oliva text-white' : 'bg-white text-oliva'}`}><Icono n={o.icono} class="size-5" /></span>
                  <span class="font-bold text-oliva-2">{o.titulo}</span>
                  <span class="-mt-1.5 text-sm text-oliva-2/85">{o.sub}</span>
                </button>
              ))}
            </div>
          </Seccion>

          {/* 2. Dirección */}
          <Seccion n={2} titulo={tipo === 'delivery' ? '¿Dónde te lo llevamos?' : '¿Dónde lo retirás?'}>
            {tipo === 'delivery' ? (
              <div class="grid gap-4 sm:grid-cols-2">
                <Campo campo="calle" etiqueta="Calle y número" error={errores.calle} class="sm:col-span-2"
                       value={datos.calle} onInput={set('calle')} autoComplete="street-address" placeholder="Ej: Urquiza 1234" />
                <Campo campo="depto" etiqueta="Piso / depto" opcional value={datos.depto} onInput={set('depto')} autoComplete="address-line2" placeholder="Ej: 2° B" />
                <Campo campo="barrio" etiqueta="Barrio" opcional value={datos.barrio} onInput={set('barrio')} placeholder="Ej: Centro" />
                <Campo campo="referencias" etiqueta="Referencias para el repartidor" opcional class="sm:col-span-2"
                       value={datos.referencias} onInput={set('referencias')} placeholder="Ej: portón verde, timbre 3" />
                <p class="flex items-center gap-2 text-sm text-oliva-2/85 sm:col-span-2"><Icono n="pin" class="size-4" /> Entregamos en Paraná, Entre Ríos.</p>
                {/* TODO: confirmar con el cliente la zona de cobertura del delivery */}
              </div>
            ) : (
              <div class="flex gap-4 rounded-2xl bg-crema-alm p-4">
                <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-oliva text-white"><Icono n="tienda" class="size-5" /></span>
                <div>
                  <p class="font-bold text-oliva-2">Lapan Almacén · Paraná</p>
                  {/* TODO: confirmar con el cliente la dirección del almacén */}
                  <p class="text-sm text-oliva-2/80">Lunes a sábado de 9:00 a 20:30. Te avisamos cuando esté listo.</p>
                </div>
              </div>
            )}
          </Seccion>

          {/* 3. Cuándo */}
          <Seccion n={3} titulo="¿Cuándo?" campo="cuando" error={errores.cuando}>
            <div class="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Momento de entrega">
              <button type="button" role="radio" aria-checked={cuando === 'ya'} disabled={!inmediata} onClick={() => setCuando('ya')}
                      class={`flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition disabled:cursor-not-allowed disabled:opacity-55 ${cuando === 'ya' ? 'bg-salvia/50 ring-2 ring-oliva' : 'bg-crema-alm ring-oliva/15 hover:enabled:ring-oliva/40'}`}>
                <Icono n="reloj" class="size-5 text-oliva" />
                <span>
                  <span class="block font-bold text-oliva-2">Lo antes posible</span>
                  <span class="text-sm text-oliva-2/85">{inmediata ? (tipo === 'delivery' ? 'Llega en 45–60 min' : 'Listo en 30 min') : 'Ahora no estamos repartiendo'}</span>
                </span>
              </button>
              <button type="button" role="radio" aria-checked={cuando === 'programado'} onClick={() => setCuando('programado')}
                      class={`flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition ${cuando === 'programado' ? 'bg-salvia/50 ring-2 ring-oliva' : 'bg-crema-alm ring-oliva/15 hover:ring-oliva/40'}`}>
                <Icono n="calendario" class="size-5 text-oliva" />
                <span>
                  <span class="block font-bold text-oliva-2">Programar</span>
                  <span class="text-sm text-oliva-2/85">Elegí día y franja</span>
                </span>
              </button>
            </div>

            {cuando === 'programado' && (
              <div class="aparece mt-5">
                <p class="text-sm font-bold tracking-wide text-oliva-2 uppercase">Día</p>
                <div class="chips-tienda -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                  {dias.map((d) => (
                    <button type="button" key={d.id} aria-pressed={dia === d.id}
                            onClick={() => { setDia(d.id); if (!d.franjas.includes(franja)) setFranja(''); }}
                            class={`flex w-[4.5rem] shrink-0 flex-col items-center rounded-2xl py-2.5 ring-1 transition ${dia === d.id ? 'bg-oliva text-white ring-oliva' : 'bg-crema-alm text-oliva-2 ring-oliva/15 hover:ring-oliva/40'}`}>
                      <span class="font-bold">{d.titulo}</span>
                      <span class={`text-xs ${dia === d.id ? 'text-white/85' : 'text-oliva-2/85'}`}>{d.sub}</span>
                    </button>
                  ))}
                </div>
                {diaSel && (
                  <>
                    <p class="mt-4 text-sm font-bold tracking-wide text-oliva-2 uppercase">Franja</p>
                    <div class="mt-2 grid grid-cols-2 gap-2">
                      {FRANJAS.map((f) => {
                        const ok = diaSel.franjas.includes(f.id);
                        return (
                          <button type="button" key={f.id} disabled={!ok} aria-pressed={franja === f.id} onClick={() => setFranja(f.id)}
                                  class={`rounded-2xl px-4 py-3 text-left ring-1 transition disabled:cursor-not-allowed disabled:opacity-40 ${franja === f.id ? 'bg-oliva text-white ring-oliva' : 'bg-crema-alm text-oliva-2 ring-oliva/15 hover:enabled:ring-oliva/40'}`}>
                            <span class="block font-bold">{f.nombre}</span>
                            <span class="text-sm opacity-80">{ok ? f.texto : 'Ya pasó'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </Seccion>

          {/* 4. Datos */}
          <Seccion n={4} titulo="Tus datos">
            <div class="grid gap-4 sm:grid-cols-2">
              <Campo campo="nombre" etiqueta="Nombre" error={errores.nombre} value={datos.nombre} onInput={set('nombre')} autoComplete="name" placeholder="Tu nombre" />
              <Campo campo="telefono" etiqueta="Teléfono" error={errores.telefono} value={datos.telefono} onInput={set('telefono')} type="tel" inputMode="tel" autoComplete="tel" placeholder="343 …" />
              <label class="flex items-center gap-3 text-sm text-oliva-2 sm:col-span-2">
                <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.currentTarget.checked)} class="size-5 rounded accent-[#55602F]" />
                Recordar mis datos en este dispositivo para el próximo pedido
              </label>
            </div>
          </Seccion>

          {/* 5. Pago */}
          <Seccion n={5} titulo="¿Cómo pagás?" campo="pago" error={errores.pago}>
            <div class="grid gap-2.5" role="radiogroup" aria-label="Forma de pago">
              {PAGOS.map((p) => (
                <button type="button" key={p.id} role="radio" aria-checked={pago === p.id} onClick={() => setPago(p.id)}
                        class={`flex items-center gap-4 rounded-2xl p-4 text-left ring-1 transition ${pago === p.id ? 'bg-salvia/50 ring-2 ring-oliva' : 'bg-crema-alm ring-oliva/15 hover:ring-oliva/40'}`}>
                  <span class={`grid size-11 shrink-0 place-items-center rounded-xl ${pago === p.id ? 'bg-oliva text-white' : 'bg-white text-oliva'}`}><Icono n={p.icono} class="size-5" /></span>
                  <span class="flex-1">
                    <span class="block font-bold text-oliva-2">{p.nombre}</span>
                    <span class="text-sm text-oliva-2/85">{p.detalle}</span>
                  </span>
                  <span class={`grid size-6 place-items-center rounded-full ring-2 ${pago === p.id ? 'bg-oliva text-white ring-oliva' : 'ring-oliva/30'}`}>
                    {pago === p.id && <Icono n="check" class="size-3.5" />}
                  </span>
                </button>
              ))}
            </div>
            {pago === 'efectivo' && (
              <div class="aparece mt-4" data-campo="pagaCon">
                <Campo campo="pagaCon" etiqueta="¿Con cuánto pagás?" opcional error={errores.pagaCon} type="number" inputMode="numeric" min={0}
                       value={pagaCon} onInput={(e: any) => setPagaCon(e.currentTarget.value)} placeholder={`Ej: ${Math.ceil(total / 5000) * 5000}`} />
                {pagaCon && Number(pagaCon) >= total && <p class="mt-2 text-sm font-medium text-oliva">Te llevamos {ars(Number(pagaCon) - total)} de vuelto.</p>}
              </div>
            )}
            {pago === 'transferencia' && (
              <p class="aparece mt-4 rounded-2xl bg-crema-alm p-4 text-sm text-oliva-2">
                Al confirmar te mostramos el alias <strong>{ALIAS_DEMO}</strong> para transferir {ars(total)}.
              </p>
            )}
            {pago === 'mercadopago' && (
              <p class="aparece mt-4 flex items-start gap-2 rounded-2xl bg-crema-alm p-4 text-sm text-oliva-2">
                <Icono n="candado" class="mt-0.5 size-4 shrink-0" /> En la versión final te llevamos a pagar de forma segura. En esta demo el pago se simula.
              </p>
            )}
          </Seccion>

          {/* 6. Notas */}
          <Seccion n={6} titulo="¿Algo más?">
            <label class="block">
              <span class="sr-only">Aclaraciones para el almacén</span>
              <textarea rows={3} maxLength={300} value={notas} onInput={(e) => setNotas(e.currentTarget.value)}
                        placeholder="Ej: es para regalo, tocá el timbre fuerte…"
                        class="w-full resize-none rounded-2xl border-0 bg-crema-alm px-4 py-3 text-oliva-2 ring-1 ring-oliva/15 placeholder:text-oliva-2/45 focus:ring-2 focus:ring-oliva focus:outline-none" />
            </label>
          </Seccion>
        </form>

        {/* Resumen */}
        <aside class="mt-5 lg:sticky lg:top-24 lg:mt-[7.25rem]" aria-label="Resumen del pedido">
          <div class="rounded-[22px] bg-white p-5 ring-1 ring-oliva/10 shadow-[0_20px_40px_-30px_rgba(62,71,34,.5)] sm:p-6">
            <h2 class="font-display text-2xl font-extrabold text-oliva-2">Resumen</h2>
            <ul class="mt-4 divide-y divide-oliva/10">
              {items.map((it) => (
                <li key={it.clave} class="flex items-center gap-3 py-3">
                  <div class="min-w-0 flex-1">
                    <p class="font-bold leading-tight text-oliva-2">{it.nombre}</p>
                    <p class="text-sm text-oliva-2/85">{[it.variante, it.nota && `“${it.nota}”`].filter(Boolean).join(' · ')}</p>
                  </div>
                  <Contador chico valor={it.cantidad} onCambio={(n) => cambiarCantidad(it.clave, n - it.cantidad)} etiqueta={it.nombre} />
                  <span class="w-20 text-right font-bold text-oliva-2 tabular-nums">{ars(it.precio * it.cantidad)}</span>
                </li>
              ))}
            </ul>
            <dl class="mt-3 grid gap-1.5 border-t border-oliva/10 pt-4 text-oliva-2">
              <div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">{ars(sub)}</dd></div>
              <div class="flex justify-between"><dt>{tipo === 'delivery' ? 'Envío' : 'Retiro'}</dt><dd class="tabular-nums">{envio ? ars(envio) : 'Gratis'}</dd></div>
              <div class="mt-1 flex justify-between text-xl font-extrabold"><dt>Total</dt><dd class="tabular-nums">{ars(total)}</dd></div>
            </dl>
            <button type="submit" form="form-checkout" class="btn btn-oliva mt-5 hidden w-full justify-between !px-5 lg:flex">
              <span>Confirmar pedido</span><span class="tabular-nums">{ars(total)}</span>
            </button>
            <p class="mt-4 flex items-start gap-2 text-xs text-oliva-2/85">
              <Icono n="info" class="mt-0.5 size-3.5 shrink-0" /> Demo: precios de ejemplo. No se realiza ningún cobro ni se envía el pedido.
            </p>
          </div>
        </aside>
      </div>

      {/* Botón fijo (celular) */}
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-oliva/10 bg-crema-alm/95 px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <button type="submit" form="form-checkout" class="btn btn-oliva w-full justify-between !px-5">
          <span>Confirmar pedido</span><span class="tabular-nums">{ars(total)}</span>
        </button>
      </div>

      {estado !== 'idle' && <Procesando pagando={estado === 'pagando'} total={total} />}
    </>
  );
}

function Seccion({ n, titulo, children, campo, error }: { n: number; titulo: string; children: any; campo?: string; error?: string }) {
  return (
    <section data-campo={campo} class={`min-w-0 rounded-[22px] bg-white p-5 ring-1 transition sm:p-6 ${error ? 'ring-2 ring-fucsia' : 'ring-oliva/10'}`} aria-labelledby={`sec-${n}`}>
      <h2 id={`sec-${n}`} class="mb-4 flex items-center gap-3 font-display text-xl font-bold text-oliva-2 sm:text-2xl">
        <span class="grid size-8 shrink-0 place-items-center rounded-full bg-salvia font-sans text-sm font-extrabold text-oliva-2">{n}</span>
        {titulo}
      </h2>
      {children}
      {error && <p class="mt-3 text-sm font-bold text-[#A11D4C]" role="alert">{error}</p>}
    </section>
  );
}

function Campo({ campo, etiqueta, error, opcional, class: clase = '', ...props }: { campo: string; etiqueta: string; error?: string; opcional?: boolean; class?: string } & JSX.HTMLAttributes<HTMLInputElement>) {
  const id = `campo-${campo}`;
  return (
    <div class={clase} data-campo={campo}>
      <label for={id} class="flex items-baseline justify-between text-sm font-bold text-oliva-2">
        {etiqueta} {opcional && <span class="font-normal text-oliva-2/85">Opcional</span>}
      </label>
      <input id={id} {...props} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined}
             class={`mt-1.5 h-12 w-full rounded-2xl border-0 bg-crema-alm px-4 text-oliva-2 ring-1 placeholder:text-oliva-2/45 focus:ring-2 focus:outline-none ${error ? 'ring-2 ring-fucsia focus:ring-fucsia' : 'ring-oliva/15 focus:ring-oliva'}`} />
      {error && <p id={`${id}-error`} class="mt-1.5 text-sm font-bold text-[#A11D4C]">{error}</p>}
    </div>
  );
}

function Procesando({ pagando, total }: { pagando: boolean; total: number }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => { if (pagando) { const t = setTimeout(() => setPaso(1), 1500); return () => clearTimeout(t); } }, []);
  return (
    <div class="procesando fixed inset-0 z-[70] grid place-items-center bg-salvia/95 p-6 backdrop-blur-sm" role="status" aria-live="assertive">
      <div class="text-center">
        {paso === 0 ? <span class="girador mx-auto block size-16 rounded-full border-[5px] border-oliva/20 border-t-oliva" /> :
          <span class="check-ok mx-auto grid size-16 place-items-center rounded-full bg-oliva text-white"><Icono n="check" class="size-9" /></span>}
        <p class="mt-6 font-display text-3xl font-extrabold text-oliva-2">
          {pagando ? (paso === 0 ? 'Procesando el pago…' : '¡Pago aprobado!') : 'Enviando tu pedido…'}
        </p>
        <p class="mt-2 text-oliva-2/80">{pagando ? `${ars(total)} · pago simulado para la demo` : 'Un segundo y listo.'}</p>
      </div>
    </div>
  );
}
