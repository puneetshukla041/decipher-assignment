'use client';

import { useState } from 'react';
import { useFinancials } from '@/context/FinancialContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, AlertCircle, Loader2, Download, Building2, TrendingDown, DollarSign } from 'lucide-react';
import { saveAs } from 'file-saver';

// UI/UX Component: The Adaptable Search Bar
const SearchBar = ({ input, setInput, handleSearch, loading, compact }: any) => (
  <form onSubmit={handleSearch} className={`w-full ${compact ? 'max-w-xl' : 'max-w-2xl'}`}>
    <div className={`relative ${compact ? '' : 'shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)]'}`}>
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
      <input
        type="text"
        placeholder="Search CIK (e.g., 320193 for Apple)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={`w-full pl-16 pr-8 bg-white border border-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300 ${compact ? 'py-3 text-base' : 'py-6 text-xl'}`}
      />
      <button
        type="submit"
        disabled={loading}
        className={`absolute right-3 top-1/2 -translate-y-1/2 bg-gray-950 text-white rounded-full font-semibold hover:bg-gray-800 active:scale-95 transition-all duration-200 disabled:opacity-70 flex items-center justify-center ${compact ? 'px-6 py-2' : 'px-8 py-4'}`}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
      </button>
    </div>
  </form>
);

// UI/UX Component: Key Metric Highlight Card
const MetricHighlight = ({ title, value, previousValue, icon: Icon, prefix = '', suffix = '' }: any) => {
  const isPositive = previousValue && value > previousValue;
  const isNegative = previousValue && value < previousValue;
  
  const percentageChange = previousValue 
    ? ((value - previousValue) / previousValue) * 100 
    : null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-indigo-50/50 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`p-3 rounded-xl ${isNegative ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">
          {prefix}{value.toFixed(1)}{suffix}
        </p>
        {percentageChange !== null && (
          <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-medium ${isNegative ? 'text-red-600' : 'text-indigo-600'}`}>
            {isNegative ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}% YoY
          </div>
        )}
      </div>
    </div>
  );
};

// UI/UX Component: The Primary Data Dashboard
const DataDashboard = ({ data, chartData, exportCSV }: any) => {
  // UX: Calculate Key Metrics for context
  const latestRevenue = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
  const previousRevenue = chartData.length > 1 ? chartData[chartData.length - 2].revenue : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out space-y-10">
      {/* Entity Header */}
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

      {/* Metric Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricHighlight 
          title="Latest Annual Revenue" 
          value={latestRevenue} 
          previousValue={previousRevenue}
          icon={DollarSign} 
          prefix="$" 
          suffix="M" 
        />
        {/* You can add more metric components here, e.g., Net Income, R&D Expenses */}
      </div>

      {/* Chart Card */}
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
                {/* Visual Research: Faded grid and formatted axis reduce noise */}
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 13, fontWeight: 500}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 13, fontWeight: 500}} 
                  dx={-15}
                  tickFormatter={(value) => `$${value}M`}
                />
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
                  formatter={(value: any) => [`$${value.toFixed(1)} Million`, 'Revenue']}
                />
                {/* Visual Research: Indigo line, smoother type, dotted nodes */}
                <Line 
                  type="natural" 
                  dataKey="revenue" 
                  stroke="#4f46e5" /* Indigo 600 */
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
            <TrendingUp className="h-10 w-10 text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">Standard GAAP Revenue Not Found</h4>
            <p className="text-gray-500 max-w-sm">We couldn't visualize the revenue because this entity uses a non-standard reporting format for US-GAAP Revenues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// UI/UX Component: The Adaptable Main Page Layout
export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { data, loading, error, fetchCompanyData } = useFinancials();

  // Visual Research: The entire layout structure shifts based on whether data exists
  const hasData = data && !loading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) fetchCompanyData(searchInput.trim());
  };

  const extractRevenues = () => {
    if (!data?.facts?.['us-gaap']?.Revenues) return [];
    const rawUnits = data.facts['us-gaap'].Revenues.units.USD;
    return rawUnits
      .filter((item: any) => item.form === '10-K')
      .map((item: any) => ({
        year: item.fy,
        revenue: item.val / 1000000, 
      }))
      .slice(-5);
  };

  const chartData = extractRevenues();

  const exportCSV = () => {
    if (!chartData.length) return;
    const csvContent = "Year,Revenue (Millions USD)\n" + 
      chartData.map((row: { year: string | number; revenue: number }) => `${row.year},${row.revenue}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${data.entityName || 'company'}_revenues.csv`);
  };

  return (
    <main className="min-h-screen font-sans">
      {/* Top Navigation Bar - Appears only when data exists */}
      {hasData && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-gray-950" />
              <h1 className="text-lg font-semibold tracking-tight text-gray-950">Financial Explorer</h1>
            </div>
            <SearchBar 
              input={searchInput} 
              setInput={setSearchInput} 
              handleSearch={handleSearch} 
              loading={loading} 
              compact 
            />
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto p-6 md:p-12 ${hasData ? 'pt-28 md:pt-32' : ''}`}>
        
        {/* State: Initial Hero View (No Data) */}
        {!hasData && (
          <header className={`animate-in fade-in duration-500 flex flex-col items-center ${error ? 'mb-10 mt-10' : 'mb-12 mt-20'}`}>
            <div className="w-full max-w-2xl bg-white p-16 rounded-[3rem] border border-gray-100 shadow-[0_30px_90px_-20px_rgba(79,70,229,0.06)] flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-3xl mb-8 border border-indigo-100">
                <Building2 className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-950 mb-4">
                Financial Explorer
              </h1>
              <p className="text-xl text-gray-500 max-w-md mb-12">
                Instantly access verified SEC filing data. Visualize company health in seconds.
              </p>
              
              {/* Central Search Bar */}
              <SearchBar 
                input={searchInput} 
                setInput={setSearchInput} 
                handleSearch={handleSearch} 
                loading={loading} 
              />
              
              <p className="text-sm text-gray-400 mt-6">Try Apple: 320193 | Microsoft: 789019 | Tesla: 1318605</p>
            </div>
          </header>
        )}

        {/* State: Error Feedback */}
        {error && (
          <div className="animate-in slide-in-from-top-6 fade-in duration-500 max-w-xl mx-auto p-5 bg-red-50/70 backdrop-blur-md text-red-600 rounded-3xl flex items-center gap-4 mb-12 border border-red-100 shadow-sm shadow-red-50">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* State: Data Dashboard View */}
        {hasData && (
          <DataDashboard data={data} chartData={chartData} exportCSV={exportCSV} />
        )}
      </div>
    </main>
  );
}