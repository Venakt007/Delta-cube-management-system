import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SystemAdminDashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [resumes, setResumes] = useState([]);
  const [onboardedResumes, setOnboardedResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [jdText, setJdText] = useState('');
  const [jdMatches, setJdMatches] = useState([]);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAllResumes();
    fetchOnboardedResumes();
  }, []);

  const fetchAllResumes = async () => {
    try {
      const response = await axios.get('/api/system-admin/all-resumes', {
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
      const response = await axios.get('/api/system-admin/all-resumes?showOnboarded=only', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnboardedResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch onboarded resumes');
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredResumes(resumes);
      return;
    }

    const filtered = resumes.filter(resume => 
      resume.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.primary_skill?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResumes(filtered);
  };

  const handleJDMatch = async () => {
    if (!jdText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/system-admin/jd-match', 
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

  const displayResumes = activeTab === 'all' ? filteredResumes : onboardedResumes;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">System Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            My Resumes ({resumes.length})
          </button>
          <button
            onClick={() => setActiveTab('onboarded')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'onboarded' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Onboarded ({onboardedResumes.length})
          </button>
          <button
            onClick={() => setActiveTab('jd')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            JD Matching
          </button>
        </div>

        {/* Search Section */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Search Resumes</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by name, email, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Search
              </button>
              <button onClick={() => { setSearchTerm(''); setFilteredResumes(resumes); }} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                Reset
              </button>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button onClick={handleJDMatch} disabled={loading} className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matching Skills</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing Skills</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jdMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full font-semibold ${match.matchPercentage >= 70 ? 'bg-green-100 text-green-800' : match.matchPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {match.matchPercentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4">{match.name}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {match.matchingSkills?.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {match.missingSkills?.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">{match.experience_years} years</td>
                          <td className="px-6 py-4">
                            <a href={match.resume_url?.startsWith('http') ? match.resume_url : `${window.location.origin}${match.resume_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Download
                            </a>
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

        {/* Resumes Table */}
        {(activeTab === 'all' || activeTab === 'onboarded') && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b">
            {activeTab === 'all' ? `My Uploaded Resumes (${displayResumes.length})` : `Onboarded Resumes (${displayResumes.length})`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={activeTab === 'onboarded' ? 'bg-green-50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {activeTab === 'onboarded' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{resume.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{resume.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{resume.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {resume.parsed_data?.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {(!resume.parsed_data?.skills || resume.parsed_data.skills.length === 0) && (
                          <span className="text-gray-400 text-xs">No skills</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{resume.experience_years || 0} years</td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    {activeTab === 'onboarded' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded font-medium bg-emerald-100 text-emerald-800">
                          Onboarded
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">{resume.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        resume.referral_source === 'LinkedIn' ? 'bg-blue-100 text-blue-800' :
                        resume.referral_source === 'Facebook' ? 'bg-indigo-100 text-indigo-800' :
                        resume.referral_source === 'Twitter' ? 'bg-sky-100 text-sky-800' :
                        resume.referral_source === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                        resume.referral_source === 'WhatsApp' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resume.referral_source || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={resume.resume_url?.startsWith('http') ? resume.resume_url : `${window.location.origin}${resume.resume_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default SystemAdminDashboard;
