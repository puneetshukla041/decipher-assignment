import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let cik = searchParams.get('cik');

  if (!cik) return NextResponse.json({ error: 'CIK is required' }, { status: 400 });

  const paddedCik = cik.padStart(10, '0');
  const secUrl = `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`;

  try {
    const response = await fetch(secUrl, {
      headers: {
        // IMPORTANT: Change this to your actual name/email for the submission
        'User-Agent': 'Puneet Shukla (puneet@example.com)', 
        'Accept-Encoding': 'gzip, deflate'
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) throw new Error(`SEC API Error: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SEC EDGAR data.' }, { status: 500 });
  }
}