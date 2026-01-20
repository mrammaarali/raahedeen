"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface AudiobookChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  audioUrl: string;
  isFree: boolean;
  coverImage: string;
  isActive: boolean;
}

const useAudiobookChapters = () => {
  const [chapters, setChapters] = useState<AudiobookChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const chaptersCol = collection(db, 'audiobookChapters');
    const q = query(chaptersCol, orderBy('order'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chaptersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AudiobookChapter));
      setChapters(chaptersData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { chapters, loading, error };
};

export default useAudiobookChapters;
