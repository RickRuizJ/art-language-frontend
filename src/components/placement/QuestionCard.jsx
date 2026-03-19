'use client';

import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   QuestionCard v2 — slide transitions + tap scale feedback
───────────────────────────────────────────────────────────── */
export default function QuestionCard({ question, selected, onAnswer, visible, slideDir = 'up' }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (visible) {
      el.style.opacity = '0';
      el.style.transform = slideDir === 'left'
        ? 'translateX(40px) scale(0.97)'
        : 'translateY(30px) scale(0.96)';
      el.offsetHeight;
      el.style.transition = 'opacity 0.38s ease, transform 0.44s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateX(0) translateY(0) scale(1)';
    } else {
      el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      el.style.opacity = '0';
      el.style.transform = slideDir === 'left'
        ? 'translateX(-32px) scale(0.97)'
        : 'translateY(-18px) scale(0.97)';
    }
  }, [visible, slideDir]);

  if (!question) return null;

  return (
    <div
      ref={cardRef}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(139,92,246,0.22)',
        borderRadius: 28,
        padding: '30px 26px 26px',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)',
        opacity: 0,
      }}
    >
      {/* Question text */}
      <p style={{
        fontSize: 18,
        fontWeight: 800,
        color: '#f3f4f6',
        lineHeight: 1.5,
        textAlign: 'center',
        marginBottom: 26,
        letterSpacing: '-0.3px',
      }}>
        {question.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={`${question.question}-${i}`}
            option={opt}
            index={i}
            selected={selected}
            correct={question.answer}
            onAnswer={onAnswer}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({ option, index, selected, correct, onAnswer }) {
  const [pressing, setPressing] = useState(false);
  const answered  = selected !== null;
  const isThis    = selected === option;
  const isCorrect = option === correct;

  let state = 'default';
  if (answered) {
    if (isCorrect)          state = 'correct';
    else if (isThis)        state = 'wrong';
    else                    state = 'dimmed';
  }

  const S = {
    default: {
      bg:     'rgba(255,255,255,0.055)',
      border: '1.5px solid rgba(139,92,246,0.2)',
      color:  '#e2e8f0',
      lBg:    'rgba(139,92,246,0.2)',
      lBd:    'rgba(139,92,246,0.32)',
      lCol:   '#c4b5fd',
    },
    correct: {
      bg:     'rgba(34,197,94,0.16)',
      border: '2px solid rgba(34,197,94,0.65)',
      color:  '#86efac',
      lBg:    'rgba(34,197,94,0.24)',
      lBd:    'rgba(34,197,94,0.5)',
      lCol:   '#4ade80',
    },
    wrong: {
      bg:     'rgba(239,68,68,0.14)',
      border: '2px solid rgba(239,68,68,0.58)',
      color:  '#fca5a5',
      lBg:    'rgba(239,68,68,0.22)',
      lBd:    'rgba(239,68,68,0.45)',
      lCol:   '#f87171',
    },
    dimmed: {
      bg:     'rgba(255,255,255,0.02)',
      border: '1.5px solid rgba(255,255,255,0.07)',
      color:  '#374151',
      lBg:    'rgba(255,255,255,0.06)',
      lBd:    'rgba(255,255,255,0.1)',
      lCol:   '#1f2937',
    },
  };
  const s = S[state];

  function handleClick() {
    if (answered) return;
    onAnswer(option);
  }

  return (
    <button
      onClick={handleClick}
      disabled={answered}
      onMouseDown={() => !answered && setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      onTouchStart={() => !answered && setPressing(true)}
      onTouchEnd={() => { setPressing(false); if (!answered) handleClick(); }}
      style={{
        width: '100%',
        background: s.bg,
        border: s.border,
        borderRadius: 15,
        padding: '14px 17px',
        color: s.color,
        fontSize: 14,
        fontWeight: 700,
        cursor: answered ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 11,
        fontFamily: 'inherit',
        lineHeight: 1.42,
        transform: pressing ? 'scale(0.97)' : state === 'correct' ? 'scale(1.01)' : 'scale(1)',
        transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.14s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
        boxShadow: state === 'correct'
          ? '0 0 20px rgba(34,197,94,0.22)'
          : state === 'wrong'
          ? '0 0 16px rgba(239,68,68,0.18)'
          : 'none',
      }}
      onMouseEnter={e => {
        if (!answered) {
          e.currentTarget.style.background = 'rgba(139,92,246,0.17)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.48)';
          e.currentTarget.style.transform = 'translateX(3px)';
        }
      }}
      onMouseLeave={e => {
        if (!answered) {
          e.currentTarget.style.background = s.bg;
          e.currentTarget.style.borderColor = '';
          if (!pressing) e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <span style={{
          width: 27, height: 27, borderRadius: 8, flexShrink: 0,
          background: s.lBg, border: `1.5px solid ${s.lBd}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 900, color: s.lCol,
          transition: 'all 0.2s',
        }}>
          {String.fromCharCode(65 + index)}
        </span>
        <span style={{ flex: 1, wordBreak: 'break-word' }}>{option}</span>
      </span>

      {answered && (isCorrect || isThis) && (
        <span style={{
          width: 25, height: 25, borderRadius: '50%', flexShrink: 0,
          background: isCorrect ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 900,
          color: isCorrect ? '#4ade80' : '#f87171',
          animation: 'qcIconPop 0.3s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}

      <style>{`
        @keyframes qcIconPop {
          from { transform: scale(0) rotate(-30deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
      `}</style>
    </button>
  );
}
