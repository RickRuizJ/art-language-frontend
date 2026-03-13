'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Zap, MessageCircle, X, Send, Loader } from 'lucide-react';

// ── Content by CEFR level ─────────────────────────────────────────────────────
const QUESTIONS_BY_LEVEL = {
  A1: [
    { q: 'She ___ a teacher.', opts: ['am', 'is', 'are', 'be'], answer: 'is', exp: 'With "she/he/it" we use "is" in the present tense.' },
    { q: 'I ___ from Spain.', opts: ['am', 'is', 'are', 'be'], answer: 'am', exp: '"Am" is used only with "I".' },
    { q: 'They ___ students.', opts: ['am', 'is', 'are', 'be'], answer: 'are', exp: '"Are" is used with "they / we / you".' },
    { q: 'There ___ a cat in the garden.', opts: ['am', 'is', 'are', 'were'], answer: 'is', exp: '"There is" is used with singular nouns.' },
    { q: '___ you happy today?', opts: ['Am', 'Is', 'Are', 'Be'], answer: 'Are', exp: '"Are" is used with "you" in questions.' },
    { q: 'My name ___ Carlos.', opts: ['am', 'is', 'are', 'be'], answer: 'is', exp: '"My name" is third person singular, so we use "is".' },
    { q: 'The cat ___ on the table.', opts: ['sit', 'sits', 'sitting', 'sat'], answer: 'sits', exp: 'Present simple with "she/he/it" adds -s to the verb.' },
    { q: 'I ___ a dog.', opts: ['has', 'have', 'had', 'having'], answer: 'have', exp: '"Have" is used with "I / you / we / they".' },
  ],
  A2: [
    { q: 'She ___ to school every day.', opts: ['go', 'goes', 'going', 'gone'], answer: 'goes', exp: 'Third person singular present adds -s/es: "goes".' },
    { q: 'I ___ my homework yesterday.', opts: ['do', 'did', 'done', 'doing'], answer: 'did', exp: '"Did" is the past simple of "do".' },
    { q: 'They ___ watching TV when I arrived.', opts: ['were', 'was', 'are', 'been'], answer: 'were', exp: '"They" takes "were" in the past continuous tense.' },
    { q: 'She is ___ than her sister.', opts: ['tall', 'taller', 'tallest', 'more tall'], answer: 'taller', exp: 'Comparative for short words: add "-er".' },
    { q: 'I ___ like coffee.', opts: ["don't", "doesn't", "didn't", "won't"], answer: "don't", exp: 'Present simple negative with "I": "don\'t + verb".' },
    { q: 'He ___ TV every evening.', opts: ['watch', 'watches', 'watching', 'watched'], answer: 'watches', exp: 'Third person singular: add -es after -ch.' },
    { q: 'There ___ two apples on the table.', opts: ['is', 'are', 'was', 'am'], answer: 'are', exp: '"There are" is used with plural nouns.' },
    { q: '___ you help me, please?', opts: ['Could', 'Must', 'Might', 'Shall'], answer: 'Could', exp: '"Could" is used for polite requests.' },
  ],
  B1: [
    { q: 'I have ___ this book before.', opts: ['read', 'reading', 'reads', 'readed'], answer: 'read', exp: 'Present perfect uses the past participle. "Read" is irregular.' },
    { q: 'He ___ eaten breakfast yet.', opts: ["hasn't", "haven't", "didn't", "doesn't"], answer: "hasn't", exp: "Present perfect negative: hasn't + past participle." },
    { q: 'If I ___ rich, I would travel the world.', opts: ['am', 'were', 'will be', 'be'], answer: 'were', exp: 'Second conditional uses "were" for all persons.' },
    { q: 'The letter was written ___ a famous author.', opts: ['by', 'from', 'with', 'to'], answer: 'by', exp: 'Passive voice uses "by" to indicate the agent.' },
    { q: 'I prefer coffee ___ tea.', opts: ['than', 'to', 'over', 'against'], answer: 'to', exp: '"Prefer X to Y" is the correct fixed expression.' },
    { q: 'She said she ___ coming to the party.', opts: ['is', 'was', 'will be', 'has been'], answer: 'was', exp: 'Reported speech shifts present → past: "is" becomes "was".' },
    { q: 'By next year, she ___ here for ten years.', opts: ['will work', 'will have worked', 'works', 'worked'], answer: 'will have worked', exp: 'Future perfect: completed action before a future point.' },
    { q: "He's the ___ student in the class.", opts: ['more intelligent', 'intelligent', 'most intelligent', 'intelligenter'], answer: 'most intelligent', exp: 'Superlative of long adjectives: "most + adjective".' },
  ],
  B2: [
    { q: "She ___ work weekends if she hadn't taken the promotion.", opts: ["wouldn't have had to", "won't have to", "wouldn't need", "didn't have to"], answer: "wouldn't have had to", exp: 'Third conditional: "would have + past participle" for hypothetical past results.' },
    { q: 'The report needs ___ before tomorrow.', opts: ['finish', 'finishing', 'to finish', 'finished'], answer: 'finishing', exp: '"Need + gerund" implies necessity in a passive sense.' },
    { q: 'I wish I ___ more time to study.', opts: ['have', 'had', 'will have', 'having'], answer: 'had', exp: '"Wish + past simple" expresses a present unreal desire.' },
    { q: 'Not only ___ she pass the exam, she got top marks.', opts: ['did', 'has', 'was', 'had'], answer: 'did', exp: '"Not only" triggers subject-auxiliary inversion.' },
    { q: 'The suspect is said ___ the country.', opts: ['to flee', 'to have fled', 'fleeing', 'having fled'], answer: 'to have fled', exp: '"Is said to have + past participle" = past reporting structure.' },
    { q: 'He talks ___ he knows everything.', opts: ['like', 'as if', 'so that', 'despite'], answer: 'as if', exp: '"As if" introduces a hypothetical manner clause.' },
    { q: 'No sooner ___ she arrived than it started raining.', opts: ['had', 'has', 'did', 'was'], answer: 'had', exp: '"No sooner had + subject + past participle" = inverted past perfect.' },
    { q: '___ the heavy traffic, she arrived on time.', opts: ['Despite', 'Although', 'However', 'Even'], answer: 'Despite', exp: '"Despite" is followed by a noun or gerund, not a clause.' },
  ],
  C1: [
    { q: 'The new policy ___ considerable debate among experts.', opts: ['has given rise to', 'has risen', 'raises up', 'has brought up'], answer: 'has given rise to', exp: '"Give rise to" = to cause or produce. Fixed collocation.' },
    { q: 'Had she known about the meeting, she ___ attended.', opts: ['would', 'would have', 'had', 'should have'], answer: 'would have', exp: 'Inverted third conditional: "Had + subject + pp → would have + pp".' },
    { q: 'The findings are ___ with previous research.', opts: ['at odds', 'in odds', 'by odds', 'on odds'], answer: 'at odds', exp: '"At odds with" = in conflict or disagreement with. Fixed phrase.' },
    { q: 'The committee ___ a decision until further data is available.', opts: ['has deferred', 'is deferring', 'deferred', 'defers'], answer: 'has deferred', exp: 'Present perfect indicates recent past action with current relevance.' },
    { q: 'The contract is ___ renegotiation every five years.', opts: ['subject to', 'subjected to', 'liable for', 'prone to'], answer: 'subject to', exp: '"Subject to" = conditionally dependent on. Formal and common in contracts.' },
    { q: 'Scarcely ___ he spoken when the phone rang.', opts: ['had', 'has', 'did', 'was'], answer: 'had', exp: '"Scarcely had + subject + pp" triggers inversion, similar to "no sooner".' },
    { q: 'The proposal merits ___ more carefully.', opts: ['to consider', 'considering', 'considered', 'being considered'], answer: 'considering', exp: '"Merit + gerund" is the correct construction in formal English.' },
    { q: 'She is believed ___ the first woman elected to that office.', opts: ['to be', 'to have been', 'being', 'having been'], answer: 'to have been', exp: '"Believed to have been" refers to a past state — past infinitive structure.' },
  ],
};

