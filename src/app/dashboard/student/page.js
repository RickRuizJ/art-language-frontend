'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import {
  BookOpen, Zap, CheckCircle, Clock, LogOut,
  ChevronRight, Users, Star, AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, loading: authLoading } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/students/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Student dashboard error:', err);
      setError('Could not load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const stats      = data?.stats      || { total: 0, completed: 0, pending: 0, avgScore: null };
  const assignments = data?.assignments || [];
  const student    = data?.student    || user;

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900 leading-tight">Art &amp; Language Campus</h1>
              <p className="text-xs text-neutral-500">Student Dashboard</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost text-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome ── */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Welcome back, {student?.firstName}! 👋
          </h2>
          <p className="text-neutral-500 mt-1">Here's your learning overview for today.</p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={fetchDashboard} className="ml-auto text-sm text-red-600 font-medium hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Assigned"
            value={stats.total}
            icon={<BookOpen className="w-5 h-5" />}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-5 h-5" />}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="w-5 h-5" />}
            color="bg-amber-100 text-amber-600"
          />
          <StatCard
            label="Avg. Score"
            value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
            icon={<Star className="w-5 h-5" />}
            color="bg-violet-100 text-violet-600"
          />
        </div>

        {/* ── Practice Hub CTA  (Bug 1 fix: prominent navigation card) ── */}
        <Link href="/dashboard/student/practice-hub">
          <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 p-6 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity shadow-md">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">Practice Hub</span>
              </div>
              <h3 className="text-2xl font-bold">Start Practicing</h3>
              <p className="text-white/80 text-sm mt-1">
                Vocabulary, Grammar, Spelling &amp; more — pick your level and go!
              </p>
            </div>
            <ChevronRight className="w-8 h-8 text-white/70 flex-shrink-0" />
          </div>
        </Link>

        {/* ── My Group ── */}
        {student?.group && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3 mb-1">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-900">My Group</h3>
            </div>
            <p className="text-neutral-700 font-medium">{student.group.name}</p>
            {student.group.teacher && (
              <p className="text-sm text-neutral-500 mt-0.5">
                Teacher: {student.group.teacher.firstName} {student.group.teacher.lastName}
              </p>
            )}
          </div>
        )}

        {/* ── Assignments ── */}
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">My Assignments</h3>

          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">No assignments yet. Your teacher will assign worksheets soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <AssignmentRow key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function AssignmentRow({ assignment }) {
  const status = assignment.submissionStatus || 'pending';

  const statusStyles = {
    pending:  { label: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
    graded:   { label: 'Graded',    cls: 'bg-green-100 text-green-700' },
    reviewed: { label: 'Reviewed',  cls: 'bg-blue-100 text-blue-700' },
    submitted:{ label: 'Submitted', cls: 'bg-violet-100 text-violet-700' },
  };

  const s = statusStyles[status] || statusStyles.pending;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate">
          {assignment.worksheet?.title || 'Untitled worksheet'}
        </p>
        {assignment.dueDate && (
          <p className="text-xs text-neutral-500 mt-0.5">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${s.cls}`}>
        {s.label}
      </span>
    </div>
  );
}
