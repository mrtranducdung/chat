import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface SalesChartProps {
  chartType: 'line' | 'bar' | 'pie' | 'table';
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  title: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const fmtVND = (v: number) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

const isMoney = (key: string) =>
  ['revenue', 'total_amount', 'amount'].includes(key.toLowerCase());

const SalesChart: React.FC<SalesChartProps> = ({ chartType, data, xKey, yKey, title }) => {
  if (!data?.length) return null;
  const money = isMoney(yKey);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mt-3 w-full">
      <p className="text-xs font-semibold text-gray-600 mb-3">📊 {title}</p>

      {chartType === 'line' && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={money ? fmtVND : undefined} tick={{ fontSize: 10 }} width={45} />
            <Tooltip formatter={(v: number) => [money ? `${v.toLocaleString('vi-VN')} ₫` : v, yKey]} />
            <Line type="monotone" dataKey={yKey} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartType === 'bar' && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout={data.length > 5 ? 'vertical' : 'horizontal'}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {data.length > 5 ? (
              <>
                <XAxis type="number" tickFormatter={money ? fmtVND : undefined} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey={xKey} tick={{ fontSize: 10 }} width={110} />
              </>
            ) : (
              <>
                <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={money ? fmtVND : undefined} tick={{ fontSize: 10 }} width={45} />
              </>
            )}
            <Tooltip formatter={(v: number) => [money ? `${v.toLocaleString('vi-VN')} ₫` : v, yKey]} />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === 'pie' && (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data} dataKey={yKey} nameKey={xKey}
              cx="50%" cy="50%" outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [money ? `${v.toLocaleString('vi-VN')} ₫` : v, yKey]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {chartType === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(data[0]).map(k => (
                  <th key={k} className="px-2 py-1.5 text-left font-medium text-gray-500 border-b">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  {Object.values(row).map((v: any, j) => (
                    <td key={j} className="px-2 py-1.5 text-gray-700">
                      {typeof v === 'number' && v > 1000 ? v.toLocaleString('vi-VN') : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesChart;