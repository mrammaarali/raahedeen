"use client";

import withAdminAuth from '../components/withAdminAuth';
import SummaryCard from '../components/SummaryCard';
import useSummaryData from '../hooks/useSummaryData';
import RecentRequests from '../components/RecentRequests';

const DashboardPage = () => {
  const { data, loading, error } = useSummaryData();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Users" value={data.users} icon={<span></span>} />
        <SummaryCard title="Total Gemstone Requests" value={data.gemstoneRequests} icon={<span></span>} />
        <SummaryCard title="Total Products" value={data.products} icon={<span></span>} />
        <SummaryCard title="Total Audiobook Chapters" value={data.audiobookChapters} icon={<span></span>} />
      </div>
      <RecentRequests />
    </div>
  );
};

export default withAdminAuth(DashboardPage);
