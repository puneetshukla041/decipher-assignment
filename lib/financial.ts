import { SECCompanyFacts } from '@/types/financial';

export type RevenueRow = {
  year: string | number;
  revenue: number;
};

export function extractRevenueRows(companyData: SECCompanyFacts | null): RevenueRow[] {
  if (!companyData?.facts?.['us-gaap']?.Revenues) {
    return [];
  }

  const rawUnits = companyData.facts['us-gaap'].Revenues.units.USD;

  return rawUnits
    .filter((item) => item.form === '10-K')
    .map((item) => ({
      year: item.fy,
      revenue: item.val / 1_000_000,
    }))
    .slice(-5);
}

export function buildRevenueCSV(data: RevenueRow[]): string {
  return ['Year,Revenue (Millions USD)', ...data.map((row) => `${row.year},${row.revenue}`)].join('\n');
}
