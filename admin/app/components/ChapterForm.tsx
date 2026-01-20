"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { AudiobookChapter } from '../hooks/useAudiobookChapters';

interface ChapterFormProps {
  chapter?: AudiobookChapter | null;
  onClose: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ chapter, onClose }) => {
  const [formData, setFormData] = useState<Partial<AudiobookChapter>>({});

  useEffect(() => {
    if (chapter) {
      setFormData(chapter);
    } else {
      setFormData({ title: '', description: '', order: 0, audioUrl: '', isFree: false, isActive: true });
    }
  }, [chapter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const id = chapter?.id || doc(collection(db, 'audiobookChapters')).id;
    const docRef = doc(db, 'audiobookChapters', id);
    await setDoc(docRef, { ...formData, id, createdAt: serverTimestamp() }, { merge: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{chapter ? 'Edit' : 'Add'} Chapter</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 rounded bg-gray-700" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 rounded bg-gray-700"></textarea>
          <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Order" className="w-full p-2 rounded bg-gray-700" />
          <input name="audioUrl" value={formData.audioUrl} onChange={handleChange} placeholder="Audio URL" className="w-full p-2 rounded bg-gray-700" />
          <label className="flex items-center space-x-2"><input name="isFree" type="checkbox" checked={formData.isFree} onChange={handleChange} /><span>Free</span></label>
          <label className="flex items-center space-x-2"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} /><span>Active</span></label>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterForm;
