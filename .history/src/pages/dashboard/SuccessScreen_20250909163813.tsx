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
    <div className="relative w-full h-screen flex items-start justify-center bg-gray-50">
      {/* 🎉 Confetti */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={300}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white px-6 py-8 rounded-lg shadow-lg w-full max-w-md mx-auto text-center flex flex-col items-center justify-center relative z-10 mt-19"
      >
        <div className="bg-green-200 rounded-full p-4 mb-4">
          <ThumbsUp size={48} className="text-blue-800" />
        </div>

        <h2 className="text-2xl font-semibold text-blue-900 mb-2">
          Request Submitted!
        </h2>
        <p className="text-base text-gray-700 mb-6">
          We will reach out to you shortly.
        </p>

        <button
          onClick={goToDashboard}
          className="px-5 py-2 bg-[#032352] text-white rounded-md text-base hover:bg-blue-900"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessScreen;
