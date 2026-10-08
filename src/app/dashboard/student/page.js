'use client';

import useAutoRefresh from '@/hooks/useAutoRefresh';
import { dynamicReadConfig } from '@/lib/fetchWithRetry';
import { useAuth } from '@/contexts/AuthContext';
import api, { messageAPI } from '@/lib/api';
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
  MessageCircle,
  MailOpen,
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
const uniqueById = (items = []) => [...new Map(items.map(item => [item.id, item])).values()];
async function loadDashboard({ signal, initial, attempt }) {
  const response = await api.get('/students/dashboard', dynamicReadConfig({
    signal, timeout: initial && attempt === 0 ? 45000 : 20000,
  }));
  return { ...response.data, assignments: uniqueById(response.data.assignments) };
}
async function loadInbox({ signal }) {
  const response = await messageAPI.getInbox({ limit: 20 }, dynamicReadConfig({ signal }));
  return { ...response.data.data, messages: uniqueById(response.data.data.messages) };
}

export default function StudentDashboard() {
  const { user, logout, loading: authLoading, authError, retryAuth } = useAuth();
  const enabled = !authLoading && user?.role === 'student';
  const dashboard = useAutoRefresh(loadDashboard, { enabled, resourceKey: user?.id });
  const inbox = useAutoRefresh(loadInbox, { enabled, resourceKey: user?.id });
  const { data, error, updating, loading } = dashboard;
  const messages = inbox.data?.messages || [];
  const unreadCount = inbox.data?.unreadCount || 0;
  const fetchDashboard = () => { void dashboard.refresh(); void inbox.refresh(); };

  const markMessageRead = async (messageId) => {
    try {
      await messageAPI.markRead(messageId);
      inbox.setData(previous => {
        if (!previous) return previous;
        const wasUnread = previous.messages.some(m => m.id === messageId && !m.isRead);
        return { ...previous,
          messages: previous.messages.map(m => m.id === messageId
            ? { ...m, isRead: true, readAt: new Date().toISOString() } : m),
          unreadCount: Math.max(0, previous.unreadCount - (wasUnread ? 1 : 0)),
        };
      });
    } catch (err) {
      console.error('Could not mark message as read:', err);
    }
  };

  if (!user && authError) return <main className="max-w-lg mx-auto p-6 space-y-4">
    <p role="status">{authError}</p>
    <button className="btn btn-outline" onClick={retryAuth}>Try again</button>
  </main>;

  /* ── Skeleton loader ── */
  if (authLoading) {
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

        {/* ── Teacher messages ─────────────────────────────────── */}
        {inbox.error && <p role="status" className="text-sm text-neutral-500">
          We couldn't refresh your messages. <button className="underline" onClick={inbox.refresh}>Retry messages</button>
        </p>}
        {inbox.loading && <p role="status" className="text-sm text-neutral-500">Loading messages...</p>}
        {messages.length > 0 && (
          <section className="bg-white rounded-2xl shadow-soft border border-neutral-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-neutral-900">Messages from your teacher</h2>
              </div>
              {unreadCount > 0 && (
                <span className="badge badge-info">{unreadCount} unread</span>
              )}
            </div>
            <div className="divide-y divide-neutral-100">
              {messages.slice(0, 5).map((message) => (
                <div key={message.id} className={`p-5 ${message.isRead ? 'bg-white' : 'bg-primary-50/40'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </p>
                        {message.group?.name && (
                          <span className="text-xs text-neutral-400">· {message.group.name}</span>
                        )}
                      </div>
                      {message.subject && (
                        <p className="text-sm font-semibold text-neutral-700 mb-1">{message.subject}</p>
                      )}
                      <p className="text-sm text-neutral-600 whitespace-pre-wrap">{message.body}</p>
                      <p className="text-xs text-neutral-400 mt-2">
                        {new Date(message.created_at || message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!message.isRead && (
                      <button
                        onClick={() => markMessageRead(message.id)}
                        className="btn btn-ghost text-xs flex-shrink-0"
                        title="Mark as read"
                      >
                        <MailOpen className="w-4 h-4" />
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              My Assignments
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-neutral-400 font-medium tabular-nums">{assignments.length} total</span>
              {updating && <span role="status" className="text-sm text-neutral-500">Updating...</span>}
              <button onClick={fetchDashboard} disabled={updating} className="btn btn-ghost text-sm py-2 px-3">
                <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>

          {error && <p role="status" className="mb-3 text-sm text-neutral-600">
            We couldn't refresh your assignments. Please try again.
          </p>}
          {!data && loading ? <p className="text-sm text-neutral-500">Loading assignments. The server may take a moment to respond.</p>
          : !data && error ? null : assignments.length === 0 ? (
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
