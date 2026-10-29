'use client';
import { Suspense, useState } from 'react';
import {passwordError} from '@/lib/passwordRules';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setMessage('');
    if (passwordError(password) || password !== confirm) return setMessage(passwordError(password) || 'Passwords must match.');
    setLoading(true);
    try { await authAPI.resetPassword(token, password); setSuccess(true); setMessage('Password updated successfully.'); window.history.replaceState(null,'','/reset-password'); }
    catch (err) { setMessage(err.response?.data?.message || 'Could not reset password.'); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6"><section className="card w-full max-w-md space-y-4"><h1 className="text-2xl font-bold">Create a new password</h1>
    {!token && !success ? <p className="text-red-700">Missing reset token. Please request a new link.</p> : !success && <form onSubmit={submit} className="space-y-3"><label className="block">New password<input className="input mt-2" type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></label><label className="block">Confirm password<input className="input mt-2" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" /></label><button disabled={loading} className="btn btn-primary w-full">{loading ? 'Saving…' : 'Reset password'}</button></form>}
    {message && <p role="status" className="p-3 rounded-xl bg-neutral-100">{message}</p>}<Link href="/login" className="text-primary-700 underline">Back to sign in</Link>
  </section></main>;
}
export default function ResetPassword() { return <Suspense fallback={<p>Loading…</p>}><ResetForm /></Suspense>; }
