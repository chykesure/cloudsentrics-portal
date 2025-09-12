// SuccessScreen.tsx
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

const SuccessScreen = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center bg-gray-50 pt-20">
      {/* 🎉 Confetti */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={300}
      />

      {/* Centered Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-12 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto text-center flex flex-col items-center relative z-10"
      >
        <div className="bg-green-200 rounded-full p-8 mb-6">
          <ThumbsUp size={72} className="text-blue-800" />
        </div>

        <h2 className="text-3xl font-bold text-blue-900 mb-4">
          Your request has been submitted successfully
        </h2>
        <p className="text-lg text-gray-700 mb-10">
          We will reach out to you shortly
        </p>

        <button
          onClick={goToDashboard}
          className="px-10 py-4 bg-[#032352] text-white rounded-md text-lg hover:bg-blue-900"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
