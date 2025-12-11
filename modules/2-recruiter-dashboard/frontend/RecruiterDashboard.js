import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('manual');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [adminsList, setAdminsList] = useState([]);
  const [assigningResume, setAssigningResume] = useState({});
  
  // Manual entry form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    technology: '',
    primary_skill: '',
    secondary_skill: '',
    location: '',
    experience_years: '',
    job_types: [] // Array to store multiple selections
  });
  const [files, setFiles] = useState({ resume: null, id_proof: null });
  const [message, setMessage] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [showCheckButton, setShowCheckButton] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchResumes();
    fetchAdminsList();
  }, []);

  const fetchResumes = async () => {
    try {
      let url = '/api/applications/my-resumes';
      if (sortBy === 'experience') {
        url += `?sort_by=experience&sort_order=${sortOrder}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch resumes');
    }
  };

  const fetchAdminsList = async () => {
    try {
      const response = await axios.get('/api/applications/admins-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminsList(response.data);
    } catch (error) {
      console.error('Failed to fetch admins list');
    }
  };

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setUploadMessage('');

    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));

    try {
      const response = await axios.post('/api/applications/upload-bulk', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { uploaded, errors } = response.data;
      
      // Build detailed message
      let message = `✅ Successfully uploaded ${uploaded} resume(s)`;
      
      if (errors && errors.length > 0) {
        message += `\n\n⚠️ ${errors.length} file(s) failed:\n`;
        errors.forEach(err => {
          message += `\n❌ ${err.filename}: ${err.error}`;
        });
      }
      
      setUploadMessage(message);
      fetchResumes();
    } catch (error) {
      setUploadMessage('❌ Upload failed. Please try again.\n' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchResumes();
      return;
    }

    try {
      let url = `/api/applications/my-resumes/search?skill=${searchTerm}`;
      if (sortBy === 'experience') {
        url += `&sort_by=experience&sort_order=${sortOrder}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(response.data);
      
      // Show message if no results found
      if (response.data.length === 0) {
        setUploadMessage(`❌ No resumes found with skill: "${searchTerm}"`);
        setTimeout(() => setUploadMessage(''), 5000);
      }
    } catch (error) {
      console.error('Search failed');
      setUploadMessage('❌ Search failed. Please try again.');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleAssignToAdmin = async (resumeId, adminId) => {
    setAssigningResume({ ...assigningResume, [resumeId]: true });
    try {
      await axios.patch(`/api/applications/resumes/${resumeId}/assign`, 
        { adminId: adminId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setResumes(resumes.map(r => {
        if (r.id === resumeId) {
          const admin = adminsList.find(a => a.id === parseInt(adminId));
          return { 
            ...r, 
            assigned_to: adminId || null,
            assigned_to_name: admin ? admin.name : null,
            assigned_at: adminId ? new Date() : null
          };
        }
        return r;
      }));
      
      alert(adminId ? 'Resume assigned successfully!' : 'Assignment removed!');
    } catch (error) {
      console.error('Failed to assign resume:', error);
      alert('Failed to assign resume. Please try again.');
    } finally {
      setAssigningResume({ ...assigningResume, [resumeId]: false });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleStatusChange = async (resumeId, newStatus, statusType = 'recruitment') => {
    setUpdatingStatus({ ...updatingStatus, [resumeId]: true });
    try {
      await axios.patch(`/api/applications/resumes/${resumeId}/status`, 
        { status: newStatus, statusType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setResumes(resumes.map(r => {
        if (r.id === resumeId) {
          if (statusType === 'placement') {
            return { ...r, placement_status: newStatus };
          } else {
            return { ...r, recruitment_status: newStatus };
          }
        }
        return r;
      }));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus({ ...updatingStatus, [resumeId]: false });
    }
  };

  const handleDeleteResume = async (resumeId, candidateName) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `⚠️ DELETE PERMANENTLY?\n\n` +
      `Are you sure you want to delete the resume for "${candidateName}"?\n\n` +
      `This action CANNOT be undone!\n` +
      `The resume will be permanently removed from the database.`
    );

    if (!confirmDelete) {
      return; // User cancelled
    }

    setLoading(true);
    try {
      await axios.delete(`/api/applications/delete/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`Resume for "${candidateName}" has been permanently deleted.`);
      fetchResumes(); // Refresh the list
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete resume. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Manual entry handlers
  const handleChange = (e) => {
    const updatedFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(updatedFormData);
    
    // Show check button when name, email, and phone are filled
    if (updatedFormData.name && updatedFormData.email && updatedFormData.phone) {
      setShowCheckButton(true);
    } else {
      setShowCheckButton(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, job_types: [...formData.job_types, value] });
    } else {
      setFormData({ ...formData, job_types: formData.job_types.filter(type => type !== value) });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    setFiles({ ...files, [fieldName]: file });
    
    // Auto-parse resume when uploaded
    if (fieldName === 'resume' && file) {
      setParsing(true);
      setMessage('🔍 Parsing resume...');
      setParsedData(null);
      
      try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await axios.post('/api/applications/parse-resume', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          const parsed = response.data.data;
          setParsedData(parsed);
          
          // Auto-fill form with parsed data
          setFormData({
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            linkedin: parsed.linkedin || '',
            technology: '',
            primary_skill: parsed.primary_skill || '',
            secondary_skill: parsed.secondary_skill || '',
            location: parsed.location || '',
            experience_years: parsed.experience_years || ''
          });
          
          setMessage(`✅ Resume parsed successfully! (${parsed.tier} - ${parsed.confidence} confidence)\nPlease review and edit the information below.`);
        }
      } catch (error) {
        console.error('Parse error:', error);
        setMessage('⚠️ Could not parse resume automatically. Please fill in the details manually.');
      } finally {
        setParsing(false);
      }
    }
  };

  const handleCheckProfile = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setMessage('Please fill Name, Email, and Phone to check profile');
      return;
    }

    setLoading(true);
    setCheckResult(null);

    try {
      const response = await axios.post('/api/applications/check-profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCheckResult(response.data);
    } catch (error) {
      setCheckResult({ exists: false, message: 'No profile found' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = (resume) => {
    // Load resume data into form for editing
    setEditingResume(resume);
    setFormData({
      name: resume.name || '',
      email: resume.email || '',
      phone: resume.phone || '',
      linkedin: resume.linkedin || '',
      technology: resume.technology || '',
      primary_skill: resume.primary_skill || '',
      secondary_skill: resume.secondary_skill || '',
      location: resume.location || '',
      experience_years: resume.experience_years || '',
      job_types: resume.job_types ? resume.job_types.split(', ') : []
    });
    setMessage('📝 Editing resume. Update the fields below and click "Update Profile".');
    setActiveTab('manual'); // Switch to manual entry tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingResume(null);
    setFormData({
      name: '', email: '', phone: '', linkedin: '', technology: '',
      primary_skill: '', secondary_skill: '', location: '', experience_years: '', job_types: []
    });
    setFiles({ resume: null, id_proof: null });
    setMessage('');
  };

  const handleManualSubmit = async (e, action = 'new') => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'job_types') {
        data.append(key, formData[key].join(', ')); // Convert array to comma-separated string
      } else {
        data.append(key, formData[key]);
      }
    });
    if (files.resume) data.append('resume', files.resume);
    if (files.id_proof) data.append('id_proof', files.id_proof);
    
    // If editing, use update action
    if (editingResume) {
      data.append('action', 'update');
      data.append('existing_id', editingResume.id);
    } else {
      data.append('action', action); // 'new', 'update', or 'continue'
      if (checkResult?.profile?.id) {
        data.append('existing_id', checkResult.profile.id);
      }
    }

    try {
      const response = await axios.post('/api/applications/manual-entry', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(editingResume ? '✅ Profile updated successfully!' : '✅ Profile saved successfully!');
      setFormData({
        name: '', email: '', phone: '', linkedin: '', technology: '',
        primary_skill: '', secondary_skill: '', location: '', experience_years: '', job_types: []
      });
      setFiles({ resume: null, id_proof: null });
      setCheckResult(null);
      setShowCheckButton(false);
      setEditingResume(null);
      fetchResumes();
    } catch (error) {
      console.error('Save profile error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      setMessage(`Failed to save profile: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Recruiter Dashboard</h1>
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
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Upload Resumes
          </button>
          <button
            onClick={() => setActiveTab('myresumes')}
            className={`px-6 py-3 rounded-lg font-semibold ${activeTab === 'myresumes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            My Resumes ({resumes.length})
          </button>
        </div>

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingResume ? '✏️ Edit Resume' : 'Manual Entry'}
              </h2>
              {editingResume && (
                <button
                  onClick={handleCancelEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            {message && (
              <div className={`p-4 mb-6 rounded whitespace-pre-line ${message.includes('success') || message.includes('✅') ? 'bg-green-100 text-green-700' : message.includes('📝') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={(e) => handleManualSubmit(e, 'new')} className="space-y-6">
              {/* Step 1: Basic Info for Profile Check */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Step 1: Enter Basic Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Check Profile Button */}
                {showCheckButton && !checkResult && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleCheckProfile}
                      disabled={loading}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold text-lg shadow-lg"
                    >
                      {loading ? '🔍 Checking...' : '🔍 Check if Profile Already Exists'}
                    </button>
                    <p className="text-sm text-gray-600 mt-2 text-center">Click to check if this candidate already exists in your database</p>
                  </div>
                )}
              </div>

              {/* Profile Check Result */}
              {checkResult && (
                <div className={`p-4 rounded-lg ${checkResult.exists ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-green-50 border-2 border-green-400'}`}>
                  {checkResult.exists ? (
                    <div>
                      <h3 className="font-bold text-yellow-800 mb-2">⚠️ Profile Already Exists!</h3>
                      <p className="text-yellow-700 mb-3">Found existing profile for: {checkResult.profile.name}</p>
                      <div className="bg-white p-3 rounded mb-3">
                        <p><strong>Email:</strong> {checkResult.profile.email}</p>
                        <p><strong>Phone:</strong> {checkResult.profile.phone}</p>
                        <p><strong>Skills:</strong> {checkResult.profile.primary_skill}</p>
                        <p><strong>Experience:</strong> {checkResult.profile.experience_years} years</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleManualSubmit(e, 'continue')}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Continue with Old Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Load existing profile data into form for editing
                            setEditingResume(checkResult.profile);
                            setFormData({
                              name: checkResult.profile.name || '',
                              email: checkResult.profile.email || '',
                              phone: checkResult.profile.phone || '',
                              linkedin: checkResult.profile.linkedin || '',
                              technology: checkResult.profile.technology || '',
                              primary_skill: checkResult.profile.primary_skill || '',
                              secondary_skill: checkResult.profile.secondary_skill || '',
                              location: checkResult.profile.location || '',
                              experience_years: checkResult.profile.experience_years || ''
                            });
                            setCheckResult(null);
                            setMessage('📝 Editing existing profile. Update the fields below and click "Update Profile".');
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          ✏️ Edit & Update Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckResult(null)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-green-800 mb-2">✅ No Profile Found</h3>
                      <p className="text-green-700 mb-3">You can continue with creating a new profile.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rest of the form - only show if no existing profile or user chose to continue */}
              {(!checkResult || !checkResult.exists) && (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Complete Profile Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technology *</label>
                      <select
                        name="technology"
                        value={formData.technology}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Technology</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="AI/ML">AI/ML</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Skill *</label>
                      <input
                        type="text"
                        name="primary_skill"
                        value={formData.primary_skill}
                        onChange={handleChange}
                        required
                        placeholder="e.g., React, Python, Java"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Skill</label>
                      <input
                        type="text"
                        name="secondary_skill"
                        value={formData.secondary_skill}
                        onChange={handleChange}
                        placeholder="e.g., Node.js, SQL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="City, Country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Job Type Checkboxes - Full Width */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Job Type Preference * (Select all that apply)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value="Full time"
                          checked={formData.job_types?.includes('Full time') || false}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Full time</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value="Part time"
                          checked={formData.job_types?.includes('Part time') || false}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Part time</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value="Consultant"
                          checked={formData.job_types?.includes('Consultant') || false}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Consultant</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value="Corporate trainer"
                          checked={formData.job_types?.includes('Corporate trainer') || false}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Corporate trainer</span>
                      </label>
                    </div>
                  </div>

                  {/* File Uploads - Now Optional */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF/DOCX) <span className="text-gray-500 text-xs">(Optional)</span></label>
                      <input
                        type="file"
                        name="resume"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof (PDF/JPG) <span className="text-gray-500 text-xs">(Optional)</span></label>
                      <input
                        type="file"
                        name="id_proof"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-lg shadow-lg mt-6"
                  >
                    {loading ? '⏳ Saving...' : editingResume ? '💾 Update Profile' : '✅ Save Profile'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Upload Resumes Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bulk Resume Upload</h2>
            <p className="text-gray-600 mb-4">Upload multiple resumes at once (PDF, DOC, DOCX). AI will automatically parse each resume.</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleBulkUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadMessage && (
              <div className={`mt-4 p-4 rounded-lg border-2 ${
                uploadMessage.includes('✅') && !uploadMessage.includes('⚠️') 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : uploadMessage.includes('⚠️')
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  : 'bg-red-50 border-red-400 text-red-800'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{uploadMessage}</pre>
              </div>
            )}
            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Uploading and parsing resumes...</p>
                <p className="mt-1 text-sm text-gray-500">This may take 3-7 seconds per resume...</p>
              </div>
            )}
            
            {/* Upload Tips */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📝 Upload Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Supported formats: PDF, DOC, DOCX</li>
                <li>✅ Maximum file size: 5MB per file</li>
                <li>✅ Maximum files: 20 at once</li>
                <li>⏱️ Processing time: 3-7 seconds per resume</li>
                <li>💡 AI extracts: Name, Email, Phone, Skills, Experience</li>
              </ul>
            </div>
          </div>
        )}

        {/* My Resumes Tab */}
        {activeTab === 'myresumes' && (
          <div>
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Search Resumes</h2>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by primary skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sort By</option>
                  <option value="experience">Experience</option>
                </select>
                {sortBy === 'experience' && (
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                )}
                <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Search
                </button>
                <button onClick={fetchResumes} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                  Reset
                </button>
              </div>
              <p className="text-sm text-gray-600">💡 Tip: Search looks only in primary skill field</p>
            </div>

            {/* Resumes Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold p-6 border-b">My Uploaded Resumes ({resumes.length})</h2>
              {resumes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg">📭 No resumes found</p>
                  <p className="text-sm mt-2">Upload resumes or use manual entry to get started</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Placement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {resumes.map((resume) => {
                      const hasParsingError = resume.name === 'Unknown' || !resume.email || !resume.parsed_data?.skills?.length;
                      return (
                        <tr key={resume.id} className={`hover:bg-gray-50 ${hasParsingError ? 'bg-yellow-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {resume.name}
                            {hasParsingError && (
                              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded" title="Parsing may have failed">
                                ⚠️ Check
                              </span>
                            )}
                          </td>
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
                                <span className="text-gray-400 text-xs">No skills parsed</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{resume.experience_years || 0} years</td>
                          <td className="px-6 py-4 whitespace-nowrap">{resume.location || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <select
                                value={resume.recruitment_status || 'Pending'}
                                onChange={(e) => handleStatusChange(resume.id, e.target.value)}
                                disabled={updatingStatus[resume.id]}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="Pending">Pending</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Profile Not Found">Profile Not Found</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Interview scheduled">Interview scheduled</option>
                                <option value="Closed">Closed</option>
                              </select>
                              <select
                                value={resume.placement_status || ''}
                                onChange={(e) => handleStatusChange(resume.id, e.target.value, 'placement')}
                                disabled={updatingStatus[resume.id]}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="">-- Placement --</option>
                                <option value="Bench">Bench</option>
                                <option value="Onboarded">Onboarded</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <select
                                value={resume.assigned_to || ''}
                                onChange={(e) => handleAssignToAdmin(resume.id, e.target.value)}
                                disabled={assigningResume[resume.id]}
                                className="text-sm border border-gray-300 rounded px-2 py-1 bg-purple-50"
                              >
                                <option value="">-- Assign to Admin --</option>
                                {adminsList.map(admin => (
                                  <option key={admin.id} value={admin.id}>
                                    {admin.name} ({admin.role})
                                  </option>
                                ))}
                              </select>
                              {resume.assigned_to && (
                                <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                                  ✅ Assigned to: {resume.assigned_to_name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-3 items-center">
                              <button
                                onClick={() => {
                                  // Load resume data for editing
                                  handleEditResume(resume);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium"
                                title="Edit this resume"
                              >
                                ✏️ Update
                              </button>
                              <a
                                href={`http://localhost:5000${resume.resume_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                📥 Download
                              </a>
                              <button
                                onClick={() => handleDeleteResume(resume.id, resume.name)}
                                className="text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
                                title="Delete Resume Permanently"
                              >
                                ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
