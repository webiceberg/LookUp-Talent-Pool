const applicantController = require('../src/controllers/applicantController');
const applicantService = require('../src/services/applicantService');

// Mock applicantService
jest.mock('../src/services/applicantService');

describe('Applicant Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request and response
    req = {
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getApplicants', () => {
    test('should return paginated applicants with 200 status code', async () => {
      // Setup mock data
      const mockResult = {
        data: [{ id: 1, name: 'Test' }],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
      
      // Setup mock service response
      applicantService.getFilteredApplicants.mockResolvedValue(mockResult);
      
      // Call the controller
      await applicantController.getApplicants(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination
      });
      expect(applicantService.getFilteredApplicants).toHaveBeenCalledWith(
        undefined, undefined, 1, 10
      );
    });

    test('should use query parameters for filtering and pagination', async () => {
      // Setup request with query parameters
      req.query = {
        location: 'Berlin',
        driversLicence: 'CE',
        page: '2',
        pageSize: '5'
      };
      
      // Setup mock service response
      applicantService.getFilteredApplicants.mockResolvedValue({
        data: [],
        pagination: {
          page: 2,
          pageSize: 5,
          totalItems: 0,
          totalPages: 0
        }
      });
      
      // Call the controller
      await applicantController.getApplicants(req, res);
      
      // Assertions
      expect(applicantService.getFilteredApplicants).toHaveBeenCalledWith(
        'Berlin', 'CE', 2, 5
      );
    });

    test('should handle invalid pagination parameters', async () => {
      // Setup request with invalid pagination
      req.query = {
        page: '-1',
        pageSize: '0'
      };
      
      // Call the controller
      await applicantController.getApplicants(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid pagination parameters'
      });
    });

    test('should handle service errors', async () => {
      // Setup mock service error
      applicantService.getFilteredApplicants.mockRejectedValue(new Error('Service error'));
      
      // Call the controller
      await applicantController.getApplicants(req, res);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json.mock.calls[0][0]).toHaveProperty('success', false);
      expect(res.json.mock.calls[0][0]).toHaveProperty('error', 'Server Error');
    });
  });
});