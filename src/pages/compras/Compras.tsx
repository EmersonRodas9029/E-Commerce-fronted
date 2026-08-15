import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Compra, EstadoCompra } from '../../types/compra';
import type { Proveedor } from '../../types/proveedor';

type Linea = { varianteId: number; nombre: string; cantidad: string; precioUnitario: string };

const hoy = new Date().toISOString().slice(0, 10);

export default function Compras() {
  const { usuario } = useAuth();
  const puedeEscribir = usuario?.rol === 'supervisor' || usuario?.rol === 'administrador';

  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [detalles, setDetalles] = useState<Linea[]>([]);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [comprasRes, proveedoresRes] = await Promise.all([
        api.get<Compra[]>('/compras'),
        api.get<Proveedor[]>('/proveedores'),
      ]);
      setCompras(comprasRes.data);
      setProveedores(proveedoresRes.data);
    } catch {
      setError('No se pudo cargar compras');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleBuscarVariante(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.get(`/variantes/buscar`, { params: { codigo } });
      setDetalles((prev) => [...prev, { varianteId: data.id, nombre: data.nombre, cantidad: '1', precioUnitario: '' }]);
      setCodigo('');
    } catch {
      setError(`No se encontró ninguna variante con código "${codigo}"`);
    }
  }

  function actualizarLinea(i: number, campo: 'cantidad' | 'precioUnitario', valor: string) {
    setDetalles((prev) => prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function quitarLinea(i: number) {
    setDetalles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await api.post('/compras', {
        proveedorId: Number(proveedorId),
        fecha,
        detalles: detalles.map((l) => ({
          varianteId: l.varianteId,
          cantidad: Number(l.cantidad),
          precioUnitario: Number(l.precioUnitario),
        })),
      });
      setProveedorId('');
      setFecha(hoy);
      setDetalles([]);
      await cargar();
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al crear la compra') : 'Error al crear la compra');
    } finally {
      setGuardando(false);
    }
  }

  async function handleEstado(id: number, estado: EstadoCompra) {
    try {
      await api.patch(`/compras/${id}`, { estado });
      await cargar();
    } catch {
      setError('No se pudo actualizar el estado');
    }
  }

  const total = detalles.reduce((acc, l) => acc + Number(l.cantidad || 0) * Number(l.precioUnitario || 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-perla-900">Compras</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {puedeEscribir && (
        <form onSubmit={handleCrear} className="space-y-3 rounded-lg border border-perla-200 bg-white p-4">
          <div className="flex gap-3">
            <select
              required
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="flex-1 rounded-md border border-perla-300 px-3 py-2 text-sm"
            >
              <option value="">Proveedor…</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-md border border-perla-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <input
              placeholder="Código de variante…"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="flex-1 rounded-md border border-perla-300 px-3 py-2 text-sm"
            />
            <button
              onClick={handleBuscarVariante}
              type="button"
              className="rounded-md border border-perla-300 px-3 py-2 text-sm hover:bg-perla-50"
            >
              Agregar línea
            </button>
          </div>

          {detalles.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-perla-200 text-left text-perla-500">
                  <th className="py-2">Variante</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Costo unitario</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {detalles.map((l, i) => (
                  <tr key={i} className="border-b border-perla-100">
                    <td className="py-2">{l.nombre}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={1}
                        required
                        value={l.cantidad}
                        onChange={(e) => actualizarLinea(i, 'cantidad', e.target.value)}
                        className="w-20 rounded-md border border-perla-300 px-2 py-1"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        value={l.precioUnitario}
                        onChange={(e) => actualizarLinea(i, 'precioUnitario', e.target.value)}
                        className="w-24 rounded-md border border-perla-300 px-2 py-1"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button type="button" onClick={() => quitarLinea(i)} className="text-red-600 hover:underline">
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-perla-700">Total: ${total.toFixed(2)}</span>
            <button
              type="submit"
              disabled={guardando || detalles.length === 0}
              className="rounded-md bg-vino-600 px-3 py-2 text-sm font-medium text-white hover:bg-vino-700 disabled:opacity-50"
            >
              {guardando ? 'Guardando…' : 'Registrar compra'}
            </button>
          </div>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-perla-200 text-left text-perla-500">
            <th className="py-2">Fecha</th>
            <th className="py-2">Proveedor</th>
            <th className="py-2">Total</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((c) => (
            <tr key={c.id} className="border-b border-perla-100">
              <td className="py-2">{c.fecha}</td>
              <td className="py-2">{c.proveedor.nombre}</td>
              <td className="py-2">${c.total}</td>
              <td className="py-2">
                {puedeEscribir ? (
                  <select
                    value={c.estado}
                    onChange={(e) => handleEstado(c.id, e.target.value as EstadoCompra)}
                    className="rounded-md border border-perla-300 px-2 py-1 text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                    <option value="recibida">Recibida</option>
                  </select>
                ) : (
                  c.estado
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
