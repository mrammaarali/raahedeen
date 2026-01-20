"use client";

import withAdminAuth from '../components/withAdminAuth';

import { useState } from 'react';
import useFinderRequests, { FinderRequest, Filters } from '../hooks/useFinderRequests';
import Table from '../components/Table';

const FinderRequestsPage = () => {
  const [filters, setFilters] = useState<Filters>({});
  const { requests, loading, error } = useFinderRequests(filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value ? (name.includes('Date') ? new Date(value) : value) : undefined }));
  };

  const exportToCsv = () => {
    const headers = ['Name', 'DOB', 'City', 'Gender', 'Recommended Gemstone', 'Date'];
    const rows = requests.map(req => [
      `"${req.name}"`,
      `"${req.dob}"`,
      `"${req.city}"`,
      `"${req.gender}"`,
      `"${req.recommendedGemstone}"`,
      `"${req.createdAt.toDate().toLocaleDateString()}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gemstone-requests.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = ['Name', 'DOB', 'City', 'Gender', 'Recommended Gemstone', 'Date'];

  const renderRow = (request: FinderRequest) => (
    <tr key={request.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{request.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.dob}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.city}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.gender}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.recommendedGemstone}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{request.createdAt.toDate().toLocaleDateString()}</td>
    </tr>
  );

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Finder Requests</h1>
        <button onClick={exportToCsv} className="px-4 py-2 rounded bg-green-500 text-black" disabled={requests.length === 0}>
          Export CSV
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
        <input type="date" name="startDate" onChange={handleFilterChange} className="p-2 rounded bg-gray-700" />
        <input type="date" name="endDate" onChange={handleFilterChange} className="p-2 rounded bg-gray-700" />
        <input type="text" name="gemstone" onChange={handleFilterChange} placeholder="Filter by Gemstone" className="p-2 rounded bg-gray-700" />
        <select name="gender" onChange={handleFilterChange} className="p-2 rounded bg-gray-700">
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      {loading ? <div>Loading requests...</div> : <Table columns={columns} data={requests} renderRow={renderRow} />}
    </div>
  );
};

export default withAdminAuth(FinderRequestsPage);
