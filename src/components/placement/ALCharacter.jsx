'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   ALCharacter v3 — Video-based with CSS fallback
   
   mood: 'idle' | 'thinking' | 'correct' | 'wrong' | 'progress' | 'final' | 'intro'
   size: 'sm' | 'md' | 'lg' | 'xl'
   
   VIDEO MAP — add files to /public/ as you create them:
     al-idle.mp4         — floating loop  (loops forever)
     al-correct.mp4      — bounce + smile (plays once → idle)
     al-wrong.mp4        — shake + sad    (plays once → idle)
     al-thinking.mp4     — tilt loop      (loops until answer)
     al-final.mp4        — celebration    (loops forever)
   
   FALLBACK: If a video file is missing, falls back to the
   CSS-animated image version automatically — no crash, no blank.
───────────────────────────────────────────────────────────── */

const SIZES = { sm: 100, md: 150, lg: 210, xl: 280 };

/* Which moods loop vs play once */
const LOOPS = {
  idle:     true,
  thinking: true,
  progress: true,
  final:    true,
  intro:    false,
  correct:  false,   // plays once then caller sets back to idle
  wrong:    false,   // plays once then caller sets back to idle
};

/* Video file per mood — only idle + correct exist for now */
const VIDEO_SRC = {
  idle:     '/al-idle.mp4',
  thinking: '/al-idle.mp4',   // reuse idle until thinking video exists
  progress: '/al-idle.mp4',   // reuse idle
  intro:    '/al-idle.mp4',   // reuse idle
  correct:  '/al-correct.mp4',
  wrong:    '/al-correct.mp4', // reuse correct until wrong video exists
  final:    '/al-correct.mp4', // reuse correct until celebration video exists
};

/* Glow color per mood */
const GLOW = {
  idle:     { color: 'rgba(168,85,247,0.5)',  spread: 40 },
  thinking: { color: 'rgba(139,92,246,0.42)', spread: 32 },
  correct:  { color: 'rgba(34,197,94,0.72)',  spread: 52 },
  wrong:    { color: 'rgba(239,68,68,0.62)',  spread: 42 },
  progress: { color: 'rgba(59,130,246,0.6)',  spread: 38 },
  final:    { color: 'rgba(251,191,36,0.82)', spread: 60 },
  intro:    { color: 'rgba(168,85,247,0.5)',  spread: 40 },
};

