import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  theme?: 'default' | 'admin' | 'light' | 'dark';
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  disabled = false,
  error = false,
  theme = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Lọc options dựa trên từ khóa tìm kiếm
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tìm label của option đang được chọn
  const selectedOption = options.find(opt => opt.value === value);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm(''); // Reset tìm kiếm khi mở
    }
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getHeaderClasses = () => {
    if (theme === 'admin') {
      return `relative flex items-center justify-between w-full px-3 py-2 bg-surface-muted border rounded-lg text-text-main transition-all cursor-pointer ${
        error ? 'border-danger' : 'border-border-default hover:border-primary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isOpen ? 'ring-2 ring-primary border-transparent' : ''}`;
    }
    return `searchable-dropdown-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`;
  };

  const getMenuClasses = () => {
    if (theme === 'admin') {
      return `absolute z-50 w-full mt-1 bg-surface border border-border-default rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col`;
    }
    return `searchable-dropdown-menu`;
  };

  const getSearchClasses = () => {
    if (theme === 'admin') {
      return `w-full px-3 py-2 bg-surface-muted border-b border-border-default text-text-main outline-none text-sm placeholder:text-text-muted sticky top-0`;
    }
    return `searchable-dropdown-search`;
  };

  const getItemClasses = (isActive: boolean) => {
    if (theme === 'admin') {
      return `px-3 py-2 text-sm cursor-pointer transition-colors ${
        isActive ? 'bg-primary/20 text-primary font-medium' : 'text-text-main hover:bg-surface-muted'
      }`;
    }
    return `searchable-dropdown-item ${isActive ? 'active' : ''}`;
  };

  const getEmptyClasses = () => {
    if (theme === 'admin') {
      return `px-3 py-3 text-sm text-center text-text-muted`;
    }
    return `searchable-dropdown-empty`;
  };

  const getSpanClasses = () => {
    if (theme === 'admin') {
      return !selectedOption ? "text-text-muted truncate" : "truncate";
    }
    return !selectedOption ? "placeholder-text truncate" : "selected-text truncate";
  };

  const containerClasses = theme === 'admin' 
    ? "relative w-full" 
    : `searchable-dropdown-container theme-${theme}`;

  return (
    <div className={containerClasses} ref={containerRef}>
      <div 
        className={getHeaderClasses()}
        onClick={toggleDropdown}
      >
        <span className={getSpanClasses()}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={theme === 'admin' ? `text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}` : "searchable-dropdown-icon"} />
      </div>

      {isOpen && !disabled && (
        <div className={getMenuClasses()}>
          <div className="relative">
            <input 
              type="text" 
              className={getSearchClasses()} 
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div className={theme === 'admin' ? "overflow-y-auto custom-scrollbar" : "searchable-dropdown-list"}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div 
                  key={option.value}
                  className={getItemClasses(value === option.value)}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className={getEmptyClasses()}>
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
