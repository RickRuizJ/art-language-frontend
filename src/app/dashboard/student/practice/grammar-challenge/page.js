'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, RotateCcw, CheckCircle, XCircle, Zap, MessageCircle,
  X, Send, Loader, BookOpen, Trophy, Target, Clock, ChevronRight,
  Sparkles, Brain
} from 'lucide-react';

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
  A1: { color: '#16a34a', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', bg: '#f0fdf4', border: '#86efac', light: '#dcfce7', text: '#14532d' },
  A2: { color: '#15803d', gradient: 'linear-gradient(135deg,#4ade80,#16a34a)', bg: '#dcfce7', border: '#4ade80', light: '#bbf7d0', text: '#14532d' },
  B1: { color: '#2563eb', gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)', bg: '#eff6ff', border: '#93c5fd', light: '#dbeafe', text: '#1e3a8a' },
  B2: { color: '#1d4ed8', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', bg: '#dbeafe', border: '#60a5fa', light: '#bfdbfe', text: '#1e3a8a' },
  C1: { color: '#6d28d9', gradient: 'linear-gradient(135deg,#a78bfa,#6d28d9)', bg: '#faf5ff', border: '#c4b5fd', light: '#ede9fe', text: '#3b0764' },
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
        ? `Great job! The answer "${answer}" is correct! ${question?.exp} Any questions?`
        : `No worries! The correct answer is "${answer}". ${question?.exp} Want me to explain more?`
      : `Hi! I'm AL, your grammar tutor. What would you like to know about this question?`;
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Couldn't connect. Try again." }]);
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
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.3px' }}>AL — Learning Assistant</div>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Online now
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f8fafc', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
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
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>AL is thinking…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AL anything…" style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '11px 15px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#f8fafc', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#6d28d9'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: 'linear-gradient(135deg,#6d28d9,#2563eb)', border: 'none', borderRadius: 14, width: 44, height: 44, cursor: 'pointer', opacity: !input.trim() || loading ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.3)', transition: 'opacity 0.2s' }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ── Option Label ──────────────────────────────────────────────────────────────
function OptionButton({ opt, idx, answered, selected, correctAnswer, onClick }) {
  const isAnswer = opt === correctAnswer;
  const isChosen = opt === selected;
  const labels = ['A', 'B', 'C', 'D'];

  let bg = '#fff', border = '#e2e8f0', textColor = '#1e293b', labelBg = '#f1f5f9', labelColor = '#64748b', shadow = '0 1px 3px rgba(0,0,0,0.06)';
  if (answered) {
    if (isAnswer) { bg = '#f0fdf4'; border = '#4ade80'; textColor = '#14532d'; labelBg = '#22c55e'; labelColor = '#fff'; shadow = '0 4px 12px rgba(34,197,94,0.2)'; }
    else if (isChosen) { bg = '#fef2f2'; border = '#f87171'; textColor = '#7f1d1d'; labelBg = '#ef4444'; labelColor = '#fff'; shadow = '0 4px 12px rgba(239,68,68,0.2)'; }
    else { bg = '#fafafa'; border = '#f1f5f9'; textColor = '#94a3b8'; labelBg = '#f1f5f9'; labelColor = '#cbd5e1'; }
  }

  return (
    <button
      onClick={onClick}
      disabled={answered}
      className="option-btn"
      style={{
        background: bg, border: `2px solid ${border}`, borderRadius: 16,
        padding: '14px 16px', textAlign: 'left', fontSize: 15, fontWeight: 600,
        color: textColor, cursor: answered ? 'default' : 'pointer',
        transition: 'all 0.18s ease', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: shadow, width: '100%',
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: 8, background: labelBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: labelColor, flexShrink: 0, transition: 'all 0.18s',
      }}>
        {answered
          ? isAnswer ? <CheckCircle size={15} color="#fff" strokeWidth={2.5} />
            : isChosen ? <XCircle size={15} color="#fff" strokeWidth={2.5} />
              : labels[idx]
          : labels[idx]}
      </span>
      <span style={{ flex: 1 }}>{opt}</span>
    </button>
  );
}

// ── Results Screen ─────────────────────────────────────────────────────────────
function ResultsScreen({ score, correctCount, total, meta, onReplay }) {
  const pct = Math.round((correctCount / total) * 100);
  const grade = pct >= 80 ? { label: 'Outstanding!', icon: Trophy, color: '#f59e0b' }
    : pct >= 50 ? { label: 'Good effort!', icon: Target, color: '#3b82f6' }
      : { label: 'Keep going!', icon: BookOpen, color: '#8b5cf6' };

  return (
    <div style={{ background: '#fff', borderRadius: 28, padding: '48px 36px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', animation: 'fadeUp 0.5s ease' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg,${grade.color}22,${grade.color}44)`, border: `2px solid ${grade.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <grade.icon size={36} color={grade.color} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Challenge Complete!</h2>
      <p style={{ color: '#64748b', marginBottom: 36, fontWeight: 600, fontSize: 16 }}>{grade.label}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 40, background: '#f8fafc', borderRadius: 20, padding: '20px 16px', border: '1px solid #f1f5f9' }}>
        {[
          { val: score, label: 'Points', color: meta.color },
          { val: `${correctCount}/${total}`, label: 'Correct', color: '#22c55e' },
          { val: `${pct}%`, label: 'Accuracy', color: '#f97316' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none', padding: '0 12px' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={onReplay} style={{ background: meta.gradient, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 6px 20px ${meta.color}40`, transition: 'transform 0.15s,box-shadow 0.15s', fontFamily: 'inherit' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${meta.color}50`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px ${meta.color}40`; }}>
          <RotateCcw size={16} /> Play Again
        </button>
        <Link href="/dashboard/student/practice-hub" style={{ background: '#f8fafc', color: '#475569', borderRadius: 14, padding: '13px 28px', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #e2e8f0', transition: 'background 0.15s' }}>
          <ArrowLeft size={16} /> Back to Hub
        </Link>
      </div>
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
  const progressPct = (idx / questions.length) * 100;

  const pageBg = flash === 'correct'
    ? 'radial-gradient(ellipse at top,#f0fdf4 0%,#fafafa 60%)'
    : flash === 'wrong'
      ? 'radial-gradient(ellipse at top,#fef2f2 0%,#fafafa 60%)'
      : 'radial-gradient(ellipse at top,#f8fafc 0%,#f1f5f9 100%)';

  return (
    <div style={{ minHeight: '100vh', background: pageBg, transition: 'background 0.5s', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link href="/dashboard/student/practice-hub" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontWeight: 700, fontSize: 14, padding: '6px 12px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0', transition: 'all 0.15s' }}>
            <ArrowLeft size={15} /> Hub
          </Link>

          {/* Level selector */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(QUESTIONS_BY_LEVEL).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={{ padding: '5px 10px', borderRadius: 10, border: `2px solid ${level === lv ? LEVEL_META[lv].color : '#e2e8f0'}`, background: level === lv ? LEVEL_META[lv].color : 'transparent', color: level === lv ? '#fff' : '#64748b', fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', letterSpacing: '0.3px' }}>{lv}</button>
            ))}
          </div>

          {/* Score + progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fefce8', borderRadius: 10, padding: '5px 10px', border: '1.5px solid #fde68a' }}>
              <Zap size={13} color="#ca8a04" fill="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>{score}</span>
            </div>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{idx + 1}/{questions.length}</span>
            <button onClick={init} style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
              <RotateCcw size={14} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#f1f5f9' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: meta.gradient, transition: 'width 0.5s ease', borderRadius: '0 2px 2px 0' }} />
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
        {/* Game title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${meta.border}`, borderRadius: 14, padding: '8px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <BookOpen size={18} color={meta.color} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Grammar Challenge</h1>
            <span style={{ background: meta.bg, color: meta.color, fontWeight: 800, fontSize: 11, padding: '2px 8px', borderRadius: 8, border: `1.5px solid ${meta.border}` }}>Level {level}</span>
          </div>
        </div>

        {gameOver ? (
          <ResultsScreen score={score} correctCount={correctCount} total={questions.length} meta={meta} onReplay={init} />
        ) : (
          <div style={{
            background: '#fff', borderRadius: 24,
            border: `2px solid ${answered ? (isCorrect ? '#4ade80' : timedOut ? '#fbbf24' : '#f87171') : '#f1f5f9'}`,
            padding: '28px', boxShadow: answered
              ? isCorrect ? '0 8px 32px rgba(34,197,94,0.12)' : '0 8px 32px rgba(239,68,68,0.08)'
              : '0 8px 32px rgba(0,0,0,0.06)',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}>
            {/* Timer bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${timerPct}%`,
                  background: timerPct > 50 ? meta.gradient : timerPct > 25 ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'linear-gradient(135deg,#f87171,#ef4444)',
                  borderRadius: 999, transition: 'width 1s linear, background 0.5s',
                  boxShadow: timerPct > 50 ? `0 2px 6px ${meta.color}40` : '0 2px 6px rgba(239,68,68,0.3)',
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 48 }}>
                <Clock size={14} color={timeLeft <= 5 ? '#ef4444' : '#64748b'} />
                <span style={{ fontWeight: 900, fontSize: 17, color: timeLeft <= 5 ? '#ef4444' : '#374151', transition: 'color 0.3s' }}>
                  {timedOut ? '0' : timeLeft}
                </span>
              </div>
            </div>

            {/* Question */}
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px 22px', marginBottom: 22, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.55 }}>{q.q}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {q.opts.map((opt, i) => (
                <OptionButton key={opt} opt={opt} idx={i} answered={answered} selected={selected} correctAnswer={q.answer} onClick={() => handleSelect(opt)} />
              ))}
            </div>

            {/* Feedback */}
            {answered && (
              <div style={{
                borderRadius: 16, padding: '16px 18px',
                background: isCorrect ? '#f0fdf4' : timedOut ? '#fffbeb' : '#fef2f2',
                border: `1.5px solid ${isCorrect ? '#4ade80' : timedOut ? '#fcd34d' : '#f87171'}`,
                animation: 'fadeUp 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {isCorrect
                    ? <CheckCircle size={18} color="#16a34a" strokeWidth={2.5} />
                    : timedOut
                      ? <Clock size={18} color="#d97706" strokeWidth={2.5} />
                      : <XCircle size={18} color="#dc2626" strokeWidth={2.5} />}
                  <span style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? '#14532d' : timedOut ? '#92400e' : '#7f1d1d' }}>
                    {timedOut ? "Time's up!" : isCorrect ? `Correct! +${timeLeft > 10 ? 15 : 10} pts` : `Incorrect — "${q.answer}"`}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.55 }}>{q.exp}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={handleNext} style={{ background: meta.gradient, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 12px ${meta.color}35`, fontFamily: 'inherit', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {idx + 1 >= questions.length ? <><Trophy size={14} /> See Results</> : <>Next <ChevronRight size={14} /></>}
                  </button>
                  <button onClick={() => setShowAL(true)} style={{ background: '#f8fafc', color: '#6d28d9', border: '1.5px solid #ddd6fe', borderRadius: 12, padding: '10px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <Sparkles size={14} /> Ask AL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAL && <ALAssistant question={q} answer={q.answer} selected={selected} level={level} onClose={() => setShowAL(false)} />}

      <style>{`
        @keyframes fadeUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .option-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.1)!important;border-color:#cbd5e1!important}
      `}</style>
    </div>
  );
}
