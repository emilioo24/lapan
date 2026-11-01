// Estado de la tienda: carrito (persistido en localStorage) y último pedido.
// DEMO: todo vive en el navegador. En producción, el pedido se enviaría a un backend.
import { signal, computed } from '@preact/signals';
import { ENVIO, FRANJAS, type Producto, type Variante } from './catalogo';

/* ───────── Utilidades ───────── */
const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const ars = (n: number) => fmt.format(n);
export const fotoUrl = (base: string, nombre: string, w: 600 | 1200 = 600) => `${base}img/fotos/${nombre}-${w}.webp`;

const leer = <T,>(clave: string, porDefecto: T): T => {
  try { const v = localStorage.getItem(clave); return v ? (JSON.parse(v) as T) : porDefecto; } catch { return porDefecto; }
};
const guardar = (clave: string, valor: unknown) => {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* modo privado */ }
};

/* ───────── Carrito ───────── */
export type ItemCarrito = {
  clave: string;
  productoId: string;
  nombre: string;
  variante?: string;
  precio: number;
  cantidad: number;
  nota?: string;
  foto?: string;
  icono: string;
  fondo: string;
};

const CLAVE_CARRITO = 'lapan-almacen-carrito-v1';
export const carrito = signal<ItemCarrito[]>([]);
export const carritoListo = signal(false);

/** Se llama desde un useEffect: así el primer render coincide con el HTML del servidor. */
export function cargarCarrito() {
  if (carritoListo.value || typeof window === 'undefined') return;
  carrito.value = leer<ItemCarrito[]>(CLAVE_CARRITO, []);
  carritoListo.value = true;
  addEventListener('storage', (e) => {
    if (e.key === CLAVE_CARRITO) carrito.value = leer<ItemCarrito[]>(CLAVE_CARRITO, []);
  });
}
const persistir = (items: ItemCarrito[]) => { carrito.value = items; guardar(CLAVE_CARRITO, items); };

export function agregar(p: Producto, v: Variante | undefined, cantidad: number, nota = '') {
  const clave = [p.id, v?.id ?? '', nota.trim()].join('|');
  const items = [...carrito.value];
  const i = items.findIndex((it) => it.clave === clave);
  if (i >= 0) items[i] = { ...items[i], cantidad: items[i].cantidad + cantidad };
  else items.push({
    clave, productoId: p.id, nombre: p.nombre, variante: v?.nombre, precio: v?.precio ?? p.precio,
    cantidad, nota: nota.trim() || undefined, foto: p.foto, icono: p.icono, fondo: p.fondo,
  });
  persistir(items);
  avisar(`${cantidad > 1 ? cantidad + ' × ' : ''}${p.nombre} al pedido`);
}
export function cambiarCantidad(clave: string, delta: number) {
  persistir(carrito.value
    .map((it) => (it.clave === clave ? { ...it, cantidad: it.cantidad + delta } : it))
    .filter((it) => it.cantidad > 0));
}
export const quitar = (clave: string) => persistir(carrito.value.filter((it) => it.clave !== clave));
export const vaciar = () => persistir([]);

export const cantidadTotal = computed(() => carrito.value.reduce((s, it) => s + it.cantidad, 0));
export const subtotal = computed(() => carrito.value.reduce((s, it) => s + it.precio * it.cantidad, 0));
export const cantidadDe = (productoId: string) =>
  carrito.value.filter((it) => it.productoId === productoId).reduce((s, it) => s + it.cantidad, 0);
export const costoEnvio = (sub: number, tipo: 'delivery' | 'retiro' = 'delivery') =>
  tipo === 'retiro' || sub === 0 || sub >= ENVIO.gratisDesde ? 0 : ENVIO.costo;

/* ───────── Avisos (toast) ───────── */
export const aviso = signal<{ id: number; texto: string } | null>(null);
let t: ReturnType<typeof setTimeout> | undefined;
export function avisar(texto: string) {
  aviso.value = { id: Date.now(), texto };
  clearTimeout(t);
  t = setTimeout(() => (aviso.value = null), 2400);
}

/* ───────── Horarios de entrega (hora de Paraná) ───────── */
export const ahoraAR = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export type Dia = { id: string; titulo: string; sub: string; franjas: string[] };

/** ¿Se puede pedir "lo antes posible"? Lunes a sábado, dentro de una franja y con 45 min de margen. */
export function entregaInmediata(): boolean {
  const d = ahoraAR();
  if (d.getDay() === 0) return false;
  const h = d.getHours() + d.getMinutes() / 60;
  return FRANJAS.some((f) => h >= f.desde && h <= f.hasta - 0.75);
}

/** Próximos días con entrega (lunes a sábado) y sus franjas disponibles. */
export function proximosDias(cantidad = 6): Dia[] {
  const hoy = ahoraAR();
  const h = hoy.getHours() + hoy.getMinutes() / 60;
  const dias: Dia[] = [];
  for (let i = 0; dias.length < cantidad && i < 14; i++) {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i);
    if (d.getDay() === 0) continue;
    const franjas = FRANJAS.filter((f) => i > 0 || h < f.hasta - 1).map((f) => f.id);
    if (!franjas.length) continue;
    dias.push({
      id: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      titulo: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DIAS[d.getDay()],
      sub: `${d.getDate()}/${d.getMonth() + 1}`,
      franjas,
    });
  }
  return dias;
}

/* ───────── Pedido ───────── */
export type Pedido = {
  numero: string;
  creado: number;
  items: ItemCarrito[];
  subtotal: number;
  envio: number;
  total: number;
  entrega: { tipo: 'delivery' | 'retiro'; direccion?: string; referencias?: string; cuando: string };
  cliente: { nombre: string; telefono: string };
  pago: { metodo: string; nombre: string; pagaCon?: number };
  notas?: string;
};
const CLAVE_PEDIDO = 'lapan-almacen-pedido-v1';
const CLAVE_DATOS = 'lapan-almacen-datos-v1';

export const guardarPedido = (p: Pedido) => guardar(CLAVE_PEDIDO, p);
export const leerPedido = () => leer<Pedido | null>(CLAVE_PEDIDO, null);
export const nuevoNumero = () => 'LP-' + String(Math.floor(1000 + Math.random() * 9000));

export type DatosGuardados = { nombre: string; telefono: string; calle: string; depto: string; barrio: string; referencias: string };
export const leerDatos = () => leer<Partial<DatosGuardados>>(CLAVE_DATOS, {});
export const guardarDatos = (d: DatosGuardados) => guardar(CLAVE_DATOS, d);
export const olvidarDatos = () => { try { localStorage.removeItem(CLAVE_DATOS); } catch { /* */ } };
