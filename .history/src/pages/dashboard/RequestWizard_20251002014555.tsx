// RequestWizard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import Step1 from "../dashboard/Step1";
import Step2 from "../dashboard/Step2";
import Step3 from "../dashboard/Step3";
import Step4 from "../dashboard/Step4";
import Step5 from "../dashboard/Step5";
import Step6 from "../dashboard/step6";
import SuccessScreen from "../dashboard/SuccessScreen";

const RequestWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Centralized data collected from all steps
  const [formData, setFormData] = useState<any>({
    awsAccounts: [],
    storage: {},
    changeRequest: {},
    acknowledgements: [],
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const container = document.getElementById("main-scroll");
    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // 🔹 Final submit handler
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // optional JWT
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      const data = await res.json();
      console.log("✅ Saved to DB & Jira:", data);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentStep < 6) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    setCurrentStep((prev) => (prev === 6 ? 1 : Math.max(prev - 1, 1)));
  };

  const jumpToStep = (step: number) => {
    if (step >= 1 && step <= 6) setCurrentStep(step);
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

      {/* Step Components */}
      {showSuccess ? (
        <SuccessScreen />
      ) : currentStep === 1 ? (
        <Step1
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          formData={formData}
          setFormData={setFormData}
        />
      ) : currentStep === 2 ? (
        <Step2
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          formData={formData}
          setFormData={setFormData}
        />
      ) : currentStep === 3 ? (
        <Step3
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          formData={formData}
          setFormData={setFormData}
        />
      ) : currentStep === 4 ? (
        <Step4
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          formData={formData}
          setFormData={setFormData}
        />
      ) : currentStep === 5 ? (
        <Step5
          goNext={goNext}
          goBack={goBack}
          jumpToStep={jumpToStep}
          formData={formData}
          setFormData={setFormData}
        />
      ) : currentStep === 6 ? (
        <Step6
  goBack={goBack}
  formData={formData}             // ✅ add this
  setFormData={setFormData}       // ✅ add this
  onSubmit={() => {
    setFormData((prev: any) => ({
      ...prev,
      acknowledgements: [
        "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
        "I understand that Cloud Sentrics may store my data outside my region",
        "I confirm the information provided is accurate and approve this request.",
      ],
    }));
    handleSubmit();
  }}
/>

      ) : null}
    </div>
  );
};

export default RequestWizard;
