import { useEffect, useState } from 'preact/hooks';
import { ALIAS_DEMO } from './catalogo';
import { ars, leerPedido, type Pedido } from './estado';
import { Icono } from './Icono';

type Props = { base: string; tiendaUrl: string; whatsappUrl: string };

// DEMO: el estado avanza solo, rápido, para mostrar la experiencia (segundos desde que se confirmó).
const PASOS_DELIVERY = [
  { t: 0, titulo: 'Recibimos tu pedido', texto: 'Ya le llegó al almacén.', icono: 'checkCirculo' },
  { t: 7, titulo: 'Lo estamos preparando', texto: 'Armamos tu pedido con cuidado.', icono: 'chef' },
  { t: 17, titulo: 'En camino', texto: 'Tu pedido salió del almacén.', icono: 'moto' },
  { t: 30, titulo: 'Entregado', texto: '¡Que lo disfrutes!', icono: 'casa' },
];
const PASOS_RETIRO = [
  { t: 0, titulo: 'Recibimos tu pedido', texto: 'Ya le llegó al almacén.', icono: 'checkCirculo' },
  { t: 7, titulo: 'Lo estamos preparando', texto: 'Armamos tu pedido con cuidado.', icono: 'chef' },
  { t: 17, titulo: 'Listo para retirar', texto: 'Pasá cuando quieras dentro del horario.', icono: 'tienda' },
  { t: 30, titulo: 'Retirado', texto: '¡Gracias por elegirnos!', icono: 'bolsa' },
];

