// ReportIssue.tsx
import { useState } from "react";
import { motion } from "framer-motion";

import Issue1 from "../dashboard/Issue1";
import Issue2 from "../dashboard/Issue2";
import Issue3 from "../dashboard/";
import SuccessScreen from "../dashboard/SuccessScreen";

const ReportIssue = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 8000); // simulate delay
  };

  const goNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1); // ✅ max = 3
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-10 relative">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <motion.div
            className="h-16 w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="mt-4 text-gray-700 font-medium text-lg animate-pulse text-center">
            Processing, please wait...
          </p>
        </div>
      )}

      {/* Page Title */}
      <h2 className="text-4xl font-bold mb-8 text-gray-800">Request Portal</h2>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[...Array(3)].map((_, i) => ( // ✅ only 3 steps
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full ${
                i + 1 <= currentStep ? "bg-[#032352]" : "bg-gray-300"
              }`}
            />
            {i < 2 && ( // ✅ only 2 connecting lines
              <div
                className={`flex-1 h-1 mx-2 ${
                  i + 1 < currentStep ? "bg-[#032352]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Components or Success Screen */}
      {showSuccess ? (
        <SuccessScreen />
      ) : currentStep === 1 ? (
        <Issue1 goNext={goNext} goBack={goBack} />
      ) : currentStep === 2 ? (
        <Issue2 goNext={goNext} goBack={goBack} />
      ) : currentStep === 3 ? (
        <Issue3 goBack={goBack} onSubmit={handleSubmit} /> // ✅ final submit here
      ) : null}
    </div>
  );
};

export default ReportIssue;
