"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  isActive: boolean;
}

export default function DuaManager() {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', category: '', arabic: '', transliteration: '', translation: '', isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDuas = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const duasCollection = collection(db, 'duas');
    const q = query(duasCollection, orderBy('category'), orderBy('title'));
    const snapshot = await getDocs(q);
    const duaList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dua));
    setDuas(duaList);
    setLoading(false);
  };

  useEffect(() => {
    fetchDuas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    if (editingId) {
      const duaDoc = doc(db, 'duas', editingId);
      await updateDoc(duaDoc, form);
      setEditingId(null);
    } else {
      const duasCollection = collection(db, 'duas');
      await addDoc(duasCollection, form);
    }
    setForm({ title: '', category: '', arabic: '', transliteration: '', translation: '', isActive: true });
    fetchDuas();
  };

  const handleEdit = (dua: Dua) => {
    setEditingId(dua.id);
    setForm(dua);
  };

  const handleDelete = async (id: string) => {
    const db = getFirebaseDb();
    const duaDoc = doc(db, 'duas', id);
    await deleteDoc(duaDoc);
    fetchDuas();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', category: '', arabic: '', transliteration: '', translation: '', isActive: true });
  }

  return (
    <div className="space-y-8">
      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">{editingId ? 'Edit Dua' : 'Add New Dua'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" required />
          <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
          <textarea placeholder="Arabic Text" value={form.arabic} onChange={(e) => setForm({ ...form, arabic: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-24 rtl" dir="rtl" />
          <textarea placeholder="Transliteration" value={form.transliteration} onChange={(e) => setForm({ ...form, transliteration: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-20" />
          <textarea placeholder="Translation / Meaning" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-20" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="duaIsActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="duaIsActive">Is Active?</label>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black font-medium">{editingId ? 'Update Dua' : 'Add Dua'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded bg-gray-600 text-white">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">Existing Duas</h2>
        {loading ? <p>Loading duas...</p> : (
          <div className="space-y-3">
            {duas.map(dua => (
              <div key={dua.id} className="flex justify-between items-start bg-navy-900 p-3 rounded">
                <div>
                  <p className="font-semibold">{dua.title} <span className="text-sm text-gray-400">({dua.category})</span></p>
                  <p className="text-lg text-right text-gray-200 mt-2" dir="rtl">{dua.arabic}</p>
                  <p className={`text-xs mt-2 ${dua.isActive ? 'text-green-400' : 'text-red-400'}`}>{dua.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0 ml-4">
                  <button onClick={() => handleEdit(dua)} className="text-sm text-blue-400">Edit</button>
                  <button onClick={() => handleDelete(dua.id)} className="text-sm text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
