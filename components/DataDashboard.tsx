import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import MetricHighlight from '@/components/MetricHighlight';
import { SECCompanyFacts } from '@/types/financial';

type RevenueRow = {
  year: string | number;
  revenue: number;
};

type DataDashboardProps = {
  data: SECCompanyFacts;
  chartData: RevenueRow[];
  exportCSV: () => void;
};

export default function DataDashboard({ data, chartData, exportCSV }: DataDashboardProps) {
  const latestRevenue = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
  const previousRevenue = chartData.length > 1 ? chartData[chartData.length - 2].revenue : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8 px-2">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-950">{data.entityName}</h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3.5 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full border border-gray-200">
              CIK: {data.cik}
            </span>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          <Download className="h-5 w-5 text-gray-500" /> Export Revenue CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricHighlight
          title="Latest Annual Revenue"
          value={latestRevenue}
          previousValue={previousRevenue}
          icon={DollarSign}
          prefix="$"
          suffix="M"
        />
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm shadow-indigo-50 backdrop-blur-3xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 bg-gray-950 text-white rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-950">Annual Revenue Trend</h3>
            <p className="text-sm text-gray-500">Trailing 5 Years (Millions USD)</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }} dx={-15} tickFormatter={(value) => `$${value}M`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '20px',
                    border: '1px solid #F3F4F6',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.06)',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    padding: '16px 20px',
                    fontWeight: 600,
                  }}
                  itemStyle={{ color: '#000', fontSize: '15px' }}
                  labelStyle={{ color: '#6B7280', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}
                  formatter={(value: any) => value !== undefined ? [`$${Number(value).toFixed(1)} Million`, 'Revenue'] : ['N/A', 'Revenue']}
                />
                <Line
                  type="natural"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#4f46e5' }}
                  animationDuration={1800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <TrendingDown className="h-10 w-10 text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">Standard GAAP Revenue Not Found</h4>
            <p className="text-gray-500 max-w-sm">We couldn't visualize the revenue because this entity uses a non-standard reporting format for US-GAAP Revenues.</p>
          </div>
        )}
      </div>
    </div>
  );
}