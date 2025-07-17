import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const AddressSection = ({
  title,
  icon = MapPin,
  iconColor,
  addressData,
  onAddressChange,
  required = true,
}) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const indianStates = useMemo(() => [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala',
    'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ], []);

  useEffect(() => {
    setStates(indianStates);
  }, [indianStates]);

  useEffect(() => {
    if (!addressData.state) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: 'India', state: addressData.state }),
        });

        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          const sorted = data.data.sort();
          setCities(sorted);

          // Reset city if it's no longer valid
          if (!sorted.includes(addressData.city)) {
            onAddressChange('city', '');
          }
        } else {
          setCities([]);
          onAddressChange('city', '');
        }
      } catch (err) {
        console.error('City fetch failed:', err);
        setCities([]);
        onAddressChange('city', '');
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [addressData.state]);

  const handleInputChange = (field, value) => {
    onAddressChange(field, value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-surface/80 backdrop-blur-sm rounded-xl border border-border">
          {React.createElement(icon, { className: `w-6 h-6 ${iconColor}` })}
        </div>
        <h3 className="text-xl font-semibold text-primary">{title}</h3>
      </div>

      <div className="space-y-5">
        {/* Address Field */}
        <div className="relative">
          <textarea
            value={addressData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary resize-none"
            placeholder={`Complete address ${required ? '*' : ''}`}
            rows="3"
            required={required}
          />
          <div className="absolute top-3 right-3 text-textSecondary/40">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* State and City Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* State Dropdown */}
          <div className="relative">
            <select
              value={addressData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary appearance-none cursor-pointer"
              required={required}
            >
              <option value="" className="text-textSecondary">
                Select State {required ? '*' : ''}
              </option>
              {states.map((state) => (
                <option key={state} value={state} className="text-textPrimary">
                  {state}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-textSecondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* City Dropdown */}
          <div className="relative">
            <select
              value={addressData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!addressData.state || loadingCities}
              required={required}
            >
              <option value="" className="text-textSecondary">
                {loadingCities ? 'Loading cities...' : `Select City ${required ? '*' : ''}`}
              </option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-textPrimary">
                  {city}
                </option>
              ))}
            </select>
            
            {/* Loading spinner or dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              {loadingCities ? (
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4 text-textSecondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Pincode Field */}
        <div className="relative">
          <input
            type="text"
            value={addressData.pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) handleInputChange('pincode', value);
            }}
            className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
            placeholder={`PIN Code ${required ? '*' : ''}`}
            maxLength="6"
            required={required}
          />
          <div className="absolute top-3 right-3 text-textSecondary/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AddressSection;