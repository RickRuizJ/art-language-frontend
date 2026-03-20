'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ALCharacter from './ALCharacter';

const LEVEL_CONFIG = {
  A1: { emoji:'🌱', name:'Beginner',          color:'#22c55e', shadow:'rgba(34,197,94,.35)',  desc:'Every expert started here. Your journey begins!' },
  A2: { emoji:'🌿', name:'Elementary',         color:'#16a34a', shadow:'rgba(22,163,74,.35)',  desc:'Solid foundation — you understand the basics well!' },
  B1: { emoji:'💧', name:'Intermediate',       color:'#3b82f6', shadow:'rgba(59,130,246,.35)', desc:'You communicate confidently in familiar situations.' },
  B2: { emoji:'🌊', name:'Upper-Intermediate', color:'#1d4ed8', shadow:'rgba(29,78,216,.35)',  desc:'You express yourself with precision and fluency!' },
};

export default function ResultScreen({ score, total, level, alState, onRestart }) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);
  const cfg     = LEVEL_CONFIG[level] || LEVEL_CONFIG.A1;
  const pct     = Math.round((score / total) * 100);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (el) {
      el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; el.offsetHeight;
      el.style.transition = 'opacity .5s ease,transform .5s ease';
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }
    const t = setTimeout(() => setShowCard(true), 380);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !showCard) return;
    el.style.opacity = '0'; el.style.transform = 'scale(.88) translateY(16px)'; el.offsetHeight;
    el.style.transition = 'opacity .45s ease,transform .5s cubic-bezier(.34,1.56,.64,1)';
    el.style.opacity = '1'; el.style.transform = 'scale(1) translateY(0)';
  }, [showCard]);

  return (
    <div ref={wrapRef} style={{ textAlign:'center', opacity:0 }}>

      {/* AL celebrating */}
      <div style={{ display:'flex',justifyContent:'center',marginBottom:16 }}>
        <ALCharacter state={alState || 'celebrating'} size="lg"/>
      </div>

      <p style={{ color:'#c4b5fd',fontWeight:800,fontSize:11,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:6,animation:'rsIn .4s .3s ease both' }}>
        Test Complete
      </p>
      <h2 style={{ fontSize:28,fontWeight:900,color:'#f9fafb',marginBottom:24,letterSpacing:'-1px',animation:'rsIn .4s .4s ease both' }}>
        Your English Level
      </h2>

      <div ref={cardRef} style={{
        display:'inline-flex',flexDirection:'column',alignItems:'center',
        background:'rgba(255,255,255,.04)',
        border:`2px solid ${cfg.color}55`,
        borderRadius:28, padding:'28px 44px',
        backdropFilter:'blur(18px)',
        boxShadow:`0 0 60px ${cfg.shadow},0 8px 40px rgba(0,0,0,.38)`,
        marginBottom:26, minWidth:270, opacity:0,
      }}>
        <div style={{ fontSize:46,marginBottom:10,animation:'rsBounce .5s .6s cubic-bezier(.34,1.56,.64,1) both' }}>
          {cfg.emoji}
        </div>
        <div style={{ fontSize:60,fontWeight:900,color:cfg.color,textShadow:`0 0 32px ${cfg.color}`,lineHeight:1,letterSpacing:'-3px',marginBottom:5,animation:'rsBounce .5s .7s cubic-bezier(.34,1.56,.64,1) both' }}>
          {level}
        </div>
        <div style={{ fontSize:19,fontWeight:800,color:'#e2e8f0',marginBottom:8,animation:'rsIn .4s .8s ease both' }}>
          {cfg.name}
        </div>
        <div style={{ fontSize:13,color:'#9ca3af',maxWidth:250,lineHeight:1.58,animation:'rsIn .4s .9s ease both' }}>
          {cfg.desc}
        </div>
        <div style={{ marginTop:18,padding:'9px 22px',background:'rgba(139,92,246,.15)',border:'1px solid rgba(139,92,246,.3)',borderRadius:999,color:'#c4b5fd',fontWeight:800,fontSize:13,animation:'rsIn .4s 1s ease both' }}>
          {score}/{total} correct &nbsp;·&nbsp; {pct}%
        </div>
      </div>

      <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',animation:'rsIn .4s 1.1s ease both' }}>
        <button
          onClick={onRestart}
          style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(139,92,246,.14)',border:'1.5px solid rgba(139,92,246,.38)',borderRadius:15,padding:'12px 24px',color:'#c4b5fd',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'inherit',transition:'all .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(139,92,246,.26)';e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(139,92,246,.14)';e.currentTarget.style.transform=''}}
        >
          ↺ Try Again
        </button>
        <Link href="/dashboard/student/practice-hub" style={{ display:'inline-flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',border:'none',borderRadius:15,padding:'12px 24px',color:'#fff',fontSize:13,fontWeight:800,textDecoration:'none',boxShadow:'0 4px 20px rgba(124,58,237,.48)',transition:'all .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(124,58,237,.65)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(124,58,237,.48)'}}>
          Start Practicing →
        </Link>
      </div>

      <style>{`
        @keyframes rsIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rsBounce{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}
