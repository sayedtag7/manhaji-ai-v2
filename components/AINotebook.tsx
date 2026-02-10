import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Save, Bot, Highlighter, FileText, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Loader2, Upload, Download, FileDown, FileUp, File } from 'lucide-react';
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

  // ═══════════════════════════════════════════════════════════════
  // Import / Export Functions
  // ═══════════════════════════════════════════════════════════════

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportExport, setShowImportExport] = useState(false);

  // Export as Markdown
  const exportAsMarkdown = () => {
    const title = `# ${lessonTitle}\n\n`;
    const date = `_Exported: ${new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}_\n\n---\n\n`;
    
    const content = entries.map(entry => {
      const typeLabel = isAr ? entryTypeLabels[entry.entry_type]?.ar : entryTypeLabels[entry.entry_type]?.en;
      return `### ${typeLabel}\n\n${entry.content_text}\n\n_${new Date(entry.created_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}_\n`;
    }).join('\n---\n\n');

    const blob = new Blob([title + date + content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF (using print)
  const exportAsPDF = () => {
    const printContent = `
      <html dir="${isAr ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="utf-8">
        <title>${lessonTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; }
          h1 { color: #00A896; border-bottom: 2px solid #00A896; padding-bottom: 10px; }
          .entry { margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .entry-type { font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; }
          .entry-content { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
          .entry-date { font-size: 11px; color: #999; margin-top: 10px; }
          .ai-entry { background: #f0faf7; border-color: #00A896; }
          .correction-entry { background: #fffbeb; border-color: #f59e0b; }
          .brand { text-align: center; color: #999; font-size: 11px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>📓 ${lessonTitle}</h1>
        <p style="color: #666; font-size: 12px;">${new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
        ${entries.map(entry => {
          const typeLabel = isAr ? entryTypeLabels[entry.entry_type]?.ar : entryTypeLabels[entry.entry_type]?.en;
          const cssClass = entry.entry_type.startsWith('ai_') ? 'ai-entry' : entry.entry_type === 'highlight' ? 'correction-entry' : '';
          return `<div class="entry ${cssClass}">
            <div class="entry-type">${typeLabel}</div>
            <div class="entry-content">${entry.content_text}</div>
            <div class="entry-date">${new Date(entry.created_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</div>
          </div>`;
        }).join('')}
        <div class="brand">Manhaji | منهجي — AI-Powered Learning</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Import text file
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !notebookId) return;

    setIsImporting(true);
    setImportProgress(isAr ? 'جاري قراءة الملف...' : 'Reading file...');

    try {
      let text = '';

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        text = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF: extract text (basic approach - reads as text)
        setImportProgress(isAr ? 'جاري معالجة PDF...' : 'Processing PDF...');
        // In production, this would go through backend OCR. For now, read what we can.
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // Extract text between stream markers (basic PDF text extraction)
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawText = decoder.decode(bytes);
        // Try to extract readable text chunks
        const textChunks = rawText.match(/\(([^)]+)\)/g);
        text = textChunks 
          ? textChunks.map(c => c.slice(1, -1)).join(' ').replace(/\\[nrt]/g, ' ')
          : `[${isAr ? 'تم استيراد ملف PDF - يحتاج معالجة من الخادم' : 'PDF imported - requires server processing'}]: ${file.name}`;
      } else if (file.type.startsWith('image/')) {
        setImportProgress(isAr ? 'جاري معالجة الصورة...' : 'Processing image...');
        // Convert to base64 for future OCR
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        text = `[${isAr ? 'صورة مستوردة' : 'Imported image'}]: ${file.name}\n${base64.substring(0, 100)}...`;
      }

      if (text.trim()) {
        setImportProgress(isAr ? 'جاري حفظ المحتوى...' : 'Saving content...');
        // Split long text into chunks of ~500 chars
        const chunks = text.match(/[\s\S]{1,500}/g) || [text];
        for (const chunk of chunks) {
          const entry = await addNotebookEntry(notebookId, 'note', `📎 ${file.name}\n${chunk.trim()}`);
          if (entry) setEntries(prev => [...prev, entry]);
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
      setImportProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
            
            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isAr ? 'استيراد' : 'Import'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
              onChange={handleFileImport}
              className="hidden"
            />

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                {isAr ? 'تصدير' : 'Export'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showImportExport && (
                <div className="absolute top-full mt-1 end-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                  <button
                    onClick={() => { exportAsPDF(); setShowImportExport(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-start"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    {isAr ? 'تصدير PDF' : 'Export PDF'}
                  </button>
                  <button
                    onClick={() => { exportAsMarkdown(); setShowImportExport(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-start"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    {isAr ? 'تصدير Markdown' : 'Export Markdown'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Import Progress */}
          {isImporting && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {importProgress}
            </div>
          )}

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
