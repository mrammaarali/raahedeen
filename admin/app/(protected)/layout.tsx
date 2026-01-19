"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import AdminHeader from '../components/AdminHeader';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-950">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-navy-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
