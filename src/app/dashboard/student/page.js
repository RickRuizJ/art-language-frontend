'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  groupAPI, assignmentAPI, submissionAPI, worksheetAPI
} from '@/lib/api';
import {
  BookOpen, CheckCircle, Clock, Star, TrendingUp, LogOut,
  Users, Gamepad2, Search, Filter, ChevronRight, Flame,
  AlertCircle, Plus, X
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Overview data
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [groupsRes, submissionsRes] = await Promise.all([
        groupAPI.getAll(),
        submissionAPI.getByStudent(user.id),
      ]);

      const groupsData = groupsRes.data.data.groups || [];
      const submissionsData = submissionsRes.data.data.submissions || [];

      setGroups(groupsData);
      setSubmissions(submissionsData);

      // Fetch assignments for each group
      const assignmentsByGroup = await Promise.all(
        groupsData.map(group =>
          assignmentAPI.getGroupAssignments(group.id)
            .then(res => (res.data.data.assignments || []).map(a => ({ ...a, groupName: group.name })))
            .catch(() => [])
        )
      );
      setAssignments(assignmentsByGroup.flat());
    } catch (err) {
      console.error('fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (worksheetId) => {
    const sub = submissions.find(s => s.worksheetId === worksheetId || s.worksheet?.id === worksheetId);
    if (!sub) return 'not_started';
    if (sub.score !== null && sub.score !== undefined) return 'graded';
    return 'submitted';
  };

  const stats = {
    total: assignments.length,
    completed: submissions.length,
    avgScore: submissions.length > 0
      ? Math.round(submissions.reduce((s, sub) => s + (sub.score || 0), 0) / submissions.length)
      : 0,
    groups: groups.length,
  };

  const pending = assignments.filter(a => {
    const status = getAssignmentStatus(a.worksheet?.id);
    return status === 'not_started';
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'assignments', label: 'My Assignments', icon: BookOpen },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'practice', label: 'Practice Zone', icon: Gamepad2 },
    { id: 'library', label: 'Worksheet Library', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-neutral-900">
                  Art & Language Campus
                </h1>
                <p className="text-sm text-neutral-600">Student Dashboard</p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-ghost">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-1">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-neutral-600">Here's your learning overview</p>
        </div>

        {/* Tab nav */}
        <div className="bg-white rounded-2xl shadow-soft p-2 mb-8 flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab
            user={user}
            stats={stats}
            assignments={assignments}
            pending={pending}
            getAssignmentStatus={getAssignmentStatus}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            getAssignmentStatus={getAssignmentStatus}
            submissions={submissions}
          />
        )}
        {activeTab === 'groups' && (
          <GroupsTab groups={groups} onRefresh={fetchAll} />
        )}
        {activeTab === 'practice' && <PracticeTab />}
        {activeTab === 'library' && <LibraryTab />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ user, stats, assignments, pending, getAssignmentStatus, setActiveTab }) {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Assigned"
          value={stats.total}
          color="bg-primary-100 text-primary-600"
          onClick={() => setActiveTab('assignments')}
        />
        <StatsCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Completed"
          value={stats.completed}
          color="bg-green-100 text-green-600"
          onClick={() => setActiveTab('assignments')}
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg. Score"
          value={stats.completed > 0 ? `${stats.avgScore}%` : '—'}
          color="bg-accent-100 text-accent-600"
        />
        <StatsCard
          icon={<Users className="w-6 h-6" />}
          title="My Groups"
          value={stats.groups}
          color="bg-secondary-100 text-secondary-600"
          onClick={() => setActiveTab('groups')}
        />
      </div>

      {/* Pending assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-display font-bold text-neutral-900">
            Pending Assignments
          </h3>
          {pending.length > 0 && (
            <button
              onClick={() => setActiveTab('assignments')}
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-10">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-neutral-700 mb-1">All caught up!</h4>
            <p className="text-neutral-500 text-sm">No pending assignments right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.slice(0, 6).map(a => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                status={getAssignmentStatus(a.worksheet?.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick access */}
      <div>
        <h3 className="text-2xl font-display font-bold text-neutral-900 mb-4">Quick Access</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickCard
            icon="🎮"
            title="Practice Zone"
            desc="Play games to improve your skills"
            color="bg-purple-50 border-purple-200"
            onClick={() => setActiveTab('practice')}
          />
          <QuickCard
            icon="📚"
            title="Worksheet Library"
            desc="Browse and search all worksheets"
            color="bg-blue-50 border-blue-200"
            onClick={() => setActiveTab('library')}
          />
          <Link href="/join-group" className="block">
            <QuickCard
              icon="🔑"
              title="Join a Group"
              desc="Enter a code from your teacher"
              color="bg-orange-50 border-orange-200"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Assignments Tab ─── */
function AssignmentsTab({ assignments, getAssignmentStatus, submissions }) {
  const [filter, setFilter] = useState('all');

  const filtered = assignments.filter(a => {
    if (filter === 'all') return true;
    return getAssignmentStatus(a.worksheet?.id) === filter;
  });

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'not_started', label: 'Not Started' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'graded', label: 'Graded' },
  ];

  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6">My Assignments</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              filter === f.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-neutral-700 mb-2">No assignments found</h4>
          <p className="text-neutral-500">
            {filter === 'all'
              ? 'Your teacher will assign worksheets here.'
              : `No assignments with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              status={getAssignmentStatus(a.worksheet?.id)}
              showScore
              submissions={submissions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Groups Tab ─── */
function GroupsTab({ groups, onRefresh }) {
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const { groupAPI } = useGroupAPI();

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      await groupAPI.joinWithCode(joinCode.toUpperCase().trim());
      setJoinSuccess('Successfully joined the group!');
      setJoinCode('');
      onRefresh();
    } catch (err) {
      setJoinError(err?.response?.data?.message || 'Invalid code. Please check and try again.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6">My Groups</h3>

      {/* Join card */}
      <div className="card mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
        <h4 className="text-lg font-display font-bold text-neutral-900 mb-1">Join a Group</h4>
        <p className="text-sm text-neutral-600 mb-4">
          Enter the code your teacher shared with you
        </p>
        <form onSubmit={handleJoin} className="flex gap-3 max-w-md">
          <input
            className="input flex-1 text-center text-lg tracking-widest font-mono uppercase"
            placeholder="ABC123"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <button className="btn btn-primary" type="submit" disabled={joining || joinCode.length < 4}>
            {joining ? 'Joining…' : 'Join'}
          </button>
        </form>
        {joinError && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {joinError}
          </p>
        )}
        {joinSuccess && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> {joinSuccess}
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-neutral-700 mb-2">No groups yet</h4>
          <p className="text-neutral-500">Ask your teacher for a group code to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <div key={g.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-display font-bold text-neutral-900 truncate">{g.name}</h4>
                  {g.description && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{g.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-sm text-neutral-500">
                    <span className="badge badge-info">
                      {g.members?.length || 0} students
                    </span>
                    {g.subject && <span>{g.subject}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Practice Tab ─── */
function PracticeTab() {
  const games = [
    {
      href: '/dashboard/student/practice/vocab-match',
      icon: '🃏',
      title: 'Vocabulary Match',
      desc: 'Match words with their definitions in a timed challenge',
      badge: 'Fun',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      href: '/dashboard/student/practice/grammar-challenge',
      icon: '📝',
      title: 'Grammar Challenge',
      desc: 'Test your grammar with multiple-choice questions against the clock',
      badge: 'Practice',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      href: '/dashboard/student/practice/spelling-challenge',
      icon: '🔤',
      title: 'Spelling Challenge',
      desc: 'Read the hint and spell the word correctly',
      badge: 'Spelling',
      badgeColor: 'bg-pink-100 text-pink-700',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">Practice Zone 🎮</h3>
        <p className="text-neutral-600">No grades here — just fun ways to practice your English!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {games.map(g => (
          <Link key={g.href} href={g.href} className="block">
            <div className="card-interactive h-full flex flex-col">
              <div className="text-5xl mb-4">{g.icon}</div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xl font-display font-bold text-neutral-900">{g.title}</h4>
                <span className={`badge text-xs ${g.badgeColor}`}>{g.badge}</span>
              </div>
              <p className="text-neutral-600 text-sm flex-1">{g.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-primary-600 font-medium text-sm">
                Play now <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Library Tab ─── */
function LibraryTab() {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [skill, setSkill] = useState('');
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const res = await worksheetAPI.getAll({ search, level, topic, skill });
      // Support both response shapes
      const data = res.data.data?.worksheets || res.data.worksheets || res.data || [];
      setWorksheets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Library search error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6">Worksheet Library 📚</h3>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card mb-8">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              className="input pl-10"
              placeholder="Search by keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
            <option value="">All Levels</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select className="input" value={skill} onChange={e => setSkill(e.target.value)}>
            <option value="">All Skills</option>
            {['grammar', 'vocabulary', 'reading', 'writing', 'listening', 'speaking'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <input
            className="input flex-1"
            placeholder="Topic (e.g. food, travel, work)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Search className="w-4 h-4" />
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600">Searching worksheets…</p>
        </div>
      ) : !searched ? (
        <div className="card text-center py-12">
          <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-neutral-700 mb-2">Search the library</h4>
          <p className="text-neutral-500">Use the filters above to find worksheets</p>
        </div>
      ) : worksheets.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-neutral-700 mb-2">No worksheets found</h4>
          <p className="text-neutral-500">Try different keywords or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {worksheets.map(w => (
            <Link key={w.id || w._id} href={`/worksheets/${w.id || w._id}`}>
              <div className="card-interactive h-full">
                <div className="flex items-start justify-between mb-3">
                  {w.level && (
                    <span className="badge badge-info">{w.level}</span>
                  )}
                  {w.skill && (
                    <span className="badge bg-primary-100 text-primary-700">{w.skill}</span>
                  )}
                </div>
                <h4 className="text-lg font-display font-bold text-neutral-900 mb-2">{w.title}</h4>
                {w.description && (
                  <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{w.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  {w.topic && <span>📌 {w.topic}</span>}
                  <span>📋 {w.questions?.length || 0} questions</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Shared sub-components ─── */

function StatsCard({ icon, title, value, color, onClick }) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer hover:-translate-y-1 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-neutral-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-display font-bold text-neutral-900">{value}</p>
    </div>
  );
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', cls: 'bg-neutral-100 text-neutral-600' },
  submitted: { label: 'Submitted', cls: 'badge-success' },
  graded: { label: 'Graded', cls: 'bg-accent-100 text-accent-700' },
};

function AssignmentCard({ assignment: a, status, showScore, submissions }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const sub = submissions?.find(s => s.worksheetId === a.worksheet?.id || s.worksheet?.id === a.worksheet?.id);
  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && status === 'not_started';

  return (
    <Link href={`/worksheets/${a.worksheet?.id}`}>
      <div className="card-interactive h-full">
        <div className="flex items-start justify-between mb-3">
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          {showScore && sub?.score != null && (
            <span className="flex items-center gap-1 text-accent-600 text-sm font-semibold">
              <Star className="w-4 h-4 fill-current" /> {sub.score}%
            </span>
          )}
        </div>
        <h4 className="text-lg font-display font-bold text-neutral-900 mb-2">
          {a.worksheet?.title || 'Untitled'}
        </h4>
        {a.groupName && (
          <p className="text-xs text-neutral-500 mb-2">
            <Users className="w-3 h-3 inline mr-1" />{a.groupName}
          </p>
        )}
        {dueDate && (
          <p className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-neutral-500'}`}>
            {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {dueDate.toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}

function QuickCard({ icon, title, desc, color, onClick }) {
  return (
    <div
      className={`card border-2 cursor-pointer hover:-translate-y-1 transition-all ${color}`}
      onClick={onClick}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-display font-bold text-neutral-900 mb-1">{title}</h4>
      <p className="text-sm text-neutral-600">{desc}</p>
    </div>
  );
}

// Hook to get groupAPI inside GroupsTab without prop drilling
function useGroupAPI() {
  return { groupAPI };
}
