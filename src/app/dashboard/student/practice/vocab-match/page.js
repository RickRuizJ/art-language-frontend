'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, Zap, MessageCircle, X, Send, Loader,
  Timer, CheckCircle, Trophy, Target, BookOpen, Sparkles, Brain, Layers
} from 'lucide-react';

// ── Content by CEFR level ─────────────────────────────────────────────────────
const PAIRS_BY_LEVEL = {
  A1: [
    { word: 'Big', def: 'Large in size' },
    { word: 'Fast', def: 'Moving quickly' },
    { word: 'Cold', def: 'Low in temperature' },
    { word: 'Old', def: 'Having existed for a long time' },
    { word: 'New', def: 'Recently made or discovered' },
    { word: 'Good', def: 'Of high quality or ability' },
    { word: 'Long', def: 'Measuring a great distance' },
    { word: 'Short', def: 'Not long or tall' },
  ],
  A2: [
    { word: 'Angry', def: 'Feeling a strong emotion of displeasure' },
    { word: 'Tired', def: 'Feeling a need to rest or sleep' },
    { word: 'Hungry', def: 'Feeling a need to eat food' },
    { word: 'Busy', def: 'Doing many activities; not free' },
    { word: 'Cheap', def: 'Costing very little money' },
    { word: 'Noisy', def: 'Making a lot of loud sounds' },
    { word: 'Polite', def: 'Behaving in a respectful and kind way' },
    { word: 'Quiet', def: 'Making little or no sound' },
  ],
  B1: [
    { word: 'Abundant', def: 'Present in large quantities' },
    { word: 'Diligent', def: 'Hardworking and careful' },
    { word: 'Eloquent', def: 'Fluent and persuasive in speech' },
    { word: 'Frugal', def: 'Careful with money or resources' },
    { word: 'Genuine', def: 'Truly what something claims to be' },
    { word: 'Humble', def: 'Having a modest opinion of oneself' },
    { word: 'Inevitable', def: 'Certain to happen; unavoidable' },
    { word: 'Jubilant', def: 'Feeling great happiness and triumph' },
  ],
  B2: [
    { word: 'Ambiguous', def: 'Having more than one possible meaning' },
    { word: 'Coherent', def: 'Logical, consistent, and clearly expressed' },
    { word: 'Detrimental', def: 'Causing harm or damage' },
    { word: 'Empathy', def: 'Understanding and sharing another\'s feelings' },
    { word: 'Feasible', def: 'Possible and practical to do' },
    { word: 'Gratuitous', def: 'Uncalled for; lacking good reason' },
    { word: 'Imperative', def: 'Of vital importance; absolutely necessary' },
    { word: 'Lucid', def: 'Expressed clearly and easy to understand' },
  ],
  C1: [
    { word: 'Acrimonious', def: 'Bitter and angry in manner or tone' },
    { word: 'Benevolent', def: 'Well-meaning and kind; generous' },
    { word: 'Convoluted', def: 'Extremely complex and difficult to follow' },
    { word: 'Didactic', def: 'Designed to teach a moral lesson' },
    { word: 'Ephemeral', def: 'Lasting for only a short time' },
    { word: 'Fastidious', def: 'Very attentive to detail; hard to please' },
    { word: 'Hegemony', def: 'Leadership or dominance of one over others' },
    { word: 'Insidious', def: 'Proceeding gradually in a harmful way' },
  ],
};

const DEFAULT_LEVEL = 'B1';

