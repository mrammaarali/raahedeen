"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth } from '../firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const auth = getFirebaseAuth();

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Please check your inbox.');
        setMode('login');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 bg-navy-800 border border-gray-800 rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' && 'Admin Login'}
        {mode === 'signup' && 'Admin Sign Up'}
        {mode === 'reset' && 'Reset Password'}
      </h1>
      {error && <p className="bg-red-500/20 text-red-500 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-md bg-navy-800 border border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500" required />
        </div>
        {mode !== 'reset' && (
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">Password</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-md bg-navy-800 border border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500" required />
          </div>
        )}
        <button type="submit" className="w-full py-2 px-4 bg-gold-500 text-black font-semibold rounded-md hover:bg-gold-600 transition-colors">
          {mode === 'login' && 'Login'}
          {mode === 'signup' && 'Sign Up'}
          {mode === 'reset' && 'Send Reset Email'}
        </button>
      </form>
      <div className="text-center mt-4 space-y-2">
        {mode === 'login' && (
          <p>Don't have an account? <button onClick={() => setMode('signup')} className="text-gold-500 hover:underline">Sign Up</button></p>
        )}
        {mode === 'signup' && (
          <p>Already have an account? <button onClick={() => setMode('login')} className="text-gold-500 hover:underline">Login</button></p>
        )}
        {mode !== 'reset' ? (
          <p><button onClick={() => setMode('reset')} className="text-sm text-gray-400 hover:underline">Forgot Password?</button></p>
        ) : (
          <p><button onClick={() => setMode('login')} className="text-sm text-gray-400 hover:underline">Back to Login</button></p>
        )}
      </div>
    </div>
  );
}
