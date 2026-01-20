"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb } from '../firebase';
import ChapterForm from './ChapterForm';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  audioUrl?: string;
  coverImageUrl?: string;
}

const db = getFirebaseDb();
const storage = getStorage();

const ChapterList = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'audiobookChapters'), orderBy('order'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chaptersData: Chapter[] = [];
      querySnapshot.forEach((doc) => {
        chaptersData.push({ id: doc.id, ...doc.data() } as Chapter);
      });
      setChapters(chaptersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setSelectedChapter(null);
    setIsFormVisible(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      await deleteDoc(doc(db, 'audiobookChapters', id));
    }
  };

  const handleSave = async (chapterData: Omit<Chapter, 'id'>, audioFile?: File, coverFile?: File) => {
    setLoading(true);
    let audioUrl = chapterData.audioUrl;
    let coverImageUrl = chapterData.coverImageUrl;

    try {
      if (audioFile) {
        const audioRef = ref(storage, `audiobookChapters/${Date.now()}_${audioFile.name}`);
        await uploadBytes(audioRef, audioFile);
        audioUrl = await getDownloadURL(audioRef);
      }

      if (coverFile) {
        const coverRef = ref(storage, `audiobookChapters/covers/${Date.now()}_${coverFile.name}`);
        await uploadBytes(coverRef, coverFile);
        coverImageUrl = await getDownloadURL(coverRef);
      }

      const dataToSave = { ...chapterData, audioUrl, coverImageUrl };

      if (selectedChapter) {
        await updateDoc(doc(db, 'audiobookChapters', selectedChapter.id), dataToSave);
      } else {
        await addDoc(collection(db, 'audiobookChapters'), dataToSave);
      }
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Failed to save chapter. Check console for details.');
    } finally {
      setLoading(false);
      setIsFormVisible(false);
      setSelectedChapter(null);
    }
  };

  if (loading && chapters.length === 0) {
    return <div>Loading chapters...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {isFormVisible && (
        <ChapterForm
          chapter={selectedChapter}
          onSave={handleSave}
          onCancel={() => {
            setIsFormVisible(false);
            setSelectedChapter(null);
          }}
        />
      )}
      <div className="px-6 py-4">
        <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Add New Chapter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chapters.map((chapter) => (
              <tr key={chapter.id}>
                <td className="px-6 py-4 whitespace-nowrap">{chapter.order}</td>
                <td className="px-6 py-4 whitespace-nowrap">{chapter.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${chapter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {chapter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(chapter)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(chapter.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChapterList;
