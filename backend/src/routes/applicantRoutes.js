const express = require('express');
const applicantController = require('../controllers/applicantController');

const router = express.Router();

// Get all unique locations
router.get('/locations', applicantController.getLocations);

// Get all unique driver's licenses
router.get('/drivers-licences', applicantController.getDriversLicences);

// Get all applicants with optional filtering
router.get('/', applicantController.getApplicants);

// Mock endpoint for contacting applicants
router.post('/contact', applicantController.contactApplicants);

module.exports = router;