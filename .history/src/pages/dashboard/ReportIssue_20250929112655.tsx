// ReportIssue.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import Issue1 from "../dashboard/Issue1";
import Issue2 from "../dashboard/Issue2";
import Issue3 from "../dashboard/Issue3";
import ReportSuccess from "../dashboard/ReportSuccess";
import type { ReportFormData } from "../dashboard/types"; // ✅ import shared type

const ReportIssue = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ✅ Full form state across all steps
  const [formData, setFormData] = useState<ReportFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    accountId: "",
    bucketName: "",
    title: "",
    description: "",
    priority: "Medium",
    date: "",
    time: "",
    category: "",
    otherCategoryDesc: "",
    steps: "",
    image: null,
    confirm: false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      for (const key in formData) {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined) {
          payload.append(key, value instanceof File ? value : String(value));
        }
      }

      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();
      console.log("Report submitted:", result);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };


  const goNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-10 relative">
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

      <h2 className="text-4xl font-bold mb-8 text-gray-800">Report Issue</h2>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[1, 2, 3].map((step, i) => {
          const isCompleted = step < currentStep || (step === 3 && submitted);
          const isCurrent = step === currentStep && !submitted;

          return (
            <div key={step} className="flex-1 flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold
                  ${isCompleted ? "bg-green-600 text-white" : ""}
                  ${isCurrent ? "bg-[#032352] text-white" : ""}
                  ${!isCompleted && !isCurrent ? "bg-gray-300 text-gray-600" : ""}
                `}
              >
                {isCompleted ? "✓" : step}
              </div>

              {i < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-300"
                    }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Components or Success Screen */}
      {showSuccess ? (
        <ReportSuccess />
      ) : currentStep === 1 ? (
        <Issue1 goNext={goNext} goBack={goBack} formData={formData} setFormData={setFormData} />
      ) : currentStep === 2 ? (
        <Issue2 goNext={goNext} goBack={goBack} formData={formData} setFormData={setFormData} />
      ) : currentStep === 3 ? (
        <Issue3 goBack={goBack} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />
      ) : null}
    </div>
  );
};

export default ReportIssue;
