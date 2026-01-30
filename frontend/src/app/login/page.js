'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-display font-bold">
            Art & Language Campus
          </h1>
        </div>
        
        <div className="text-white">
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
            Welcome Back!
          </h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Continue your journey of creating engaging educational experiences 
            for your students.
          </p>
        </div>

        <div className="text-white/80 text-sm">
          © 2026 Art & Language Campus. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              Art & Language Campus
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Sign In
            </h2>
            <p className="text-neutral-600">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-xl bg-accent-50 border border-accent-200">
            <p className="text-sm font-semibold text-accent-900 mb-2">Demo Credentials:</p>
            <div className="text-xs text-accent-800 space-y-1">
              <p><strong>Teacher:</strong> teacher@artandlanguage.com / Teacher123!</p>
              <p><strong>Student:</strong> student@artandlanguage.com / Student123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
