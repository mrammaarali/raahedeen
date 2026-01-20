"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import useDuas, { Dua } from '../hooks/useDuas';
import Table from '../components/Table';
import DuaForm from '../components/DuaForm';

const DuasPage = () => {
  const { duas, loading, error } = useDuas();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

  const handleAddNew = () => {
    setSelectedDua(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dua: Dua) => {
    setSelectedDua(dua);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dua?')) {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'duas', id));
    }
  };

  const columns = ['Title', 'Category', 'Status', 'Actions'];

  const renderRow = (dua: Dua) => (
    <tr key={dua.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{dua.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dua.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dua.isActive ? 'Active' : 'Inactive'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => handleEdit(dua)} className="text-indigo-400 hover:text-indigo-600">Edit</button>
        <button onClick={() => handleDelete(dua.id)} className="ml-4 text-red-400 hover:text-red-600">Delete</button>
      </td>
    </tr>
  );

  if (loading) return <div>Loading duas...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Duas</h1>
        <button onClick={handleAddNew} className="px-4 py-2 rounded bg-gold-500 text-black">Add New Dua</button>
      </div>
      <Table columns={columns} data={duas} renderRow={renderRow} />
      {isFormOpen && <DuaForm dua={selectedDua} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default withAdminAuth(DuasPage);
