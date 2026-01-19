"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface ProductFaqManagerProps {
  productId: string;
}

export default function ProductFaqManager({ productId }: ProductFaqManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ question: '', answer: '', order: 0, isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const faqsCollection = collection(db, `gemstone_products/${productId}/faqs`);
    const q = query(faqsCollection, orderBy('order'));
    const snapshot = await getDocs(q);
    const faqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQ));
    setFaqs(faqList);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    if (editingId) {
      const faqDoc = doc(db, `gemstone_products/${productId}/faqs`, editingId);
      await updateDoc(faqDoc, form);
      setEditingId(null);
    } else {
      const faqsCollection = collection(db, `gemstone_products/${productId}/faqs`);
      await addDoc(faqsCollection, form);
    }
    setForm({ question: '', answer: '', order: 0, isActive: true });
    fetchFaqs();
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setForm(faq);
  };

  const handleDelete = async (id: string) => {
    const db = getFirebaseDb();
    const faqDoc = doc(db, `gemstone_products/${productId}/faqs`, id);
    await deleteDoc(faqDoc);
    fetchFaqs();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ question: '', answer: '', order: 0, isActive: true });
  }

  return (
    <div className="space-y-6 bg-navy-900 border border-gray-700 rounded-lg p-6 mt-8">
      <h3 className="text-lg font-semibold text-gold-500 border-b border-gray-700 pb-3">Manage Product FAQs</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3 p-4 border border-gray-700 rounded-md">
        <h4 className="font-medium mb-2">{editingId ? 'Edit FAQ' : 'Add New FAQ'}</h4>
        <input type="text" placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-800 border border-gray-600" required />
        <textarea placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-800 border border-gray-600 h-20" required />
        <div className="flex gap-4">
          <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-1/2 px-3 py-2 rounded bg-navy-800 border border-gray-600" required />
          <div className="w-1/2 flex items-center gap-2">
            <input type="checkbox" id={`faqIsActive-${productId}`} checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor={`faqIsActive-${productId}`}>Is Active?</label>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="px-3 py-1.5 rounded bg-gold-500 text-black text-sm font-medium">{editingId ? 'Update FAQ' : 'Add FAQ'}</button>
          {editingId && <button type="button" onClick={handleCancelEdit} className="px-3 py-1.5 rounded bg-gray-600 text-white text-sm">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        <h4 className="font-medium mb-2">Existing FAQs</h4>
        {loading ? <p>Loading FAQs...</p> : faqs.map(faq => (
          <div key={faq.id} className="flex justify-between items-start bg-navy-800 p-3 rounded">
            <div>
              <p className="font-semibold">{faq.order}. {faq.question}</p>
              <p className="text-sm text-gray-400 mt-1">{faq.answer}</p>
              <p className={`text-xs mt-2 ${faq.isActive ? 'text-green-400' : 'text-red-400'}`}>{faq.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0 ml-4">
              <button onClick={() => handleEdit(faq)} className="text-sm text-blue-400">Edit</button>
              <button onClick={() => handleDelete(faq.id)} className="text-sm text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {!loading && faqs.length === 0 && <p className="text-sm text-gray-500">No FAQs found for this product.</p>}
      </div>
    </div>
  );
}
