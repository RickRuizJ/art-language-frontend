'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setMessage('');
    try { const r = await authAPI.forgotPassword(email); setMessage(r.data.message || 'Please check your email.'); }
    catch (err) { setMessage(err.response?.data?.message || 'Recovery is unavailable. Contact your teacher.'); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-6"><section className="card w-full max-w-md space-y-5">
    <h1 className="text-2xl font-bold">Forgot your password?</h1><p className="text-neutral-600">Enter the email associated with your Campus account. If it exists, we will send a reset link.</p>
    <form onSubmit={submit} className="space-y-4"><label className="block">Email address<input className="input mt-2" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button></form>
    {message && <p role="status" className="p-3 rounded-xl bg-neutral-100">{message}</p>}<Link href="/login" className="text-primary-700 underline">Back to sign in</Link>
  </section></main>;
}
