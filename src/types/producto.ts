export type TipoProducto = 'perecedero' | 'no_perecedero';

export type Categoria = {
  id: number;
  nombre: string;
};

export type Variante = {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  codigoInterno: string;
  precio: string;
  stockActual: number;
  stockMinimo: number;
};

export type Producto = {
  id: number;
  tipo: TipoProducto;
  nombre: string;
  descripcion: string | null;
  categoria: Categoria;
  activo: boolean;
  diasVidaUtil: number | null;
  requiereRefrigeracion: boolean | null;
  variantes?: Variante[];
};
