"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface FinderRule {
  id: string;
  nameNumber: number;
  dobNumber: number;
  primaryGemstone: string;
  secondaryGemstone: string;
  explanation: string;
  disclaimer: string;
}

const useFinderRules = () => {
  const [rules, setRules] = useState<FinderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const rulesCol = collection(db, 'finderRules');
    const q = query(rulesCol, orderBy('nameNumber'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinderRule));
      setRules(rulesData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { rules, loading, error };
};

export default useFinderRules;
