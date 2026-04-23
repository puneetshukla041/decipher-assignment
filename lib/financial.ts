import { SECCompanyFacts } from '@/types/financial';

export type MetricName = 'Revenue' | 'Net Income' | 'Assets' | 'Liabilities';

export type MetricRow = {
  year: number;
  val: number;
};

const metricKeyMap: Record<MetricName, string[]> = {
  Revenue: ['Revenues', 'SalesRevenueNet', 'RevenueFromContractWithCustomerExcludingAssessedTax'],
  'Net Income': ['NetIncomeLoss'],
  Assets: ['Assets'],
  Liabilities: ['Liabilities'],
};

export function extractFinancialData(data: SECCompanyFacts | null, metric: MetricName, yearsBack: number): MetricRow[] {
  if (!data?.facts?.['us-gaap']) return [];

  const possibleKeys = metricKeyMap[metric];
  let rawUnits = null;

  for (const key of possibleKeys) {
    if (data.facts['us-gaap'][key]?.units?.USD) {
      rawUnits = data.facts['us-gaap'][key].units.USD;
      break;
    }
  }

  if (!rawUnits) return [];

  const annualData = rawUnits
    .filter((item: any) => item.form === '10-K')
    .map((item: any) => ({
      year: Number(item.fy),
      val: item.val / 1_000_000,
    }));

  const uniqueYears = new Map<number, number>();
  annualData.forEach((item) => uniqueYears.set(item.year, item.val));

  return Array.from(uniqueYears, ([year, val]) => ({ year, val }))
    .sort((a, b) => a.year - b.year)
    .slice(-yearsBack);
}

export function buildFinancialCSV(rows: MetricRow[]): string {
  return ['Year,Value (Millions USD)', ...rows.map((row) => `${row.year},${row.val}`)].join('\n');
}
