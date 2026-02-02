'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI } from '@/lib/api';
import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';

export default function JoinGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (joinCode.length < 4) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await groupAPI.joinWithCode(joinCode.toUpperCase());
      
      alert(response.data.message || 'Successfully joined group!');
      router.push('/dashboard/student');
    } catch (err) {
      console.error('Join error:', err);
      setError(err.response?.data?.message || 'Invalid join code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link 
          href="/dashboard/student"
          className="btn btn-ghost mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-neutral-900 mb-2">
            Join a Group
          </h1>
          <p className="text-center text-neutral-600 mb-8">
            Enter the code your teacher gave you
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Group Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={8}
                className="input w-full text-center text-2xl tracking-widest font-mono"
                required
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-2">
                Ask your teacher for the group code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || joinCode.length < 4}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining...
                </span>
              ) : (
                'Join Group'
              )}
            </button>
          </form>

          {/* Help */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600 text-center">
              Don't have a code?{' '}
              <span className="text-neutral-500">Ask your teacher for the group code</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
