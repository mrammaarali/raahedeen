"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '../firebase';

interface AppUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

const app = getFirebaseApp();
const functions = getFunctions(app);
const listUsersCallable = httpsCallable(functions, 'listUsers');
const setAdminRoleCallable = httpsCallable(functions, 'setAdminRole');

const UserList = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await listUsersCallable();
      const usersData = result.data as AppUser[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. You must be an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (uid: string, isAdmin: boolean) => {
    if (window.confirm(`Are you sure you want to ${isAdmin ? 'remove admin role from' : 'make'} this user an admin?`)) {
      try {
        await setAdminRoleCallable({ uid, admin: !isAdmin });
        alert('User role updated successfully. Refreshing user list.');
        fetchUsers(); // Refresh the list
      } catch (error) { 
        console.error('Error updating user role:', error);
        alert('Failed to update user role. Check console for details.');
      }
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.uid}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.uid}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => toggleAdminRole(user.uid, user.isAdmin)} className="text-indigo-600 hover:text-indigo-900">
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
