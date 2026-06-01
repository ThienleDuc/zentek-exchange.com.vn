import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProductProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationProduct: React.FC<PaginationProductProps> = ({ currentPage, totalPages, onPageChange }) => {
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
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem' }}
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, index) => {
        if (typeof page !== 'number') {
          return (
            <span key={index} className="pagination-ellipsis" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {page}
            </span>
          );
        }
        return (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem 0.6rem' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationProduct;
