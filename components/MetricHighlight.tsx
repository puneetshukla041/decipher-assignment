import type { ComponentType, SVGProps } from 'react';

type MetricHighlightProps = {
  title: string;
  value: number;
  previousValue?: number | null;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  prefix?: string;
  suffix?: string;
};

export default function MetricHighlight({
  title,
  value,
  previousValue,
  icon: Icon,
  prefix = '',
  suffix = '',
}: MetricHighlightProps) {
  const isPositive = previousValue !== undefined && previousValue !== null && value > previousValue;
  const isNegative = previousValue !== undefined && previousValue !== null && value < previousValue;
  const percentageChange = previousValue !== undefined && previousValue !== null
    ? ((value - previousValue) / previousValue) * 100
    : null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-indigo-50/50 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`p-3 rounded-xl ${isNegative ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">
          {prefix}{value.toFixed(1)}{suffix}
        </p>
        {percentageChange !== null && (
          <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-medium ${isNegative ? 'text-red-600' : 'text-indigo-600'}`}>
            {isNegative ? <span className="inline-block rotate-45">↓</span> : <span className="inline-block">↑</span>}
            {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}% YoY
          </div>
        )}
      </div>
    </div>
  );
}
