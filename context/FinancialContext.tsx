'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FinancialContextType {
  data: any | null;
  loading: boolean;
  error: string | null;
  fetchCompanyData: (cik: string) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async (cik: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sec?cik=${cik}`);
      if (!res.ok) throw new Error('Company not found or SEC API error');
      
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinancialContext.Provider value={{ data, loading, error, fetchCompanyData }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancials = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancials must be used within FinancialProvider');
  return context;
};