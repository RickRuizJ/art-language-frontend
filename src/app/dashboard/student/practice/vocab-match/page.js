'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Zap, MessageCircle, X, Send, Loader, Timer } from 'lucide-react';

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
  A1: { color: '#22c55e', bg: '#f0fdf4', border: '#86efac', wordAccent: '#15803d', defAccent: '#4ade80' },
  A2: { color: '#16a34a', bg: '#dcfce7', border: '#4ade80', wordAccent: '#14532d', defAccent: '#22c55e' },
  B1: { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', wordAccent: '#1d4ed8', defAccent: '#60a5fa' },
  B2: { color: '#1d4ed8', bg: '#dbeafe', border: '#60a5fa', wordAccent: '#1e3a8a', defAccent: '#3b82f6' },
  C1: { color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', wordAccent: '#4c1d95', defAccent: '#a78bfa' },
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
    setMessages([{ role: 'assistant', content: `Great! 🎉 "${lastWord}" means "${lastDef}". Want an example sentence or memory tip to help you remember it?` }]);
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
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect 🙏" }]); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '75vh', animation: 'slideUp 0.25s ease' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>AL — Vocabulary Tutor</div>
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Loader size={14} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>AL is typing…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '2px solid #f3f4f6', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL about vocabulary…" style={{ flex: 1, border: '2px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafaf9' }} />
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
      setTimeout(() => setMatchAnim(null), 600);
      setSelectedWord(null); setSelectedDef(null);
      if (newMatched.length === pairs.length) { setGameOver(true); setTimerActive(false); }
    } else {
      setWrongPair({ word: selectedWord, def: selectedDef });
      setTimeout(() => { setWrongPair(null); setSelectedWord(null); setSelectedDef(null); }, 700);
    }
  }, [selectedWord, selectedDef]);

  const accuracy = attempts > 0 ? Math.round((matched.length / attempts) * 100) : 100;
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      <header style={{ background: '#fff', borderBottom: '2px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/practice" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <ArrowLeft size={16} /> Hub
          </Link>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(PAIRS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '4px 10px', borderRadius: 999, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e5e7eb'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{lv}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', borderRadius: 999, padding: '4px 10px', border: '2px solid #86efac' }}>
              <span style={{ fontSize: 12 }}>✅</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: '#15803d' }}>{matched.length}/{pairs.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 999, padding: '4px 10px', border: '2px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 13, fontWeight: 700 }}>
              <Timer size={13} />{mins}:{secs}
            </div>
            <button onClick={init} style={{ border: '2px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 5, cursor: 'pointer' }}>
              <RotateCcw size={14} color="#6b7280" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: '#f3f4f6' }}>
          <div style={{ height: '100%', width: `${pairs.length > 0 ? (matched.length / pairs.length) * 100 : 0}%`, background: meta.color, transition: 'width 0.5s ease' }} />
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>🃏 Vocabulary Match</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 12, border: `2px solid ${meta.border}` }}>Level {level}</span>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Match each word with its definition</span>
          </div>
        </div>

        {gameOver ? (
          <div style={{ background: '#fff', borderRadius: 24, border: '2px solid #f3f4f6', padding: '48px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🥈' : '📚'}</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>Excellent Work!</h2>
            <p style={{ color: '#9ca3af', marginBottom: 28, fontWeight: 600 }}>{accuracy >= 80 ? 'Near perfect accuracy! 🔥' : 'Good matching! Keep it up! 💪'}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
              {[{ val: score, label: 'Points', c: meta.color }, { val: `${accuracy}%`, label: 'Accuracy', c: '#22c55e' }, { val: `${mins}:${secs}`, label: 'Time', c: '#f97316' }].map(s => (
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
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Words column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: meta.color }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Words</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {words.map(word => {
                    const isMatched = matched.includes(word);
                    const isSelected = selectedWord === word;
                    const isWrong = wrongPair?.word === word;
                    const isAnimating = matchAnim === word;
                    let bg = '#fff', border = '#e5e7eb', textColor = '#111827', shadow = 'none';
                    if (isMatched) { bg = '#f0fdf4'; border = '#86efac'; textColor = '#166534'; }
                    else if (isWrong) { bg = '#fef2f2'; border = '#fca5a5'; textColor = '#991b1b'; }
                    else if (isSelected) { bg = meta.bg; border = meta.color; textColor = meta.wordAccent; shadow = `0 0 0 3px ${meta.color}22`; }
                    return (
                      <button key={word} disabled={isMatched} onClick={() => !isMatched && setSelectedWord(isSelected ? null : word)} style={{
                        padding: '14px 18px', borderRadius: 14, border: `2.5px solid ${border}`,
                        background: bg, color: textColor, fontWeight: 800, fontSize: 15,
                        textAlign: 'left', cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s', fontFamily: 'inherit',
                        boxShadow: shadow,
                        transform: isAnimating ? 'scale(1.04)' : 'scale(1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        {word}
                        {isMatched && <span style={{ fontSize: 16 }}>✅</span>}
                        {isSelected && !isMatched && <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, display: 'inline-block' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Definitions column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 999, background: meta.defAccent }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>Definitions</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {defs.map(def => {
                    const matchPair = pairs.find(p => p.def === def && matched.includes(p.word));
                    const isMatched = !!matchPair;
                    const isSelected = selectedDef === def;
                    const isWrong = wrongPair?.def === def;
                    let bg = '#fff', border = '#e5e7eb', textColor = '#374151', shadow = 'none';
                    if (isMatched) { bg = '#f0fdf4'; border = '#86efac'; textColor = '#166534'; }
                    else if (isWrong) { bg = '#fef2f2'; border = '#fca5a5'; textColor = '#991b1b'; }
                    else if (isSelected) { bg = `${meta.defAccent}18`; border = meta.defAccent; textColor = '#111827'; shadow = `0 0 0 3px ${meta.defAccent}22`; }
                    return (
                      <button key={def} disabled={isMatched} onClick={() => !isMatched && setSelectedDef(isSelected ? null : def)} style={{
                        padding: '14px 18px', borderRadius: 14, border: `2.5px solid ${border}`,
                        background: bg, color: textColor, fontWeight: 600, fontSize: 13,
                        textAlign: 'left', cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s', fontFamily: 'inherit',
                        lineHeight: 1.4, boxShadow: shadow,
                      }}>
                        {def}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ask AL floating button - shows when last matched */}
            {lastMatchedWord && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setShowAL(true)} style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                  <MessageCircle size={15} /> Ask AL about "{lastMatchedWord}"
                </button>
              </div>
            )}

            {/* Instruction tip */}
            {!selectedWord && !selectedDef && matched.length === 0 && (
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                👆 Click a word, then click its matching definition
              </div>
            )}
            {selectedWord && !selectedDef && (
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, fontWeight: 700, color: meta.color }}>
                Now pick the definition for <strong>"{selectedWord}"</strong>
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
    </div>
  );
}
