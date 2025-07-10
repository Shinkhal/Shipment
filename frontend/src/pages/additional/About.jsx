import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">About ShipNest</h1>

      <p className="mb-6">
        <strong>ShipNest</strong> is your all-in-one platform for managing shipments effortlessly. 
        Whether you're a small business, frequent sender, or just someone who wants peace of mind while shipping, 
        ShipNest gives you the tools to book, track, and manage deliveries in real time.
      </p>

      <h2 className="text-xl font-semibold mb-2 text-gray-800">🚀 Our Mission</h2>
      <p className="mb-6">
        To simplify the shipping experience through modern technology, clear communication, and trusted logistics 
        — helping people and businesses deliver with confidence.
      </p>

      <h2 className="text-xl font-semibold mb-2 text-gray-800">📦 What We Offer</h2>
      <ul className="list-disc list-inside space-y-2 mb-6">
        <li>Easy shipment booking with smart pickup and delivery scheduling</li>
        <li>Real-time shipment tracking with status updates</li>
        <li>Secure online payments and refund processing via Razorpay</li>
        <li>Personalized dashboard to view history and upcoming deliveries</li>
        <li>Seamless communication between senders and receivers</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2 text-gray-800">👨‍💻 Built With Passion</h2>
      <p className="mb-6">
        ShipNest is built by a passionate team of developers who care deeply about reliability,
        user experience, and making shipping stress-free. We're constantly improving based on your feedback.
      </p>

      <h2 className="text-xl font-semibold mb-2 text-gray-800">📬 Get In Touch</h2>
      <p className="mb-6">
        Have questions, suggestions, or just want to say hello? We'd love to hear from you! 
        Reach us at <strong>support@shipnest.com</strong>.
      </p>

      <p className="text-sm text-gray-500">Last updated: [Insert Date]</p>
    </div>
  );
};

export default About;
