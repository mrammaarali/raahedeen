"use client";

import useRecentRequests from '../hooks/useRecentRequests';

const RecentRequests = () => {
  const { requests, loading, error } = useRecentRequests();

  if (loading) {
    return <div>Loading recent requests...</div>;
  }

  if (error) {
    return <div>Error loading requests: {error.message}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Recent Gemstone Finder Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recommended Gemstone</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{request.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.dob}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.recommendedGemstone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRequests;
