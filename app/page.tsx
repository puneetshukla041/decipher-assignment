'use client';

import { useState } from 'react';
import { useFinancials } from '@/context/FinancialContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, AlertCircle, Loader2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { data, loading, error, fetchCompanyData } = useFinancials();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) fetchCompanyData(searchInput.trim());
  };

  // Helper to extract and format Revenues for the chart
  const extractRevenues = () => {
    if (!data?.facts?.['us-gaap']?.Revenues) return [];
    
    // Grab the annual ('FY') data units
    const rawUnits = data.facts['us-gaap'].Revenues.units.USD;
    return rawUnits
      .filter((item: any) => item.form === '10-K') // Only get annual reports
      .map((item: any) => ({
        year: item.fy,
        revenue: item.val / 1000000, // Convert to Millions
      }))
      .slice(-5); // Get last 5 years
  };

  const chartData = extractRevenues();

  const exportCSV = () => {
    if (!chartData.length) return;
    
    // FIXED: Explicitly typed 'row' to resolve the TypeScript "implicit any" error
    const csvContent = "Year,Revenue (Millions USD)\n" + 
      chartData.map((row: { year: string | number; revenue: number }) => `${row.year},${row.revenue}`).join("\n");
      
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${data.entityName || 'company'}_revenues.csv`);
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto font-sans">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Financial Explorer</h1>
        <p className="text-gray-500 mt-2">Powered by SEC EDGAR API</p>
      </header>

      {/* Search Section */}
      <section className="mb-10 relative">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter CIK (e.g., 320193 for Apple)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
          </button>
        </form>
      </section>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 mb-8 border border-red-100">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Data Dashboard */}
      {data && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-medium">{data.entityName}</h2>
              <p className="text-gray-500 mt-1">CIK: {data.cik}</p>
            </div>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* Chart Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium">Annual Revenue (Millions)</h3>
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#000000" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No annual revenue data found in standard GAAP format.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}