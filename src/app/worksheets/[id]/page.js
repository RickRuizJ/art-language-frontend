'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Download } from 'lucide-react';

export default function WorksheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [worksheet, setWorksheet] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchWorksheet();
    }
  }, [params.id]);

  const fetchWorksheet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch worksheet data
      const response = await worksheetAPI.getOne(params.id);
      const worksheetData = response.data.data.worksheet;
      setWorksheet(worksheetData);

      // If it has a file (PDF/image), fetch the base64 data
      // Check if this is a file upload (no google_embed question)
      const hasGoogleEmbed = worksheetData.questions?.some(q => q.type === 'google_embed');
      
      if (!hasGoogleEmbed) {
        // It's a file upload, fetch the file
        try {
          const fileResponse = await worksheetAPI.getFile(params.id);
          setFileData(fileResponse.data.data);
        } catch (fileErr) {
          console.warn('No file found for this worksheet:', fileErr);
        }
      }
    } catch (err) {
      console.error('Error fetching worksheet:', err);
      setError(err.response?.data?.message || 'Failed to load worksheet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this worksheet?')) return;

    try {
      await worksheetAPI.delete(params.id);
      router.push('/dashboard/teacher');
    } catch (err) {
      alert('Failed to delete worksheet');
    }
  };

  const handleTogglePublish = async () => {
    try {
      await worksheetAPI.togglePublish(params.id);
      setWorksheet({ ...worksheet, isPublished: !worksheet.isPublished });
    } catch (err) {
      alert('Failed to toggle publish status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading worksheet...</p>
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

  if (!worksheet) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Worksheet not found</p>
      </div>
    );
  }

  // Check if this is a Google embed
  const googleEmbed = worksheet.questions?.find(q => q.type === 'google_embed');
  const isTeacher = user?.role === 'teacher';
  const isOwner = worksheet.createdBy === user?.id;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={isTeacher ? '/dashboard/teacher' : '/dashboard/student'}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{worksheet.title}</h1>
                {worksheet.description && (
                  <p className="text-sm text-neutral-600 mt-1">{worksheet.description}</p>
                )}
              </div>
            </div>

            {/* Action Buttons (Teacher only) */}
            {isTeacher && isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePublish}
                  className={`btn ${worksheet.isPublished ? 'btn-outline' : 'btn-primary'}`}
                >
                  {worksheet.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Publish
                    </>
                  )}
                </button>

                <Link
                  href={`/worksheets/${worksheet.id}/edit`}
                  className="btn btn-outline"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>

                <button onClick={handleDelete} className="btn btn-ghost text-red-600">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2">
          {worksheet.subject && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {worksheet.subject}
            </span>
          )}
          {worksheet.gradeLevel && (
            <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
              {worksheet.gradeLevel}
            </span>
          )}
          {worksheet.difficulty && (
            <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm capitalize">
              {worksheet.difficulty}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm ${
            worksheet.isPublished 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {worksheet.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {/* Google Embed */}
          {googleEmbed && (
            <div className="w-full" style={{ minHeight: '600px' }}>
              <iframe
                src={googleEmbed.embedUrl}
                className="w-full h-full border-0"
                style={{ minHeight: '600px' }}
                title={worksheet.title}
                allowFullScreen
              />
            </div>
          )}

          {/* Uploaded File (PDF/Image) */}
          {fileData && (
            <div className="w-full">
              {fileData.mimeType === 'application/pdf' ? (
                <iframe
                  src={fileData.dataUrl}
                  className="w-full border-0"
                  style={{ minHeight: '800px' }}
                  title={worksheet.title}
                />
              ) : fileData.mimeType?.startsWith('image/') ? (
                <img
                  src={fileData.dataUrl}
                  alt={worksheet.title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-neutral-600 mb-4">
                    {fileData.originalFilename}
                  </p>
                  <a
                    href={fileData.dataUrl}
                    download={fileData.originalFilename}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          )}

          {/* No content */}
          {!googleEmbed && !fileData && (
            <div className="p-12 text-center text-neutral-500">
              <p>No content available for this worksheet.</p>
              {isTeacher && isOwner && (
                <Link href={`/worksheets/${worksheet.id}/edit`} className="btn btn-primary mt-4">
                  Add Content
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Interactive Questions (if any) */}
        {worksheet.questions && worksheet.questions.length > 0 && !googleEmbed && (
          <div className="mt-6 bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Questions</h2>
            {worksheet.questions.map((question, index) => (
              <div key={index} className="mb-4 p-4 bg-neutral-50 rounded-lg">
                <p className="font-medium text-neutral-900 mb-2">
                  {index + 1}. {question.text || 'Question'}
                </p>
                {question.type === 'multiple_choice' && question.options && (
                  <div className="space-y-2 ml-4">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          id={`q${index}-opt${optIndex}`}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`q${index}-opt${optIndex}`} className="text-neutral-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {question.type === 'short_answer' && (
                  <input
                    type="text"
                    className="input w-full mt-2"
                    placeholder="Your answer..."
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
