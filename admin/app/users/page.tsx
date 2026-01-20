"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '../firebase';
import useUsers, { AppUser } from '../hooks/useUsers';
import Table from '../components/Table';

const NotificationForm = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all'); // 'all' or a language code
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      alert('Title and body are required.');
      return;
    }
    setSending(true);
    try {
      // NOTE: This requires the 'sendBroadcast' Firebase Cloud Function.
      const app = getFirebaseApp();
      const functions = getFunctions(app);
      const sendBroadcast = httpsCallable(functions, 'sendBroadcast');
      await sendBroadcast({ title, body, language: target });
      alert('Notification sent successfully!');
      setTitle('');
      setBody('');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">Send Push Notification</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification Title" className="w-full p-2 rounded bg-gray-700" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notification Body" className="w-full p-2 rounded bg-gray-700"></textarea>
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full p-2 rounded bg-gray-700">
          <option value="all">All Users</option>
          <option value="EN">English</option>
          <option value="HI">Hindi</option>
          <option value="UR">Urdu</option>
          <option value="AR">Arabic</option>
        </select>
        <button type="submit" disabled={sending} className="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-500">
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

const UsersPage = () => {
  const { users, loading, error } = useUsers();

  const promoteToAdmin = async (uid: string) => {
    if (window.confirm('Are you sure you want to promote this user to admin?')) {
      try {
        // NOTE: This requires the 'setAdminRole' Firebase Cloud Function.
        const app = getFirebaseApp();
        const functions = getFunctions(app);
        const setAdminRole = httpsCallable(functions, 'setAdminRole');
        await setAdminRole({ uid, makeAdmin: true });
        alert('User promoted to admin successfully!');
      } catch (err) {
        console.error('Error promoting user:', err);
        alert('Failed to promote user.');
      }
    }
  };

  const columns = ['Name', 'Email', 'Signup Date', 'Actions'];

  const renderRow = (user: AppUser) => (
    <tr key={user.uid}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.displayName || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(user.creationTime).toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => promoteToAdmin(user.uid)} className="text-indigo-400 hover:text-indigo-600">Promote to Admin</button>
      </td>
    </tr>
  );

  if (error) return <div>Error: {error.message}. Make sure the 'listUsers' cloud function is deployed.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users & Notifications</h1>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {loading ? <div>Loading users...</div> : <Table columns={columns} data={users} renderRow={renderRow} />}
      <NotificationForm />
    </div>
  );
};

export default withAdminAuth(UsersPage);
