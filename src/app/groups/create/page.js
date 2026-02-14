'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';

export default function CreateGroupPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await groupAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      const newGroup = response.data.data.group;
      
      // Redirect to the new group's page
      router.push(`/groups/${newGroup.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-teachers
  if (user && user.role !== 'teacher' && user.role !== 'admin') {
    router.push('/dashboard/student');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/teacher"
              className="btn btn-ghost inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Create New Group
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Organize your students into groups
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="space-y-6">
            {/* Group Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="e.g., Math Class - Period 1"
                required
                autoFocus
                maxLength={100}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Choose a descriptive name for your group
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input w-full resize-none"
                placeholder="e.g., 3rd grade mathematics for fall semester"
                maxLength={500}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Add details about this group, grade level, or subject
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• A unique join code will be generated</li>
                <li>• Share the code with your students</li>
                <li>• Students can join using the code</li>
                <li>• You can add students manually as well</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-200">
            <Link
              href="/dashboard/teacher"
              className="btn btn-outline flex-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 card bg-neutral-50 border-neutral-200">
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">
            💡 Tips for organizing groups
          </h4>
          <ul className="text-sm text-neutral-700 space-y-2">
            <li>
              <strong>By Class:</strong> Create separate groups for each class period or section
            </li>
            <li>
              <strong>By Subject:</strong> Group students by subject area (Math, Science, etc.)
            </li>
            <li>
              <strong>By Level:</strong> Organize by grade level or skill level
            </li>
            <li>
              <strong>By Project:</strong> Create temporary groups for specific projects or units
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
