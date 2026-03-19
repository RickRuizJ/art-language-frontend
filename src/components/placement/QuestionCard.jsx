'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   QuestionCard
   Props:
     question     – { question, options, answer, level }
     selected     – currently chosen option (or null)
     onAnswer     – callback(option)
     visible      – whether card is mounted/visible
───────────────────────────────────────────────────────────── */
export default function QuestionCard({ question, selected, onAnswer, visible }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (visible) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px) scale(0.96)';
      el.offsetHeight;
      el.style.transition = 'opacity 0.38s ease, transform 0.42s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    } else {
      el.style.transition = 'opacity 0.24s ease, transform 0.24s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-18px) scale(0.97)';
    }
  }, [visible]);

  if (!question) return null;

  return (
    <div
      ref={cardRef}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(139,92,246,0.22)',
        borderRadius: 28,
        padding: '32px 28px 28px',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)',
        opacity: 0,
        transform: 'translateY(28px) scale(0.96)',
      }}
    >
      {/* Question text */}
      <p style={{
        fontSize: 19,
        fontWeight: 800,
        color: '#f3f4f6',
        lineHeight: 1.48,
        textAlign: 'center',
        marginBottom: 28,
        letterSpacing: '-.3px',
      }}>
        {question.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
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

/* ─── Individual option button ─── */
function OptionButton({ option, index, selected, correct, onAnswer }) {
  const ref       = useRef(null);
  const answered  = selected !== null;
  const isThis    = selected === option;
  const isCorrect = option === correct;

  let state = 'default';
  if (answered) {
    if (isCorrect)              state = 'correct';
    else if (isThis && !isCorrect) state = 'wrong';
    else                        state = 'dimmed';
  }

  const styles = {
    default: {
      bg: 'rgba(255,255,255,0.055)',
      border: '1.5px solid rgba(139,92,246,0.2)',
      color: '#e2e8f0',
      letterBg: 'rgba(139,92,246,0.22)',
      letterBorder: 'rgba(139,92,246,0.35)',
      letterColor: '#c4b5fd',
    },
    correct: {
      bg: 'rgba(34,197,94,0.16)',
      border: '2px solid rgba(34,197,94,0.65)',
      color: '#86efac',
      letterBg: 'rgba(34,197,94,0.25)',
      letterBorder: 'rgba(34,197,94,0.5)',
      letterColor: '#4ade80',
    },
    wrong: {
      bg: 'rgba(239,68,68,0.14)',
      border: '2px solid rgba(239,68,68,0.58)',
      color: '#fca5a5',
      letterBg: 'rgba(239,68,68,0.22)',
      letterBorder: 'rgba(239,68,68,0.45)',
      letterColor: '#f87171',
    },
    dimmed: {
      bg: 'rgba(255,255,255,0.02)',
      border: '1.5px solid rgba(255,255,255,0.07)',
      color: '#4b5563',
      letterBg: 'rgba(255,255,255,0.06)',
      letterBorder: 'rgba(255,255,255,0.1)',
      letterColor: '#374151',
    },
  };
  const s = styles[state];

  function handleClick() {
    if (answered) return;
    /* tap animation */
    if (ref.current) {
      ref.current.style.transform = 'scale(0.97)';
      setTimeout(() => {
        if (ref.current) ref.current.style.transform = 'scale(1.01)';
        setTimeout(() => { if (ref.current) ref.current.style.transform = ''; }, 120);
      }, 80);
    }
    onAnswer(option);
  }

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={answered}
      style={{
        width: '100%',
        background: s.bg,
        border: s.border,
        borderRadius: 16,
        padding: '15px 18px',
        color: s.color,
        fontSize: 15,
        fontWeight: 700,
        cursor: answered ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'background 0.22s ease, border-color 0.22s ease, color 0.22s ease, transform 0.15s ease',
        fontFamily: 'inherit',
        lineHeight: 1.4,
      }}
      onMouseEnter={e => {
        if (!answered) {
          e.currentTarget.style.background = 'rgba(139,92,246,0.17)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.48)';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={e => {
        if (!answered) {
          e.currentTarget.style.background = s.bg;
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.transform = '';
        }
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {/* Letter badge */}
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: s.letterBg,
          border: `1.5px solid ${s.letterBorder}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: s.letterColor,
        }}>
          {String.fromCharCode(65 + index)}
        </span>
        <span style={{ flex: 1, wordBreak: 'break-word' }}>{option}</span>
      </span>

      {/* Result icon */}
      {answered && (isCorrect || isThis) && (
        <span style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: isCorrect ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900,
          color: isCorrect ? '#4ade80' : '#f87171',
        }}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </button>
  );
}
