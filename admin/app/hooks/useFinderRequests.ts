"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface FinderRequest {
  id: string;
  name: string;
  dob: string;
  city: string;
  gender: string;
  recommendedGemstone: string;
  createdAt: Timestamp;
}

export interface Filters {
  startDate?: Date | null;
  endDate?: Date | null;
  gemstone?: string;
  gender?: string;
}

const useFinderRequests = (filters: Filters) => {
  const [requests, setRequests] = useState<FinderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const requestsCol = collection(db, 'gemstoneRequests');
    
    let q = query(requestsCol, orderBy('createdAt', 'desc'));

    if (filters.startDate) {
      q = query(q, where('createdAt', '>=', filters.startDate));
    }
    if (filters.endDate) {
      q = query(q, where('createdAt', '<=', filters.endDate));
    }
    if (filters.gemstone) {
      q = query(q, where('recommendedGemstone', '==', filters.gemstone));
    }
    if (filters.gender) {
      q = query(q, where('gender', '==', filters.gender));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinderRequest));
      setRequests(requestsData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters]);

  return { requests, loading, error };
};

export default useFinderRequests;
