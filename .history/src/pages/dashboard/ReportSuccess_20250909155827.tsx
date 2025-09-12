// ReportSuccess.tsx
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

const ReportSuccess = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Get screen size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToDashboard = () => {
    window.location.href = "/dashboard/report-issue"; // change as needed
  };

  return (
    <div className="relative w-full">
      {/* 🎉 Confetti */}
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-xl mx-auto text-center flex flex-col items-center justify-center min-h-[400px] relative z-10"
      >
        <div className="bg-green-200 rounded-full p-6 mb-6">
          <ThumbsUp size={64} className="text-blue-800" />
        </div>

        <h2 className="text-2xl font-semibold text-blue-900 mb-2">
          Your request has been submitted successfully
        </h2>
        <p className="text-gray-700 mb-8">We will reach out to you shortly</p>

        <button
          onClick={goToDashboard}
          className="px-6 py-3 bg-[#032352] text-white rounded-md text-lg hover:bg-blue-900"
        >
          Com
        </button>
      </motion.div>
    </div>
  );
};

export default ReportSuccess;
