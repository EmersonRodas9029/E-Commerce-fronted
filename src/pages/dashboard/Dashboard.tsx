import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import type { AnomalyResponse, ForecastResponse, VentaDiaria } from '../../types/dashboard';

const CHART_W = 600;
const CHART_H = 120;
const PAD = 8;

// Serie única (una variante a la vez) -- sin leyenda, un solo hue,
// tooltip nativo vía <title> en cada punto (sin estado de crosshair).
function Sparkline({ historico }: { historico: VentaDiaria[] }) {
  const max = Math.max(1, ...historico.map((h) => h.cantidad));
  const paso = (CHART_W - PAD * 2) / Math.max(1, historico.length - 1);
  const puntos = historico.map((h, i) => ({
    x: PAD + i * paso,
    y: CHART_H - PAD - (h.cantidad / max) * (CHART_H - PAD * 2),
    ...h,
  }));
  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${PAD},${CHART_H - PAD} ${linea} ${CHART_W - PAD},${CHART_H - PAD}`;

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label="Ventas diarias, últimos 30 días">
      <polygon points={area} fill="#2563eb" fillOpacity={0.08} />
      <polyline points={linea} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map((p) => (
        <circle key={p.fecha} cx={p.x} cy={p.y} r={4} fill="#2563eb" fillOpacity={0} pointerEvents="all">
          <title>{`${p.fecha}: ${p.cantidad} unidad(es)`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [varianteId, setVarianteId] = useState('');
  const [dias, setDias] = useState('7');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const [ventaId, setVentaId] = useState('');
  const [anomalia, setAnomalia] = useState<AnomalyResponse | null>(null);
  const [anomaliaError, setAnomaliaError] = useState<string | null>(null);

  async function handleForecast(e: FormEvent) {
    e.preventDefault();
    setForecastError(null);
    setForecast(null);
    try {
      const res = await api.get<ForecastResponse>(`/dashboard/forecast/${varianteId}`, {
        params: { dias },
      });
      setForecast(res.data);
    } catch (err) {
      setForecastError(
        isAxiosError(err) ? (err.response?.data?.message ?? 'Error consultando el forecast') : 'Error consultando el forecast',
      );
    }
  }

  async function handleAnomalia(e: FormEvent) {
    e.preventDefault();
    setAnomaliaError(null);
    setAnomalia(null);
    try {
      const res = await api.get<AnomalyResponse>(`/dashboard/anomalias/${ventaId}`);
      setAnomalia(res.data);
    } catch (err) {
      setAnomaliaError(
        isAxiosError(err) ? (err.response?.data?.message ?? 'Error consultando anomalías') : 'Error consultando anomalías',
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-xl font-semibold text-perla-900">Dashboard</h1>

      <section className="space-y-3 rounded-lg border border-perla-200 bg-white p-4">
        <h2 className="text-sm font-medium text-perla-700">Demanda estimada (ML)</h2>
        <form onSubmit={handleForecast} className="flex items-end gap-3">
          <label className="text-sm text-perla-600">
            Variante ID
            <input
              type="number"
              required
              value={varianteId}
              onChange={(e) => setVarianteId(e.target.value)}
              className="mt-1 block w-32 rounded-md border border-perla-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-perla-600">
            Días
            <input
              type="number"
              min={1}
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              className="mt-1 block w-24 rounded-md border border-perla-300 px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="rounded-md bg-vino-600 px-4 py-2 text-sm text-white">
            Consultar
          </button>
        </form>
        {forecastError && <p className="text-sm text-red-700">{forecastError}</p>}
        {forecast && (
          <>
            <p className="text-sm text-perla-700">
              Demanda estimada para los próximos {forecast.dias} día(s):{' '}
              <span className="font-semibold">{forecast.demanda_estimada}</span> unidades.
            </p>
            <div>
              <Sparkline historico={forecast.historico} />
              <div className="flex justify-between text-xs text-perla-400">
                <span>{forecast.historico.at(0)?.fecha}</span>
                <span>Ventas diarias, últimos {forecast.historico.length} días</span>
                <span>{forecast.historico.at(-1)?.fecha}</span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-perla-200 bg-white p-4">
        <h2 className="text-sm font-medium text-perla-700">Detección de anomalías (ML)</h2>
        <form onSubmit={handleAnomalia} className="flex items-end gap-3">
          <label className="text-sm text-perla-600">
            Venta ID
            <input
              type="number"
              required
              value={ventaId}
              onChange={(e) => setVentaId(e.target.value)}
              className="mt-1 block w-32 rounded-md border border-perla-300 px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="rounded-md bg-vino-600 px-4 py-2 text-sm text-white">
            Consultar
          </button>
        </form>
        {anomaliaError && <p className="text-sm text-red-700">{anomaliaError}</p>}
        {anomalia && (
          <p className={`text-sm ${anomalia.es_anomalia ? 'text-red-700' : 'text-perla-700'}`}>
            {anomalia.es_anomalia ? 'Venta marcada como anómala' : 'Venta dentro de lo esperado'} (score:{' '}
            {anomalia.score.toFixed(3)})
          </p>
        )}
      </section>
    </div>
  );
}
