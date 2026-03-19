'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ALCharacter    from '@/components/placement/ALCharacter';
import ProgressBar    from '@/components/placement/ProgressBar';
import QuestionCard   from '@/components/placement/QuestionCard';
import FeedbackBubble from '@/components/placement/FeedbackBubble';
import ResultScreen   from '@/components/placement/ResultScreen';
import StarField      from '@/components/placement/StarField';

const ALL_QUESTIONS = [
  { level:'A1', question:'Choose the correct sentence.', options:['She have a dog.','She has a dog.','She is have a dog.','She having a dog.'], answer:'She has a dog.' },
  { level:'A1', question:'What is the plural of "child"?', options:['childs','childes','children','childrens'], answer:'children' },
  { level:'A1', question:'Which word means the opposite of "big"?', options:['tall','small','heavy','loud'], answer:'small' },
  { level:'A1', question:'Complete: "I ___ to school every day."', options:['goes','going','go','am go'], answer:'go' },
  { level:'A1', question:'Which is a correct greeting?', options:['Good morning!','Morning good!','Is good morning!','Morning is good!'], answer:'Good morning!' },
  { level:'A2', question:'She ___ TV when the phone rang.', options:['watched','was watching','watches','is watching'], answer:'was watching' },
  { level:'A2', question:'Which sentence uses "since" correctly?', options:['I have lived here since three years.','I have lived here since 2020.','I lived here since last year.','I am living here since two months.'], answer:'I have lived here since 2020.' },
  { level:'A2', question:'Choose the correct comparative: "This book is ___ than that one."', options:['more interesting','interestinger','most interesting','more interest'], answer:'more interesting' },
  { level:'A2', question:'"Could you ___ me the salt?" — What\'s missing?', options:['pass','bring','give','All are correct'], answer:'All are correct' },
  { level:'A2', question:'Correct response to "Have you ever been to Paris?"', options:['Yes, I have.','Yes, I did.','Yes, I was.','Yes, I had.'], answer:'Yes, I have.' },
  { level:'B1', question:'By the time we arrived, they ___ already left.', options:['have','had','were','did'], answer:'had' },
  { level:'B1', question:'Best word: "The results were ___; no one expected such success."', options:['predictable','mediocre','remarkable','irrelevant'], answer:'remarkable' },
  { level:'B1', question:'Passive voice of "They built this bridge in 1990":', options:['This bridge was built in 1990.','This bridge has been built in 1990.','This bridge is built in 1990.','This bridge built in 1990.'], answer:'This bridge was built in 1990.' },
  { level:'B1', question:'If I had studied harder, I ___ the exam.', options:['will pass','would pass','would have passed','had passed'], answer:'would have passed' },
  { level:'B1', question:'"Despite ___ the instructions, he made errors." Complete correctly.', options:['to read','reading','he read','read'], answer:'reading' },
  { level:'B2', question:'Word closest in meaning to "ambiguous":', options:['clear','vague','definitive','obvious'], answer:'vague' },
  { level:'B2', question:'Which sentence uses subjunctive correctly?', options:['It is important that he attends.','It is important that he attend.','It is important that he will attend.','It is important that he attended.'], answer:'It is important that he attend.' },
  { level:'B2', question:'"She takes after her mother." Meaning of "takes after":', options:['looks different from','resembles','looks after','cares for'], answer:'resembles' },
  { level:'B2', question:'The word "reticent" describes someone who is:', options:['talkative','hesitant to speak','very angry','easily convinced'], answer:'hesitant to speak' },
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
  correct:  ['Nice! 🎉','Brilliant! ✨','That\'s right!','You nailed it!','Spot on! ⭐'],
  wrong:    ['Oops! Try the next one!','Almost there!','Don\'t worry, keep going!','Good try! 💜'],
  progress: ['You\'re doing great! 🚀','Keep it up!','Almost halfway! 💫','Looking good!'],
};
const randMsg = type => { const a = MSGS[type]||MSGS.progress; return a[Math.floor(Math.random()*a.length)]; };

