import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { entityName, metricName, latestValue, previousValue } = await request.json();

    // In a real scenario, you would pass these to OpenAI/Gemini here.
    // For this assignment, we algorithmically generate a natural language insight.
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate LLM latency

    let insight = "";
    if (!previousValue) {
      insight = `${entityName} reported ${metricName.toLowerCase()} of $${latestValue.toFixed(2)}M in their most recent filing. Historical comparison data is currently limited.`;
    } else {
      const diff = latestValue - previousValue;
      const percent = ((diff / previousValue) * 100).toFixed(1);
      const trend = diff >= 0 ? "an increase" : "a decrease";
      
      insight = `Based on SEC filings, ${entityName} shows ${trend} in ${metricName.toLowerCase()}, moving from $${previousValue.toFixed(2)}M to $${latestValue.toFixed(2)}M year-over-year. This represents a ${Math.abs(Number(percent))}% ${diff >= 0 ? 'growth' : 'contraction'} in their most recent reporting period.`;
    }

    return NextResponse.json({ summary: insight });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate AI summary' }, { status: 500 });
  }
}