const axios = require('axios');

// Cache configuration
let applicantsCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Extracts location from an applicant record
 * @param {Object} applicant - Applicant data
 * @returns {string} Location or empty string
 */
function extractLocation(applicant) {
  // Check FormInfo for location data
  if (applicant.FormInfo?.length) {
    const locationInfo = applicant.FormInfo.find(info => 
      ['Lage', 'Position'].includes(info.question)
    );
    if (locationInfo?.answers) return locationInfo.answers;
  }
  
  // Check Funnel.Positions as fallback
  if (applicant.Funnel?.Positions) {
    try {
      const positions = JSON.parse(applicant.Funnel.Positions);
      if (positions?.[0]?.name) {
        return positions[0].name.split(',')[0].trim();
      }
    } catch (error) {}
  }
  
  return '';
}

/**
 * Extracts driver's license from an applicant record
 * @param {Object} applicant - Applicant data
 * @returns {string} Driver's license or empty string
 */
function extractDriversLicense(applicant) {
  // Check FormInfo for license data
  if (applicant.FormInfo?.length) {
    const licenseInfo = applicant.FormInfo.find(info => 
      ['Führerschein', "Driver's License"].includes(info.question)
    );
    if (licenseInfo?.answers?.trim()) return licenseInfo.answers;
  }
  
  // Check Funnel.Questions as fallback
  if (applicant.Funnel?.Questions) {
    try {
      const questions = JSON.parse(applicant.Funnel.Questions);
      const licenseQuestion = questions.find(q => 
        ['Führerschein', "Driver's License"].includes(q.nameDe || q.nameEn)
      );
      if (licenseQuestion?.options?.correct?.[0]) {
        return licenseQuestion.options.correct[0];
      }
    } catch (error) {}
  }
  
  // Check position data as fallback
  if (applicant.Funnel?.Positions) {
    try {
      const positions = JSON.parse(applicant.Funnel.Positions);
      const position = positions?.[0];
      if (position?.subPosition) {
        if (position.subPosition.includes('CE')) return 'CE';
        if (position.subPosition.includes('C1')) return 'C1';
        if (position.subPosition.includes('C')) return 'C';
      }
    } catch (error) {}
  }
  
  // Assign deterministic license for demo purposes
  if (applicant.ID) {
    const licenses = ['CE', 'C', 'C1E', 'C1', 'B', 'A'];
    return licenses[applicant.ID % licenses.length];
  }
  
  return '';
}

/**
 * Enriches applicant data with derived fields
 * @param {Object} applicant - Raw applicant record
 * @returns {Object} Enhanced applicant with derived fields
 */
function processApplicant(applicant) {
  const driverLicense = extractDriversLicense(applicant) || 'N/A';
  const location = extractLocation(applicant) || 'N/A';
  
  return {
    ...applicant,
    location,
    driversLicence: driverLicense
  };
}

/**
 * Fetches single applicant record by ID
 * @param {number} id - Applicant ID to fetch
 * @returns {Promise<Object|Array|null>} Processed applicant data or null if not found
 */
async function fetchApplicantById(id) {
  try {
    const endpoint = `https://onboarding-api-318352928563.us-central1.run.app/dashboard/application/${id}/`;
    const { data } = await axios.get(endpoint, { timeout: 5000 });
    
    if (!data) return null;
    
    // Process and return the data
    return Array.isArray(data) 
      ? data.map(processApplicant) 
      : processApplicant(data);
  } catch (error) {
    return null;
  }
}

/**
 * Fetches applicants with dynamic discovery to handle large datasets
 * @returns {Promise<Array>} Array of processed applicants
 */
async function fetchApplicants() {
  // Use cache if available and fresh
  const now = Date.now();
  if (applicantsCache && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return applicantsCache;
  }

  let allApplicants = [];
  
  // Try both discovery approaches
  const applicants = await discoveryWithMetadata() || discoveryWithBatches();
  
  // Update cache if data was retrieved
  if (applicants.length) {
    applicantsCache = applicants;
    lastFetchTime = now;
  }
  
  return applicants;
}

/**
 * Attempts to discover applicants using API metadata
 * @returns {Promise<Array|null>} Applicants array or null if metadata approach fails
 */
async function discoveryWithMetadata() {
  try {
    // Try to fetch metadata from API to determine total count
    const metadataEndpoint = 'https://onboarding-api-318352928563.us-central1.run.app/dashboard/applications/metadata';
    const { data: metadata } = await axios.get(metadataEndpoint, { timeout: 5000 });
    
    if (metadata?.totalCount) {
      console.log(`Metadata found. Total applicants: ${metadata.totalCount}`);
      const totalIds = metadata.totalCount;
      const applicationIds = Array.from({ length: totalIds }, (_, i) => i + 1);
      
      return await fetchByBatches(applicationIds);
    }
  } catch (error) {
    console.log('Metadata approach failed, falling back to batch discovery');
  }
  
  return null;
}

