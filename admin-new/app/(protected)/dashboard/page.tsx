"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import DashboardCard from '@/app/components/DashboardCard';
import { Users, ListMusic, Gem, FileText, Settings, BookOpen } from 'lucide-react';

interface Stat {
  totalUsers: number;
  totalChapters: number;
  totalProducts: number;
  totalDuas: number;
}

interface RecentRequest {
    id: string;
    name: string;
    dob: string;
    problem: string;
    recommendedStone?: string;
    status: string;
    createdAt: any;
}

interface RecentUser {
    id: string;
    displayName: string;
    email: string;
    country?: string;
    createdAt: any;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stat | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirebaseDb();
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const chaptersSnapshot = await getDocs(collection(db, 'audiobook_chapters'));
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const duasSnapshot = await getDocs(collection(db, 'duas'));

        const recentRequestsQuery = query(collection(db, 'gemstone_finder_requests'), orderBy('createdAt', 'desc'), limit(5));
        const recentRequestsSnapshot = await getDocs(recentRequestsQuery);
        const recentRequestsData = recentRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecentRequest));

        const recentUsersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsersData = recentUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecentUser));

        setStats({
          totalUsers: usersSnapshot.size,
          totalChapters: chaptersSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalDuas: duasSnapshot.size,
        });
        setRecentRequests(recentRequestsData);
        setRecentUsers(recentUsersData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value={stats?.totalUsers ?? 0} href="/users" icon={<Users size={24} />} />
        <DashboardCard title="Total Chapters" value={stats?.totalChapters ?? 0} href="/chapters" icon={<ListMusic size={24} />} />
        <DashboardCard title="Total Products" value={stats?.totalProducts ?? 0} href="/products" icon={<Gem size={24} />} />
        <DashboardCard title="Total Duas" value={stats?.totalDuas ?? 0} href="/duas" icon={<BookOpen size={24} />} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Last 5 Finder Requests</h2>
            <ul className="space-y-3">
                {recentRequests.map(req => (
                    <li key={req.id} className="p-3 rounded-lg bg-navy-700 hover:bg-navy-600 transition-colors">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span>{req.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{req.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">DOB: {req.dob} | Problem: {req.problem}</p>
                        <p className="text-xs text-gray-300 mt-1">Recommended: {req.recommendedStone || 'N/A'}</p>
                        <p className="text-xs text-gray-500 text-right mt-2">{req.createdAt?.toDate().toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
        <div className="bg-navy-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Last 5 Users Registered</h2>
            <ul className="space-y-3">
                {recentUsers.map(user => (
                    <li key={user.id} className="p-3 rounded-lg bg-navy-700 hover:bg-navy-600 transition-colors">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span>{user.displayName || user.email}</span>
                            <span className="text-gray-400">{user.country || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right mt-2">{user.createdAt?.toDate().toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
