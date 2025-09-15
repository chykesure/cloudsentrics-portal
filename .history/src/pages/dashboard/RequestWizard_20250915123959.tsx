import { useState } from "react";
import { motion } from "framer-motion";

import Step1 from "../dashboard/Step1";
import Step2 from "../dashboard/Step2";
import Step3 from "../dashboard/Step3";
import Step4 from "../dashboard/Step4";
import Step5 from "../dashboard/Step5";
import Step6 from "../dashboard/Step6"; 
import SuccessScreen from "../dashboard/SuccessScreen";

const RequestWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // store what user selected in Step1
  const [requestType, setRequestType] = useState<string | null>(null);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 2000); 
  };

  const goNext = () => {
    if (currentStep < 6) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
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

      {/* Title */}
      <h2 className="text-4xl font-bold mb-8 text-gray-800">Request Portal</h2>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full ${
                i + 1 <= currentStep ? "bg-[#032352]" : "bg-gray-300"
              }`}
            />
            {i < 5 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  i + 1 < currentStep ? "bg-[#032352]" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Render Steps */}
      {showSuccess ? (
        <SuccessScreen />
      ) : currentStep === 1 ? (
        <Step1
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          requestType={requestType}
          setRequestType={setRequestType}
        />
      ) : currentStep === 2 ? (
        <Step2 goNext={goNext} goBack={goBack} />
      ) : currentStep === 3 ? (
        <Step3 goNext={goNext} goBack={goBack} />
      ) : currentStep === 4 ? (
        <Step4 goNext={goNext} goBack={goBack} />
      ) : currentStep === 5 ? (
        <Step5 goNext={goNext} goBack={goBack} />
      ) : currentStep === 6 ? (
        <Step6 goBack={goBack} onSubmit={handleSubmit} />
      ) : null}
    </div>
  );
};

export default RequestWizard;
