import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LocationSelect = ({ value, onChange, name, required, className }) => {
  const [locations, setLocations] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);

  // Default locations
  const defaultLocations = [
    'Hyderabad, India',
    'Bangalore, India',
    'Mumbai, India',
    'Delhi, India',
    'Pune, India',
    'Chennai, India',
    'Remote',
    'USA',
    'UK',
    'Canada'
  ];

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      if (response.data.length > 0) {
        let locs = response.data;
        // If value exists but not in list, add it
        if (value && !locs.includes(value)) {
          locs = [value, ...locs];
        }
        setLocations(locs);
      } else {
        setLocations(defaultLocations);
      }
    } catch (error) {
      console.error('Failed to fetch locations, using defaults');
      setLocations(defaultLocations);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/locations', { name: newLocation.trim() });
      await fetchLocations();
      setNewLocation('');
      setShowAddNew(false);
      // Auto-select the newly added location
      onChange({ target: { name, value: newLocation.trim() } });
    } catch (error) {
      alert('Failed to add location. Please try again.');
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
        <option value="">Select Location</option>
        {locations.map((loc, index) => (
          <option key={index} value={loc}>
            {loc}
          </option>
        ))}
        <option value="__ADD_NEW__" className="font-semibold text-blue-600">
          + Add New Location
        </option>
      </select>

      {showAddNew && (
        <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Location Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g., Kolkata, India or Remote - Europe"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLocation();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddLocation}
              disabled={loading || !newLocation.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddNew(false);
                setNewLocation('');
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

export default LocationSelect;
