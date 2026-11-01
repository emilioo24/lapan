// ─────────────────────────────────────────────────────────────
//  Catálogo de la tienda del almacén — DEMO
//  TODO: confirmar con el cliente productos, presentaciones y PRECIOS.
//  Los precios de acá son de ejemplo, solo para mostrar el flujo de compra.
// ─────────────────────────────────────────────────────────────

export type Variante = { id: string; nombre: string; precio: number };

export type Producto = {
  id: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;            // precio "desde" si tiene variantes
  variantes?: Variante[];
  foto?: string;             // nombre en public/img/fotos (sin -600.webp)
  alt?: string;
  icono: string;             // ícono para cuando no hay foto
  fondo: string;             // color del bloque cuando no hay foto
  etiquetas?: string[];
  destacado?: boolean;
};

export type Categoria = { id: string; nombre: string; etiqueta: string; icono: string };

export const CATEGORIAS: Categoria[] = [
  { id: 'panes', nombre: 'Panes sin gluten', etiqueta: 'Sin gluten', icono: 'trigo' },
  { id: 'pan-dulce', nombre: 'Pan dulce y tortas', etiqueta: 'Temporada', icono: 'torta' },
  { id: 'hierbas', nombre: 'Hierbas y hebras', etiqueta: 'A granel', icono: 'hierbas' },
  { id: 'huevos', nombre: 'Huevos de gallinas libres', etiqueta: 'Frescos', icono: 'huevo' },
  { id: 'elaborados', nombre: 'Elaborados', etiqueta: 'Caseros', icono: 'canasta' },
];

