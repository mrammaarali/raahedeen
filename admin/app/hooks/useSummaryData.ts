"use client";

import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

const useSummaryData = () => {
  const [data, setData] = useState({
    users: 0,
    gemstoneRequests: 0,
    products: 0,
    audiobookChapters: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirebaseDb();

        const usersCol = collection(db, 'users');
        const gemstoneRequestsCol = collection(db, 'gemstoneRequests');
        const productsCol = collection(db, 'products');
        const audiobookChaptersCol = collection(db, 'audiobookChapters');

        const [usersSnap, gemstoneRequestsSnap, productsSnap, audiobookChaptersSnap] = await Promise.all([
          getCountFromServer(usersCol),
          getCountFromServer(gemstoneRequestsCol),
          getCountFromServer(productsCol),
          getCountFromServer(audiobookChaptersCol),
        ]);

        setData({
          users: usersSnap.data().count,
          gemstoneRequests: gemstoneRequestsSnap.data().count,
          products: productsSnap.data().count,
          audiobookChapters: audiobookChaptersSnap.data().count,
        });
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useSummaryData;
