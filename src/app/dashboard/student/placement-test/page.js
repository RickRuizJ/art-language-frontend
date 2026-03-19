'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ALCharacter    from '@/components/placement/ALCharacter';
import IntroFlow      from '@/components/placement/IntroFlow';
import ProgressBar    from '@/components/placement/ProgressBar';
import QuestionCard   from '@/components/placement/QuestionCard';
import FeedbackBubble from '@/components/placement/FeedbackBubble';
import ResultScreen   from '@/components/placement/ResultScreen';
import StarField      from '@/components/placement/StarField';

/* ═══════════════════════════════════════════════════════════════
   QUESTIONS
═══════════════════════════════════════════════════════════════ */
const ALL_QUESTIONS = [
  { level:'A1', question:'Choose the correct sentence.', options:['She have a dog.','She has a dog.','She is have a dog.','She having a dog.'], answer:'She has a dog.' },
  { level:'A1', question:'What is the plural of "child"?', options:['childs','childes','children','childrens'], answer:'children' },
  { level:'A1', question:'Which word means the opposite of "big"?', options:['tall','small','heavy','loud'], answer:'small' },
  { level:'A1', question:'Complete: "I ___ to school every day."', options:['goes','going','go','am go'], answer:'go' },
  { level:'A1', question:'Which is a correct greeting?', options:['Good morning!','Morning good!','Is good morning!','Morning is good!'], answer:'Good morning!' },
  { level:'A2', question:'She ___ TV when the phone rang.', options:['watched','was watching','watches','is watching'], answer:'was watching' },
  { level:'A2', question:'Which sentence uses "since" correctly?', options:['I have lived here since three years.','I have lived here since 2020.','I lived here since last year.','I am living here since two months.'], answer:'I have lived here since 2020.' },
  { level:'A2', question:'Correct comparative: "This book is ___ than that one."', options:['more interesting','interestinger','most interesting','more interest'], answer:'more interesting' },
  { level:'A2', question:'"Could you ___ me the salt?" — What\'s missing?', options:['pass','bring','give','All are correct'], answer:'All are correct' },
  { level:'A2', question:'Correct response to "Have you ever been to Paris?"', options:['Yes, I have.','Yes, I did.','Yes, I was.','Yes, I had.'], answer:'Yes, I have.' },
  { level:'B1', question:'By the time we arrived, they ___ already left.', options:['have','had','were','did'], answer:'had' },
  { level:'B1', question:'"The results were ___; no one expected such success."', options:['predictable','mediocre','remarkable','irrelevant'], answer:'remarkable' },
  { level:'B1', question:'Passive voice of "They built this bridge in 1990":', options:['This bridge was built in 1990.','This bridge has been built in 1990.','This bridge is built in 1990.','This bridge built in 1990.'], answer:'This bridge was built in 1990.' },
  { level:'B1', question:'If I had studied harder, I ___ the exam.', options:['will pass','would pass','would have passed','had passed'], answer:'would have passed' },
  { level:'B1', question:'"Despite ___ the instructions, he made errors."', options:['to read','reading','he read','read'], answer:'reading' },
  { level:'B2', question:'Word closest in meaning to "ambiguous":', options:['clear','vague','definitive','obvious'], answer:'vague' },
  { level:'B2', question:'Which sentence uses subjunctive correctly?', options:['It is important that he attends.','It is important that he attend.','It is important that he will attend.','It is important that he attended.'], answer:'It is important that he attend.' },
  { level:'B2', question:'"She takes after her mother." Meaning:', options:['looks different from','resembles','looks after','cares for'], answer:'resembles' },
  { level:'B2', question:'"Reticent" describes someone who is:', options:['talkative','hesitant to speak','very angry','easily convinced'], answer:'hesitant to speak' },
  { level:'B2', question:'Which is a mixed conditional?', options:['If it rains, I will stay home.','If I were rich, I would travel more.','If she had studied, she would be a doctor now.','If he studies, he passes.'], answer:'If she had studied, she would be a doctor now.' },
];

