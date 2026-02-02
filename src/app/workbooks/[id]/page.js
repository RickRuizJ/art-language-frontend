'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { workbookAPI, worksheetAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Plus, Trash2, Eye, Edit } from 'lucide-react';

export default function WorkbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [workbook, setWorkbook] = useState(null);
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchWorkbook();
    }
  }, [params.id]);

  const fetchWorkbook = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await workbookAPI.getOne(params.id);
      const workbookData = response.data.data.workbook;
      setWorkbook(workbookData);

      // TODO: Backend should return worksheets with the workbook
      // For now, fetch all worksheets and filter later
      // In a real implementation, GET /api/workbooks/:id should return associated worksheets
      
      // Placeholder: Empty worksheets for now
      setWorksheets([]);
    } catch (err) {
      console.error('Error fetching workbook:', err);
      setError(err.response?.data?.message || 'Failed to load workbook');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workbook? This will NOT delete the worksheets, only the organization.')) return;

    try {
      await workbookAPI.delete(params.id);
      router.push('/dashboard/teacher');
    } catch (err) {
      alert('Failed to delete workbook');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading workbook...</p>
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

  if (!workbook) {
    return null;
  }

  const isOwner = workbook.createdBy === user?.id;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Link href="/workbooks" className="btn btn-ghost mt-1">
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">{workbook.title}</h1>
                {workbook.description && (
                  <p className="text-neutral-600 mt-2 max-w-2xl">{workbook.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {workbook.subject && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {workbook.subject}
                    </span>
                  )}
                  {workbook.gradeLevel && (
                    <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                      {workbook.gradeLevel}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    workbook.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {workbook.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                    {worksheets.length} {worksheets.length === 1 ? 'worksheet' : 'worksheets'}
                  </span>
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button className="btn btn-outline">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={handleDelete} className="btn btn-ghost text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Worksheets</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{worksheets.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Completed</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">In Progress</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Avg. Score</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">-</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Worksheets List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Worksheets in this Workbook</h2>
            {isOwner && (
              <Link href="/worksheets/upload" className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Worksheet
              </Link>
            )}
          </div>

          {worksheets.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No worksheets yet</h3>
              <p className="text-sm text-neutral-600 mb-6">
                Add worksheets to this workbook to organize your teaching materials
              </p>
              {isOwner && (
                <div className="flex gap-3 justify-center">
                  <Link href="/worksheets/upload" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Upload Worksheet
                  </Link>
                  <Link href="/worksheets/create" className="btn btn-outline">
                    Create from Scratch
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {worksheets.map((worksheet, index) => (
                <div
                  key={worksheet.id}
                  className="p-4 hover:bg-neutral-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">{worksheet.title}</h3>
                      {worksheet.description && (
                        <p className="text-sm text-neutral-600 mt-0.5">{worksheet.description}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        {worksheet.subject && (
                          <span className="text-xs text-neutral-500">{worksheet.subject}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/worksheets/${worksheet.id}`}
                      className="btn btn-ghost"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    {isOwner && (
                      <button className="btn btn-ghost text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
