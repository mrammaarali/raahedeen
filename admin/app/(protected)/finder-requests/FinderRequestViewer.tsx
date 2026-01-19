"use client";

import React, { useState, useEffect } from 'react';
import { getFirebaseDb } from '../../firebase';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';

interface FinderRequest {
  id: string;
  name: string;
  dob: string;
  city: string;
  gender: string;
  recommendedGemstone: string;
  createdAt: Timestamp;
}

export default function FinderRequestViewer() {
  const [requests, setRequests] = useState<FinderRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<FinderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', gemstone: '', gender: '' });

  const fetchRequests = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    const requestsCollection = collection(db, 'gemstone_finder_requests');
    const q = query(requestsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const requestList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinderRequest));
    setRequests(requestList);
    setFilteredRequests(requestList);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        filtered = filtered.filter(r => r.createdAt.toDate() >= start);
    }
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => r.createdAt.toDate() <= end);
    }
    if (filters.gemstone) {
        filtered = filtered.filter(r => r.recommendedGemstone.toLowerCase().includes(filters.gemstone.toLowerCase()));
    }
    if (filters.gender) {
        filtered = filtered.filter(r => r.gender.toLowerCase() === filters.gender.toLowerCase());
    }
    setFilteredRequests(filtered);
  }, [filters, requests]);

  const exportToCsv = () => {
    const headers = ['Name', 'DOB', 'City', 'Gender', 'Recommended Gemstone', 'Date'];
    const csvRows = [
        headers.join(','),
        ...filteredRequests.map(r => [
            `"${r.name}"`,
            `"${r.dob}"`,
            `"${r.city}"`,
            `"${r.gender}"`,
            `"${r.recommendedGemstone}"`,
            `"${r.createdAt.toDate().toLocaleDateString()}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'finder-requests.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-navy-800 border border-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gold-500 mb-4">Gemstone Finder Requests</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-gray-700 rounded-md">
        <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        <input type="text" placeholder="Filter by Gemstone" value={filters.gemstone} onChange={e => setFilters({...filters, gemstone: e.target.value})} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-600" />
        <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})} className="w-full px-3 py-2 rounded bg-navy-900 border border-gray-600">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={exportToCsv} className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium">Export as CSV</button>
      </div>

      {loading ? <p>Loading requests...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-navy-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DOB</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">City</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recommended Gemstone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-navy-800 divide-y divide-gray-700">
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.dob}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.city}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.gender}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.recommendedGemstone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{req.createdAt.toDate().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