function calcLevel(score, total) {
  const p = score / total;
  if (p >= 0.85) return 'B2';
  if (p >= 0.65) return 'B1';
  if (p >= 0.45) return 'A2';
  return 'A1';
}

const MSGS = {
  correct:  ['Nice! 🎉','Brilliant! ✨',"That's right!",'You nailed it!','Spot on! ⭐'],
  wrong:    ['Oops! Try the next one!','Almost there!',"Don't worry, keep going!",'Good try! 💜'],
  progress: ["You're doing great! 🚀",'Keep it up!','Halfway there! 💫','Looking good!'],
};
const rand = type => { const a = MSGS[type] || MSGS.progress; return a[Math.floor(Math.random() * a.length)]; };

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function PlacementTestPage() {
  // phase: 'intro' | 'test' | 'result'
  const [phase, setPhase]               = useState('intro');
  const [qIndex, setQIndex]             = useState(0);
  const [score, setScore]               = useState(0);
  const [selected, setSelected]         = useState(null);
  const [feedback, setFeedback]         = useState({ visible:false, msg:'', type:'correct' });
  const [alMood, setAlMood]             = useState('intro');
  const [alMsg, setAlMsg]               = useState("Hi! I'm AL 👋 Let's get started!");
  const [cardVisible, setCardVisible]   = useState(true);
  const [slideDir, setSlideDir]         = useState('up');
  const [resultLevel, setResultLevel]   = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const timerRef = useRef(null);
  const q = ALL_QUESTIONS[qIndex];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  /* ── Intro complete ── */
  function handleIntroComplete(path) {
    if (path === 'a1') {
      // Redirect to A1 practice
      window.location.href = '/dashboard/student/practice/vocab-match?level=A1';
      return;
    }
    setPhase('test');
    setAlMood('idle');
    setAlMsg("Let's find your level! Take your time ✨");
  }

  /* ── Answer ── */
  const handleAnswer = useCallback((option) => {
    if (selected !== null || transitioning) return;
    setSelected(option);

    /* 1. Immediately: AL reacts to the tap with thinking */
    setAlMood('thinking');
    setAlMsg('Hmm, let me check... \u{1F914}');

    /* 2. Brief thinking pause (280ms), then evaluate */
    setTimeout(() => {
      const isCorrect = option === q.answer;
      const newScore  = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(newScore);
      const type = isCorrect ? 'correct' : 'wrong';
      setAlMood(type);
      setAlMsg(rand(type));
      setFeedback({ visible:true, msg:rand(type), type });
      timerRef.current = setTimeout(() => {
        setFeedback(f => ({ ...f, visible:false }));
        advance(newScore);
      }, 1500);
    }, 280);
  }, [selected, transitioning, q, score]);

  /* ── Advance ── */
  function advance(currentScore) {
    setTransitioning(true);
    setSlideDir('left');
    setCardVisible(false);
    setTimeout(() => {
      const nextIdx = qIndex + 1;
      if (nextIdx >= ALL_QUESTIONS.length) {
        const level = calcLevel(currentScore, ALL_QUESTIONS.length);
        setResultLevel(level);
        setPhase('result');
        setAlMood('final');
        setAlMsg("Amazing! Here's your level 🎊");
      } else {
        setQIndex(nextIdx);
        setSelected(null);
        const mid = Math.floor(ALL_QUESTIONS.length / 2);
        const mood = nextIdx === mid ? 'progress' : 'idle';
        setAlMood(mood);
        setAlMsg(nextIdx === mid ? "You're halfway there! 🚀" : 'Take your time! ✨');
        setSlideDir('left');
        setCardVisible(true);
      }
      setTransitioning(false);
    }, 380);
  }

  /* ── Restart ── */
  function restart() {
    clearTimeout(timerRef.current);
    setPhase('intro'); setQIndex(0); setScore(0); setSelected(null);
    setFeedback({ visible:false, msg:'', type:'correct' });
    setAlMood('intro'); setAlMsg("Hi! I'm AL 👋 Let's get started!");
    setCardVisible(true); setTransitioning(false); setResultLevel(null);
    setSlideDir('up');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0a0614 0%,#140930 42%,#0a1428 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Nunito','Segoe UI',system-ui,sans-serif",
    }}>
      {/* Starfield */}
      <StarField />

      {/* Gradient overlays */}
      <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',
        background:'radial-gradient(ellipse 70% 55% at 75% 15%,rgba(99,102,241,.07) 0%,transparent 70%)' }} />
      <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',
        background:'radial-gradient(ellipse 55% 65% at 15% 85%,rgba(124,58,237,.07) 0%,transparent 70%)' }} />

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(10,6,20,.85)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(139,92,246,.16)',
        padding:'11px 22px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <Link href="/dashboard/student/practice-hub" style={{
          display:'flex', alignItems:'center', gap:7,
          color:'#a78bfa', textDecoration:'none',
          fontWeight:800, fontSize:13,
          transition:'color 0.2s',
        }}>
          <ArrowLeft size={15} /> Practice Hub
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{
            width:7, height:7, borderRadius:'50%',
            background:'#a855f7', boxShadow:'0 0 7px #a855f7',
            animation:'headerPulse 2s ease-in-out infinite',
          }} />
          <span style={{ color:'#e9d5ff', fontWeight:900, fontSize:14, letterSpacing:'-.3px' }}>
            Placement Test
          </span>
        </div>

        {phase === 'test'
          ? <span style={{ color:'#6b7280', fontSize:12, fontWeight:700 }}>{qIndex+1}/{ALL_QUESTIONS.length}</span>
          : <div style={{ width:80 }} />
        }
      </header>

      {/* Main */}
      <main style={{
        position:'relative', zIndex:2,
        maxWidth:620, margin:'0 auto',
        padding:'24px 20px 60px',
        minHeight:'calc(100vh - 52px)',
        display:'flex', flexDirection:'column',
      }}>

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <IntroFlow onComplete={handleIntroComplete} />
        )}

        {/* ── TEST ── */}
        {phase === 'test' && (
          <div style={{ display:'flex', flexDirection:'column' }}>

            {/* Progress bar */}
            <div style={{ marginBottom:22 }}>
              <ProgressBar current={qIndex} total={ALL_QUESTIONS.length} levelLabel={q?.level} />
            </div>

            {/* AL + speech */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:18 }}>
              <ALCharacter mood={alMood} size="md" />
              <SpeechBubble message={alMsg} />
            </div>

            {/* Feedback */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12, minHeight:40 }}>
              <FeedbackBubble message={feedback.msg} type={feedback.type} visible={feedback.visible} />
            </div>

            {/* Question */}
            <QuestionCard
              question={q}
              selected={selected}
              onAnswer={handleAnswer}
              visible={cardVisible}
              slideDir={slideDir}
            />
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && resultLevel && (
          <ResultScreen
            score={score}
            total={ALL_QUESTIONS.length}
            level={resultLevel}
            onRestart={restart}
          />
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        @keyframes headerPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>
    </div>
  );
}

/* ── Speech bubble with smooth transitions ── */
function SpeechBubble({ message }) {
  const ref  = useRef(null);
  const prev = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prev.current === message) { prev.current = message; return; }
    prev.current = message;
    const el = ref.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(7px) scale(0.93)';
    el.offsetHeight;
    el.style.transition = 'opacity 0.28s ease, transform 0.32s cubic-bezier(.34,1.56,.64,1)';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0) scale(1)';
  }, [message]);

  return (
    <div ref={ref} style={{
      background: 'rgba(124,58,237,0.18)',
      border: '1px solid rgba(139,92,246,0.36)',
      borderRadius: 999,
      padding: '8px 20px',
      color: '#e9d5ff',
      fontSize: 13,
      fontWeight: 800,
      backdropFilter: 'blur(12px)',
      maxWidth: 290,
      textAlign: 'center',
      letterSpacing: '-0.1px',
      boxShadow: '0 4px 18px rgba(124,58,237,0.15)',
    }}>
      {message}
    </div>
  );
}
