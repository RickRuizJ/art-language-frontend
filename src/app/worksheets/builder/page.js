'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI } from '@/lib/api';
import { Plus, X, Save, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
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
    case 'multiple_choice':
      return { ...base, options: ['', '', '', ''], correctAnswer: '' };

    case 'fill_blank':
      return { ...base, correctAnswer: '' };

    case 'matching':
      return { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] };

    case 'true_false':
      return { ...base, correctAnswer: '' };

    case 'short_answer':
      return { ...base, sampleAnswer: '' };

    default:
      return base;
  }
}

/* PAGE WRAPPER (FIX PARA NEXT 14) */

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading worksheet builder...</p>
        </div>
      }
    >
      <WorksheetBuilderPage />
    </Suspense>
  );
}

/* MAIN COMPONENT */

function WorksheetBuilderPage() {
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
    maxAttempts: 1, // Sprint 0: configurable attempts (0 = unlimited)
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
        maxAttempts: w.maxAttempts ?? 1,
      });

      setQuestions(
        (w.questions || []).map(q => ({
          ...q,
          id: q.id || q._id || `q${Date.now()}${Math.random()}`,
        }))
      );

    } catch {
      setError('Failed to load worksheet.');
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
    setQuestions(qs =>
      qs.map(q => (q.id === id ? { ...q, [field]: value } : q))
    );
  }

  function updateOption(id, index, value) {
    setQuestions(qs =>
      qs.map(q => {
        if (q.id !== id) return q;

        const options = [...q.options];
        options[index] = value;

        return { ...q, options };
      })
    );
  }

  function updatePair(id, index, side, value) {
    setQuestions(qs =>
      qs.map(q => {
        if (q.id !== id) return q;

        const pairs = q.pairs.map((p, i) =>
          i === index ? { ...p, [side]: value } : p
        );

        return { ...q, pairs };
      })
    );
  }

  function addPair(id) {
    setQuestions(qs =>
      qs.map(q =>
        q.id === id
          ? { ...q, pairs: [...q.pairs, { left: '', right: '' }] }
          : q
      )
    );
  }

  function removePair(id, index) {
    setQuestions(qs =>
      qs.map(q =>
        q.id === id
          ? { ...q, pairs: q.pairs.filter((_, i) => i !== index) }
          : q
      )
    );
  }

  function moveQuestion(index, direction) {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    setQuestions(updated);
  }

  async function handleSave(e) {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title required');
      return;
    }

    if (questions.length === 0) {
      setError('Add at least one question');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        questions: questions.map(({ id, ...q }) => q),
      };

      if (editId) {
        await worksheetAPI.update(editId, payload);
        setSuccess('Worksheet updated');
      } else {
        await worksheetAPI.create(payload);
        setSuccess('Worksheet created');
      }

      setTimeout(() => router.push('/dashboard/teacher'), 1200);

    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingWS) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">

      {/* HEADER */}

      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container-custom py-4 flex justify-between items-center">

          <Link href="/dashboard/teacher" className="btn btn-ghost">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Worksheet'}
          </button>

        </div>
      </header>

      {/* CONTENT */}

      <div className="container-custom py-8 max-w-4xl">

        <h1 className="text-4xl font-bold mb-8">
          {editId ? 'Edit Worksheet' : 'Create Worksheet'}
        </h1>

        {/* BASIC INFO */}

        <div className="card mb-8">

          <h2 className="text-2xl font-bold mb-6">
            Basic Information
          </h2>

          <input
            className="input mb-4"
            placeholder="Worksheet title"
            value={formData.title}
            onChange={e =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <textarea
            className="input"
            placeholder="Description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <label className="block mt-4 text-sm font-medium text-neutral-700">
            Attempts allowed
          </label>
          <select
            className="input"
            value={formData.maxAttempts}
            onChange={e =>
              setFormData({ ...formData, maxAttempts: parseInt(e.target.value, 10) })
            }
          >
            <option value={1}>1 attempt</option>
            <option value={2}>2 attempts</option>
            <option value={3}>3 attempts</option>
            <option value={0}>Unlimited</option>
          </select>

        </div>

        {/* QUESTIONS */}

        <div className="mb-4 flex justify-between items-center">

          <h2 className="text-2xl font-bold">
            Questions ({questions.length})
          </h2>

          <div className="flex gap-2 flex-wrap">
            {QUESTION_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => addQuestion(t.value)}
                className="btn btn-outline text-sm"
              >
                <Plus className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

        </div>

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

      </div>
    </div>
  );
}

/* QUESTION EDITOR */

function QuestionEditor({
  question: q,
  index,
  total,
  onUpdate,
  onUpdateOption,
  onUpdatePair,
  onAddPair,
  onRemovePair,
  onRemove,
  onMove,
}) {

  return (
    <div className="card">

      <div className="flex justify-between mb-4">

        <h3 className="font-bold">
          Question {index + 1}
        </h3>

        <div className="flex gap-1">

          <button
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            className="btn btn-ghost"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            className="btn btn-ghost"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => onRemove(q.id)}
            className="btn btn-ghost text-red-500"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </div>

      <textarea
        value={q.question}
        onChange={e => onUpdate(q.id, 'question', e.target.value)}
        className="input"
        placeholder="Question text"
      />

    </div>
  );
}