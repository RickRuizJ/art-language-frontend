'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   FeedbackBubble v2 — scale+bounce in, fade out
───────────────────────────────────────────────────────────── */
export default function FeedbackBubble({ message, type = 'correct', visible }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.7) translateY(10px)';
      el.offsetHeight;
      el.style.transition = 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    } else {
      el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9) translateY(-6px)';
    }
  }, [visible, message]);

  const C = {
    correct: { bg:'rgba(34,197,94,0.16)',  border:'rgba(34,197,94,0.38)',  text:'#86efac', icon:'✓' },
    wrong:   { bg:'rgba(239,68,68,0.14)',   border:'rgba(239,68,68,0.32)',  text:'#fca5a5', icon:'✗' },
    info:    { bg:'rgba(139,92,246,0.16)',  border:'rgba(139,92,246,0.32)', text:'#c4b5fd', icon:'💫' },
  };
  const c = C[type] || C.info;

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 999,
        padding: '9px 22px',
        color: c.text,
        fontSize: 14,
        fontWeight: 800,
        backdropFilter: 'blur(14px)',
        opacity: 0,
        transform: 'scale(0.7) translateY(10px)',
        pointerEvents: 'none',
        letterSpacing: '-0.1px',
        boxShadow: type === 'correct'
          ? '0 4px 20px rgba(34,197,94,0.2)'
          : type === 'wrong'
          ? '0 4px 16px rgba(239,68,68,0.18)'
          : 'none',
      }}
    >
      <span style={{
        fontSize: 16,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22, height: 22,
        borderRadius: '50%',
        background: type === 'correct'
          ? 'rgba(34,197,94,0.24)'
          : type === 'wrong'
          ? 'rgba(239,68,68,0.2)'
          : 'rgba(139,92,246,0.2)',
      }}>
        {c.icon}
      </span>
      {message}
    </div>
  );
}
