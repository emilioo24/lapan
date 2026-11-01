// Íconos Lucide para los componentes interactivos (Preact).
import {
  Plus, Minus, X, ShoppingBag, Search, Check, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Bike,
  Store, Clock, MapPin, CreditCard, Landmark, Banknote, Trash2, Wheat, CakeSlice, Flower2, Leaf, Egg,
  ShoppingBasket, Cookie, Copy, Package, ChefHat, User, Phone, MessageSquare, CalendarDays, Sparkles,
  ArrowLeft, Info, Home, Lock, Star,
} from 'lucide-static';

const ICONOS = {
  mas: Plus, menos: Minus, cerrar: X, bolsa: ShoppingBag, buscar: Search, check: Check, checkCirculo: CheckCircle,
  derecha: ChevronRight, izquierda: ChevronLeft, abajo: ChevronDown, moto: Bike, tienda: Store, reloj: Clock,
  pin: MapPin, tarjeta: CreditCard, banco: Landmark, billete: Banknote, basura: Trash2, trigo: Wheat,
  torta: CakeSlice, hierbas: Flower2, hoja: Leaf, huevo: Egg, canasta: ShoppingBasket, galleta: Cookie,
  copiar: Copy, paquete: Package, chef: ChefHat, usuario: User, telefono: Phone, nota: MessageSquare,
  calendario: CalendarDays, brillo: Sparkles, volver: ArrowLeft, info: Info, casa: Home, candado: Lock, estrella: Star,
} as const;

export type NombreIcono = keyof typeof ICONOS;

export function Icono({ n, class: clase = 'size-5' }: { n: NombreIcono | string; class?: string }) {
  const svg = (ICONOS as Record<string, string>)[n] ?? ICONOS.paquete;
  const html = svg
    .replace(/\s(width|height)="24"/g, '')
    .replace(/class="[^"]*"/, `class="${clase}" aria-hidden="true" focusable="false"`);
  return <span class="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}
