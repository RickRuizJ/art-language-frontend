'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, workbookAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditWorksheetPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [worksheet, setWorksheet] = useState(null);
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    workbookId: '',
    instructions: '',
    type: 'pdf',
  });

  useEffect(() => {
    if (params.id) {
      fetchWorksheet();
      fetchWorkbooks();
    }
  }, [params.id]);

  const fetchWorksheet = async () => {
    try {
      setLoading(true);
      const response = await worksheetAPI.getOne(params.id);
      const ws = response.data.data.worksheet;
      
      setWorksheet(ws);
      setFormData({
        title: ws.title || '',
        description: ws.description || '',
        subject: ws.subject || '',
        gradeLevel: ws.gradeLevel || '',
        workbookId: ws.workbookId || '',
        instructions: ws.instructions || '',
        type: ws.type || 'pdf',
      });
    } catch (err) {
      console.error('Error fetching worksheet:', err);
      setError('Failed to load worksheet');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkbooks = async () => {
    try {
      const response = await workbookAPI.getAll();
      setWorkbooks(response.data.data.workbooks || []);
    } catch (err) {
      console.error('Error fetching workbooks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await worksheetAPI.update(params.id, formData);
      
      alert('Worksheet updated successfully!');
      router.push(`/worksheets/${params.id}`);
    } catch (err) {
      console.error('Error updating worksheet:', err);
      alert('Failed to update worksheet');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
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
    return null;
  }

  // Check if user owns this worksheet
  const isOwner = worksheet.createdBy === user?.id;

  if (!isOwner && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-soft p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Access Denied</h2>
          <p className="text-neutral-600 mb-6">You don't have permission to edit this worksheet</p>
          <Link href={`/worksheets/${params.id}`} className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Worksheet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/worksheets/${params.id}`}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Edit Worksheet</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  Update worksheet details
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input w-full"
                required
                placeholder="Enter worksheet title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input w-full resize-none"
                placeholder="Enter a description for this worksheet"
              />
            </div>

            {/* Subject and Grade Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="">Select subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Grade Level
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="">Select grade</option>
                  <option value="Kindergarten">Kindergarten</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={`Grade ${grade}`}>
                      Grade {grade}
                    </option>
                  ))}
                  <option value="University">University</option>
                </select>
              </div>
            </div>

            {/* Workbook */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Workbook
              </label>
              <select
                name="workbookId"
                value={formData.workbookId}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Select workbook (optional)</option>
                {workbooks.map(wb => (
                  <option key={wb.id} value={wb.id}>
                    {wb.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Organize this worksheet into a workbook
              </p>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="input w-full resize-none"
                placeholder="Add instructions for students (optional)"
              />
            </div>

            {/* Type (read-only) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Worksheet Type
              </label>
              <input
                type="text"
                value={formData.type.toUpperCase()}
                className="input w-full bg-neutral-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-neutral-500 mt-1">
                The file type cannot be changed
              </p>
            </div>

            {/* File Info (read-only) */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Current File</h3>
              {worksheet.googleDocUrl ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Google Document</span>
                  <a
                    href={worksheet.googleDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <p className="text-sm text-neutral-600">
                  {worksheet.fileUpload?.originalFilename || 'Uploaded file'}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                To change the file, please create a new worksheet
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-200">
            <Link
              href={`/worksheets/${params.id}`}
              className="btn btn-outline flex-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
