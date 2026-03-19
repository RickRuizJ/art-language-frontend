'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import {
  BookOpen,
  Zap,
  CheckCircle,
  Clock,
  LogOut,
  ChevronRight,
  Users,
  BarChart3,
  AlertCircle,
  ArrowRight,
  PlayCircle,
  Eye,
  Calendar,
  FileText,
  RefreshCw,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS = {
  pending: {
    label:    'Pending',
    badgeCls: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon:     Clock,
    btnLabel: 'Start',
    btnIcon:  PlayCircle,
    btnCls:   'bg-primary-600 hover:bg-primary-700 text-white',
    barCls:   'bg-amber-400',
  },
  submitted: {
    label:    'Submitted',
    badgeCls: 'bg-violet-100 text-violet-700 border border-violet-200',
    icon:     CheckCircle,
    btnLabel: 'View',
    btnIcon:  Eye,
    btnCls:   'bg-violet-600 hover:bg-violet-700 text-white',
    barCls:   'bg-violet-400',
  },
  graded: {
    label:    'Graded',
    badgeCls: 'bg-green-100 text-green-700 border border-green-200',
    icon:     BarChart3,
    btnLabel: 'View Result',
    btnIcon:  Eye,
    btnCls:   'bg-green-600 hover:bg-green-700 text-white',
    barCls:   'bg-green-400',
  },
  reviewed: {
    label:    'Reviewed',
    badgeCls: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
    icon:     CheckCircle,
    btnLabel: 'View Result',
    btnIcon:  Eye,
    btnCls:   'bg-secondary-600 hover:bg-secondary-700 text-white',
    barCls:   'bg-secondary-400',
  },
};

