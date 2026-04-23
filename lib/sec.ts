export function padCik(cik: string): string {
  return cik.replace(/\D/g, '').padStart(10, '0');
}

export function getSecApiUrl(cik: string): string {
  return `https://data.sec.gov/api/xbrl/companyfacts/CIK${padCik(cik)}.json`;
}

export function getSecUserAgent(): string {
  return process.env.SEC_EDGAR_USER_AGENT || 'Financial Explorer - https://example.com';
}
