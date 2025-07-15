import React, { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import AboutUsModal from "./AboutUsModal";
import SearchModal from "./SearchModal";
import ContactModal from "./ContactModal";

const FooterComponent = () => {
  const year = new Date().getFullYear();
  const [showAbout, setShowAbout] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    setMessage("");
    if (!email || !email.includes("@")) {
      return setMessage("Please enter a valid email.");
    }

    setSubscribing(true);

    try {
      const q = query(
        collection(db, "newsletter"),
        where("email", "==", email)
      );
      const existing = await getDocs(q);

      if (existing.empty) {
        await addDoc(collection(db, "newsletter"), {
          email,
          subscribedAt: new Date(),
        });
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage("You're already subscribed.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-black text-white px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo & description */}
        <div>
          <h2 className="text-2xl font-bold mb-3 text-yellow-400">
            ClassicRoyal
          </h2>
          <p className="text-sm text-gray-300">
            Your one-stop shop for quality fashion, accessories and more.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="/home" className="hover:text-yellow-400">
                Home
              </a>
            </li>
            <li
              className="cursor-pointer hover:text-yellow-400"
              onClick={() => setShowSearch(true)}
            >
              Search
            </li>
            {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
            <li
              className="cursor-pointer hover:text-yellow-400"
              onClick={() => setShowAbout(true)}
            >
              About Us
            </li>
            {showAbout && <AboutUsModal onClose={() => setShowAbout(false)} />}
            <li
              className="cursor-pointer hover:text-yellow-400"
              onClick={() => setShowContact(true)}
            >
              Contact
            </li>
            {showContact && (
              <ContactModal onClose={() => setShowContact(false)} />
            )}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Service</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="/orders" className="hover:text-yellow-400">
                My Orders
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-yellow-400">
                FAQs
              </a>
            </li>
            <li>
              <a href="/returns" className="hover:text-yellow-400">
                Returns
              </a>
            </li>
            <li>
              <a href="/settings" className="hover:text-yellow-400">
                Account Settings
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter & Socials */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="px-3 py-2 rounded bg-gray-800 text-white w-full outline-none text-sm"
            />
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50"
            >
              {subscribing ? "..." : "Subscribe"}
            </button>
          </div>
          {message && <p className="text-xs text-gray-400 mt-1">{message}</p>}

          <div className="flex space-x-4 text-xl mt-4">
            <a href="https://facebook.com" className="hover:text-blue-400">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" className="hover:text-blue-300">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" className="hover:text-pink-500">
              <FaInstagram />
            </a>
            <a
              href="https://wa.me/2349012345678"
              className="hover:text-green-500"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-sm flex flex-col md:flex-row justify-between items-center text-gray-400">
        <div className="flex space-x-3 text-xl mb-3 md:mb-0">
          <FaCcMastercard />
          <FaCcVisa />
        </div>
        <p>© {year} ClassicRoyal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterComponent;
