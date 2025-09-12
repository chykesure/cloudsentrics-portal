// RequestWizard.tsx
import { useState } from "react";
import { motion } from "framer-motion";

import Step1 from "../dashboard/Step1";
import Step2 from "../dashboard/Step2";
import Step3 from "../dashboard/Step3";
import Step4 from "../dashboard/Step4";
import Step5 from "../dashboard/Step5";
import SuccessScreen from "../dashboard/SuccessScreen";

const RequestWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    setLoading(true); // Show spinner
    setTimeout(() => {
      setLoading(false); // Hide spinner
      setShowSuccess(true); // Show success screen
    }, 2000); // Simulate 2-second delay
  };

  const goNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
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
            Loading, please wait...
          </p>
        </div>
      )}

      {/* Page Title */}
      <h2 className="text-4xl font-bold mb-8 text-gray-800">
        Request Portal
      </h2>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full ${
                i + 1 <= currentStep ? "bg-[#032352]" : "bg-gray-300"
              }`}
            />
            {i < 4 && (
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
        <Step1 goNext={goNext} goBack={goBack} />
      ) : currentStep === 2 ? (
        <Step2 goNext={goNext} goBack={goBack} />
      ) : currentStep === 3 ? (
        <Step3 goNext={goNext} goBack={goBack} />
      ) : currentStep === 4 ? (
        <Step4 goNext={goNext} goBack={goBack} />
      ) : currentStep === 5 ? (
        <Step5 goBack={goBack} onSubmit={handleSubmit} />
      ) : null}
    </div>
  );
};

export default RequestWizard;
