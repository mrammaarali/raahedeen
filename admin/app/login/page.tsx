"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../components/AuthProvider';
import LoginForm from './LoginForm';

const LoginPage = () => {
  const { user, isAdmin, loading } = useAuthContext();
  const router = useRouter();


  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || (user && isAdmin)) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Admin Login</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
