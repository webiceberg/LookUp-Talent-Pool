import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = {
  /**
   * Get applicants with optional filtering and pagination
   * @param {URLSearchParams} queryParams - URL query parameters
   * @returns {Promise} - Promise with applicants data
   */
  getApplicants: async (queryParams) => {
    try {
      const response = await axios.get(`${API_URL}/applicants?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applicants:', error);
      throw error;
    }
  },
  
  /**
   * Get all unique locations
   * @returns {Promise} - Promise with locations data
   */
  getLocations: async () => {
    try {
      const response = await axios.get(`${API_URL}/applicants/locations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
  
  /**
   * Get all unique driver's licenses
   * @returns {Promise} - Promise with driver's licenses data
   */
  getDriversLicences: async () => {
    try {
      const response = await axios.get(`${API_URL}/applicants/drivers-licences`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver\'s licenses:', error);
      throw error;
    }
  },
  
  /**
   * Contact selected applicants
   * @param {Array} applicantIds - Array of applicant IDs to contact
   * @returns {Promise} - Promise with contact result
   */
  contactApplicants: async (applicantIds) => {
    try {
      const response = await axios.post(`${API_URL}/applicants/contact`, { applicantIds });
      return response.data;
    } catch (error) {
      console.error('Error contacting applicants:', error);
      throw error;
    }
  }
};

export default api;