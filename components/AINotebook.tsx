import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Save, Bot, Highlighter, FileText, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getOrCreateNotebook,
  getNotebookEntries,
  addNotebookEntry,
  updateNotebookEntry,
  deleteNotebookEntry,
  NotebookEntry
} from '../services/notebookService';
import { scanNotebook, NotebookScanResult } from '../services/aiEngineService';

interface AINotebookProps {
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  subject?: string;
  onRequestAISummary?: (lessonId: string) => void;
}

const entryTypeIcons: Record<string, React.ReactNode> = {
  note: <Edit3 className="w-4 h-4" />,
  highlight: <Highlighter className="w-4 h-4" />,
  ai_summary: <Bot className="w-4 h-4" />,
  ai_correction: <Sparkles className="w-4 h-4" />,
  visual_spec: <FileText className="w-4 h-4" />,
};

const entryTypeLabels: Record<string, { ar: string; en: string }> = {
  note: { ar: 'ملاحظة', en: 'Note' },
  highlight: { ar: 'تمييز', en: 'Highlight' },
  ai_summary: { ar: 'ملخص ذكي', en: 'AI Summary' },
  ai_correction: { ar: 'تصحيح ذكي', en: 'AI Correction' },
  visual_spec: { ar: 'رسم توضيحي', en: 'Visual' },
};

const AINotebook: React.FC<AINotebookProps> = ({ lessonId, lessonTitle, studentId, subject, onRequestAISummary }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [notebookId, setNotebookId] = useState<string | null>(null);
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Misconception scanning state
  const [scanResult, setScanResult] = useState<NotebookScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scanTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    loadNotebook();
  }, [lessonId, studentId]);

  const loadNotebook = async () => {
    setIsLoading(true);
    const notebook = await getOrCreateNotebook(studentId, lessonId, lessonTitle);
    if (notebook) {
      setNotebookId(notebook.notebook_id);
      const notebookEntries = await getNotebookEntries(notebook.notebook_id);
      setEntries(notebookEntries);
    }
    setIsLoading(false);
  };

  const handleAddNote = async () => {
    if (!notebookId || !newNoteText.trim()) return;
    const entry = await addNotebookEntry(notebookId, 'note', newNoteText.trim());
    if (entry) {
      setEntries(prev => [...prev, entry]);
      setNewNoteText('');
    }
  };

  const handleUpdateEntry = async (entryId: string) => {
    if (!editText.trim()) return;
    const updated = await updateNotebookEntry(entryId, editText.trim());
    if (updated) {
      setEntries(prev => prev.map(e => e.entry_id === entryId ? updated : e));
      setEditingEntryId(null);
      setEditText('');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const success = await deleteNotebookEntry(entryId);
    if (success) {
      setEntries(prev => prev.filter(e => e.entry_id !== entryId));
    }
  };

  const startEditing = (entry: NotebookEntry) => {
    setEditingEntryId(entry.entry_id);
    setEditText(entry.content_text);
  };

  const getEntryBgColor = (type: string) => {
    switch (type) {
      case 'ai_summary': return 'bg-brand-50 border-brand-200';
      case 'ai_correction': return 'bg-amber-50 border-amber-200';
      case 'highlight': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-white border-gray-200';
    }
  };

  // Debounced misconception scanning — triggers 1.5s after student stops typing
  const debouncedScan = useCallback((text: string) => {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (text.trim().length < 15) { setScanResult(null); return; }

    scanTimeoutRef.current = window.setTimeout(async () => {
      setIsScanning(true);
      try {
        const result = await scanNotebook(text, subject || 'science', 7);
        if (result) setScanResult(result);
      } catch (err) { console.error(err); }
      setIsScanning(false);
    }, 1500);
  }, [subject]);

  // Watch the note input for misconceptions
  const handleNoteChange = (text: string) => {
    setNewNoteText(text);
    debouncedScan(text);
  };

  // Cleanup scan timeout on unmount
  useEffect(() => {
    return () => { if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current); };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-l from-brand-50 to-white hover:bg-brand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className={`text-${isAr ? 'right' : 'left'}`}>
            <h3 className="font-bold text-gray-900">{isAr ? 'دفتر الملاحظات الذكي' : 'AI Notebook'}</h3>
            <p className="text-xs text-gray-500">{entries.length} {isAr ? 'إدخالات' : 'entries'}</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {onRequestAISummary && (
              <button
                onClick={() => onRequestAISummary(lessonId)}
                className="flex items-center gap-2 px-3 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                <Bot className="w-4 h-4" />
                {isAr ? 'ملخص ذكي' : 'AI Summary'}
              </button>
            )}
          </div>

          {/* Entries List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{isAr ? 'لا توجد ملاحظات بعد. ابدأ بإضافة ملاحظاتك!' : 'No notes yet. Start adding your notes!'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
              {entries.map((entry) => (
                <div
                  key={entry.entry_id}
                  className={`p-3 rounded-xl border ${getEntryBgColor(entry.entry_type)} transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${entry.entry_type.startsWith('ai_') ? 'text-brand-500' : 'text-gray-500'}`}>
                        {entryTypeIcons[entry.entry_type]}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {isAr ? entryTypeLabels[entry.entry_type]?.ar : entryTypeLabels[entry.entry_type]?.en}
                      </span>
                    </div>
                    {entry.entry_type === 'note' && (
                      <div className="flex gap-1">
                        <button onClick={() => startEditing(entry)} className="p-1 hover:bg-gray-100 rounded">
                          <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => handleDeleteEntry(entry.entry_id)} className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingEntryId === entry.entry_id ? (
                    <div className="mt-2 flex gap-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 p-2 border border-brand-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                        rows={3}
                        dir={isAr ? 'rtl' : 'ltr'}
                      />
                      <button
                        onClick={() => handleUpdateEntry(entry.entry_id)}
                        className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content_text}</p>
                  )}

                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(entry.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Note Input */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <textarea
                value={newNoteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={isAr ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'}
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                rows={2}
                dir={isAr ? 'rtl' : 'ltr'}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNoteText.trim()}
                className="self-end p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Real-time Misconception Scanning Indicator */}
            {isScanning && (
              <div className="flex items-center gap-2 text-xs text-brand-500 px-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isAr ? 'جاري فحص الملاحظة...' : 'Scanning for misconceptions...'}
              </div>
            )}

            {/* Misconception Alert */}
            {scanResult && scanResult.has_misconceptions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-bold text-amber-800 flex items-center gap-1">
                    {isAr ? 'تم اكتشاف مفهوم خاطئ' : 'Misconception Detected'}
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
                {scanResult.misconceptions?.map((m, i) => (
                  <div key={i} className="text-sm space-y-1" dir={isAr ? 'rtl' : 'ltr'}>
                    <p className="text-amber-700">
                      <strong>❌</strong> {isAr ? m.misconception_ar : m.misconception_en}
                    </p>
                    <p className="text-green-700">
                      <strong>✅</strong> {isAr ? m.correction_ar : m.correction_en}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AINotebook;
