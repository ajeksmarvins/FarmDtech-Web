import { useEffect, useMemo, useState, type ReactNode } from 'react';
import AdvisoryChat from './components/AdvisoryChat';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, BarChart3, Check, CircleAlert, Clock3, CloudSun, Database, Filter, LineChart, LoaderCircle, MapPin, Menu, MessageCircle, Minus, Search, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CropPrice, ForecastRecord, ForecastResponse, fetchForecast, fetchPrices, fetchPriceSummary, fetchPricePage, fetchPriceTrends, type PriceSummary, type PricePage, type PriceTrends, formatCrop, formatDate, formatNaira } from '@/lib/api';

const heroImage = 'https://images.pexels.com/photos/38668659/pexels-photo-38668659.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const navItems = [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Market Prices', to: '/prices' }, { label: 'Price Trends', to: '/trends' }, { label: 'Forecasts', to: '/forecasts' }, { label: 'AI Assistant', to: '/advisory' }];

function App() {
  return <BrowserRouter><div className="min-h-screen bg-[#f7faf7] text-slate-900"><Header /><main><Routes><Route path="/" element={<Home />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/prices" element={<Prices />} /><Route path="/trends" element={<Trends />} /><Route path="/forecasts" element={<Forecasts />} /><Route path="/advisory" element={<AdvisoryChat />} /><Route path="*" element={<Home />} /></Routes></main><Footer /><FloatingAIButton /></div></BrowserRouter>;
}

function FloatingAIButton() {
  const location = useLocation();
  if (location.pathname === '/advisory') return null;
  return <Link
    to="/advisory"
    aria-label="Open FarmDtech AI Assistant"
    title="Chat with FarmDtech AI"
    className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#126b42] px-4 py-3 font-bold text-white shadow-xl shadow-[#103f2c]/25 transition hover:-translate-y-0.5 hover:bg-[#0b5131] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126b42] sm:bottom-6 sm:right-6"
  ><MessageCircle size={21} aria-hidden="true" /><span className="text-sm">Ask FarmDtech AI</span></Link>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8"><Link to="/" className="flex items-center gap-3" aria-label="FarmDtech home"><img src="/images/FarmDtech_Official_Logo.png" alt="FarmDtech" className="h-12 w-auto object-contain" /><span className="hidden border-l border-slate-200 pl-3 text-xs font-semibold tracking-wide text-slate-500 sm:block">Ask. Receive. Decide.</span></Link><button className="rounded-lg p-2 text-slate-700 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button><nav className={`${open ? 'absolute left-0 right-0 top-full flex border-b border-slate-200 bg-white p-5 shadow-lg' : 'hidden'} flex-col gap-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none`} aria-label="Main navigation">{navItems.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-semibold transition ${isActive ? 'text-[#126b42]' : 'text-slate-600 hover:text-[#126b42]'}`}>{item.label}</NavLink>)}<Link to="/dashboard" className="rounded-full bg-[#126b42] px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#0b5131]">Open dashboard</Link></nav></div></header>;
}

function Home() {
  return <><section className="relative isolate overflow-hidden"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#e1f3e6,transparent_45%)]" /><div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24"><div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8dbbf] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#126b42]"><span className="h-2 w-2 rounded-full bg-[#d89b24]" />Crop price intelligence for Nigeria</div><h1 className="max-w-2xl text-5xl font-bold leading-[1.07] tracking-[-.04em] text-[#103f2c] sm:text-6xl">Know your crop prices <span className="text-[#55a936]">before you sell.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Make clearer selling decisions with accessible crop prices, market comparisons, and trends built for Nigerian farmers and agribusinesses.</p><div className="mt-8 flex flex-col flex-wrap gap-3 sm:flex-row"><Link to="/dashboard" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#126b42] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#126b42]/20 transition hover:-translate-y-0.5 hover:bg-[#0b5131]">Explore dashboard <ArrowRight size={18} className="transition group-hover:translate-x-1" /></Link><Link to="/prices" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 font-bold text-[#126b42] transition hover:border-[#126b42]">View market prices</Link></div><div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#55a936]" />Clear data labels</span><span className="flex items-center gap-2"><Database size={17} className="text-[#55a936]" />API-connected</span></div></div><div className="relative"><div className="absolute -inset-4 rounded-[2.5rem] bg-[#d9edda] blur-2xl" /><div className="relative overflow-hidden rounded-[2rem] border-8 border-white bg-slate-200 shadow-2xl"><img src={heroImage} alt="Farmer inspecting maize in a field" className="h-[420px] w-full object-cover lg:h-[520px]" /><div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-[#103f2c]/90 p-4 text-white backdrop-blur"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#b9e09d]">Your market edge</p><p className="mt-1 font-semibold">Ask. Receive. Decide.</p></div><div className="rounded-xl bg-[#55a936] p-3"><LineChart size={23} /></div></div></div></div></div></div></section><section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-3 lg:px-8"><Feature icon={<BarChart3 />} title="See the signal" text="Understand how crop prices move across time and markets." /><Feature icon={<MapPin />} title="Compare markets" text="Explore the locations and states where your crop is traded." /><Feature icon={<Sparkles />} title="Decide with clarity" text="Turn reliable market context into a better selling decision." /></div></section><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#55a936]">Simple by design</p><h2 className="mt-3 text-4xl font-bold tracking-tight text-[#103f2c]">From question to confident action.</h2></div><p className="max-w-lg text-lg leading-8 text-slate-600">FarmDtech makes price information easier to find, easier to understand, and more useful when timing matters.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3"><Step number="01" title="Ask" text="Choose a crop, market, or state to start exploring." /><Step number="02" title="Receive" text="See historical prices and trends from our connected data source." /><Step number="03" title="Decide" text="Use the context to plan where and when to sell." /></div></section></>;
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f4e4] text-[#126b42]">{icon}</div><div><h3 className="font-bold text-[#103f2c]">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div>; }
function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><span className="text-sm font-bold text-[#d89b24]">{number}</span><h3 className="mt-8 text-2xl font-bold text-[#103f2c]">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></div>; }

function usePrices() { const [data, setData] = useState<{ prices: CropPrice[]; count: number; source: string; isLive: boolean } | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [reloadKey, setReloadKey] = useState(0); useEffect(() => { setLoading(true); setError(''); fetchPrices().then((result) => setData({ prices: result.prices, count: result.count, source: result.source, isLive: result.is_live_market_data })).catch(() => setError('We could not load market data. Please try again shortly.')).finally(() => setLoading(false)); }, [reloadKey]); return { data, loading, error, retry: () => setReloadKey((key) => key + 1) }; }

function DataState({ loading, error, onRetry, children }: { loading: boolean; error: string; onRetry: () => void; children: ReactNode }) { if (loading) return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-[#126b42]" /><p className="mt-3 text-sm text-slate-500">Connecting to market data…</p><p className="mt-1 text-xs text-slate-400">Loading the requested data…</p></div></div>; if (error) return <div className="rounded-2xl border border-[#f0d8a0] bg-[#fffaf0] p-8 text-center"><CircleAlert className="mx-auto text-[#b7790b]" /><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{error}</p><button onClick={onRetry} className="mt-4 rounded-full bg-[#126b42] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0b5131]">Retry</button></div>; return <>{children}</>; }

function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[.18em] text-[#55a936]">{eyebrow}</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-[#103f2c] sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{text}</p></div>; }

function useCompactData<T>(loader: () => Promise<T>, dependencies: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loader().then(value => { if (active) setData(value); })
      .catch(() => { if (active) setError('Could not load this data. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // Dependencies are the current filter values and retry counter.
  }, [...dependencies, attempt]);
  return { data, loading, error, retry: () => setAttempt(value => value + 1) };
}

function Dashboard() { const [crop, setCrop] = useState('all'); const { data, loading, error, retry } = useCompactData<PriceSummary>(() => fetchPriceSummary(crop), [crop]); const average = data?.average ?? 0; const markets = data?.markets ?? 0; const chartData = (data?.chart ?? []).map(item => ({ date: item.date.slice(5), price: item.price })); return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><PageHeader eyebrow="Market overview" title="A clearer view of your markets." text="Explore the latest available crop price records and see the context behind every number." /><div className="mb-7 flex flex-wrap items-center gap-3"><span className="text-sm font-semibold text-slate-600">Show prices for</span>{['all', 'maize', 'rice', 'beans'].map((value) => <button key={value} onClick={() => setCrop(value)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${crop === value ? 'bg-[#126b42] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#126b42]'}`}>{value === 'all' ? 'All crops' : value}</button>)}</div><DataState loading={loading} error={error} onRetry={retry}>{<><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Records available" value={(data?.count ?? 0).toLocaleString()} icon={<Database />} /><Stat label="Average price" value={average ? formatNaira(average) : '—'} suffix="per kg" icon={<BarChart3 />} /><Stat label="Markets covered" value={markets.toString()} icon={<MapPin />} /><Stat label="Price records" value={(data?.observed ?? 0).toLocaleString()} suffix="observed" icon={<Check />} /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex items-start justify-between"><div><h2 className="font-bold text-[#103f2c]">Recent price movement</h2><p className="mt-1 text-sm text-slate-500">Last {chartData.length} available records</p></div><div className="rounded-lg bg-[#e6f4e4] p-2 text-[#126b42]"><TrendingUp size={18} /></div></div><div className="mt-6 h-[300px]">{chartData.length > 1 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#55a936" stopOpacity={.3} /><stop offset="95%" stopColor="#55a936" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} width={55} /><Tooltip formatter={(value: unknown) => [formatNaira(Number(value ?? 0)), 'Price']} /><Area type="monotone" dataKey="price" stroke="#126b42" strokeWidth={2.5} fill="url(#greenFill)" /></AreaChart></ResponsiveContainer> : <Empty text="Not enough records for a chart." />}</div></div><div className="rounded-2xl bg-[#103f2c] p-7 text-white"><CloudSun className="text-[#b9e09d]" /><h2 className="mt-8 text-2xl font-bold">Make the next call with context.</h2><p className="mt-3 text-sm leading-7 text-slate-300">Browse market prices by crop, location, and date to understand what your data is saying.</p><Link to="/prices" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#b9e09d]">Explore all prices <ArrowRight size={16} /></Link></div></div></>}</DataState></div>; }
function Stat({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><span className="text-[#55a936]">{icon}</span></div><p className="mt-4 text-2xl font-bold text-[#103f2c]">{value}</p>{suffix && <p className="mt-1 text-xs text-slate-400">{suffix}</p>}</div>; }
function Empty({ text }: { text: string }) { return <div className="flex h-full items-center justify-center text-sm text-slate-400">{text}</div>; }

function Prices() {
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('all');
  const [state, setState] = useState('all');
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useCompactData<PricePage>(
    () => fetchPricePage(crop, state, query, page), [crop, state, query, page]
  );
  const updateQuery = (value: string) => { setQuery(value); setPage(1); };
  const updateCrop = (value: string) => { setCrop(value); setPage(1); };
  const updateState = (value: string) => { setState(value); setPage(1); };
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / 12));
  return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <PageHeader eyebrow="Market prices" title="Know the going rate." text="Browse historical records in Nigerian naira per kilogram. Every entry is clearly labelled as observed or estimated." />
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <input aria-label="Search crop, market, or state" value={query} onChange={e => updateQuery(e.target.value)} placeholder="Search crop, market, or state" className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <div className="flex gap-3">
          <select aria-label="Crop" value={crop} onChange={e => updateCrop(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="all">All crops</option><option value="maize">Maize</option><option value="rice">Rice</option><option value="beans">Beans</option></select>
          <select aria-label="State" value={state} onChange={e => updateState(e.target.value)} className="max-w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="all">All states</option>{(data?.states ?? []).map(value => <option key={value} value={value}>{value}</option>)}</select>
        </div>
      </div>
      <DataState loading={loading} error={error} onRetry={retry}>
        <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">{['Crop','Market','State','Date','Price','Price type'].map(label => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{(data?.prices ?? []).map((item,index) => <tr key={`${item.market_id}-${item.date}-${index}`} className="border-b border-slate-100">
            <td className="px-3 py-4 font-bold capitalize text-[#103f2c]">{formatCrop(item.crop)}</td><td className="px-3 py-4">{item.market}</td><td className="px-3 py-4">{item.state}</td><td className="px-3 py-4">{formatDate(item.date)}</td><td className="px-3 py-4 font-bold text-[#126b42]">{formatNaira(item.price_ngn_per_kg)} / kg</td><td className="px-3 py-4">{formatCrop(item.price_kind)}</td>
          </tr>)}</tbody>
        </table>{data?.prices.length === 0 && <Empty text="No records match these filters." />}</div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 text-sm text-slate-500"><span>{(data?.count ?? 0).toLocaleString()} matching records</span><div className="flex items-center gap-2"><button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button></div></div>
      </DataState>
    </div>
  </div>;
}

function Trends() { const [crop, setCrop] = useState('all'); const { data, loading, error, retry } = useCompactData<PriceTrends>(() => fetchPriceTrends(crop), [crop]); const chartData = data?.chart ?? []; return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><PageHeader eyebrow="Price trends" title="See the market move." text="Follow average recorded prices over time and compare the direction of the crops that matter to you." /><DataState loading={loading} error={error} onRetry={retry}><div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-bold text-[#103f2c]">Average price by date</h2><p className="mt-1 text-sm text-slate-500">Grouped from available records · ₦ per kilogram</p></div><div className="flex items-center gap-2"><Filter size={17} className="text-slate-400" /><select value={crop} onChange={(event) => setCrop(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-[#126b42]"><option value="all">All crops</option><option value="maize">Maize</option><option value="rice">Rice</option><option value="beans">Beans</option></select></div></div><div className="mt-8 h-[420px]">{chartData.length > 1 ? <ResponsiveContainer width="100%" height="100%"><RechartsLineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} width={60} /><Tooltip labelFormatter={(value) => formatDate(String(value))} formatter={(value: unknown) => [formatNaira(Number(value ?? 0)), 'Average price']} /><Legend /><Line name="Average price" type="monotone" dataKey="price" stroke="#126b42" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /></RechartsLineChart></ResponsiveContainer> : <Empty text="Not enough records for a trend yet." />}</div><div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f7faf7] p-4 text-sm text-slate-600"><Clock3 size={18} className="mt-0.5 shrink-0 text-[#55a936]" /><p>These are historical records from the connected source, not guaranteed live market quotes. Use the date and price type labels to understand the context.</p></div></div></DataState></div>; }

// ── Forecasts ────────────────────────────────────────────────────────────────

function useForecast(crop: string) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);
    fetchForecast(crop)
      .then(setData)
      .catch(() => setError('We could not reach the forecast service. It may be waking up on Render — please wait a moment and try again.'))
      .finally(() => setLoading(false));
  }, [crop, reloadKey]);
  return { data, loading, error, retry: () => setReloadKey((key) => key + 1) };
}

