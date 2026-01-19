"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

interface Rule {
  id: string;
  nameNumber: number;
  dobNumber: number;
  primaryGemstone: string;
  secondaryGemstone: string;
  explanation: string;
  disclaimer: string;
}

export default function FinderRuleManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const rulesCollection = collection(db, 'gemstone_finder_rules');
    const snapshot = await getDocs(rulesCollection);
    let ruleList: Rule[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));

    if (ruleList.length !== 81) {
      const existingIds = new Set(ruleList.map(r => r.id));
      for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= 9; j++) {
          const ruleId = `${i}-${j}`;
          if (!existingIds.has(ruleId)) {
            const newRule: Rule = {
              id: ruleId,
              nameNumber: i,
              dobNumber: j,
              primaryGemstone: '',
              secondaryGemstone: '',
              explanation: '',
              disclaimer: '',
            };
            const db = getFirebaseDb();
            await setDoc(doc(db, 'gemstone_finder_rules', ruleId), newRule);
            ruleList.push(newRule);
          }
        }
      }
    }

    ruleList.sort((a, b) => a.nameNumber - b.nameNumber || a.dobNumber - b.dobNumber);
    setRules(ruleList);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const db = getFirebaseDb();
    const ruleDoc = doc(db, 'gemstone_finder_rules', editingRule.id);
    await updateDoc(ruleDoc, {
        primaryGemstone: editingRule.primaryGemstone,
        secondaryGemstone: editingRule.secondaryGemstone,
        explanation: editingRule.explanation,
        disclaimer: editingRule.disclaimer,
    });
    setEditingRule(null);
    fetchRules();
  };

  const renderEditModal = () => {
    if (!editingRule) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-navy-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gold-500 mb-4">Edit Rule for Name: {editingRule.nameNumber}, DOB: {editingRule.dobNumber}</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <input type="text" placeholder="Primary Gemstone" value={editingRule.primaryGemstone} onChange={(e) => setEditingRule({ ...editingRule, primaryGemstone: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
            <input type="text" placeholder="Secondary Gemstone" value={editingRule.secondaryGemstone} onChange={(e) => setEditingRule({ ...editingRule, secondaryGemstone: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" />
            <textarea placeholder="Explanation" value={editingRule.explanation} onChange={(e) => setEditingRule({ ...editingRule, explanation: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-24" />
            <textarea placeholder="Disclaimer/Notes" value={editingRule.disclaimer} onChange={(e) => setEditingRule({ ...editingRule, disclaimer: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-20" />
            <div className="flex gap-4">
              <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black font-medium">Update Rule</button>
              <button type="button" onClick={() => setEditingRule(null)} className="px-4 py-2 rounded bg-gray-600 text-white">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gold-500 mb-4">Gemstone Finder Rules</h2>
      {loading ? <p>Loading rules...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-navy-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DOB #</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Primary Gemstone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Secondary Gemstone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-navy-800 divide-y divide-gray-700">
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{rule.nameNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{rule.dobNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{rule.primaryGemstone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{rule.secondaryGemstone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button onClick={() => setEditingRule(rule)} className="text-blue-400 hover:text-blue-300">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderEditModal()}
    </div>
  );
}
