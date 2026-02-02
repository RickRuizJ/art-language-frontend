'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI, worksheetAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Users, BookOpen, Plus, Trash2, UserMinus, Copy, Check } from 'lucide-react';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  
  // Add Students Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  
  // Copy join code state
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchGroup();
    }
  }, [params.id]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await groupAPI.getAll();
      const groups = response.data.data.groups;
      const foundGroup = groups.find(g => g.id === params.id);

      if (!foundGroup) {
        setError('Group not found');
        return;
      }

      setGroup(foundGroup);
    } catch (err) {
      console.error('Error fetching group:', err);
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      setModalLoading(true);
      const response = await groupAPI.getAvailableStudents();
      const allStudents = response.data.data.students;
      
      // Filter out students already in the group
      const currentMemberIds = group.members.map(m => m.studentId);
      const available = allStudents.filter(s => !currentMemberIds.includes(s.id));
      
      setAvailableStudents(available);
    } catch (err) {
      console.error('Error fetching students:', err);
      alert('Failed to load students');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setSelectedStudents([]);
    setSearchQuery('');
    fetchAvailableStudents();
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      setModalLoading(true);
      await groupAPI.addStudents(params.id, selectedStudents);
      
      // Refresh group data
      await fetchGroup();
      
      // Close modal and reset
      setShowAddModal(false);
      setSelectedStudents([]);
      setSearchQuery('');
      
      alert(`Successfully added ${selectedStudents.length} student(s)`);
    } catch (err) {
      console.error('Error adding students:', err);
      alert('Failed to add students');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return;

    try {
      await groupAPI.delete(params.id);
      router.push('/dashboard/teacher');
    } catch (err) {
      alert('Failed to delete group');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm('Remove this student from the group?')) return;

    try {
      await groupAPI.removeStudent(params.id, studentId);
      fetchGroup();
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  const handleCopyJoinCode = () => {
    if (!group?.joinCode) return;
    
    navigator.clipboard.writeText(group.joinCode);
    setCopied(true);
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter students based on search
  const filteredStudents = availableStudents.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-soft p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Error</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link href="/dashboard/teacher" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const isOwner = group.teacherId === user?.id;
  const memberCount = group.members?.length || 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link href="/dashboard/teacher" className="btn btn-ghost mt-1">
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">{group.name}</h1>
                {group.description && (
                  <p className="text-neutral-600 mt-2">{group.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.subject && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {group.subject}
                    </span>
                  )}
                  {group.gradeLevel && (
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                      {group.gradeLevel}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                    {memberCount} {memberCount === 1 ? 'student' : 'students'}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <button onClick={handleDeleteGroup} className="btn btn-ghost text-red-600">
                <Trash2 className="w-4 h-4" />
                Delete Group
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Join Code Card (Teacher only) */}
      {isOwner && group.joinCode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Group Join Code</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  Share this code with students so they can join this group
                </p>
                <div className="flex items-center gap-3">
                  <code className="text-3xl font-bold tracking-wider bg-white px-6 py-3 rounded-lg border-2 border-primary-300 text-primary-700">
                    {group.joinCode}
                  </code>
                  <button
                    onClick={handleCopyJoinCode}
                    className="btn btn-primary"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="text-6xl">🎓</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Students</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{memberCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Worksheets</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Avg. Progress</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">-</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-neutral-200">
          <nav className="flex gap-8">
            {[
              { key: 'students', label: 'Students', icon: Users },
              { key: 'worksheets', label: 'Worksheets', icon: BookOpen },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Students</h2>
              {isOwner && (
                <button 
                  onClick={handleOpenAddModal}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Students
                </button>
              )}
            </div>

            {memberCount === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                <p className="text-lg mb-2">No students yet</p>
                <p className="text-sm">Add students to start organizing your class</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {group.members.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {member.student?.firstName?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {member.student?.firstName} {member.student?.lastName}
                        </p>
                        <p className="text-sm text-neutral-600">{member.student?.email}</p>
                      </div>
                    </div>
                    
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveStudent(member.studentId)}
                        className="btn btn-ghost text-red-600"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Worksheets Tab */}
        {activeTab === 'worksheets' && (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Assigned Worksheets</h2>
              {isOwner && (
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Assign Worksheet
                </button>
              )}
            </div>

            <div className="p-12 text-center text-neutral-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <p className="text-lg mb-2">No worksheets assigned</p>
              <p className="text-sm">Assign worksheets to this group to track progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Students Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900">Add Students to {group.name}</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Select students to add to this group
              </p>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-neutral-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="input w-full"
              />
              {selectedStudents.length > 0 && (
                <p className="text-sm text-primary-600 mt-2">
                  {selectedStudents.length} student(s) selected
                </p>
              )}
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-neutral-600">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                  <p>No available students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleToggleStudent(student.id)}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {student.firstName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-neutral-600">{student.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline flex-1"
                disabled={modalLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudents}
                disabled={selectedStudents.length === 0 || modalLoading}
                className="btn btn-primary flex-1"
              >
                {modalLoading ? 'Adding...' : `Add ${selectedStudents.length || ''} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
