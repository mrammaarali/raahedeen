"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import useFinderRules, { FinderRule } from '../hooks/useFinderRules';
import Table from '../components/Table';
import FinderRuleForm from '../components/FinderRuleForm';

const FinderRulesPage = () => {
  const { rules, loading, error } = useFinderRules();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<FinderRule | null>(null);

  const handleAddNew = () => {
    setSelectedRule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rule: FinderRule) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'finderRules', id));
    }
  };

  const columns = ['Name Number', 'DOB Number', 'Primary Gemstone', 'Actions'];

  const renderRow = (rule: FinderRule) => (
    <tr key={rule.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{rule.nameNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{rule.dobNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{rule.primaryGemstone}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => handleEdit(rule)} className="text-indigo-400 hover:text-indigo-600">Edit</button>
        <button onClick={() => handleDelete(rule.id)} className="ml-4 text-red-400 hover:text-red-600">Delete</button>
      </td>
    </tr>
  );

  if (loading) return <div>Loading rules...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Gemstone Finder Rules</h1>
        <button onClick={handleAddNew} className="px-4 py-2 rounded bg-gold-500 text-black">Add New Rule</button>
      </div>
      <Table columns={columns} data={rules} renderRow={renderRow} />
      {isFormOpen && <FinderRuleForm rule={selectedRule} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default withAdminAuth(FinderRulesPage);