export default function PlacementTestPage() {
  const [phase, setPhase]               = useState('intro');
  const [qIndex, setQIndex]             = useState(0);
  const [score, setScore]               = useState(0);
  const [selected, setSelected]         = useState(null);
  const [feedback, setFeedback]         = useState({ visible:false, msg:'', type:'correct' });
  const [alMood, setAlMood]             = useState('idle');
  const [alMsg, setAlMsg]               = useState('Ready to discover your level? ✨');
  const [cardVisible, setCardVisible]   = useState(true);
  const [resultLevel, setResultLevel]   = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const q = ALL_QUESTIONS[qIndex];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleAnswer = useCallback((option) => {
    if (selected !== null || transitioning) return;
    setSelected(option);
    const isCorrect = option === q.answer;
    const newScore  = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    const type = isCorrect ? 'correct' : 'wrong';
    setAlMood(type);
    setFeedback({ visible:true, msg:randMsg(type), type });
    timerRef.current = setTimeout(() => {
      setFeedback(f => ({ ...f, visible:false }));
      advance(newScore);
    }, 1500);
  }, [selected, transitioning, q, score]);

  function advance(currentScore) {
    setTransitioning(true);
    setCardVisible(false);
    setTimeout(() => {
      const nextIdx = qIndex + 1;
      if (nextIdx >= ALL_QUESTIONS.length) {
        const level = calcLevel(currentScore, ALL_QUESTIONS.length);
        setResultLevel(level);
        setPhase('result');
        setAlMood('final');
        setAlMsg('Amazing! Here\'s your level 🎊');
      } else {
        setQIndex(nextIdx);
        setSelected(null);
        const mid  = Math.floor(ALL_QUESTIONS.length / 2);
        const mood = nextIdx === mid ? 'progress' : 'idle';
        setAlMood(mood);
        setAlMsg(nextIdx === mid ? "You're halfway there! 🚀" : 'Take your time! ✨');
        setCardVisible(true);
      }
      setTransitioning(false);
    }, 380);
  }

  function restart() {
    clearTimeout(timerRef.current);
    setPhase('intro'); setQIndex(0); setScore(0); setSelected(null);
    setFeedback({ visible:false, msg:'', type:'correct' });
    setAlMood('idle'); setAlMsg('Ready to discover your level? ✨');
    setCardVisible(true); setTransitioning(false); setResultLevel(null);
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0a1e 0%,#1a0d3b 42%,#0d1a3b 100%)', position:'relative', overflow:'hidden', fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif" }}>
      <StarField />
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 60% 50% at 80% 20%,rgba(99,102,241,.06) 0%,transparent 70%)' }} />
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'radial-gradient(ellipse 50% 60% at 10% 80%,rgba(124,58,237,.06) 0%,transparent 70%)' }} />

      <header style={{ position:'sticky', top:0, zIndex:50, background:'rgba(15,10,30,.82)', backdropFilter:'blur(18px)', borderBottom:'1px solid rgba(139,92,246,.18)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/dashboard/student/practice-hub" style={{ display:'flex', alignItems:'center', gap:7, color:'#a78bfa', textDecoration:'none', fontWeight:800, fontSize:13 }}>
          <ArrowLeft size={15} /> Practice Hub
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#a855f7', boxShadow:'0 0 7px #a855f7', animation:'pulse 2s ease-in-out infinite' }} />
          <span style={{ color:'#e9d5ff', fontWeight:900, fontSize:14, letterSpacing:'-.3px' }}>Placement Test</span>
        </div>
        {phase==='test' ? <span style={{ color:'#6b7280', fontSize:12, fontWeight:700 }}>{qIndex+1}/{ALL_QUESTIONS.length}</span> : <div style={{ width:80 }} />}
      </header>

      <main style={{ position:'relative', zIndex:2, maxWidth:640, margin:'0 auto', padding:'28px 20px 60px', minHeight:'calc(100vh - 56px)', display:'flex', flexDirection:'column' }}>

        {phase==='intro' && <IntroScreen onStart={() => { setPhase('test'); setAlMsg('Let\'s begin! ✨'); }} />}

        {phase==='test' && (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <div style={{ marginBottom:24 }}>
              <ProgressBar current={qIndex} total={ALL_QUESTIONS.length} levelLabel={q?.level} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:20 }}>
              <ALCharacter mood={alMood} size="md" />
              <SpeechBubble message={alMsg} />
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14, minHeight:42 }}>
              <FeedbackBubble message={feedback.msg} type={feedback.type} visible={feedback.visible} />
            </div>
            <QuestionCard question={q} selected={selected} onAnswer={handleAnswer} visible={cardVisible} />
          </div>
        )}

        {phase==='result' && resultLevel && (
          <ResultScreen score={score} total={ALL_QUESTIONS.length} level={resultLevel} onRestart={restart} />
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

function IntroScreen({ onStart }) {
  return (
    <div style={{ textAlign:'center', animation:'fadeSlideUp 0.6s ease both', flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:16 }}>
      <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
        <ALCharacter mood="idle" size="lg" />
      </div>
      <p style={{ color:'#c4b5fd', fontSize:11, fontWeight:800, letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:10 }}>Your cosmic journey begins</p>
      <h1 style={{ fontSize:34, fontWeight:900, color:'#fff', margin:'0 0 14px', letterSpacing:'-1.5px', lineHeight:1.12 }}>English Placement Test</h1>
      <p style={{ color:'#9ca3af', fontSize:16, maxWidth:420, margin:'0 auto 32px', lineHeight:1.62 }}>20 quick questions to find your perfect CEFR level. AL will guide you every step of the way.</p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:36 }}>
        {[['⚡','~10 minutes'],['🎯','20 questions'],['🏆','CEFR level result'],['🤖','AL guides you']].map(([icon,text])=>(
          <div key={text} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(139,92,246,.13)', border:'1px solid rgba(139,92,246,.28)', borderRadius:999, padding:'7px 15px', color:'#ddd6fe', fontSize:12, fontWeight:800 }}>
            <span>{icon}</span>{text}
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', border:'none', borderRadius:20, padding:'17px 52px', fontSize:17, fontWeight:900, cursor:'pointer', fontFamily:'inherit', letterSpacing:'-.3px', boxShadow:'0 8px 30px rgba(124,58,237,.48)', display:'inline-flex', alignItems:'center', gap:10, transition:'all .2s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)';e.currentTarget.style.boxShadow='0 14px 40px rgba(124,58,237,.65)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 30px rgba(124,58,237,.48)';}}>
        <Sparkles size={18} /> Start the Test
      </button>
      <p style={{ color:'#4b5563', fontSize:12, marginTop:18 }}>No account needed · Results shown immediately</p>
    </div>
  );
}

function SpeechBubble({ message }) {
  const ref  = useRef(null);
  const prev = useRef(null);
  useEffect(() => {
    if (prev.current === message || !ref.current) { prev.current = message; return; }
    prev.current = message;
    const el = ref.current;
    el.style.opacity='0'; el.style.transform='translateY(6px) scale(.94)';
    el.offsetHeight;
    el.style.transition='opacity .28s ease,transform .3s cubic-bezier(.34,1.56,.64,1)';
    el.style.opacity='1'; el.style.transform='translateY(0) scale(1)';
  }, [message]);
  return (
    <div ref={ref} style={{ background:'rgba(124,58,237,.17)', border:'1px solid rgba(139,92,246,.34)', borderRadius:999, padding:'8px 20px', color:'#e9d5ff', fontSize:13, fontWeight:800, backdropFilter:'blur(10px)', maxWidth:280, textAlign:'center', letterSpacing:'-.1px' }}>
      {message}
    </div>
  );
}
