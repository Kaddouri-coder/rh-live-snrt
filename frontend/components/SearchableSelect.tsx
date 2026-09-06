import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface OptionItem {
  value: string;
  label: string;
  details?: string;
}

interface SearchableSelectProps {
  options: (string | OptionItem)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.details && opt.details.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left bg-white/[0.03] border rounded-lg px-3 py-2 text-xs text-[#eef3f4] transition-all focus:outline-none focus:ring-2 focus:ring-lime/20 ${
          isOpen ? 'border-lime/40 ring-2 ring-lime/20' : 'border-white/[0.09] hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-white/[0.01]' : 'cursor-pointer'}`}
      >
        <span className="truncate pr-2 font-medium">
          {selectedOption ? selectedOption.label : <span className="text-[#4f5c64]">{placeholder}</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#5f6d75] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#0d1217] border border-white/[0.09] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-64 flex flex-col">
          <div className="p-2 border-b border-white/[0.07] bg-white/[0.02] sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#5f6d75] absolute left-2.5 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md pl-8 pr-7 py-1.5 text-xs text-[#eef3f4] focus:outline-none focus:border-lime/40 focus:ring-1 focus:ring-lime/20 placeholder:text-[#4f5c64]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-2 text-[#5f6d75] hover:text-[#c1cdcf]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-48 p-1 divide-y divide-white/[0.05]">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-[#5f6d75] text-xs italic">
                Aucun résultat trouvé
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-lime/10 text-lime font-bold'
                        : 'hover:bg-white/[0.05] text-[#c1cdcf]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.details && (
                        <span className="text-[10px] text-[#5f6d75] font-normal truncate">
                          {opt.details}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-lime flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};