import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import welcomeImg from "../assets/Image3.png";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLoginClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Overlay with Spinner */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <motion.div
            className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="mt-4 text-gray-700 font-medium text-lg animate-pulse text-center">
            Loading, please wait...
          </p>
        </div>
      )}

      {/* Left Section */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="
          flex flex-col items-center 
          justify-start md:justify-center 
          flex-[1.7] px-6 sm:px-12 
          text-center bg-white z-10 
          py-8 md:py-12
        "
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Cloud Sentrics"
          className="mb-4 h-28 sm:h-36 md:h-44 lg:h-48 object-contain"
        />

        {/* Heading */}
        <h1
          className="
            mb-4 
            text-2xl sm:text-4xl md:text-5xl lg:text-6xl 
            font-extrabold 
            text-blue-900 
            leading-snug sm:leading-tight md:leading-[1.2] 
            text-center md:text-left
          "
        >
          Welcome to  Cloud Sentrics
        </h1>

        {/* Description */}
        <p
          className="
            mb-6 
            max-w-full sm:max-w-4xl 
            text-gray-600 
            text-sm sm:text-base md:text-lg lg:text-xl 
            leading-relaxed 
            text-center md:text-left
          "
        >
          Our program is designed to provide hands-on, practical training that
          helps you transition into Cloud and DevSecOps roles with confidence.
          Companies choose Cloud Sentrics because we offer customized cloud
          solutions tailored to your business needs, leverage our expertise in
          cloud technologies and security to ensure scalable and secure
          environments, and provide end-to-end support from consultation through
          to deployment and ongoing optimization for seamless integration.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full max-w-xs sm:max-w-lg md:max-w-md mt-2">
          <motion.button
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            onClick={handleLoginClick}
            disabled={loading}
            className="
              w-full 
              rounded-lg 
              bg-gradient-to-r from-blue-800 to-blue-900 
              px-4 sm:px-6 lg:px-8 
              py-2.5 sm:py-3 lg:py-4 
              text-base sm:text-lg lg:text-xl 
              font-semibold 
              text-white 
              shadow-md 
              transition hover:shadow-lg 
              disabled:opacity-70
            "
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/signup")}
            className="
              w-full 
              rounded-lg 
              border-2 border-blue-900 
              px-4 sm:px-6 lg:px-8 
              py-2.5 sm:py-3 lg:py-4 
              text-base sm:text-lg lg:text-xl 
              font-semibold 
              text-blue-900 
              transition hover:bg-blue-50
            "
          >
            Signup
          </motion.button>
        </div>
      </motion.div>

      {/* Right Section (hidden on mobile) */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex relative flex-1 items-center justify-center overflow-hidden bg-gradient-to-r from-blue-700 to-blue-900"
      >
        <img
          src={welcomeImg}
          alt="Welcome Illustration"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/50 to-blue-900/80" />
      </motion.div>
    </div>
  );
};

export default WelcomePage;
