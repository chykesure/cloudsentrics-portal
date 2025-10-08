// ProfileSuccess.tsx
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileSuccess = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Get screen size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-3 sm:px-6">
      {/* 🎉 Confetti */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={300}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-10 rounded-xl shadow-lg w-full max-w-xl text-center flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] relative z-10"
      >
        {/* ✅ Icon */}
        <div className="bg-green-200 rounded-full p-4 sm:p-6 mb-6">
          <ThumbsUp size={48} className="sm:size-64 text-blue-800" />
        </div>

        {/* ✅ Heading */}
        <h2 className="text-lg sm:text-2xl font-semibold text-blue-900 mb-4">
          Your Details has been updated successfully
        </h2>

        {/* ✅ Button */}
        <button
          onClick={goToDashboard}
          className="px-4 py-2 sm:px-6 sm:py-3 bg-[#032352] text-white rounded-md text-sm sm:text-lg hover:bg-blue-900"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};

export default ProfileSuccess;
