import React from 'react';

/**
 * Pagination component for navigating through pages of results
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pagination - Pagination state (page, pageSize, totalItems, totalPages, etc.)
 * @param {Function} props.onPageChange - Callback for page changes
 */
function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;
  
  // Ensure totalPages is at least 1 if we have items
  const displayTotalPages = totalPages || 1;
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (displayTotalPages <= maxVisiblePages) {
      // If we have fewer pages than the max we want to display, show all
      for (let i = 1; i <= displayTotalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      // For middle pages, show current page and neighbors
      const firstPage = 1;
      const lastPage = displayTotalPages;
      
      // Calculate a range around the current page
      let startPage = Math.max(page - Math.floor(maxVisiblePages / 2), 1);
      let endPage = startPage + maxVisiblePages - 1;
      
      // Adjust if we're near the end
      if (endPage > displayTotalPages) {
        endPage = displayTotalPages;
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      // Add first page if not included in range
      if (startPage > firstPage) {
        pageNumbers.push(firstPage);
        if (startPage > firstPage + 1) {
          pageNumbers.push('...');
        }
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add last page if not included in range
      if (endPage < lastPage) {
        if (endPage < lastPage - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(lastPage);
      }
    }
    
    return pageNumbers;
  };
  
  // Don't render pagination if there are no items
  if (pagination.totalItems <= 0) {
    return null;
  }
  
  return (
    <div className="pagination">
      <button 
        className="pagination-button"
        onClick={() => onPageChange(1)}
        disabled={!hasPrevPage}
        aria-label="First Page"
      >
        &laquo;
      </button>
      
      <button 
        className="pagination-button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Previous Page"
      >
        &lsaquo;
      </button>
      
      <div className="pagination-pages">
        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={pageNum}
              className={`pagination-page ${pageNum === page ? 'active' : ''}`}
              onClick={() => pageNum !== page && onPageChange(pageNum)}
              disabled={pageNum === page}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
            >
              {pageNum}
            </button>
          )
        ))}
      </div>
      
      <button 
        className="pagination-button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next Page"
      >
        &rsaquo;
      </button>
      
      <button 
        className="pagination-button"
        onClick={() => onPageChange(displayTotalPages)}
        disabled={!hasNextPage}
        aria-label="Last Page"
      >
        &raquo;
      </button>
      
      <div className="pagination-info">
        Page {page} of {displayTotalPages}
      </div>
    </div>
  );
}

export default Pagination;