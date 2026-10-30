import { useEffect, useState } from 'react';
import { API_BASE_URL, formatDate, formatNaira } from '@/lib/api';

type PublishedPrice = {
  crop: string;
  commodity_label: string;
  price_ngn_per_kg: number;
  observed_date: string;
  publisher: string;
  underlying_source: string | null;
  source_url: string;
  is_recent: boolean;
  is_named_market_quote: boolean;
};

type PublishedResponse = {
  prices: PublishedPrice[];
  scope: string;
  is_forecast: boolean;
  is_live_market_data: boolean;
};

export default function PublishedPricesPanel() {
  const [data, setData] = useState<PublishedResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/prices/published`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Source unavailable');
        return response.json() as Promise<PublishedResponse>;
      })
      .then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section aria-label="Published national reference prices" className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-7">
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Source-attributed price monitor</p>
      <h2 className="mt-2 text-xl font-bold text-[#103f2c]">Published national reference prices</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Indicative published prices, not verified offers from a specific Nigerian market. Compare source dates before making decisions.</p>
    </div>
    {loading && <p role="status" className="text-sm text-slate-600">Checking published price source…</p>}
    {!loading && error && <p role="status" className="text-sm text-amber-800">Published prices are temporarily unavailable. Historical market records remain below.</p>}
    {!loading && !error && data && <div className="grid gap-3 md:grid-cols-3">
      {data.prices.map((item, index) => <article key={`${item.commodity_label}-${index}`} className="rounded-xl border border-emerald-100 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[#103f2c]">{item.commodity_label}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.is_recent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{item.is_recent ? 'Recent source date' : 'Older source date'}</span>
        </div>
        <p className="mt-3 text-2xl font-extrabold text-[#126b42]">{formatNaira(item.price_ngn_per_kg)}<span className="ml-1 text-xs font-normal text-slate-500">/ kg</span></p>
        <p className="mt-2 text-xs text-slate-500">Observed: {formatDate(item.observed_date)}</p>
        <p className="mt-1 text-xs text-slate-500">Source: {item.underlying_source || item.publisher}</p>
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-[#126b42] underline">View published source</a>
      </article>)}
      {data.prices.length === 0 && <p className="text-sm text-slate-600">No supported published prices are available.</p>}
    </div>}
    <p className="mt-4 text-xs leading-5 text-slate-500">These prices are separate from the historical and model-estimated market records shown below. Rice paddy is unprocessed rice, not retail milled rice.</p>
  </section>;
}
