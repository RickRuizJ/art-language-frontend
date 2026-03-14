'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, BookOpen, PenTool, Headphones, Star, Lock, ChevronRight, Flame, Trophy, X, Send } from 'lucide-react';

const LEVELS = [
  {
    id: 'A1',
    label: 'A1',
    name: 'Beginner',
    emoji: '🌱',
    color: '#22c55e',
    bg: '#f0fdf4',
    border: '#86efac',
    ring: '#22c55e',
    gradient: 'from-green-400 to-emerald-500',
    description: 'Start your journey',
    unlocked: true,
    xp: 240,
    maxXp: 300,
  },
  {
    id: 'A2',
    label: 'A2',
    name: 'Elementary',
    emoji: '🌿',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#4ade80',
    ring: '#16a34a',
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Build your foundation',
    unlocked: true,
    xp: 120,
    maxXp: 300,
  },
  {
    id: 'B1',
    label: 'B1',
    name: 'Intermediate',
    emoji: '💧',
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#93c5fd',
    ring: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    description: 'Gain real confidence',
    unlocked: true,
    xp: 60,
    maxXp: 300,
  },
  {
    id: 'B2',
    label: 'B2',
    name: 'Upper-Intermediate',
    emoji: '🌊',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#60a5fa',
    ring: '#1d4ed8',
    gradient: 'from-blue-600 to-indigo-600',
    description: 'Express yourself freely',
    unlocked: false,
    xp: 0,
    maxXp: 300,
  },
  {
    id: 'C1',
    label: 'C1',
    name: 'Advanced',
    emoji: '⚡',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#c4b5fd',
    ring: '#7c3aed',
    gradient: 'from-violet-500 to-purple-700',
    description: 'Master English',
    unlocked: false,
    xp: 0,
    maxXp: 300,
  },
];

const SKILLS = [
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen, path: '/dashboard/student/practice/vocab-match' },
  { id: 'grammar', label: 'Grammar', icon: PenTool, path: '/dashboard/student/practice/grammar-challenge' },
  { id: 'spelling', label: 'Spelling', icon: Zap, path: '/dashboard/student/practice/spelling-challenge' },
  { id: 'listening', label: 'Listening', icon: Headphones, path: '/dashboard/student/practice/listening', soon: true },
];