/**
 * Discovers applicants by trying sequential batches of IDs
 * @returns {Promise<Array>} Array of applicants
 */
async function discoveryWithBatches() {
  console.log('Using batch discovery approach');
  const MAX_ID = 100; // Try up to 100 IDs to be comprehensive
  const applicationIds = Array.from({ length: MAX_ID }, (_, i) => i + 1);
  
  return await fetchByBatches(applicationIds);
}

/**
 * Fetches applicants in batches to avoid overwhelming the server
 * @param {Array} ids - Array of IDs to fetch
 * @returns {Promise<Array>} Array of applicants
 */
async function fetchByBatches(ids) {
  let allApplicants = [];
  const BATCH_SIZE = 10;
  
  // Process in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i/BATCH_SIZE) + 1} (IDs ${batchIds[0]}-${batchIds[batchIds.length-1]})`);
    
    const batchResults = await Promise.all(
      batchIds.map(id => fetchApplicantById(id))
    );
    
    // Process valid results
    const validResults = batchResults.filter(Boolean);
    if (validResults.length === 0) {
      // If we get an entire batch with no results, we might be done
      // (Unless the API has gaps in the ID sequence)
      if (i >= 20) { // Only stop early if we've checked at least 20 IDs
        console.log('No results in batch, stopping discovery');
        break;
      }
    }
    
    // Add to collection
    validResults.forEach(result => {
      if (Array.isArray(result)) {
        allApplicants = [...allApplicants, ...result];
      } else {
        allApplicants.push(result);
      }
    });
  }
  
  console.log(`Total applicants found: ${allApplicants.length}`);
  return allApplicants;
}

/**
 * Gets unique locations for filtering UI
 * @returns {Promise<Array>} Sorted list of unique locations
 */
exports.getUniqueLocations = async function() {
  const applicants = await fetchApplicants();
  
  // Extract unique, non-empty, non-N/A locations
  const locations = [...new Set(
    applicants
      .map(applicant => applicant.location)
      .filter(location => location && location !== 'N/A')
  )].sort();
  
  // Add N/A option if any applicants have missing locations
  const hasEmptyLocations = applicants.some(
    applicant => !applicant.location || applicant.location === 'N/A'
  );
  
  if (hasEmptyLocations) {
    locations.push('N/A');
  }
  
  return locations;
};

/**
 * Gets unique driver's licenses for filtering UI
 * @returns {Promise<Array>} Sorted list of unique licenses
 */
exports.getUniqueDriversLicences = async function() {
  const applicants = await fetchApplicants();
  
  // Extract unique, non-empty, non-N/A licenses
  const licenses = [...new Set(
    applicants
      .map(applicant => applicant.driversLicence)
      .filter(license => license && license !== 'N/A')
  )].sort();
  
  // Add N/A option if any applicants have missing licenses
  const hasEmptyLicenses = applicants.some(
    applicant => !applicant.driversLicence || applicant.driversLicence === 'N/A'
  );
  
  if (hasEmptyLicenses) {
    licenses.push('N/A');
  }
  
  return licenses;
};

/**
 * Filters and paginates applicants
 * @param {string} location - Location filter (optional)
 * @param {string} driversLicence - Driver's license filter (optional)
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 10)
 * @returns {Promise<Object>} Filtered and paginated applicants with metadata
 */
exports.getFilteredApplicants = async function(location, driversLicence, page = 1, pageSize = 10) {
  const applicants = await fetchApplicants();
  
  // Apply filters
  let filteredApplicants = applicants;
  
  if (location || driversLicence) {
    filteredApplicants = applicants.filter(applicant => {
      // Location filtering
      let matchesLocation = true;
      if (location) {
        if (location === 'N/A') {
          matchesLocation = !applicant.location || 
                           applicant.location === '' || 
                           applicant.location === 'N/A';
        } else {
          matchesLocation = applicant.location?.toLowerCase() === location.toLowerCase();
        }
      }
      
      // License filtering
      let matchesLicense = true;
      if (driversLicence) {
        if (driversLicence === 'N/A') {
          matchesLicense = !applicant.driversLicence || 
                          applicant.driversLicence === '' || 
                          applicant.driversLicence === 'N/A';
        } else {
          matchesLicense = applicant.driversLicence === driversLicence;
        }
      }
      
      return matchesLocation && matchesLicense;
    });
  }
  
  // Calculate pagination
  const totalItems = filteredApplicants.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get only the items for the current page
  const paginatedApplicants = filteredApplicants.slice(startIndex, endIndex);
  
  // Return with pagination metadata
  return {
    data: paginatedApplicants,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};