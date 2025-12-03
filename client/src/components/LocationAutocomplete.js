import React, { useState, useEffect, useRef } from 'react';

const LocationAutocomplete = ({ value, onChange, name, placeholder, required, className }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Fallback locations if API fails
  const fallbackLocations = [
    // India - Major Cities
    'Hyderabad, Telangana, India',
    'Bangalore, Karnataka, India',
    'Mumbai, Maharashtra, India',
    'Delhi, NCR, India',
    'Pune, Maharashtra, India',
    'Chennai, Tamil Nadu, India',
    'Kolkata, West Bengal, India',
    'Ahmedabad, Gujarat, India',
    'Gurgaon, Haryana, India',
    'Noida, Uttar Pradesh, India',
    'Jaipur, Rajasthan, India',
    'Lucknow, Uttar Pradesh, India',
    'Chandigarh, Punjab, India',
    'Kochi, Kerala, India',
    'Indore, Madhya Pradesh, India',
    'Visakhapatnam, Andhra Pradesh, India',
    'Bhopal, Madhya Pradesh, India',
    'Patna, Bihar, India',
    'Vadodara, Gujarat, India',
    'Ludhiana, Punjab, India',
    'Agra, Uttar Pradesh, India',
    'Nashik, Maharashtra, India',
    'Faridabad, Haryana, India',
    'Meerut, Uttar Pradesh, India',
    'Rajkot, Gujarat, India',
    'Varanasi, Uttar Pradesh, India',
    'Srinagar, Jammu and Kashmir, India',
    'Aurangabad, Maharashtra, India',
    'Amritsar, Punjab, India',
    'Coimbatore, Tamil Nadu, India',
    'Mysore, Karnataka, India',
    'Bhubaneswar, Odisha, India',
    'Dehradun, Uttarakhand, India',
    'Mangalore, Karnataka, India',
    'Udaipur, Rajasthan, India',
    
    // USA - Major Cities
    'New York, NY, USA',
    'Los Angeles, CA, USA',
    'Chicago, IL, USA',
    'Houston, TX, USA',
    'Phoenix, AZ, USA',
    'Philadelphia, PA, USA',
    'San Antonio, TX, USA',
    'San Diego, CA, USA',
    'Dallas, TX, USA',
    'San Jose, CA, USA',
    'Austin, TX, USA',
    'Jacksonville, FL, USA',
    'Fort Worth, TX, USA',
    'Columbus, OH, USA',
    'Charlotte, NC, USA',
    'San Francisco, CA, USA',
    'Indianapolis, IN, USA',
    'Seattle, WA, USA',
    'Denver, CO, USA',
    'Washington, DC, USA',
    'Boston, MA, USA',
    'Nashville, TN, USA',
    'Detroit, MI, USA',
    'Portland, OR, USA',
    'Las Vegas, NV, USA',
    'Miami, FL, USA',
    'Atlanta, GA, USA',
    'Orlando, FL, USA',
    'Tampa, FL, USA',
    'Minneapolis, MN, USA',
    
    // UK - Major Cities
    'London, England, UK',
    'Birmingham, England, UK',
    'Manchester, England, UK',
    'Glasgow, Scotland, UK',
    'Liverpool, England, UK',
    'Leeds, England, UK',
    'Sheffield, England, UK',
    'Edinburgh, Scotland, UK',
    'Bristol, England, UK',
    'Leicester, England, UK',
    'Newcastle, England, UK',
    'Nottingham, England, UK',
    'Southampton, England, UK',
    'Cardiff, Wales, UK',
    'Belfast, Northern Ireland, UK',
    'Cambridge, England, UK',
    'Oxford, England, UK',
    'Brighton, England, UK',
    'Reading, England, UK',
    'Coventry, England, UK',
    
    // Australia - Major Cities
    'Sydney, NSW, Australia',
    'Melbourne, VIC, Australia',
    'Brisbane, QLD, Australia',
    'Perth, WA, Australia',
    'Adelaide, SA, Australia',
    'Gold Coast, QLD, Australia',
    'Canberra, ACT, Australia',
    'Newcastle, NSW, Australia',
    'Wollongong, NSW, Australia',
    'Hobart, TAS, Australia',
    'Geelong, VIC, Australia',
    'Townsville, QLD, Australia',
    'Cairns, QLD, Australia',
    'Darwin, NT, Australia',
    'Toowoomba, QLD, Australia',
    'Ballarat, VIC, Australia',
    'Bendigo, VIC, Australia',
    'Launceston, TAS, Australia',
    'Mackay, QLD, Australia',
    'Rockhampton, QLD, Australia',
    
    // Remote Options
    'Remote',
    'Work From Home',
    'Anywhere in India',
    'Anywhere in USA',
    'Anywhere in UK',
    'Anywhere in Australia',
    'Remote - Global'
  ];

  // Handle input change - using only fallback locations
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e);

    if (inputValue.length > 2) {
      // Filter fallback locations based on input
      const filtered = fallbackLocations.filter(location =>
        location.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (location) => {
    onChange({ target: { name, value: location } });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(location)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
            >
              <span className="inline-block mr-2">📍</span>
              {location}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
