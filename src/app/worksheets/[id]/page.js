'use client';
import PdfPlayer from '@/components/interactive/PdfPlayer';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, submissionAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Download, ExternalLink, Send, CheckCircle } from 'lucide-react';

export default function WorksheetDetailPage() {
  const params=useParams(); const router=useRouter(); const { user, loading:authLoading }=useAuth();
  const [worksheet,setWorksheet]=useState(null); const [fileData,setFileData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  const [answers,setAnswers]=useState({}); const [submitting,setSubmitting]=useState(false); const [result,setResult]=useState(null); const [existingSubmission,setExistingSubmission]=useState(null);
  const [startedAt]=useState(Date.now());

  useEffect(()=>{ if(!authLoading && params.id) fetchWorksheet(); },[params.id,authLoading]);

  async function fetchWorksheet(){
    try{
      setLoading(true); setError(null);
      const response=await worksheetAPI.getOne(params.id); const w=response.data.data.worksheet; setWorksheet(w);
      const resource=(w.questions||[]).find(q=>['external_link','google_embed'].includes(q.type));
      if(!resource){ try{ const f=await worksheetAPI.getFile(params.id); setFileData(f.data.data); }catch(e){ if(w.interactiveLayout) setError('The interactive PDF could not be loaded. Reload this page to try again.'); else if(e.response?.status!==404) console.warn(e); } }
      if(user?.role==='student'){
        try{ const sr=await submissionAPI.getByStudent(user.id,{worksheetId:params.id}); const mine=(sr.data.data.submissions||[]).filter(s=>s.worksheetId===params.id).sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt))[0]; if(mine) setExistingSubmission(mine); }catch(e){ console.warn('submission history unavailable',e); }
      }
    }catch(err){ setError(err.response?.data?.message || (err.code==='ECONNABORTED'?'The server took too long to respond.':'Failed to load worksheet')); }
    finally{ setLoading(false); }
  }

  const interactiveQuestions=useMemo(()=> (worksheet?.questions||[]).filter(q=>!['external_link','google_embed'].includes(q.type)),[worksheet]);
  const resource=useMemo(()=> (worksheet?.questions||[]).find(q=>['external_link','google_embed'].includes(q.type)),[worksheet]);
  const isTeacher=['teacher','admin'].includes(user?.role); const isOwner=isTeacher && worksheet?.createdBy===user?.id;
  const editHref=worksheet ? (worksheet.interactiveLayout ? `/worksheets/${worksheet.id}/interactive` : interactiveQuestions.length ? `/worksheets/builder?id=${worksheet.id}` : `/worksheets/${worksheet.id}/edit`) : '#';

  const setAnswer=(id,val)=>setAnswers(a=>({...a,[id]:val}));
  async function submit(){
    if(!worksheet) return;
    if(interactiveQuestions.length && interactiveQuestions.some(q=>answers[q.id]===undefined || answers[q.id]==='')) { setError('Please answer every question before submitting.'); return; }
    setSubmitting(true); setError(null);
    try{
      const payload={ worksheetId:worksheet.id, answers:interactiveQuestions.map(q=>({questionId:q.id,answer:answers[q.id]})), timeSpentSeconds:Math.max(1,Math.round((Date.now()-startedAt)/1000)) };
      const r=await submissionAPI.submit(payload); setResult(r.data.data); setExistingSubmission(r.data.data.submission);
    }catch(e){ setError(e.response?.data?.message || 'Could not submit this worksheet.'); }
    finally{ setSubmitting(false); }
  }

  async function handleDelete(){ if(!confirm('Are you sure you want to delete this worksheet?'))return; try{await worksheetAPI.delete(params.id);router.push('/dashboard/teacher');}catch{alert('Failed to delete worksheet');} }
  async function handleTogglePublish(){try{await worksheetAPI.togglePublish(params.id);setWorksheet({...worksheet,isPublished:!worksheet.isPublished});}catch{alert('Failed to toggle publish status');}}

  if(authLoading||loading)return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">Loading worksheet...</div>;
  if(error && !worksheet)return <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4"><div className="card max-w-md text-center"><h2 className="text-xl font-bold mb-2">Error</h2><p className="mb-5">{error}</p><Link href={user?.role==='student'?'/dashboard/student':'/dashboard/teacher'} className="btn btn-primary">Back</Link></div></div>;
  if(!worksheet)return null;

  return <div className="min-h-screen bg-neutral-50">
    <header className="bg-white border-b sticky top-0 z-10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0"><Link href={isTeacher?'/dashboard/teacher':'/dashboard/student'} className="btn btn-ghost"><ArrowLeft className="w-5 h-5"/>Back</Link><div className="min-w-0"><h1 className="text-2xl font-bold truncate">{worksheet.title}</h1>{worksheet.description&&<p className="text-sm text-neutral-600">{worksheet.description}</p>}</div></div>
      {isOwner&&<div className="flex flex-wrap gap-2">{fileData?.mimeType==='application/pdf'&&<Link href={`/worksheets/${worksheet.id}/interactive`} className="btn btn-primary">{worksheet.interactiveLayout?'Edit Interactive':'Make Interactive'}</Link>}<Link href={`/worksheets/${worksheet.id}/review`} className="btn btn-outline">Review submissions</Link><button onClick={handleTogglePublish} className="btn btn-outline">{worksheet.isPublished?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}{worksheet.isPublished?'Unpublish':'Publish'}</button><Link href={editHref} className="btn btn-outline"><Edit className="w-4 h-4"/>Edit</Link><button onClick={handleDelete} className="btn btn-ghost text-red-600"><Trash2 className="w-4 h-4"/>Delete</button></div>}
    </div></header>
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {error&&<div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700">{error}</div>}
      {existingSubmission&&user?.role==='student'&&<div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-800 flex gap-2 items-center"><CheckCircle className="w-5 h-5"/>Last submission: {existingSubmission.status}{existingSubmission.score!=null&&existingSubmission.maxScore?` · ${Math.round(existingSubmission.score/existingSubmission.maxScore*100)}%`:''}</div>}

      {resource&&<section className="card">
        {resource.embedUrl?<iframe src={resource.embedUrl} className="w-full border-0 rounded-xl" style={{minHeight:'650px'}} title={worksheet.title} allowFullScreen/>:<div className="text-center py-10"><ExternalLink className="w-10 h-10 mx-auto mb-3 text-primary-600"/><p className="text-neutral-600 mb-4">External learning resource</p><a href={resource.originalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex"><ExternalLink className="w-4 h-4"/>Open Resource</a></div>}
      </section>}

      {worksheet.interactiveLayout&&fileData?.mimeType==='application/pdf'&&<PdfPlayer worksheet={worksheet} url={fileData.fileUrl||fileData.dataUrl} student={user?.role==='student'}/>}
      {fileData&&!worksheet.interactiveLayout&&<section className="card p-0 overflow-hidden">{fileData.mimeType==='application/pdf'&&<div className="flex justify-end p-3 border-b"><a href={fileData.fileUrl||fileData.dataUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink className="w-4 h-4"/>Open in new tab</a></div>}{fileData.mimeType==='application/pdf'?<iframe src={fileData.fileUrl||fileData.dataUrl} className="w-full border-0" style={{minHeight:'800px'}} title={worksheet.title}/>:fileData.mimeType?.startsWith('audio/')?<div className="p-6"><audio controls className="w-full" src={fileData.fileUrl||fileData.dataUrl}/></div>:fileData.mimeType?.startsWith('video/')?<video controls className="w-full" src={fileData.fileUrl||fileData.dataUrl}/>:fileData.mimeType?.startsWith('image/')?<img src={fileData.fileUrl||fileData.dataUrl} alt={worksheet.title} className="w-full h-auto"/>:<div className="p-8 text-center"><p className="mb-4">{fileData.originalFilename}</p><a href={fileData.fileUrl||fileData.dataUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><Download className="w-4 h-4"/>Open / Download File</a></div>}</section>}

      {!worksheet.interactiveLayout&&interactiveQuestions.length>0&&<section className="card space-y-5"><h2 className="text-xl font-bold">Questions</h2>{interactiveQuestions.map((q,i)=><QuestionPlayer key={q.id||i} q={q} index={i} value={answers[q.id]} onChange={v=>setAnswer(q.id,v)} disabled={!!result || user?.role!=='student'}/>)}</section>}

      {!worksheet.interactiveLayout && user?.role==='student' && !result && !(existingSubmission && !interactiveQuestions.length) && <div className="flex justify-end"><button onClick={submit} disabled={submitting} className="btn btn-primary"><Send className="w-4 h-4"/>{submitting?'Submitting...':interactiveQuestions.length?'Submit Worksheet':'Mark as Completed'}</button></div>}
      {result&&<div className="card border-green-200 bg-green-50"><h3 className="text-xl font-bold text-green-800">Submitted successfully</h3>{result.percentage!=null&&<p className="text-green-700 mt-2">Score: {result.percentage}%</p>}{result.attemptsRemaining!=null&&<p className="text-sm text-green-700 mt-1">Attempts remaining: {result.attemptsRemaining}</p>}</div>}
    </main>
  </div>;
}

function QuestionPlayer({q,index,value,onChange,disabled}){
  return <div className="p-4 rounded-xl bg-neutral-50 space-y-3"><p className="font-medium">{index+1}. {q.text || q.question || 'Question'}</p>
    {q.type==='multiple_choice'&&<div className="space-y-2">{(q.options||[]).map((o,i)=><label key={i} className="flex gap-2 items-center"><input type="radio" name={`q-${q.id}`} checked={value===o} onChange={()=>onChange(o)} disabled={disabled}/><span>{o}</span></label>)}</div>}
    {['fill_blank','short_answer'].includes(q.type)&&<input className="input" value={value||''} onChange={e=>onChange(e.target.value)} disabled={disabled} placeholder="Your answer..."/>}
    {q.type==='true_false'&&<div className="flex gap-4">{['true','false'].map(v=><label key={v} className="flex gap-2 items-center"><input type="radio" name={`q-${q.id}`} checked={String(value)===v} onChange={()=>onChange(v)} disabled={disabled}/><span className="capitalize">{v}</span></label>)}</div>}
    {q.type==='matching'&&<div className="space-y-2">{(q.pairs||[]).map((p,i)=><div key={i} className="grid grid-cols-2 gap-2 items-center"><span>{p.left}</span><select className="input" value={value?.[p.left]||''} onChange={e=>onChange({...value,[p.left]:e.target.value})} disabled={disabled}><option value="">Select…</option>{(q.matchingOptions||[]).map((r,ri)=><option key={ri} value={r}>{r}</option>)}</select></div>)}</div>}
  </div>;
}
