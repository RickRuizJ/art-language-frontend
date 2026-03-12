'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

const WORDS = [
  { word: 'necessary', hint: 'Something you must have or do' },
  { word: 'accommodation', hint: 'A place where someone stays' },
  { word: 'beautiful', hint: 'Pleasing to the eye or mind' },
  { word: 'colleague', hint: 'A person you work with' },
  { word: 'definitely', hint: 'Without any doubt at all' },
  { word: 'environment', hint: 'The natural world that surrounds us' },
  { word: 'government', hint: 'The system that rules a country' },
  { word: 'knowledge', hint: 'Facts and information you have learned' },
  { word: 'especially', hint: 'More than usual; particularly' },
  { word: 'receive', hint: 'To get or be given something' },
  { word: 'separate', hint: 'To divide something into parts' },
  { word: 'occurred', hint: 'Past tense of "happen"' },
];

export default function SpellingChallenge() {
  const [wordList, setWordList] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const init = useCallback(() => {
    setWordList([...WORDS].sort(() => Math.random() - 0.5).slice(0, 8));
    setIdx(0);
    setInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setGameOver(false);
    setShake(false);
  }, []);

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (!submitted && inputRef.current) inputRef.current.focus();
  }, [idx, submitted]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || submitted) return;
    const correct = input.trim().toLowerCase() === wordList[idx].word.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      setScore(s => s + 10);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleNext() {
    const nextIdx = idx + 1;
    if (nextIdx >= wordList.length) {
      setGameOver(true);
    } else {
      setIdx(nextIdx);
      setInput('');
      setSubmitted(false);
      setIsCorrect(false);
    }
  }

  if (!wordList.length) return null;
  const current = wordList[idx];
  const accuracy = wordList.length > 0 ? Math.round((score / 10 / Math.min(idx + (submitted ? 1 : 0), wordList.length)) * 100) : 0;

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
              <span className="text-sm text-neutral-500">{idx + 1} / {wordList.length}</span>
              <button onClick={init} className="btn btn-ghost"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">🔤 Spelling Challenge</h1>
          <p className="text-neutral-600">Read the hint and spell the word correctly</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {wordList.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < idx ? 'bg-green-400' :
                i === idx ? 'bg-primary-600 scale-125' :
                'bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {gameOver ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🏅</div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">All done!</h2>
            <p className="text-neutral-600 mb-8">You completed the spelling challenge</p>
            <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto mb-8">
              <div>
                <p className="text-4xl font-bold text-primary-600">{score}</p>
                <p className="text-sm text-neutral-500">Points</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-green-600">{score / 10}/{wordList.length}</p>
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
            <div className="text-center mb-6">
              <span className="badge badge-info mb-3">{current.word.length} letters</span>
              <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Hint</p>
                <p className="text-lg font-semibold text-neutral-800">{current.hint}</p>
              </div>
            </div>

            {/* Letter boxes shown after answer */}
            {submitted && (
              <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
                {current.word.split('').map((char, i) => (
                  <div
                    key={i}
                    className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center font-bold text-lg
                      ${isCorrect ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}
                  >
                    {char.toUpperCase()}
                  </div>
                ))}
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className={`input w-full text-center text-2xl tracking-widest font-mono uppercase ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}
                  placeholder="Type the word here…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="btn btn-primary w-full"
                >
                  Check Answer ✓
                </button>
              </form>
            ) : (
              <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-red-600" />
                  }
                  <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct! Well done!' : `Not quite — the answer is "${current.word}"`}
                  </span>
                </div>
                <button onClick={handleNext} className="btn btn-primary mt-3">
                  {idx + 1 >= wordList.length ? 'See Results' : 'Next Word →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
