'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI } from '@/lib/api';
import { Plus, X, Save, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
];

const newId = () => (globalThis.crypto?.randomUUID?.() || `q_${Date.now()}_${Math.random().toString(36).slice(2)}`);

function makeQuestion(type) {
  const base = { id: newId(), type, text: '', points: 10 };
  if (type === 'multiple_choice') return { ...base, options: ['', '', '', ''], correctAnswer: '' };
  if (type === 'matching') return { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] };
  if (type === 'true_false') return { ...base, correctAnswer: 'true' };
  return { ...base, correctAnswer: '' };
}

export default function Page() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading worksheet builder...</div>}><WorksheetBuilderPage /></Suspense>;
}

function WorksheetBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const editId = searchParams.get('id');
  const [saving, setSaving] = useState(false);
  const [loadingWS, setLoadingWS] = useState(!!editId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', subject: '', gradeLevel: '', difficulty: 'beginner',
    estimatedTime: 30, autoGrade: true, passScore: 70, maxAttempts: 1,
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['teacher', 'admin'].includes(user.role)) { router.push('/login'); return; }
    if (editId) loadWorksheet(editId); else setLoadingWS(false);
  }, [user, authLoading, editId]);

  async function loadWorksheet(id) {
    try {
      setLoadingWS(true);
      const res = await worksheetAPI.getOne(id);
      const w = res.data.data?.worksheet || res.data.data || res.data;
      setFormData({
        title: w.title || '', description: w.description || '', subject: w.subject || '', gradeLevel: w.gradeLevel || '',
        difficulty: w.difficulty || 'beginner', estimatedTime: w.estimatedTime || 30, autoGrade: w.autoGrade !== false,
        passScore: w.passScore || 70, maxAttempts: w.maxAttempts ?? 1,
      });
      setQuestions((w.questions || []).filter(q => !['external_link','google_embed'].includes(q.type)).map(q => ({
        ...q,
        id: q.id || q._id || newId(),
        text: q.text || q.question || '',
        correctAnswer: q.correctAnswer ?? q.sampleAnswer ?? '',
      })));
    } catch (e) { setError(e.response?.data?.message || 'Failed to load worksheet.'); }
    finally { setLoadingWS(false); }
  }

  const updateQuestion = (id, field, value) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  const updateOption = (id, index, value) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, options: q.options.map((o,i) => i===index ? value : o) } : q));
  const updatePair = (id, index, side, value) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, pairs: q.pairs.map((p,i) => i===index ? { ...p, [side]: value } : p) } : q));
  const moveQuestion = (index, direction) => {
    const ni=index+direction; if (ni<0 || ni>=questions.length) return;
    const next=[...questions]; [next[index],next[ni]]=[next[ni],next[index]]; setQuestions(next);
  };

  function validateQuestions() {
    for (let i=0;i<questions.length;i++) {
      const q=questions[i];
      if (!q.text?.trim()) return `Question ${i+1} needs text.`;
      if (q.type === 'multiple_choice') {
        if ((q.options || []).filter(o => o.trim()).length < 2) return `Question ${i+1} needs at least two options.`;
        if (!q.correctAnswer) return `Question ${i+1} needs a correct answer.`;
      }
      if (['fill_blank','true_false','short_answer'].includes(q.type) && String(q.correctAnswer ?? '').trim() === '') return `Question ${i+1} needs a correct answer.`;
      if (q.type === 'matching' && (!q.pairs?.length || q.pairs.some(p => !p.left.trim() || !p.right.trim()))) return `Question ${i+1} needs complete matching pairs.`;
    }
    return null;
  }

  async function handleSave(e) {
    e?.preventDefault?.(); setError(''); setSuccess('');
    if (!formData.title.trim()) return setError('Title required');
    if (!questions.length) return setError('Add at least one question');
    const validation = validateQuestions(); if (validation) return setError(validation);
    setSaving(true);
    try {
      // IDs are intentionally preserved: grading uses questionId as the stable key.
      const payload = { ...formData, questions: questions.map(q => ({ ...q, question: undefined, sampleAnswer: undefined })) };
      if (editId) await worksheetAPI.update(editId, payload); else await worksheetAPI.create(payload);
      setSuccess(editId ? 'Worksheet updated' : 'Worksheet created');
      setTimeout(() => router.push('/dashboard/teacher'), 700);
    } catch (err) { setError(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  }

  if (authLoading || loadingWS) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return <div className="min-h-screen bg-neutral-50">
    <header className="bg-white border-b sticky top-0 z-10"><div className="container-custom py-4 flex justify-between items-center">
      <Link href="/dashboard/teacher" className="btn btn-ghost"><ArrowLeft className="w-5 h-5" /> Back</Link>
      <button onClick={handleSave} disabled={saving} className="btn btn-primary"><Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Worksheet'}</button>
    </div></header>
    <div className="container-custom py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{editId ? 'Edit Worksheet' : 'Create Worksheet'}</h1>
      {error && <div className="mb-5 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700">{error}</div>}
      {success && <div className="mb-5 p-3 rounded-xl border border-green-200 bg-green-50 text-green-700">{success}</div>}
      <div className="card mb-8 space-y-4">
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <input className="input" placeholder="Worksheet title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})}/>
        <textarea className="input" placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})}/>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Subject" value={formData.subject} onChange={e=>setFormData({...formData,subject:e.target.value})}/>
          <input className="input" placeholder="Level / Grade" value={formData.gradeLevel} onChange={e=>setFormData({...formData,gradeLevel:e.target.value})}/>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <select className="input" value={formData.difficulty} onChange={e=>setFormData({...formData,difficulty:e.target.value})}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
          <input className="input" type="number" min="1" value={formData.estimatedTime} onChange={e=>setFormData({...formData,estimatedTime:Number(e.target.value)})}/>
          <select className="input" value={formData.maxAttempts} onChange={e=>setFormData({...formData,maxAttempts:Number(e.target.value)})}><option value={1}>1 attempt</option><option value={2}>2 attempts</option><option value={3}>3 attempts</option><option value={0}>Unlimited</option></select>
        </div>
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h2 className="text-2xl font-bold">Questions ({questions.length})</h2>
        <div className="flex gap-2 flex-wrap">{QUESTION_TYPES.map(t=><button type="button" key={t.value} onClick={()=>setQuestions(qs=>[...qs,makeQuestion(t.value)])} className="btn btn-outline text-sm"><Plus className="w-4 h-4" /> {t.label}</button>)}</div>
      </div>
      <div className="space-y-6">{questions.map((q,i)=><QuestionEditor key={q.id} q={q} index={i} total={questions.length} update={updateQuestion} updateOption={updateOption} updatePair={updatePair} setQuestions={setQuestions} move={moveQuestion}/>)}</div>
    </div>
  </div>;
}

