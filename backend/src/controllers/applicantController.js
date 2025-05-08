const applicantService = require('../services/applicantService');

/**
 * Retrieves applicants with optional filtering by location and driver's license
 * Supports pagination
 * 
 * @route GET /api/applicants
 * @param {string} req.query.location - Optional location filter
 * @param {string} req.query.driversLicence - Optional driver's license filter
 * @param {number} req.query.page - Page number (default: 1)
 * @param {number} req.query.pageSize - Items per page (default: 10)
 * @returns {Object} JSON response with applicants data and pagination info
 */
exports.getApplicants = async (req, res) => {
  try {
    // Extract query parameters
    const { location, driversLicence } = req.query;
    
    // Extract and validate pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    
    // Ensure positive values
    if (page < 1 || pageSize < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }
    
    // Get applicants with filters and pagination applied
    const result = await applicantService.getFilteredApplicants(
      location, 
      driversLicence,
      page,
      pageSize
    );
    
    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
};

/**
 * Gets all unique locations from applicant data
 * Used to populate location filter dropdown
 * 
 * @route GET /api/applicants/locations
 * @returns {Object} JSON response with unique locations
 */
exports.getLocations = async (req, res) => {
  try {
    const locations = await applicantService.getUniqueLocations();
    
    return res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Gets all unique driver's license types from applicant data
 * Used to populate driver's license filter dropdown
 * 
 * @route GET /api/applicants/drivers-licences
 * @returns {Object} JSON response with unique driver's license types
 */
exports.getDriversLicences = async (req, res) => {
  try {
    const licenses = await applicantService.getUniqueDriversLicences();
    
    return res.status(200).json({
      success: true,
      data: licenses
    });
  } catch (error) {
    console.error('Error fetching driver\'s licenses:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Simulates contacting selected applicants by ID
 * Logs the contact request to console instead of sending actual messages
 * 
 * @route POST /api/applicants/contact
 * @param {Array} req.body.applicantIds - Array of applicant IDs to contact
 * @returns {Object} JSON response confirming contact action
 */
exports.contactApplicants = async (req, res) => {
  try {
    const { applicantIds } = req.body;
    
    if (!applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of applicant IDs'
      });
    }
    
    // Mock contact functionality by logging IDs to console
    console.log(`Contacting applicants with IDs: ${applicantIds.join(', ')}`);
    
    return res.status(200).json({
      success: true,
      message: `${applicantIds.length} applicants contacted successfully`,
      contactedIds: applicantIds
    });
  } catch (error) {
    console.error('Error contacting applicants:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};