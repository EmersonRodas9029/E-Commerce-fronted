export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export type Venta = {
  id: number;
  total: string;
  metodoPago: MetodoPago;
  estado: 'completada' | 'anulada';
  createdAt: string;
};
