import type { Producto, Variante } from './producto';

export type VarianteStockBajo = Variante & { producto: Producto };

export type LoteVencimiento = {
  id: number;
  cantidad: number;
  fechaVencimiento: string;
  variante: Variante & { producto: Producto };
};
