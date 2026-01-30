'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, submissionAPI } from '@/lib/api';
import { BookOpen, CheckCircle, Clock, Star, TrendingUp, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [worksheets, setWorksheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [worksheetsRes, submissionsRes] = await Promise.all([
        worksheetAPI.getAll(),
        submissionAPI.getByStudent(user.id),
      ]);

      const worksheetsData = worksheetsRes.data.data.worksheets;
      const submissionsData = submissionsRes.data.data.submissions;

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorksheetStatus = (worksheetId) => {
    const submission = submissions.find(s => s.worksheetId === worksheetId);
    if (submission) {
      return { status: 'completed', score: submission.score };
    }
    return { status: 'available' };
  };

  if (loading) {
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="text-neutral-600">
            Here's your learning progress and available worksheets
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Total Worksheets"
            value={stats.total}
            color="bg-primary-100 text-primary-600"
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
            color="bg-accent-100 text-accent-600"
          />
        </div>

        {/* Worksheets Section */}
        <div>
          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-6">
            Your Worksheets
          </h3>
          
          {worksheets.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-neutral-700 mb-2">
                No worksheets yet
              </h4>
              <p className="text-neutral-500">
                Check back soon for new assignments from your teacher
              </p>
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

function WorksheetCard({ worksheet, status }) {
  return (
    <Link href={`/worksheets/${worksheet.id}`}>
      <div className="card-interactive h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-primary-100 text-primary-800'
          }`}>
            {status.status === 'completed' ? 'Completed' : 'Available'}
          </div>
          {status.status === 'completed' && (
            <div className="flex items-center gap-1 text-accent-600">
              <Star className="w-4 h-4 fill-current" />
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
      </div>
    </Link>
  );
}
