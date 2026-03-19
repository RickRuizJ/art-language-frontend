'use client';

import { useEffect, useRef } from 'react';

export default function StarField({ style }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: 110 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random(),
        da: (0.004 + Math.random() * 0.014) * (Math.random() < 0.5 ? 1 : -1),
        speed: 0.02 + Math.random() * 0.06,
      }));
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let t = 0;
    function draw(ts) {
      t = ts / 1000;
      ctx.clearRect(0, 0, W, H);

      /* Nebula blobs */
      const blobs = [
        { x: 0.12 * W, y: 0.18 * H, r: 200, c: 'rgba(124,58,237,0.07)' },
        { x: 0.85 * W, y: 0.72 * H, r: 230, c: 'rgba(59,130,246,0.055)' },
        { x: 0.52 * W, y: 0.5  * H, r: 300, c: 'rgba(168,85,247,0.04)' },
        { x: 0.72 * W, y: 0.22 * H, r: 160, c: 'rgba(99,102,241,0.05)' },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      });

      /* Stars */
      stars.forEach(s => {
        s.a += s.da;
        if (s.a > 1 || s.a < 0) s.da *= -1;
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.globalAlpha = Math.max(0, s.a);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
