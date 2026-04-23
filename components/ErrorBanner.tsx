import { AlertCircle } from 'lucide-react';

type ErrorBannerProps = {
  message: string;
};

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="animate-in slide-in-from-top-6 fade-in duration-500 max-w-xl mx-auto p-5 bg-red-50/70 backdrop-blur-md text-red-600 rounded-3xl flex items-center gap-4 mb-12 border border-red-100 shadow-sm shadow-red-50">
      <AlertCircle className="h-6 w-6 shrink-0" />
      <p className="font-semibold">{message}</p>
    </div>
  );
}
