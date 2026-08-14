import type { Rol } from '../context/AuthContext';

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
};
