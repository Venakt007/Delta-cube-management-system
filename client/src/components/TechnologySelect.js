import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TechnologySelect = ({ value, onChange, name, required, className }) => {
  const [technologies, setTechnologies] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newTech, setNewTech] = useState('');
  const [loading, setLoading] = useState(false);

  // Default technologies
  const defaultTechnologies = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'DevOps',
    'Cloud Computing',
    'AI/ML'
  ];

  useEffect(() => {
    fetchTechnologies();
  }, [value]);

  const fetchTechnologies = async () => {
    try {
      const response = await axios.get('/api/technologies');
      if (response.data.length > 0) {
        let techs = response.data;
        // If value exists but not in list, add it
        if (value && !techs.includes(value)) {
          techs = [value, ...techs];
        }
        setTechnologies(techs);
      } else {
        setTechnologies(defaultTechnologies);
      }
    } catch (error) {
      console.error('Failed to fetch technologies, using defaults');
      setTechnologies(defaultTechnologies);
    }
  };

  const handleAddTechnology = async () => {
    if (!newTech.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/technologies', { name: newTech.trim() });
      await fetchTechnologies();
      setNewTech('');
      setShowAddNew(false);
      // Auto-select the newly added technology
      onChange({ target: { name, value: newTech.trim() } });
    } catch (error) {
      alert('Failed to add technology. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select
        name={name}
        value={value}
        onChange={(e) => {
          if (e.target.value === '__ADD_NEW__') {
            setShowAddNew(true);
          } else {
            onChange(e);
          }
        }}
        required={required}
        className={className}
      >
        <option value="">Select Technology</option>
        {technologies.map((tech, index) => (
          <option key={index} value={tech}>
            {tech}
          </option>
        ))}
        <option value="__ADD_NEW__" className="font-semibold text-blue-600">
          + Add New Technology
        </option>
      </select>

      {showAddNew && (
        <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Technology Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              placeholder="e.g., Blockchain, Cybersecurity"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTechnology();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              disabled={loading || !newTech.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddNew(false);
                setNewTech('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnologySelect;
