'use client';
import { useEffect, useState } from 'react';
import { managementAPI, groupAPI } from '@/lib/api';
import Modal from './Modal';
import {GradeHistoryTable} from './AcademicHistory';
import {passwordError} from '@/lib/passwordRules';
const blank = { firstName: '', lastName: '', email: '', password: '', groupId: '' };
export default function StudentManagement({onChanged}) {
  const [students, setStudents] = useState([]), [groups, setGroups] = useState([]), [memberships, setMemberships] = useState([]);
  const [form, setForm] = useState(blank), [editing, setEditing] = useState(''), [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [passwordStudent,setPasswordStudent]=useState(null),[temporaryPassword,setTemporaryPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[passwordMessage,setPasswordMessage]=useState(''),[profile,setProfile]=useState(null);
  const [search, setSearch] = useState('');
  const refresh = async () => { const r = await managementAPI.getStudents(); const data = r.data.data; setStudents(data.students); setGroups(data.groups); setMemberships(data.memberships); };
  useEffect(() => { refresh().catch(() => setError('Unable to load students.')); }, []);
  const execute = async (operation, success = 'Saved successfully.') => {
    setBusy(true); setError(''); setMessage('');
    try { await operation(); await refresh(); onChanged?.(); setMessage(success); return true; }
    catch (e) { setError(e.response?.data?.message || 'Could not complete action.'); return false; }
    finally { setBusy(false); }
  };
  const save = async e => {
    e.preventDefault();
    if(!editing&&passwordError(form.password)){setError(passwordError(form.password));return;}
    const ok = await execute(() => editing ? managementAPI.updateStudent(editing, { firstName: form.firstName, lastName: form.lastName, email: form.email }) : managementAPI.createStudent(form), editing ? 'Student updated.' : 'Student created.');
    if (ok) { setEditing(''); setForm(blank); }
  };
  const edit = student => { setEditing(student.id); setForm({ ...blank, firstName: student.firstName, lastName: student.lastName, email: student.email }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const sorted = students.filter(s => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3 items-center"><div><h2 className="text-2xl font-bold">Manage Students</h2><p className="text-neutral-600 text-sm">Manage accounts and group membership. Passwords are never displayed.</p></div><button className="btn btn-outline" onClick={() => execute(() => Promise.resolve(), 'Student list refreshed.')}>Refresh</button></div>
    {error && <div role="alert" className="p-3 bg-red-50 text-red-800 rounded-xl">{error}</div>}{message && <div role="status" className="p-3 bg-green-50 text-green-800 rounded-xl">{message}</div>}
    <div className="card space-y-4"><h3 className="font-semibold text-lg">{editing ? 'Edit student' : 'Add student'}</h3>
      <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
        {[['firstName','First name'],['lastName','Last name'],['email','Email address']].map(([key,label]) => <label key={key} className="text-sm">{label}<input className="input mt-1" name={key} type={key==='email'?'email':'text'} required value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))}/></label>)}
        {!editing && <><label className="text-sm">Temporary login password<input type="password" minLength={8} className="input mt-1" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></label><label className="text-sm">Assign to group<select className="input mt-1" required value={form.groupId} onChange={e=>setForm(f=>({...f,groupId:e.target.value}))}><option value="">Select group</option>{groups.map(g=><option value={g.id} key={g.id} disabled={!g.isActive}>{g.name}{g.isActive?'':' (inactive)'}</option>)}</select></label></>}
        <div className="flex items-end gap-2"><button disabled={busy} className="btn btn-primary">{busy?'Saving…':editing?'Save changes':'Create student'}</button>{editing&&<button className="btn btn-outline" type="button" onClick={()=>{setEditing('');setForm(blank);}}>Cancel</button>}</div>
      </form>
      {!editing && <p className="text-xs text-neutral-500">Share the temporary password privately. It expires in 24 hours and must be changed at the next sign in.</p>}
    </div>
    <div className="card space-y-3"><h3 className="font-semibold text-lg">Students ({students.length})</h3><input className="input" type="search" placeholder="Search name or email" value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-2">Student</th><th className="p-2">Groups</th><th className="p-2">Account</th><th className="p-2">Actions</th></tr></thead><tbody>
        {sorted.map(s=><tr key={s.id} className="border-b"><td className="p-2"><strong>{s.firstName} {s.lastName}</strong><p className="text-neutral-500">{s.email}</p></td>
          <td className="p-2"><div className="space-y-1">{groups.filter(g=>memberships.some(m=>m.studentId===s.id&&m.groupId===g.id)||g.id===s.groupId).map(g=><div key={g.id} className="flex items-center gap-2"><span>{g.name}</span><button className="underline text-red-700" disabled={busy} onClick={()=>execute(()=>managementAPI.removeFromGroup(s.id,g.id),'Removed from group; account preserved.')}>Remove</button></div>)}
            <select aria-label={`Add ${s.firstName} to group`} className="input max-w-48" defaultValue="" onChange={e=>{if(e.target.value)execute(()=>managementAPI.addToGroup(s.id,e.target.value),'Added to group.');e.target.value='';}}><option value="">+ Add group</option>{groups.filter(g=>!memberships.some(m=>m.studentId===s.id&&m.groupId===g.id)&&g.id!==s.groupId).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div></td>
          <td className="p-2">{s.isActive?'Active':'Disabled'}</td><td className="p-2"><div className="flex flex-wrap gap-2"><button className="text-primary-700 underline" onClick={()=>edit(s)}>Edit</button><button className="text-primary-700 underline" disabled={busy} onClick={async()=>{try{const r=await managementAPI.profile(s.id);setProfile(r.data);}catch(e){setError(e.response?.data?.message||'Could not load profile.');}}}>Profile & grades</button><button className="text-primary-700 underline" disabled={busy} onClick={()=>execute(()=>managementAPI.requestReset(s.id),'Password reset email requested.')}>Email reset link</button><button className="text-primary-700 underline" disabled={busy} onClick={()=>{setPasswordStudent(s);setTemporaryPassword('');setConfirmPassword('');setPasswordMessage('');}}>Set password</button><button className="text-amber-800 underline" disabled={busy} onClick={()=>{if(confirm(`${s.isActive?'Disable':'Reactivate'} this account?`))execute(()=>managementAPI.updateStudent(s.id,{isActive:!s.isActive}));}}>{s.isActive?'Disable':'Reactivate'}</button></div></td></tr>)}
        {!sorted.length&&<tr><td colSpan={4} className="p-4 text-neutral-500">No students found.</td></tr>}
      </tbody></table></div>
    </div>
    <div className="card"><h3 className="font-semibold mb-2">Group registration codes</h3><p className="text-sm text-neutral-600 mb-3">Students need one of these existing codes when creating their account.</p><div className="grid md:grid-cols-2 gap-2">{groups.map(g=><div key={g.id} className="p-3 bg-neutral-50 rounded-xl flex justify-between gap-3"><span>{g.name}</span><div className="flex items-center gap-2"><code className="font-bold">{g.joinCode}</code><button className="underline text-sm text-primary-700" disabled={busy} onClick={()=>{if(confirm(`Replace the registration code for ${g.name}? Existing students keep their accounts.`))execute(()=>groupAPI.rotateRegistrationCode(g.id),'Registration code changed.');}}>Rotate</button></div></div>)}</div></div>
    {passwordStudent&&<Modal title={`Set temporary password for ${passwordStudent.firstName}`} onClose={()=>!busy&&setPasswordStudent(null)}><p className="text-sm text-neutral-600">This password expires in 24 hours. The student must create a personal password at sign in. Other sessions will be revoked.</p>{passwordMessage&&<p role="alert" className="text-red-700">{passwordMessage}</p>}<form className="space-y-4" onSubmit={async e=>{e.preventDefault();const problem=passwordError(temporaryPassword);if(problem||temporaryPassword!==confirmPassword){setPasswordMessage(problem||'Passwords do not match.');return;}const ok=await execute(()=>managementAPI.setPassword(passwordStudent.id,temporaryPassword),'Temporary password updated. Share it privately.');if(ok){setPasswordStudent(null);setTemporaryPassword('');setConfirmPassword('');}else setPasswordMessage('Could not set the password. See the account message or try again.');}}><label className="block">Temporary password<input type="password" autoComplete="new-password" className="input mt-1" required minLength={8} maxLength={72} value={temporaryPassword} onChange={e=>setTemporaryPassword(e.target.value)}/></label><label className="block">Confirm temporary password<input type="password" autoComplete="new-password" className="input mt-1" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label><button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Set temporary password'}</button></form></Modal>}
    {profile&&<Modal title={`${profile.student.firstName} ${profile.student.lastName} — profile`} onClose={()=>setProfile(null)}><p>{profile.student.email} · {profile.student.isActive?'Active':'Disabled'}</p><p className="text-sm">Groups: {profile.student.groups.map(g=>g.name).join(', ')||'None'}</p><div className="grid grid-cols-2 gap-3"><p>Official automatic average: <strong>{profile.progress.avgScore??'—'}{profile.progress.avgScore!=null?'%':''}</strong></p><p>Completed: {profile.progress.completedAssignments}/{profile.progress.totalAssignments}</p></div><p className="text-sm text-neutral-600">Only academic records within your authorized teaching scope are shown. Manual results remain separate.</p><GradeHistoryTable data={profile.academicHistory}/></Modal>}
  </section>;
}
