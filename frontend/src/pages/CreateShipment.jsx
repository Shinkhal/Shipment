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
import AddressSection from '../components/AddressSection';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-3 bg-surface/80 backdrop-blur-sm rounded-2xl border border-border shadow-card">
              <Package className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Create Shipment</h1>
          </div>
          <p className="text-textSecondary text-lg">Fill in the details to book your premium shipment</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-surface/70 backdrop-blur-xl rounded-2xl border border-border shadow-card p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Sender & Receiver Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sender Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Sender Details</h3>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.sender.name}
                    onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Your full name *"
                    required
                  />
                  
                  <input
                    type="tel"
                    value={formData.sender.phone}
                    onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Your phone number *"
                    required
                  />
                  
                  <input
                    type="email"
                    value={formData.sender.email}
                    onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Your email (optional)"
                  />
                </div>
              </div>

              {/* Receiver Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-success/10 rounded-xl">
                    <User className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Receiver Details</h3>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.receiver.name}
                    onChange={(e) => handleInputChange('receiver', 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Receiver's full name *"
                    required
                  />
                  
                  <input
                    type="tel"
                    value={formData.receiver.phone}
                    onChange={(e) => handleInputChange('receiver', 'phone', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Receiver's phone number *"
                    required
                  />
                  
                  <input
                    type="email"
                    value={formData.receiver.email}
                    onChange={(e) => handleInputChange('receiver', 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Receiver's email (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Address Section Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-surface px-4 py-2 rounded-xl border border-border">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pickup Address Section */}
              <AddressSection
                title="Pickup Address"
                icon={MapPin}
                iconColor="text-accent"
                addressData={formData.pickup}
                onAddressChange={(field, value) =>
                  handleInputChange('pickup', field, value)
                }
              />

              {/* Delivery Address Section */}
              <AddressSection
                title="Delivery Address"
                icon={MapPin}
                iconColor="text-success"
                addressData={formData.delivery}
                onAddressChange={(field, value) =>
                  handleInputChange('delivery', field, value)
                }
              />
            </div>

            {/* Package & Service Section */}
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <div className="bg-surface px-4 py-2 rounded-xl border border-border flex items-center space-x-2">
                    <Package className="w-5 h-5 text-accent" />
                    <span className="text-textSecondary font-medium">Package Details</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.package.description}
                    onChange={(e) => handleInputChange('package', 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Package description *"
                    required
                  />
                  
                  <select
                    value={formData.package.category}
                    onChange={(e) => handleInputChange('package', 'category', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary"
                  >
                    {packageCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    value={formData.package.weight}
                    onChange={(e) => handleInputChange('package', 'weight', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary placeholder-textSecondary"
                    placeholder="Weight (kg) *"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <select
                    value={formData.service.type}
                    onChange={(e) => handleInputChange('service', 'type', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary"
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
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary"
                    min={getTomorrowDate()}
                  />
                  
                  <select
                    value={formData.service.preferredTime}
                    onChange={(e) => handleInputChange('service', 'preferredTime', e.target.value)}
                    className="w-full px-4 py-3 bg-surface/50 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 text-textPrimary"
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
              <div className={`p-4 rounded-xl backdrop-blur-sm border flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-error/10 text-error border-error/20'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-surface rounded-xl font-semibold transition-all duration-200 shadow-card hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-surface"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>View Bill & Confirm</span>
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