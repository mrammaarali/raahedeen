import './globals.css';
import React from 'react';
import { AuthProvider } from './components/AuthProvider';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';

export const metadata = {
  title: 'RaaheDeen Admin',
  description: 'Admin panel for RaaheDeen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b1220] text-gray-100">
        <AuthProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col">
              <AdminHeader />
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
