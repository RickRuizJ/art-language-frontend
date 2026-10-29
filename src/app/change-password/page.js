'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';
import {passwordError} from '@/lib/passwordRules';
import Link from 'next/link';
export default function ChangePassword(){
 const {user,loading,changePassword,logout}=useAuth(),router=useRouter();
 const [currentPassword,setCurrent]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!loading&&!user)router.replace('/login');},[loading,user,router]);
 async function save(e){e.preventDefault();const problem=passwordError(password);if(problem||password!==confirm){setError(problem||'Passwords do not match.');return;}setBusy(true);setError('');const result=await changePassword(currentPassword,password);if(!result.success)setError(result.message);setBusy(false);}
 if(loading||!user)return <p role="status" className="p-6">Checking session…</p>;
 return <main className="min-h-screen flex items-center justify-center bg-neutral-50 p-5"><section className="card w-full max-w-md space-y-5"><h1 className="text-2xl font-bold">Change your password</h1><p className="text-sm text-neutral-600">{user.mustChangePassword?'Create a personal password before accessing your account.':'Changing your password signs out your other sessions.'} Use at least 8 characters and at most 72 UTF-8 bytes.</p>{error&&<p role="alert" className="text-red-700">{error}</p>}<form onSubmit={save} className="space-y-4"><label className="block">Current password<input autoComplete="current-password" type="password" className="input mt-1" required value={currentPassword} onChange={e=>setCurrent(e.target.value)}/></label><label className="block">New password<input autoComplete="new-password" type="password" minLength={8} maxLength={72} className="input mt-1" required value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="block">Confirm new password<input autoComplete="new-password" type="password" className="input mt-1" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button disabled={busy} className="btn btn-primary w-full">{busy?'Saving…':'Save personal password'}</button></form><div className="flex justify-between"><Link className="underline" href="/forgot-password">Forgot current password?</Link><button type="button" className="underline" onClick={logout}>Sign out</button></div></section></main>;
}
