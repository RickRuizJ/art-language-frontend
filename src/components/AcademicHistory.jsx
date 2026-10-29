'use client';
import {useEffect,useState} from 'react';
import api from '@/lib/api';
export function GradeHistoryTable({data}){
 const rows=[...(data?.automatic||[]),...(data?.manual||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
 return <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['Activity','Source','Date','Result','Feedback'].map(x=><th key={x} className="p-2 border-b">{x}</th>)}</tr></thead><tbody>{rows.map(g=><tr key={`${g.source}-${g.id}`}><td className="p-2 border-b">{g.title}{g.attemptNumber&&<p className="text-xs text-neutral-500">Attempt {g.attemptNumber}</p>}</td><td className="p-2 border-b">{g.source==='manual'?'Manual':'Automatic'}</td><td className="p-2 border-b whitespace-nowrap">{String(g.date||'').slice(0,10)}</td><td className="p-2 border-b whitespace-nowrap">{g.percentage==null?'Awaiting review':`${g.score}/${g.maxScore} (${g.percentage}%)`}</td><td className="p-2 border-b">{g.feedback||'—'}{g.source==='manual'&&g.history?.length>1&&<details className="mt-2"><summary className="cursor-pointer underline">Correction history</summary>{g.history.filter(h=>h.before).map((h,i)=><p className="text-xs mt-1" key={i}>{String(h.at).slice(0,10)} · {h.before.score}/{h.before.maxScore} → {h.after?.score}/{h.after?.maxScore} · {h.reason||'Historical correction'}</p>)}</details>}</td></tr>)}{!rows.length&&<tr><td className="p-3" colSpan={5}>No grades recorded yet.</td></tr>}</tbody></table></div>;
}
export default function AcademicHistory(){
 const [data,setData]=useState(null),[error,setError]=useState('');
 const load=()=>api.get('/students/grades').then(r=>{setData(r.data.data);setError('');}).catch(()=>setError('Could not load academic history. Please retry.'));
 useEffect(()=>{void load();},[]);
 return <section className="card space-y-4 my-6"><div className="flex flex-wrap gap-3 justify-between items-center"><h2 className="text-xl font-bold">Academic history</h2><button type="button" className="btn btn-outline" onClick={load}>Refresh grades</button></div><p className="text-sm text-neutral-600">Manual results are recorded separately. Your official automatic average continues to use your assigned worksheets.</p>{error&&<p role="alert" className="text-red-700">{error}</p>}{data?<GradeHistoryTable data={data}/>:<p role="status">Loading grades…</p>}</section>;
}
