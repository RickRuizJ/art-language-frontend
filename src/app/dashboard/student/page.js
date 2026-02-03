'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, submissionAPI, groupAPI } from '@/lib/api';
import { 
  BookOpen, CheckCircle, TrendingUp, LogOut, Users, 
  Plus, Loader2, ArrowRight, Clock, BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [groups, setGroups] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch groups, worksheets, and submissions in parallel
      const [groupsRes, worksheetsRes, submissionsRes] = await Promise.all([
        groupAPI.getAll(),
        worksheetAPI.getAll(),
        submissionAPI.getByStudent(user.id).catch(() => ({ data: { data: { submissions: [] } } }))
      ]);

      const groupsData = groupsRes.data.data.groups || [];
      const worksheetsData = worksheetsRes.data.data.worksheets || [];
      const submissionsData = submissionsRes.data.data.submissions || [];

      setGroups(groupsData);
      setWorksheets(worksheetsData);
      setSubmissions(submissionsData);

      // Calculate stats
      const completedCount = submissionsData.length;
      const totalScore = submissionsData.reduce((sum, s) => sum + (s.score || 0), 0);
      const avgScore = completedCount > 0 ? totalScore / completedCount : 0;

      setStats({
        total: worksheetsData.length,
        completed: completedCount,
        avgScore: Math.round(avgScore),
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getWorksheetStatus = (worksheetId) => {
    const submission = submissions.find(s => s.worksheetId === worksheetId);
    if (submission) {
      return { status: 'completed', score: submission.score };
    }
    return { status: 'pending' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Determine dashboard state
  const hasGroups = groups.length > 0;
  const hasWorksheets = worksheets.length > 0;

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
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-neutral-600">
            {hasGroups 
              ? "Here's your learning progress and assignments" 
              : "Get started by joining your first group"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Total Worksheets"
            value={stats.total}
            color="bg-red-100 text-red-600"
          />
          <StatsCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Completed"
            value={stats.completed}
            color="bg-green-100 text-green-600"
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Average Score"
            value={`${stats.avgScore}%`}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        {/* CRITICAL: No Groups - Primary CTA */}
        {!hasGroups && (
          <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 mb-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                Join Your First Group
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                Ask your teacher for a group code to get started with your assignments
              </p>
              <Link href="/join-group" className="btn btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Join a Group
              </Link>
            </div>
          </div>
        )}

        {/* My Groups Section */}
        {hasGroups && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-900">
                My Groups
              </h3>
              <Link href="/join-group" className="btn btn-outline btn-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Join Another Group
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        {/* Worksheets Section */}
        <div>
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6">
            {hasGroups ? 'Your Assignments' : 'Worksheets'}
          </h3>
          
          {!hasWorksheets ? (
            <div className="card text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-neutral-700 mb-2">
                {hasGroups ? 'No assignments yet' : 'No worksheets available'}
              </h4>
              <p className="text-neutral-500 mb-6">
                {hasGroups 
                  ? 'Check back soon for new assignments from your teacher'
                  : 'Join a group to see your assignments'}
              </p>
              {!hasGroups && (
                <Link href="/join-group" className="btn btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Join a Group
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worksheets.map((worksheet) => (
                <WorksheetCard
                  key={worksheet.id}
                  worksheet={worksheet}
                  status={getWorksheetStatus(worksheet.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, color }) {
  return (
    <div className="card">
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

function GroupCard({ group }) {
  const memberCount = group.members?.length || 0;
  const teacherName = group.teacher 
    ? `${group.teacher.firstName} ${group.teacher.lastName}`
    : 'Unknown';

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="card-interactive h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            {memberCount} {memberCount === 1 ? 'student' : 'students'}
          </div>
        </div>
        
        <h4 className="text-xl font-display font-bold text-neutral-900 mb-2">
          {group.name}
        </h4>
        
        {group.description && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="text-sm text-neutral-500">
            <p className="font-medium text-neutral-700">Teacher</p>
            <p>{teacherName}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400" />
        </div>
      </div>
    </Link>
  );
}

function WorksheetCard({ worksheet, status }) {
  const isCompleted = status.status === 'completed';

  return (
    <Link href={`/worksheets/${worksheet.id}`}>
      <div className="card-interactive h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isCompleted
              ? 'bg-green-100 text-green-800' 
              : 'bg-primary-100 text-primary-800'
          }`}>
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            )}
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-yellow-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{status.score}%</span>
            </div>
          )}
        </div>
        
        <h4 className="text-xl font-display font-bold text-neutral-900 mb-2">
          {worksheet.title}
        </h4>
        
        {worksheet.description && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {worksheet.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          {worksheet.subject && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {worksheet.subject}
            </span>
          )}
          {worksheet.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {worksheet.estimatedTime} min
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-600">
              {isCompleted ? 'Review' : 'Start Worksheet'}
            </span>
            <ArrowRight className="w-5 h-5 text-primary-600" />
          </div>
        </div>
      </div>
    </Link>
  );
}
