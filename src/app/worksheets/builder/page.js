'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI } from '@/lib/api';
import { Plus, X, Save, ArrowLeft, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import Link from 'next/link';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
];

function makeQuestion(type) {
  const base = { id: `q${Date.now()}${Math.random()}`, type, question: '', points: 10, explanation: '' };
  switch (type) {
    case 'multiple_choice': return { ...base, options: ['', '', '', ''], correctAnswer: '' };
    case 'fill_blank':      return { ...base, correctAnswer: '' };
    case 'matching':        return { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] };
    case 'true_false':      return { ...base, correctAnswer: '' };
    case 'short_answer':    return { ...base, sampleAnswer: '' };
    default:                return base;
  }
}

export default function WorksheetBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const editId = searchParams.get('id');

  const [saving, setSaving] = useState(false);
  const [loadingWS, setLoadingWS] = useState(!!editId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    difficulty: 'beginner',
    estimatedTime: 30,
    autoGrade: true,
    passScore: 70,
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'teacher') {
      router.push('/login');
      return;
    }
    if (editId) loadWorksheet(editId);
  }, [user, authLoading, editId]);

  async function loadWorksheet(id) {
    setLoadingWS(true);
    try {
      const res = await worksheetAPI.getOne(id);
      const w = res.data.data?.worksheet || res.data.data || res.data;
      setFormData({
        title: w.title || '',
        description: w.description || '',
        subject: w.subject || '',
        gradeLevel: w.gradeLevel || '',
        difficulty: w.difficulty || 'beginner',
        estimatedTime: w.estimatedTime || 30,
        autoGrade: w.autoGrade !== false,
        passScore: w.passScore || 70,
      });
      setQuestions((w.questions || []).map(q => ({ ...q, id: q.id || q._id || `q${Date.now()}${Math.random()}` })));
    } catch (err) {
      setError('Failed to load worksheet for editing.');
    } finally {
      setLoadingWS(false);
    }
  }

  function addQuestion(type) {
    setQuestions(qs => [...qs, makeQuestion(type)]);
  }

  function removeQuestion(id) {
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  function updateQuestion(id, field, value) {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, [field]: value } : q));
  }

  function updateOption(id, i, value) {
    setQuestions(qs => qs.map(q => {
      if (q.id !== id) return q;
      const options = [...q.options];
      options[i] = value;
      return { ...q, options };
    }));
  }

  function updatePair(id, i, side, value) {
    setQuestions(qs => qs.map(q => {
      if (q.id !== id) return q;
      const pairs = q.pairs.map((p, pi) => pi === i ? { ...p, [side]: value } : p);
      return { ...q, pairs };
    }));
  }

  function addPair(id) {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, pairs: [...q.pairs, { left: '', right: '' }] } : q));
  }

  function removePair(id, i) {
    setQuestions(qs => qs.map(q => q.id !== id ? q : { ...q, pairs: q.pairs.filter((_, pi) => pi !== i) }));
  }

  function moveQuestion(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const qs = [...questions];
    [qs[i], qs[j]] = [qs[j], qs[i]];
    setQuestions(qs);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.title.trim()) { setError('Title is required.'); return; }
    if (questions.length === 0) { setError('Add at least one question.'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, questions: questions.map(({ id, ...q }) => q) };
      if (editId) {
        await worksheetAPI.update(editId, payload);
        setSuccess('Worksheet updated!');
      } else {
        await worksheetAPI.create(payload);
        setSuccess('Worksheet created!');
      }
      setTimeout(() => router.push('/dashboard/teacher'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save worksheet.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingWS) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
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
            <Link href="/dashboard/teacher" className="btn btn-ghost">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                <Save className="w-5 h-5" />
                {saving ? 'Saving…' : editId ? 'Update Worksheet' : 'Save Worksheet'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">
          {editId ? 'Edit Worksheet' : 'Create New Worksheet'}
        </h1>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Title *</label>
                <input
                  className="input"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Present Simple – Food Vocabulary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                <textarea
                  className="input min-h-[90px]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will students practice in this worksheet?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
                  <input className="input" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. English" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Grade Level</label>
                  <input className="input" value={formData.gradeLevel} onChange={e => setFormData({ ...formData, gradeLevel: e.target.value })} placeholder="e.g. A2 / 5th Grade" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
                  <select className="input" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Time (minutes)</label>
                  <input type="number" className="input" min="1" value={formData.estimatedTime} onChange={e => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Pass Score (%)</label>
                  <input type="number" className="input" min="0" max="100" value={formData.passScore} onChange={e => setFormData({ ...formData, passScore: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoGrade"
                  checked={formData.autoGrade}
                  onChange={e => setFormData({ ...formData, autoGrade: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <label htmlFor="autoGrade" className="text-sm font-medium text-neutral-700">
                  Enable automatic grading for objective questions
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Questions ({questions.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => addQuestion(t.value)}
                    className="btn btn-outline text-sm py-2"
                  >
                    <Plus className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-neutral-500 mb-4">No questions yet — add one above</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <QuestionEditor
                    key={q.id}
                    question={q}
                    index={i}
                    total={questions.length}
                    onUpdate={updateQuestion}
                    onUpdateOption={updateOption}
                    onUpdatePair={updatePair}
                    onAddPair={addPair}
                    onRemovePair={removePair}
                    onRemove={removeQuestion}
                    onMove={moveQuestion}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-lg">
              <Save className="w-5 h-5" />
              {saving ? 'Saving…' : editId ? 'Update Worksheet' : 'Save Worksheet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Question Editor Card ─── */
function QuestionEditor({ question: q, index, total, onUpdate, onUpdateOption, onUpdatePair, onAddPair, onRemovePair, onRemove, onMove }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          <h3 className="text-lg font-display font-bold text-neutral-900">
            {QUESTION_TYPES.find(t => t.value === q.type)?.label}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(index, -1)} disabled={index === 0} className="btn btn-ghost p-2" title="Move up">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1} className="btn btn-ghost p-2" title="Move down">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={() => onRemove(q.id)} className="btn btn-ghost p-2 text-red-500 hover:bg-red-50" title="Remove">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Points */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Question / Prompt *</label>
            <textarea
              value={q.question}
              onChange={e => onUpdate(q.id, 'question', e.target.value)}
              className="input min-h-[72px]"
              placeholder="Enter your question here…"
            />
          </div>
          <div className="w-24 flex-shrink-0">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Points</label>
            <input
              type="number"
              min="1"
              value={q.points}
              onChange={e => onUpdate(q.id, 'points', parseInt(e.target.value) || 1)}
              className="input text-center"
            />
          </div>
        </div>

        {/* Type-specific fields */}
        {q.type === 'multiple_choice' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700">Options</label>
            {q.options.map((opt, i) => (
              <input
                key={i}
                type="text"
                value={opt}
                onChange={e => onUpdateOption(q.id, i, e.target.value)}
                className="input"
                placeholder={`Option ${i + 1}`}
              />
            ))}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Correct Answer</label>
              <select
                value={q.correctAnswer}
                onChange={e => onUpdate(q.id, 'correctAnswer', e.target.value)}
                className="input"
              >
                <option value="">Select correct answer…</option>
                {q.options.filter(Boolean).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {q.type === 'fill_blank' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={q.correctAnswer}
              onChange={e => onUpdate(q.id, 'correctAnswer', e.target.value)}
              className="input"
              placeholder="The exact word or phrase students must fill in"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Tip: use ___ in your question to show where the blank is.
            </p>
          </div>
        )}

        {q.type === 'matching' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Pairs to Match</label>
            <div className="space-y-2">
              {q.pairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    className="input flex-1"
                    value={pair.left}
                    onChange={e => onUpdatePair(q.id, i, 'left', e.target.value)}
                    placeholder={`Left ${i + 1} (term)`}
                  />
                  <span className="text-neutral-400 font-bold">↔</span>
                  <input
                    className="input flex-1"
                    value={pair.right}
                    onChange={e => onUpdatePair(q.id, i, 'right', e.target.value)}
                    placeholder={`Right ${i + 1} (match)`}
                  />
                  {q.pairs.length > 2 && (
                    <button
                      onClick={() => onRemovePair(q.id, i)}
                      className="btn btn-ghost p-2 text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onAddPair(q.id)} className="btn btn-ghost mt-2 text-sm">
              <Plus className="w-4 h-4" /> Add pair
            </button>
          </div>
        )}

        {q.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Correct Answer</label>
            <select
              value={q.correctAnswer}
              onChange={e => onUpdate(q.id, 'correctAnswer', e.target.value)}
              className="input"
            >
              <option value="">Select…</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        )}

        {q.type === 'short_answer' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sample / Model Answer <span className="text-neutral-400 font-normal">(for teacher reference)</span>
            </label>
            <textarea
              value={q.sampleAnswer || ''}
              onChange={e => onUpdate(q.id, 'sampleAnswer', e.target.value)}
              className="input min-h-[72px]"
              placeholder="Write a model answer here for reference when grading…"
            />
          </div>
        )}

        {/* Optional explanation */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Explanation <span className="text-neutral-400 font-normal">(shown after answer)</span>
          </label>
          <input
            type="text"
            value={q.explanation || ''}
            onChange={e => onUpdate(q.id, 'explanation', e.target.value)}
            className="input"
            placeholder="Optional: explain why this is the correct answer"
          />
        </div>
      </div>
    </div>
  );
}
