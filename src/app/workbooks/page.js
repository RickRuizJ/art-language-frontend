'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { workbookAPI } from '@/lib/api';
import Link from 'next/link';

export default function WorkbooksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    loadWorkbooks();
  }, [filter]);

  const loadWorkbooks = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await workbookAPI.getAll(params);
      setWorkbooks(response.data.data.workbooks);
    } catch (error) {
      console.error('Error loading workbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workbook?')) return;

    try {
      await workbookAPI.delete(id);
      loadWorkbooks();
    } catch (error) {
      console.error('Error deleting workbook:', error);
      alert('Failed to delete workbook');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await workbookAPI.togglePublish(id);
      loadWorkbooks();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update workbook status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-custom py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Workbooks</h1>
            <p className="text-neutral-600 mt-1 text-sm md:text-base">
              {user?.role === 'teacher' 
                ? 'Organize worksheets into learning paths' 
                : 'Browse available course materials'}
            </p>
          </div>
          {user?.role === 'teacher' && (
            <Link href="/workbooks/create" className="btn btn-primary w-full sm:w-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Workbook
            </Link>
          )}
        </div>

        {/* Filters */}
        {user?.role === 'teacher' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} whitespace-nowrap`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-outline'} whitespace-nowrap`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-outline'} whitespace-nowrap`}
            >
              Drafts
            </button>
          </div>
        )}

        {/* Workbooks Grid */}
        {workbooks.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No workbooks yet</h3>
            <p className="mt-2 text-neutral-600">
              {user?.role === 'teacher'
                ? 'Create your first workbook to organize worksheets into learning paths'
                : 'No workbooks have been published yet'}
            </p>
            {user?.role === 'teacher' && (
              <Link href="/workbooks/create" className="btn btn-primary mt-6 inline-flex">
                Create Workbook
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {workbooks.map((workbook) => (
              <div key={workbook.id} className="card group hover:shadow-large transition-all duration-300">
                {/* Cover Image */}
                <div className="relative aspect-video bg-gradient-primary rounded-xl mb-4 overflow-hidden">
                  {workbook.coverImageUrl ? (
                    <img 
                      src={workbook.coverImageUrl} 
                      alt={workbook.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${workbook.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                      {workbook.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <Link href={`/workbooks/${workbook.id}`}>
                  <h3 className="font-semibold text-lg text-neutral-900 hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                    {workbook.title}
                  </h3>
                </Link>

                {workbook.description && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {workbook.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 mb-4">
                  {workbook.subject && (
                    <span className="badge badge-info">{workbook.subject}</span>
                  )}
                  {workbook.gradeLevel && (
                    <span className="badge badge-warning">{workbook.gradeLevel}</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-1 text-sm text-neutral-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{workbook.worksheets?.length || 0} worksheets</span>
                  </div>

                  {user?.role === 'teacher' && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleTogglePublish(workbook.id);
                        }}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        title={workbook.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <Link
                        href={`/workbooks/${workbook.id}/edit`}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(workbook.id);
                        }}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
