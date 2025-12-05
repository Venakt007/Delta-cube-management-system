import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CandidateModal from '../components/CandidateModal';

function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('recruiter-resumes');
  const [recruiterResumes, setRecruiterResumes] = useState([]);
  const [socialMediaResumes, setSocialMediaResumes] = useState([]);
  const [onboardedResumes, setOnboardedResumes] = useState([]);
  const [jdText, setJdText] = useState('');
  const [jdMatches, setJdMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // User management state
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'recruiter'
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'super_admin') {
      navigate('/admin');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRecruiterResumes(),
      fetchSocialMediaResumes(),
      fetchOnboardedResumes(),
      fetchUsers()
    ]);
  };

  const fetchRecruiterResumes = async () => {
    try {
      const response = await axios.get('/api/super-admin/recruiter-resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecruiterResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch recruiter resumes');
    }
  };

  const fetchSocialMediaResumes = async () => {
    try {
      const response = await axios.get('/api/super-admin/social-media-resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocialMediaResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch social media resumes');
    }
  };

  const fetchOnboardedResumes = async () => {
    try {
      const response = await axios.get('/api/super-admin/onboarded-resumes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnboardedResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch onboarded resumes');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/super-admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleJDMatch = async () => {
    if (!jdText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/super-admin/jd-match', 
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

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'recruiter' });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await axios.put(`/api/super-admin/users/${editingUser.id}`, userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User updated successfully');
      } else {
        await axios.post('/api/super-admin/users', userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User created successfully');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/super-admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderResumeTable = (resumes, title) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">{title} ({resumes.length})</h3>
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="text-purple-100 text-sm">Full System Access</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{user.name}</span>
            <button onClick={handleLogout} className="bg-white text-purple-600 px-4 py-2 rounded hover:bg-purple-50 font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('recruiter-resumes')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'recruiter-resumes' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Recruiter Uploads ({recruiterResumes.length})
          </button>
          <button
            onClick={() => setActiveTab('social-media')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'social-media' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Social Media ({socialMediaResumes.length})
          </button>
          <button
            onClick={() => setActiveTab('onboarded')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'onboarded' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Onboarded ({onboardedResumes.length})
          </button>
          <button
            onClick={() => setActiveTab('jd')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            JD Search
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            User Management ({users.length})
          </button>
        </div>

        {/* Recruiter Resumes Tab */}
        {activeTab === 'recruiter-resumes' && renderResumeTable(recruiterResumes, 'Resumes Uploaded by Recruiters')}

        {/* Social Media Resumes Tab */}
        {activeTab === 'social-media' && renderResumeTable(socialMediaResumes, 'Social Media Applications')}

        {/* Onboarded Tab */}
        {activeTab === 'onboarded' && renderResumeTable(onboardedResumes, 'Onboarded Candidates')}

        {/* JD Search Tab */}
        {activeTab === 'jd' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Job Description Search</h2>
              <textarea
                placeholder="Paste job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button onClick={handleJDMatch} disabled={loading} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
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

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Management</h3>
              <button
                onClick={handleAddUser}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium"
              >
                + Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default SuperAdminDashboard;
