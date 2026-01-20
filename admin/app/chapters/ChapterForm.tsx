"use client";

import { useState, useEffect } from 'react';

interface Chapter {
  id?: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  audioUrl?: string;
  coverImageUrl?: string;
}

interface ChapterFormProps {
  chapter?: Chapter | null;
  onSave: (chapter: Chapter, audioFile?: File, coverFile?: File) => void;
  onCancel: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ chapter, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Chapter>({
    title: '',
    description: '',
    order: 0,
    isFree: false,
    isActive: true,
  });
  const [audioFile, setAudioFile] = useState<File | undefined>();
  const [coverFile, setCoverFile] = useState<File | undefined>();

  useEffect(() => {
    if (chapter) {
      setFormData(chapter);
    }
  }, [chapter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'audioFile') setAudioFile(files[0]);
      if (name === 'coverFile') setCoverFile(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, audioFile, coverFile);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{chapter ? 'Edit' : 'Add'} Chapter</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 border rounded" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
          <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="Order" required className="w-full p-2 border rounded" />
          <label className="flex items-center"><input name="isFree" type="checkbox" checked={formData.isFree} onChange={handleChange} className="mr-2" /> Is Free</label>
          <label className="flex items-center"><input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="mr-2" /> Is Active</label>
          <div>
            <label className="block text-sm font-medium text-gray-700">Audio File</label>
            <input name="audioFile" type="file" accept="audio/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
            {formData.audioUrl && <p className="text-xs text-gray-500 mt-1">Current: {formData.audioUrl}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <input name="coverFile" type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
            {formData.coverImageUrl && <img src={formData.coverImageUrl} alt="Cover" className="w-20 h-20 mt-2 object-cover"/>}
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterForm;
