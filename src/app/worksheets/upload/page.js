'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { worksheetAPI, workbookAPI } from '@/lib/api';
import Link from 'next/link';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = '.pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.webp';
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png','image/jpeg','image/gif','image/webp',
];
const MAX_SIZE_MB = 10;
const GOOGLE_PATTERN = /^https:\/\/(docs\.google\.com|sheets\.google\.com|slides\.google\.com)\//i;

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function detectGoogleType(url) {
  if (url.includes('sheets.google.com')) return 'sheet';
  if (url.includes('slides.google.com')) return 'slide';
  return 'doc';
}
function googleLabel(t) {
  return { doc: 'Google Doc', sheet: 'Google Sheet', slide: 'Google Slide' }[t];
}

// ─── PAGE ───────────────────────────────────────────────────────────────────
export default function UploadWorksheetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // tabs
  const [tab, setTab] = useState('file'); // 'file' | 'google'

  // shared metadata
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject]       = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [workbookId, setWorkbookId] = useState('');

  // file state
  const [file, setFile]       = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging]   = useState(false);

  // google state
  const [googleUrl, setGoogleUrl]   = useState('');
  const [googleError, setGoogleError] = useState('');
  const [detectedType, setDetectedType] = useState(null);

  // workbooks dropdown (lazy-loaded)
  const [workbooks, setWorkbooks]           = useState([]);
  const [workbooksLoaded, setWorkbooksLoaded] = useState(false);

  // submit
  const [loading, setLoading]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── lazy-load workbooks on dropdown focus ─────────────────────────────────
  const ensureWorkbooks = async () => {
    if (workbooksLoaded) return;
    try {
      const res = await workbookAPI.getAll();
      setWorkbooks(res.data.data.workbooks || []);
    } catch (e) { console.error(e); }
    finally { setWorkbooksLoaded(true); }
  };

  // ── file validation ───────────────────────────────────────────────────────
  const processFile = (f) => {
    setFileError('');
    if (!f) { setFile(null); return; }
    if (!ALLOWED_MIMES.includes(f.type)) {
      setFileError('Tipo no permitido. Permitidos: PDF, DOCX, DOC, PNG, JPG, GIF, WEBP');
      setFile(null); return;
    }
    if (f.size > MAX_SIZE_MB * 1048576) {
      setFileError(`Archivo muy grande. Máximo ${MAX_SIZE_MB} MB`);
      setFile(null); return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleFileInput = (e) => processFile(e.target.files?.[0]);

  // drag & drop handlers
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); };

  // ── google URL live validation ────────────────────────────────────────────
  const handleGoogleChange = (val) => {
    setGoogleUrl(val);
    setGoogleError('');
    setDetectedType(null);
    if (!val.trim()) return;
    if (!GOOGLE_PATTERN.test(val.trim())) {
      setGoogleError('No es un link válido de Google');
    } else {
      const t = detectGoogleType(val.trim());
      setDetectedType(t);
      if (!title) setTitle(`Link – ${googleLabel(t)}`);
    }
  };

  // ── submit: upload file ───────────────────────────────────────────────────
  const handleUploadSubmit = async () => {
    setSubmitError('');
    if (!file)          { setSubmitError('Por favor selecciona un archivo.'); return; }
    if (!title.trim())  { setSubmitError('El título es obligatorio.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title.trim());
      if (description.trim()) fd.append('description', description.trim());
      if (subject.trim())     fd.append('subject', subject.trim());
      if (gradeLevel.trim())  fd.append('gradeLevel', gradeLevel.trim());
      if (workbookId)         fd.append('workbookId', workbookId);

      await worksheetAPI.upload(fd);
      router.push('/dashboard/teacher');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Upload fallido. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  // ── submit: google link ───────────────────────────────────────────────────
  const handleGoogleSubmit = async () => {
    setSubmitError('');
    if (!googleUrl.trim())                     { setSubmitError('Por favor pega un link de Google.'); return; }
    if (!GOOGLE_PATTERN.test(googleUrl.trim())) { setSubmitError('Link de Google inválido.'); return; }
    if (!title.trim())                         { setSubmitError('El título es obligatorio.'); return; }

    setLoading(true);
    try {
      await worksheetAPI.saveGoogleLink({
        title: title.trim(),
        url: googleUrl.trim(),
        description: description.trim() || undefined,
        subject: subject.trim() || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
        workbookId: workbookId || undefined,
      });
      router.push('/dashboard/teacher');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'No se pudo guardar el link.');
    } finally { setLoading(false); }
  };

  const handleSave = () => (tab === 'file') ? handleUploadSubmit() : handleGoogleSubmit();

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* sticky header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/teacher" className="btn btn-ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </Link>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              {loading ? 'Guardando…' : 'Guardar Worksheet'}
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Agregar Worksheet</h1>

        {/* ── TAB SWITCHER ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-soft p-1.5 mb-6 flex gap-1.5">
          {[
            { key: 'file',   icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', label: 'Subir Archivo' },
            { key: 'google', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', label: 'Link de Google' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                tab === key ? 'bg-primary-100 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon}/>
              </svg>
              {label}
            </button>
          ))}
        </div>

        {/* ── GLOBAL ERROR ──────────────────────────────────────────────── */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-6">{submitError}</div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: UPLOAD FILE
            ════════════════════════════════════════════════════════════════ */}
        {tab === 'file' && (
          <div className="space-y-6">
            <div className="card">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Archivo <span className="text-red-500">*</span>
                <span className="text-neutral-400 font-normal ml-2">PDF, DOCX, DOC, imágenes — máx {MAX_SIZE_MB} MB</span>
              </label>

              {/* drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  fileError   ? 'border-red-400 bg-red-50'
                : file       ? 'border-primary-400 bg-primary-50'
                : dragging   ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-300 hover:border-primary-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS}
                  onChange={handleFileInput}
                  className="sr-only"
                />
                {file ? (
                  <div>
                    <svg className="mx-auto h-10 w-10 text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{formatBytes(file.size)}</p>
                    <p className="text-xs text-primary-600 mt-2">Toca para cambiar el archivo</p>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-10 w-10 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                    </svg>
                    <p className="text-sm font-medium text-neutral-700">Arrastra & suelta o toca para subir</p>
                    <p className="text-xs text-neutral-500 mt-1">PDF, DOCX, imágenes</p>
                  </div>
                )}
              </div>
              {fileError && <p className="text-red-600 text-xs mt-2">{fileError}</p>}
            </div>

            <MetadataFields
              {...{ title, setTitle, description, setDescription, subject, setSubject,
                    gradeLevel, setGradeLevel, workbookId, setWorkbookId, workbooks, ensureWorkbooks }}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: GOOGLE LINK
            ════════════════════════════════════════════════════════════════ */}
        {tab === 'google' && (
          <div className="space-y-6">
            <div className="card">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Link de Google <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-neutral-500 mb-3">
                Pega un link de Google Docs, Sheets o Slides
              </p>
              <input
                type="text"
                className={`input ${googleError ? 'input-error' : detectedType ? 'border-green-400' : ''}`}
                placeholder="https://docs.google.com/document/d/..."
                value={googleUrl}
                onChange={(e) => handleGoogleChange(e.target.value)}
              />
              {googleError && <p className="text-red-600 text-xs mt-1.5">{googleError}</p>}
              {detectedType && !googleError && (
                <div className="flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className="text-sm text-green-700">Detectado: {googleLabel(detectedType)}</span>
                </div>
              )}
            </div>

            <MetadataFields
              {...{ title, setTitle, description, setDescription, subject, setSubject,
                    gradeLevel, setGradeLevel, workbookId, setWorkbookId, workbooks, ensureWorkbooks }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED METADATA SECTION ────────────────────────────────────────────────
function MetadataFields({ title, setTitle, description, setDescription, subject, setSubject,
                          gradeLevel, setGradeLevel, workbookId, setWorkbookId, workbooks, ensureWorkbooks }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Detalles</h2>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Título <span className="text-red-500">*</span></label>
        <input type="text" required className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del worksheet" />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
        <textarea className="input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué aprenderán los estudiantes?" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Materia</label>
          <input type="text" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ej. Inglés" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nivel / Grado</label>
          <input type="text" className="input" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="ej. 5to Grado" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Agregar a Workbook (opcional)</label>
        <select className="input" value={workbookId} onFocus={ensureWorkbooks} onChange={(e) => setWorkbookId(e.target.value)}>
          <option value="">— Ninguno —</option>
          {workbooks.map((wb) => (
            <option key={wb.id} value={wb.id}>{wb.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
