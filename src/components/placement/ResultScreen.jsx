'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import ALCharacter from './ALCharacter';

const LEVEL_CONFIG = {
  A1: { emoji: '🌱', name: 'Beginner',           color: '#22c55e', shadow: 'rgba(34,197,94,.35)',   desc: 'Every expert started here. Your journey begins!' },
  A2: { emoji: '🌿', name: 'Elementary',          color: '#16a34a', shadow: 'rgba(22,163,74,.35)',   desc: 'Solid foundation — you understand the basics well!' },
  B1: { emoji: '💧', name: 'Intermediate',        color: '#3b82f6', shadow: 'rgba(59,130,246,.35)',  desc: 'You communicate confidently in familiar situations.' },
  B2: { emoji: '🌊', name: 'Upper-Intermediate',  color: '#1d4ed8', shadow: 'rgba(29,78,216,.35)',   desc: 'You express yourself with precision and fluency!' },
};

export default function ResultScreen({ score, total, level, onRestart }) {
  const wrapRef = useRef(null);
  const cfg     = LEVEL_CONFIG[level] || LEVEL_CONFIG.A1;
  const pct     = Math.round((score / total) * 100);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.94) translateY(20px)';
    el.offsetHeight;
    el.style.transition = 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    el.style.opacity = '1';
    el.style.transform = 'scale(1) translateY(0)';
  }, []);

  return (
    <div ref={wrapRef} style={{ textAlign: 'center', opacity: 0, transform: 'scale(0.94)' }}>

      {/* AL celebrating */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <ALCharacter mood="final" size="lg" />
      </div>

      {/* Congrats */}
      <p style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
        Test Complete
      </p>
      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#f9fafb', marginBottom: 24, letterSpacing: '-1px' }}>
        Your English Level
      </h2>

      {/* Level card */}
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: `2px solid ${cfg.color}55`,
        borderRadius: 28,
        padding: '32px 48px',
        backdropFilter: 'blur(18px)',
        boxShadow: `0 0 60px ${cfg.shadow}, 0 8px 40px rgba(0,0,0,0.38)`,
        marginBottom: 28,
        minWidth: 280,
      }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{cfg.emoji}</div>
        <div style={{
          fontSize: 62,
          fontWeight: 900,
          color: cfg.color,
          textShadow: `0 0 32px ${cfg.color}`,
          lineHeight: 1,
          letterSpacing: '-3px',
          marginBottom: 6,
        }}>
          {level}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>
          {cfg.name}
        </div>
        <div style={{ fontSize: 14, color: '#9ca3af', maxWidth: 260, lineHeight: 1.55 }}>
          {cfg.desc}
        </div>

        {/* Score pill */}
        <div style={{
          marginTop: 20,
          padding: '10px 24px',
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 999,
          color: '#c4b5fd',
          fontWeight: 800,
          fontSize: 14,
        }}>
          {score} / {total} correct &nbsp;·&nbsp; {pct}%
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(139,92,246,0.14)',
            border: '1.5px solid rgba(139,92,246,0.38)',
            borderRadius: 16,
            padding: '13px 26px',
            color: '#c4b5fd',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.14)'; e.currentTarget.style.transform = ''; }}
        >
          ↺ Try Again
        </button>

        <Link
          href="/dashboard/student/practice-hub"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none',
            borderRadius: 16,
            padding: '13px 26px',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(124,58,237,0.48)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.48)'; }}
        >
          Start Practicing →
        </Link>
      </div>
    </div>
  );
}
