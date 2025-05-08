import React, { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Filter component for applicant data
 * Provides filtering by location and driver's license
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Object} props.filters - Current filter values
 */
function Filters({ onFilterChange, filters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [locations, setLocations] = useState([]);
  const [driversLicences, setDriversLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);
  
  // Sync with parent component's filter state
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  /**
   * Fetches available filter options from API
   */
  async function loadFilterOptions() {
    try {
      setLoading(true);
      
      const [locationsResponse, licensesResponse] = await Promise.all([
        api.getLocations(),
        api.getDriversLicences()
      ]);
      
      if (locationsResponse.success) {
        setLocations(locationsResponse.data);
      }
      
      if (licensesResponse.success) {
        setDriversLicences(licensesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setLoading(false);
    }
  }
  
  /**
   * Updates local filter state on input change
   */
  function handleInputChange(e) {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  /**
   * Applies current filters
   */
  function handleApplyFilters(e) {
    e.preventDefault();
    onFilterChange(localFilters);
  }
  
  /**
   * Resets all filters to default values
   */
  function handleResetFilters() {
    const resetFilters = {
      location: '',
      driversLicence: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  }
  
  return (
    <div className="filters">
      <h2>Filter Applicants</h2>
      
      <form onSubmit={handleApplyFilters}>
        <div className="filter-group">
          <label htmlFor="location">Location:</label>
          <select
            id="location"
            name="location"
            value={localFilters.location}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="driversLicence">Driver's License:</label>
          <select
            id="driversLicence"
            name="driversLicence"
            value={localFilters.driversLicence}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">All Licenses</option>
            {driversLicences.map(licence => (
              <option key={licence} value={licence}>{licence}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-actions">
          <button 
            type="submit" 
            className="apply-button" 
            disabled={loading}
          >
            Apply Filters
          </button>
          <button 
            type="button" 
            onClick={handleResetFilters} 
            className="reset-button" 
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>
      
      {loading && <div className="filter-loading">Loading filter options...</div>}
    </div>
  );
}

export default Filters;