import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CandidateModal from '../components/CandidateModal';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [resumes, setResumes] = useState([]);
  const [onboardedResumes, setOnboardedResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [jdText, setJdText] = useState('');
  const [jdMatches, setJdMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    skills: '',
    experience_min: '',
    experience_max: '',
    location: '',
    technology: ''
  });


  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAllResumes();
    fetchOnboardedResumes();
  }, []);

  const fetchAllResumes = async () => {
    try {
      const response = await axios.get('/api/admin/resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(response.data);
      setFilteredResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch resumes');
    }
  };

  const fetchOnboardedResumes = async () => {
    try {
      const response = await axios.get('/api/admin/resumes?showOnboarded=only', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnboardedResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch onboarded resumes');
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`/api/admin/resumes/filter?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilteredResumes(response.data);
    } catch (error) {
      console.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJDMatch = async () => {
    if (!jdText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/jd-match', 
        { jobDescription: jdText },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setJdMatches(response.data.matches);
      setActiveTab('jd');
    } catch (error) {
      console.error('JD matching failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const resetFilters = () => {
    setFilters({
      skills: '',
      experience_min: '',
      experience_max: '',
      location: '',
      technology: ''
    });
    setFilteredResumes(resumes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Active Resumes ({resumes.length})
          </button>
          <button
            onClick={() => setActiveTab('onboarded')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'onboarded' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Onboarded ({onboardedResumes.length})
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'filter' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Advanced Filter
          </button>
          <button
            onClick={() => setActiveTab('jd')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            JD Matching
          </button>
        </div>

        {/* All Resumes Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{resume.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.email}</td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          {resume.primary_skill && (
                            <div className="text-sm">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {resume.primary_skill.length > 30 ? resume.primary_skill.substring(0, 30) + '...' : resume.primary_skill}
                              </span>
                            </div>
                          )}
                          {resume.secondary_skill && (
                            <div className="text-sm">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {resume.secondary_skill.length > 30 ? resume.secondary_skill.substring(0, 30) + '...' : resume.secondary_skill}
                              </span>
                            </div>
                          )}
                          {!resume.primary_skill && !resume.secondary_skill && (
                            <span className="text-gray-400 text-xs">No skills</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.experience_years} years</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          resume.recruitment_status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                          resume.recruitment_status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          resume.recruitment_status === 'Profile Not Found' ? 'bg-orange-100 text-orange-800' :
                          resume.recruitment_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          resume.recruitment_status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                          resume.recruitment_status === 'Interview scheduled' ? 'bg-green-100 text-green-800' :
                          resume.recruitment_status === 'Bench' ? 'bg-cyan-100 text-cyan-800' :
                          resume.recruitment_status === 'Onboarded' ? 'bg-emerald-100 text-emerald-800' :
                          resume.recruitment_status === 'Closed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {resume.recruitment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${resume.source === 'html_form' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {resume.source === 'html_form' ? 'Form' : 'Dashboard'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.uploader_name || 'Public'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCandidate(resume)}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium border border-gray-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Onboarded Tab */}
        {activeTab === 'onboarded' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recruitment Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {onboardedResumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{resume.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.email}</td>
                      <td className="px-4 py-2">
                        <div className="space-y-1">
                          {resume.primary_skill && (
                            <div className="text-sm">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {resume.primary_skill.length > 30 ? resume.primary_skill.substring(0, 30) + '...' : resume.primary_skill}
                              </span>
                            </div>
                          )}
                          {resume.secondary_skill && (
                            <div className="text-sm">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {resume.secondary_skill.length > 30 ? resume.secondary_skill.substring(0, 30) + '...' : resume.secondary_skill}
                              </span>
                            </div>
                          )}
                          {!resume.primary_skill && !resume.secondary_skill && (
                            <span className="text-gray-400 text-xs">No skills</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.experience_years} years</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          resume.recruitment_status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                          resume.recruitment_status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          resume.recruitment_status === 'Profile Not Found' ? 'bg-orange-100 text-orange-800' :
                          resume.recruitment_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          resume.recruitment_status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                          resume.recruitment_status === 'Interview scheduled' ? 'bg-green-100 text-green-800' :
                          resume.recruitment_status === 'Closed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {resume.recruitment_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded font-medium bg-emerald-100 text-emerald-800">
                          Onboarded
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${resume.source === 'html_form' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {resume.source === 'html_form' ? 'Form' : 'Dashboard'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{resume.uploader_name || 'Public'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCandidate(resume)}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium border border-gray-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter Tab */}
        {activeTab === 'filter' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Min Experience"
                  value={filters.experience_min}
                  onChange={(e) => setFilters({ ...filters, experience_min: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max Experience"
                  value={filters.experience_max}
                  onChange={(e) => setFilters({ ...filters, experience_max: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Technology"
                  value={filters.technology}
                  onChange={(e) => setFilters({ ...filters, technology: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={handleFilter} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {loading ? 'Filtering...' : 'Apply Filters'}
                </button>
                <button onClick={resetFilters} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                  Reset
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h3 className="text-lg font-semibold p-4 border-b">Filtered Results ({filteredResumes.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResumes.map((resume) => {
                      // Get all skills from different sources
                      const allSkills = [
                        ...(resume.parsed_data?.skills || []),
                        resume.primary_skill,
                        resume.secondary_skill
                      ].filter(Boolean);
                      
                      // Show only first 2-3 skills
                      const displaySkills = allSkills.slice(0, 3);
                      const hasMoreSkills = allSkills.length > 3;
                      
                      return (
                        <tr key={resume.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{resume.name}</td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1 items-center">
                              {displaySkills.map((skill, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {skill.length > 20 ? skill.substring(0, 20) + '...' : skill}
                                </span>
                              ))}
                              {hasMoreSkills && (
                                <span className="text-xs text-gray-500 font-medium">
                                  +{allSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">{resume.experience_years} years</td>
                          <td className="px-4 py-2">{resume.location}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => setSelectedCandidate(resume)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium border border-gray-300"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* JD Matching Tab */}
        {activeTab === 'jd' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Job Description Matching</h2>
              <textarea
                placeholder="Paste job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleJDMatch} disabled={loading} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {loading ? 'Analyzing...' : 'Find Matching Candidates'}
              </button>
            </div>

            {jdMatches.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <h3 className="text-lg font-semibold p-4 border-b">Matched Candidates ({jdMatches.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match %</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Matching Skills</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Missing Skills</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jdMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <span className={`px-3 py-1 rounded-full font-semibold ${match.matchPercentage >= 70 ? 'bg-green-100 text-green-800' : match.matchPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {match.matchPercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-2">{match.name}</td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {match.matchingSkills?.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-1">
                              {match.missingSkills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2">{match.experience_years} years</td>
                          <td className="px-4 py-2">{match.uploader_name || 'Public'}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => setSelectedCandidate(match)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm font-medium border border-gray-300"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
