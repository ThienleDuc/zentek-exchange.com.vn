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
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  disabled = false,
  error = false,
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

  return (
    <div className="searchable-dropdown-container" ref={containerRef}>
      <div 
        className={`searchable-dropdown-header ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}
        onClick={toggleDropdown}
      >
        <span style={{ color: selectedOption ? '#ffffff' : 'rgba(255, 255, 255, 0.4)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className="searchable-dropdown-icon" />
      </div>

      {isOpen && !disabled && (
        <div className="searchable-dropdown-menu">
          <div className="searchable-dropdown-search-wrapper relative">
            <input 
              type="text" 
              className="searchable-dropdown-search" 
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div className="searchable-dropdown-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`searchable-dropdown-item ${value === option.value ? 'active' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="searchable-dropdown-empty">
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
