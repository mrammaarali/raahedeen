"use client";

import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="border-b border-gray-800 sticky top-0 z-10 bg-[#0b1220]/80 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-yellow-500" />
          <h1 className="font-semibold text-lg">RaaheDeen Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
