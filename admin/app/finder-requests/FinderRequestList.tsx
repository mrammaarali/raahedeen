"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../firebase';

interface FinderRequest {
  id: string;
  name: string;
  dob: string;
  city: string;
  gender: string;
  recommendedGemstone: string;
  createdAt: Timestamp;
}

const db = getFirebaseDb();

const FinderRequestList = () => {
  const [requests, setRequests] = useState<FinderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gemstoneRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData: FinderRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as FinderRequest);
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">{request.createdAt?.toDate().toLocaleDateString() ?? 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.dob}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.city}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.recommendedGemstone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinderRequestList;
