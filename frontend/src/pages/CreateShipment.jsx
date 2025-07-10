import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  User,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AddressSection from '../components/AddressSection'; // adjust path if needed


const CreateShipment = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sender: {
      name: '',
      phone: '',
      email: ''
    },
    receiver: {
      name: '',
      phone: '',
      email: ''
    },
    pickup: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    delivery: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    package: {
      description: '',
      weight: '',
      category: 'Documents'
    },
    service: {
      type: 'Standard',
      pickupDate: '',
      preferredTime: 'Anytime'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const packageCategories = [
    { value: 'Documents', label: 'Documents' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Books', label: 'Books' },
    { value: 'Gifts', label: 'Gifts' },
    { value: 'Others', label: 'Others' }
  ];

  const serviceTypes = [
    { value: 'Standard', label: 'Standard (3-5 days)' },
    { value: 'Express', label: 'Express (1-2 days)' },
    { value: 'SameDay', label: 'Same Day' }
  ];

  const timeSlots = [
    'Anytime (9 AM - 6 PM)',
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 3 PM)',
    'Evening (3 PM - 6 PM)'
  ];

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        sender: {
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || ''
        }
      }));
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const required = [
      formData.sender.name,
      formData.sender.phone,
      formData.receiver.name,
      formData.receiver.phone,
      formData.pickup.address,
      formData.pickup.city,
      formData.pickup.state,
      formData.pickup.pincode,
      formData.delivery.address,
      formData.delivery.city,
      formData.delivery.state,
      formData.delivery.pincode,
      formData.package.description,
      formData.package.weight,
    ];

    return required.every(field => field && field.toString().trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        toast.error('Please fill in all required fields.');
        return; 
    }
    setIsLoading(true);
    // i have to send the form data to the confirm details page no api call here
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to confirm details page with form data
      navigate('/confirm', { state: { formData } });
    } catch (error) {
      console.error('Error creating shipment:', error);
      setMessage({ type: 'error', text: 'Failed to create shipment. Please try again.' });
    } finally {
      setIsLoading(false);
    }
    
    
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create Shipment</h1>
          </div>
          <p className="text-gray-600">Fill in the details to book your shipment</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sender Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Sender Details</h3>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.sender.name}
                    onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your full name *"
                    required
                  />
                  
                  <input
                    type="tel"
                    value={formData.sender.phone}
                    onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your phone number *"
                    required
                  />
                  
                  <input
                    type="email"
                    value={formData.sender.email}
                    onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your email (optional)"
                  />
                </div>
              </div>

              {/* Receiver Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Receiver Details</h3>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.receiver.name}
                    onChange={(e) => handleInputChange('receiver', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Receiver's full name *"
                    required
                  />
                  
                  <input
                    type="tel"
                    value={formData.receiver.phone}
                    onChange={(e) => handleInputChange('receiver', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Receiver's phone number *"
                    required
                  />
                  
                  <input
                    type="email"
                    value={formData.receiver.email}
                    onChange={(e) => handleInputChange('receiver', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Receiver's email (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t pt-8">
              {/* Pickup Address Section */}
<AddressSection
  title="Pickup Address"
  icon={MapPin}
  iconColor="text-purple-600"
  addressData={formData.pickup}
  onAddressChange={(field, value) =>
    handleInputChange('pickup', field, value)
  }
/>

{/* Delivery Address Section */}
<AddressSection
  title="Delivery Address"
  icon={MapPin}
  iconColor="text-green-600"
  addressData={formData.delivery}
  onAddressChange={(field, value) =>
    handleInputChange('delivery', field, value)
  }
/>

            </div>

            {/* Package & Service */}
            <div className="border-t pt-8 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Package & Service Details</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.package.description}
                    onChange={(e) => handleInputChange('package', 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Package description *"
                    required
                  />
                  
                  <select
                    value={formData.package.category}
                    onChange={(e) => handleInputChange('package', 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {packageCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={formData.package.weight}
                      onChange={(e) => handleInputChange('package', 'weight', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Weight (kg) *"
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <select
                    value={formData.service.type}
                    onChange={(e) => handleInputChange('service', 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {serviceTypes.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="date"
                    value={formData.service.pickupDate}
                    onChange={(e) => handleInputChange('service', 'pickupDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={getTomorrowDate()}
                  />
                  
                  <select
                    value={formData.service.preferredTime}
                    onChange={(e) => handleInputChange('service', 'preferredTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Confirming</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>View Bill</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;