import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Terms', path: '/terms' }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Brand */}
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mr-2 shadow-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShipFast
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6">
            {quickLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Social Links & Copyright */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              © {currentYear} ShipFast
            </div>
          </div>
        </div>
        
        {/* Mobile Copyright */}
        <div className="text-center text-sm text-gray-500 mt-4 sm:hidden">
          © {currentYear} ShipFast. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;