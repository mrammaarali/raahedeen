"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '../firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  creationTime: string;
  // Language preference would likely be stored in Firestore, not Auth.
  // This is a placeholder.
  language?: string; 
}

const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // NOTE: Listing users requires a Firebase Cloud Function with admin privileges.
        // This client-side code assumes a function named 'listUsers' is deployed.
        const app = getFirebaseApp();
        const functions = getFunctions(app);
        const listUsers = httpsCallable(functions, 'listUsers');
        const result = await listUsers();
        setUsers(result.data as AppUser[]);
      } catch (err: any) {
        setError(err);
        console.error('You need to deploy the `listUsers` cloud function.', err);
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

export default useUsers;
