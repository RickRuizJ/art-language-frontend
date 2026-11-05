'use client';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import StudentManagement from '@/components/StudentManagement';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, groupAPI, teacherAPI } from '@/lib/api';
import {
  BookOpen, Users, FileText, BarChart3, Plus,
  LogOut, Eye, Edit, Trash2, CheckCircle, LayoutDashboard,
  ArrowRight, GraduationCap, ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [worksheets, setWorksheets] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalWorksheets: 0,
    totalGroups: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // BUG FIX: The original code only checked `if (user)` to decide whether to
    // fetch data. This creates a deadlock:
    //
    //   1. AuthContext starts with loading=true, user=null.
    //   2. This useEffect fires with user=null → fetchData() is skipped.
    //   3. AuthContext finishes checkAuth() and sets user (or leaves it null).
    //   4. useEffect fires again with the real user value.
    //
    // BUT: if the user was already logged in and /auth/me succeeds instantly,
    // step 3 sets user and triggers step 4 correctly.
    //
    // The REAL deadlock happens when AuthContext is still resolving (authLoading=true)
    // and a 401 from the API triggers the response interceptor redirect before
    // AuthContext has a chance to set the user. The dashboard's own loading state
    // stays true because fetchData() was never called (user was null at mount time).
    //
    // FIX: Wait for AuthContext to finish its own check before deciding anything.
    // If auth is still loading, do nothing yet. Once it's done, either fetch
    // data (user exists) or stop the local spinner (no user → redirect to login).
    if (authLoading) return;

    if (user) {
      fetchData();
    } else {
      // Auth resolved but no user — clear the local spinner so the page doesn't
      // hang. The response interceptor in api.js will redirect to /login.
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [worksheetsRes, groupsRes, statsRes] = await Promise.all([
        worksheetAPI.getAll(),
        groupAPI.getAll(),
        teacherAPI.getDashboardStats(),
      ]);

      const worksheetsData = worksheetsRes.data.data.worksheets;
      const groupsData = groupsRes.data.data.groups;

      setWorksheets(worksheetsData);
      setGroups(groupsData);

      setStats(statsRes.data.data || {
        totalWorksheets: worksheetsData.length,
        totalGroups: groupsData.length,
        totalStudents: 0,
        pendingSubmissions: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorksheet = async (id) => {
    if (!confirm('Are you sure you want to delete this worksheet?')) return;

    try {
      await worksheetAPI.delete(id);
      setWorksheets(worksheets.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      alert('Failed to delete worksheet');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await worksheetAPI.togglePublish(id);
      setWorksheets(worksheets.map(w =>
        w.id === id ? { ...w, isPublished: !w.isPublished } : w
      ));
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="campus-topbar sticky top-0 z-30">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-[76px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="campus-brand-mark"><BookOpen className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-base font-bold text-secondary-900 tracking-tight truncate">Art &amp; Language Campus</p>
              <p className="text-xs text-neutral-500">Teacher Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-neutral-500">{user?.firstName} {user?.lastName}</span>
            <button onClick={logout} className="btn btn-outline text-sm" aria-label="Sign out">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto lg:flex lg:gap-8 px-4 sm:px-6 lg:px-8 pt-6 pb-14">
        <aside aria-label="Teacher navigation" className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
          <div className="sticky top-28 campus-panel p-3">
            <p className="campus-eyebrow px-3 py-3">Workspace</p>
            {[
              { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
              { key: 'worksheets', label: 'Worksheets', Icon: BookOpen },
              { key: 'groups', label: 'Groups', Icon: Users },
              { key: 'students', label: 'Students', Icon: GraduationCap },
              { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
            ].map(({ key, label, Icon }) => (
              <button type="button" key={key} className="campus-nav-item" data-active={activeTab === key}
                aria-current={activeTab === key ? 'page' : undefined} onClick={() => setActiveTab(key)}>
                <Icon className="w-[18px] h-[18px]" />{label}
              </button>
            ))}
            <div className="campus-divider my-3" />
            <Link href="/worksheets/create" className="campus-nav-item"><Plus className="w-[18px] h-[18px]"/>New worksheet</Link>
            <Link href="/groups" className="campus-nav-item"><Users className="w-[18px] h-[18px]"/>Manage groups</Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
            <div>
              <p className="campus-eyebrow mb-2">Teaching, simplified</p>
              <h1 className="campus-heading">Welcome back, {user?.firstName}</h1>
              <p className="text-neutral-600 text-sm sm:text-base mt-2">Manage your classes, student access and academic progress in one place.</p>
            </div>
            <Link href="/worksheets/create" className="btn btn-primary self-start"><Plus className="w-4 h-4"/>Create worksheet</Link>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatsCard icon={<FileText className="w-5 h-5" />} title="Worksheets" value={stats.totalWorksheets} color="bg-primary-50 text-primary-700" />
            <StatsCard icon={<Users className="w-5 h-5" />} title="Groups" value={stats.totalGroups} color="bg-secondary-50 text-secondary-700" />
            <StatsCard icon={<GraduationCap className="w-5 h-5" />} title="Students" value={stats.totalStudents} color="bg-primary-50 text-primary-700" />
            <StatsCard icon={<ClipboardList className="w-5 h-5" />} title="Pending Review" value={stats.pendingSubmissions} color="bg-accent-50 text-accent-700" />
          </div>

          <nav aria-label="Teacher sections" className="lg:hidden campus-panel p-2 mb-6 flex gap-1 overflow-x-auto">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" />
            <TabButton active={activeTab === 'worksheets'} onClick={() => setActiveTab('worksheets')} icon={<FileText className="w-4 h-4" />} label="Worksheets" />
            <TabButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={<Users className="w-4 h-4" />} label="Groups" />
            <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<GraduationCap className="w-4 h-4" />} label="Students" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 className="w-4 h-4" />} label="Analytics" />
          </nav>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <section className="campus-panel p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div><p className="campus-eyebrow mb-1">Quick access</p><h2 className="text-xl font-bold text-secondary-900">Your workspace</h2></div>
                  <span className="text-xs text-neutral-500">All your tools, one place</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { key: 'worksheets', title: 'Worksheet library', detail: 'Create, edit and publish activities', Icon: BookOpen },
                    { key: 'groups', title: 'Class groups', detail: 'Assignments, members and join codes', Icon: Users },
                    { key: 'students', title: 'Student accounts', detail: 'Access, profiles and passwords', Icon: GraduationCap },
                    { key: 'analytics', title: 'Academic analytics', detail: 'Grades, progress and history', Icon: BarChart3 },
                  ].map(({ key, title, detail, Icon }) => (
                    <button key={key} type="button" className="campus-quick-link text-left group"
                      onClick={() => setActiveTab(key)}>
                      <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 inline-flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5"/></span>
                      <span className="min-w-0 flex-1"><strong className="block text-sm text-secondary-900">{title}</strong><span className="block text-xs text-neutral-500 mt-1">{detail}</span></span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-700" />
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-secondary-900">Your groups</h2>
                  <button type="button" onClick={() => setActiveTab('groups')} className="text-sm font-semibold text-primary-700 hover:underline">View all</button>
                </div>
                {groups.length === 0 ? (
                  <div className="campus-panel p-6 text-sm text-neutral-600">No groups created yet. <Link href="/groups" className="font-semibold text-primary-700 underline">Create a group</Link> to get started.</div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {groups.slice(0, 6).map(group => <GroupCard key={group.id} group={group}/>)}
                  </div>
                )}
              </section>
            </div>
          )}

        {/* Content */}
        {activeTab === 'worksheets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-900">
                Your Worksheets
              </h3>
              <div className="flex gap-2">
                <Link href="/worksheets/upload" className="btn btn-outline">
                  <Plus className="w-5 h-5" />
                  Upload
                </Link>
                <Link href="/worksheets/create" className="btn btn-primary">
                  <Plus className="w-5 h-5" />
                  Create Worksheet
                </Link>
              </div>
            </div>

            {worksheets.length === 0 ? (
              <div className="card text-center py-12">
                <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-neutral-700 mb-2">
                  No worksheets yet
                </h4>
                <p className="text-neutral-500 mb-6">
                  Create your first worksheet to get started
                </p>
                <Link href="/worksheets/create" className="btn btn-primary">
                  <Plus className="w-5 h-5" />
                  Create Your First Worksheet
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {worksheets.map((worksheet) => (
                  <WorksheetRow
                    key={worksheet.id}
                    worksheet={worksheet}
                    onDelete={handleDeleteWorksheet}
                    onTogglePublish={handleTogglePublish}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-900">
                Your Groups
              </h3>
              <Link href="/groups" className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Create Group
              </Link>
            </div>

            {groups.length === 0 ? (
              <div className="card text-center py-12">
                <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-neutral-700 mb-2">
                  No groups yet
                </h4>
                <p className="text-neutral-500 mb-6">
                  Create a group to organize your students
                </p>
                <Link href="/groups" className="btn btn-primary">
                  <Plus className="w-5 h-5" />
                  Create Your First Group
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && <StudentManagement onChanged={fetchData}/>}
        {activeTab === 'analytics' && <AnalyticsPanel/>}
        </main>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, color }) {
  return (
    <div className="campus-stat">
      <div className={`w-10 h-10 rounded-xl ${color} inline-flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-neutral-600 text-sm mb-1">{title}</p>
      <p className="campus-stat-value">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'page' : undefined}
      className={`campus-nav-item !w-auto flex-shrink-0 ${active ? 'bg-primary-50 text-primary-800' : ''}`}>
      {icon}{label}
    </button>
  );
}

function WorksheetRow({ worksheet, onDelete, onTogglePublish }) {
  const hasInteractiveQuestions = (worksheet.questions || []).some(q => !['external_link', 'google_embed'].includes(q.type));
  const editHref = hasInteractiveQuestions ? `/worksheets/builder?id=${worksheet.id}` : `/worksheets/${worksheet.id}/edit`;
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className="text-lg font-display font-bold text-neutral-900">
            {worksheet.title}
          </h4>
          <span className={`badge ${
            worksheet.isPublished ? 'badge-success' : 'badge-warning'
          }`}>
            {worksheet.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        {worksheet.description && (
          <p className="text-neutral-600 text-sm mb-2">{worksheet.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <span>{worksheet.questions?.length || 0} questions</span>
          {worksheet.subject && <span>{worksheet.subject}</span>}
          {worksheet.gradeLevel && <span>{worksheet.gradeLevel}</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/worksheets/${worksheet.id}`} className="btn btn-ghost" title="View worksheet" aria-label={`View ${worksheet.title}`}>
          <Eye className="w-5 h-5" />
        </Link>
        <Link
          href={editHref}
          className="btn btn-ghost"
          title="Edit worksheet"
        >
          <Edit className="w-5 h-5" />
        </Link>
        <button
          onClick={() => onTogglePublish(worksheet.id)}
          className="btn btn-ghost"
          title={worksheet.isPublished ? 'Unpublish' : 'Publish'}
        >
          <CheckCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(worksheet.id)}
          className="btn btn-ghost text-red-600 hover:bg-red-50"
          title="Delete worksheet" aria-label={`Delete ${worksheet.title}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function GroupCard({ group }) {
  const memberCount = group.members?.length || 0;

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="card-interactive h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <span className="badge badge-info">{memberCount} students</span>
        </div>

        <h4 className="text-xl font-display font-bold text-neutral-900 mb-2">
          {group.name}
        </h4>

        {group.description && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-neutral-500">
          {group.subject && <span>{group.subject}</span>}
          {group.gradeLevel && <span>{group.gradeLevel}</span>}
        </div>
      </div>
    </Link>
  );
}
