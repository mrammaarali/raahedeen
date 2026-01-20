interface TableProps {
  columns: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
}

const Table: React.FC<TableProps> = ({ columns, data, renderRow }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
