export type TipoMovimiento = 'compra' | 'venta' | 'devolucion' | 'merma' | 'ajuste';

export type MovimientoInventario = {
  id: number;
  tipo: TipoMovimiento;
  cantidad: number;
  referencia: string | null;
  createdAt: string;
  lote: { id: number } | null;
};

export type Lote = {
  id: number;
  cantidad: number;
  fechaVencimiento: string;
  fechaIngreso: string;
  dadoDeBaja: boolean;
};
