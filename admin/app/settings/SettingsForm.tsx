"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

interface AppSettings {
  whatsappNumber?: string;
  // Add other global settings here
}

const db = getFirebaseDb();
const settingsDocRef = doc(db, 'app_settings', 'global');

const SettingsForm = () => {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(settingsDocRef, settings, { merge: true });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700">
            WhatsApp Number for Orders
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="text"
            value={settings.whatsappNumber || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="+1234567890"
          />
        </div>
        {/* Add other settings fields here */}
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
