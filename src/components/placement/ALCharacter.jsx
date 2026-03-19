'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   ALCharacter — Cosmic mascot with canvas-based animation
   mood: 'idle' | 'thinking' | 'correct' | 'wrong' | 'progress' | 'final'
   size: 'sm' | 'md' | 'lg'
───────────────────────────────────────────────────────────── */

const SIZE_MAP = { sm: 110, md: 160, lg: 220 };

export default function ALCharacter({ mood = 'idle', size = 'md', className = '' }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef({
    time: 0,
    blinkT: 0,
    blinkNext: 2.5 + Math.random() * 3,
    sparkles: [],
    tears: [],
    zzzs: [],
    bobY: 0,
    shakeX: 0,
    glowPulse: 0,
    lastTs: 0,
    mood: mood,
  });

  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const W  = px;
  const H  = Math.round(px * 1.15);

  /* keep mood ref in sync */
  useEffect(() => {
    const s = stateRef.current;
    const prev = s.mood;
    s.mood = mood;

    if (mood === 'correct')  { spawnSparkles(s, W, H, 10); s.glowPulse = 1; }
    if (mood === 'final')    { spawnSparkles(s, W, H, 18); s.glowPulse = 1; }
    if (mood === 'wrong')    { spawnTears(s, W, H); s.shakeX = 10; }
    if (mood === 'sleeping') { s.zzzs = []; }
  }, [mood, W, H]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function loop(ts) {
      const s = stateRef.current;
      const dt = Math.min((ts - (s.lastTs || ts)) / 1000, 0.05);
      s.lastTs = ts;
      s.time += dt;

      /* Blink */
      s.blinkNext -= dt;
      if (s.blinkNext <= 0 && s.mood !== 'sleeping') {
        s.blinkT = 1;
        s.blinkNext = 2 + Math.random() * 4;
      }
      if (s.blinkT > 0) s.blinkT = Math.max(0, s.blinkT - dt * 9);

      /* Bob */
      const bobAmp   = { idle:7, thinking:4, correct:18, wrong:5, progress:9, final:22 }[s.mood] ?? 7;
      const bobSpeed = { idle:1.6, thinking:1.2, correct:5, wrong:2, progress:2, final:5 }[s.mood] ?? 1.6;
      s.bobY = Math.sin(s.time * bobSpeed) * bobAmp;

      /* Shake decay */
      if (Math.abs(s.shakeX) > 0.2) s.shakeX *= 0.82; else s.shakeX = 0;

      /* Glow pulse decay */
      if (s.glowPulse > 0) s.glowPulse = Math.max(0, s.glowPulse - dt * 0.5);

      /* Zzz spawn */
      if (s.mood === 'sleeping' && Math.random() < 0.008) spawnZzz(s, W, H);

      /* Wrong tears */
      if (s.mood === 'wrong' && s.tears.length < 5 && Math.random() < 0.015) spawnTears(s, W, H);

      /* Celebrate: keep sparkles alive */
      if (s.mood === 'final' && s.sparkles.length < 8 && Math.random() < 0.06) spawnSparkles(s, W, H, 4);

      draw(ctx, W, H, s);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [W, H]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={className}
      style={{ display: 'block', imageRendering: 'auto' }}
    />
  );
}

/* ─── Particle spawners ─── */
function spawnSparkles(s, W, H, n) {
  const cx = W / 2, cy = H * 0.46;
  const colors = ['#fde68a','#c4b5fd','#86efac','#f9a8d4','#7dd3fc','#fbbf24'];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i + Math.random() * 0.4;
    const spd = 55 + Math.random() * 40;
    s.sparkles.push({
      x: cx, y: cy,
      vx: Math.cos(a) * spd * 0.016,
      vy: Math.sin(a) * spd * 0.016 - 0.6,
      life: 1,
      color: colors[i % colors.length],
      r: 3 + Math.random() * 4,
    });
  }
}

function spawnTears(s, W, H) {
  const cx = W / 2;
  for (let i = 0; i < 2; i++) {
    s.tears.push({ x: cx + (i === 0 ? -24 : 16), y: H * 0.46, vy: 0, life: 1 });
  }
}

function spawnZzz(s, W, H) {
  if (s.zzzs.length >= 4) return;
  s.zzzs.push({
    x: W * 0.72,
    y: H * 0.28,
    vx: 0.18,
    vy: -0.35,
    life: 1,
    size: 11 + s.zzzs.length * 4,
  });
}

