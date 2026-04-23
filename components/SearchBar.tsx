'use client';

import { Search, Loader2 } from 'lucide-react';

type SearchBarProps = {
  input: string;
  setInput: (value: string) => void;
  handleSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  compact?: boolean;
};

export default function SearchBar({ input, setInput, handleSearch, loading, compact = false }: SearchBarProps) {
  return (
    <form onSubmit={handleSearch} className={`w-full ${compact ? 'max-w-xl' : 'max-w-2xl'}`}>
      <div className={`relative ${compact ? '' : 'shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)]'}`}>
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
        <input
          type="text"
          placeholder="Search CIK (e.g., 320193 for Apple)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`w-full pl-16 pr-8 bg-white border border-gray-100 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300 ${compact ? 'py-3 text-base' : 'py-6 text-xl'}`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 bg-gray-950 text-white rounded-full font-semibold hover:bg-gray-800 active:scale-95 transition-all duration-200 disabled:opacity-70 flex items-center justify-center ${compact ? 'px-6 py-2' : 'px-8 py-4'}`}
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Search'}
        </button>
      </div>
    </form>
  );
}