export default function Seguimiento({ tiendaUrl, whatsappUrl }: Props) {
  const [pedido, setPedido] = useState<Pedido | null | undefined>(undefined);
  const [ahora, setAhora] = useState(Date.now());
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setPedido(leerPedido());
    const i = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  if (pedido === undefined) return <div class="min-h-[60vh]" />;
  if (!pedido) {
    return (
      <div class="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
        <span class="mx-auto grid size-20 place-items-center rounded-full bg-salvia text-oliva"><Icono n="paquete" class="size-9" /></span>
        <h1 class="mt-6 font-display text-4xl font-extrabold text-oliva-2">No tenés pedidos en curso</h1>
        <p class="mt-3 text-lg text-oliva-2/80">Cuando hagas uno, lo vas a poder seguir desde acá.</p>
        <a href={tiendaUrl} class="btn btn-oliva mt-8">Hacer un pedido <Icono n="derecha" class="flecha size-5" /></a>
      </div>
    );
  }

  const pasos = pedido.entrega.tipo === 'delivery' ? PASOS_DELIVERY : PASOS_RETIRO;
  const seg = (ahora - pedido.creado) / 1000;
  const actual = pasos.reduce((acc, p, i) => (seg >= p.t ? i : acc), 0);
  const terminado = actual === pasos.length - 1;
  const hora = (t: number) => new Date(pedido.creado + t * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' h';
  const progreso = (actual / (pasos.length - 1)) * 100;

  const copiar = async () => {
    try { await navigator.clipboard.writeText(ALIAS_DEMO); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* */ }
  };

  return (
    <div class="mx-auto max-w-5xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28 lg:px-8">
      {/* Cabecera */}
      <section class="cabecera-ok relative overflow-hidden rounded-[26px] bg-oliva p-6 text-white sm:p-9">
        <div class="confeti-ok" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ '--i': i } as any} />)}</div>
        <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span class="check-ok grid size-16 shrink-0 place-items-center rounded-full bg-salvia text-oliva-2"><Icono n="check" class="size-9" /></span>
          <div class="flex-1">
            <p class="text-sm font-bold tracking-[.14em] text-salvia uppercase">Pedido {pedido.numero}</p>
            <h1 class="mt-1 font-display text-3xl leading-tight font-extrabold sm:text-4xl">
              {terminado ? `¡Listo, ${pedido.cliente.nombre.split(' ')[0]}!` : `¡Gracias, ${pedido.cliente.nombre.split(' ')[0]}! Recibimos tu pedido`}
            </h1>
            <p class="mt-2 text-white/90">
              {pedido.entrega.tipo === 'delivery' ? 'Entrega' : 'Retiro'}: <strong>{pedido.entrega.cuando}</strong>
            </p>
          </div>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Estado */}
        <section class="rounded-[22px] bg-white p-6 ring-1 ring-oliva/10 sm:p-7" aria-labelledby="t-estado">
          <h2 id="t-estado" class="font-display text-2xl font-extrabold text-oliva-2">Estado del pedido</h2>

          {pedido.entrega.tipo === 'delivery' && (
            <div class="ruta relative mt-6 h-12" aria-hidden="true">
              <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-oliva/10" />
              <div class="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-oliva transition-[width] duration-1000" style={{ width: `${progreso}%` }} />
              <span class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-1000" style={{ left: `${Math.max(4, Math.min(96, progreso))}%` }}>
                <span class={`grid size-11 place-items-center rounded-full bg-fucsia text-white shadow-lg ${actual === 2 ? 'moto-anda' : ''}`}><Icono n="moto" class="size-6" /></span>
              </span>
              <span class="absolute top-1/2 right-0 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-salvia text-oliva-2"><Icono n="casa" class="size-4" /></span>
            </div>
          )}

          <ol class="mt-6 grid gap-0" aria-live="polite">
            {pasos.map((p, i) => {
              const hecho = i < actual; const ahoraEs = i === actual;
              return (
                <li key={p.titulo} class="relative flex gap-4 pb-6 last:pb-0">
                  {i < pasos.length - 1 && <span class={`absolute top-11 bottom-1 left-[21px] w-0.5 rounded ${hecho ? 'bg-oliva' : 'bg-oliva/15'}`} aria-hidden="true" />}
                  <span class={`relative grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-500 ${hecho || ahoraEs ? 'bg-oliva text-white' : 'bg-crema-alm text-oliva-2/40'} ${ahoraEs && !terminado ? 'paso-activo' : ''}`}>
                    <Icono n={hecho ? 'check' : p.icono} class="size-5" />
                  </span>
                  <div class="pt-1">
                    <p class={`font-bold ${hecho || ahoraEs ? 'text-oliva-2' : 'text-oliva-2/45'}`}>
                      {p.titulo}{(hecho || ahoraEs) && <span class="ml-2 text-sm font-normal text-oliva-2/85">{hora(p.t)}</span>}
                    </p>
                    {(hecho || ahoraEs) && <p class="text-sm text-oliva-2/85">{p.texto}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          <p class="mt-6 flex items-start gap-2 rounded-2xl bg-crema-alm p-3 text-xs text-oliva-2/85">
            <Icono n="info" class="mt-0.5 size-3.5 shrink-0" /> En la demo el estado avanza solo y rápido. En la versión final lo actualiza el almacén.
          </p>
        </section>

        <div class="grid content-start gap-6">
          {/* Pago */}
          <section class="rounded-[22px] bg-white p-6 ring-1 ring-oliva/10 sm:p-7" aria-labelledby="t-pago">
            <h2 id="t-pago" class="font-display text-2xl font-extrabold text-oliva-2">Pago · {pedido.pago.nombre}</h2>
            {pedido.pago.metodo === 'transferencia' && (
              <div class="mt-3">
                <p class="text-oliva-2/85">Transferí <strong>{ars(pedido.total)}</strong> a este alias:</p>
                <div class="mt-3 flex items-center gap-2 rounded-2xl bg-crema-alm p-2 pl-4">
                  <code class="flex-1 font-bold tracking-wide text-oliva-2">{ALIAS_DEMO}</code>
                  <button type="button" onClick={copiar} class="btn btn-oliva !min-h-10 !px-4 !py-2 text-sm">
                    <Icono n={copiado ? 'check' : 'copiar'} class="size-4" /> {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p class="mt-2 text-xs text-oliva-2/85">Alias de ejemplo para la demo.</p>
              </div>
            )}
            {pedido.pago.metodo === 'efectivo' && (
              <p class="mt-3 text-oliva-2/85">
                Pagás <strong>{ars(pedido.total)}</strong> {pedido.entrega.tipo === 'delivery' ? 'cuando te llega' : 'cuando lo retirás'}.
                {pedido.pago.pagaCon && pedido.pago.pagaCon > pedido.total && <> Llevamos <strong>{ars(pedido.pago.pagaCon - pedido.total)}</strong> de vuelto.</>}
              </p>
            )}
            {pedido.pago.metodo === 'mercadopago' && (
              <p class="mt-3 flex items-center gap-2 font-medium text-[#1d5a37]"><Icono n="checkCirculo" class="size-5" /> Pago aprobado por {ars(pedido.total)} (simulado)</p>
            )}
          </section>

          {/* Detalle */}
          <section class="rounded-[22px] bg-white p-6 ring-1 ring-oliva/10 sm:p-7" aria-labelledby="t-detalle">
            <h2 id="t-detalle" class="font-display text-2xl font-extrabold text-oliva-2">Tu pedido</h2>
            <ul class="mt-3 divide-y divide-oliva/10">
              {pedido.items.map((it) => (
                <li key={it.clave} class="flex justify-between gap-3 py-2.5 text-oliva-2">
                  <span><strong>{it.cantidad}×</strong> {it.nombre}{it.variante && <span class="text-oliva-2/85"> · {it.variante}</span>}</span>
                  <span class="tabular-nums">{ars(it.precio * it.cantidad)}</span>
                </li>
              ))}
            </ul>
            <dl class="mt-2 grid gap-1 border-t border-oliva/10 pt-3 text-oliva-2">
              <div class="flex justify-between"><dt>Envío</dt><dd>{pedido.envio ? ars(pedido.envio) : 'Gratis'}</dd></div>
              <div class="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd class="tabular-nums">{ars(pedido.total)}</dd></div>
            </dl>
            <div class="mt-4 grid gap-1.5 rounded-2xl bg-crema-alm p-4 text-sm text-oliva-2">
              {pedido.entrega.direccion && <p class="flex gap-2"><Icono n="pin" class="mt-0.5 size-4 shrink-0" /> {pedido.entrega.direccion}{pedido.entrega.referencias && ` (${pedido.entrega.referencias})`}</p>}
              <p class="flex gap-2"><Icono n="usuario" class="mt-0.5 size-4 shrink-0" /> {pedido.cliente.nombre} · {pedido.cliente.telefono}</p>
              {pedido.notas && <p class="flex gap-2"><Icono n="nota" class="mt-0.5 size-4 shrink-0" /> {pedido.notas}</p>}
            </div>
          </section>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={tiendaUrl} class="btn btn-oliva">Hacer otro pedido</a>
        <a href={whatsappUrl} target="_blank" rel="noopener" class="btn btn-borde text-oliva-2">¿Algún problema? Escribinos</a>
      </div>
    </div>
  );
}
