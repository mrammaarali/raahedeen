"use client";

import { useState } from 'react';
import { doc, setDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import useProductFAQs, { ProductFAQ } from '../hooks/useProductFAQs';

interface ProductFAQsProps {
  productId: string;
}

const ProductFAQs: React.FC<ProductFAQsProps> = ({ productId }) => {
  const { faqs, loading, error } = useProductFAQs(productId);
  const [editingFaq, setEditingFaq] = useState<Partial<ProductFAQ> | null>(null);

  const handleSave = async (faqData: Partial<ProductFAQ>) => {
    const db = getFirebaseDb();
    const id = faqData.id || doc(collection(db, 'products', productId, 'faqs')).id;
    const docRef = doc(db, 'products', productId, 'faqs', id);
    await setDoc(docRef, { ...faqData, id, productId, lastUpdated: serverTimestamp() }, { merge: true });
    setEditingFaq(null);
  };

  const handleDelete = async (faqId: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'products', productId, 'faqs', faqId));
    }
  };

  if (loading) return <div>Loading FAQs...</div>;
  if (error) return <div>Error loading FAQs: {error.message}</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Product FAQs</h3>
      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-gray-700 p-4 rounded-lg">
            <p className="font-semibold">{faq.question}</p>
            <p className="text-gray-300">{faq.answer}</p>
            <div className="flex justify-end space-x-2 mt-2">
              <button onClick={() => setEditingFaq(faq)} className="text-sm text-indigo-400">Edit</button>
              <button onClick={() => handleDelete(faq.id)} className="text-sm text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setEditingFaq({ question: '', answer: '', displayOrder: faqs.length + 1, isActive: true })} className="mt-4 px-4 py-2 rounded bg-blue-500">Add FAQ</button>

      {editingFaq && (
        <FAQForm faq={editingFaq} onSave={handleSave} onCancel={() => setEditingFaq(null)} />
      )}
    </div>
  );
};

// Inline form component for simplicity
interface FAQFormProps {
  faq: Partial<ProductFAQ>;
  onSave: (faq: Partial<ProductFAQ>) => void;
  onCancel: () => void;
}

const FAQForm: React.FC<FAQFormProps> = ({ faq, onSave, onCancel }) => {
  const [formData, setFormData] = useState(faq);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{faq.id ? 'Edit' : 'Add'} FAQ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="question" value={formData.question} onChange={handleChange} placeholder="Question" className="w-full p-2 rounded bg-gray-700" />
          <textarea name="answer" value={formData.answer} onChange={handleChange} placeholder="Answer" className="w-full p-2 rounded bg-gray-700"></textarea>
          <input name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} placeholder="Display Order" className="w-full p-2 rounded bg-gray-700" />
          <label className="flex items-center space-x-2"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /><span>Active</span></label>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black">Save FAQ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFAQs;
