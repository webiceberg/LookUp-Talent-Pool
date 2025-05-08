import React, { useState, useEffect } from 'react';
import ApplicantList from './components/ApplicantList';
import Filters from './components/Filters';
import Header from './components/Header';
import Pagination from './components/Pagination';
import api from './services/api';
import './styles.css';

function App() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    driversLicence: ''
  });
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch applicants when filters or pagination changes
  useEffect(() => {
    fetchApplicants();
  }, [filters, pagination.page, pagination.pageSize]);

  // Fetch applicants from API
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.driversLicence) queryParams.append('driversLicence', filters.driversLicence);
      queryParams.append('page', pagination.page);
      queryParams.append('pageSize', pagination.pageSize);
      
      const response = await api.getApplicants(queryParams);
      
      if (response.success) {
        setApplicants(response.data);
        setPagination(response.pagination);
        // Clear selected applicants when page changes
        setSelectedApplicants([]);
      } else {
        setError('Failed to fetch applicants');
      }
    } catch (err) {
      setError('Failed to fetch applicants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Reset to page 1 when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    setFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle applicant selection
  const handleApplicantSelect = (id, isSelected) => {
    if (isSelected) {
      setSelectedApplicants(prev => [...prev, id]);
    } else {
      setSelectedApplicants(prev => prev.filter(applicantId => applicantId !== id));
    }
  };

  // Contact selected applicants
  const handleContactSelected = async () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant to contact.');
      return;
    }
    
    try {
      const result = await api.contactApplicants(selectedApplicants);
      alert(`Successfully contacted ${result.contactedIds.length} applicants!`);
      // Clear selections after contacting
      setSelectedApplicants([]);
    } catch (err) {
      alert('Failed to contact applicants. Please try again.');
    }
  };

  return (
    <div className="app">
      <Header />
      
      <main className="content">
        <Filters 
          onFilterChange={handleFilterChange} 
          filters={filters}
        />
        
        {loading ? (
          <div className="loading">Loading applicants...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="actions">
              <button 
                onClick={handleContactSelected}
                disabled={selectedApplicants.length === 0}
                className="contact-button"
              >
                Contact Selected ({selectedApplicants.length})
              </button>
            </div>
            
            <ApplicantList 
              applicants={applicants} 
              onSelectApplicant={handleApplicantSelect}
              selectedApplicants={selectedApplicants}
            />
            
            <Pagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;