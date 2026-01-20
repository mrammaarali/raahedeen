"use client";

import { useState, useEffect } from 'react';

interface Dua {
  id?: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  isActive: boolean;
}

interface DuaFormProps {
  dua?: Dua | null;
  onSave: (dua: Omit<Dua, 'id'>) => void;
  onCancel: () => void;
}

const DuaForm: React.FC<DuaFormProps> = ({ dua, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Dua, 'id'>>({
    title: '',
    category: '',
    arabic: '',
    transliteration: '',
    meaning: '',
    isActive: true,
  });

  useEffect(() => {
    if (dua) {
      setFormData(dua);
    }
  }, [dua]);

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{dua ? 'Edit' : 'Add'} Dua</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 border rounded" />
          <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" required className="w-full p-2 border rounded" />
          <textarea name="arabic" value={formData.arabic} onChange={handleChange} placeholder="Arabic Text" className="w-full p-2 border rounded text-right" rows={3} dir="rtl" />
          <textarea name="transliteration" value={formData.transliteration} onChange={handleChange} placeholder="Transliteration" className="w-full p-2 border rounded" rows={2} />
          <textarea name="meaning" value={formData.meaning} onChange={handleChange} placeholder="Meaning" className="w-full p-2 border rounded" rows={3} />
          <label className="flex items-center"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="mr-2" /> Is Active</label>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuaForm;
