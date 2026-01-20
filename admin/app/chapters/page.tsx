"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import useAudiobookChapters, { AudiobookChapter } from '../hooks/useAudiobookChapters';
import Table from '../components/Table';
import ChapterForm from '../components/ChapterForm';

const ChaptersPage = () => {
  const { chapters, loading, error } = useAudiobookChapters();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<AudiobookChapter | null>(null);

  const handleAddNew = () => {
    setSelectedChapter(null);
    setIsFormOpen(true);
  };

  const handleEdit = (chapter: AudiobookChapter) => {
    setSelectedChapter(chapter);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'audiobookChapters', id));
    }
  };

  const columns = ['Order', 'Title', 'Status', 'Actions'];

  const renderRow = (chapter: AudiobookChapter) => (
    <tr key={chapter.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{chapter.order}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{chapter.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{chapter.isActive ? 'Active' : 'Inactive'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => handleEdit(chapter)} className="text-indigo-400 hover:text-indigo-600">Edit</button>
        <button onClick={() => handleDelete(chapter.id)} className="ml-4 text-red-400 hover:text-red-600">Delete</button>
      </td>
    </tr>
  );

  if (loading) return <div>Loading chapters...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Audiobook Chapters</h1>
        <button onClick={handleAddNew} className="px-4 py-2 rounded bg-gold-500 text-black">Add New Chapter</button>
      </div>
      <Table columns={columns} data={chapters} renderRow={renderRow} />
      {isFormOpen && <ChapterForm chapter={selectedChapter} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default withAdminAuth(ChaptersPage);
