// SuccessScreen.tsx
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SuccessScreen = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const navigate = useNavigate();

  useEffect(() => {
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
    <div className="relative w-full min-h-screen bg-gray-50 px-3 sm:px-6 pt-10 sm:pt-16 lg:pt-20">
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
        className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto text-center flex flex-col items-center justify-center relative z-10"
      >
        <div className="bg-green-200 rounded-full p-4 sm:p-6 mb-6">
          <ThumbsUp size={48} className="text-blue-800 sm:w-16 sm:h-16" />
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-blue-900 mb-2">
          Your request has been submitted successfully
        </h2>

        <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-8">
          We will reach out to you shortly
        </p>

        <button
          onClick={goToDashboard}
          className="px-5 sm:px-6 lg:px-8 py-3 bg-[#032352] text-white rounded-md text-sm sm:text-lg hover:bg-blue-900 transition"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
