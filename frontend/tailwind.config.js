/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1E2E',         // Deep Midnight Navy
        accent: '#E0C68A',          // Champagne Gold
        background: '#F1F3F5',      // Soft Cool Gray
        surface: '#FFFFFF',         // White
        textPrimary: '#111111',     // Charcoal Black
        textSecondary: '#6B7280',   // Warm Gray
        success: '#8EB69B',         // Sage Green
        error: '#E57373',           // Soft Red
        border: '#E5E7EB',          // Light Gray for borders
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
