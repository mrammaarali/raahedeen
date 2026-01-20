"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { Dua } from '../hooks/useDuas';

interface DuaFormProps {
  dua?: Dua | null;
  onClose: () => void;
}

const DuaForm: React.FC<DuaFormProps> = ({ dua, onClose }) => {
  const [formData, setFormData] = useState<Partial<Dua>>({});

  useEffect(() => {
    if (dua) {
      setFormData(dua);
    } else {
      setFormData({ 
        title: '', 
        category: '', 
        arabic: '', 
        transliteration: '', 
        meaning: '', 
        isActive: true 
      });
    }
  }, [dua]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const id = dua?.id || doc(collection(db, 'duas')).id;
    const docRef = doc(db, 'duas', id);
    await setDoc(docRef, { ...formData, id, lastUpdated: serverTimestamp() }, { merge: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{dua ? 'Edit' : 'Add'} Dua</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 rounded bg-gray-700" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 rounded bg-gray-700" />
          <textarea name="arabic" value={formData.arabic} onChange={handleChange} placeholder="Arabic" className="w-full p-2 rounded bg-gray-700 h-24"></textarea>
          <textarea name="transliteration" value={formData.transliteration} onChange={handleChange} placeholder="Transliteration" className="w-full p-2 rounded bg-gray-700 h-24"></textarea>
          <textarea name="meaning" value={formData.meaning} onChange={handleChange} placeholder="Meaning/Translation" className="w-full p-2 rounded bg-gray-700 h-24"></textarea>
          <label className="flex items-center space-x-2"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /><span>Active</span></label>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black">Save Dua</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuaForm;
