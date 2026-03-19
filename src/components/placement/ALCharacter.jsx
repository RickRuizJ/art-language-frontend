'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/* ─────────────────────────────────────────────────────────────
   ALCharacter v2 — Image-based with CSS keyframe animations
   mood: 'idle'|'thinking'|'correct'|'wrong'|'progress'|'final'|'intro'
   size: 'sm'|'md'|'lg'|'xl'
───────────────────────────────────────────────────────────── */

const SIZES = { sm: 100, md: 150, lg: 210, xl: 280 };

const GLOW_COLOR = {
  idle:     'rgba(168,85,247,0.55)',
  thinking: 'rgba(139,92,246,0.45)',
  correct:  'rgba(34,197,94,0.72)',
  wrong:    'rgba(239,68,68,0.58)',
  progress: 'rgba(59,130,246,0.65)',
  final:    'rgba(251,191,36,0.85)',
  intro:    'rgba(168,85,247,0.55)',
  sleeping: 'rgba(99,102,241,0.38)',
};

export default function ALCharacter({ mood = 'idle', size = 'md', className = '' }) {
  const px = SIZES[size] || SIZES.md;
  const [sparkles, setSparkles] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const prevMood = useRef(mood);

  useEffect(() => {
    if (prevMood.current === mood) return;
    prevMood.current = mood;
    setAnimKey(k => k + 1);

    if (mood === 'correct' || mood === 'final') {
      const n = mood === 'final' ? 14 : 9;
      const colors = ['#fde68a','#c4b5fd','#86efac','#f9a8d4','#7dd3fc','#fbbf24','#a78bfa'];
      setSparkles(Array.from({ length: n }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        angle: (360 / n) * i + (Math.random() * 20 - 10),
        dist: 52 + Math.random() * 40,
        r: 3.5 + Math.random() * 5,
        delay: i * 0.055,
        dur: 0.75 + Math.random() * 0.25,
      })));
      const t = setTimeout(() => setSparkles([]), 1400);
      return () => clearTimeout(t);
    }
  }, [mood]);

  const glowColor = GLOW_COLOR[mood] || GLOW_COLOR.idle;

  return (
    <>
      <div
        key={animKey}
        className={`al-wrap al-${mood} ${className}`}
        style={{ position: 'relative', width: px, height: px, display: 'inline-block' }}
      >
        {/* Ambient glow ring */}
        <div style={{
          position: 'absolute',
          inset: '-18%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor.replace(')', ',0.3)')} 0%, transparent 68%)`,
          filter: 'blur(14px)',
          transition: 'background 0.45s ease',
          animation: 'al-glow-breathe 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Image container */}
        <div
          className="al-img-container"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            filter: `drop-shadow(0 0 18px ${glowColor}) drop-shadow(0 0 6px ${glowColor})`,
            transition: 'filter 0.4s ease',
          }}
        >
          <Image
            src="/al-character.jpg"
            alt="AL your cosmic guide"
            width={px}
            height={px}
            priority
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
            }}
          />

          {/* Mood color overlay */}
          {mood === 'correct' && (
            <div className="al-overlay-correct" style={{
              position:'absolute',inset:0,borderRadius:'50%',
              background:'rgba(34,197,94,0.14)',
            }}/>
          )}
          {mood === 'wrong' && (
            <div className="al-overlay-wrong" style={{
              position:'absolute',inset:0,borderRadius:'50%',
              background:'rgba(239,68,68,0.12)',
            }}/>
          )}
          {mood === 'final' && (
            <div style={{
              position:'absolute',inset:0,borderRadius:'50%',
              background:'rgba(251,191,36,0.12)',
              animation:'al-golden 1.8s ease-in-out infinite',
            }}/>
          )}
        </div>

        {/* Sparkle burst */}
        {sparkles.map(sp => (
          <span
            key={sp.id}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: sp.r * 2, height: sp.r * 2,
              marginTop: -sp.r, marginLeft: -sp.r,
              borderRadius: '50%',
              background: sp.color,
              boxShadow: `0 0 8px ${sp.color}`,
              '--tx': `${Math.cos((sp.angle * Math.PI) / 180) * sp.dist}px`,
              '--ty': `${Math.sin((sp.angle * Math.PI) / 180) * sp.dist}px`,
              animation: `al-spark ${sp.dur}s ${sp.delay}s cubic-bezier(0,.9,.57,1) both`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Thinking bubbles */}
        {mood === 'thinking' && (
          <div style={{
            position:'absolute', top:'6%', right:'-14%',
            display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          }}>
            {[4,6,9].map((s,i) => (
              <div key={i} style={{
                width:s, height:s, borderRadius:'50%',
                background:'rgba(196,181,253,0.8)',
                animation:`al-thought ${1.4s} ${i*0.22}s ease-in-out infinite`,
              }}/>
            ))}
          </div>
        )}

        {/* Sleeping zzz */}
        {mood === 'sleeping' && (
          <div style={{ position:'absolute', top:0, right:'-10%' }}>
            {['z','z','Z'].map((z,i) => (
              <div key={i} style={{
                color:'#c4b5fd', fontSize:9+i*4, fontWeight:900, lineHeight:1.3,
                animation:`al-zzz 2.2s ${i*0.55}s ease-in-out infinite`,
                display:'block',
              }}>{z}</div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* ── IDLE float ── */
        @keyframes al-idle-anim {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          28%     { transform: translateY(-11px) rotate(1.8deg) scale(1.022); }
          56%     { transform: translateY(-16px) rotate(-1.2deg) scale(1.028); }
          80%     { transform: translateY(-7px) rotate(0.6deg) scale(1.012); }
        }
        .al-idle { animation: al-idle-anim 4.2s ease-in-out infinite; }

        /* ── THINKING tilt ── */
        @keyframes al-thinking-anim {
          0%,100% { transform: rotate(0deg) translateY(0); }
          22%     { transform: rotate(-5deg) translateY(-4px); }
          55%     { transform: rotate(4deg) translateY(-6px) scale(1.02); }
          78%     { transform: rotate(-2deg) translateY(-2px); }
        }
        .al-thinking { animation: al-thinking-anim 3s ease-in-out infinite; }

        /* ── CORRECT bounce ── */
        @keyframes al-correct-anim {
          0%   { transform: translateY(0) scale(1) rotate(0deg); }
          12%  { transform: translateY(-20px) scale(1.1) rotate(-4deg); }
          26%  { transform: translateY(-36px) scale(1.16) rotate(5deg); }
          42%  { transform: translateY(-20px) scale(1.1) rotate(-2deg); }
          57%  { transform: translateY(-8px) scale(1.05) rotate(1deg); }
          72%  { transform: translateY(-2px) scale(1.02); }
          100% { transform: translateY(0) scale(1) rotate(0deg); }
        }
        .al-correct { animation: al-correct-anim 0.9s cubic-bezier(.34,1.56,.64,1) both; }

        /* ── WRONG friendly shake ── */
        @keyframes al-wrong-anim {
          0%,100% { transform: translateX(0) rotate(0deg) scale(1); }
          8%      { transform: translateX(-9px) rotate(-4deg) scale(0.97); }
          22%     { transform: translateX(8px) rotate(4deg) scale(1.01); }
          38%     { transform: translateX(-7px) rotate(-3deg) scale(0.99); }
          52%     { transform: translateX(5px) rotate(2deg) scale(1.005); }
          66%     { transform: translateX(-3px) rotate(-1deg); }
          80%     { transform: translateX(2px); }
        }
        .al-wrong { animation: al-wrong-anim 0.7s ease both; }

        /* ── PROGRESS bob ── */
        @keyframes al-progress-anim {
          0%,100% { transform: translateY(0) scale(1); }
          38%     { transform: translateY(-13px) scale(1.05); }
          65%     { transform: translateY(-6px) scale(1.025); }
        }
        .al-progress { animation: al-progress-anim 2s ease-in-out infinite; }

        /* ── FINAL golden bounce loop ── */
        @keyframes al-final-anim {
          0%,100% { transform: translateY(0) scale(1) rotate(0deg); }
          14%     { transform: translateY(-26px) scale(1.13) rotate(-5deg); }
          28%     { transform: translateY(-40px) scale(1.18) rotate(6deg); }
          42%     { transform: translateY(-26px) scale(1.13) rotate(-3deg); }
          58%     { transform: translateY(-14px) scale(1.08) rotate(2deg); }
          74%     { transform: translateY(-22px) scale(1.1) rotate(-2deg); }
        }
        .al-final { animation: al-final-anim 1.35s ease-in-out infinite; }

        /* ── INTRO cinematic entry ── */
        @keyframes al-intro-anim {
          0%   { transform: translateY(70px) scale(0.65) rotate(-10deg); opacity: 0; }
          38%  { transform: translateY(-22px) scale(1.1) rotate(4deg); opacity: 1; }
          62%  { transform: translateY(8px) scale(0.96) rotate(-1.5deg); }
          80%  { transform: translateY(-10px) scale(1.04) rotate(1deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }
        .al-intro { animation: al-intro-anim 1s cubic-bezier(.34,1.56,.64,1) both; }

        /* ── Sparkle ── */
        @keyframes al-spark {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
        }

        /* ── Glow breathe ── */
        @keyframes al-glow-breathe {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.06); }
        }

        /* ── Color overlays ── */
        .al-overlay-correct { animation: al-fade-out 0.9s ease both; }
        .al-overlay-wrong   { animation: al-fade-out 0.7s ease both; }
        @keyframes al-fade-out {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes al-golden {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.25; }
        }

        /* ── Thinking dots ── */
        @keyframes al-thought {
          0%,100% { opacity: 0.3; transform: translateY(0) scale(0.8); }
          50%     { opacity: 1;   transform: translateY(-5px) scale(1.1); }
        }

        /* ── Zzz ── */
        @keyframes al-zzz {
          0%   { opacity: 0; transform: translate(0,0) scale(0.6); }
          35%  { opacity: 0.9; }
          100% { opacity: 0; transform: translate(12px,-28px) scale(1.4); }
        }
      `}</style>
    </>
  );
}
