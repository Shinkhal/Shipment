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
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        {React.createElement(icon, { className: `w-6 h-6 ${iconColor}` })}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-4">
        {/* Address Field */}
        <textarea
          value={addressData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={`Complete address ${required ? '*' : ''}`}
          rows="2"
          required={required}
        />

        {/* State and City Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* State Dropdown */}
          <select
            value={addressData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            required={required}
          >
            <option value="">Select State {required ? '*' : ''}</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* City Dropdown */}
          <div className="relative">
            <select
              value={addressData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              disabled={!addressData.state || loadingCities}
              required={required}
            >
              <option value="">
                {loadingCities ? 'Loading...' : `Select City ${required ? '*' : ''}`}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {loadingCities && (
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Pincode Field */}
        <input
          type="text"
          value={addressData.pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 6) handleInputChange('pincode', value);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={`PIN Code ${required ? '*' : ''}`}
          maxLength="6"
          required={required}
        />
      </div>
    </div>
  );
};

export default AddressSection;
