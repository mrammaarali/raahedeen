import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
}

export default function DashboardCard({ title, value, icon, href }: DashboardCardProps) {
  return (
    <Link href={href}>
      <div className="bg-navy-800 p-6 rounded-lg shadow-lg hover:bg-navy-700 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="text-gold-500">
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}