/* ─── MAIN DRAW ─── */
function draw(ctx, W, H, s) {
  ctx.clearRect(0, 0, W, H);

  const cx  = W / 2 + s.shakeX * Math.sin(s.time * 20);
  const cy  = H * 0.46 + s.bobY;
  const m   = s.mood;
  const t   = s.time;

  /* Body scale for bounce moods */
  const bounceScale = (m === 'correct' || m === 'final')
    ? 1 + 0.05 * Math.abs(Math.sin(t * 6))
    : 1;

  /* ── OUTER GLOW ── */
  const glowColors = {
    idle:     [168,85,247],
    thinking: [139,92,246],
    correct:  [34,197,94],
    wrong:    [239,68,68],
    progress: [59,130,246],
    final:    [251,191,36],
    sleeping: [99,102,241],
  };
  const [gr,gg,gb] = glowColors[m] || glowColors.idle;
  const glowR = 88 + s.glowPulse * 18 + Math.sin(t * 1.8) * 6;
  const glowAlpha = 0.16 + s.glowPulse * 0.18;
  const glowGrd = ctx.createRadialGradient(cx, cy, glowR * 0.3, cx, cy, glowR * 1.6);
  glowGrd.addColorStop(0, `rgba(${gr},${gg},${gb},${glowAlpha})`);
  glowGrd.addColorStop(0.5, `rgba(${gr},${gg},${gb},${glowAlpha * 0.4})`);
  glowGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrd;
  ctx.beginPath();
  ctx.ellipse(cx, cy, glowR * 1.6, glowR * 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(bounceScale, bounceScale);

  const bW = W * 0.39, bH = H * 0.41;

  /* ── TAIL ── */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-bW * 0.82, -bH * 0.08);
  ctx.bezierCurveTo(-bW * 1.55, -bH * 0.12, -bW * 1.65, bH * 0.48, -bW * 1.05, bH * 0.58);
  ctx.bezierCurveTo(-bW * 0.65, bH * 0.68, -bW * 0.48, bH * 0.28, -bW * 0.68, bH * 0.04);
  ctx.closePath();
  const tailG = ctx.createRadialGradient(-bW * 1.05, bH * 0.18, 0, -bW * 1.05, bH * 0.18, bW * 0.8);
  tailG.addColorStop(0, '#9333ea');
  tailG.addColorStop(0.5, '#7c3aed');
  tailG.addColorStop(1, '#4c1d95');
  ctx.fillStyle = tailG;
  ctx.fill();
  ctx.strokeStyle = 'rgba(196,181,253,0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  /* ── BODY ── */
  const bodyGrd = ctx.createRadialGradient(-bW * 0.22, -bH * 0.18, 0, 0, 0, bW * 1.05);
  bodyGrd.addColorStop(0,   '#f0abfc');
  bodyGrd.addColorStop(0.14,'#c026d3');
  bodyGrd.addColorStop(0.34,'#7c3aed');
  bodyGrd.addColorStop(0.58,'#3730a3');
  bodyGrd.addColorStop(0.8, '#1e1b4b');
  bodyGrd.addColorStop(1,   '#0c0520');
  ctx.beginPath();
  ctx.ellipse(0, 0, bW, bH, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrd;
  ctx.fill();

  /* Galaxy swirl */
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, bW, bH, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.save();
  ctx.rotate(t * 0.12);
  const swG = ctx.createRadialGradient(bW * 0.12, bH * 0.08, 0, bW * 0.12, bH * 0.08, bW * 0.72);
  swG.addColorStop(0,   'rgba(253,230,138,0.32)');
  swG.addColorStop(0.25,'rgba(196,181,253,0.48)');
  swG.addColorStop(0.55,'rgba(96,165,250,0.22)');
  swG.addColorStop(1,   'rgba(124,58,237,0)');
  ctx.fillStyle = swG;
  ctx.beginPath();
  ctx.ellipse(bW * 0.12, bH * 0.08, bW * 0.72, bH * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();

  /* Bright core */
  const coreG = ctx.createRadialGradient(bW * 0.08, bH * 0.04, 0, bW * 0.08, bH * 0.04, bW * 0.3);
  coreG.addColorStop(0, 'rgba(255,255,255,0.18)');
  coreG.addColorStop(0.4,'rgba(240,171,252,0.28)');
  coreG.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.beginPath();
  ctx.ellipse(bW * 0.08, bH * 0.04, bW * 0.28, bH * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = coreG;
  ctx.fill();

  /* Body stars */
  const bStars = [[-0.29,-0.42],[-.58,-.09],[.19,-.57],[.52,.28],[-.19,.48],[.58,-.38],[-.52,.52],[.28,.68],[-.08,.78]];
  bStars.forEach(([sx, sy], i) => {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.3);
    ctx.beginPath();
    ctx.arc(sx * bW, sy * bH, (0.8 + pulse * 0.7) * (W / 160), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.38 + pulse * 0.52})`;
    ctx.fill();
  });

  /* Body rim */
  ctx.beginPath();
  ctx.ellipse(0, 0, bW, bH, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(196,181,253,0.65)';
  ctx.lineWidth = 2 * (W / 160);
  ctx.stroke();

  /* Body highlight */
  ctx.beginPath();
  ctx.ellipse(-bW * 0.2, -bH * 0.52, bW * 0.32, bH * 0.17, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.fill();

  /* ── ARMS ── */
  const armLRot = (m === 'correct' || m === 'final')
    ? -0.65 + Math.sin(t * 5) * 0.12
    : (m === 'wrong') ? 0.3 + Math.sin(t * 3) * 0.08
    : Math.sin(t * 1.8) * 0.08;
  const armRRot = (m === 'correct' || m === 'final')
    ? 0.55 + Math.sin(t * 5 + 0.5) * 0.12
    : (m === 'thinking') ? -0.45 + Math.sin(t * 2.2) * 0.12
    : Math.sin(t * 1.8 + 1) * 0.08;

  drawArm(ctx, W, bW, bH, armLRot, true);
  drawArm(ctx, W, bW, bH, armRRot, false);

  /* ── HEAD ── */
  const hx = bW * 0.43, hy = -bH * 0.38;
  const hRx = bW * 0.52, hRy = bH * 0.47;
  drawHead(ctx, W, H, hx, hy, hRx, hRy, t, m, s);

  ctx.restore(); // translate + bounceScale

  /* ── SPARKLES (screen space) ── */
  s.sparkles.forEach((sp, i) => {
    sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.04; sp.life -= 0.018;
    if (sp.life <= 0) { s.sparkles.splice(i, 1); return; }
    ctx.globalAlpha = sp.life;
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  /* ── TEARS ── */
  s.tears.forEach((tr, i) => {
    tr.vy += 0.35; tr.y += tr.vy; tr.life -= 0.014;
    if (tr.life <= 0) { s.tears.splice(i, 1); return; }
    ctx.globalAlpha = tr.life * 0.85;
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.ellipse(tr.x, tr.y, 3.5 * (W/160), 5.5 * (W/160), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  /* ── ZZZ ── */
  s.zzzs.forEach((z, i) => {
    z.x += z.vx; z.y += z.vy; z.life -= 0.006;
    if (z.life <= 0) { s.zzzs.splice(i, 1); return; }
    ctx.globalAlpha = z.life * 0.9;
    ctx.fillStyle = '#c4b5fd';
    ctx.font = `bold ${z.size * (W / 160)}px system-ui`;
    ctx.fillText('z', z.x, z.y);
    ctx.globalAlpha = 1;
  });
}

function drawArm(ctx, W, bW, bH, rot, isLeft) {
  const sc = isLeft ? 1 : -1;
  ctx.save();
  ctx.scale(sc, 1);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(bW * 0.48, bH * 0.48);
  ctx.bezierCurveTo(bW * 0.72, bH * 0.63, bW * 0.88, bH * 0.88, bW * 0.73, bH * 1.03);
  ctx.bezierCurveTo(bW * 0.58, bH * 1.16, bW * 0.33, bH * 1.10, bW * 0.33, bH * 0.88);
  ctx.bezierCurveTo(bW * 0.33, bH * 0.70, bW * 0.38, bH * 0.58, bW * 0.28, bH * 0.48);
  ctx.closePath();
  const aG = ctx.createLinearGradient(bW * 0.48, bH * 0.48, bW * 0.28, bH * 1.1);
  aG.addColorStop(0, '#9333ea');
  aG.addColorStop(1, '#4c1d95');
  ctx.fillStyle = aG;
  ctx.fill();
  ctx.strokeStyle = 'rgba(196,181,253,0.42)';
  ctx.lineWidth = 1.4 * (W / 160);
  ctx.stroke();
  /* Fingers */
  const fAngles = [-0.38, 0, 0.38];
  fAngles.forEach((fa, fi) => {
    const fx = bW * 0.73 + Math.cos(fa + 2.8) * 17 * (W / 160) - fi * 2.5;
    const fy = bH * 1.03 + Math.sin(fa + 2.8) * 17 * (W / 160) + fi * 1.5;
    ctx.beginPath();
    ctx.arc(fx, fy, (5 - fi * 0.5) * (W / 160), 0, Math.PI * 2);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.strokeStyle = 'rgba(196,181,253,0.35)';
    ctx.lineWidth = 0.8 * (W / 160);
    ctx.stroke();
  });
  ctx.restore();
}

function drawHead(ctx, W, H, hx, hy, hRx, hRy, t, m, s) {
  /* Head body */
  const hG = ctx.createRadialGradient(hx - hRx * 0.2, hy - hRy * 0.2, 0, hx, hy, Math.max(hRx, hRy));
  hG.addColorStop(0,   '#c084fc');
  hG.addColorStop(0.28,'#9333ea');
  hG.addColorStop(0.65,'#6d28d9');
  hG.addColorStop(1,   '#3b0764');
  ctx.beginPath();
  ctx.ellipse(hx, hy, hRx, hRy, 0, 0, Math.PI * 2);
  ctx.fillStyle = hG;
  ctx.fill();

  /* Head galaxy */
  const hSwG = ctx.createRadialGradient(hx + hRx * 0.1, hy - hRy * 0.1, 0, hx, hy, hRx * 0.85);
  hSwG.addColorStop(0, 'rgba(240,171,252,0.22)');
  hSwG.addColorStop(0.5,'rgba(167,139,250,0.14)');
  hSwG.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.beginPath();
  ctx.ellipse(hx, hy, hRx * 0.9, hRy * 0.9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = hSwG;
  ctx.fill();

  /* Head rim */
  ctx.beginPath();
  ctx.ellipse(hx, hy, hRx, hRy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(196,181,253,0.52)';
  ctx.lineWidth = 1.8 * (W / 160);
  ctx.stroke();

  /* Head highlight */
  ctx.beginPath();
  ctx.ellipse(hx - hRx * 0.28, hy - hRy * 0.5, hRx * 0.3, hRy * 0.17, -0.32, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fill();

  /* ── EYES ── */
  const isSleeping   = m === 'sleeping';
  const blinkScale   = isSleeping ? 0 : (s.blinkT > 0 ? Math.max(0.04, 1 - s.blinkT * 4) : 1);
  const isThinking   = m === 'thinking';
  const thinkSquint  = isThinking ? 0.75 : 1;

  drawEye(ctx, W, hx - hRx * 0.29, hy - hRy * 0.07, hRx * 0.28, hRy * 0.33,
    blinkScale * thinkSquint, isSleeping);
  drawEye(ctx, W, hx + hRx * 0.19, hy - hRy * 0.12, hRx * 0.24, hRy * 0.29,
    blinkScale * thinkSquint, isSleeping);

  /* ── NOSE ── */
  ctx.beginPath();
  ctx.ellipse(hx + hRx * 0.02, hy + hRy * 0.2, 6.5 * (W / 160), 4 * (W / 160), 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(167,139,250,0.52)';
  ctx.fill();

  /* ── MOUTH ── */
  drawMouth(ctx, W, hx, hy + hRy * 0.38, m, t);

  /* ── CHEEKS ── */
  if (m === 'correct' || m === 'final' || m === 'excited') {
    const ca = (m === 'final') ? 0.52 + 0.22 * Math.abs(Math.sin(t * 4)) : 0.36;
    ctx.beginPath();
    ctx.ellipse(hx - hRx * 0.54, hy + hRy * 0.15, 10 * (W/160), 6.5 * (W/160), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249,168,212,${ca})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx + hRx * 0.5, hy + hRy * 0.12, 10 * (W/160), 6.5 * (W/160), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249,168,212,${ca})`;
    ctx.fill();
  }

  /* ── EYEBROWS ── */
  drawBrows(ctx, W, hx, hy, hRx, hRy, m, t);
}

function drawEye(ctx, W, x, y, rw, rh, blinkScale, isSleeping) {
  ctx.save();
  ctx.translate(x, y);
  if (isSleeping || blinkScale < 0.06) {
    ctx.beginPath();
    ctx.moveTo(-rw, 0);
    ctx.quadraticCurveTo(0, rh * 0.55, rw, 0);
    ctx.strokeStyle = 'rgba(216,180,254,0.85)';
    ctx.lineWidth = 2 * (W / 160);
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.scale(1, blinkScale);
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, rw * 0.68, rh * 0.68, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#12002e';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, rw * 0.42, rh * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#060010';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, rw * 0.65, rh * 0.65, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(124,58,237,0.72)';
  ctx.lineWidth = 1.4 * (W / 160);
  ctx.stroke();
  /* Main shine */
  ctx.beginPath();
  ctx.ellipse(-rw * 0.27, -rh * 0.27, rw * 0.25, rh * 0.22, -0.3, 0, Math.PI * 2);
  const shineG = ctx.createRadialGradient(-rw * 0.27, -rh * 0.27, 0, -rw * 0.27, -rh * 0.27, rw * 0.25);
  shineG.addColorStop(0, 'rgba(255,255,255,0.95)');
  shineG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shineG;
  ctx.fill();
  /* Small shine */
  ctx.beginPath();
  ctx.arc(rw * 0.22, rh * 0.24, rw * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.46)';
  ctx.fill();
  ctx.restore();
}

function drawMouth(ctx, W, x, y, m, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  const sc = W / 160;

  if (m === 'idle' || m === 'progress') {
    ctx.beginPath();
    ctx.moveTo(-12 * sc, 0);
    ctx.quadraticCurveTo(0, 7 * sc, 12 * sc, 0);
    ctx.strokeStyle = 'rgba(233,213,255,0.75)';
    ctx.lineWidth = 2.2 * sc;
    ctx.stroke();
  } else if (m === 'thinking') {
    ctx.beginPath();
    ctx.moveTo(-10 * sc, 1 * sc);
    ctx.quadraticCurveTo(0, -1 * sc, 10 * sc, 2 * sc);
    ctx.strokeStyle = 'rgba(233,213,255,0.62)';
    ctx.lineWidth = 2 * sc;
    ctx.stroke();
    /* Thought dots */
    [16, 22, 28].forEach((dx, i) => {
      ctx.beginPath();
      ctx.arc(dx * sc, (-12 - i * 3) * sc, (2.5 - i * 0.3) * sc, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196,181,253,0.7)';
      ctx.fill();
    });
  } else if (m === 'correct') {
    ctx.beginPath();
    ctx.moveTo(-16 * sc, -2 * sc);
    ctx.quadraticCurveTo(0, 16 * sc, 16 * sc, -2 * sc);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2.8 * sc;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10 * sc, 1 * sc);
    ctx.lineTo(10 * sc, 1 * sc);
    ctx.strokeStyle = 'rgba(255,255,255,0.32)';
    ctx.lineWidth = 1.4 * sc;
    ctx.stroke();
  } else if (m === 'wrong') {
    ctx.beginPath();
    ctx.moveTo(-14 * sc, 6 * sc);
    ctx.quadraticCurveTo(0, -6 * sc, 14 * sc, 6 * sc);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2.4 * sc;
    ctx.stroke();
  } else if (m === 'final') {
    const openAmt = 0.6 + 0.4 * Math.abs(Math.sin(t * 6));
    ctx.beginPath();
    ctx.moveTo(-18 * sc, -4 * sc);
    ctx.quadraticCurveTo(0, (18 + openAmt * 10) * sc, 18 * sc, -4 * sc);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 3 * sc;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, (8 + openAmt * 4) * sc, 8 * sc, 5.5 * openAmt * sc, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f9a8d4';
    ctx.fill();
  }

  ctx.restore();
}

function drawBrows(ctx, W, hx, hy, hRx, hRy, m, t) {
  ctx.lineWidth = 2.4 * (W / 160);
  ctx.lineCap   = 'round';
  ctx.strokeStyle = 'rgba(216,180,254,0.88)';
  const sc = W / 160;

  const elx = hx - hRx * 0.29, ely = hy - hRy * 0.07;
  const erx = hx + hRx * 0.19, ery = hy - hRy * 0.12;

  let lbY = -22 * sc, rbY = -20 * sc;
  if (m === 'wrong') { lbY = -14 * sc; rbY = -14 * sc; }
  else if (m === 'final' || m === 'correct') { lbY = -28 * sc; rbY = -26 * sc; }

  const wob = (m === 'final') ? Math.sin(t * 8) * 2 * sc : 0;

  ctx.beginPath();
  ctx.moveTo(elx - 14 * sc, ely + lbY + wob + (m === 'wrong' ? 2 * sc : 0));
  ctx.quadraticCurveTo(elx, ely + lbY - 4 * sc + wob, elx + 14 * sc, ely + lbY + 2 * sc + wob);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(erx - 12 * sc, ery + rbY + wob + (m === 'wrong' ? 2 * sc : 0));
  ctx.quadraticCurveTo(erx, ery + rbY - 4 * sc + wob, erx + 12 * sc, ery + rbY + 2 * sc + wob);
  ctx.stroke();
}
