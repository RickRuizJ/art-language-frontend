'use client';

import { useEffect, useRef, useState } from 'react';
import ALCharacter from './ALCharacter';

/* ─────────────────────────────────────────────────────────────
   WelcomeScreen — Cosmic nova entrance
   AL emerges from rainbow arc, welcomes the user
───────────────────────────────────────────────────────────── */
export default function WelcomeScreen({ onStart }) {
  const [phase, setPhase] = useState('arc');    // arc → al → ready
  const [alState, setAlState] = useState('welcome');

  useEffect(() => {
    // Arc forms first
    const t1 = setTimeout(() => setPhase('al'), 800);
    const t2 = setTimeout(() => {
      setAlState('ready');
      setPhase('ready');
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px 20px 32px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── COSMIC RAINBOW ARC ── */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '140%',
        height: 320,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {/* Arc layers */}
        {[
          { color: '#7c3aed', blur: 28, scale: 1,    delay: '0s'    },
          { color: '#6366f1', blur: 22, scale: 0.88, delay: '0.1s'  },
          { color: '#3b82f6', blur: 18, scale: 0.76, delay: '0.2s'  },
          { color: '#06b6d4', blur: 14, scale: 0.65, delay: '0.3s'  },
          { color: '#a855f7', blur: 32, scale: 1.1,  delay: '0.05s' },
        ].map((arc, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0, left: '50%',
            transform: `translateX(-50%) scaleX(${arc.scale})`,
            width: '90%',
            height: 280,
            borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
            border: `3px solid ${arc.color}`,
            borderBottom: 'none',
            filter: `blur(${arc.blur}px)`,
            opacity: phase === 'arc' || phase === 'al' || phase === 'ready' ? 0.7 : 0,
            transition: `opacity 0.8s ${arc.delay} ease`,
            animation: phase !== 'arc' ? 'none' : `arcPulse 2s ease-in-out infinite`,
          }}/>
        ))}
        {/* Radiant center burst */}
        <div style={{
          position: 'absolute',
          top: '60%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 180, height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
          filter: 'blur(30px)',
          opacity: phase === 'arc' ? 0 : 0.8,
          transition: 'opacity 0.8s ease',
        }}/>
      </div>

      {/* ── AL CHARACTER ── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        opacity: phase === 'arc' ? 0 : 1,
        transform: phase === 'arc' ? 'translateY(30px) scale(0.8)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        marginBottom: 20,
      }}>
        <ALCharacter state={alState} size="xl" />
      </div>

      {/* ── TEXT ── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        opacity: phase === 'ready' ? 1 : 0,
        transform: phase === 'ready' ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <p style={{
          color: '#c4b5fd',
          fontSize: 11, fontWeight: 800,
          letterSpacing: '2.5px', textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          Your cosmic journey begins
        </p>
        <h1 style={{
          fontSize: 30, fontWeight: 900,
          color: '#fff', letterSpacing: '-1.2px',
          lineHeight: 1.1, marginBottom: 14,
        }}>
          Welcome! Let's explore<br/>your English level.
        </h1>
        <p style={{
          color: '#9ca3af', fontSize: 15,
          maxWidth: 380, margin: '0 auto 32px',
          lineHeight: 1.65,
        }}>
          20 quick questions to find your perfect CEFR level.
          I'll be with you every step of the way.
        </p>

        {/* Info pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
          {[['⚡','~10 minutes'],['🎯','20 questions'],['🏆','A1 to B2 result'],['🌌','AL guides you']].map(([icon,text]) => (
            <div key={text} style={{
              display:'flex', alignItems:'center', gap:6,
              background:'rgba(139,92,246,0.12)',
              border:'1px solid rgba(139,92,246,0.28)',
              borderRadius:999, padding:'6px 14px',
              color:'#ddd6fe', fontSize:12, fontWeight:800,
            }}>
              <span style={{fontSize:14}}>{icon}</span>{text}
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color:'#fff', border:'none', borderRadius:20,
            padding:'16px 52px', fontSize:17, fontWeight:900,
            cursor:'pointer', fontFamily:'inherit',
            letterSpacing:'-0.3px',
            boxShadow:'0 8px 30px rgba(124,58,237,0.5)',
            display:'inline-flex', alignItems:'center', gap:10,
            transition:'all 0.2s ease',
            animation:'welcomeBtnPulse 2s ease-in-out infinite',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform='translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow='0 14px 38px rgba(124,58,237,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform='';
            e.currentTarget.style.boxShadow='0 8px 30px rgba(124,58,237,0.5)';
          }}
        >
          🚀 Start Test
        </button>

        <p style={{ color:'#4b5563', fontSize:11, marginTop:14 }}>
          No account needed · Results shown immediately
        </p>
      </div>

      <style>{`
        @keyframes arcPulse {
          0%,100%{opacity:.6} 50%{opacity:.9}
        }
        @keyframes welcomeBtnPulse {
          0%,100%{box-shadow:0 8px 30px rgba(124,58,237,.5)}
          50%{box-shadow:0 8px 40px rgba(124,58,237,.72)}
        }
      `}</style>
    </div>
  );
}
