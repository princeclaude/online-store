import { useEffect, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

const SignInModal = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [visible, setVisible] = useState(false);
  const modalRef = useRef;
  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    // Start slide-in animation
    const timer = setTimeout(() => setVisible(true), 50);
    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    // Slide out first
    setVisible(false);
    setTimeout(() => {
      onClose(); // Then unmount modal after animation
    }, 500); // Should match transition duration
  };

  const handleBckdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div
        className={`w-full sm:w-[400px] h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
        >
          <FaTimes />
        </button>

        
        <div className="p-6 mt-10">
          {isSignUp ? <SignUp /> : <SignIn />}

          <p className="mt-6 text-center text-sm text-gray-700">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 font-medium underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                New to the family?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 font-medium underline"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
