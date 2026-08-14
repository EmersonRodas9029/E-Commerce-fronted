import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Categoria, Producto, TipoProducto } from '../../types/producto';

const formVacio = {
  tipo: 'no_perecedero' as TipoProducto,
  nombre: '',
  descripcion: '',
  categoriaId: '',
  diasVidaUtil: '',
  requiereRefrigeracion: false,
};

export default function Productos() {
  const { usuario } = useAuth();
  const puedeEscribir = usuario?.rol === 'supervisor' || usuario?.rol === 'administrador';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        api.get<Producto[]>('/productos'),
        api.get<Categoria[]>('/categorias'),
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch {
      setError('No se pudo cargar productos');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await api.post('/productos', {
        tipo: form.tipo,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        categoriaId: Number(form.categoriaId),
        ...(form.tipo === 'perecedero'
          ? {
              diasVidaUtil: Number(form.diasVidaUtil),
              requiereRefrigeracion: form.requiereRefrigeracion,
            }
          : {}),
      });
      setForm(formVacio);
      await cargar();
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear') : 'Error al crear');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      await cargar();
    } catch {
      setError('No se pudo eliminar');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-gray-900">Productos</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {puedeEscribir && (
        <form onSubmit={handleCrear} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              required
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Categoría…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoProducto })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="no_perecedero">No perecedero</option>
              <option value="perecedero">Perecedero</option>
            </select>
            <input
              placeholder="Descripción (opcional)"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {form.tipo === 'perecedero' && (
              <>
                <input
                  type="number"
                  min={1}
                  placeholder="Días de vida útil"
                  required
                  value={form.diasVidaUtil}
                  onChange={(e) => setForm({ ...form, diasVidaUtil: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.requiereRefrigeracion}
                    onChange={(e) => setForm({ ...form, requiereRefrigeracion: e.target.checked })}
                  />
                  Requiere refrigeración
                </label>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Agregar producto'}
          </button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2">Nombre</th>
            <th className="py-2">Categoría</th>
            <th className="py-2">Tipo</th>
            {puedeEscribir && <th className="py-2" />}
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className="border-b border-gray-100">
              <td className="py-2">{p.nombre}</td>
              <td className="py-2">{p.categoria.nombre}</td>
              <td className="py-2">{p.tipo === 'perecedero' ? 'Perecedero' : 'No perecedero'}</td>
              {puedeEscribir && (
                <td className="py-2 text-right">
                  <button onClick={() => handleEliminar(p.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
