"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface AppSettings {
  whatsappNumber: string;
  radioStreamUrl: string;
  donationUpi: string;
  donationBankDetails: string;
  donationQrImage: string;
  homeScreenBanners: string[];
  enabledLanguages: { EN: boolean; HI: boolean; UR: boolean; AR: boolean; };
  adsEnabled: boolean;
}

const useSettings = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const settingsDocRef = doc(db, 'settings', 'global');

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        // Initialize with default values if the document doesn't exist
        setSettings({
          whatsappNumber: '',
          radioStreamUrl: '',
          donationUpi: '',
          donationBankDetails: '',
          donationQrImage: '',
          homeScreenBanners: [],
          enabledLanguages: { EN: true, HI: true, UR: true, AR: true },
          adsEnabled: false,
        });
      }
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const db = getFirebaseDb();
    const settingsDocRef = doc(db, 'settings', 'global');
    await setDoc(settingsDocRef, { ...newSettings, lastUpdated: serverTimestamp() }, { merge: true });
  };

  return { settings, loading, error, updateSettings };
};

export default useSettings;
