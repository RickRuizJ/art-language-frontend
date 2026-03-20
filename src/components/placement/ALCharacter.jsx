'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   ALCharacter v4 — 10 real video states
   
   States:
     idle         → al-idle.mp4          (loops)
     correct      → al-correct.mp4       (once → idle)
     wrong        → al-wrong.mp4         (once → idle)
     welcome      → al-welcome.mp4       (once → ready)
     ready        → al-ready.mp4         (once → idle)
     celebrating  → al-celebrating.mp4   (loops)
     welldone     → al-welldone.mp4      (once → idle)
     surprised    → al-surprised.mp4     (once → idle)
     nextphase    → al-next-phase.mp4    (once → idle)
     wronganswer  → al-wrong-answer.mp4  (once → idle)
     thinking     → al-idle.mp4          (loops, reuse)
     superIdle    → al-idle.mp4          (loops + golden glow)
     meteor       → al-surprised.mp4     (once → idle)
     disappear    → al-wrong-answer.mp4  (once → idle)
   
   size: 'sm'|'md'|'lg'|'xl'
   onEnd: callback fired when a one-shot animation finishes
───────────────────────────────────────────────────────────── */

const SIZES = { sm: 110, md: 160, lg: 220, xl: 300 };

/* Video mapping */
const VIDEO = {
  idle:        { src: '/al-idle.mp4',         loop: true,  fallbackAnim: 'alFloat'     },
  correct:     { src: '/al-correct.mp4',       loop: false, fallbackAnim: 'alBounce'    },
  wrong:       { src: '/al-wrong.mp4',         loop: false, fallbackAnim: 'alShake'     },
  welcome:     { src: '/al-welcome.mp4',       loop: false, fallbackAnim: 'alEnter'     },
  ready:       { src: '/al-ready.mp4',         loop: false, fallbackAnim: 'alFloat'     },
  celebrating: { src: '/al-celebrating.mp4',   loop: true,  fallbackAnim: 'alCelebrate' },
  welldone:    { src: '/al-welldone.mp4',      loop: false, fallbackAnim: 'alBounce'    },
  surprised:   { src: '/al-surprised.mp4',     loop: false, fallbackAnim: 'alShake'     },
  nextphase:   { src: '/al-next-phase.mp4',    loop: false, fallbackAnim: 'alBounce'    },
  wronganswer: { src: '/al-wrong-answer.mp4',  loop: false, fallbackAnim: 'alShake'     },
  thinking:    { src: '/al-idle.mp4',          loop: true,  fallbackAnim: 'alTilt'      },
  superIdle:   { src: '/al-idle.mp4',          loop: true,  fallbackAnim: 'alFloat'     },
  meteor:      { src: '/al-surprised.mp4',     loop: false, fallbackAnim: 'alShake'     },
  disappear:   { src: '/al-wrong-answer.mp4',  loop: false, fallbackAnim: 'alShake'     },
};

/* Glow per state */
const GLOW = {
  idle:        { color: '#a855f7', intensity: 0.45 },
  correct:     { color: '#22c55e', intensity: 0.75 },
  wrong:       { color: '#ef4444', intensity: 0.60 },
  welcome:     { color: '#a855f7', intensity: 0.70 },
  ready:       { color: '#818cf8', intensity: 0.55 },
  celebrating: { color: '#fbbf24', intensity: 0.90 },
  welldone:    { color: '#22c55e', intensity: 0.80 },
  surprised:   { color: '#f59e0b', intensity: 0.65 },
  nextphase:   { color: '#3b82f6', intensity: 0.65 },
  wronganswer: { color: '#ef4444', intensity: 0.65 },
  thinking:    { color: '#8b5cf6', intensity: 0.40 },
  superIdle:   { color: '#fbbf24', intensity: 0.80 },
  meteor:      { color: '#f59e0b', intensity: 0.70 },
  disappear:   { color: '#6d28d9', intensity: 0.50 },
};

/* Sparkle colors */
const SPARK_COLORS = {
  correct:     ['#86efac','#fde68a','#c4b5fd','#7dd3fc'],
  welldone:    ['#86efac','#fde68a','#c4b5fd'],
  celebrating: ['#fde68a','#fbbf24','#c4b5fd','#f9a8d4','#7dd3fc'],
  welcome:     ['#c4b5fd','#818cf8','#fde68a'],
};

