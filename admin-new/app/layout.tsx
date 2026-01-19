import './globals.css';
import React from 'react';
import { AuthProvider } from "./components/AuthProvider";
import { ToasterProvider } from "./components/ToasterProvider";

export const metadata = {
  title: 'RaaheDeen Admin',
  description: 'Admin panel for RaaheDeen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b1220] text-gray-100">
        <AuthProvider>
          <ToasterProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
