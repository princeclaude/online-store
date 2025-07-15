// src/components/PrivacyModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import "../styles/custom.css";

const PrivacyModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-full max-w-3xl p-6 rounded-t-lg animate-slide-up overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Privacy Policy</h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            At ClassicRoyal, your privacy is important to us. This privacy
            policy outlines how we collect, use, and protect your personal
            information.
          </p>

          <h3 className="font-semibold text-base">1. Information We Collect</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Your name, email address, and phone number.</li>
            <li>Billing and shipping information.</li>
            <li>Items you purchase or add to your wishlist or cart.</li>
          </ul>

          <h3 className="font-semibold text-base">
            2. How We Use Your Information
          </h3>
          <p>
            We use your information to provide and improve our services, process
            transactions, and communicate with you regarding your orders and
            promotions.
          </p>

          <h3 className="font-semibold text-base">
            3. How We Protect Your Data
          </h3>
          <p>
            Your data is securely stored and protected using encryption and
            secure database systems. We do not sell your information to third
            parties.
          </p>

          <h3 className="font-semibold text-base">4. Cookies</h3>
          <p>
            We use cookies to personalize your experience and monitor website
            traffic.
          </p>

          <h3 className="font-semibold text-base">5. Contact Us</h3>
          <p>
            If you have any questions regarding this privacy policy, please
            contact us at techmadeus@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
