"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb, getFirebaseStorage } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import toast from 'react-hot-toast';

interface AppSettings {
  appName: string;
  whatsappNumber: string;
  radioStreamUrl: string;
  donationUPI: string;
  donationBankDetails: string;
  donationQRImageUrl?: string;
  enabledLanguages: ('EN' | 'HI' | 'UR' | 'AR')[];
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrImageFile, setQrImageFile] = useState<File | null>(null);

  const db = getFirebaseDb();
  const storage = getFirebaseStorage();
  const settingsDocRef = doc(db, 'app_settings', 'default');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLanguageChange = (lang: 'EN' | 'HI' | 'UR' | 'AR', checked: boolean) => {
    const currentLanguages = settings.enabledLanguages || [];
    let newLanguages;
    if (checked) {
      newLanguages = [...currentLanguages, lang];
    } else {
      newLanguages = currentLanguages.filter(l => l !== lang);
    }
    setSettings({ ...settings, enabledLanguages: newLanguages });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = new Promise<void>(async (resolve, reject) => {
        try {
            let updatedSettings = { ...settings };
            if (qrImageFile) {
                const storageRef = ref(storage, 'settings/donation_qr.jpg');
                await uploadBytes(storageRef, qrImageFile);
                const downloadURL = await getDownloadURL(storageRef);
                updatedSettings.donationQRImageUrl = downloadURL;
            }
            await setDoc(settingsDocRef, updatedSettings, { merge: true });
            setSettings(updatedSettings);
            resolve();
        } catch (error) {
            reject(error);
        }
    });

    toast.promise(promise, {
        loading: 'Saving settings...',
        success: 'Settings saved successfully!',
        error: 'Failed to save settings.',
    });
  };

  if (loading) return <p>Loading settings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">App Settings</h1>
      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl mx-auto">
        <div>
          <Label htmlFor="appName">App Name</Label>
          <Input id="appName" value={settings.appName ?? ''} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
          <Input id="whatsappNumber" value={settings.whatsappNumber ?? ''} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="radioStreamUrl">Radio Stream URL</Label>
          <Input id="radioStreamUrl" value={settings.radioStreamUrl ?? ''} onChange={(e) => setSettings({ ...settings, radioStreamUrl: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="donationUPI">Donation UPI ID</Label>
          <Input id="donationUPI" value={settings.donationUPI ?? ''} onChange={(e) => setSettings({ ...settings, donationUPI: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="donationBankDetails">Donation Bank Details</Label>
          <Textarea id="donationBankDetails" value={settings.donationBankDetails ?? ''} onChange={(e) => setSettings({ ...settings, donationBankDetails: e.target.value })} />
        </div>
        <div>
          <Label>Donation QR Code</Label>
          {settings.donationQRImageUrl && <img src={settings.donationQRImageUrl} alt="Donation QR Code" className="w-40 h-40 object-contain my-2" />}
          <Input type="file" onChange={(e) => setQrImageFile(e.target.files ? e.target.files[0] : null)} />
        </div>
        <div>
            <Label>Enabled Languages</Label>
            <div className="flex items-center space-x-4 mt-2">
                {(['EN', 'HI', 'UR', 'AR'] as const).map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                        <Checkbox id={`lang-${lang}`} checked={settings.enabledLanguages?.includes(lang)} onCheckedChange={(checked) => handleLanguageChange(lang, !!checked)} />
                        <Label htmlFor={`lang-${lang}`}>{lang}</Label>
                    </div>
                ))}
            </div>
        </div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
