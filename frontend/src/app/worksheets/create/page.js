'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { worksheetAPI } from '@/lib/api';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
];

export default function CreateWorksheetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      explanation: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateQuestionOption = (id, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setLoading(true);
    
    try {
      await worksheetAPI.create({
        ...formData,
        questions,
      });
      
      alert('Worksheet created successfully!');
      router.push('/dashboard/teacher');
    } catch (error) {
      console.error('Error creating worksheet:', error);
      alert('Failed to create worksheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/teacher" className="btn btn-ghost">
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Worksheet'}
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-4xl">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-8">
          Create New Worksheet
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
              Basic Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="e.g., Spanish Vocabulary Quiz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="What will students learn from this worksheet?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    placeholder="e.g., Spanish"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="input"
                    placeholder="e.g., 5th Grade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                    className="input"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Pass Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passScore}
                    onChange={(e) => setFormData({ ...formData, passScore: parseInt(e.target.value) })}
                    className="input"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoGrade"
                  checked={formData.autoGrade}
                  onChange={(e) => setFormData({ ...formData, autoGrade: e.target.checked })}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-neutral-600 mb-4">No questions added yet</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={updateQuestion}
                    onUpdateOption={updateQuestionOption}
                    onRemove={removeQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionEditor({ question, index, onUpdate, onUpdateOption, onRemove }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-display font-bold text-neutral-900">
          Question {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => onRemove(question.id)}
          className="text-red-600 hover:text-red-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Question Type
            </label>
            <select
              value={question.type}
              onChange={(e) => onUpdate(question.id, 'type', e.target.value)}
              className="input"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => onUpdate(question.id, 'points', parseInt(e.target.value))}
              className="input"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Question Text
          </label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate(question.id, 'question', e.target.value)}
            className="input min-h-[80px]"
            placeholder="Enter your question here..."
          />
        </div>

        {question.type === 'multiple_choice' && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {question.options.map((option, i) => (
                  <input
                    key={i}
                    type="text"
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, i, e.target.value)}
                    className="input"
                    placeholder={`Option ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Correct Answer
              </label>
              <select
                value={question.correctAnswer}
                onChange={(e) => onUpdate(question.id, 'correctAnswer', e.target.value)}
                className="input"
              >
                <option value="">Select correct answer...</option>
                {question.options.map((option, i) => (
                  <option key={i} value={option}>{option || `Option ${i + 1}`}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {(question.type === 'fill_blank' || question.type === 'short_answer') && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => onUpdate(question.id, 'correctAnswer', e.target.value)}
              className="input"
              placeholder="Enter the correct answer..."
            />
          </div>
        )}

        {question.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Correct Answer
            </label>
            <select
              value={question.correctAnswer}
              onChange={(e) => onUpdate(question.id, 'correctAnswer', e.target.value)}
              className="input"
            >
              <option value="">Select...</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
