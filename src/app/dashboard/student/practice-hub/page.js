'use client';
import StudentAccess from '@/components/StudentAccess';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, PenTool, Type, Headphones,
  Bot, Lock, GraduationCap, BarChart3, X, Send,
  ClipboardCheck } from 'lucide-react';

const LEVELS = [
  { id: 'A1', name: 'Beginner', description: 'Build a strong foundation', unlocked: true },
  { id: 'A2', name: 'Elementary', description: 'Develop everyday English', unlocked: true },
  { id: 'B1', name: 'Intermediate', description: 'Practice with confidence', unlocked: true },
  { id: 'B2', name: 'Upper-intermediate', description: 'Coming soon', unlocked: false },
  { id: 'C1', name: 'Advanced', description: 'Coming soon', unlocked: false },
];
const SKILLS = [
  { label: 'Vocabulary', detail: 'Words, meaning and context', Icon: BookOpen, path: '/dashboard/student/practice/vocab-match' },
  { label: 'Grammar', detail: 'Structures in everyday English', Icon: PenTool, path: '/dashboard/student/practice/grammar-challenge' },
  { label: 'Spelling', detail: 'Accuracy and word recognition', Icon: Type, path: '/dashboard/student/practice/spelling-challenge' },
  { label: 'Listening', detail: 'Audio activities', Icon: Headphones, soon: true },
];

