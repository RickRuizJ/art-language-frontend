'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const QUESTIONS = [
  { q: 'She ___ to school every day.', opts: ['go', 'goes', 'going', 'gone'], answer: 'goes', exp: 'Third person singular present uses "goes".' },
  { q: 'They ___ watching TV when I arrived.', opts: ['were', 'was', 'are', 'been'], answer: 'were', exp: '"They" takes "were" in the past continuous tense.' },
  { q: 'I have ___ this book before.', opts: ['read', 'reading', 'reads', 'readed'], answer: 'read', exp: 'Present perfect uses the past participle. "Read" is irregular.' },
  { q: '___ you help me with this?', opts: ['Could', 'Might', 'Should', 'Need'], answer: 'Could', exp: '"Could" is used for polite requests.' },
  { q: 'She is ___ than her sister.', opts: ['tall', 'taller', 'tallest', 'more tall'], answer: 'taller', exp: 'Comparative adjective for short words adds "-er".' },
  { q: 'He ___ eaten breakfast yet.', opts: ["hasn't", "haven't", "didn't", "doesn't"], answer: "hasn't", exp: "Present perfect negative: hasn't + past participle." },
  { q: 'If I ___ rich, I would travel the world.', opts: ['am', 'were', 'will be', 'be'], answer: 'were', exp: 'Second conditional uses "were" for all persons.' },
  { q: 'The letter was written ___ a famous author.', opts: ['by', 'from', 'with', 'to'], answer: 'by', exp: 'Passive voice uses "by" to indicate the agent.' },
  { q: 'I prefer coffee ___ tea.', opts: ['than', 'to', 'over', 'against'], answer: 'to', exp: '"Prefer X to Y" is the correct fixed expression.' },
  { q: '___ is the nearest hospital from here?', opts: ['Where', 'What', 'Which', 'How far'], answer: 'Where', exp: '"Where" asks about location.' },
];

const TIME_PER_Q = 20;

export default function GrammarChallenge() {
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [timedOut, setTimedOut] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const init = useCallback(() => {
    setQuestions([...QUESTIONS].sort(() => Math.random() - 0.5));
    setIdx(0);
    setSelected(null);
    setScore(0);
    setTimeLeft(TIME_PER_Q);
    setTimedOut(false);
    setGameOver(false);
    setCorrectCount(0);
  }, []);

  useEffect(() => { init(); }, [init]);

  // Countdown
  useEffect(() => {
    if (selected !== null || timedOut || gameOver) return;
    if (timeLeft <= 0) { setTimedOut(true); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected, timedOut, gameOver]);

  function handleSelect(opt) {
    if (selected !== null || timedOut) return;
    const q = questions[idx];
    const correct = opt === q.answer;
    setSelected(opt);
    if (correct) {
      setScore(s => s + (timeLeft > 10 ? 15 : 10));
      setCorrectCount(c => c + 1);
    }
  }

  function handleNext() {
    const nextIdx = idx + 1;
    if (nextIdx >= questions.length) {
      setGameOver(true);
    } else {
      setIdx(nextIdx);
      setSelected(null);
      setTimedOut(false);
      setTimeLeft(TIME_PER_Q);
    }
  }

  if (!questions.length) return null;
  const q = questions[idx];
  const answered = selected !== null || timedOut;
  const isCorrect = selected === q.answer;
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-accent-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/student" className="btn btn-ghost">
              <ArrowLeft className="w-5 h-5" /> Back
            </Link>
            <div className="flex items-center gap-4">
              <span className="badge badge-info">Score: {score}</span>
              <span className="text-sm text-neutral-500">{idx + 1} / {questions.length}</span>
              <button onClick={init} className="btn btn-ghost"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">📝 Grammar Challenge</h1>
          <p className="text-neutral-600">Pick the correct answer before the timer runs out</p>
        </div>

        {/* Progress */}
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
            style={{ width: `${((idx) / questions.length) * 100}%` }}
          />
        </div>

        {gameOver ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">Challenge Complete!</h2>
            <p className="text-neutral-500 mb-8">Here's how you did</p>
            <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto mb-8">
              <div>
                <p className="text-4xl font-bold text-primary-600">{score}</p>
                <p className="text-sm text-neutral-500">Points</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-600">{correctCount}/{questions.length}</p>
                <p className="text-sm text-neutral-500">Correct</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={init} className="btn btn-primary"><RotateCcw className="w-4 h-4" /> Play Again</button>
              <Link href="/dashboard/student" className="btn btn-outline">Dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="card">
            {/* Timer bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${timerColor} rounded-full transition-all duration-1000`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
              <span className={`text-lg font-bold w-8 text-right ${timeLeft <= 5 ? 'text-red-600' : 'text-neutral-700'}`}>
                {timedOut ? '—' : timeLeft}
              </span>
            </div>

            <p className="text-xl font-semibold text-neutral-900 mb-6 leading-relaxed">{q.q}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {q.opts.map(opt => {
                let cls = 'w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all ';
                if (!answered) {
                  cls += 'bg-white border-neutral-200 text-neutral-800 hover:border-primary-400 hover:bg-primary-50';
                } else if (opt === q.answer) {
                  cls += 'bg-green-50 border-green-500 text-green-800';
                } else if (opt === selected) {
                  cls += 'bg-red-50 border-red-400 text-red-700';
                } else {
                  cls += 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-default';
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={answered}
                    className={cls}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-red-600" />
                  }
                  <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {timedOut ? "Time's up!" : isCorrect ? 'Correct!' : `Incorrect — the answer is "${q.answer}"`}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{q.exp}</p>
                <button onClick={handleNext} className="btn btn-primary mt-3">
                  {idx + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
