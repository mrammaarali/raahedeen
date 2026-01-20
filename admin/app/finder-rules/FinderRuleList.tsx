"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import FinderRuleForm from './FinderRuleForm';

interface FinderRule {
  id: string;
  nameNumber: number;
  dobNumber: number;
  primaryGemstone: string;
  secondaryGemstone: string;
  explanation: string;
  disclaimer: string;
}

const db = getFirebaseDb();

const FinderRuleList = () => {
  const [rules, setRules] = useState<FinderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<FinderRule | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'finderRules'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rulesData: FinderRule[] = [];
      querySnapshot.forEach((doc) => {
        rulesData.push({ id: doc.id, ...doc.data() } as FinderRule);
      });
      setRules(rulesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setSelectedRule(null);
    setIsFormVisible(true);
  };

  const handleEdit = (rule: FinderRule) => {
    setSelectedRule(rule);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      await deleteDoc(doc(db, 'finderRules', id));
    }
  };

  const handleSave = async (ruleData: Omit<FinderRule, 'id'>) => {
    try {
      if (selectedRule) {
        await updateDoc(doc(db, 'finderRules', selectedRule.id), ruleData);
      } else {
        await addDoc(collection(db, 'finderRules'), ruleData);
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save rule. Check console for details.');
    }
    setIsFormVisible(false);
    setSelectedRule(null);
  };

  if (loading) {
    return <div>Loading rules...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {isFormVisible && (
        <FinderRuleForm
          rule={selectedRule}
          onSave={handleSave}
          onCancel={() => {
            setIsFormVisible(false);
            setSelectedRule(null);
          }}
        />
      )}
      <div className="px-6 py-4">
        <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Add New Rule
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Gemstone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary Gemstone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">{rule.nameNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rule.dobNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rule.primaryGemstone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{rule.secondaryGemstone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(rule)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(rule.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinderRuleList;
