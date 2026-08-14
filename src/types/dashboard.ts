export type VentaDiaria = {
  fecha: string;
  cantidad: number;
};

export type ForecastResponse = {
  variante_id: number;
  dias: number;
  demanda_estimada: number;
  historico: VentaDiaria[];
};

export type AnomalyResponse = {
  venta_id: number;
  es_anomalia: boolean;
  score: number;
};
