export const API_BASE_URL = 'https://farmdtech.onrender.com';

export type CropPrice = {
  date: string;
  crop: string;
  market_id: string | number;
  market: string;
  state: string;
  latitude?: number;
  longitude?: number;
  price_ngn_per_kg: number;
  price_kind: string;
};

export type PricesResponse = {
  count: number;
  source: string;
  is_live_market_data: boolean;
  prices: CropPrice[];
};

let pricesCache: { data: PricesResponse; expiresAt: number } | null = null;
let pricesRequest: Promise<PricesResponse> | null = null;

function isPricesResponse(value: unknown): value is PricesResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<PricesResponse>;
  return typeof response.count === 'number' && Array.isArray(response.prices);
}

export async function fetchPrices(): Promise<PricesResponse> {
  if (pricesCache && pricesCache.expiresAt > Date.now()) return pricesCache.data;
  if (pricesRequest) return pricesRequest;

  pricesRequest = fetch(`${API_BASE_URL}/prices`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Prices request failed with status ${response.status}`);
      const payload: unknown = await response.json();
      if (!isPricesResponse(payload)) throw new Error('The prices response was not in the expected format.');
      pricesCache = { data: payload, expiresAt: Date.now() + 120_000 };
      return payload;
    })
    .finally(() => {
      pricesRequest = null;
    });

  return pricesRequest;
}

// Compact endpoints keep the browser from downloading all historical rows.
async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}
export type PriceSummary = {
  count: number; average: number; markets: number; observed: number;
  chart: { date: string; price: number }[];
};
export type PricePage = {
  count: number; page: number; page_size: number; states: string[]; prices: CropPrice[];
};
export type PriceTrends = { chart: { date: string; price: number }[] };
export const fetchPriceSummary = (crop: string) =>
  getJSON<PriceSummary>(`/prices/summary?crop=${encodeURIComponent(crop)}`);
export const fetchPricePage = (crop: string, state: string, search: string, page: number) =>
  getJSON<PricePage>(`/prices/page?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&search=${encodeURIComponent(search)}&page=${page}&page_size=12`);
export const fetchPriceTrends = (crop: string) =>
  getJSON<PriceTrends>(`/prices/trends?crop=${encodeURIComponent(crop)}`);

export function formatNaira(value: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatCrop(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// ── Forecast API ────────────────────────────────────────────────────────────

export type ForecastRecord = {
  crop: string;
  market_id: string | number;
  market: string;
  state: string;
  forecast_month: string;
  last_month: string;
  last_price_ngn_per_kg: number;
  forecast_ngn_per_kg: number;
  change_percent: number;
};

export type ForecastResponse = {
  count: number;
  forecast_type: string;
  source: string;
  is_live_market_data: boolean;
  forecast_months: string[];
  disclaimer: string;
  forecasts: ForecastRecord[];
};

function isForecastResponse(value: unknown): value is ForecastResponse {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<ForecastResponse>;
  return typeof r.count === 'number' && Array.isArray(r.forecasts);
}

const forecastCache = new Map<string, { data: ForecastResponse; expiresAt: number }>();
const forecastRequests = new Map<string, Promise<ForecastResponse>>();

export async function fetchForecast(crop: string): Promise<ForecastResponse> {
  const key = crop.toLowerCase();
  const cached = forecastCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const inflight = forecastRequests.get(key);
  if (inflight) return inflight;

  const request = fetch(`${API_BASE_URL}/forecast?crop=${encodeURIComponent(key)}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Forecast request failed with status ${response.status}`);
      const payload: unknown = await response.json();
      if (!isForecastResponse(payload)) throw new Error('Forecast response was not in the expected format.');
      forecastCache.set(key, { data: payload, expiresAt: Date.now() + 120_000 });
      return payload;
    })
    .finally(() => { forecastRequests.delete(key); });

  forecastRequests.set(key, request);
  return request;
}