const DEFAULT_LEVEL = 'B1';
const TIME_PER_Q = 20;

const LEVEL_META = {
  A1: { color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
  A2: { color: '#16a34a', bg: '#dcfce7', border: '#4ade80' },
  B1: { color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  B2: { color: '#1d4ed8', bg: '#dbeafe', border: '#60a5fa' },
  C1: { color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
};

// ── AL Assistant ──────────────────────────────────────────────────────────────
function ALAssistant({ question, answer, selected, level, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const systemPrompt = `You are AL, a warm and encouraging English language tutor assistant inside a gamified learning app.
The student is at CEFR level ${level}.
Current question: "${question?.q}"
Correct answer: "${answer}"
Student's selection: "${selected || 'not yet answered'}"
Keep responses SHORT (max 3–4 sentences), simple, and adapted to the ${level} level.
Be supportive, never condescending. Use emojis occasionally to feel friendly and motivating.`;

  useEffect(() => {
    const greet = selected
      ? selected === answer
        ? `Great job! ✅ "${answer}" is correct! ${question?.exp} Any questions?`
        : `No worries! 💪 The correct answer is "${answer}". ${question?.exp} Want me to explain more?`
      : `Hi! I'm AL 🤖 Here to help with this question. What would you like to know?`;
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }], systemPrompt }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again!' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Couldn't connect. Try again 🙏" }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 24px' }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '75vh', animation: 'slideUp 0.25s ease' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>AL — Learning Assistant</div>
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
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL anything…" style={{ flex: 1, border: '2px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fafaf9' }} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', border: 'none', borderRadius: 12, padding: '0 16px', cursor: 'pointer', opacity: !input.trim() || loading ? 0.5 : 1 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function GrammarChallenge() {
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [timedOut, setTimedOut] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showAL, setShowAL] = useState(false);
  const [flash, setFlash] = useState(null);

  const meta = LEVEL_META[level];

  const init = useCallback(() => {
    const pool = QUESTIONS_BY_LEVEL[level] || QUESTIONS_BY_LEVEL[DEFAULT_LEVEL];
    setQuestions([...pool].sort(() => Math.random() - 0.5));
    setIdx(0); setSelected(null); setScore(0);
    setTimeLeft(TIME_PER_Q); setTimedOut(false);
    setGameOver(false); setCorrectCount(0); setFlash(null);
  }, [level]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (selected !== null || timedOut || gameOver) return;
    if (timeLeft <= 0) { setTimedOut(true); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, timedOut, gameOver]);

  function handleSelect(opt) {
    if (selected !== null || timedOut) return;
    const correct = opt === questions[idx].answer;
    setSelected(opt);
    setFlash(correct ? 'correct' : 'wrong');
    if (correct) { setScore(s => s + (timeLeft > 10 ? 15 : 10)); setCorrectCount(c => c + 1); }
  }

  function handleNext() {
    setFlash(null);
    const nextIdx = idx + 1;
    if (nextIdx >= questions.length) { setGameOver(true); }
    else { setIdx(nextIdx); setSelected(null); setTimedOut(false); setTimeLeft(TIME_PER_Q); }
  }

  if (!questions.length) return null;
  const q = questions[idx];
  const answered = selected !== null || timedOut;
  const isCorrect = selected === q.answer;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timeLeft > 10 ? meta.color : timeLeft > 5 ? '#f97316' : '#ef4444';
  const bgColor = flash === 'correct' ? 'rgba(34,197,94,0.05)' : flash === 'wrong' ? 'rgba(239,68,68,0.05)' : '#fafaf9';

  return (
    <div style={{ minHeight: '100vh', background: bgColor, transition: 'background 0.4s', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      <header style={{ background: '#fff', borderBottom: '2px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/practice" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            <ArrowLeft size={16} /> Hub
          </Link>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(QUESTIONS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '4px 10px', borderRadius: 999, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e5e7eb'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{lv}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 999, padding: '4px 10px', border: '2px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 700 }}>{idx + 1}/{questions.length}</span>
            <button onClick={init} style={{ border: '2px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: 5, cursor: 'pointer' }}>
              <RotateCcw size={14} color="#6b7280" />
            </button>
          </div>
        </div>
        <div style={{ height: 4, background: '#f3f4f6' }}>
          <div style={{ height: '100%', width: `${(idx / questions.length) * 100}%`, background: meta.color, transition: 'width 0.4s ease' }} />
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>📝 Grammar Challenge</h1>
          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 12, border: `2px solid ${meta.border}` }}>Level {level}</span>
        </div>

        {gameOver ? (
          <div style={{ background: '#fff', borderRadius: 24, border: '2px solid #f3f4f6', padding: '48px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {correctCount / questions.length >= 0.8 ? '🏆' : correctCount / questions.length >= 0.5 ? '🎓' : '📚'}
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>Challenge Complete!</h2>
            <p style={{ color: '#9ca3af', marginBottom: 28, fontWeight: 600 }}>
              {correctCount / questions.length >= 0.8 ? 'Outstanding work! 🔥' : 'Good effort! Keep going! 💪'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
              {[{ val: score, label: 'Points', c: meta.color }, { val: `${correctCount}/${questions.length}`, label: 'Correct', c: '#22c55e' }, { val: `${Math.round((correctCount / questions.length) * 100)}%`, label: 'Accuracy', c: '#f97316' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: s.c }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={init} style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={15} /> Play Again
              </button>
              <Link href="/practice" style={{ background: '#f3f4f6', color: '#374151', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Back to Hub</Link>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 24, border: `2px solid ${answered ? (isCorrect ? '#86efac' : '#fca5a5') : '#f3f4f6'}`, padding: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', transition: 'border-color 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 999, transition: 'width 1s linear, background 0.3s' }} />
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, minWidth: 28, textAlign: 'right', color: timeLeft <= 5 ? '#ef4444' : '#374151' }}>
                {timedOut ? '—' : timeLeft}
              </span>
            </div>

            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24, lineHeight: 1.5 }}>{q.q}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {q.opts.map((opt, i) => {
                const isAnswer = opt === q.answer;
                const isChosen = opt === selected;
                let bg = '#fff', border = '#e5e7eb', textColor = '#374151';
                if (answered) {
                  if (isAnswer) { bg = '#f0fdf4'; border = '#86efac'; textColor = '#166534'; }
                  else if (isChosen) { bg = '#fef2f2'; border = '#fca5a5'; textColor = '#991b1b'; }
                  else { bg = '#f9fafb'; textColor = '#9ca3af'; }
                }
                return (
                  <button key={opt} onClick={() => handleSelect(opt)} disabled={answered} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: '14px 18px', textAlign: 'left', fontSize: 15, fontWeight: 700, color: textColor, cursor: answered ? 'default' : 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 999, background: answered ? 'transparent' : '#f3f4f6', border: `2px solid ${answered ? 'transparent' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#9ca3af', flexShrink: 0 }}>
                      {answered ? isAnswer ? <CheckCircle size={16} color="#22c55e" /> : isChosen ? <XCircle size={16} color="#ef4444" /> : null : ['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div style={{ borderRadius: 14, background: isCorrect ? '#f0fdf4' : timedOut ? '#fff7ed' : '#fef2f2', border: `2px solid ${isCorrect ? '#86efac' : timedOut ? '#fed7aa' : '#fca5a5'}`, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{timedOut ? '⏰' : isCorrect ? '✅' : '❌'}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? '#166534' : timedOut ? '#92400e' : '#991b1b' }}>
                    {timedOut ? "Time's up!" : isCorrect ? `Correct! +${timeLeft > 10 ? 15 : 10} pts` : `Incorrect — "${q.answer}"`}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.5 }}>{q.exp}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={handleNext} style={{ background: meta.color, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    {idx + 1 >= questions.length ? 'See Results 🏁' : 'Next →'}
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

      {showAL && <ALAssistant question={q} answer={q.answer} selected={selected} level={level} onClose={() => setShowAL(false)} />}
    </div>
  );
}
