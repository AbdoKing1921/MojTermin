import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export function SearchInput({ 
  placeholder = "Pretražite usluge...", 
  onSearch,
  defaultValue = ""
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor="search-input" className="sr-only">Pretraži usluge</label>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
      </div>
      <input
        type="text"
        id="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="focus-ring w-full pl-12 pr-4 py-3.5 bg-secondary rounded-2xl text-sm text-foreground placeholder:text-muted-foreground border-2 border-transparent focus:border-primary focus:bg-card transition-all"
        placeholder={placeholder}
        data-testid="input-search"
      />
    </form>
  );
}
