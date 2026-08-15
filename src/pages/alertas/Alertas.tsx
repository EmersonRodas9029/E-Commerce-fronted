import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { LoteVencimiento, VarianteStockBajo } from '../../types/alerta';

export default function Alertas() {
  const [stockBajo, setStockBajo] = useState<VarianteStockBajo[]>([]);
  const [vencimientos, setVencimientos] = useState<LoteVencimiento[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<VarianteStockBajo[]>('/alertas/stock-bajo'),
      api.get<LoteVencimiento[]>('/alertas/vencimiento-proximo'),
    ])
      .then(([stock, venc]) => {
        setStockBajo(stock.data);
        setVencimientos(venc.data);
      })
      .catch(() => setError('No se pudieron cargar las alertas'));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-perla-900">Alertas</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-perla-700">Stock bajo</h2>
        {stockBajo.length === 0 ? (
          <p className="text-sm text-perla-500">Sin alertas de stock.</p>
        ) : (
          <table className="w-full rounded-lg border border-perla-200 bg-white text-sm">
            <thead className="bg-perla-50 text-left text-perla-500">
              <tr>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Variante</th>
                <th className="px-3 py-2">Stock actual</th>
                <th className="px-3 py-2">Stock mínimo</th>
              </tr>
            </thead>
            <tbody>
              {stockBajo.map((v) => (
                <tr key={v.id} className="border-t border-perla-100">
                  <td className="px-3 py-2">{v.producto.nombre}</td>
                  <td className="px-3 py-2">{v.nombre}</td>
                  <td className="px-3 py-2 text-red-700">{v.stockActual}</td>
                  <td className="px-3 py-2">{v.stockMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-perla-700">Vencimiento próximo (7 días)</h2>
        {vencimientos.length === 0 ? (
          <p className="text-sm text-perla-500">Sin lotes por vencer.</p>
        ) : (
          <table className="w-full rounded-lg border border-perla-200 bg-white text-sm">
            <thead className="bg-perla-50 text-left text-perla-500">
              <tr>
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Variante</th>
                <th className="px-3 py-2">Cantidad</th>
                <th className="px-3 py-2">Vence</th>
              </tr>
            </thead>
            <tbody>
              {vencimientos.map((l) => (
                <tr key={l.id} className="border-t border-perla-100">
                  <td className="px-3 py-2">{l.variante.producto.nombre}</td>
                  <td className="px-3 py-2">{l.variante.nombre}</td>
                  <td className="px-3 py-2">{l.cantidad}</td>
                  <td className="px-3 py-2 text-amber-700">{l.fechaVencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
