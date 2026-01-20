"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import DuaForm from './DuaForm';

interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  isActive: boolean;
}

const db = getFirebaseDb();

const DuaList = () => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'duas'), orderBy('category'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const duasData: Dua[] = [];
      querySnapshot.forEach((doc) => {
        duasData.push({ id: doc.id, ...doc.data() } as Dua);
      });
      setDuas(duasData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setSelectedDua(null);
    setIsFormVisible(true);
  };

  const handleEdit = (dua: Dua) => {
    setSelectedDua(dua);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dua?')) {
      await deleteDoc(doc(db, 'duas', id));
    }
  };

  const handleSave = async (duaData: Omit<Dua, 'id'>) => {
    try {
      if (selectedDua) {
        await updateDoc(doc(db, 'duas', selectedDua.id), duaData);
      } else {
        await addDoc(collection(db, 'duas'), duaData);
      }
    } catch (error) {
      console.error('Error saving dua:', error);
      alert('Failed to save dua. Check console for details.');
    }
    setIsFormVisible(false);
    setSelectedDua(null);
  };

  if (loading) {
    return <div>Loading duas...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {isFormVisible && (
        <DuaForm
          dua={selectedDua}
          onSave={handleSave}
          onCancel={() => {
            setIsFormVisible(false);
            setSelectedDua(null);
          }}
        />
      )}
      <div className="px-6 py-4">
        <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Add New Dua
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {duas.map((dua) => (
              <tr key={dua.id}>
                <td className="px-6 py-4 whitespace-nowrap">{dua.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dua.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dua.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dua.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(dua)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(dua.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DuaList;
