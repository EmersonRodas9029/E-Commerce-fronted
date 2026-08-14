export type EstadoCompra = 'pendiente' | 'recibida' | 'parcial';

export type Compra = {
  id: number;
  proveedor: { id: number; nombre: string };
  estado: EstadoCompra;
  fecha: string;
  total: string;
  createdAt: string;
};
