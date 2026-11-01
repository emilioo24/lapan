// Botón del navbar y botón flotante: muestran cuántos productos hay en el pedido.
import { useEffect } from 'preact/hooks';
import { cargarCarrito, cantidadTotal, carritoListo, subtotal, ars } from './estado';
import { Icono } from './Icono';

type Props = { href: string; variante: 'nav' | 'flotante' };

export default function BotonPedido({ href, variante }: Props) {
  useEffect(() => { cargarCarrito(); }, []);
  const n = carritoListo.value ? cantidadTotal.value : 0;

  if (variante === 'nav') {
    return (
      <a href={href} class="btn btn-oliva relative !min-h-11 !px-4 !py-2" aria-label={n ? `Hacer pedido, ${n} productos` : 'Hacer pedido'}>
        <Icono n="bolsa" class="size-[1.15em]" />
        <span class="hidden min-[400px]:inline">Hacer pedido</span><span class="min-[400px]:hidden">Pedir</span>
        {n > 0 && <span key={n} class="contador-salto absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-fucsia text-xs font-extrabold text-white ring-2 ring-crema-alm">{n}</span>}
      </a>
    );
  }

  return (
    <a href={href} class="boton-flotante fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-oliva py-3 pr-5 pl-3 font-bold text-white shadow-[0_14px_30px_-10px_rgba(62,71,34,.8)] sm:right-6 sm:bottom-6">
      <span class="relative grid size-9 place-items-center rounded-full bg-salvia text-oliva-2">
        <Icono n="bolsa" class="size-5" />
        {n > 0 && <span key={n} class="contador-salto absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-fucsia text-[11px] font-extrabold text-white">{n}</span>}
      </span>
      {n > 0 ? <>Ver mi pedido · <span class="tabular-nums">{ars(subtotal.value)}</span></> : 'Hacer pedido'}
    </a>
  );
}
