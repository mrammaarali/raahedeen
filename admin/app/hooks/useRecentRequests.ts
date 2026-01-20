"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

interface GemstoneRequest {
  id: string;
  name: string;
  dob: string;
  city: string;
  gender: string;
  recommendedGemstone: string;
  createdAt: any;
}

const useRecentRequests = () => {
  const [requests, setRequests] = useState<GemstoneRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const db = getFirebaseDb();
        const requestsCol = collection(db, 'gemstoneRequests');
        const q = query(requestsCol, orderBy('createdAt', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GemstoneRequest));
        setRequests(requestsData);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return { requests, loading, error };
};

export default useRecentRequests;
