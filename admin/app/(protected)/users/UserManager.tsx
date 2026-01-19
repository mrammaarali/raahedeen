"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

interface AppUser {
  id: string;
  name: string;
  email: string;
  language: string;
  isAdmin: boolean;
  createdAt: { seconds: number; nanoseconds: number; };
}

const notificationTemplates = [
    { title: 'New Audiobook Chapter', body: 'A new chapter has been added to the audiobook. Listen now!' },
    { title: 'New Gemstone Product', body: 'Check out our latest gemstone product, now available in the store.' },
    { title: 'Ramadan Reminder', body: 'A special reminder for the blessed month of Ramadan.' },
];

export default function UserManager() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ title: '', body: '', target: 'all' });
  const [sending, setSending] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (userId: string, isAdmin: boolean) => {
    if (window.confirm(`Are you sure you want to ${isAdmin ? 'demote' : 'promote'} this user?`)) {
      const db = getFirebaseDb();
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { isAdmin: !isAdmin });
      fetchUsers();
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
      e.preventDefault();
      setSending(true);
      console.log('Sending notification:', notification);
      alert(`Simulating sending notification to ${notification.target} users.\nTitle: ${notification.title}\nBody: ${notification.body}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSending(false);
      setNotification({ title: '', body: '', target: 'all' });
  }

  return (
    <div className="space-y-8">
      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">Users</h2>
        {loading ? <p>Loading users...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-navy-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-navy-800 divide-y divide-gray-700">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium"><span className={user.isAdmin ? 'text-gold-500' : 'text-gray-300'}>{user.isAdmin ? 'Admin' : 'User'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => handlePromote(user.id, user.isAdmin)} className="text-blue-400 hover:text-blue-300">{user.isAdmin ? 'Demote' : 'Promote'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-4">Send Push Notification</h2>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="flex gap-2 mb-4">
              {notificationTemplates.map(template => (
                  <button key={template.title} type="button" onClick={() => setNotification({...notification, title: template.title, body: template.body})} className="text-xs px-3 py-1 rounded-full bg-navy-900 hover:bg-navy-700 border border-gray-700">{template.title}</button>
              ))}
          </div>
          <input type="text" placeholder="Notification Title" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700" required />
          <textarea placeholder="Notification Body" value={notification.body} onChange={(e) => setNotification({ ...notification, body: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700 h-24" required />
          <select value={notification.target} onChange={(e) => setNotification({ ...notification, target: e.target.value })} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-700">
            <option value="all">All Users</option>
            <option value="en">English Users</option>
            <option value="hi">Hindi Users</option>
            <option value="ur">Urdu Users</option>
            <option value="ar">Arabic Users</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded bg-gold-500 text-black font-medium" disabled={sending}>{sending ? 'Sending...' : 'Send Notification'}</button>
        </form>
      </div>
    </div>
  );
}
