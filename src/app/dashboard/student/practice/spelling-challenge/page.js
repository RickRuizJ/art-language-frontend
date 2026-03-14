'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, CheckCircle, XCircle, Zap, MessageCircle,
  X, Send, Loader, Volume2, PenLine, Trophy, Target, BookOpen,
  ChevronRight, Sparkles, Brain
} from 'lucide-react';

// ── Content by CEFR level ─────────────────────────────────────────────────────
const WORDS_BY_LEVEL = {
  A1: [
    { word: 'apple', hint: 'A round fruit, often red or green' },
    { word: 'happy', hint: 'Feeling very good and pleased' },
    { word: 'water', hint: 'The clear liquid we drink' },
    { word: 'house', hint: 'A building where people live' },
    { word: 'school', hint: 'A place where children learn' },
    { word: 'chair', hint: 'A piece of furniture to sit on' },
    { word: 'friend', hint: 'A person you like and trust' },
    { word: 'table', hint: 'A flat surface with legs to put things on' },
    { word: 'night', hint: 'The dark part of the day' },
    { word: 'bread', hint: 'A baked food made from flour' },
  ],
  A2: [
    { word: 'beautiful', hint: 'Very attractive and pleasing to look at' },
    { word: 'because', hint: 'Used to give a reason: "I did it ___ I wanted to"' },
    { word: 'birthday', hint: 'The day you were born, celebrated each year' },
    { word: 'purple', hint: 'A colour that mixes red and blue' },
    { word: 'sandwich', hint: 'Food between two slices of bread' },
    { word: 'library', hint: 'A place full of books to read or borrow' },
    { word: 'kitchen', hint: 'The room in a house where you cook food' },
    { word: 'outside', hint: 'Not inside — in the open air' },
    { word: 'children', hint: 'Young people; the plural of "child"' },
    { word: 'always', hint: 'At all times, every single time' },
  ],
  B1: [
    { word: 'necessary', hint: 'Something you must have or do' },
    { word: 'accommodate', hint: 'To provide space or meet someone\'s needs' },
    { word: 'definitely', hint: 'Without any doubt at all' },
    { word: 'environment', hint: 'The natural world that surrounds us' },
    { word: 'government', hint: 'The system that rules a country' },
    { word: 'knowledge', hint: 'Facts and information you have learned' },
    { word: 'especially', hint: 'More than usual; particularly' },
    { word: 'receive', hint: 'To get or be given something' },
    { word: 'separate', hint: 'To divide something into parts' },
    { word: 'colleague', hint: 'A person you work with' },
  ],
  B2: [
    { word: 'occurred', hint: 'Past tense of "happen" — an irregular word' },
    { word: 'privilege', hint: 'A special right or advantage not everyone has' },
    { word: 'conscience', hint: 'Your inner sense of right and wrong' },
    { word: 'embarrass', hint: 'To make someone feel awkward or ashamed' },
    { word: 'exaggerate', hint: 'To make something seem bigger than it really is' },
    { word: 'parliament', hint: 'A country\'s group of elected lawmakers' },
    { word: 'occasionally', hint: 'Sometimes, but not very often' },
    { word: 'particularly', hint: 'Especially; more than usual' },
    { word: 'questionnaire', hint: 'A set of written questions to gather information' },
    { word: 'immediately', hint: 'Right away, without any delay' },
  ],
  C1: [
    { word: 'conscientious', hint: 'Careful and thorough in doing work' },
    { word: 'entrepreneur', hint: 'A person who starts and runs businesses' },
    { word: 'bureaucratic', hint: 'Relating to complex official systems and rules' },
    { word: 'supersede', hint: 'To replace something with something newer or better' },
    { word: 'inoculate', hint: 'To give a vaccine to prevent a disease' },
    { word: 'Mediterranean', hint: 'The large sea between Europe and Africa' },
    { word: 'acquaintance', hint: 'A person you know, but not very well' },
    { word: 'millennium', hint: 'A period of one thousand years' },
    { word: 'plagiarism', hint: 'Copying someone\'s work and pretending it\'s yours' },
    { word: 'surveillance', hint: 'Close observation of someone or something' },
  ],
};

const DEFAULT_LEVEL = 'B1';