const getStatus = (key) => STATUS[key] || STATUS.pending;

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user, logout, loading: authLoading } = useAuth();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchDashboard();
    else      setLoading(false);
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

  /* ── Skeleton loader ── */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="h-16 bg-white border-b border-neutral-200 shadow-soft" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-neutral-200 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-24 bg-neutral-200 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 bg-neutral-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats       = data?.stats      || { total: 0, completed: 0, pending: 0, avgScore: null };
  const assignments = data?.assignments || [];
  const student     = data?.student    || user;

  const pendingCount   = assignments.filter(
    (a) => (a.submissionStatus || 'pending') === 'pending'
  ).length;
  const completedCount = assignments.filter((a) =>
    ['submitted', 'graded', 'reviewed'].includes(a.submissionStatus)
  ).length;

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-bold text-neutral-900 leading-tight truncate">
                Art &amp; Language Campus
              </p>
              <p className="text-xs text-neutral-400">Student Dashboard</p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard/student/practice-hub"
              className="btn btn-ghost text-sm py-2 px-3"
            >
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="hidden sm:inline font-medium">Practice Hub</span>
            </Link>
            <button
              onClick={logout}
              className="btn btn-ghost text-sm py-2 px-3 text-neutral-500 hover:text-neutral-700"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Welcome + group pill ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
              Welcome back, {student?.firstName}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              {pendingCount > 0
                ? `You have ${pendingCount} assignment${pendingCount !== 1 ? 's' : ''} waiting.`
                : 'All caught up — great work!'}
            </p>
          </div>

          {student?.group && (
            <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 shadow-soft text-sm flex-shrink-0 self-start sm:self-auto">
              <Users className="w-4 h-4 text-secondary-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-neutral-800 truncate">{student.group.name}</p>
                {student.group.teacher && (
                  <p className="text-xs text-neutral-400 truncate">
                    {student.group.teacher.firstName} {student.group.teacher.lastName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Error banner ───────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* ── Stats grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Assigned"
            value={assignments.length}
            Icon={FileText}
            iconCls="text-secondary-600"
            bgCls="bg-secondary-50"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            Icon={CheckCircle}
            iconCls="text-green-600"
            bgCls="bg-green-50"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            Icon={Clock}
            iconCls="text-amber-600"
            bgCls="bg-amber-50"
          />
          <StatCard
            label="Avg. Score"
            value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
            Icon={TrendingUp}
            iconCls="text-primary-600"
            bgCls="bg-primary-50"
          />
        </div>

        {/* ── Practice Hub CTA ───────────────────────────────── */}
        <Link href="/dashboard/student/practice-hub" className="block group">
          <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-medium transition-all duration-200 group-hover:shadow-large group-hover:-translate-y-0.5">
            <div className="text-white min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-4 h-4 opacity-75 flex-shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-75">
                  Practice Hub
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold leading-tight">
                Vocabulary · Grammar · Spelling
              </p>
              <p className="text-white/70 text-sm mt-1 hidden sm:block">
                Pick your CEFR level and start a quick session.
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        {/* ── Assignments ────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              My Assignments
            </h2>
            <span className="text-sm text-neutral-400 font-medium tabular-nums">
              {assignments.length} total
            </span>
          </div>

          {assignments.length === 0 ? (
            <EmptyAssignments />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({ label, value, Icon, iconCls, bgCls }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 p-4 sm:p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-xl ${bgCls} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconCls}`} />
      </div>
      <div>
        <p className="text-xs text-neutral-400 font-medium mb-0.5">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ASSIGNMENT CARD
───────────────────────────────────────────────────────────── */
function AssignmentCard({ assignment }) {
  const statusKey  = assignment.submissionStatus || 'pending';
  const cfg        = getStatus(statusKey);
  const StatusIcon = cfg.icon;
  const BtnIcon    = cfg.btnIcon;

  /* Navigate to the worksheet viewer using the worksheet's own id.
     /worksheets/[id] is an existing route in this project. */
  const worksheetId = assignment.worksheet?.id;
  const href         = worksheetId ? `/worksheets/${worksheetId}` : '#';

  const isOverdue =
    assignment.dueDate &&
    statusKey === 'pending' &&
    new Date(assignment.dueDate) < new Date();

  const scorePercent =
    assignment.submission?.score != null &&
    assignment.submission?.maxScore > 0
      ? Math.round((assignment.submission.score / assignment.submission.maxScore) * 100)
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 flex flex-col overflow-hidden transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5 group">

      {/* Status accent bar */}
      <div className={`h-1 w-full ${cfg.barCls}`} />

      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2"
              title={assignment.worksheet?.title}
            >
              {assignment.worksheet?.title || 'Untitled worksheet'}
            </h3>
          </div>
        </div>

        {/* Description (if any) */}
        {assignment.worksheet?.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed pl-11">
            {assignment.worksheet.description}
          </p>
        )}

        {/* Status badge */}
        <div className="pl-11">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badgeCls}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Meta: due date and score */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 pl-11">
          {assignment.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
              <Calendar className="w-3.5 h-3.5" />
              {isOverdue ? 'Overdue · ' : ''}
              {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day:   'numeric',
              })}
            </span>
          )}
          {scorePercent !== null && (
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              {scorePercent}%
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA button */}
        <Link
          href={href}
          className={`
            mt-1 w-full flex items-center justify-center gap-2
            py-2.5 px-4 rounded-xl text-sm font-semibold
            transition-all duration-150 active:scale-95
            ${href === '#' ? 'opacity-40 pointer-events-none' : ''}
            ${cfg.btnCls}
          `}
          aria-label={`${cfg.btnLabel} worksheet: ${assignment.worksheet?.title}`}
        >
          <BtnIcon className="w-4 h-4 flex-shrink-0" />
          <span>{cfg.btnLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyAssignments() {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-100 py-14 px-6 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-neutral-300" />
      </div>
      <div>
        <p className="font-semibold text-neutral-700 mb-1">No assignments yet</p>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
          Your teacher will assign worksheets here. In the meantime, head to the
          Practice Hub to keep learning.
        </p>
      </div>
      <Link href="/dashboard/student/practice-hub" className="btn btn-primary mt-1">
        <Zap className="w-4 h-4" />
        Go to Practice Hub
      </Link>
    </div>
  );
}
