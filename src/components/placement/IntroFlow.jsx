'use client';

import { useState, useRef, useEffect } from 'react';
import ALCharacter from './ALCharacter';

/* ─────────────────────────────────────────────────────────────
   IntroFlow — 3-step Duolingo-style onboarding
   onComplete(path): 'placement' | 'a1'
───────────────────────────────────────────────────────────── */
export default function IntroFlow({ onComplete }) {
  const [step, setStep]       = useState(0); // 0,1,2
  const [path, setPath]       = useState(null);
  const [alMood, setAlMood]   = useState('intro');
  const [alMsg, setAlMsg]     = useState("Hi! I'm AL 👋 Let's get started!");
  const [dir, setDir]         = useState('in'); // 'in' | 'out-left'
  const [selected, setSelected] = useState(null);

  /* Transition to next step */
  function goNext(nextStep, nextMood, nextMsg) {
    setDir('out-left');
    setTimeout(() => {
      setStep(nextStep);
      setAlMood(nextMood);
      setAlMsg(nextMsg);
      setSelected(null);
      setDir('in');
    }, 320);
  }

  function handleStep0(choice) {
    setSelected(choice);
    setAlMood('correct');
    setTimeout(() => {
      const mood = choice === 'new' ? 'idle' : 'thinking';
      const msg  = choice === 'new'
        ? "Great! Let's find the perfect starting point 🌱"
        : "Nice! Let's figure out exactly where you are 🎯";
      goNext(1, mood, msg);
    }, 500);
  }

  function handleStep1(choice) {
    setPath(choice);
    setSelected(choice);
    setAlMood('correct');
    setTimeout(() => {
      goNext(2, 'progress',
        choice === 'a1'
          ? "You're about to begin an amazing journey! 🚀"
          : "This will only take ~10 minutes. Easy! ✨"
      );
    }, 500);
  }

  function handleContinue() {
    setAlMood('final');
    setTimeout(() => onComplete(path || 'placement'), 400);
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: 24,
    }}>

      {/* AL mascot */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
      }}>
        <ALCharacter mood={alMood} size="lg" />
        <SpeechBubble message={alMsg} />
      </div>

      {/* Step content */}
      <div
        key={step}
        className={`intro-step intro-step-${dir}`}
        style={{ width: '100%', maxWidth: 520 }}
      >
        {step === 0 && <Step0 selected={selected} onSelect={handleStep0} />}
        {step === 1 && <Step1 selected={selected} onSelect={handleStep1} />}
        {step === 2 && <Step2 path={path} onContinue={handleContinue} />}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: i === step ? 24 : 8,
            height: 8,
            borderRadius: 999,
            background: i === step
              ? 'linear-gradient(90deg,#7c3aed,#6366f1)'
              : 'rgba(139,92,246,0.25)',
            transition: 'all 0.35s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: i === step ? '0 0 10px rgba(124,58,237,0.5)' : 'none',
          }} />
        ))}
      </div>

      <style>{`
        .intro-step {
          transition: opacity 0.32s ease, transform 0.32s cubic-bezier(.34,1.56,.64,1);
        }
        .intro-step-in {
          opacity: 1;
          transform: translateX(0) scale(1);
          animation: introStepIn 0.38s cubic-bezier(.34,1.56,.64,1) both;
        }
        .intro-step-out-left {
          opacity: 0;
          transform: translateX(-28px) scale(0.97);
          pointer-events: none;
        }
        @keyframes introStepIn {
          from { opacity: 0; transform: translateX(32px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Step 0: How much English? ── */
function Step0({ selected, onSelect }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        color: '#c4b5fd', fontSize: 11, fontWeight: 800,
        letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10,
      }}>Step 1 of 3</p>
      <h2 style={{
        fontSize: 26, fontWeight: 900, color: '#fff',
        letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 28,
      }}>
        How much English<br/>do you know?
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <IntroOptionButton
          label="I'm just starting"
          sub="Beginner — A1 level"
          icon="🌱"
          selected={selected === 'new'}
          onClick={() => onSelect('new')}
        />
        <IntroOptionButton
          label="I know some English"
          sub="Let's find your exact level"
          icon="💡"
          selected={selected === 'some'}
          onClick={() => onSelect('some')}
        />
      </div>
    </div>
  );
}

/* ── Step 1: Choose path ── */
function Step1({ selected, onSelect }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        color: '#c4b5fd', fontSize: 11, fontWeight: 800,
        letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10,
      }}>Step 2 of 3</p>
      <h2 style={{
        fontSize: 26, fontWeight: 900, color: '#fff',
        letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 28,
      }}>
        Choose your path
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <IntroOptionButton
          label="Start from the beginning"
          sub="Go to A1 — the very first level"
          icon="🚀"
          selected={selected === 'a1'}
          onClick={() => onSelect('a1')}
        />
        <IntroOptionButton
          label="Find my level"
          sub="Take a quick placement test"
          icon="🎯"
          selected={selected === 'placement'}
          onClick={() => onSelect('placement')}
          accent
        />
      </div>
    </div>
  );
}

/* ── Step 2: Reassurance ── */
function Step2({ path, onContinue }) {
  const isPlacement = !path || path === 'placement';
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        color: '#c4b5fd', fontSize: 11, fontWeight: 800,
        letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10,
      }}>Step 3 of 3</p>
      <h2 style={{
        fontSize: 26, fontWeight: 900, color: '#fff',
        letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 14,
      }}>
        {isPlacement ? "Almost ready!" : "Let's go!"}
      </h2>
      <p style={{
        color: '#9ca3af', fontSize: 15, lineHeight: 1.65,
        maxWidth: 360, margin: '0 auto 28px',
      }}>
        {isPlacement
          ? "This will only take about 10 minutes. There are no wrong answers — it's just to find the right starting point for you."
          : "You'll start right at the beginning, building your foundation step by step. AL will be with you the whole way."}
      </p>

      {/* Reassurance pills */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: 32,
      }}>
        {(isPlacement
          ? [['⚡','~10 minutes'],['🤝','No wrong answers'],['🏆','Get your CEFR level']]
          : [['🌱','Start at A1'],['📈','Track your progress'],['🤖','AL guides you']]
        ).map(([icon, text]) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(139,92,246,0.13)',
            border: '1px solid rgba(139,92,246,0.28)',
            borderRadius: 999, padding: '6px 14px',
            color: '#ddd6fe', fontSize: 12, fontWeight: 800,
          }}>
            <span style={{ fontSize: 14 }}>{icon}</span>{text}
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        style={{
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff', border: 'none', borderRadius: 18,
          padding: '16px 52px', fontSize: 17, fontWeight: 900,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '-0.3px',
          boxShadow: '0 8px 28px rgba(124,58,237,0.48)',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          transition: 'all 0.2s ease',
          animation: 'introBtnPulse 2s ease-in-out infinite',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 14px 38px rgba(124,58,237,0.68)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.48)';
        }}
      >
        {isPlacement ? "Start the test →" : "Begin at A1 →"}
      </button>

      <p style={{ color: '#4b5563', fontSize: 11, marginTop: 14 }}>
        You can change this anytime
      </p>

      <style>{`
        @keyframes introBtnPulse {
          0%,100% { box-shadow: 0 8px 28px rgba(124,58,237,0.48); }
          50%     { box-shadow: 0 8px 36px rgba(124,58,237,0.68); }
        }
      `}</style>
    </div>
  );
}

/* ── Reusable option button ── */
function IntroOptionButton({ label, sub, icon, selected, onClick, accent }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => { setPressed(true); onClick(); }}
      style={{
        width: '100%',
        background: selected
          ? 'rgba(124,58,237,0.28)'
          : 'rgba(255,255,255,0.04)',
        border: selected
          ? '2px solid rgba(139,92,246,0.75)'
          : accent
          ? '2px solid rgba(139,92,246,0.35)'
          : '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
        transform: pressed ? 'scale(0.97)' : selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 28px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        fontFamily: 'inherit',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.background = 'rgba(139,92,246,0.14)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)';
          e.currentTarget.style.transform = 'scale(1.01) translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = accent ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }
        setPressed(false);
      }}
    >
      {/* Icon circle */}
      <div style={{
        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
        background: selected
          ? 'rgba(139,92,246,0.35)'
          : 'rgba(139,92,246,0.15)',
        border: `1.5px solid rgba(139,92,246,${selected ? '0.55' : '0.25'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
        transition: 'all 0.22s ease',
      }}>
        {selected ? '✓' : icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 800,
          color: selected ? '#e9d5ff' : '#f3f4f6',
          marginBottom: 3, letterSpacing: '-0.2px',
          transition: 'color 0.2s',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700,
          color: selected ? '#a78bfa' : '#6b7280',
          transition: 'color 0.2s',
        }}>
          {sub}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        color: selected ? '#a78bfa' : '#4b5563',
        fontSize: 18, fontWeight: 700,
        transition: 'all 0.2s',
        transform: selected ? 'translateX(2px)' : '',
      }}>
        {selected ? '✓' : '›'}
      </div>
    </button>
  );
}

/* ── Speech bubble with transition ── */
function SpeechBubble({ message }) {
  const ref  = useRef(null);
  const prev = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prev.current === message) { prev.current = message; return; }
    prev.current = message;
    const el = ref.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px) scale(0.92)';
    el.offsetHeight;
    el.style.transition = 'opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1)';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0) scale(1)';
  }, [message]);

  return (
    <div ref={ref} style={{
      background: 'rgba(124,58,237,0.18)',
      border: '1px solid rgba(139,92,246,0.36)',
      borderRadius: 999, padding: '9px 22px',
      color: '#e9d5ff', fontSize: 13, fontWeight: 800,
      backdropFilter: 'blur(12px)',
      maxWidth: 300, textAlign: 'center',
      letterSpacing: '-0.1px',
      boxShadow: '0 4px 20px rgba(124,58,237,0.15)',
    }}>
      {message}
    </div>
  );
}
