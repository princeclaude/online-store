import React, { useEffect, useState } from "react";
import {
  FiMenu,
  FiSearch,
  FiHeart,
  FiUser,
  FiShoppingBag,
  FiShare,
} from "react-icons/fi";
import { FaEnvelope, FaPhoneAlt, FaShoppingBasket, FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

import logo from "../assets/logowhite.png";
import SignInModal from "./SignInModal";
import UserInfoModal from "./UserInfoModal";
import SearchModal from "./SearchModal";
import MenuModal from "./MenuModal";
import BagModal from "./BagModal";
import GuestBagModal from "./GuestBagModal";
import EmptyWishlistPrompt from "./EmptyWishlistPrompt";
import SharedItemsModal from "./SharedItemsModal";
import UserOrdersModal from "./UserOrdersModal";
import "../styles/custom.css";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useBag } from "../contexts/BagContext";
import ContactModal from "./ContactModal";
import PrivacyModal from "./PrivacyModal";
import AboutUsModal from "./AboutUsModal";

const currencyOptions = [
  { code: "USD", flag: "us" },
  { code: "EUR", flag: "eu" },
  { code: "GBP", flag: "gb" },
  { code: "NGN", flag: "ng" },
  { code: "CAD", flag: "ca" },
  { code: "JPY", flag: "jp" },
  { code: "ALB", flag: "al" },
  { code: "GER", flag: "de" },
  { code: "NL", flag: "nl" },
];

const EMAIL_ADDRESS = "techmadeus@gmail.com";
const WHATSAPP = "+2347018462475";

const HeaderIcons = () => (
  <div className="flex space-x-3 ml-2">
    <div
      className="text-blue-700 cursor-pointer"
      onClick={() => alert("Please check our contactus page")}
      title="Send us a mail"
    >
      <FaEnvelope size={18} />
    </div>
    <div
      className="text-green-600 cursor-pointer"
      onClick={() => alert("Please check our contactus page ")}
      title="Chat on WhatsApp"
    >
      <FaWhatsapp size={18} />
    </div>
  </div>
);

const HeaderComponent = ({ cartCount = 0, setShowWishlist }) => {
  const { user, userProfile } = useAuth();
  const [currency, setCurrency] = useState("");
  const [flagCode, setFlagCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showBagModal, setShowBagModal] = useState(false);
  const [showGuestBagModal, setShowGuestBagModal] = useState(false);
  const [showShareItemModal, setShowShareItemModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const { bagCount, fetchBagItems } = useBag();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchBagItems();
  }, [user]);

  useEffect(() => {
    const fetchGeoInfo = async () => {
      try {
        const res = await axios.get("https://ipapi.co/json/");
        const { country_code, currency } = res.data;
        setCurrency(currency);
        setFlagCode(country_code.toLowerCase());
      } catch (error) {
        console.error("Failed to fetch location:", error);
      }
    };
    fetchGeoInfo();
  }, []);

  const firstName = userProfile.name.split(" ");

  const handleCurrencyChange = (code, flag) => {
    setCurrency(code);
    setFlagCode(flag);
    setShowCurrencyModal(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black shadow-md z-50 px-4 py-5 flex items-center justify-between flex-wrap md:flex-nowrap">
      {/* Left Group */}
      <div className="flex items-center space-x-4 flex-wrap">
        {/* Menu */}
        <div className="relative z-50">
          <div
            className="flex items-center space-x-1 cursor-pointer text-white text-sm"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu className="text-lg" />
            <span>Menu</span>
          </div>
          {menuOpen && (
            <MenuModal
              onClose={() => setMenuOpen(false)}
              setShowPrivacy={setShowPrivacy}
              setShowAbout={setShowAbout}
            />
          )}
        </div>

        {/* Search */}
        <div
          className="flex items-center space-x-1 cursor-pointer text-white text-sm"
          onClick={() => setShowSearchModal(true)}
        >
          <FiSearch className="text-lg" />
          <span>Search</span>
        </div>

        {currency && flagCode && (
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setShowCurrencyModal(!showCurrencyModal)}
          >
            <img
              src={`https://flagcdn.com/w40/${flagCode}.png`}
              alt="Flag"
              className="w-5 h-3 object-cover"
            />
            <p className="text-xs text-green-500">{currency}</p>
          </div>
        )}

        {user && (
          <button onClick={() => setShowShareItemModal(true)}>
            <FiShare color="white" size={18} />
          </button>
        )}

        <HeaderIcons />
      </div>

     
      <div className="flex items-center space-x-4 mt-4 md:mt-0">
        {user && userProfile?.name && (
          <p className="text-xs text-green-400 font-semibold">
            Hi, {firstName[0]}
          </p>
        )}

        {!user && (
          <span
            className="text-xs text-white cursor-pointer hover:text-green-500"
            onClick={() => setShowGuestBagModal(true)}
          >
            See your bag
          </span>
        )}

        <button onClick={() => setShowContactModal(true)}>
          <span className="text-xs text-white">Contact Us</span>
        </button>

        {user && (
          <button title="Your orders" onClick={() => setShowOrdersModal(true)}>
            <FaShoppingBasket size={18} color="white" />
          </button>
        )}

        <FiHeart
          className="text-white text-lg cursor-pointer"
          onClick={() => {
            user ? setShowWishlist(true) : setShowPrompt(true);
          }}
        />

        <FiUser
          className="text-white text-lg cursor-pointer"
          onClick={() => setShowModal(true)}
        />

        {user && (
          <div
            className="relative cursor-pointer"
            onClick={() => setShowBagModal(true)}
            title="Bag"
          >
            <FiShoppingBag className="text-white text-lg" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
              {bagCount}
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCurrencyModal && (
        <div className="absolute bg-white p-4 top-24 left-20 rounded shadow-md z-50 w-40">
          <h4 className="text-sm font-semibold mb-2">Choose Currency</h4>
          {currencyOptions.map((opt) => (
            <div
              key={opt.code}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded mb-1"
              onClick={() => handleCurrencyChange(opt.code, opt.flag)}
            >
              <img
                src={`https://flagcdn.com/w40/${opt.flag}.png`}
                alt={opt.code}
                className="w-5 h-3 object-cover"
              />
              <span className="text-sm text-black">{opt.code}</span>
            </div>
          ))}
        </div>
      )}

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showAbout && <AboutUsModal onClose={() => setShowAbout(false)} />}
      {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      {showShareItemModal && (
        <SharedItemsModal
          onClose={() => setShowShareItemModal(false)}
          fetchBagItems={fetchBagItems}
        />
      )}
      {showOrdersModal && (
        <UserOrdersModal onClose={() => setShowOrdersModal(false)} />
      )}
      {showModal &&
        (user ? (
          <UserInfoModal onClose={() => setShowModal(false)} />
        ) : (
          <SignInModal onClose={() => setShowModal(false)} />
        ))}
      {showPrompt && (
        <EmptyWishlistPrompt onClose={() => setShowPrompt(false)} />
      )}
      {showBagModal && <BagModal onClose={() => setShowBagModal(false)} />}
      {showGuestBagModal && (
        <GuestBagModal
          onClose={() => setShowGuestBagModal(false)}
          currency={currency?.toLocaleUpperCase() || "NGN"}
        />
      )}
    </header>
  );
};

export default HeaderComponent;