const LEVEL_META = {
  A1: { color: '#16a34a', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', bg: '#f0fdf4', border: '#86efac', light: '#dcfce7', defColor: '#15803d', defBg: '#dcfce7', defBorder: '#4ade80' },
  A2: { color: '#15803d', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)', bg: '#dcfce7', border: '#4ade80', light: '#bbf7d0', defColor: '#14532d', defBg: '#bbf7d0', defBorder: '#22c55e' },
  B1: { color: '#2563eb', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)', bg: '#eff6ff', border: '#93c5fd', light: '#dbeafe', defColor: '#1d4ed8', defBg: '#dbeafe', defBorder: '#60a5fa' },
  B2: { color: '#1d4ed8', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', bg: '#dbeafe', border: '#60a5fa', light: '#bfdbfe', defColor: '#1e3a8a', defBg: '#bfdbfe', defBorder: '#3b82f6' },
  C1: { color: '#6d28d9', gradient: 'linear-gradient(135deg,#a78bfa,#6d28d9)', bg: '#faf5ff', border: '#c4b5fd', light: '#ede9fe', defColor: '#4c1d95', defBg: '#ede9fe', defBorder: '#a78bfa' },
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── AL Assistant ──────────────────────────────────────────────────────────────
function ALAssistant({ lastWord, lastDef, level, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const systemPrompt = `You are AL, a warm English vocabulary tutor in a matching game.
CEFR level: ${level}. The student just matched: "${lastWord}" = "${lastDef}".
Keep responses SHORT (max 3–4 sentences). Help them understand the word deeply — give a synonym, example sentence, or memory tip. Be encouraging and adapt language to the ${level} level.`;

  useEffect(() => {
    setMessages([{ role: 'assistant', content: `"${lastWord}" means "${lastDef}". Want an example sentence or a memory tip to help you remember it?` }]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/al-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }], systemPrompt }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again!' }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect." }]); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '78vh', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6d28d9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.35)' }}>
            <Brain size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>AL — Vocabulary Tutor</div>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />Online now
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f8fafc', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} color="#64748b" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '11px 15px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#6d28d9,#2563eb)' : '#f8fafc', color: msg.role === 'user' ? '#fff' : '#0f172a', fontSize: 14, fontWeight: 500, lineHeight: 1.55, boxShadow: msg.role === 'user' ? '0 4px 12px rgba(109,40,217,0.25)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Loader size={14} color="#6d28d9" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>AL is thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL about vocabulary…" style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '11px 15px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc' }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: 'linear-gradient(135deg,#6d28d9,#2563eb)', border: 'none', borderRadius: 14, width: 44, height: 44, cursor: 'pointer', opacity: !input.trim() || loading ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Results Screen ─────────────────────────────────────────────────────────────
function ResultsScreen({ score, accuracy, mins, secs, meta, onReplay }) {
  const grade = accuracy >= 80 ? { label: 'Near perfect accuracy!', icon: Trophy, color: '#f59e0b' }
    : accuracy >= 60 ? { label: 'Good matching! Keep it up!', icon: Target, color: '#3b82f6' }
      : { label: 'Keep practicing!', icon: BookOpen, color: '#8b5cf6' };

  return (
    <div style={{ background: '#fff', borderRadius: 28, padding: '48px 36px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg,${grade.color}22,${grade.color}44)`, border: `2px solid ${grade.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <grade.icon size={36} color={grade.color} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Excellent Work!</h2>
      <p style={{ color: '#64748b', marginBottom: 36, fontWeight: 600, fontSize: 16 }}>{grade.label}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40, background: '#f8fafc', borderRadius: 20, padding: '20px 16px', border: '1px solid #f1f5f9' }}>
        {[
          { val: score, label: 'Points', color: meta.color },
          { val: `${accuracy}%`, label: 'Accuracy', color: '#22c55e' },
          { val: `${mins}:${secs}`, label: 'Time', color: '#f97316' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none', padding: '0 12px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={onReplay} style={{ background: meta.gradient, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 6px 20px ${meta.color}40`, fontFamily: 'inherit' }}>
          <RotateCcw size={16} /> Play Again
        </button>
        <Link href="/dashboard/student/practice-hub" style={{ background: '#f8fafc', color: '#475569', borderRadius: 14, padding: '13px 28px', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e2e8f0' }}>
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </div>
    </div>
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function VocabMatchGame() {
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [pairs, setPairs] = useState([]);
  const [words, setWords] = useState([]);
  const [defs, setDefs] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [lastMatchedWord, setLastMatchedWord] = useState(null);
  const [showAL, setShowAL] = useState(false);
  const [matchAnim, setMatchAnim] = useState(null);

  const meta = LEVEL_META[level];

  const init = useCallback(() => {
    const pool = PAIRS_BY_LEVEL[level] || PAIRS_BY_LEVEL[DEFAULT_LEVEL];
    const chosen = shuffle(pool).slice(0, 6);
    setPairs(chosen); setWords(shuffle(chosen.map(p => p.word)));
    setDefs(shuffle(chosen.map(p => p.def)));
    setSelectedWord(null); setSelectedDef(null); setMatched([]);
    setWrongPair(null); setScore(0); setAttempts(0);
    setGameOver(false); setElapsed(0); setTimerActive(true);
    setLastMatchedWord(null); setShowAL(false); setMatchAnim(null);
  }, [level]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!timerActive || gameOver) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, gameOver]);

  useEffect(() => {
    if (!selectedWord || !selectedDef) return;
    const isMatch = pairs.find(p => p.word === selectedWord && p.def === selectedDef);
    setAttempts(a => a + 1);
    if (isMatch) {
      const newMatched = [...matched, selectedWord];
      setMatched(newMatched);
      setScore(s => s + 10);
      setLastMatchedWord(selectedWord);
      setMatchAnim(selectedWord);
      setTimeout(() => setMatchAnim(null), 700);
      setSelectedWord(null); setSelectedDef(null);
      if (newMatched.length === pairs.length) { setGameOver(true); setTimerActive(false); }
    } else {
      setWrongPair({ word: selectedWord, def: selectedDef });
      setTimeout(() => { setWrongPair(null); setSelectedWord(null); setSelectedDef(null); }, 750);
    }
  }, [selectedWord, selectedDef]);

  const accuracy = attempts > 0 ? Math.round((matched.length / attempts) * 100) : 100;
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  const progressPct = pairs.length > 0 ? (matched.length / pairs.length) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top,#f8fafc,#f1f5f9)', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/dashboard/student/practice-hub" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '6px 12px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
            <ArrowLeft size={15} /> Hub
          </Link>

          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(PAIRS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '5px 10px', borderRadius: 10, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e2e8f0'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#64748b', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{lv}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', borderRadius: 10, padding: '5px 10px', border: '1.5px solid #86efac' }}>
              <CheckCircle size={13} color="#16a34a" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#15803d' }}>{matched.length}/{pairs.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 10, padding: '5px 10px', border: '1.5px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', borderRadius: 10, padding: '5px 10px', border: '1.5px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 700 }}>
              <Timer size={13} />{mins}:{secs}
            </div>
            <button onClick={init} style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: 6, cursor: 'pointer', display: 'flex' }}>
              <RotateCcw size={14} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#f1f5f9' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: meta.gradient, transition: 'width 0.6s cubic-bezier(0.34,1.2,0.64,1)', borderRadius: '0 2px 2px 0', boxShadow: `0 1px 6px ${meta.color}40` }} />
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${meta.border}`, borderRadius: 14, padding: '8px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Layers size={18} color={meta.color} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Vocabulary Match</h1>
            <span style={{ background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 8, border: `1.5px solid ${meta.border}` }}>Level {level}</span>
          </div>
        </div>

        {gameOver ? (
          <ResultsScreen score={score} accuracy={accuracy} mins={mins} secs={secs} meta={meta} onReplay={init} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Words column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}60` }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>Words</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {words.map(word => {
                    const isMatched = matched.includes(word);
                    const isSelected = selectedWord === word;
                    const isWrong = wrongPair?.word === word;
                    const isAnimating = matchAnim === word;

                    let bg = '#fff', border = '#e2e8f0', textColor = '#0f172a', shadow = '0 1px 4px rgba(0,0,0,0.06)';
                    if (isMatched) { bg = '#f0fdf4'; border = '#4ade80'; textColor = '#14532d'; shadow = '0 2px 8px rgba(34,197,94,0.15)'; }
                    else if (isWrong) { bg = '#fef2f2'; border = '#f87171'; textColor = '#7f1d1d'; shadow = '0 2px 8px rgba(239,68,68,0.15)'; }
                    else if (isSelected) { bg = meta.bg; border = meta.color; textColor = meta.color; shadow = `0 0 0 3px ${meta.color}20, 0 4px 12px ${meta.color}15`; }

                    return (
                      <button
                        key={word}
                        disabled={isMatched}
                        onClick={() => !isMatched && setSelectedWord(isSelected ? null : word)}
                        className="match-card"
                        style={{
                          padding: '13px 16px', borderRadius: 14, border: `2px solid ${border}`,
                          background: bg, color: textColor, fontWeight: 800, fontSize: 15,
                          textAlign: 'left', cursor: isMatched ? 'default' : 'pointer',
                          transition: 'all 0.18s ease', fontFamily: 'inherit',
                          boxShadow: shadow,
                          transform: isAnimating ? 'scale(1.04)' : isWrong ? 'translateX(-4px)' : 'scale(1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          animation: isWrong ? 'shake 0.4s ease' : isAnimating ? 'matchPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                        }}
                      >
                        <span>{word}</span>
                        {isMatched && <CheckCircle size={16} color="#16a34a" strokeWidth={2.5} />}
                        {isSelected && !isMatched && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block', boxShadow: `0 0 0 3px ${meta.color}30` }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Definitions column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.defColor, boxShadow: `0 0 6px ${meta.defColor}60` }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>Definitions</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {defs.map(def => {
                    const matchPair = pairs.find(p => p.def === def && matched.includes(p.word));
                    const isMatched = !!matchPair;
                    const isSelected = selectedDef === def;
                    const isWrong = wrongPair?.def === def;

                    let bg = '#fff', border = '#e2e8f0', textColor = '#374151', shadow = '0 1px 4px rgba(0,0,0,0.06)';
                    if (isMatched) { bg = '#f0fdf4'; border = '#4ade80'; textColor = '#14532d'; shadow = '0 2px 8px rgba(34,197,94,0.15)'; }
                    else if (isWrong) { bg = '#fef2f2'; border = '#f87171'; textColor = '#7f1d1d'; shadow = '0 2px 8px rgba(239,68,68,0.15)'; }
                    else if (isSelected) { bg = meta.defBg; border = meta.defBorder; textColor = meta.defColor; shadow = `0 0 0 3px ${meta.defColor}15, 0 4px 12px ${meta.defColor}10`; }

                    return (
                      <button
                        key={def}
                        disabled={isMatched}
                        onClick={() => !isMatched && setSelectedDef(isSelected ? null : def)}
                        className="match-card"
                        style={{
                          padding: '13px 16px', borderRadius: 14, border: `2px solid ${border}`,
                          background: bg, color: textColor, fontWeight: 600, fontSize: 13,
                          textAlign: 'left', cursor: isMatched ? 'default' : 'pointer',
                          transition: 'all 0.18s ease', fontFamily: 'inherit',
                          lineHeight: 1.45, boxShadow: shadow,
                          animation: isWrong ? 'shake 0.4s ease' : 'none',
                        }}
                      >
                        {def}
                        {isMatched && (
                          <span style={{ display: 'block', marginTop: 6, fontSize: 11, fontWeight: 800, color: '#16a34a', letterSpacing: '0.3px' }}>
                            → {matchPair.word}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ask AL button */}
            {lastMatchedWord && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', animation: 'fadeUp 0.4s ease' }}>
                <button onClick={() => setShowAL(true)} style={{ background: 'linear-gradient(135deg,#6d28d9,#2563eb)', color: '#fff', border: 'none', borderRadius: 14, padding: '11px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(109,40,217,0.35)', fontFamily: 'inherit', transition: 'transform 0.15s, box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(109,40,217,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(109,40,217,0.35)'; }}>
                  <Sparkles size={15} /> Ask AL about "{lastMatchedWord}"
                </button>
              </div>
            )}

            {/* Instruction tip */}
            {!selectedWord && !selectedDef && matched.length === 0 && (
              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>👆</span> Select a word, then tap its matching definition
              </div>
            )}
            {selectedWord && !selectedDef && (
              <div style={{ marginTop: 20, textAlign: 'center', animation: 'fadeUp 0.2s ease' }}>
                <span style={{ display: 'inline-block', background: meta.bg, border: `1.5px solid ${meta.border}`, borderRadius: 12, padding: '8px 18px', fontSize: 13, fontWeight: 800, color: meta.color }}>
                  Now pick the definition for "{selectedWord}"
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {showAL && lastMatchedWord && (
        <ALAssistant
          lastWord={lastMatchedWord}
          lastDef={pairs.find(p => p.word === lastMatchedWord)?.def}
          level={level}
          onClose={() => setShowAL(false)}
        />
      )}

      <style>{`
        @keyframes fadeUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        @keyframes matchPop{0%{transform:scale(1)}40%{transform:scale(1.06)}70%{transform:scale(0.97)}100%{transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .match-card:not(:disabled):hover{transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(0,0,0,0.1)!important}
      `}</style>
    </div>
  );
}