function PracticeHub() {
  const [activeLevel, setActiveLevel] = useState('A1');
  const [alOpen, setAlOpen] = useState(false);
  const level = LEVELS.find(item => item.id === activeLevel) || LEVELS[0];
  return (
    <div className="campus-page">
      <header className="campus-topbar sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between gap-4">
          <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-800 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4"/> <span>My Dashboard</span>
          </Link>
          <div className="inline-flex items-center gap-3">
            <span className="campus-brand-mark !w-9 !h-9"><BookOpen className="w-4 h-4"/></span>
            <div className="hidden sm:block"><p className="font-bold text-secondary-900 text-sm">Art &amp; Language</p><p className="text-xs text-neutral-500">Practice Hub</p></div>
          </div>
          <button type="button" onClick={() => setAlOpen(true)} className="btn btn-outline !px-3 sm:!px-4 text-sm">
            <Bot className="w-4 h-4"/> Ask AL
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
        <section className="campus-panel p-6 sm:p-8 lg:p-10 bg-white">
          <div className="max-w-3xl">
            <p className="campus-eyebrow mb-2">Independent learning</p>
            <h1 className="campus-heading mb-3">Practice at your own pace</h1>
            <p className="text-neutral-600 leading-relaxed">Choose your CEFR level and focus on the skill you want to strengthen. Work through short exercises and use AL whenever you need an explanation.</p>
          </div>
          <div className="mt-7 pt-6 border-t border-neutral-200">
            <h2 className="font-bold text-secondary-900 text-base mb-3">Select a level</h2>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select CEFR level">
              {LEVELS.map(item => (
                <button type="button" key={item.id} disabled={!item.unlocked} onClick={() => setActiveLevel(item.id)}
                  aria-pressed={activeLevel === item.id}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition-colors ${
                    activeLevel === item.id ? 'bg-secondary-900 border-secondary-900 text-white' :
                    item.unlocked ? 'bg-white border-neutral-300 text-secondary-800 hover:border-primary-500' :
                    'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
                  {!item.unlocked && <Lock className="w-3.5 h-3.5"/>}{item.id}
                  <span className="hidden sm:inline font-normal opacity-75">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="skills-title">
          <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
            <div>
              <p className="campus-eyebrow mb-1">{level.id} · {level.name}</p>
              <h2 id="skills-title" className="text-xl sm:text-2xl font-bold text-secondary-900">Choose your practice</h2>
              <p className="text-sm text-neutral-600 mt-1">{level.description}</p>
            </div>
            <Link href="/dashboard/student/placement-test" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline">
              <ClipboardCheck className="w-4 h-4"/> Placement test <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {SKILLS.map(({label,detail,Icon,path,soon}) => {
              const content = <>
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-5"><Icon className="w-6 h-6"/></div>
                <h3 className="text-lg font-bold text-secondary-900">{label}</h3>
                <p className="text-sm text-neutral-600 mt-2 min-h-[42px]">{detail}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary-700">
                  {soon ? <><Lock className="w-4 h-4"/> Coming soon</> : <>Start practice <ArrowRight className="w-4 h-4"/></>}
                </div>
              </>;
              return soon ? (
                <div key={label} className="campus-panel p-5 opacity-70" aria-label={`${label} coming soon`}>{content}</div>
              ) : (
                <Link key={label} href={`${path}?level=${activeLevel}`} className="campus-panel p-5 hover:border-primary-300 hover:shadow-medium transition-colors focus-visible:outline-offset-2">{content}</Link>
              );
            })}
          </div>
        </section>

        <section className="campus-panel p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-secondary-50 text-secondary-800 flex items-center justify-center flex-shrink-0"><Bot className="w-6 h-6"/></div>
          <div className="flex-1">
            <h2 className="font-bold text-secondary-900 text-lg">Ask AL — your learning assistant</h2>
            <p className="text-sm text-neutral-600 mt-1">Ask a question, review a grammar rule or request extra examples while you practice.</p>
          </div>
          <button type="button" onClick={() => setAlOpen(true)} className="btn btn-primary self-start sm:self-auto"><Bot className="w-4 h-4"/> Open assistant</button>
        </section>
        <p className="text-xs text-neutral-500">Practice activities are independent of your official worksheet grades unless your teacher assigns a graded activity.</p>
      </main>
      {alOpen && <ALModal onClose={() => setAlOpen(false)}/>}
    </div>
  );
}

function ALModal({onClose}) {
  const [messages,setMessages] = useState([{role:'assistant',text:"Hi! I'm AL, your English learning assistant. Ask me about grammar, vocabulary or spelling. What would you like to work on?"}]);
  const [input,setInput] = useState('');
  const [loading,setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);
  useEffect(() => {
    const esc = e => {if(e.key === 'Escape') onClose();};
    window.addEventListener('keydown',esc);
    return () => window.removeEventListener('keydown',esc);
  },[onClose]);
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();setInput('');
    setMessages(prev=>[...prev,{role:'user',text}]);setLoading(true);
    try {
      const response = await fetch('/api/al-assistant',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token') || ''}`},
        body:JSON.stringify({messages:[...messages.slice(1).map(m=>({role:m.role,content:m.text})),{role:'user',content:text}]}),
      });
      if (!response.ok) throw new Error(`Assistant error ${response.status}`);
      const data = await response.json();
      setMessages(prev=>[...prev,{role:'assistant',text:data.reply || 'Sorry, I could not respond. Please try again.'}]);
    } catch (error) {
      console.error('AL chat error:',error);
      setMessages(prev=>[...prev,{role:'assistant',text:'The assistant is unavailable right now. Please try again.'}]);
    } finally { setLoading(false); }
  };
  return <div className="fixed inset-0 z-[100] bg-secondary-900/60 p-3 sm:p-6 flex items-center justify-center" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-labelledby="al-dialog-title" onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl shadow-large w-full max-w-xl h-[min(620px,90vh)] flex flex-col overflow-hidden">
      <div className="bg-secondary-900 px-5 py-4 flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><Bot className="w-5 h-5"/></span>
        <div className="flex-1"><h2 id="al-dialog-title" className="text-white font-bold text-base">AL · Learning Assistant</h2><p className="text-secondary-200 text-xs">English practice support</p></div>
        <button type="button" onClick={onClose} className="p-2 rounded-lg text-white hover:bg-white/10" aria-label="Close assistant"><X className="w-5 h-5"/></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-3" aria-live="polite">
        {messages.map((message,index)=><div key={index} className={`flex ${message.role==='user'?'justify-end':'justify-start'}`}>
          <p className={`whitespace-pre-wrap text-sm leading-relaxed rounded-2xl px-4 py-3 max-w-[85%] ${message.role==='user'?'bg-primary-700 text-white':'bg-neutral-100 text-secondary-900'}`}>{message.text}</p>
        </div>)}
        {loading && <p className="text-xs text-neutral-500">AL is responding…</p>}
        <div ref={bottomRef}/>
      </div>
      <form className="p-3 sm:p-4 border-t border-neutral-200 flex gap-2" onSubmit={e=>{e.preventDefault();sendMessage();}}>
        <input className="input flex-1 min-w-0" value={input} onChange={e=>setInput(e.target.value)} disabled={loading} placeholder="Ask AL a question" aria-label="Message to AL"/>
        <button type="submit" className="btn btn-primary !px-4" disabled={loading || !input.trim()} aria-label="Send message"><Send className="w-5 h-5"/></button>
      </form>
    </div>
  </div>;
}
export default function GuardedStudentPage(){return <StudentAccess><PracticeHub/></StudentAccess>;}
