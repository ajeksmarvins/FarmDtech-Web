import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bot, Send, Sparkles, RotateCcw, LoaderCircle, Database, Mic, Volume2, Square, Languages } from 'lucide-react';

type Message = { role: 'assistant' | 'user'; text: string };
type BrowserRecognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type SpeechBrowser = Window & { SpeechRecognition?: new () => BrowserRecognition; webkitSpeechRecognition?: new () => BrowserRecognition };
const welcome = 'Welcome to FarmDtech! Ask me about maize, rice or beans forecasts, or say something like “Where should I sell maize in Borno?” I use saved model forecasts, not live market prices.';
const examples = ['Where should I sell maize?', 'Compare rice markets in Kano', 'Which beans market has the highest forecast?'];
// Render common Gemini Markdown as safe React elements, without injecting HTML.
function inlineMarkdown(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g);
  return tokens.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-semibold">{part.slice(2,-2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1,-1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{link[1]}</a>;
    return part;
  });
}
function MessageText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g,'\n').split('\n');
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={blocks.length} className="my-2 leading-6">{inlineMarkdown(paragraph.join(' '))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const children = list.items.map((item, i) => <li key={i} className="pl-1">{inlineMarkdown(item)}</li>);
    blocks.push(list.ordered
      ? <ol key={blocks.length} className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
      : <ul key={blocks.length} className="my-2 list-disc space-y-1 pl-5">{children}</ul>);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {flushParagraph();flushList();continue;}
    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading) {
      flushParagraph();flushList();
      blocks.push(<h3 key={blocks.length} className="mb-1 mt-3 font-bold text-[#103f2c]">{inlineMarkdown(heading[1])}</h3>);
      continue;
    }
    const item = line.match(/^(\d+[.)]|[-•])\s+(.+)$/);
    if (item) {
      flushParagraph();
      const ordered = /^\d/.test(item[1]);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(item[2]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();flushList();
  return <div className="min-w-0 break-words [overflow-wrap:anywhere]">{blocks}</div>;
}
export default function AdvisoryChat() {
  const [messages,setMessages] = useState<Message[]>([{role:'assistant',text:welcome}]);
  const [input,setInput] = useState('');
  const [language,setLanguage] = useState('auto');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [availableVoices,setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice,setSelectedVoice] = useState('Samantha|en-US');
  const [speechRate,setSpeechRate] = useState(1);
  const [listening,setListening] = useState(false);
  const [speakingIndex,setSpeakingIndex] = useState<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [showVoiceSettings,setShowVoiceSettings] = useState(false);
  const recognitionRef = useRef<BrowserRecognition | null>(null);
  useEffect(() => () => {recognitionRef.current?.stop();window.speechSynthesis?.cancel();}, []);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const refresh = () => setAvailableVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, []);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages]);
  async function send(value?: string) {
    const q = (value ?? input).trim(); if (!q || busy) return;
    const prior = messages.slice(1).slice(-10).map(m => ({role:m.role,content:m.text.slice(0,1500)}));
    setInput(''); setNotice(''); setMessages(prev=>[...prev,{role:'user',text:q}]); setBusy(true);
    try {
      const response = await fetch('https://farmdtech.onrender.com/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:q,history:prior,language})
      });
      if (!response.ok) {
        const payload = await response.json().catch(()=>null);
        throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'AI service is unavailable right now.');
      }
      const payload = await response.json();
      if (typeof payload.reply !== 'string' || !payload.reply.trim()) throw new Error('No response was returned.');
      setMessages(prev=>[...prev,{role:'assistant',text:payload.reply}]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Please try again.';
      setMessages(prev=>[...prev,{role:'assistant',text:`I could not answer that right now. ${detail}`}]);
    } finally {setBusy(false);}
  }
  function speak(text:string, index:number) {
    if (speakingIndex === index) {
      window.speechSynthesis?.cancel();
      speechRef.current = null;
      setSpeakingIndex(null);
      return;
    }
    if (!('speechSynthesis' in window)) {setNotice('Speech playback is not available in this browser.');return;}
    window.speechSynthesis.cancel();
    speechRef.current = null;
    setSpeakingIndex(null);
    setNotice('');
    const spoken = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#>]/g, '')
      .replace(/₦\s*([\d,]+(?:\.\d+)?)\s*\/\s*kg/gi, (_, amount:string) => `${Number(amount.replace(/,/g, '')).toLocaleString('en-NG')} naira per kilogram`)
      .replace(/₦\s*([\d,]+(?:\.\d+)?)/g, (_, amount:string) => `${Number(amount.replace(/,/g, '')).toLocaleString('en-NG')} naira`)
      .replace(/\b(20\d{2})-(\d{2})-(\d{2})\b/g, (match:string, y:string, m:string, d:string) => {
        const date = new Date(Number(y), Number(m)-1, Number(d));
        return Number.isNaN(date.getTime()) ? match : new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(date);
      })
      .replace(/\bXGBoost\b/gi, 'X G Boost')
      .replace(/\bkg\b/gi, 'kilograms')
      .replace(/\bNGN\b/g, 'Nigerian naira')
      .replace(/\n\s*[-•]\s*/g, '. ')
      .replace(/\n+/g, '. ')
      .replace(/\.{2,}/g, '.')
      .trim();
    const u = new SpeechSynthesisUtterance(spoken);
    const voices = window.speechSynthesis.getVoices();
    const preferredLang = language === 'auto' ? 'en-NG' : language;
    const normalized = preferredLang.toLowerCase();
    const matchingVoices = voices.filter(v => v.lang.toLowerCase() === normalized || v.lang.toLowerCase().startsWith(normalized.split('-')[0] + '-'));
    const isEnglish = language === 'auto' || language === 'en-NG';
    const chosenVoice = voices.find(v => `${v.name}|${v.lang}` === selectedVoice);
    const voice = isEnglish
      ? (selectedVoice !== 'auto' && chosenVoice?.lang.toLowerCase().startsWith('en') ? chosenVoice : undefined)
        ?? matchingVoices[0]
        ?? voices.find(v => v.lang.toLowerCase() === 'en-ng')
        ?? voices.find(v => v.lang.toLowerCase().startsWith('en'))
      : matchingVoices[0];
    if (!voice && !isEnglish) {
      setNotice('Your device has no matching voice for this language. The written answer is available, but English speech would pronounce it incorrectly.');
      return;
    }
    if (voice) {u.voice=voice;u.lang=voice.lang;} else {u.lang=preferredLang;}
    u.rate=speechRate;
    u.pitch=1;
    speechRef.current = u;
    u.onstart = () => {if (speechRef.current === u) setSpeakingIndex(index);};
    u.onend = () => {if (speechRef.current === u) {speechRef.current=null;setSpeakingIndex(null);}};
    u.onerror = event => {if (speechRef.current === u) {speechRef.current=null;setSpeakingIndex(null);if (event.error !== 'canceled' && event.error !== 'interrupted') setNotice('Speech playback could not complete on this device.');}};
    setSpeakingIndex(index);
    window.speechSynthesis.speak(u);
  }
  function microphone() {
    if (listening) {recognitionRef.current?.stop();return;}
    const browser = window as SpeechBrowser;
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice('Voice typing is not supported here. Try your keyboard microphone instead.');
      return;
    }
    try {
      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'auto' ? 'en-NG' : language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = event => {
        const transcript = event.results[0]?.[0]?.transcript?.trim();
        if (transcript) {setInput(transcript);setNotice('Voice captured. Review your question, then tap Send.');}
      };
      recognition.onerror = event => {
        setListening(false);
        setNotice(event.error === 'not-allowed' ? 'Allow microphone access in browser settings.' : 'Speech could not be recognized. Try again or type.');
      };
      recognition.onend = () => {setListening(false);recognitionRef.current=null;};
      recognition.start();
      setListening(true);
      setNotice('Listening… speak your question.');
    } catch {
      setListening(false);
      setNotice('Could not start voice recognition. Please type your question.');
    }
  }
  return <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-5 lg:px-8">
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#55a936]">FarmDtech advisory</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#103f2c] sm:text-5xl">Your farming questions, answered.</h1><p className="mt-3 max-w-2xl text-slate-600">Explore crop selling opportunities through a simple conversation. Grounded in FarmDtech's saved price forecasts.</p></div>
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 min-h-[600px] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><div className="rounded-xl bg-[#e8f5e8] p-2.5 text-[#126b42]"><Bot size={22}/></div><div className="min-w-0 flex-1"><h2 className="font-bold text-[#103f2c]">FarmDtech Forecast Assistant</h2><p className="text-xs text-slate-500">Gemini AI · Saved forecast context</p></div><button onClick={()=>{window.speechSynthesis?.cancel();speechRef.current=null;setSpeakingIndex(null);setMessages([{role:'assistant',text:welcome}]);setNotice('');}} title="New conversation" aria-label="New conversation" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-[#126b42]"><RotateCcw size={17}/></button></div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-[#fbfdfb] px-4 py-6 sm:px-6" style={{maxHeight:510}} aria-live="polite">
          {messages.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${m.role==='user'?'bg-[#126b42] text-white':'border border-slate-200 bg-white text-slate-700 shadow-sm'}`}><MessageText text={m.text}/>{m.role==='assistant'&&<button onClick={()=>speak(m.text,i)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#126b42]" title={speakingIndex===i ? "Stop reading" : "Listen to response"} aria-label={speakingIndex===i ? "Stop reading" : "Listen to response"}>{speakingIndex===i ? <><Square size={14} fill="currentColor"/> Stop</> : <><Volume2 size={14}/> Listen</>}</button>}</div></div>)}
          {busy&&<div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Checking saved forecasts…</div>}
          <div ref={bottom}/>
        </div>
        <div className="border-t border-slate-100 bg-white p-4"><form onSubmit={e=>{e.preventDefault();void send();}} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f9fbf9] p-2 focus-within:border-[#126b42]"><input aria-label="Ask a farming question" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder="Ask about a crop or market..." value={input} onChange={e=>setInput(e.target.value)} maxLength={500}/><button type="button" onClick={microphone} title={listening ? 'Stop listening' : 'Dictate a question'} aria-label={listening ? 'Stop listening' : 'Dictate a question'} className={listening ? 'rounded-xl bg-red-100 p-2 text-red-700' : 'rounded-xl p-2 text-slate-500 hover:bg-slate-100'}><Mic size={19}/></button><button type="submit" disabled={!input.trim()||busy} aria-label="Send message" className="rounded-xl bg-[#126b42] p-2.5 text-white disabled:opacity-40"><Send size={18}/></button></form>{notice&&<p role="status" className="mt-2 text-xs text-amber-700">{notice}</p>}<p className="mt-2 text-center text-[11px] text-slate-400">Model forecasts are estimates, not live market quotes or guaranteed prices.</p></div>
      </div>
      <aside className="min-w-0 space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#103f2c]"><Languages size={18}/> Language preferences</div><select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="auto">Auto (follow your language)</option><option value="en-NG">English</option><option value="ha-NG">Hausa</option><option value="yo-NG">Yoruba</option><option value="ig-NG">Igbo</option><option value="pcm-NG">Nigerian Pidgin</option></select><button type="button" onClick={()=>setShowVoiceSettings(open=>!open)} aria-expanded={showVoiceSettings} className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-[#f7faf7] px-3 py-2.5 text-left text-sm font-semibold text-[#126b42]"><span>Voice settings</span><span aria-hidden="true">{showVoiceSettings ? '−' : '+'}</span></button>{showVoiceSettings&&<div className="mt-3"><label className="block text-xs font-semibold text-slate-600" htmlFor="voice-choice">Listen voice</label><select id="voice-choice" value={selectedVoice} onChange={e=>setSelectedVoice(e.target.value)} className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="auto">Automatic (prefer Nigerian English)</option>{selectedVoice==='Samantha|en-US'&&!availableVoices.some(v=>v.name==='Samantha'&&v.lang==='en-US')&&<option value="Samantha|en-US">Samantha (if available)</option>}{availableVoices.filter(v=>v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase()===language.toLowerCase()).map(v=><option key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>{v.name} ({v.lang})</option>)}</select><label className="mt-4 block text-xs font-semibold text-slate-600" htmlFor="speech-rate">Speaking speed: {speechRate.toFixed(2)}×</label><input id="speech-rate" type="range" min="0.8" max="1.1" step="0.05" value={speechRate} onChange={e=>setSpeechRate(Number(e.target.value))} className="mt-2 w-full accent-[#126b42]"/><p className="mt-3 text-xs leading-5 text-slate-500">Samantha is preferred for English where available. For other languages, FarmDtech uses a matching device voice if one exists. Microphone recognition depends on browser support.</p></div>}</div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#103f2c]"><Sparkles size={18}/> Try asking</div><div className="space-y-2">{examples.map(e=><button key={e} onClick={()=>void send(e)} disabled={busy} className="block w-full rounded-xl border border-slate-100 bg-[#f7faf7] px-3 py-3 text-left text-sm text-slate-700 hover:border-[#a8d5b0] disabled:opacity-50">{e}</button>)}</div></div><div className="rounded-2xl bg-[#eaf5e9] p-5 text-sm leading-6 text-[#103f2c]"><div className="mb-2 flex items-center gap-2 font-bold"><Database size={18}/> Data transparency</div>Gemini can answer general farming questions and reference saved XGBoost forecasts for maize, rice and beans. Forecasts are not live buyer offers.</div></aside>
    </div>
  </section>;
}
