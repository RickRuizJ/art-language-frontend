'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Zap, MessageCircle, X, Send, Loader, Volume2 } from 'lucide-react';

// ── Content by CEFR level ─────────────────────────────────────────────────────
const WORDS_BY_LEVEL = {
  A1: [
    { word: 'apple', hint: 'A round fruit, often red or green 🍎' },
    { word: 'happy', hint: 'Feeling very good and pleased 😊' },
    { word: 'water', hint: 'The clear liquid we drink 💧' },
    { word: 'house', hint: 'A building where people live 🏠' },
    { word: 'school', hint: 'A place where children learn 🏫' },
    { word: 'chair', hint: 'A piece of furniture to sit on' },
    { word: 'friend', hint: 'A person you like and trust' },
    { word: 'table', hint: 'A flat surface with legs to put things on' },
    { word: 'night', hint: 'The dark part of the day 🌙' },
    { word: 'bread', hint: 'A baked food made from flour 🍞' },
  ],
  A2: [
    { word: 'beautiful', hint: 'Very attractive and pleasing to look at' },
    { word: 'because', hint: 'Used to give a reason: "I did it ___ I wanted to"' },
    { word: 'birthday', hint: 'The day you were born, celebrated each year 🎂' },
    { word: 'purple', hint: 'A colour that mixes red and blue 💜' },
    { word: 'sandwich', hint: 'Food between two slices of bread 🥪' },
    { word: 'library', hint: 'A place full of books to read or borrow 📚' },
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
  A1: { color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
  A2: { color: '#16a34a', bg: '#dcfce7', border: '#4ade80' },
  B1: { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  B2: { color: '#1d4ed8', bg: '#dbeafe', border: '#60a5fa' },
  C1: { color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
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
        ? `Perfect spelling! ✅ "${word}" — you got it! Want a memory trick to help remember it?`
        : `Close! 💪 The correct spelling is "${word}". Want a memory tip to help you remember it?`
      : `Hi! I'm AL 🤖 Need help spelling "${word}"? I can give you tricks and tips!`;
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect. Try again 🙏" }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '75vh', animation: 'slideUp 0.25s ease' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>AL — Spelling Coach</div>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>● Online</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f9fafb', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={18} color="#6b7280" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? '#7c3aed' : '#f3f4f6', color: msg.role === 'user' ? '#fff' : '#111827', fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 14px' }}>
              <Loader size={14} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>AL is typing…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '2px solid #f3f4f6', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL for spelling tips…" style={{ flex: 1, border: '2px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafaf9' }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', border: 'none', borderRadius: 12, padding: '0 16px', cursor: 'pointer', opacity: !input.trim() || loading ? 0.5 : 1 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
  const accuracy = (idx + (submitted ? 1 : 0)) > 0 ? Math.round((correctCount / (idx + (submitted ? 1 : 0))) * 100) : 100;

  return (
    <div style={{ minHeight: '100vh', background: submitted ? (isCorrect ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)') : '#fafaf9', transition: 'background 0.4s', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      <header style={{ background: '#fff', borderBottom: '2px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/practice" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <ArrowLeft size={16} /> Hub
          </Link>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(WORDS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '4px 10px', borderRadius: 999, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e5e7eb'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{lv}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 999, padding: '4px 10px', border: '2px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <button onClick={init} style={{ border: '2px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 5, cursor: 'pointer' }}>
              <RotateCcw size={14} color="#6b7280" />
            </button>
          </div>
        </div>
        {/* Dot progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0', borderTop: '1px solid #f3f4f6' }}>
          {wordList.map((_, i) => (
            <div key={i} style={{ width: i === idx ? 20 : 10, height: 10, borderRadius: 999, background: i < idx ? meta.color : i === idx ? meta.color : '#e5e7eb', transition: 'all 0.3s ease', opacity: i < idx ? 0.5 : 1 }} />
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>🔤 Spelling Challenge</h1>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 12, border: `2px solid ${meta.border}` }}>Level {level} · {idx + 1}/{wordList.length}</span>
        </div>

        {gameOver ? (
          <div style={{ background: '#fff', borderRadius: 24, border: '2px solid #f3f4f6', padding: '48px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{correctCount / wordList.length >= 0.8 ? '🏅' : correctCount / wordList.length >= 0.5 ? '📖' : '✏️'}</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>All done!</h2>
            <p style={{ color: '#9ca3af', marginBottom: 28, fontWeight: 600 }}>{correctCount / wordList.length >= 0.8 ? 'Excellent spelling! 🔥' : 'Keep practicing! You\'ll improve! 💪'}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
              {[{ val: score, label: 'Points', c: meta.color }, { val: `${correctCount}/${wordList.length}`, label: 'Correct', c: '#22c55e' }, { val: `${accuracy}%`, label: 'Accuracy', c: '#f97316' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: s.c }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={init} style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={15} /> Play Again</button>
              <Link href="/practice" style={{ background: '#f3f4f6', color: '#374151', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Back to Hub</Link>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 24, border: `2px solid ${submitted ? (isCorrect ? '#86efac' : '#fca5a5') : '#f3f4f6'}`, padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', transition: 'border-color 0.3s' }}>
            {/* Word length badge + Listen button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ padding: '4px 14px', borderRadius: 999, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 13, border: `2px solid ${meta.border}` }}>
                {current.word.length} letters
              </span>
              <button
                onClick={() => speakWord(current.word)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, border: '2px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#374151' }}
                title="Hear the word"
              >
                <Volume2 size={14} /> Listen
              </button>
            </div>

            {/* Hint card */}
            <div style={{ background: '#f9fafb', border: '2px solid #f3f4f6', borderRadius: 16, padding: '20px', marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Hint</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>{current.hint}</p>
            </div>

            {/* Letter boxes (after answer) */}
            {submitted && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                {current.word.split('').map((char, i) => (
                  <div key={i} style={{ width: 38, height: 46, borderRadius: 10, border: `2.5px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, background: isCorrect ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: isCorrect ? '#166534' : '#991b1b' }}>
                    {char.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type the word here…"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  style={{
                    border: `2.5px solid ${shake ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: 14, padding: '16px', fontSize: 22, textAlign: 'center',
                    fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: 4,
                    outline: 'none', background: '#fafaf9', width: '100%', boxSizing: 'border-box',
                    textTransform: 'lowercase',
                    animation: shake ? 'shake 0.4s ease' : 'none',
                  }}
                />
                <button type="submit" disabled={!input.trim()} style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontWeight: 800, fontSize: 16, cursor: !input.trim() ? 'not-allowed' : 'pointer', opacity: !input.trim() ? 0.6 : 1 }}>
                  Check Answer ✓
                </button>
              </form>
            ) : (
              <div style={{ borderRadius: 14, background: isCorrect ? '#f0fdf4' : '#fef2f2', border: `2px solid ${isCorrect ? '#86efac' : '#fca5a5'}`, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{isCorrect ? '✅' : '❌'}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? '#166534' : '#991b1b' }}>
                    {isCorrect ? 'Perfect spelling! +10 pts' : `Not quite — it's "${current.word}"`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={handleNext} style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    {idx + 1 >= wordList.length ? 'See Results 🏁' : 'Next Word →'}
                  </button>
                  <button onClick={() => setShowAL(true)} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageCircle size={14} /> Ask AL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAL && <ALAssistant word={current.word} userAnswer={input} level={level} onClose={() => setShowAL(false)} />}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}
