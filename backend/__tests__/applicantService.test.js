const applicantService = require('../src/services/applicantService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Applicant Service', () => {
  // Mock applicant data
  const mockApplicants = [
    { 
      ID: 1, 
      Name: 'John Doe', 
      Email: 'john.doe@example.com',
      Phone: '+4915112345670',
      location: 'Berlin', 
      driversLicence: 'CE' 
    },
    { 
      ID: 2, 
      Name: 'Jane Smith', 
      Email: 'jane.smith@example.com',
      Phone: '+4915112345671',
      location: 'Hamburg', 
      driversLicence: 'C' 
    },
    { 
      ID: 3, 
      Name: 'Bob Johnson', 
      Email: 'bob.johnson@example.com',
      Phone: '+4915112345672',
      location: 'Berlin', 
      driversLicence: 'B' 
    },
    { 
      ID: 4, 
      Name: 'Alice Brown', 
      Email: 'alice.brown@example.com',
      Phone: '+4915112345673',
      location: 'N/A', 
      driversLicence: 'CE' 
    },
    { 
      ID: 5, 
      Name: 'Mark Wilson', 
      Email: 'mark.wilson@example.com',
      Phone: '+4915112345674',
      location: 'Munich', 
      driversLicence: 'N/A' 
    }
  ];

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the metadata endpoint to return null (so we use batch approach)
    axios.get.mockImplementation((url) => {
      if (url.includes('/metadata')) {
        return Promise.reject(new Error('Metadata not available'));
      }
      
      // For the first applicant endpoint, return the mock data
      if (url.includes('/dashboard/application/1/')) {
        return Promise.resolve({ data: mockApplicants });
      }
      
      // For all other URLs, return empty data
      return Promise.resolve({ data: null });
    });
  });

  describe('getFilteredApplicants', () => {
    test('should return paginated applicants when no filters are applied', async () => {
      const result = await applicantService.getFilteredApplicants();
      
      expect(axios.get).toHaveBeenCalled();
      expect(result.data).toEqual(mockApplicants.slice(0, 10)); // Default page size is 10
      expect(result.pagination.totalItems).toBe(5);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    test('should respect page and pageSize parameters', async () => {
      const result = await applicantService.getFilteredApplicants(null, null, 1, 2);
      
      expect(result.data).toEqual(mockApplicants.slice(0, 2));
      expect(result.pagination.totalItems).toBe(5);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(2);
    });

    test('should return the correct page of data', async () => {
      const result = await applicantService.getFilteredApplicants(null, null, 2, 2);
      
      expect(result.data).toEqual(mockApplicants.slice(2, 4));
      expect(result.pagination.page).toBe(2);
    });

    test('should filter applicants by location and respect pagination', async () => {
      const result = await applicantService.getFilteredApplicants('Berlin');
      
      expect(result.data.length).toBe(2);
      expect(result.data.every(a => a.location === 'Berlin')).toBe(true);
      expect(result.pagination.totalItems).toBe(2);
    });

    test('should filter applicants by N/A location and respect pagination', async () => {
      const result = await applicantService.getFilteredApplicants('N/A');
      
      expect(result.data.length).toBe(1);
      expect(result.data[0].location).toBe('N/A');
      expect(result.pagination.totalItems).toBe(1);
    });

    test('should filter applicants by drivers licence and respect pagination', async () => {
      const result = await applicantService.getFilteredApplicants(null, 'CE');
      
      expect(result.data.length).toBe(2);
      expect(result.data.every(a => a.driversLicence === 'CE')).toBe(true);
      expect(result.pagination.totalItems).toBe(2);
    });

    test('should filter applicants by N/A drivers licence and respect pagination', async () => {
      const result = await applicantService.getFilteredApplicants(null, 'N/A');
      
      expect(result.data.length).toBe(1);
      expect(result.data[0].driversLicence).toBe('N/A');
      expect(result.pagination.totalItems).toBe(1);
    });

    test('should filter applicants by both location and drivers licence with pagination', async () => {
      const result = await applicantService.getFilteredApplicants('Berlin', 'CE');
      
      expect(result.data.length).toBe(1);
      expect(result.data[0].location).toBe('Berlin');
      expect(result.data[0].driversLicence).toBe('CE');
      expect(result.pagination.totalItems).toBe(1);
    });

    test('should return correct pagination metadata for empty results', async () => {
      const result = await applicantService.getFilteredApplicants('NonExistentLocation');
      
      expect(result.data.length).toBe(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(false);
    });
  });

  describe('getUniqueLocations', () => {
    test('should return list of unique locations including N/A', async () => {
      const locations = await applicantService.getUniqueLocations();
      
      expect(locations).toContain('Berlin');
      expect(locations).toContain('Hamburg');
      expect(locations).toContain('Munich');
      expect(locations).toContain('N/A');
      expect(locations.length).toBe(4); // Berlin, Hamburg, Munich, N/A
    });
  });

  describe('getUniqueDriversLicences', () => {
    test('should return list of unique driver licences including N/A', async () => {
      const licenses = await applicantService.getUniqueDriversLicences();
      
      expect(licenses).toContain('CE');
      expect(licenses).toContain('C');
      expect(licenses).toContain('B');
      expect(licenses).toContain('N/A');
      expect(licenses.length).toBe(4); // CE, C, B, N/A
    });
  });
});