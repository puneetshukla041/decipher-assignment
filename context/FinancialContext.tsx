'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { FinancialContextType, SECCompanyFacts } from '@/types/financial';

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SECCompanyFacts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async (cik: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/sec?cik=${encodeURIComponent(cik)}`);
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || 'Company not found or SEC API error');
      }

      const json = (await res.json()) as SECCompanyFacts;
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
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
