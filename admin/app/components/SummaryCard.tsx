interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
      <div className="text-3xl text-gold-500">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
