'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI } from '@/lib/api';
import Link from 'next/link';
import { Users, Plus, Loader2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function GroupsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupAPI.getAll();
      setGroups(response.data.data.groups || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect students to dashboard
  useEffect(() => {
    if (user && user.role === 'student') {
      router.push('/dashboard/student');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  // Only teachers and admins can access this page
  if (user && user.role === 'student') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                My Groups
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your student groups and assignments
              </p>
            </div>
            {user?.role === 'teacher' && (
              <Link
                href="/groups/create"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Group
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={fetchGroups}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">
              No groups yet
            </h3>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {user?.role === 'teacher' 
                ? "Create your first group to organize students and assign worksheets"
                : "No groups available"}
            </p>
            {user?.role === 'teacher' && (
              <Link
                href="/groups/create"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Group
              </Link>
            )}
          </div>
        )}

        {/* Groups Grid */}
        {!loading && groups.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} userRole={user?.role} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, userRole }) {
  const memberCount = group.members?.length || 0;
  const teacherName = group.teacher 
    ? `${group.teacher.firstName} ${group.teacher.lastName}`
    : 'Unknown';

  return (
    <Link href={`/groups/${group.id}`}>
      <div className="card-interactive h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
            {memberCount} {memberCount === 1 ? 'student' : 'students'}
          </div>
        </div>
        
        {/* Group Name */}
        <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
          {group.name}
        </h3>
        
        {/* Description */}
        {group.description && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Join Code (Teachers only) */}
        {userRole === 'teacher' && group.joinCode && (
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1">Join Code</p>
            <p className="text-lg font-mono font-bold text-neutral-900 tracking-wider">
              {group.joinCode}
            </p>
          </div>
        )}
        
        {/* Footer */}
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
