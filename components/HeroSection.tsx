import SearchBar from '@/components/SearchBar';

type HeroSectionProps = {
  input: string;
  setInput: (value: string) => void;
  handleSearch: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
};

export default function HeroSection({ input, setInput, handleSearch, loading }: HeroSectionProps) {
  return (
    <header className="animate-in fade-in duration-500 flex flex-col items-center mb-12 mt-20">
      <div className="w-full max-w-2xl bg-white p-16 rounded-[3rem] border border-gray-100 shadow-[0_30px_90px_-20px_rgba(79,70,229,0.06)] flex flex-col items-center text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-3xl mb-8 border border-indigo-100">
          <span className="text-indigo-600 text-3xl">📈</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-gray-950 mb-4">
          Financial Explorer
        </h1>
        <p className="text-xl text-gray-500 max-w-md mb-12">
          Instantly access verified SEC filing data and visualize company financial health in seconds.
        </p>
        <SearchBar input={input} setInput={setInput} handleSearch={handleSearch} loading={loading} />
        <p className="text-sm text-gray-400 mt-6">Try Apple: 320193 | Microsoft: 789019 | Tesla: 1318605</p>
      </div>
    </header>
  );
}
