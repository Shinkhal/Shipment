
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Search, Plus, MapPin, Truck, Shield, ChevronDown, ChevronUp, Leaf, Clock, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  const quickActions = [
    {
      name: "Create Shipment",
      path: "/new-shipment",
      icon: Plus,
      color: "bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70",
      textColor: "text-primary",
      description: "Send a new package",
    },
    {
      name: "Track Package",
      path: "/track",
      icon: Search,
      color: "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
      textColor: "text-white",
      description: "Track your shipments",
    },
    {
      name: "My Shipments",
      path: "/my-shipments",
      icon: Package,
      color: "bg-gradient-to-br from-success to-success/80 hover:from-success/90 hover:to-success/70",
      textColor: "text-white",
      description: "View your packages",
    },
  ];

  const faqData = [
    {
      question: "How long does delivery take within India?",
      answer: "Metro cities: 1-2 business days, Tier 2 cities: 2-3 business days, Remote areas: 3-5 business days. Same-day delivery available in major cities."
    },
    {
      question: "What are your shipping rates across India?",
      answer: "Our rates start from ₹49 for packages under 500g within the same city. Pricing depends on weight, dimensions, destination, and delivery speed. Use our calculator for exact quotes."
    },
    {
      question: "Can I track my package in real-time?",
      answer: "Yes! You'll receive a tracking number once your package is picked up. Our real-time tracking shows your package location and estimated delivery time across India."
    },
    {
      question: "What items can't be shipped?",
      answer: "We cannot ship hazardous materials, liquids, fragile items without proper packaging, perishables, or items prohibited by Indian law. Contact us for specific item questions."
    },
    {
      question: "How do I schedule a pickup?",
      answer: "You can schedule a pickup during shipment creation or call our support team. We offer same-day pickup in metro cities for orders placed before 2 PM."
    },
    {
      question: "What if my package is damaged or lost?",
      answer: "We offer insurance coverage for all shipments. If your package is damaged or lost, contact us immediately and we'll process your claim within 24 hours."
    }
  ];

  const indiaRegions = [
    { 
      name: "Delhi NCR", 
      cities: "Delhi, Gurgaon, Noida, Faridabad", 
      deliveryTime: "Same Day - 1 Day", 
      color: "bg-blue-500",
      stats: "2M+ deliveries"
    },
    { 
      name: "Mumbai Region", 
      cities: "Mumbai, Navi Mumbai, Thane, Pune", 
      deliveryTime: "Same Day - 1 Day", 
      color: "bg-green-500",
      stats: "1.8M+ deliveries"
    },
    { 
      name: "Bangalore", 
      cities: "Bangalore, Mysore, Mangalore", 
      deliveryTime: "1-2 Days", 
      color: "bg-purple-500",
      stats: "1.5M+ deliveries"
    },
    { 
      name: "Chennai Region", 
      cities: "Chennai, Coimbatore, Madurai", 
      deliveryTime: "1-2 Days", 
      color: "bg-orange-500",
      stats: "1.2M+ deliveries"
    },
    { 
      name: "Kolkata Region", 
      cities: "Kolkata, Howrah, Durgapur", 
      deliveryTime: "1-2 Days", 
      color: "bg-red-500",
      stats: "800K+ deliveries"
    },
    { 
      name: "Hyderabad Region", 
      cities: "Hyderabad, Secunderabad, Warangal", 
      deliveryTime: "1-2 Days", 
      color: "bg-indigo-500",
      stats: "900K+ deliveries"
    },
    { 
      name: "Ahmedabad Region", 
      cities: "Ahmedabad, Surat, Vadodara", 
      deliveryTime: "1-2 Days", 
      color: "bg-pink-500",
      stats: "600K+ deliveries"
    },
    { 
      name: "Other Cities", 
      cities: "Jaipur, Lucknow, Chandigarh +200 more", 
      deliveryTime: "2-3 Days", 
      color: "bg-gray-500",
      stats: "2M+ deliveries"
    }
  ];

  const sustainabilityFeatures = [
    {
      icon: Leaf,
      title: "Carbon Neutral Shipping",
      description: "We offset 100% of our shipping emissions through verified carbon credits and renewable energy partnerships across India.",
      color: "text-green-600"
    },
    {
      icon: Package,
      title: "Eco-Friendly Packaging",
      description: "All our packaging materials are recyclable or biodegradable. We use minimal packaging to reduce waste.",
      color: "text-blue-600"
    },
    {
      icon: Truck,
      title: "Electric Fleet",
      description: "25% of our delivery fleet in major Indian cities is electric, with plans to reach 80% by 2030.",
      color: "text-purple-600"
    },
    {
      icon: Heart,
      title: "Community Impact",
      description: "1% of all profits go to environmental causes in India. We've planted over 25,000 trees across Indian cities.",
      color: "text-red-600"
    }
  ];


  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ✅ Authenticated User Dashboard
  if (user) {
    const userName = user.name || user.email?.split("@")[0] || "User";

    return (
      <div className="min-h-screen bg-background">
        {/* Welcome Header with Rich Background */}
        <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-accent/5 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userName}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Ready to send or track your packages across India today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                  <p className="text-sm text-white/70">Today's Date</p>
                  <p className="text-xl font-semibold text-white">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-textPrimary mb-6">
              What would you like to do?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} ${action.textColor} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm border border-white/20`}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{action.name}</h3>
                        <p className="text-sm opacity-90 mt-2 font-medium">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Features */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Why Ship With Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-textPrimary">
                    Fast Delivery
                  </h3>
                </div>
                <p className="text-textSecondary">
                  Quick and reliable shipping across India with same-day delivery in major cities.
                </p>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-textPrimary">
                    Real-Time Tracking
                  </h3>
                </div>
                <p className="text-textSecondary">
                  Track your packages every step of the way with live updates across India.
                </p>
              </div>

              <div className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-xl bg-accent/10 text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-textPrimary">
                    Secure & Safe
                  </h3>
                </div>
                <p className="text-textSecondary">
                  Your packages are handled with care and delivered securely across India.
                </p>
              </div>
            </div>
          </div>

          

          {/* Sustainability Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-textPrimary mb-6">
              Our Commitment to India's Environment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sustainabilityFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30">
                    <div className="flex items-start mb-4">
                      <div className={`p-3 rounded-xl bg-gray-100 ${feature.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-textPrimary">{feature.title}</h3>
                        <p className="text-textSecondary mt-2">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* Hero Section */}
      <header className="text-center py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface/30 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">
            ShipNest
          </h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto text-textSecondary">
            Send packages anywhere in India, anytime. Track your shipments in real-time and
            enjoy hassle-free delivery across the country.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/auth"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl shadow-card hover:shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-sm"
            >
              Get Started
            </Link>
            <Link
              to="/track"
              className="border-2 border-primary/20 text-primary hover:bg-primary/5 px-8 py-3 rounded-xl transition-all font-semibold backdrop-blur-sm bg-surface/50"
            >
              Track Package
            </Link>
          </div>
        </div>
      </header>

      

      {/* Features */}
      <section className="py-12 px-6 bg-background">
        <h2 className="text-3xl font-semibold text-center mb-10 text-textPrimary">
          Why Choose ShipNest
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-surface/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 border border-border/30">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-textPrimary">Easy Shipping</h3>
            <p className="text-textSecondary">
              Create shipments in minutes with our simple and intuitive
              interface designed for Indian users.
            </p>
          </div>
          <div className="p-6 bg-surface/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 border border-border/30">
            <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-textPrimary">Real-Time Tracking</h3>
            <p className="text-textSecondary">
              Get live updates and track your packages through every step of
              delivery across India.
            </p>
          </div>
          <div className="p-6 bg-surface/80 backdrop-blur-sm rounded-2xl shadow-card hover:shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1 border border-border/30">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-textPrimary">Secure & Reliable</h3>
            <p className="text-textSecondary">
              Your packages are handled with care and delivered safely across
              India with 99.8% success rate.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-surface/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12 text-textPrimary">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-card">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-textPrimary">Create Shipment</h3>
              <p className="text-textSecondary">
                Enter sender and receiver details anywhere in India, package information, and
                choose your delivery options.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-card">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-textPrimary">Package Pickup</h3>
              <p className="text-textSecondary">
                Schedule a pickup from your location or drop off your package at one of our
                500+ pickup points across India.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-primary rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-card">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-textPrimary">Track & Deliver</h3>
              <p className="text-textSecondary">
                Monitor your package in real-time across India and receive notifications when
                it's delivered to any city or town.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* India Service Areas */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12 text-textPrimary">
            We Deliver Across India
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indiaRegions.map((region) => (
              <div key={region.name} className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30 transform hover:scale-105">
                <div className="flex items-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${region.color} mr-3`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary">{region.name}</h3>
                    <p className="text-sm text-textSecondary">{region.cities}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-primary">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{region.deliveryTime}</span>
                  </div>
                  <div className="text-xs text-textSecondary">
                    {region.stats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16 px-6 bg-surface/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12 text-textPrimary">
            Our Commitment to India's Environment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sustainabilityFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-surface/80 backdrop-blur-sm p-6 rounded-2xl shadow-card hover:shadow-lg transition-all border border-border/30 transform hover:scale-105">
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-xl bg-gray-100 ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-textPrimary">{feature.title}</h3>
                      <p className="text-textSecondary mt-2">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12 text-textPrimary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-surface/80 backdrop-blur-sm rounded-2xl shadow-card border border-border/30">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-surface/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-textPrimary">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-textSecondary">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary/95 backdrop-blur-sm text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Send Your First Package Across India?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join millions of Indians who trust ShipNest for their shipping
            needs. Fast, reliable, and affordable shipping solutions across the country.
          </p>
          <Link
            to="/auth"
            className="bg-accent text-primary px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-all shadow-card hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
          >
            Start Shipping Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;