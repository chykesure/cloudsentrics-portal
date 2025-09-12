// RequestWizard.tsx
import { useState } from "react";
import Step1 from ".";
// Later: import Step2, Step3, Step4, Step5

const RequestWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-10">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-8 text-gray-800">
        Request Portal
      </h2>

      {/* Dynamic Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-6 h-6 rounded-full ${
                i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            {i < 4 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  i + 1 < currentStep ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Rendering */}
      {currentStep === 1 && <Step1 goNext={goNext} goBack={goBack} />}
      {currentStep === 2 && <div>Step 2 layout goes here</div>}
      {currentStep === 3 && <div>Step 3 layout goes here</div>}
      {currentStep === 4 && <div>Step 4 layout goes here</div>}
      {currentStep === 5 && <div>Step 5 layout (review & submit)</div>}
    </div>
  );
};

export default RequestWizard;
