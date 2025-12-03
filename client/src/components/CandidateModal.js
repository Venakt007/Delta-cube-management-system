import React from 'react';

const CandidateModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold">{candidate.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{candidate.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{candidate.phone || '-'}</p>
              </div>
              {candidate.linkedin && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">LinkedIn</p>
                  <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {candidate.linkedin}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">Professional Details</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Technology</p>
                <p className="font-medium">{candidate.technology && candidate.technology !== '' ? candidate.technology : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">{candidate.experience_years || 0} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{candidate.location || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Job Types</p>
                <p className="font-medium">{candidate.job_types && candidate.job_types !== '' ? candidate.job_types : '-'}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">Skills</h3>
            <div className="space-y-2">
              {candidate.primary_skill && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Primary Skill</p>
                  <p className="font-medium">{candidate.primary_skill}</p>
                </div>
              )}
              {candidate.secondary_skill && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Secondary Skill</p>
                  <p className="font-medium">{candidate.secondary_skill}</p>
                </div>
              )}
              {candidate.parsed_data?.skills && candidate.parsed_data.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">All Parsed Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.parsed_data.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">Status</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Recruitment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  candidate.recruitment_status === 'Submitted' ? 'bg-green-100 text-green-800' :
                  candidate.recruitment_status === 'Interview scheduled' ? 'bg-blue-100 text-blue-800' :
                  candidate.recruitment_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {candidate.recruitment_status || 'Pending'}
                </span>
              </div>
              {candidate.placement_status && (
                <div>
                  <p className="text-sm text-gray-600">Placement Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    candidate.placement_status === 'Onboarded' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {candidate.placement_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Referral Source (if applicable) */}
          {candidate.referral_source && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">Source</h3>
              <p className="font-medium">{candidate.referral_source}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center sticky bottom-0">
          {candidate.resume_url && (
            <a
              href={`http://localhost:5000${candidate.resume_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Download Resume
            </a>
          )}
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