export const PRODUCTOS: Producto[] = [
  // Panes
  { id: 'pan-sg', categoria: 'panes', nombre: 'Pan sin gluten', icono: 'trigo', fondo: '#E6EDD8',
    descripcion: 'Pan sin gluten para tus tostadas y sándwiches de todos los días.',
    precio: 6500, etiquetas: ['Sin gluten'], destacado: true },
  { id: 'pan-sg-semillas', categoria: 'panes', nombre: 'Pan sin gluten con semillas', icono: 'trigo', fondo: '#E6EDD8',
    descripcion: 'La misma receta sin gluten, con semillas.', // TODO: confirmar variedad
    precio: 7200, etiquetas: ['Sin gluten'] },

  // Pan dulce y tortas
  { id: 'pan-dulce-sg', categoria: 'pan-dulce', nombre: 'Pan dulce sin gluten', icono: 'torta', fondo: '#F3E6CC',
    descripcion: 'Pan dulce sin gluten para que nadie se quede afuera de la mesa de las fiestas.',
    precio: 14500, etiquetas: ['Sin gluten', 'Temporada'], destacado: true,
    variantes: [{ id: '500', nombre: '500 g', precio: 14500 }, { id: '1000', nombre: '1 kg', precio: 26000 }] },
  { id: 'pan-dulce-pistacho', categoria: 'pan-dulce', nombre: 'Pan dulce de pistacho', icono: 'torta', fondo: '#F3E6CC',
    foto: 'pan-dulce-pistacho', alt: 'Panes dulces con glaseado de pistacho y chocolate blanco',
    descripcion: 'Con glaseado de pistacho y chocolate blanco por arriba.',
    precio: 16000, etiquetas: ['Temporada'], destacado: true },
  { id: 'rosca', categoria: 'pan-dulce', nombre: 'Rosca de temporada', icono: 'torta', fondo: '#F3E6CC',
    foto: 'roscas', alt: 'Roscas con crema, pistacho, coco y huevitos de chocolate',
    descripcion: 'Rosca con crema y toppings de temporada. Ideal para compartir.',
    precio: 15500, etiquetas: ['Temporada'],
    variantes: [{ id: 'pistacho', nombre: 'Crema y pistacho', precio: 15500 }, { id: 'coco', nombre: 'Coco y chocolate', precio: 15500 }] },

  // Hierbas y hebras
  { id: 'hibisco', categoria: 'hierbas', nombre: 'Hibisco a granel', icono: 'hierbas', fondo: '#F6D9E3',
    descripcion: 'Flor de hibisco seca para infusiones frías o calientes.',
    precio: 2800, etiquetas: ['A granel', 'Natural'], destacado: true,
    variantes: [{ id: '50', nombre: '50 g', precio: 2800 }, { id: '100', nombre: '100 g', precio: 5000 }, { id: '250', nombre: '250 g', precio: 11500 }] },
  { id: 'hierbas-mix', categoria: 'hierbas', nombre: 'Mezcla de hierbas', icono: 'hoja', fondo: '#E3F0E9',
    descripcion: 'Hierbas y hebras para tu mate o tu té.', // TODO: confirmar variedades
    precio: 3200, etiquetas: ['A granel', 'Natural'],
    variantes: [{ id: '50', nombre: '50 g', precio: 3200 }, { id: '100', nombre: '100 g', precio: 5800 }] },

  // Huevos
  { id: 'huevos', categoria: 'huevos', nombre: 'Huevos de gallinas libres', icono: 'huevo', fondo: '#F3E6CC',
    descripcion: 'Huevos frescos de gallinas libres.',
    precio: 3900, etiquetas: ['Frescos'], destacado: true,
    variantes: [{ id: '6', nombre: 'Media docena', precio: 3900 }, { id: '12', nombre: 'Docena', precio: 7200 }, { id: '30', nombre: 'Maple (30)', precio: 16500 }] },

  // Elaborados
  { id: 'torta-invertida', categoria: 'elaborados', nombre: 'Torta invertida', icono: 'torta', fondo: '#F3E6CC',
    descripcion: 'Casera, húmeda y con la fruta caramelizada arriba.',
    precio: 13000, etiquetas: ['Casero'] },
  { id: 'torta-galesa', categoria: 'elaborados', nombre: 'Torta galesa', icono: 'torta', fondo: '#E6EDD8',
    descripcion: 'La clásica torta galesa, cargada de frutos secos y especias.',
    precio: 15000, etiquetas: ['Casero'] },
  { id: 'cookies', categoria: 'elaborados', nombre: 'Cookies', icono: 'galleta', fondo: '#F3E6CC',
    foto: 'cookie-chocolate-frambuesa', alt: 'Cookie de avena con chocolate y frambuesas',
    descripcion: 'Cookies de la casa, para la merienda.', // TODO: confirmar si se venden en el almacén
    precio: 2500, etiquetas: ['Casero'],
    variantes: [{ id: '1', nombre: 'Unidad', precio: 2500 }, { id: '6', nombre: 'Caja x6', precio: 13500 }] },
];

// TODO: confirmar con el cliente costo de envío, envío gratis, zona y pedido mínimo.
export const ENVIO = { costo: 1500, gratisDesde: 30000 };

// TODO: confirmar con el cliente formas de pago y alias para transferencias.
export const PAGOS = [
  { id: 'mercadopago', nombre: 'Mercado Pago', detalle: 'Pagás online con tarjeta o dinero en cuenta', icono: 'tarjeta' },
  { id: 'transferencia', nombre: 'Transferencia', detalle: 'Te mostramos el alias al confirmar', icono: 'banco' },
  { id: 'efectivo', nombre: 'Efectivo', detalle: 'Pagás cuando recibís el pedido', icono: 'billete' },
] as const;
export const ALIAS_DEMO = 'LAPAN.ALMACEN.DEMO';

// Franjas de delivery (datos reales): lunes a sábado, 9–13 y 16–20 h.
export const FRANJAS = [
  { id: 'manana', nombre: 'Mañana', desde: 9, hasta: 13, texto: '9 a 13 h' },
  { id: 'tarde', nombre: 'Tarde', desde: 16, hasta: 20, texto: '16 a 20 h' },
];
