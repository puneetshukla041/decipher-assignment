'use client';

import { useState } from 'react';
import { useFinancials } from '@/context/FinancialContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, AlertCircle, Loader2, Download, Building2 } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { data, loading, error, fetchCompanyData } = useFinancials();

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
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="mb-16 mt-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Building2 className="w-8 h-8 text-gray-900" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-3">
          Financial Explorer
        </h1>
        <p className="text-lg text-gray-500 max-w-xl">
          Instantly visualize SEC EDGAR filing data with premium clarity.
        </p>
      </header>

      {/* Glassmorphic Search Section */}
      <section className="mb-12 relative z-10 flex justify-center">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-4 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors duration-300" />
            <input
              type="text"
              placeholder="Enter CIK (e.g., 320193 for Apple)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all duration-300 text-lg placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center shadow-lg shadow-black/10"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Analyze'}
          </button>
        </form>
      </section>

      {/* Error State */}
      {error && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 max-w-2xl mx-auto p-4 bg-red-50/80 backdrop-blur-md text-red-600 rounded-2xl flex items-center gap-3 mb-8 border border-red-100 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Data Dashboard */}
      {data && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          {/* Company Title Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">{data.entityName}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-gray-200/50 text-gray-600 text-sm font-medium rounded-full">
                  CIK: {data.cik}
                </span>
              </div>
            </div>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>

          {/* Premium Chart Card */}
          <div className="bg-white/60 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3.5 bg-black text-white rounded-2xl shadow-md">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Annual Revenue</h3>
                <p className="text-sm text-gray-500">Trailing 5 Years (Millions USD)</p>
              </div>
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 14}} 
                      dy={15} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 14}} 
                      dx={-10}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: '1px solid rgba(255,255,255,0.8)', 
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '12px 20px',
                        fontWeight: 500
                      }}
                      itemStyle={{ color: '#000' }}
                    />
                    <Line 
                      type="natural" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke="#000000" 
                      strokeWidth={4}
                      dot={{ r: 5, strokeWidth: 0, fill: '#000' }}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3, shadow: '0 0 10px rgba(0,0,0,0.3)' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">No Revenue Data</h4>
                <p className="text-gray-500">We couldn't find standard GAAP revenue formatting for this entity.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}