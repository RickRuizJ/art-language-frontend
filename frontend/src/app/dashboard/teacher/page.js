'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, groupAPI, submissionAPI } from '@/lib/api';
import { 
  BookOpen, Users, FileText, BarChart3, Plus, 
  LogOut, Eye, Edit, Trash2, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('worksheets');
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
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [worksheetsRes, groupsRes] = await Promise.all([
        worksheetAPI.getAll(),
        groupAPI.getAll(),
      ]);

      const worksheetsData = worksheetsRes.data.data.worksheets;
      const groupsData = groupsRes.data.data.groups;

      setWorksheets(worksheetsData);
      setGroups(groupsData);

      // Calculate total students (unique)
      const studentSet = new Set();
      groupsData.forEach(group => {
        group.members?.forEach(member => {
          studentSet.add(member.studentId);
        });
      });

      setStats({
        totalWorksheets: worksheetsData.length,
        totalGroups: groupsData.length,
        totalStudents: studentSet.size,
        pendingSubmissions: 0, // Would fetch from API
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
                <p className="text-sm text-neutral-600">Teacher Dashboard</p>
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
            Welcome, {user?.firstName}! 🎓
          </h2>
          <p className="text-neutral-600">
            Manage your worksheets, groups, and track student progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<FileText className="w-6 h-6" />}
            title="Worksheets"
            value={stats.totalWorksheets}
            color="bg-primary-100 text-primary-600"
          />
          <StatsCard
            icon={<Users className="w-6 h-6" />}
            title="Groups"
            value={stats.totalGroups}
            color="bg-secondary-100 text-secondary-600"
          />
          <StatsCard
            icon={<Users className="w-6 h-6" />}
            title="Students"
            value={stats.totalStudents}
            color="bg-accent-100 text-accent-600"
          />
          <StatsCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Pending Review"
            value={stats.pendingSubmissions}
            color="bg-green-100 text-green-600"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft p-2 mb-6">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'worksheets'}
              onClick={() => setActiveTab('worksheets')}
              icon={<FileText className="w-5 h-5" />}
              label="Worksheets"
            />
            <TabButton
              active={activeTab === 'groups'}
              onClick={() => setActiveTab('groups')}
              icon={<Users className="w-5 h-5" />}
              label="Groups"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart3 className="w-5 h-5" />}
              label="Analytics"
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'worksheets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-display font-bold text-neutral-900">
                Your Worksheets
              </h3>
              <Link href="/worksheets/create" className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Create Worksheet
              </Link>
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
              <Link href="/groups/create" className="btn btn-primary">
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
                <Link href="/groups/create" className="btn btn-primary">
                  <Plus className="w-5 h-5" />
                  Create Your First Group
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card text-center py-12">
            <BarChart3 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-neutral-700 mb-2">
              Analytics Coming Soon
            </h4>
            <p className="text-neutral-500">
              Detailed analytics and insights will be available here
            </p>
          </div>
        )}
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

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
        active
          ? 'bg-primary-100 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function WorksheetRow({ worksheet, onDelete, onTogglePublish }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
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
      <div className="flex gap-2">
        <Link href={`/worksheets/${worksheet.id}`} className="btn btn-ghost">
          <Eye className="w-5 h-5" />
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
