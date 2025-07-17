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
    <footer className="bg-surface/80 backdrop-blur-xl border-t border-accent/20 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Brand */}
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg mr-2 shadow-lg border border-accent/20">
              <Truck className="w-5 h-5 text-accent" />
            </div>
            <span className="text-lg font-bold text-primary">
              ShipNest
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-6">
            {quickLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="text-sm text-textSecondary hover:bg-accent/10 transition-all duration-300 px-3 py-1.5 rounded-lg border border-transparent hover:border-accent/20 backdrop-blur-sm"
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
                    className="w-7 h-7 flex items-center justify-center text-textSecondary hover:bg-accent/10 transition-all duration-300 rounded-lg border border-transparent hover:border-accent/20 backdrop-blur-sm"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            <div className="text-sm text-textSecondary hidden sm:block">
              © {currentYear} ShipNest
            </div>
          </div>
        </div>
        
        {/* Mobile Copyright */}
        <div className="text-center text-sm text-textSecondary mt-4 sm:hidden">
          © {currentYear} ShipNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;