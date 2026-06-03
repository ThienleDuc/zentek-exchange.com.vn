import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-default bg-surface text-text-body hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer disabled:pointer-events-none"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number'}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${
            currentPage === page
              ? 'bg-primary text-white border border-primary hover:bg-primary-hover shadow-md shadow-primary/20 scale-105'
              : typeof page === 'number'
              ? 'border border-default bg-surface text-text-body hover:bg-surface-muted hover:scale-105 active:scale-95 shadow-sm'
              : 'text-text-light cursor-default border-none bg-transparent shadow-none'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-default bg-surface text-text-body hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer disabled:pointer-events-none"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
