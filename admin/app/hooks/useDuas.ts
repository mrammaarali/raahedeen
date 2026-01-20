"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface Dua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  isActive: boolean;
}

const useDuas = () => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const duasCol = collection(db, 'duas');
    const q = query(duasCol, orderBy('title'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const duasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dua));
      setDuas(duasData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { duas, loading, error };
};

export default useDuas;
