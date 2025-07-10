import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-700">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        At [Your Company Name], we value your trust. This Privacy Policy outlines how we collect,
        use, and protect your personal information when you use our shipment and delivery services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Personal details such as your name, phone number, and email address</li>
        <li>Shipment-related data including sender and receiver details</li>
        <li>Payment information via our secure payment gateway (Razorpay)</li>
        <li>Usage data such as browser type, IP address, and access times</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>To manage and track your shipments</li>
        <li>To process payments and refunds securely</li>
        <li>To provide customer support and notifications</li>
        <li>To improve our services and protect against fraud</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Protection</h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data. All payment
        transactions are encrypted and handled through secure third-party providers.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing Your Data</h2>
      <p className="mb-4">
        We do not sell your personal information. Your data is only shared with trusted
        third-party services essential to provide our core functionality (e.g., payment processors).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, modify, or delete your data. For any privacy-related concerns,
        please contact us at <strong>support@[yourdomain].com</strong>.
      </p>

      <p className="mt-8 text-sm text-gray-500">Last updated: [Insert Date]</p>
    </div>
  );
};

export default PrivacyPolicy;
