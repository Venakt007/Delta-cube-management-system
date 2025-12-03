import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationAutocomplete from '../components/LocationAutocomplete';
import TechnologySelect from '../components/TechnologySelect';

function ApplicationForm() {
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
  const [loading, setLoading] = useState(false);
  const [referralSource, setReferralSource] = useState('Direct');

  // Capture referral source from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('ref') || params.get('source') || 'Direct';
    setReferralSource(source);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, job_types: [...formData.job_types, value] });
    } else {
      setFormData({ ...formData, job_types: formData.job_types.filter(type => type !== value) });
    }
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
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
    data.append('referral_source', referralSource); // Add referral source
    if (files.resume) data.append('resume', files.resume);
    if (files.id_proof) data.append('id_proof', files.id_proof);

    try {
      await axios.post('/api/applications/submit', data);
      setMessage('Application submitted successfully!');
      setFormData({
        name: '', email: '', phone: '', linkedin: '', technology: '',
        primary_skill: '', secondary_skill: '', location: '', experience_years: '', job_types: []
      });
      setFiles({ resume: null, id_proof: null });
      // Reset file inputs
      document.getElementById('resume').value = '';
      document.getElementById('id_proof').value = '';
    } catch (error) {
      setMessage('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Job Application Form</h1>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technology *</label>
              <TechnologySelect
                name="technology"
                value={formData.technology}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <LocationAutocomplete
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="City, Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Job Type Checkboxes - Full Width */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-4">Job Type Preference * (Select all that apply)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value="Full time"
                  checked={formData.job_types.includes('Full time')}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Full time</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value="Part time"
                  checked={formData.job_types.includes('Part time')}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Part time</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value="Consultant"
                  checked={formData.job_types.includes('Consultant')}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Consultant</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value="Corporate trainer"
                  checked={formData.job_types.includes('Corporate trainer')}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                id="resume"
                type="file"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof (PDF/JPG) <span className="text-gray-500 text-xs">(Optional)</span></label>
              <input
                id="id_proof"
                type="file"
                name="id_proof"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:underline">Login as Recruiter/Admin</a>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;
