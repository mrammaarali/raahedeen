"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  isActive: boolean;
  whatsappMessage: string;
  sortOrder: number;
}

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const productsCol = collection(db, 'products');
    const q = query(productsCol, orderBy('sortOrder'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      setLoading(false);
    }, (err: any) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

export default useProducts;
