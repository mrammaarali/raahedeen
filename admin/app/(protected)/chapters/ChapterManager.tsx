"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  audioUrl: string;
  isFree: boolean;
}

export default function ChapterManager() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', order: 0, audioUrl: '', isFree: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchChapters = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const chaptersCollection = collection(db, 'audiobook_chapters');
    const q = query(chaptersCollection, orderBy('order'));
    const snapshot = await getDocs(q);
    const chapterList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
    setChapters(chapterList);
    setLoading(false);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    if (editingId) {
      const chapterDoc = doc(db, 'audiobook_chapters', editingId);
      await updateDoc(chapterDoc, form);
      setEditingId(null);
    } else {
      const chaptersCollection = collection(db, 'audiobook_chapters');
      await addDoc(chaptersCollection, form);
    }
    setForm({ title: '', description: '', order: 0, audioUrl: '', isFree: true });
    fetchChapters();
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setForm({ title: chapter.title, description: chapter.description, order: chapter.order, audioUrl: chapter.audioUrl, isFree: chapter.isFree });
  };

  const handleDelete = async (id: string) => {
    const db = getFirebaseDb();
    const chapterDoc = doc(db, 'audiobook_chapters', id);
    await deleteDoc(chapterDoc);
    fetchChapters();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', order: 0, audioUrl: '', isFree: true });
  }

  return (
    <div className="space-y-8">
      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">{editingId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" required />
          <input type="text" placeholder="Audio URL" value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isFree" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
            <label htmlFor="isFree">Is Free?</label>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black font-medium">{editingId ? 'Update Chapter' : 'Add Chapter'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded bg-gray-600 text-white">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">Existing Chapters</h2>
        {loading ? <p>Loading chapters...</p> : (
          <div className="space-y-3">
            {chapters.map(chapter => (
              <div key={chapter.id} className="flex justify-between items-center bg-navy-900 p-3 rounded">
                <div>
                  <p className="font-semibold">{chapter.order}. {chapter.title} {chapter.isFree ? '(Free)' : ''}</p>
                  <p className="text-sm text-gray-400">{chapter.description}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(chapter)} className="text-sm text-blue-400">Edit</button>
                  <button onClick={() => handleDelete(chapter.id)} className="text-sm text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
