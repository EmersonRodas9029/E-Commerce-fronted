import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Producto, Variante } from '../../types/producto';
import type { Lote, MovimientoInventario, TipoMovimiento } from '../../types/inventario';

const movimientoVacio = { tipo: 'ajuste' as TipoMovimiento, cantidad: '', loteId: '', referencia: '' };
const loteVacio = { cantidad: '', fechaVencimiento: '', fechaIngreso: '' };

export default function Inventario() {
  const { usuario } = useAuth();
  const puedeEscribir = usuario?.rol === 'supervisor' || usuario?.rol === 'administrador';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState('');
  const [producto, setProducto] = useState<Producto | null>(null);
  const [varianteId, setVarianteId] = useState<number | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [movForm, setMovForm] = useState(movimientoVacio);
  const [loteForm, setLoteForm] = useState(loteVacio);

  useEffect(() => {
    api.get<Producto[]>('/productos').then((res) => setProductos(res.data));
  }, []);

  useEffect(() => {
    if (!productoId) {
      setProducto(null);
      return;
    }
    api.get<Producto>(`/productos/${productoId}`).then((res) => {
      setProducto(res.data);
      setVarianteId(null);
    });
  }, [productoId]);

  async function cargarVariante(id: number) {
    setVarianteId(id);
    const [movRes, loteRes] = await Promise.all([
      api.get<MovimientoInventario[]>(`/variantes/${id}/movimientos`),
      api.get<Lote[]>(`/variantes/${id}/lotes`).catch(() => ({ data: [] })),
    ]);
    setMovimientos(movRes.data);
    setLotes(loteRes.data);
  }

  async function refrescarProducto() {
    if (!productoId) return;
    const { data } = await api.get<Producto>(`/productos/${productoId}`);
    setProducto(data);
  }

  async function handleMovimiento(e: FormEvent) {
    e.preventDefault();
    if (!varianteId) return;
    setError(null);
    try {
      await api.post(`/variantes/${varianteId}/movimientos`, {
        tipo: movForm.tipo,
        cantidad: Number(movForm.cantidad),
        loteId: movForm.loteId ? Number(movForm.loteId) : undefined,
        referencia: movForm.referencia || undefined,
      });
      setMovForm(movimientoVacio);
      await Promise.all([cargarVariante(varianteId), refrescarProducto()]);
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al registrar') : 'Error al registrar');
    }
  }

  async function handleLote(e: FormEvent) {
    e.preventDefault();
    if (!varianteId) return;
    setError(null);
    try {
      await api.post(`/variantes/${varianteId}/lotes`, {
        cantidad: Number(loteForm.cantidad),
        fechaVencimiento: loteForm.fechaVencimiento,
        fechaIngreso: loteForm.fechaIngreso || undefined,
      });
      setLoteForm(loteVacio);
      await cargarVariante(varianteId);
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear lote') : 'Error al crear lote');
    }
  }

  async function handleBajaLote(id: number) {
    if (!varianteId || !confirm('¿Dar de baja este lote?')) return;
    await api.patch(`/lotes/${id}/dar-de-baja`);
    await cargarVariante(varianteId);
  }

  const variante = producto?.variantes?.find((v) => v.id === varianteId) ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-perla-900">Inventario</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <select
        value={productoId}
        onChange={(e) => setProductoId(e.target.value)}
        className="rounded-md border border-perla-300 px-3 py-2 text-sm"
      >
        <option value="">Producto…</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      {producto && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-perla-200 text-left text-perla-500">
              <th className="py-2">Variante</th>
              <th className="py-2">Precio</th>
              <th className="py-2">Stock</th>
              <th className="py-2">Mínimo</th>
            </tr>
          </thead>
          <tbody>
            {producto.variantes?.map((v: Variante) => (
              <tr
                key={v.id}
                onClick={() => cargarVariante(v.id)}
                className={`cursor-pointer border-b border-perla-100 hover:bg-perla-50 ${v.id === varianteId ? 'bg-perla-50' : ''}`}
              >
                <td className="py-2">{v.nombre}</td>
                <td className="py-2">{v.precio}</td>
                <td className={`py-2 ${v.stockActual <= v.stockMinimo ? 'font-medium text-red-600' : ''}`}>
                  {v.stockActual}
                </td>
                <td className="py-2">{v.stockMinimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {variante && (
        <div className="space-y-6 rounded-lg border border-perla-200 p-4">
          <h2 className="text-sm font-semibold text-perla-900">{variante.nombre}</h2>

          {puedeEscribir && (
            <form onSubmit={handleMovimiento} className="flex flex-wrap items-end gap-2">
              <select
                value={movForm.tipo}
                onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value as TipoMovimiento })}
                className="rounded-md border border-perla-300 px-3 py-2 text-sm"
              >
                <option value="compra">Compra</option>
                <option value="venta">Venta</option>
                <option value="devolucion">Devolución</option>
                <option value="merma">Merma</option>
                <option value="ajuste">Ajuste</option>
              </select>
              <input
                type="number"
                required
                placeholder="Cantidad (± según tipo)"
                value={movForm.cantidad}
                onChange={(e) => setMovForm({ ...movForm, cantidad: e.target.value })}
                className="w-44 rounded-md border border-perla-300 px-3 py-2 text-sm"
              />
              {lotes.length > 0 && (
                <select
                  value={movForm.loteId}
                  onChange={(e) => setMovForm({ ...movForm, loteId: e.target.value })}
                  className="rounded-md border border-perla-300 px-3 py-2 text-sm"
                >
                  <option value="">Sin lote</option>
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>
                      Lote #{l.id} · vence {l.fechaVencimiento}
                    </option>
                  ))}
                </select>
              )}
              <input
                placeholder="Referencia (opcional)"
                value={movForm.referencia}
                onChange={(e) => setMovForm({ ...movForm, referencia: e.target.value })}
                className="rounded-md border border-perla-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-vino-600 px-3 py-2 text-sm font-medium text-white hover:bg-vino-700"
              >
                Registrar
              </button>
            </form>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-perla-200 text-left text-perla-500">
                <th className="py-2">Fecha</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-b border-perla-100">
                  <td className="py-2">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 capitalize">{m.tipo}</td>
                  <td className={`py-2 ${m.cantidad < 0 ? 'text-red-600' : 'text-green-700'}`}>{m.cantidad}</td>
                  <td className="py-2">{m.referencia ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {producto?.tipo === 'perecedero' && (
            <div className="space-y-3 border-t border-perla-100 pt-4">
              <h3 className="text-sm font-semibold text-perla-900">Lotes</h3>

              {puedeEscribir && (
                <form onSubmit={handleLote} className="flex flex-wrap items-end gap-2">
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Cantidad"
                    value={loteForm.cantidad}
                    onChange={(e) => setLoteForm({ ...loteForm, cantidad: e.target.value })}
                    className="w-28 rounded-md border border-perla-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="date"
                    required
                    value={loteForm.fechaVencimiento}
                    onChange={(e) => setLoteForm({ ...loteForm, fechaVencimiento: e.target.value })}
                    className="rounded-md border border-perla-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-vino-600 px-3 py-2 text-sm font-medium text-white hover:bg-vino-700"
                  >
                    Agregar lote
                  </button>
                </form>
              )}

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-perla-200 text-left text-perla-500">
                    <th className="py-2">Cantidad</th>
                    <th className="py-2">Vencimiento</th>
                    <th className="py-2">Estado</th>
                    {puedeEscribir && <th className="py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((l) => (
                    <tr key={l.id} className="border-b border-perla-100">
                      <td className="py-2">{l.cantidad}</td>
                      <td className="py-2">{l.fechaVencimiento}</td>
                      <td className="py-2">{l.dadoDeBaja ? 'Dado de baja' : 'Activo'}</td>
                      {puedeEscribir && (
                        <td className="py-2 text-right">
                          {!l.dadoDeBaja && (
                            <button onClick={() => handleBajaLote(l.id)} className="text-red-600 hover:underline">
                              Dar de baja
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
