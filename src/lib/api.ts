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
