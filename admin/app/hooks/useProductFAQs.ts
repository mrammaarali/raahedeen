"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface ProductFAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

const useProductFAQs = (productId: string) => {
  const [faqs, setFaqs] = useState<ProductFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const db = getFirebaseDb();
    const faqsCol = collection(db, 'products', productId, 'faqs');
    const q = query(faqsCol, orderBy('displayOrder'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const faqsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductFAQ));
      setFaqs(faqsData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  return { faqs, loading, error };
};

export default useProductFAQs;
