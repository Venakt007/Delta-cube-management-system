import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData.email);
      const response = await axios.post('/api/auth/login', formData);
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      console.log('User role:', response.data.user.role);
      console.log('Navigating to dashboard...');

      // Force page reload to ensure App.js reads updated localStorage
      if (response.data.user.role === 'super_admin') {
        console.log('Redirecting to /super-admin');
        window.location.href = '/super-admin';
      } else if (response.data.user.role === 'admin') {
        console.log('Redirecting to /admin');
        window.location.href = '/admin';
      } else {
        console.log('Redirecting to /recruiter');
        window.location.href = '/recruiter';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>
        
        {error && (
          <div className="p-4 mb-6 rounded bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline">Back to Application Form</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
