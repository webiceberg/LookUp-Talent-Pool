import React from 'react';

function ApplicantList({ applicants, onSelectApplicant, selectedApplicants }) {
  if (!applicants || applicants.length === 0) {
    return (
      <div className="no-results">
        <p>No applicants found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="applicant-list">
      <h2>Applicants ({applicants.length})</h2>
      
      <table className="applicant-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Driver's License</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map(applicant => (
            <tr key={applicant.ID || applicant.id} className={selectedApplicants.includes(applicant.ID || applicant.id) ? 'selected' : ''}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedApplicants.includes(applicant.ID || applicant.id)}
                  onChange={(e) => onSelectApplicant(applicant.ID || applicant.id, e.target.checked)}
                />
              </td>
              <td>{applicant.ID || applicant.id || 'N/A'}</td>
              <td>{applicant.Name || applicant.name || 'N/A'}</td>
              <td>{applicant.Email || applicant.email || 'N/A'}</td>
              <td>{applicant.Phone || applicant.phone || 'N/A'}</td>
              <td>{applicant.location || 'N/A'}</td>
              <td>{applicant.driversLicence || 'N/A'}</td>
              <td>{applicant.CreatedAt ? new Date(applicant.CreatedAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicantList;