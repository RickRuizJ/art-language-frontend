'use client';

import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   FeedbackBubble
   type: 'correct' | 'wrong' | 'info'
   message: string
   visible: boolean
───────────────────────────────────────────────────────────── */
export default function FeedbackBubble({ message, type = 'correct', visible }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (visible) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px) scale(0.88)';
      el.offsetHeight; // force reflow
      el.style.transition = 'opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    } else {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px) scale(0.92)';
    }
  }, [visible, message]);

  const colors = {
    correct: { bg: 'rgba(34,197,94,0.16)',  border: 'rgba(34,197,94,0.38)',  text: '#86efac', icon: '✓' },
    wrong:   { bg: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.32)',  text: '#fca5a5', icon: '✗' },
    info:    { bg: 'rgba(139,92,246,0.16)',  border: 'rgba(139,92,246,0.32)', text: '#c4b5fd', icon: '💫' },
  };
  const c = colors[type] || colors.info;

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
        padding: '8px 20px',
        color: c.text,
        fontSize: 14,
        fontWeight: 800,
        backdropFilter: 'blur(12px)',
        opacity: 0,
        transform: 'translateY(12px) scale(0.88)',
        pointerEvents: 'none',
        letterSpacing: '-.1px',
      }}
    >
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      {message}
    </div>
  );
}
