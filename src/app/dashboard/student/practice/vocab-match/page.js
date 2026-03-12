'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const ALL_PAIRS = [
  { word: 'Abundant', def: 'Present in large quantities' },
  { word: 'Benevolent', def: 'Well-meaning and kindly' },
  { word: 'Coherent', def: 'Logical and consistent' },
  { word: 'Diligent', def: 'Hardworking and careful' },
  { word: 'Eloquent', def: 'Fluent and persuasive in speech' },
  { word: 'Frugal', def: 'Careful with money or resources' },
  { word: 'Genuine', def: 'Truly what something claims to be' },
  { word: 'Humble', def: 'Having a modest opinion of oneself' },
  { word: 'Inevitable', def: 'Certain to happen; unavoidable' },
  { word: 'Jubilant', def: 'Feeling great happiness and triumph' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function VocabMatchGame() {
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

  const init = useCallback(() => {
    const chosen = shuffle(ALL_PAIRS).slice(0, 6);
    setPairs(chosen);
    setWords(shuffle(chosen.map(p => p.word)));
    setDefs(shuffle(chosen.map(p => p.def)));
    setSelectedWord(null);
    setSelectedDef(null);
    setMatched([]);
    setWrongPair(null);
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    setElapsed(0);
    setTimerActive(true);
  }, []);

  useEffect(() => { init(); }, [init]);

  // Timer
  useEffect(() => {
    if (!timerActive || gameOver) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, gameOver]);

  // Check match whenever both selected
  useEffect(() => {
    if (!selectedWord || !selectedDef) return;
    const isMatch = pairs.find(p => p.word === selectedWord && p.def === selectedDef);
    setAttempts(a => a + 1);
    if (isMatch) {
      const newMatched = [...matched, selectedWord];
      setMatched(newMatched);
      setScore(s => s + 10);
      setSelectedWord(null);
      setSelectedDef(null);
      if (newMatched.length === pairs.length) {
        setGameOver(true);
        setTimerActive(false);
      }
    } else {
      setWrongPair({ word: selectedWord, def: selectedDef });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedWord(null);
        setSelectedDef(null);
      }, 700);
    }
  }, [selectedWord, selectedDef]);

  const accuracy = attempts > 0 ? Math.round((matched.length / attempts) * 100) : 100;
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/student" className="btn btn-ghost">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-500">⏱ {mins}:{secs}</span>
              <span className="badge badge-info">Score: {score}</span>
              <span className="badge badge-success">Matched: {matched.length}/{pairs.length}</span>
              <button onClick={init} className="btn btn-ghost">
                <RotateCcw className="w-5 h-5" /> Restart
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">🃏 Vocabulary Match</h1>
          <p className="text-neutral-600">Match each word on the left with its correct definition on the right</p>
        </div>

        {gameOver ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">Excellent Work!</h2>
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">{score}</p>
                <p className="text-sm text-neutral-500">Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                <p className="text-sm text-neutral-500">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-600">{mins}:{secs}</p>
                <p className="text-sm text-neutral-500">Time</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={init} className="btn btn-primary">
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
              <Link href="/dashboard/student" className="btn btn-outline">Back to Dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            {/* Words column */}
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 text-center">Words</p>
              <div className="space-y-3">
                {words.map(word => {
                  const isMatched = matched.includes(word);
                  const isSelected = selectedWord === word;
                  const isWrong = wrongPair?.word === word;
                  return (
                    <button
                      key={word}
                      disabled={isMatched}
                      onClick={() => !isMatched && setSelectedWord(word)}
                      className={`w-full px-6 py-4 rounded-xl border-2 font-semibold text-left transition-all ${
                        isMatched
                          ? 'bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default'
                          : isWrong
                          ? 'bg-red-50 border-red-400 text-red-700'
                          : isSelected
                          ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-medium'
                          : 'bg-white border-neutral-200 text-neutral-800 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Definitions column */}
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 text-center">Definitions</p>
              <div className="space-y-3">
                {defs.map(def => {
                  const matchPair = pairs.find(p => p.def === def && matched.includes(p.word));
                  const isMatched = !!matchPair;
                  const isSelected = selectedDef === def;
                  const isWrong = wrongPair?.def === def;
                  return (
                    <button
                      key={def}
                      disabled={isMatched}
                      onClick={() => !isMatched && setSelectedDef(def)}
                      className={`w-full px-6 py-4 rounded-xl border-2 text-sm text-left transition-all ${
                        isMatched
                          ? 'bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default'
                          : isWrong
                          ? 'bg-red-50 border-red-400 text-red-700'
                          : isSelected
                          ? 'bg-secondary-50 border-secondary-500 text-secondary-700 shadow-medium'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:border-secondary-300 hover:bg-secondary-50'
                      }`}
                    >
                      {def}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {!gameOver && (
          <div className="mt-8">
            <div className="flex justify-between text-sm text-neutral-500 mb-2">
              <span>Progress</span>
              <span>{matched.length} / {pairs.length} matched</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 rounded-full"
                style={{ width: `${pairs.length > 0 ? (matched.length / pairs.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
