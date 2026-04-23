'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFinancials } from '@/context/FinancialContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle,Search, Loader2, Download, TrendingUp, TrendingDown, Activity, Table as TableIcon, BarChart2, BrainCircuit, Printer } from 'lucide-react';
import { saveAs } from 'file-saver';

// --- ROBUST SEC DATA PARSER ---
// Companies use different GAAP tags. This function hunts for the correct one.
const extractFinancialData = (data: any, metric: string, yearsBack: number) => {
  if (!data?.facts?.['us-gaap']) return [];
  
  const metricMap: Record<string, string[]> = {
    'Revenue': ['Revenues', 'SalesRevenueNet', 'RevenueFromContractWithCustomerExcludingAssessedTax'],
    'Net Income': ['NetIncomeLoss'],
    'Assets': ['Assets'],
    'Liabilities': ['Liabilities']
  };

  const possibleKeys = metricMap[metric];
  let rawUnits = null;

  for (const key of possibleKeys) {
    if (data.facts['us-gaap'][key]?.units?.USD) {
      rawUnits = data.facts['us-gaap'][key].units.USD;
      break;
    }
  }

  if (!rawUnits) return [];

  // Filter for annual reports (10-K), map, and deduplicate years
  const annualData = rawUnits
    .filter((item: any) => item.form === '10-K')
    .map((item: any) => ({
      year: parseInt(item.fy),
      val: item.val / 1000000 // Convert to Millions
    }));

  // Deduplicate (SEC sometimes has multiple 10-K entries per year)
  const uniqueYears = new Map();
  annualData.forEach((item: any) => uniqueYears.set(item.year, item.val));
  
  return Array.from(uniqueYears, ([year, val]) => ({ year, val }))
    .sort((a, b) => a.year - b.year)
    .slice(-yearsBack);
};

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { data, loading, error, fetchCompanyData } = useFinancials();
  
  // Dashboard State
  const [activeMetric, setActiveMetric] = useState('Revenue');
  const [timeframe, setTimeframe] = useState(5);
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');
  
  // AI State
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const hasData = data && !loading;
  
  // Memoize data processing so it only runs when metric/timeframe changes
  const chartData = useMemo(() => {
    if (!hasData) return [];
    return extractFinancialData(data, activeMetric, timeframe);
  }, [data, hasData, activeMetric, timeframe]);

  const latestVal = chartData.length > 0 ? chartData[chartData.length - 1].val : 0;
  const prevVal = chartData.length > 1 ? chartData[chartData.length - 2].val : null;

  // Fetch AI Summary when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      const getSummary = async () => {
        setIsAiLoading(true);
        try {
          const res = await fetch('/api/summarize', {
            method: 'POST',
            body: JSON.stringify({
              entityName: data.entityName,
              metricName: activeMetric,
              latestValue: latestVal,
              previousValue: prevVal
            })
          });
          const json = await res.json();
          setAiSummary(json.summary);
        } catch (e) {
          setAiSummary("AI Analysis unavailable at this time.");
        } finally {
          setIsAiLoading(false);
        }
      };
      getSummary();
    }
  }, [chartData, activeMetric, data?.entityName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) fetchCompanyData(searchInput.trim());
  };

  const exportCSV = () => {
    if (!chartData.length) return;
    const csvContent = "Year,Value (Millions USD)\n" + 
      chartData.map(row => `${row.year},${row.val}`).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${data.entityName.replace(/\s+/g, '_')}_${activeMetric}.csv`);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Dynamic Navigation/Header */}
      <nav className={`w-full transition-all duration-500 ${hasData ? 'bg-white border-b border-slate-200 py-4 sticky top-0 z-50 shadow-sm no-print' : 'pt-32 pb-12'}`}>
        <div className={`max-w-6xl mx-auto px-6 flex ${hasData ? 'flex-row items-center justify-between gap-8' : 'flex-col items-center text-center'}`}>
          
          {/* Title Area */}
          <div className={hasData ? 'hidden md:block' : 'mb-10'}>
            <h1 className={`font-semibold tracking-tight text-slate-900 ${hasData ? 'text-xl' : 'text-5xl mb-4'}`}>
              Financial Explorer
            </h1>
            {!hasData && <p className="text-slate-500 text-lg max-w-lg mx-auto">High-fidelity SEC EDGAR financial analysis. Search any CIK to begin.</p>}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={`relative ${hasData ? 'w-full max-w-md' : 'w-full max-w-2xl'}`}>
            <Search className={`absolute text-slate-400 ${hasData ? 'left-4 top-2.5 h-5 w-5' : 'left-6 top-4 h-6 w-6'}`} />
            <input
              type="text"
              placeholder="Enter CIK (e.g., 320193 for Apple)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full bg-white border border-slate-200 text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${hasData ? 'pl-12 pr-4 py-2 text-sm' : 'pl-16 pr-6 py-4 text-lg'}`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`absolute right-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center ${hasData ? 'top-1.5 bottom-1.5 px-4 text-sm font-medium' : 'top-2 bottom-2 px-6 font-semibold'}`}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Analyze'}
            </button>
          </form>

        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Error Notification */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 no-print">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {hasData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10 space-y-8">
            
            {/* --- TOP ROW: Identity & Global Actions --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print-break-inside-avoid">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{data.entityName}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-md border border-slate-200">
                    CIK: {data.cik}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 no-print">
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  <Download className="h-4 w-4" /> CSV
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  <Printer className="h-4 w-4" /> PDF Report
                </button>
              </div>
            </div>

            {/* --- AI INSIGHT PANEL --- */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 print-break-inside-avoid">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold tracking-wide text-blue-900 uppercase">AI Analyst Insight</h3>
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-2 text-blue-600/60 h-6">
                  <Loader2 className="animate-spin h-4 w-4" /> Generating analysis...
                </div>
              ) : (
                <p className="text-blue-900 leading-relaxed">{aiSummary}</p>
              )}
            </div>

            {/* --- CONTROLS ROW --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm no-print">
              <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar">
                {['Revenue', 'Net Income', 'Assets', 'Liabilities'].map(metric => (
                  <button
                    key={metric}
                    onClick={() => setActiveMetric(metric)}
                    className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeMetric === metric ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
              <div className="flex w-full md:w-auto items-center gap-2 pr-2">
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                  <option value={20}>Max History</option>
                </select>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button onClick={() => setViewType('chart')} className={`p-2 rounded-lg ${viewType === 'chart' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  <BarChart2 className="h-5 w-5" />
                </button>
                <button onClick={() => setViewType('table')} className={`p-2 rounded-lg ${viewType === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                  <TableIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* --- DATA VISUALIZATION AREA --- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 print-break-inside-avoid">
              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeMetric} Trend</h3>
                  <p className="text-sm text-slate-500 mt-1">Stated in Millions USD</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 mb-1">Latest Year ({chartData[chartData.length-1]?.year || 'N/A'})</p>
                  <p className="text-2xl font-bold text-slate-900">${latestVal ? latestVal.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) : '0.0'}</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                viewType === 'chart' ? (
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value: any) => [`$${value.toLocaleString()} M`, activeMetric]}
                        />
                        <Bar dataKey="val" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4">Fiscal Year</th>
                          <th className="px-6 py-4 text-right">Value (Millions USD)</th>
                          <th className="px-6 py-4 text-right">YoY Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chartData.map((row, idx) => {
                          const prev = idx > 0 ? chartData[idx-1].val : null;
                          const growth = prev ? (((row.val - prev) / prev) * 100).toFixed(1) : '-';
                          const isPositive = prev && row.val > prev;
                          
                          return (
                            <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900">{row.year}</td>
                              <td className="px-6 py-4 text-right">${row.val.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
                              <td className={`px-6 py-4 text-right font-medium ${growth !== '-' ? (isPositive ? 'text-emerald-600' : 'text-red-600') : 'text-slate-400'}`}>
                                {growth !== '-' ? `${isPositive ? '+' : ''}${growth}%` : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Activity className="h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-slate-900 font-medium">Data Not Available</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">The SEC filing for this company does not utilize standard US-GAAP tagging for {activeMetric}.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}