const LEVEL_META = {
  A1: { color: '#16a34a', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', bg: '#f0fdf4', border: '#86efac', light: '#dcfce7', text: '#14532d' },
  A2: { color: '#15803d', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)', bg: '#dcfce7', border: '#4ade80', light: '#bbf7d0', text: '#14532d' },
  B1: { color: '#2563eb', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)', bg: '#eff6ff', border: '#93c5fd', light: '#dbeafe', text: '#1e3a8a' },
  B2: { color: '#1d4ed8', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', bg: '#dbeafe', border: '#60a5fa', light: '#bfdbfe', text: '#1e3a8a' },
  C1: { color: '#6d28d9', gradient: 'linear-gradient(135deg,#a78bfa,#6d28d9)', bg: '#faf5ff', border: '#c4b5fd', light: '#ede9fe', text: '#3b0764' },
};

// ── AL Assistant ──────────────────────────────────────────────────────────────
function ALAssistant({ word, userAnswer, level, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const isCorrect = userAnswer?.toLowerCase() === word.toLowerCase();

  const systemPrompt = `You are AL, a warm English tutor assistant in a spelling game.
CEFR level: ${level}. Word to spell: "${word}". Student typed: "${userAnswer || 'nothing yet'}".
Keep responses SHORT (max 3–4 sentences). Be supportive and use simple language for lower levels.
For spelling help, you can give memory tricks, break the word into parts, or point out common mistakes.`;

  useEffect(() => {
    const greet = userAnswer
      ? isCorrect
        ? `Perfect spelling! "${word}" — you got it! Want a memory trick to help remember it?`
        : `Close! The correct spelling is "${word}". Want a memory tip to help you remember it?`
      : `Hi! I'm AL, your spelling coach. Need help with "${word}"? I can give you tricks and tips!`;
    setMessages([{ role: 'assistant', content: greet }]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/al-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }], systemPrompt }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again!' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect. Try again." }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', maxHeight: '78vh', animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6d28d9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.35)' }}>
            <Brain size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>AL — Spelling Coach</div>
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 4px' }}>
              <Loader size={14} color="#6d28d9" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>AL is thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL for spelling tips…" style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '11px 15px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc' }} />
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
function ResultsScreen({ score, correctCount, total, accuracy, meta, onReplay }) {
  const grade = accuracy >= 80 ? { label: 'Excellent spelling!', icon: Trophy, color: '#f59e0b' }
    : accuracy >= 50 ? { label: 'Good effort! Keep practicing!', icon: Target, color: '#3b82f6' }
      : { label: 'Practice makes perfect!', icon: BookOpen, color: '#8b5cf6' };

  return (
    <div style={{ background: '#fff', borderRadius: 28, padding: '48px 36px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg,${grade.color}22,${grade.color}44)`, border: `2px solid ${grade.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <grade.icon size={36} color={grade.color} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>All done!</h2>
      <p style={{ color: '#64748b', marginBottom: 36, fontWeight: 600, fontSize: 16 }}>{grade.label}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40, background: '#f8fafc', borderRadius: 20, padding: '20px 16px', border: '1px solid #f1f5f9' }}>
        {[
          { val: score, label: 'Points', color: meta.color },
          { val: `${correctCount}/${total}`, label: 'Correct', color: '#22c55e' },
          { val: `${accuracy}%`, label: 'Accuracy', color: '#f97316' },
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
export default function SpellingChallenge() {
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [wordList, setWordList] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [showAL, setShowAL] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const inputRef = useRef(null);

  const meta = LEVEL_META[level];

  const init = useCallback(() => {
    const pool = WORDS_BY_LEVEL[level] || WORDS_BY_LEVEL[DEFAULT_LEVEL];
    setWordList([...pool].sort(() => Math.random() - 0.5).slice(0, 8));
    setIdx(0); setInput(''); setSubmitted(false);
    setIsCorrect(false); setScore(0); setGameOver(false); setShake(false);
  }, [level]);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (!submitted && inputRef.current) inputRef.current.focus(); }, [idx, submitted]);

  function speakWord(word) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US'; u.rate = 0.85;
      setSpeaking(true);
      u.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || submitted) return;
    const correct = input.trim().toLowerCase() === wordList[idx].word.toLowerCase();
    setIsCorrect(correct); setSubmitted(true);
    if (correct) { setScore(s => s + 10); }
    else { setShake(true); setTimeout(() => setShake(false), 500); }
  }

  function handleNext() {
    const nextIdx = idx + 1;
    if (nextIdx >= wordList.length) { setGameOver(true); }
    else { setIdx(nextIdx); setInput(''); setSubmitted(false); setIsCorrect(false); }
  }

  if (!wordList.length) return null;
  const current = wordList[idx];
  const correctCount = score / 10;
  const answeredCount = idx + (submitted ? 1 : 0);
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 100;
  const progressPct = (idx / wordList.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: submitted ? (isCorrect ? 'radial-gradient(ellipse at top,#f0fdf4,#f8fafc)' : 'radial-gradient(ellipse at top,#fef2f2,#f8fafc)') : 'radial-gradient(ellipse at top,#f8fafc,#f1f5f9)', transition: 'background 0.5s', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/dashboard/student/practice-hub" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '6px 12px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
            <ArrowLeft size={15} /> Hub
          </Link>

          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(WORDS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '5px 10px', borderRadius: 10, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e2e8f0'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#64748b', fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{lv}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 10, padding: '5px 10px', border: '1.5px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <button onClick={init} style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: 6, cursor: 'pointer', display: 'flex' }}>
              <RotateCcw size={14} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Dot-style progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0 6px', borderTop: '1px solid #f1f5f9' }}>
          {wordList.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 22 : 10, height: 10, borderRadius: 999,
              background: i < idx ? meta.color : i === idx ? meta.color : '#e2e8f0',
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              opacity: i < idx ? 0.55 : 1,
              boxShadow: i === idx ? `0 2px 8px ${meta.color}50` : 'none',
            }} />
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${meta.border}`, borderRadius: 14, padding: '8px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <PenLine size={18} color={meta.color} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Spelling Challenge</h1>
            <span style={{ background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 8, border: `1.5px solid ${meta.border}` }}>Level {level} · {idx + 1}/{wordList.length}</span>
          </div>
        </div>

        {gameOver ? (
          <ResultsScreen score={score} correctCount={correctCount} total={wordList.length} accuracy={accuracy} meta={meta} onReplay={init} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 24, border: `2px solid ${submitted ? (isCorrect ? '#4ade80' : '#f87171') : '#f1f5f9'}`, padding: '28px', boxShadow: submitted ? (isCorrect ? '0 8px 32px rgba(34,197,94,0.12)' : '0 8px 32px rgba(239,68,68,0.08)') : '0 8px 32px rgba(0,0,0,0.06)', transition: 'border-color 0.3s, box-shadow 0.3s' }}>

            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ padding: '5px 14px', borderRadius: 10, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 13, border: `1.5px solid ${meta.border}` }}>
                {current.word.length} letters
              </span>
              <button
                onClick={() => speakWord(current.word)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 10, border: `1.5px solid ${speaking ? meta.border : '#e2e8f0'}`, background: speaking ? meta.bg : '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: speaking ? meta.color : '#475569', transition: 'all 0.2s', fontFamily: 'inherit' }}
                title="Hear the word"
              >
                <Volume2 size={14} style={{ animation: speaking ? 'pulse 0.8s ease infinite' : 'none' }} />
                {speaking ? 'Playing…' : 'Listen'}
              </button>
            </div>

            {/* Hint card */}
            <div style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '1px solid #e2e8f0', borderRadius: 18, padding: '22px 24px', marginBottom: 24, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: meta.gradient, borderRadius: '18px 18px 0 0' }} />
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Hint</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.5 }}>{current.hint}</p>
            </div>

            {/* Letter reveal (after submit) */}
            {submitted && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 22, flexWrap: 'wrap' }}>
                {current.word.split('').map((char, i) => (
                  <div key={i} style={{
                    width: 38, height: 46, borderRadius: 10,
                    border: `2px solid ${isCorrect ? '#4ade80' : '#f87171'}`,
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 17, color: isCorrect ? '#14532d' : '#7f1d1d',
                    animation: `popIn 0.3s ${i * 0.04}s both cubic-bezier(0.34,1.56,0.64,1)`,
                    boxShadow: isCorrect ? '0 2px 6px rgba(34,197,94,0.2)' : '0 2px 6px rgba(239,68,68,0.15)',
                  }}>
                    {char.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {/* Input / feedback */}
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type the word here…"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  style={{
                    border: `2px solid ${shake ? '#f87171' : '#e2e8f0'}`,
                    borderRadius: 16, padding: '16px', fontSize: 22, textAlign: 'center',
                    fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: 5,
                    outline: 'none', background: '#fafafa', width: '100%', boxSizing: 'border-box',
                    textTransform: 'lowercase', transition: 'border-color 0.2s, box-shadow 0.2s',
                    animation: shake ? 'shake 0.4s ease' : 'none',
                    boxShadow: shake ? '0 0 0 4px rgba(248,113,113,0.15)' : 'none',
                  }}
                  onFocus={e => { if (!shake) { e.target.style.borderColor = meta.color; e.target.style.boxShadow = `0 0 0 4px ${meta.color}20`; } }}
                  onBlur={e => { if (!shake) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; } }}
                />
                <button type="submit" disabled={!input.trim()} style={{ background: !input.trim() ? '#f1f5f9' : meta.gradient, color: !input.trim() ? '#94a3b8' : '#fff', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 800, fontSize: 16, cursor: !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: !input.trim() ? 'none' : `0 6px 18px ${meta.color}35` }}>
                  Check Answer
                </button>
              </form>
            ) : (
              <div style={{ borderRadius: 16, background: isCorrect ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${isCorrect ? '#4ade80' : '#f87171'}`, padding: '16px 18px', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {isCorrect
                    ? <CheckCircle size={18} color="#16a34a" strokeWidth={2.5} />
                    : <XCircle size={18} color="#dc2626" strokeWidth={2.5} />}
                  <span style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? '#14532d' : '#7f1d1d' }}>
                    {isCorrect ? 'Perfect spelling! +10 pts' : `Not quite — it's "${current.word}"`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={handleNext} style={{ background: meta.gradient, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 12px ${meta.color}35`, fontFamily: 'inherit' }}>
                    {idx + 1 >= wordList.length ? <><Trophy size={14} /> See Results</> : <>Next Word <ChevronRight size={14} /></>}
                  </button>
                  <button onClick={() => setShowAL(true)} style={{ background: '#f8fafc', color: '#6d28d9', border: '1.5px solid #ddd6fe', borderRadius: 12, padding: '10px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                    <Sparkles size={14} /> Ask AL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAL && <ALAssistant word={current.word} userAnswer={input} level={level} onClose={() => setShowAL(false)} />}

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes fadeUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes popIn{from{transform:scale(0.5) translateY(10px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
