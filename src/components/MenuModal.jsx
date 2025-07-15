import { useEffect, useRef, useState } from "react";
import { FaStore, FaInfoCircle, FaLock, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MenuModal = ({ onClose, setShowPrivacy, setShowAbout }) => {
  const dropdownRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setVisible(false);
        setTimeout(() => onClose(), 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:justify-center">
      <div
        ref={dropdownRef}
        className={`w-full max-w-xs md:max-w-sm bg-white shadow-xl rounded-l-lg md:rounded-lg p-5 transition-all duration-300 ease-in-out transform ${
          visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <ul className="space-y-5 text-gray-800 text-sm md:text-base">
          <li
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={onClose}
          >
            <FaStore /> Store
          </li>

          <li
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={() => {
              onClose();
              setShowAbout(true);
            }}
          >
            <FaInfoCircle /> About Us
          </li>

          <li
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
            onClick={() => {
              onClose();
              setShowPrivacy(true);
            }}
          >
            <FaLock /> Privacy
          </li>

          <li
            onClick={() => {
              onClose();
              navigate("/settings");
            }}
            className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
          >
            <FaCog /> Settings
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuModal;
