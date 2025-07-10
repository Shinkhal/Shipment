import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-700">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <p className="mb-4">
        Welcome to [Your Company Name]. By accessing or using our shipment platform, you agree to
        the following terms and conditions. Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Service Usage</h2>
      <p className="mb-4">
        Our platform allows registered users to create, track, and manage shipment deliveries.
        Misuse or fraudulent use of the platform may result in suspension or termination of your
        account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Shipment Responsibility</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>You are responsible for providing accurate shipment details.</li>
        <li>We are not liable for delays caused by incorrect information or third-party carriers.</li>
        <li>Prohibited items must not be shipped through our platform.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Payment & Refunds</h2>
      <p className="mb-4">
        Payments are processed via Razorpay. If a shipment is cancelled before dispatch, you may be
        eligible for a full refund as per our cancellation policy.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Account Security</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account credentials. Please
        notify us immediately if you suspect unauthorized access.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
      <p className="mb-4">
        We may update these terms from time to time. Continued use of our platform after changes
        constitutes acceptance of the updated terms.
      </p>

      <p className="mt-8 text-sm text-gray-500">Last updated: [Insert Date]</p>
    </div>
  );
};

export default TermsAndConditions;
