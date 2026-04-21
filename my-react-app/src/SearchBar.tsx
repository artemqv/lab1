import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Search city..."
          className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 px-5 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
        />
        <button type="submit" className="absolute right-4 text-white/70 hover:text-white">
          <Search size={20} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;