import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import type { MetodoPago, Venta } from '../../types/venta';

type Linea = {
  varianteId?: number;
  descripcionLibre?: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
};

const libreVacio = { descripcion: '', precio: '', cantidad: '1' };

export default function Ventas() {
  const [carrito, setCarrito] = useState<Linea[]>([]);
  const [codigo, setCodigo] = useState('');
  const [libre, setLibre] = useState(libreVacio);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [error, setError] = useState<string | null>(null);
  const [cobrando, setCobrando] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState<Venta | null>(null);

  function agregarLinea(nueva: Linea) {
    setCarrito((prev) => {
      const idx = prev.findIndex((l) => l.varianteId && l.varianteId === nueva.varianteId);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + nueva.cantidad };
        return copia;
      }
      return [...prev, nueva];
    });
  }

  async function handleBuscar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setUltimaVenta(null);
    try {
      const { data } = await api.get(`/variantes/buscar`, { params: { codigo } });
      agregarLinea({
        varianteId: data.id,
        nombre: data.nombre,
        precioUnitario: Number(data.precio),
        cantidad: 1,
      });
      setCodigo('');
    } catch {
      setError(`No se encontró ninguna variante con código "${codigo}"`);
    }
  }

  function handleAgregarLibre(e: FormEvent) {
    e.preventDefault();
    setUltimaVenta(null);
    agregarLinea({
      descripcionLibre: libre.descripcion,
      nombre: libre.descripcion,
      precioUnitario: Number(libre.precio),
      cantidad: Number(libre.cantidad),
    });
    setLibre(libreVacio);
  }

  function cambiarCantidad(i: number, delta: number) {
    setCarrito((prev) =>
      prev
        .map((l, idx) => (idx === i ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter((l) => l.cantidad > 0),
    );
  }

  function quitar(i: number) {
    setCarrito((prev) => prev.filter((_, idx) => idx !== i));
  }

  const total = carrito.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);

  async function handleCobrar() {
    setError(null);
    setCobrando(true);
    try {
      const { data } = await api.post<Venta>('/ventas', {
        metodoPago,
        detalles: carrito.map((l) =>
          l.varianteId
            ? { varianteId: l.varianteId, cantidad: l.cantidad }
            : { descripcionLibre: l.descripcionLibre, cantidad: l.cantidad, precioUnitario: l.precioUnitario },
        ),
      });
      setUltimaVenta(data);
      setCarrito([]);
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error al cobrar') : 'Error al cobrar');
    } finally {
      setCobrando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-gray-900">Venta</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {ultimaVenta && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Venta #{ultimaVenta.id} registrada — total ${ultimaVenta.total}
        </p>
      )}

      <form onSubmit={handleBuscar} className="flex gap-2">
        <input
          autoFocus
          placeholder="Escanear o escribir código…"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Agregar
        </button>
      </form>

      <form onSubmit={handleAgregarLibre} className="flex flex-wrap items-end gap-2 text-sm text-gray-600">
        <input
          placeholder="Producto libre (sin código)"
          value={libre.descripcion}
          onChange={(e) => setLibre({ ...libre, descripcion: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Precio"
          required={!!libre.descripcion}
          value={libre.precio}
          onChange={(e) => setLibre({ ...libre, precio: e.target.value })}
          className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          value={libre.cantidad}
          onChange={(e) => setLibre({ ...libre, cantidad: e.target.value })}
          className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!libre.descripcion || !libre.precio}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Agregar libre
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2">Producto</th>
            <th className="py-2">Precio</th>
            <th className="py-2">Cant.</th>
            <th className="py-2">Subtotal</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {carrito.map((l, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2">{l.nombre}</td>
              <td className="py-2">${l.precioUnitario.toFixed(2)}</td>
              <td className="py-2">
                <button onClick={() => cambiarCantidad(i, -1)} className="px-1 text-gray-500">
                  −
                </button>
                {l.cantidad}
                <button onClick={() => cambiarCantidad(i, 1)} className="px-1 text-gray-500">
                  +
                </button>
              </td>
              <td className="py-2">${(l.cantidad * l.precioUnitario).toFixed(2)}</td>
              <td className="py-2 text-right">
                <button onClick={() => quitar(i)} className="text-red-600 hover:underline">
                  Quitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <span className="text-lg font-semibold text-gray-900">Total: ${total.toFixed(2)}</span>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <button
          onClick={handleCobrar}
          disabled={carrito.length === 0 || cobrando}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {cobrando ? 'Cobrando…' : 'Cobrar'}
        </button>
      </div>
    </div>
  );
}
