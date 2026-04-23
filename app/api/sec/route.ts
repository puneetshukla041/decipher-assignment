import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let cik = searchParams.get('cik');

  if (!cik) {
    return NextResponse.json({ error: 'CIK is required' }, { status: 400 });
  }

  // SEC requires CIK to be exactly 10 digits, padded with leading zeros
  const paddedCik = cik.padStart(10, '0');
  const secUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`;

  try {
    const response = await fetch(secUrl, {
      headers: {
        // SEC MANDATES a custom User-Agent to avoid getting blocked
        'User-Agent': 'YourName (your.email@example.com)',
        'Accept-Encoding': 'gzip, deflate'
      },
      // Cache briefly to avoid hitting rate limits
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`SEC API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SEC Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from SEC EDGAR' }, { status: 500 });
  }
}