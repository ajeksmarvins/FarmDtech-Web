import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, RotateCcw, LoaderCircle, Database, Mic, Volume2, Languages } from 'lucide-react';
import { fetchForecast, formatNaira, type ForecastRecord } from '@/lib/api';

type Message = { role: 'assistant' | 'user'; text: string };
const welcome = 'Welcome to FarmDtech! Ask me about maize, rice or beans forecasts, or say something like “Where should I sell maize in Borno?” I use saved model forecasts, not live market prices.';
const examples = ['Where should I sell maize?', 'Compare rice markets in Kano', 'Which beans market has the highest forecast?'];
const cropWords: Record<string,string[]> = { maize: ['maize','corn','masara','agbado','oka'], rice: ['rice','shinkafa','iresi'], beans: ['beans','bean','cowpea','wake','ewa'] };
function detectCrop(text: string): string | null { const lower = text.toLowerCase(); return Object.entries(cropWords).find(([,words]) => words.some(w => new RegExp('\\b'+w+'\\b','i').test(lower)))?.[0] ?? null; }
function respond(question: string, data: ForecastRecord[], crop: string): string {
  const lower = question.toLowerCase();
  const states = [...new Set(data.map(r => r.state))];
  const state = states.find(s => lower.includes(s.toLowerCase()));
  const rows = data.filter(r => (!state || r.state === state) && Number.isFinite(r.forecast_ngn_per_kg)).sort((a,b)=>b.forecast_ngn_per_kg-a.forecast_ngn_per_kg);
  if (!rows.length) return 'I could not find saved forecasts for that location. Try asking about another state or leave out the state.';
  const month = rows[0].forecast_month;
  const top = rows.slice(0,3).map((r,i)=>`${i+1}. ${r.market}, ${r.state}: ${formatNaira(r.forecast_ngn_per_kg)}/kg`).join('\n');
  const isPidgin = /\b(abeg|wetin|dey|fit|wan|na|wey|make i)\b/i.test(question);
  if (isPidgin) return `For ${crop} ${state ? 'inside '+state : 'across available markets'}, na these markets get the highest saved forecast prices for ${month}:\n\n${top}\n\nNa prediction from historical estimated data, no be live market price. Check buyer offer, transport and market charges before you sell.`;
  if (/hello|^hi$|good morning|thank/i.test(lower)) return `Hello! I can compare saved ${crop} price forecasts. Try asking “Where should I sell ${crop}?”\n\nForecasts are estimates, not live market quotes.`;
  return `Here are the highest saved ${crop} price forecasts ${state ? 'in '+state : 'across available markets'} for ${month}:\n\n${top}\n\nThese are XGBoost estimates based on historical estimated prices, not verified live quotes or guaranteed profits. Check actual buyer offers, transport costs, storage and fees before deciding.`;
}
export default function AdvisoryChat() {
  const [messages,setMessages] = useState<Message[]>([{role:'assistant',text:welcome}]);
  const [input,setInput] = useState('');
  const [crop,setCrop] = useState('maize');
  const [language,setLanguage] = useState('auto');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages]);
  async function send(value?: string) {
    const q = (value ?? input).trim(); if (!q || busy) return;
    setInput(''); setNotice(''); setMessages(prev=>[...prev,{role:'user',text:q}]); setBusy(true);
    const requested = detectCrop(q) ?? crop; setCrop(requested);
    try {
      const result = await fetchForecast(requested);
      setMessages(prev=>[...prev,{role:'assistant',text:respond(q,result.forecasts,requested)}]);
    } catch {
      setMessages(prev=>[...prev,{role:'assistant',text:'I could not reach the forecast service right now. The server may be waking up. Please try again shortly.'}]);
    } finally {setBusy(false);}
  }
  function speak(text:string) {
    if (!('speechSynthesis' in window)) {setNotice('Speech playback is not available in this browser.');return;}
    window.speechSynthesis.cancel();
    const spoken = text
      .replace(/₦\\s*([\\d,]+(?:\\.\\d+)?)\\s*\\/\\s*kg/gi, (_, amount:string) => `${Number(amount.replace(/,/g, '')).toLocaleString('en-NG')} naira per kilogram`)
      .replace(/₦\\s*([\\d,]+(?:\\.\\d+)?)/g, (_, amount:string) => `${Number(amount.replace(/,/g, '')).toLocaleString('en-NG')} naira`)
      .replace(/\\b(20\\d{2})-(\\d{2})-(\\d{2})\\b/g, (match:string, y:string, m:string, d:string) => {
        const date = new Date(Number(y), Number(m)-1, Number(d));
        return Number.isNaN(date.getTime()) ? match : new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(date);
      })
      .replace(/\\bXGBoost\\b/g, 'X G Boost')
      .replace(/\\bkg\\b/g, 'kilograms')
      .replace(/\\n{2,}/g, '. ')
      .replace(/\\n/g, '. ');
    const u = new SpeechSynthesisUtterance(spoken);
    const preferredLang = language === 'auto' ? 'en-NG' : language;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v=>v.lang.toLowerCase()===preferredLang.toLowerCase())
      ?? voices.find(v=>v.lang.toLowerCase()==='en-ng')
      ?? voices.find(v=>v.lang.toLowerCase().startsWith('en-'))
      ?? voices.find(v=>v.lang.toLowerCase().startsWith('en'));
    if (voice) {u.voice=voice;u.lang=voice.lang;} else {u.lang='en-GB';}
    u.rate=0.88;
    u.pitch=1;
    u.onerror=()=>setNotice('Speech playback could not complete on this device.');
    window.speechSynthesis.speak(u);
  }
  function microphone() {setNotice('Voice recognition for Nigerian languages is being tested. Please type your question for now; the microphone is not yet active.');}
  return <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#55a936]">FarmDtech advisory</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#103f2c] sm:text-5xl">Your farming questions, answered.</h1><p className="mt-3 max-w-2xl text-slate-600">Explore crop selling opportunities through a simple conversation. Grounded in FarmDtech's saved price forecasts.</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><div className="rounded-xl bg-[#e8f5e8] p-2.5 text-[#126b42]"><Bot size={22}/></div><div className="flex-1"><h2 className="font-bold text-[#103f2c]">FarmDtech Forecast Assistant</h2><p className="text-xs text-slate-500">Data-grounded chat · AI language integration in progress</p></div><button onClick={()=>{setMessages([{role:'assistant',text:welcome}]);setNotice('');}} title="New conversation" aria-label="New conversation" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-[#126b42]"><RotateCcw size={17}/></button></div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-[#fbfdfb] px-4 py-6 sm:px-6" style={{maxHeight:510}} aria-live="polite">
          {messages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${m.role==='user'?'bg-[#126b42] text-white':'border border-slate-200 bg-white text-slate-700 shadow-sm'}`}><p className="whitespace-pre-line">{m.text}</p>{m.role==='assistant'&&<button onClick={()=>speak(m.text)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#126b42]" title="Listen to response"><Volume2 size={14}/> Listen</button>}</div></div>)}
          {busy&&<div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Checking saved forecasts…</div>}
          <div ref={bottom}/>
        </div>
        <div className="border-t border-slate-100 bg-white p-4"><form onSubmit={e=>{e.preventDefault();void send();}} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f9fbf9] p-2 focus-within:border-[#126b42]"><input aria-label="Ask a farming question" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder="Ask about a crop or market..." value={input} onChange={e=>setInput(e.target.value)} maxLength={500}/><button type="button" onClick={microphone} title="Voice input status" aria-label="Voice input status" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Mic size={19}/></button><button type="submit" disabled={!input.trim()||busy} aria-label="Send message" className="rounded-xl bg-[#126b42] p-2.5 text-white disabled:opacity-40"><Send size={18}/></button></form>{notice&&<p role="status" className="mt-2 text-xs text-amber-700">{notice}</p>}<p className="mt-2 text-center text-[11px] text-slate-400">Model forecasts are estimates, not live market quotes or guaranteed prices.</p></div>
      </div>
      <aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#103f2c]"><Languages size={18}/> Language preferences</div><select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="auto">Auto (text recognition planned)</option><option value="en-NG">English</option><option value="ha-NG">Hausa (voice unverified)</option><option value="yo-NG">Yoruba (voice unverified)</option><option value="ig-NG">Igbo (voice unverified)</option><option value="pcm-NG">Nigerian Pidgin (voice unverified)</option></select><p className="mt-3 text-xs leading-5 text-slate-500">Current forecast responses support English and basic Pidgin. Full multilingual AI and speech recognition are being developed.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#103f2c]"><Sparkles size={18}/> Try asking</div><div className="space-y-2">{examples.map(e=><button key={e} onClick={()=>void send(e)} disabled={busy} className="block w-full rounded-xl border border-slate-100 bg-[#f7faf7] px-3 py-3 text-left text-sm text-slate-700 hover:border-[#a8d5b0] disabled:opacity-50">{e}</button>)}</div></div><div className="rounded-2xl bg-[#eaf5e9] p-5 text-sm leading-6 text-[#103f2c]"><div className="mb-2 flex items-center gap-2 font-bold"><Database size={18}/> Data transparency</div>Responses compare saved XGBoost forecasts for maize, rice and beans. We do not claim these are current buyer offers.</div></aside>
    </div>
  </section>;
}
