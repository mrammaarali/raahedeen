"use client";

import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';
import { FinderRule } from '../hooks/useFinderRules';

interface FinderRuleFormProps {
  rule?: FinderRule | null;
  onClose: () => void;
}

const FinderRuleForm: React.FC<FinderRuleFormProps> = ({ rule, onClose }) => {
  const [formData, setFormData] = useState<Partial<FinderRule>>({});

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({ 
        nameNumber: 1, 
        dobNumber: 1, 
        primaryGemstone: '', 
        secondaryGemstone: '', 
        explanation: '', 
        disclaimer: '' 
      });
    }
  }, [rule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const id = rule?.id || `${formData.nameNumber}-${formData.dobNumber}`;
    const docRef = doc(db, 'finderRules', id);
    await setDoc(docRef, { ...formData, id, lastUpdated: serverTimestamp() }, { merge: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{rule ? 'Edit' : 'Add'} Finder Rule</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-4">
          <input name="nameNumber" type="number" min="1" max="9" value={formData.nameNumber} onChange={handleChange} placeholder="Name Number (1-9)" className="w-full p-2 rounded bg-gray-700" />
          <input name="dobNumber" type="number" min="1" max="9" value={formData.dobNumber} onChange={handleChange} placeholder="DOB Number (1-9)" className="w-full p-2 rounded bg-gray-700" />
          <input name="primaryGemstone" value={formData.primaryGemstone} onChange={handleChange} placeholder="Primary Gemstone" className="w-full p-2 rounded bg-gray-700" />
          <input name="secondaryGemstone" value={formData.secondaryGemstone} onChange={handleChange} placeholder="Secondary Gemstone" className="w-full p-2 rounded bg-gray-700" />
          <textarea name="explanation" value={formData.explanation} onChange={handleChange} placeholder="Explanation" className="w-full p-2 rounded bg-gray-700 h-24"></textarea>
          <textarea name="disclaimer" value={formData.disclaimer} onChange={handleChange} placeholder="Disclaimer/Notes" className="w-full p-2 rounded bg-gray-700 h-24"></textarea>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black">Save Rule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinderRuleForm;
