'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFinancials } from '@/context/FinancialContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Download, TrendingUp, Activity, Table as TableIcon, BarChart2, BrainCircuit, Printer } from 'lucide-react';
import { saveAs } from 'file-saver';
import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/HeroSection';
import ErrorBanner from '@/components/ErrorBanner';
import MetricHighlight from '@/components/MetricHighlight';
import { extractFinancialData, buildFinancialCSV, type MetricName } from '@/lib/financial';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const { data, loading, error, fetchCompanyData } = useFinancials();
  
  // Dashboard State
  const [activeMetric, setActiveMetric] = useState<MetricName>('Revenue');
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
    if (!chartData.length || !data) return;
    const csvContent = buildFinancialCSV(chartData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${data.entityName.replace(/\s+/g, '_')}_${activeMetric}.csv`);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">
      {hasData && (
        <nav className="w-full bg-white border-b border-slate-200 py-4 sticky top-0 z-50 shadow-sm no-print">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 grid place-items-center rounded-2xl bg-slate-900 text-white font-bold">F</span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Financial Explorer</p>
                <h1 className="text-lg font-semibold text-slate-900">SEC company insights</h1>
              </div>
            </div>
            <div className="w-full max-w-xl">
              <SearchBar input={searchInput} setInput={setSearchInput} handleSearch={handleSearch} loading={loading} compact />
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-6xl mx-auto px-6">
        {!hasData && (
          <HeroSection
            input={searchInput}
            setInput={setSearchInput}
            handleSearch={handleSearch}
            loading={loading}
          />
        )}
        
        {/* Error Notification */}
        {error && <ErrorBanner message={error} />}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricHighlight
                title={`${activeMetric} (Latest)`}
                value={latestVal}
                previousValue={prevVal}
                icon={TrendingUp}
                prefix="$"
                suffix="M"
              />
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