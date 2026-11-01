import { ALMACEN_BASE } from '../../../../shared/config.mjs';

/** Rutas internas del almacén (respetan el base de la demo o producción). */
export const RUTAS = {
  inicio: ALMACEN_BASE,
  tienda: `${ALMACEN_BASE}pedir/`,
  finalizar: `${ALMACEN_BASE}pedir/finalizar/`,
  seguimiento: `${ALMACEN_BASE}pedir/seguimiento/`,
};