export default function ALCharacter({
  state = 'idle',
  size  = 'md',
  onEnd = null,
  className = '',
}) {
  const px       = SIZES[size] || SIZES.md;
  const videoRef = useRef(null);
  const cfg      = VIDEO[state] || VIDEO.idle;
  const glow     = GLOW[state]  || GLOW.idle;

  const [videoError, setVideoError] = useState(false);
  const [sparks, setSparks]         = useState([]);
  const [opacity, setOpacity]       = useState(1);
  const prevState = useRef(null);
  const prevSrc   = useRef(null);
  const endCalled = useRef(false);

  /* ── Video management ── */
  useEffect(() => {
    setVideoError(false);
    endCalled.current = false;

    const video = videoRef.current;
    if (!video) return;

    if (prevSrc.current !== cfg.src) {
      prevSrc.current = cfg.src;
      setOpacity(0.25);
      setTimeout(() => {
        if (!video) return;
        video.src    = cfg.src;
        video.loop   = cfg.loop;
        video.load();
        video.play().catch(() => {});
        setOpacity(1);
      }, 110);
    } else {
      video.loop = cfg.loop;
      if (video.paused) video.play().catch(() => {});
    }

    prevState.current = state;
  }, [state, cfg.src, cfg.loop]);

  /* ── Video ended (one-shot) ── */
  const handleEnded = useCallback(() => {
    if (!endCalled.current) {
      endCalled.current = true;
      onEnd?.();
    }
  }, [onEnd]);

  /* ── Sparkles ── */
  useEffect(() => {
    const colors = SPARK_COLORS[state];
    if (!colors) { setSparks([]); return; }

    const n = state === 'celebrating' ? 16 : 10;
    setSparks(Array.from({ length: n }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      angle: (360 / n) * i + Math.random() * 22,
      dist:  55 + Math.random() * 40,
      r:     3.5 + Math.random() * 5,
      delay: i * 0.055,
    })));

    if (state !== 'celebrating') {
      const t = setTimeout(() => setSparks([]), 1300);
      return () => clearTimeout(t);
    }
  }, [state]);

  const glowRgb = hexToRgb(glow.color);
  const glowStr = `rgba(${glowRgb},${glow.intensity})`;
  const glowDim = `rgba(${glowRgb},${glow.intensity * 0.28})`;

  return (
    <>
      <div
        className={`al-root ${className}`}
        style={{
          position: 'relative',
          width:    px,
          height:   px,
          display:  'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position:     'absolute',
          inset:        '-22%',
          borderRadius: '50%',
          background:   `radial-gradient(circle, ${glowDim} 0%, transparent 65%)`,
          filter:       `blur(${Math.round(px * 0.1)}px)`,
          transition:   'background 0.45s ease, box-shadow 0.45s ease',
          boxShadow:    `0 0 ${px * 0.35}px ${glowStr}, 0 0 ${px * 0.7}px ${glowDim}`,
          animation:    'alGlowBreathe 3s ease-in-out infinite',
          pointerEvents:'none',
        }} />

        {/* ── VIDEO ── */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop={cfg.loop}
            muted
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            onEnded={handleEnded}
            style={{
              position:     'absolute',
              inset:        0,
              width:        '100%',
              height:       '100%',
              objectFit:    'cover',
              borderRadius: '50%',
              display:      'block',
              opacity,
              transition:   'opacity 0.12s ease, filter 0.4s ease',
              filter:       `drop-shadow(0 0 ${px * 0.15}px ${glowStr})`,
            }}
          >
            <source src={cfg.src} type="video/mp4" />
          </video>
        )}

        {/* ── CSS FALLBACK ── */}
        {videoError && (
          <div
            className={`al-fallback al-fallback-${cfg.fallbackAnim}`}
            style={{
              position:     'absolute',
              inset:        0,
              borderRadius: '50%',
              overflow:     'hidden',
              filter:       `drop-shadow(0 0 ${px * 0.18}px ${glowStr})`,
            }}
          >
            <img
              src="/al-character.jpg"
              alt="AL"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        )}

        {/* Mood tint */}
        {state === 'correct' && <MoodTint color="rgba(34,197,94,0.12)" dur={0.9} />}
        {state === 'wrong'   && <MoodTint color="rgba(239,68,68,0.10)" dur={0.7} />}
        {state === 'meteor'  && <MoodTint color="rgba(245,158,11,0.12)" dur={0.8} />}
        {state === 'celebrating' && (
          <div style={{ position:'absolute', inset:0, borderRadius:'50%',
            background:'rgba(251,191,36,0.10)', animation:'alGolden 1.8s ease-in-out infinite', pointerEvents:'none' }}/>
        )}

        {/* Thinking sparkle above head */}
        {state === 'thinking' && (
          <div style={{ position:'absolute', top:'-8%', right:'-2%', display:'flex', gap:3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5+i*2, height: 5+i*2, borderRadius:'50%',
                background:'rgba(196,181,253,0.8)',
                animation:`alThoughtDot 1.3s ${i*0.2}s ease-in-out infinite`,
              }}/>
            ))}
          </div>
        )}

        {/* Sparkle burst */}
        {sparks.map(sp => (
          <span key={sp.id} style={{
            position:'absolute', top:'50%', left:'50%',
            width: sp.r*2, height: sp.r*2,
            marginTop: -sp.r, marginLeft: -sp.r,
            borderRadius:'50%', background: sp.color,
            boxShadow: `0 0 8px ${sp.color}`,
            '--tx': `${Math.cos((sp.angle*Math.PI)/180)*sp.dist}px`,
            '--ty': `${Math.sin((sp.angle*Math.PI)/180)*sp.dist}px`,
            animation: `alSpark 0.9s ${sp.delay}s cubic-bezier(0,.9,.57,1) both`,
            pointerEvents:'none',
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes alGlowBreathe {
          0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}
        }
        @keyframes alGolden {
          0%,100%{opacity:.08}50%{opacity:.26}
        }
        @keyframes alThoughtDot {
          0%,100%{opacity:.3;transform:translateY(0) scale(.8)}
          50%{opacity:1;transform:translateY(-5px) scale(1.1)}
        }
        @keyframes alSpark {
          0%{transform:translate(0,0) scale(1);opacity:1}
          100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}
        }

        /* ── CSS Fallback animations ── */
        .al-fallback-alFloat    {animation:alFloat 4s ease-in-out infinite}
        .al-fallback-alBounce   {animation:alBounce .9s cubic-bezier(.34,1.56,.64,1) both}
        .al-fallback-alShake    {animation:alShake .75s ease both}
        .al-fallback-alTilt     {animation:alTilt 2.8s ease-in-out infinite}
        .al-fallback-alCelebrate{animation:alCelebrate 1.4s ease-in-out infinite}
        .al-fallback-alEnter    {animation:alEnter 1s cubic-bezier(.34,1.56,.64,1) both}

        @keyframes alFloat {
          0%,100%{transform:translateY(0) rotate(0deg) scale(1)}
          30%{transform:translateY(-10px) rotate(1.5deg) scale(1.02,.98)}
          60%{transform:translateY(-15px) rotate(-1deg) scale(.98,1.03)}
          80%{transform:translateY(-7px) rotate(.5deg) scale(1.01,.99)}
        }
        @keyframes alBounce {
          0%{transform:scaleX(1.08) scaleY(.9) translateY(5px)}
          15%{transform:scaleX(.9) scaleY(1.15) translateY(-30px) rotate(-4deg)}
          30%{transform:scaleX(1.06) scaleY(.94) translateY(-18px) rotate(4deg)}
          50%{transform:scaleX(.97) scaleY(1.06) translateY(-6px)}
          70%{transform:scaleX(1.03) scaleY(.98) translateY(-2px)}
          100%{transform:scale(1) translateY(0)}
        }
        @keyframes alShake {
          0%{transform:scaleX(1.1) scaleY(.88)}
          8%{transform:translateX(-10px) rotate(-5deg) scaleX(.95) scaleY(1.06)}
          18%{transform:translateX(9px) rotate(5deg)}
          28%{transform:translateX(-7px) rotate(-3deg)}
          40%{transform:translateX(5px) rotate(2deg)}
          55%{transform:translateX(-3px) rotate(-1deg)}
          70%{transform:translateY(3px) rotate(-1.5deg)}
          100%{transform:scale(1) translateY(0)}
        }
        @keyframes alTilt {
          0%,100%{transform:rotate(0deg) translateY(0)}
          22%{transform:rotate(-5deg) translateY(-4px)}
          55%{transform:rotate(4deg) translateY(-7px) scale(1.02)}
          78%{transform:rotate(-2deg) translateY(-2px)}
        }
        @keyframes alCelebrate {
          0%,100%{transform:translateY(0) scale(1) rotate(0deg)}
          14%{transform:translateY(-24px) scaleX(.9) scaleY(1.12) rotate(-5deg)}
          28%{transform:translateY(-40px) scaleX(1.06) scaleY(.94) rotate(6deg)}
          44%{transform:translateY(-24px) scaleX(.94) scaleY(1.08) rotate(-3deg)}
          60%{transform:translateY(-12px) scaleX(1.03) scaleY(.97) rotate(2deg)}
          78%{transform:translateY(-22px) scaleX(.97) scaleY(1.05) rotate(-2deg)}
        }
        @keyframes alEnter {
          0%{transform:translateY(80px) scale(.6) rotate(-12deg);opacity:0}
          38%{transform:translateY(-22px) scale(1.12) rotate(5deg);opacity:1}
          62%{transform:translateY(8px) scale(.96) rotate(-1.5deg)}
          80%{transform:translateY(-10px) scale(1.04) rotate(1deg)}
          100%{transform:translateY(0) scale(1) rotate(0deg);opacity:1}
        }
      `}</style>
    </>
  );
}

function MoodTint({ color, dur }) {
  return (
    <div style={{
      position:'absolute', inset:0, borderRadius:'50%',
      background: color,
      animation: `alTintFade ${dur}s ease both`,
      pointerEvents:'none',
    }}>
      <style>{`@keyframes alTintFade{0%{opacity:1}100%{opacity:0}}`}</style>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
