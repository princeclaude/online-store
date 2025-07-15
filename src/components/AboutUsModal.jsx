import React from "react";
import { FaTimes } from "react-icons/fa";

const AboutUsModal = ({ onClose }) => {
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 animate-slide-up overflow-y-auto max-h-[90vh] relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-center text-black">
          About Us
        </h2>

        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base md:text-lg">
          Welcome to ClassicRoyal, where innovation meets elegance in fashion.
          We are a dynamic online fashion marketplace dedicated to providing our
          customers with a premium shopping experience that merges style,
          quality, and affordability. Our goal is to empower individuals by
          making top-tier fashion accessible and effortless to find.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base md:text-lg">
          Founded by passionate entrepreneurs and creative designers, our brand
          thrives on values of integrity, diversity, and customer satisfaction.
          We carefully curate our collections to reflect the latest trends and
          timeless pieces that suit every lifestyle—whether you're looking for
          streetwear, formal attire, accessories, or limited-edition drops.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base md:text-lg">
          At ClassicRoyal, we prioritize not just your style, but your
          experience. From easy navigation, secure payments, and responsive
          support, every touchpoint is built for your convenience. We work
          closely with trusted local and international suppliers, ensuring every
          product is crafted with attention to detail and durability.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base md:text-lg">
          As we grow, we remain committed to ethical business practices and
          sustainability. Our vision is to build a global fashion community that
          celebrates individuality and fosters confidence through clothing.
        </p>

        <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
          Thank you for choosing ClassicRoyal. We're more than a store—we're a
          style movement. Join us, and express yourself like royalty.
        </p>
      </div>
    </div>
  );
};

export default AboutUsModal;
