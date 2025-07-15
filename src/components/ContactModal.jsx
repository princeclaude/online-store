import React, { useEffect, useRef, useState } from "react";
import { FaEnvelope, FaWhatsapp, FaTimes } from "react-icons/fa";

const ContactModal = ({ onClose }) => {
  const [animateOut, setAnimateOut] = useState(false);
  const modalRef = useRef();

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      triggerClose();
    }
  };

  const triggerClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      onClose();
    }, 400); // Match animation duration
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={modalRef}
        className={`bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-lg transition-all max-h-[90vh] overflow-y-auto ${
          animateOut ? "animate-slide-down" : "animate-slide-up"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Contact Us</h2>
          <button
            onClick={triggerClose}
            className="text-gray-600 text-xl hover:text-red-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Icons Section */}
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 mt-8">
          {/* Email */}
          <a
            href="mailto:your@email.com"
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 animate-bounce-up-1"
          >
            <FaEnvelope className="text-4xl sm:text-5xl text-black" />
            <span className="mt-2 text-sm sm:text-base font-medium">Email</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/2349012345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-gray-700 hover:text-green-600 animate-bounce-up-2"
          >
            <FaWhatsapp className="text-4xl sm:text-5xl text-black" />
            <span className="mt-2 text-sm sm:text-base font-medium">
              WhatsApp
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
