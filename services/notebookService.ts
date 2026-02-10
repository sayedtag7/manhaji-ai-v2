/**
 * Notebook Service — Real notebook CRUD via Firebase Firestore + RAG ingestion.
 * Replaces the stub that returned fabricated in-memory objects.
 * All notebook content is persisted in Firestore AND ingested into ChromaDB for RAG.
 */
import { db } from '../config/firebase';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, query, where, getDocs, orderBy, addDoc
} from 'firebase/firestore';
import { logAnalyticsEvent } from './progressService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface NotebookEntry {
  entry_id: string;
  notebook_id: string;
  entry_type: 'note' | 'highlight' | 'ai_summary' | 'ai_correction' | 'visual_spec';
  content_text: string;
  created_at: string;
  updated_at?: string;
}

export interface Notebook {
  notebook_id: string;
  student_id: string;
  lesson_id: string;
  lesson_title: string;
  created_at: string;
}

/**
 * Get or create a notebook for a student + lesson combo.
 * Data persisted in Firestore under notebooks/{notebookId}.
 */
export async function getOrCreateNotebook(
  studentId: string,
  lessonId: string,
  lessonTitle: string
): Promise<Notebook | null> {
  try {
    const notebookId = `nb_${studentId}_${lessonId}`;
    const ref = doc(db, 'notebooks', notebookId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      return {
        notebook_id: notebookId,
        student_id: data.student_id || studentId,
        lesson_id: data.lesson_id || lessonId,
        lesson_title: data.lesson_title || lessonTitle,
        created_at: data.created_at || new Date().toISOString(),
      };
    }

    // Create new notebook
    const notebook: Notebook = {
      notebook_id: notebookId,
      student_id: studentId,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      created_at: new Date().toISOString(),
    };
    await setDoc(ref, { ...notebook, createdAt: serverTimestamp() });
    return notebook;
  } catch (err) {
    console.error('Failed to get/create notebook:', err);
    return null;
  }
}

/**
 * Get all entries for a notebook from Firestore.
 */
export async function getNotebookEntries(notebookId: string): Promise<NotebookEntry[]> {
  try {
    const entriesRef = collection(db, 'notebooks', notebookId, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);

    return snap.docs.map(d => {
      const data = d.data();
      return {
        entry_id: d.id,
        notebook_id: notebookId,
        entry_type: data.entry_type || 'note',
        content_text: data.content_text || '',
        created_at: data.created_at || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at || data.updatedAt?.toDate?.()?.toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to load notebook entries:', err);
    return [];
  }
}

/**
 * Add a new entry to a notebook.
 * Also ingests the content into ChromaDB for RAG personalization.
 */
export async function addNotebookEntry(
  notebookId: string,
  entryType: NotebookEntry['entry_type'],
  contentText: string,
  studentId?: string,
  lessonId?: string,
  subject?: string,
): Promise<NotebookEntry | null> {
  try {
    const entriesRef = collection(db, 'notebooks', notebookId, 'entries');
    const docRef = await addDoc(entriesRef, {
      entry_type: entryType,
      content_text: contentText,
      created_at: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });

    const entry: NotebookEntry = {
      entry_id: docRef.id,
      notebook_id: notebookId,
      entry_type: entryType,
      content_text: contentText,
      created_at: new Date().toISOString(),
    };

    // Ingest into ChromaDB for RAG (non-blocking)
    if (contentText.length > 20) {
      fetch(`${BACKEND_URL}/api/ingest/notebook-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: contentText,
          notebook_id: notebookId,
          lesson_id: lessonId,
          subject: subject,
          document_name: `ملاحظات الطالب`,
        }),
      }).catch(() => {});

      // Also update Socratic Orchestrator context
      if (studentId) {
        fetch(`${BACKEND_URL}/api/chat/update-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            notebook_text: contentText,
          }),
        }).catch(() => {});

        logAnalyticsEvent(studentId, 'notebook_edit', {
          notebookId, entryType, textLength: contentText.length,
        });
      }
    }

    return entry;
  } catch (err) {
    console.error('Failed to add notebook entry:', err);
    return null;
  }
}

/**
 * Update an existing notebook entry in Firestore.
 */
export async function updateNotebookEntry(
  entryId: string,
  contentText: string,
  notebookId?: string,
): Promise<NotebookEntry | null> {
  try {
    if (!notebookId) {
      // Can't update without knowing the notebook
      console.error('notebookId required for update');
      return null;
    }

    const ref = doc(db, 'notebooks', notebookId, 'entries', entryId);
    await updateDoc(ref, {
      content_text: contentText,
      updated_at: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    return {
      entry_id: entryId,
      notebook_id: notebookId,
      entry_type: 'note',
      content_text: contentText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to update notebook entry:', err);
    return null;
  }
}

/**
 * Delete a notebook entry from Firestore.
 */
export async function deleteNotebookEntry(
  entryId: string,
  notebookId?: string,
): Promise<boolean> {
  try {
    if (!notebookId) return false;
    const ref = doc(db, 'notebooks', notebookId, 'entries', entryId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('Failed to delete notebook entry:', err);
    return false;
  }
}