export default function ALCharacter({ mood = 'idle', size = 'md', className = '' }) {
  const px          = SIZES[size] || SIZES.md;
  const videoRef    = useRef(null);
  const prevSrc     = useRef(null);
  const [videoOk, setVideoOk]   = useState(true);   // false = use CSS fallback
  const [opacity, setOpacity]   = useState(1);       // for crossfade
  const [sparkles, setSparkles] = useState([]);
  const [animKey, setAnimKey]   = useState(0);

  const src = VIDEO_SRC[mood] || VIDEO_SRC.idle;
  const shouldLoop = LOOPS[mood] ?? true;
  const glow = GLOW[mood] || GLOW.idle;

  /* ── Smooth src transition ── */
  useEffect(() => {
    if (!videoOk) return;
    const video = videoRef.current;
    if (!video) return;

    if (prevSrc.current !== src) {
      prevSrc.current = src;
      /* Crossfade: fade out → swap → fade in */
      setOpacity(0.3);
      setTimeout(() => {
        video.src = src;
        video.loop = shouldLoop;
        video.load();
        video.play().catch(() => {
          /* Autoplay blocked - will play on next user gesture */
        });
        setOpacity(1);
      }, 120);
    } else {
      /* Same source, just update loop */
      video.loop = shouldLoop;
      /* If it was paused (ended), restart */
      if (video.paused && video.ended) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  }, [src, shouldLoop, videoOk]);

  /* ── Sparkles for correct/final ── */
  useEffect(() => {
    setAnimKey(k => k + 1);
    if (mood === 'correct' || mood === 'final') {
      const n = mood === 'final' ? 14 : 9;
      const colors = ['#fde68a','#c4b5fd','#86efac','#f9a8d4','#7dd3fc','#fbbf24'];
      setSparkles(Array.from({ length: n }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        angle: (360 / n) * i + Math.random() * 20,
        dist: 50 + Math.random() * 35,
        r: 3.5 + Math.random() * 4.5,
        delay: i * 0.055,
      })));
      const t = setTimeout(() => setSparkles([]), 1200);
      return () => clearTimeout(t);
    }
  }, [mood]);

  /* ── Video error → CSS fallback ── */
  function handleError() {
    setVideoOk(false);
  }

  return (
    <>
      <div
        className={`al-root al-mood-${mood} ${className}`}
        key={animKey}
        style={{
          position: 'relative',
          width: px,
          height: px,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* ── Ambient glow ring ── */}
        <div
          className="al-glow-ring"
          style={{
            position: 'absolute',
            inset: '-18%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glow.color.replace(/[\d.]+\)$/, '0.28)')} 0%, transparent 68%)`,
            filter: `blur(${Math.round(glow.spread * 0.35)}px)`,
            transition: 'background 0.45s ease, filter 0.45s ease',
            animation: 'alGlowBreathe 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* ── VIDEO (primary) ── */}
        {videoOk && (
          <video
            ref={videoRef}
            autoPlay
            loop={shouldLoop}
            muted
            playsInline
            preload="auto"
            onError={handleError}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              display: 'block',
              opacity,
              transition: 'opacity 0.12s ease, filter 0.4s ease',
              filter: `drop-shadow(0 0 ${glow.spread * 0.45}px ${glow.color})`,
            }}
          >
            <source src={src} type="video/mp4" />
          </video>
        )}

        {/* ── CSS FALLBACK (if video fails or missing) ── */}
        {!videoOk && (
          <div
            className={`al-css-fallback al-css-${mood}`}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              overflow: 'hidden',
              filter: `drop-shadow(0 0 ${glow.spread * 0.5}px ${glow.color})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/al-character.jpg"
              alt="AL"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        )}

        {/* ── Mood color tint overlays ── */}
        {mood === 'correct' && (
          <div style={{
            position:'absolute',inset:0,borderRadius:'50%',
            background:'rgba(34,197,94,0.12)',
            animation:'alTintFade 0.9s ease both',
            pointerEvents:'none',
          }}/>
        )}
        {mood === 'wrong' && (
          <div style={{
            position:'absolute',inset:0,borderRadius:'50%',
            background:'rgba(239,68,68,0.1)',
            animation:'alTintFade 0.7s ease both',
            pointerEvents:'none',
          }}/>
        )}
        {mood === 'final' && (
          <div style={{
            position:'absolute',inset:0,borderRadius:'50%',
            background:'rgba(251,191,36,0.1)',
            animation:'alGoldenPulse 1.8s ease-in-out infinite',
            pointerEvents:'none',
          }}/>
        )}

        {/* ── Sparkle particles ── */}
        {sparkles.map(sp => (
          <span
            key={sp.id}
            style={{
              position:'absolute',
              top:'50%', left:'50%',
              width: sp.r * 2, height: sp.r * 2,
              marginTop: -sp.r, marginLeft: -sp.r,
              borderRadius:'50%',
              background: sp.color,
              boxShadow: `0 0 8px ${sp.color}`,
              '--tx': `${Math.cos((sp.angle * Math.PI) / 180) * sp.dist}px`,
              '--ty': `${Math.sin((sp.angle * Math.PI) / 180) * sp.dist}px`,
              animation: `alSpark 0.85s ${sp.delay}s cubic-bezier(0,.9,.57,1) both`,
              pointerEvents:'none',
            }}
          />
        ))}
      </div>

      <style>{`
        /* ── Glow breathe ── */
        @keyframes alGlowBreathe {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.05); }
        }

        /* ── CSS mood animations (fallback + overlay) ── */
        .al-css-idle     { animation: alFloat 4s ease-in-out infinite; }
        .al-css-thinking { animation: alTilt 2.8s ease-in-out infinite; }
        .al-css-correct  { animation: alBounce 0.9s cubic-bezier(.34,1.56,.64,1) both; }
        .al-css-wrong    { animation: alShake 0.7s ease both; }
        .al-css-progress { animation: alFloat 2s ease-in-out infinite; }
        .al-css-final    { animation: alCelebrate 1.35s ease-in-out infinite; }
        .al-css-intro    { animation: alEnter 1s cubic-bezier(.34,1.56,.64,1) both; }

        @keyframes alFloat {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          30%     { transform: translateY(-10px) rotate(1.8deg) scale(1.022); }
          60%     { transform: translateY(-15px) rotate(-1.2deg) scale(1.028); }
          80%     { transform: translateY(-7px) rotate(0.6deg) scale(1.012); }
        }
        @keyframes alTilt {
          0%,100% { transform: rotate(0deg) translateY(0); }
          25%     { transform: rotate(-4deg) translateY(-4px); }
          55%     { transform: rotate(3deg) translateY(-6px) scale(1.02); }
          78%     { transform: rotate(-2deg) translateY(-2px); }
        }
        @keyframes alBounce {
          0%   { transform: translateY(0) scale(1); }
          15%  { transform: translateY(-20px) scale(1.1); }
          30%  { transform: translateY(-34px) scale(1.16); }
          45%  { transform: translateY(-18px) scale(1.1); }
          65%  { transform: translateY(-5px) scale(1.04); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes alShake {
          0%,100% { transform: translateX(0) rotate(0deg); }
          10%     { transform: translateX(-9px) rotate(-4deg); }
          25%     { transform: translateX(8px) rotate(4deg); }
          40%     { transform: translateX(-7px) rotate(-3deg); }
          55%     { transform: translateX(5px) rotate(2deg); }
          70%     { transform: translateX(-3px); }
          85%     { transform: translateX(2px); }
        }
        @keyframes alCelebrate {
          0%,100% { transform: translateY(0) scale(1) rotate(0deg); }
          15%     { transform: translateY(-26px) scale(1.13) rotate(-5deg); }
          30%     { transform: translateY(-40px) scale(1.18) rotate(6deg); }
          45%     { transform: translateY(-24px) scale(1.12) rotate(-3deg); }
          60%     { transform: translateY(-12px) scale(1.08) rotate(2deg); }
          78%     { transform: translateY(-20px) scale(1.1) rotate(-2deg); }
        }
        @keyframes alEnter {
          0%   { transform: translateY(70px) scale(0.65) rotate(-10deg); opacity: 0; }
          40%  { transform: translateY(-20px) scale(1.1) rotate(4deg); opacity: 1; }
          65%  { transform: translateY(8px) scale(0.97) rotate(-1.5deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }

        /* ── Tint overlays ── */
        @keyframes alTintFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes alGoldenPulse {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.24; }
        }

        /* ── Sparkles ── */
        @keyframes alSpark {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
    </>
  );
}
