"use client";

import { useState, useEffect } from 'react';

interface FinderRule {
  id?: string;
  nameNumber: number;
  dobNumber: number;
  primaryGemstone: string;
  secondaryGemstone: string;
  explanation: string;
  disclaimer: string;
}

interface FinderRuleFormProps {
  rule?: FinderRule | null;
  onSave: (rule: Omit<FinderRule, 'id'>) => void;
  onCancel: () => void;
}

const FinderRuleForm: React.FC<FinderRuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<FinderRule, 'id'>>({
    nameNumber: 1,
    dobNumber: 1,
    primaryGemstone: '',
    secondaryGemstone: '',
    explanation: '',
    disclaimer: '',
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    }
  }, [rule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{rule ? 'Edit' : 'Add'} Finder Rule</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nameNumber" type="number" min="1" max="9" value={formData.nameNumber} onChange={handleChange} placeholder="Name Number (1-9)" required className="w-full p-2 border rounded" />
            <input name="dobNumber" type="number" min="1" max="9" value={formData.dobNumber} onChange={handleChange} placeholder="DOB Number (1-9)" required className="w-full p-2 border rounded" />
          </div>
          <input name="primaryGemstone" value={formData.primaryGemstone} onChange={handleChange} placeholder="Primary Gemstone" required className="w-full p-2 border rounded" />
          <input name="secondaryGemstone" value={formData.secondaryGemstone} onChange={handleChange} placeholder="Secondary Gemstone" className="w-full p-2 border rounded" />
          <textarea name="explanation" value={formData.explanation} onChange={handleChange} placeholder="Explanation" className="w-full p-2 border rounded" rows={4} />
          <textarea name="disclaimer" value={formData.disclaimer} onChange={handleChange} placeholder="Disclaimer" className="w-full p-2 border rounded" rows={2} />
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinderRuleForm;
