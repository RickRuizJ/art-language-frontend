'use client';

import { useState, useEffect } from 'react';
import { worksheetAPI, assignmentAPI } from '@/lib/api';
import { X, Search, Calendar, AlertCircle, Loader2, Check } from 'lucide-react';

export default function AssignWorksheetModal({ groupId, groupName, onClose, onSuccess }) {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    fetchWorksheets();
  }, []);

  const fetchWorksheets = async () => {
    try {
      setLoading(true);
      const response = await worksheetAPI.getAll();
      setWorksheets(response.data.data.worksheets || []);
    } catch (err) {
      console.error('Error fetching worksheets:', err);
      setError('Failed to load worksheets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedWorksheet) {
      setError('Please select a worksheet');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      await assignmentAPI.assign(groupId, {
        worksheetId: selectedWorksheet.id,
        dueDate: dueDate || null,
        instructions: instructions.trim() || null
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error assigning worksheet:', err);
      setError(err.response?.data?.message || 'Failed to assign worksheet');
    } finally {
      setAssigning(false);
    }
  };

  const filteredWorksheets = worksheets.filter(w => {
    const query = searchQuery.toLowerCase();
    return (
      w.title?.toLowerCase().includes(query) ||
      w.subject?.toLowerCase().includes(query) ||
      w.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Assign Worksheet to {groupName}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Select a worksheet to assign to this group
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worksheets..."
              className="input w-full pl-10"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-600">Loading worksheets...</p>
            </div>
          )}

          {/* Worksheet List */}
          {!loading && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredWorksheets.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>No worksheets found</p>
                  <p className="text-sm mt-1">
                    {searchQuery ? 'Try a different search' : 'Create a worksheet first'}
                  </p>
                </div>
              ) : (
                filteredWorksheets.map((worksheet) => (
                  <button
                    key={worksheet.id}
                    onClick={() => setSelectedWorksheet(worksheet)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedWorksheet?.id === worksheet.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900">{worksheet.title}</h4>
                        {worksheet.description && (
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-1">
                            {worksheet.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                          {worksheet.subject && <span>📚 {worksheet.subject}</span>}
                          {worksheet.gradeLevel && <span>🎓 {worksheet.gradeLevel}</span>}
                          {worksheet.estimatedTime && <span>⏱️ {worksheet.estimatedTime} min</span>}
                        </div>
                      </div>
                      {selectedWorksheet?.id === worksheet.id && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Due Date & Instructions */}
          {selectedWorksheet && (
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Due Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input w-full pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Instructions (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Add special instructions for students..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={assigning}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedWorksheet || assigning}
            className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Assign Worksheet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
