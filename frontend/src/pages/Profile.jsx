import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Shield, 
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    uid: '',
    createdAt: '',
    updatedAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper function to decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          uid: userData.uid || uid,
          createdAt: userData.createdAt || '',
          updatedAt: userData.updatedAt || ''
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  // Check if token is valid and not expired
  const isTokenValid = (decodedToken) => {
    if (!decodedToken) return false;
    const currentTime = Date.now() / 1000;
    return !decodedToken.exp || decodedToken.exp >= currentTime;
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('Shipmenttoken');
        
        if (!token) {
          navigate('/auth');
          return;
        }

        const decodedToken = decodeToken(token);
        
        if (!isTokenValid(decodedToken)) {
          localStorage.removeItem('Shipmenttoken');
          navigate('/auth');
          return;
        }
        
        const uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
        
        if (!uid) {
          navigate('/auth');
          return;
        }

        // Try to fetch user data from Firestore
        const userData = await fetchUserData(uid);
        
        if (userData) {
          setUser(userData);
          setEditForm(userData);
        } else {
          // Fallback to token data if no Firestore document exists
          const fallbackData = {
            name: decodedToken.name || decodedToken.displayName || 'User',
            email: decodedToken.email || '',
            phone: '',
            uid: uid,
            createdAt: '',
            updatedAt: ''
          };
          setUser(fallbackData);
          setEditForm(fallbackData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({...user});
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({...user});
    setError('');
  };

  const handleSave = async () => {
    // Basic validation
    if (!editForm.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedData = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(userDocRef, updatedData);
      
      const updatedUser = {
        ...editForm,
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        updatedAt: updatedData.updatedAt
      };
      
      setUser(updatedUser);
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignOut = () => {
    localStorage.removeItem('Shipmenttoken');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-accent"></div>
          <div className="absolute inset-0 bg-surface/20 backdrop-blur-sm rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: User },
    { id: 'settings', name: 'Settings', icon: Shield }
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/20 p-8 relative overflow-hidden">
              {/* Subtle accent background */}
              <div className="absolute -top-20 -right-20 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
              
              <div className="text-center mb-8 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 text-accent rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg border border-accent/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-textPrimary mb-2">{user.name}</h2>
                <p className="text-textSecondary text-sm font-medium">{user.email}</p>
              </div>
              
              <nav className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-5 py-4 rounded-xl transition-all duration-300 font-medium ${
                        activeTab === tab.id
                          ? 'bg-accent/10 text-primary border border-accent/20 shadow-sm'
                          : 'text-textSecondary hover:bg-surface/50 hover:text-textPrimary border border-transparent'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/20 p-10 relative overflow-hidden">
                {/* Subtle accent background */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/3 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">Personal Information</h2>
                    <p className="text-textSecondary">Manage your profile details and preferences</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="group flex items-center space-x-2 bg-primary hover:bg-primary/90 text-accent px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl border border-accent/10"
                    >
                      <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="group flex items-center space-x-2 bg-success hover:bg-success/90 disabled:bg-success/50 text-surface px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="group flex items-center space-x-2 bg-surface hover:bg-background disabled:bg-surface/50 text-textSecondary border border-border px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-sm"
                      >
                        <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl backdrop-blur-sm">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-8 relative z-10">
                  <div className="group">
                    <label className="block text-sm font-semibold text-textPrimary mb-3">
                      <User className="w-4 h-4 inline mr-2 text-accent" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-4 bg-surface/80 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-textPrimary placeholder-textSecondary/60 transition-all duration-300 backdrop-blur-sm"
                        disabled={isSaving}
                        required
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="text-textPrimary bg-background/50 px-4 py-4 rounded-xl border border-border/20 font-medium">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-textPrimary mb-3">
                      <Mail className="w-4 h-4 inline mr-2 text-accent" />
                      Email Address
                    </label>
                    <div className="text-textPrimary bg-background/50 px-4 py-4 rounded-xl border border-border/20 font-medium">
                      {user.email}
                    </div>
                    <p className="text-xs text-textSecondary mt-2 ml-1">Email address cannot be modified</p>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-textPrimary mb-3">
                      <Phone className="w-4 h-4 inline mr-2 text-accent" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-4 bg-surface/80 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-textPrimary placeholder-textSecondary/60 transition-all duration-300 backdrop-blur-sm"
                        placeholder="Enter your phone number"
                        disabled={isSaving}
                      />
                    ) : (
                      <div className="text-textPrimary bg-background/50 px-4 py-4 rounded-xl border border-border/20 font-medium">
                        {user.phone || (
                          <span className="text-textSecondary italic">No phone number provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/20 p-10 relative overflow-hidden">
                {/* Subtle accent background */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/3 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">Account Settings</h2>
                    <p className="text-textSecondary">Manage your account preferences and security</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border-b border-border/20 pb-6">
                      <h3 className="text-lg font-semibold text-textPrimary mb-4">Account Actions</h3>
                      <button 
                        onClick={handleSignOut}
                        className="group bg-red-600 hover:bg-red-700 text-gray-200 border border-error/20 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <span className="group-hover:scale-105 transition-transform inline-block">Sign Out</span>
                      </button>
                    </div>
                    
                    <div className="text-center py-12 border border-spacing-x-10" >
                      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-textPrimary mb-2">More Settings Coming Soon</h3>
                      <p className="text-textSecondary">Additional security and preference options will be available in future updates</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;