function QuestionEditor({ q, index, total, update, updateOption, updatePair, setQuestions, move }) {
  return <div className="card space-y-4">
    <div className="flex justify-between"><h3 className="font-bold">Question {index+1}</h3><div className="flex gap-1">
      <button type="button" onClick={()=>move(index,-1)} disabled={index===0} className="btn btn-ghost"><ChevronUp className="w-4 h-4"/></button>
      <button type="button" onClick={()=>move(index,1)} disabled={index===total-1} className="btn btn-ghost"><ChevronDown className="w-4 h-4"/></button>
      <button type="button" onClick={()=>setQuestions(qs=>qs.filter(x=>x.id!==q.id))} className="btn btn-ghost text-red-500"><X className="w-4 h-4"/></button>
    </div></div>
    <textarea value={q.text} onChange={e=>update(q.id,'text',e.target.value)} className="input" placeholder="Question text"/>
    <div className="grid sm:grid-cols-2 gap-4"><div><label className="text-sm font-medium">Type</label><input className="input" value={QUESTION_TYPES.find(t=>t.value===q.type)?.label || q.type} disabled/></div><div><label className="text-sm font-medium">Points</label><input className="input" type="number" min="0" value={q.points ?? 10} onChange={e=>update(q.id,'points',Number(e.target.value))}/></div></div>

    {q.type === 'multiple_choice' && <div className="space-y-2"><label className="text-sm font-medium">Options & correct answer</label>{q.options.map((o,i)=><div key={i} className="flex gap-2 items-center"><input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer===o && !!o} onChange={()=>update(q.id,'correctAnswer',o)} disabled={!o}/><input className="input" value={o} onChange={e=>{const old=o; updateOption(q.id,i,e.target.value); if(q.correctAnswer===old) update(q.id,'correctAnswer',e.target.value);}} placeholder={`Option ${i+1}`}/></div>)}</div>}
    {q.type === 'fill_blank' && <div><label className="text-sm font-medium">Correct answer</label><input className="input" value={q.correctAnswer || ''} onChange={e=>update(q.id,'correctAnswer',e.target.value)}/></div>}
    {q.type === 'true_false' && <div><label className="text-sm font-medium">Correct answer</label><select className="input" value={String(q.correctAnswer)} onChange={e=>update(q.id,'correctAnswer',e.target.value)}><option value="true">True</option><option value="false">False</option></select></div>}
    {q.type === 'short_answer' && <div><label className="text-sm font-medium">Expected answer</label><input className="input" value={q.correctAnswer || ''} onChange={e=>update(q.id,'correctAnswer',e.target.value)}/><p className="text-xs text-neutral-500 mt-1">Close answers may be flagged for manual review.</p></div>}
    {q.type === 'matching' && <div className="space-y-2"><label className="text-sm font-medium">Matching pairs</label>{q.pairs.map((pair,i)=><div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input className="input" value={pair.left} onChange={e=>updatePair(q.id,i,'left',e.target.value)} placeholder="Left"/><input className="input" value={pair.right} onChange={e=>updatePair(q.id,i,'right',e.target.value)} placeholder="Right"/><button type="button" className="btn btn-ghost text-red-500" onClick={()=>setQuestions(qs=>qs.map(x=>x.id===q.id?{...x,pairs:x.pairs.filter((_,pi)=>pi!==i)}:x))}><X className="w-4 h-4"/></button></div>)}<button type="button" className="btn btn-outline text-sm" onClick={()=>setQuestions(qs=>qs.map(x=>x.id===q.id?{...x,pairs:[...x.pairs,{left:'',right:''}]}:x))}><Plus className="w-4 h-4"/> Add pair</button></div>}
  </div>;
}
