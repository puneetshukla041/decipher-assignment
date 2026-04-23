import { NextResponse } from 'next/server';
import { getSecApiUrl, getSecUserAgent } from '@/lib/sec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cik = searchParams.get('cik');

  if (!cik) return NextResponse.json({ error: 'CIK is required' }, { status: 400 });

  const secUrl = getSecApiUrl(cik);

  try {
    const response = await fetch(secUrl, {
      headers: {
        'User-Agent': getSecUserAgent(),
        'Accept-Encoding': 'gzip, deflate',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const message = `SEC API responded with ${response.status}`;
      console.error(message);
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('SEC Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from SEC EDGAR' }, { status: 500 });
  }
}