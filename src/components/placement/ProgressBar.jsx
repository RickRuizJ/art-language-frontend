'use client';

import { useEffect, useRef } from 'react';

export default function ProgressBar({ current, total, levelLabel }) {
  const fillRef = useRef(null);
  const pct     = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${pct}%`;
    }
  }, [pct]);

  return (
    <div style={{ width: '100%' }}>
      {/* Meta row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          background: 'rgba(139,92,246,0.18)',
          border: '1px solid rgba(139,92,246,0.32)',
          borderRadius: 999,
          padding: '3px 12px',
          color: '#c4b5fd',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.5px',
          textTransform: 'uppercase',
        }}>
          {levelLabel || 'A1'}
        </span>
        <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 700 }}>
          {current}/{total}
        </span>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: 12,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'visible',
      }}>
        {/* Fill */}
        <div
          ref={fillRef}
          style={{
            position: 'absolute',
            left: 0, top: 0,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%)',
            transition: 'width 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 12px rgba(99,102,241,0.6)',
            width: '0%',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'progressShimmer 1.8s linear infinite',
          }} />
        </div>

        {/* Dot at tip */}
        {pct > 2 && (
          <div style={{
            position: 'absolute',
            right: `${100 - pct}%`,
            top: '50%',
            transform: 'translate(50%, -50%)',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#818cf8',
            border: '2.5px solid rgba(15,10,30,0.9)',
            boxShadow: '0 0 10px rgba(99,102,241,0.8)',
            transition: 'right 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 2,
          }} />
        )}

        {/* Milestone markers */}
        {[25, 50, 75].map(m => (
          <div key={m} style={{
            position: 'absolute',
            left: `${m}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: pct >= m ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)',
            transition: 'background 0.4s ease',
            zIndex: 1,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes progressShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