export default function PracticeHub() {
  const [activeLevel, setActiveLevel] = useState('A1');
  const [alOpen, setAlOpen] = useState(false);
  const level = LEVELS.find(l => l.id === activeLevel);

  const totalXp = LEVELS.reduce((s, l) => s + l.xp, 0);
  const streak = 7;

  return (
    <>
    <div style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      {/* Top Nav */}
      <header style={{
        background: '#fff',
        borderBottom: '2px solid #f3f4f6',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard/student" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
            <ArrowLeft size={18} /> Back
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>Practice</span>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: '#7c3aed' }}>Hub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff7ed', borderRadius: 999, padding: '5px 12px', border: '2px solid #fed7aa' }}>
              <Flame size={16} color="#f97316" fill="#f97316" />
              <span style={{ fontWeight: 800, fontSize: 14, color: '#ea580c' }}>{streak}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fefce8', borderRadius: 999, padding: '5px 12px', border: '2px solid #fde68a' }}>
              <Trophy size={16} color="#ca8a04" />
              <span style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>{totalXp} XP</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Choose your level 🎯
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>
            Pick a CEFR level and start practicing. Your progress is saved automatically.
          </p>
        </div>

        {/* Level Pills Row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {LEVELS.map(lv => (
            <button
              key={lv.id}
              onClick={() => lv.unlocked && setActiveLevel(lv.id)}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: `2.5px solid ${activeLevel === lv.id ? lv.color : lv.unlocked ? lv.border : '#e5e7eb'}`,
                background: activeLevel === lv.id ? lv.color : lv.unlocked ? lv.bg : '#f9fafb',
                color: activeLevel === lv.id ? '#fff' : lv.unlocked ? lv.color : '#9ca3af',
                fontWeight: 800,
                fontSize: 14,
                cursor: lv.unlocked ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                transform: activeLevel === lv.id ? 'scale(1.06)' : 'scale(1)',
                boxShadow: activeLevel === lv.id ? `0 4px 14px ${lv.color}55` : 'none',
              }}
            >
              <span>{lv.emoji}</span>
              {lv.id}
              {!lv.unlocked && <Lock size={12} />}
            </button>
          ))}
        </div>

        {/* Active Level Card */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          border: `2px solid ${level.border}`,
          padding: 28,
          marginBottom: 28,
          boxShadow: `0 8px 32px ${level.color}18`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 32 }}>{level.emoji}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{level.id}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#6b7280' }}>{level.name}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>{level.description}</p>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: level.color }}>{level.xp}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700 }}>/ {level.maxXp} XP</div>
            </div>
          </div>

          {/* XP Progress bar */}
          <div style={{ background: '#f3f4f6', borderRadius: 999, height: 10, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%',
              width: `${(level.xp / level.maxXp) * 100}%`,
              background: `linear-gradient(90deg, ${level.color}, ${level.color}99)`,
              borderRadius: 999,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
            {level.maxXp - level.xp} XP to next milestone
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            const locked = !level.unlocked;
            return (
              <Link
                key={skill.id}
                href={locked || skill.soon ? '#' : `${skill.path}?level=${activeLevel}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff',
                  border: `2px solid ${locked || skill.soon ? '#f3f4f6' : level.border}`,
                  borderRadius: 20,
                  padding: '24px 20px',
                  cursor: locked || skill.soon ? 'not-allowed' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {skill.soon && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: '#fef3c7', color: '#92400e',
                      fontSize: 10, fontWeight: 800, padding: '2px 8px',
                      borderRadius: 999, border: '1.5px solid #fde68a',
                    }}>
                      SOON
                    </div>
                  )}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: locked || skill.soon ? '#f9fafb' : level.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                    border: `2px solid ${locked || skill.soon ? '#e5e7eb' : level.border}`,
                  }}>
                    <Icon size={22} color={locked || skill.soon ? '#9ca3af' : level.color} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{skill.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: level.color, fontSize: 13, fontWeight: 700 }}>
                    {!locked && !skill.soon && (
                      <>Practice <ChevronRight size={14} /></>
                    )}
                    {locked && <span style={{ color: '#9ca3af' }}>🔒 Locked</span>}
                    {skill.soon && <span style={{ color: '#9ca3af' }}>Coming soon</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* AL Assistant teaser */}
        <div style={{
          marginTop: 32,
          background: 'linear-gradient(135deg, #7c3aed11, #3b82f611)',
          border: '2px dashed #c4b5fd',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999,
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Meet AL — your learning assistant</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
              AL is available inside every game. Click <strong>"Ask AL"</strong> anytime you need help, explanations, or extra practice.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={() => setAlOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                color: '#fff', padding: '8px 18px',
                borderRadius: 999, fontWeight: 800, fontSize: 13,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Star size={14} />
              Chat with AL
            </button>
          </div>
        </div>

      </div>
    </div>

    {/* AL Chat Modal */}
    {alOpen && <ALModal onClose={() => setAlOpen(false)} />}
  </>
  );
}

/* ─── AL Chat Modal ─── */
function ALModal({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm AL, your English learning assistant 🤖\n\nI can help you with grammar, vocabulary, spelling, or anything you're practicing. What would you like to work on?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: "You are AL, a friendly and encouraging English language learning assistant for students at Art & Language Campus. You help students with grammar, vocabulary, spelling, reading, and writing. Keep responses concise, clear, and encouraging. Use simple language appropriate for language learners. Add relevant emojis occasionally to keep it fun.",
          messages: [
            ...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).map(m => ({
              role: m.role,
              content: m.text,
            })),
            { role: 'user', content: userMsg },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't respond. Try again!";
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Oops! Something went wrong. Please try again 🙏" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
          height: 560, display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(124,58,237,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>AL — Learning Assistant</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>AI-powered • Always here to help</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 999,
            width: 32, height: 32, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : '#f3f4f6',
                color: m.role === 'user' ? '#fff' : '#111827',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px', fontSize: 14, lineHeight: 1.5, fontWeight: 500,
                whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#f3f4f6', borderRadius: '18px 18px 18px 4px',
                padding: '10px 16px', fontSize: 20, letterSpacing: 2,
              }}>
                <span style={{ animation: 'pulse 1s infinite' }}>•••</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid #f3f4f6',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <input
            style={{
              flex: 1, border: '2px solid #e5e7eb', borderRadius: 999,
              padding: '10px 16px', fontSize: 14, outline: 'none',
              fontFamily: 'inherit',
            }}
            placeholder="Ask AL anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: 40, height: 40, borderRadius: 999, border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : '#e5e7eb',
              color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