function ChangeCell({ pct }: { pct: number }) {
  const abs = Math.abs(pct).toFixed(1);
  if (pct > 0.05) return <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d9] px-2.5 py-1 text-xs font-bold text-[#9a6709]"><ArrowUp size={12} />+{abs}%</span>;
  if (pct < -0.05) return <span className="inline-flex items-center gap-1 rounded-full bg-[#fde9e9] px-2.5 py-1 text-xs font-bold text-[#b00020]"><ArrowDown size={12} />{abs}%</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"><Minus size={12} />Stable</span>;
}

function Forecasts() {
  const [crop, setCrop] = useState<'maize' | 'rice' | 'beans'>('maize');
  const [stateFilter, setStateFilter] = useState('all');
  const [marketQuery, setMarketQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;
  const { data, loading, error, retry } = useForecast(crop);

  const states = useMemo(
    () => [...new Set((data?.forecasts ?? []).map((item) => item.state))].sort(),
    [data],
  );

  const filtered: ForecastRecord[] = useMemo(
    () =>
      (data?.forecasts ?? []).filter(
        (item) =>
          (stateFilter === 'all' || item.state === stateFilter) &&
          item.market.toLowerCase().includes(marketQuery.toLowerCase()),
      ),
    [data, stateFilter, marketQuery],
  );

  const shown = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  function handleCropChange(value: 'maize' | 'rice' | 'beans') {
    setCrop(value);
    setStateFilter('all');
    setMarketQuery('');
    setPage(1);
  }

  const forecastMonthLabel = data?.forecasts?.[0]?.forecast_month
    ? formatDate(data.forecasts[0].forecast_month)
    : 'Next month';
  const lastMonthLabel = data?.forecasts?.[0]?.last_month
    ? formatDate(data.forecasts[0].last_month)
    : 'Last month';

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <PageHeader
        eyebrow="Forecast intelligence"
        title="Plan your next move with confidence."
        text={`XGBoost-model price forecasts for ${forecastMonthLabel}, generated from historical crop price data.`}
      />

      {/* Disclaimer banner */}
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-[#f0d8a0] bg-[#fffaf0] p-5">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-[#b7790b]" />
        <div className="text-sm leading-6 text-slate-700">
          <span className="font-bold text-[#9a6709]">Forecast disclaimer:</span>{' '}
          These figures are generated by an XGBoost machine-learning model trained on historical
          estimated price data. They are{' '}
          <span className="font-semibold">not live market quotes, guaranteed prices, or
          financial advice.</span>{' '}
          Actual market prices may differ. Use these forecasts as one input alongside your own
          local knowledge before making selling decisions.
        </div>
      </div>

      {/* Crop selector */}
      <div className="mb-7 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-600">Forecast for</span>
        {(['maize', 'rice', 'beans'] as const).map((value) => (
          <button
            key={value}
            onClick={() => handleCropChange(value)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${crop === value ? 'bg-[#126b42] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#126b42]'}`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <LoaderCircle className="mx-auto animate-spin text-[#126b42]" />
            <p className="mt-3 text-sm text-slate-500">Loading forecast data…</p>
            <p className="mt-1 text-xs text-slate-400">Loading the requested data…</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-[#f0d8a0] bg-[#fffaf0] p-8 text-center">
          <CircleAlert className="mx-auto text-[#b7790b]" />
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{error}</p>
          <button
            onClick={retry}
            className="mt-4 rounded-full bg-[#126b42] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0b5131]"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                value={marketQuery}
                onChange={(e) => { setMarketQuery(e.target.value); setPage(1); }}
                placeholder="Search by market name"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#126b42]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={17} className="text-slate-400" />
              <select
                value={stateFilter}
                onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#126b42]"
              >
                <option value="all">All states</option>
                {states.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f7faf7] px-4 py-3 text-xs text-slate-500">
            <span><span className="font-semibold text-[#103f2c]">{filtered.length.toLocaleString()}</span> forecast records</span>
            <span className="flex items-center gap-1.5"><Clock3 size={13} className="text-[#55a936]" />Forecast period: <span className="font-semibold">{forecastMonthLabel}</span> · Reference: <span className="font-semibold">{lastMonthLabel}</span></span>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-3 font-semibold">Market</th>
                  <th className="px-3 py-3 font-semibold">State</th>
                  <th className="px-3 py-3 font-semibold">{lastMonthLabel} Price</th>
                  <th className="px-3 py-3 font-semibold">{forecastMonthLabel} Forecast</th>
                  <th className="px-3 py-3 font-semibold">Expected change</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((item, idx) => (
                  <tr key={`${item.market}-${item.state}-${idx}`} className="border-b border-slate-100 last:border-0 hover:bg-[#f7faf7]">
                    <td className="px-3 py-4 font-bold text-[#103f2c]">{item.market}</td>
                    <td className="px-3 py-4 text-slate-600">{item.state}</td>
                    <td className="px-3 py-4 text-slate-600">
                      {formatNaira(item.last_price_ngn_per_kg)}
                      <span className="ml-1 text-xs text-slate-400">/ kg</span>
                    </td>
                    <td className="px-3 py-4 font-bold text-[#126b42]">
                      {formatNaira(item.forecast_ngn_per_kg)}
                      <span className="ml-1 text-xs font-normal text-slate-400">/ kg</span>
                    </td>
                    <td className="px-3 py-4">
                      <ChangeCell pct={item.change_percent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length === 0 && (
              <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-400">
                No forecast records match these filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 text-sm text-slate-500">
            <span>{filtered.length.toLocaleString()} matching forecasts</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Previous</button>
              <span className="px-2 py-2 font-semibold text-[#126b42]">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-100 bg-[#f7faf7] p-4 text-xs leading-5 text-slate-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#55a936]" />
            Model: XGBoost · Trained on historical estimated prices · Not a guarantee of future market prices
          </div>
        </div>
      )}
    </div>
  );
}

function Advisory() {
  const [crop, setCrop] = useState<'maize' | 'rice' | 'beans'>('maize');
  const [state, setState] = useState('all');
  const [transport, setTransport] = useState('');
  const { data, loading, error, retry } = useForecast(crop);
  const states = useMemo(() => [...new Set((data?.forecasts ?? []).map((r) => r.state))].sort(), [data]);
  const cost = transport.trim() === '' ? null : Number(transport);
  const validCost = cost === null || (Number.isFinite(cost) && cost >= 0);
  const ranked = useMemo(() => (data?.forecasts ?? [])
    .filter((r) => state === 'all' || r.state === state)
    .filter((r) => Number.isFinite(r.forecast_ngn_per_kg) && Number.isFinite(r.last_price_ngn_per_kg))
    .map((r) => ({ ...r, net: r.forecast_ngn_per_kg - (validCost && cost !== null ? cost : 0) }))
    .sort((a, b) => b.net - a.net), [data, state, cost, validCost]);
  const top = ranked.slice(0, 5);
  return <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <PageHeader eyebrow="Crop selling advisory" title="Find a promising market for your crop." text="Compare next-month model forecasts across available Nigerian markets and explore potential selling opportunities." />
    <div className="mb-7 rounded-2xl border border-[#f0d8a0] bg-[#fffaf0] p-5 text-sm leading-7 text-slate-700"><strong className="text-[#9a6709]">Important:</strong> This is a rule-based advisory powered by saved XGBoost forecasts, not a conversational AI agent or live price service. Forecasts are estimates, not guaranteed selling prices. Market accessibility, quality, fees, and actual transport costs must be checked independently.</div>
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
      <label className="text-sm font-semibold text-slate-700">Crop<select value={crop} onChange={(e) => { setCrop(e.target.value as typeof crop); setState('all'); }} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 font-normal capitalize"><option value="maize">Maize</option><option value="rice">Rice</option><option value="beans">Beans</option></select></label>
      <label className="text-sm font-semibold text-slate-700">Destination state<select value={state} onChange={(e) => setState(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 font-normal"><option value="all">All available states</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
      <label className="text-sm font-semibold text-slate-700">Estimated transport cost (₦/kg, optional)<input type="number" min="0" step="any" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="e.g. 25" className="mt-2 block w-full rounded-xl border border-slate-200 p-3 font-normal" /></label>
    </div>
    {!validCost && <p className="mt-3 text-sm text-red-700">Enter a non-negative transport cost, or leave it blank.</p>}
    <div className="mt-7"><DataState loading={loading} error={error} onRetry={retry}>
      {data && validCost && (top.length ? <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold text-[#103f2c]">Top forecast-price markets</h2><span className="text-sm text-slate-500">{ranked.length} markets compared · {data.forecasts[0]?.forecast_month ? formatDate(data.forecasts[0].forecast_month) : 'Next month'}</span></div>
        <div className="grid gap-4 md:grid-cols-2">{top.map((r, index) => <div key={r.market + r.state} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#55a936]">Rank {index + 1}</p><h3 className="mt-2 text-xl font-bold text-[#103f2c]">{r.market}</h3><p className="mt-1 text-sm text-slate-500">{r.state} State</p></div><MapPin className="text-[#126b42]" size={21} /></div><p className="mt-5 text-sm text-slate-500">Forecast selling price</p><p className="text-2xl font-bold text-[#126b42]">{formatNaira(r.forecast_ngn_per_kg)} <span className="text-sm font-normal text-slate-500">/kg</span></p><div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span>Expected change: <ChangeCell pct={r.change_percent} /></span></div>{cost !== null && <p className="mt-4 rounded-xl bg-[#f7faf7] p-3 text-sm">Estimated price after entered transport cost: <strong>{formatNaira(r.net)}/kg</strong></p>}</div>)}</div>
        <div className="mt-6 rounded-2xl bg-[#eaf5e9] p-5 text-sm leading-7 text-[#103f2c]"><strong>FarmDtech advisory:</strong> {top[0].market}, {top[0].state} has the highest forecast price {state === 'all' ? 'among the available markets' : 'in the selected state'}{cost !== null ? ' after subtracting your entered per-kg transport cost' : ''}. Compare actual buyer offers, transport distance, handling losses, and market fees before deciding where to sell. {top[0].change_percent > 0 ? 'The model estimates a price increase from the reference month, but this is not a guarantee.' : 'The model does not predict a price increase at this market, so compare current offers carefully.'}</div>
        <p className="mt-4 text-xs leading-6 text-slate-500">Ranking is based on forecast price per kilogram{cost !== null ? ' minus the same user-entered transport cost for every market' : ''}. A uniform cost does not change market order. This is not a personalized profitability estimate; no route distances, buyer demand, or market-specific fees are included.</p>
      </div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No forecast records match this selection.</div>)}
    </DataState></div>
  </div>;
}

function ComingSoon({ icon, eyebrow, title, body }: { icon: ReactNode; eyebrow: string; title: string; body: string }) { return <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="relative overflow-hidden rounded-[2rem] bg-[#103f2c] px-7 py-16 text-center text-white sm:px-16"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#55a936]/20 blur-3xl" /><div className="relative mx-auto max-w-2xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#55a936] text-[#103f2c]">{icon}</div><div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#d8efc8]"><span className="h-1.5 w-1.5 rounded-full bg-[#d89b24]" />Coming soon</div><p className="mt-7 text-sm font-bold uppercase tracking-[.18em] text-[#b9e09d]">{eyebrow}</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1><p className="mt-5 text-lg leading-8 text-slate-300">{body}</p><Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-[#103f2c] transition hover:bg-[#d8efc8]">Explore available data <ArrowRight size={17} /></Link></div></div></div>; }

function Footer() { return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-3"><img src="/images/FarmDtech_Official_Logo.png" alt="FarmDtech" className="h-10 w-auto object-contain" /><div><p className="text-sm font-bold text-[#103f2c]">Ask. Receive. Decide.</p><p className="text-xs text-slate-500">Crop price intelligence for Nigeria</p></div></div><p className="text-xs text-slate-400">Built for clearer agricultural decisions.</p></div></footer>; }

export default App;
