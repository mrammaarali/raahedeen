"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface AppSettings {
  whatsappNumber: string;
  radioStreamUrl: string;
  donationUpi: string;
  donationBankDetails: string;
  donationQrUrl: string;
  homeBannerUrls: string[];
  enabledLanguages: { en: boolean; hi: boolean; ur: boolean; ar: boolean; };
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<AppSettings>({
    whatsappNumber: '',
    radioStreamUrl: '',
    donationUpi: '',
    donationBankDetails: '',
    donationQrUrl: '',
    homeBannerUrls: [],
    enabledLanguages: { en: true, hi: true, ur: true, ar: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const db = getFirebaseDb();
      const settingsDocRef = doc(db, 'app_settings', 'global');
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        const db = getFirebaseDb();
        const settingsDocRef = doc(db, 'app_settings', 'global');
        await setDoc(settingsDocRef, settings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const db = getFirebaseDb();
    const settingsDocRef = doc(db, 'app_settings', 'global');
    await setDoc(settingsDocRef, settings);
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'donationQrUrl' | 'homeBannerUrls') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storage = getFirebaseStorage();
    const storageRef = ref(storage, `settings/${field}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      null, 
      (error) => console.error('Upload failed:', error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        if (field === 'donationQrUrl') {
          setSettings(prev => ({ ...prev, donationQrUrl: downloadURL }));
        } else {
          setSettings(prev => ({ ...prev, homeBannerUrls: [...prev.homeBannerUrls, downloadURL] }));
        }
      }
    );
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="bg-navy-800 border border-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gold-500">Global App Settings</h2>
      
      <div className="space-y-4 p-4 border border-gray-700 rounded-md">
        <h3 className="font-medium">Contact & Links</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300">WhatsApp Number</label>
          <input type="text" value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} className="mt-1 w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Radio Stream URL</label>
          <input type="text" value={settings.radioStreamUrl} onChange={e => setSettings({...settings, radioStreamUrl: e.target.value})} className="mt-1 w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        </div>
      </div>

      <div className="space-y-4 p-4 border border-gray-700 rounded-md">
        <h3 className="font-medium">Donation Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300">UPI ID</label>
          <input type="text" value={settings.donationUpi} onChange={e => setSettings({...settings, donationUpi: e.target.value})} className="mt-1 w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Bank Details</label>
          <textarea value={settings.donationBankDetails} onChange={e => setSettings({...settings, donationBankDetails: e.target.value})} className="mt-1 w-full px-3 py-2 rounded bg-navy-900 border border-gray-600 h-24" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Donation QR Image</label>
          <input type="file" onChange={e => handleFileUpload(e, 'donationQrUrl')} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold-500 file:text-black" />
          {settings.donationQrUrl && <img src={settings.donationQrUrl} alt="Donation QR Code" className="mt-2 w-32 h-32 object-contain rounded" />}
        </div>
      </div>

      <div className="p-4 border border-gray-700 rounded-md">
        <h3 className="font-medium">Enabled Languages</h3>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(settings.enabledLanguages).map(lang => (
            <div key={lang} className="flex items-center gap-2">
              <input type="checkbox" id={`lang-${lang}`} checked={settings.enabledLanguages[lang as keyof typeof settings.enabledLanguages]} onChange={e => setSettings({...settings, enabledLanguages: {...settings.enabledLanguages, [lang]: e.target.checked}})} />
              <label htmlFor={`lang-${lang}`}>{lang.toUpperCase()}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-5">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded bg-gold-500 text-black font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
