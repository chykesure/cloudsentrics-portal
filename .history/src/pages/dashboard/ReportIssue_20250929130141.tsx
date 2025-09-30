import { useState } from "react";
import { motion } from "framer-motion";
import Issue1 from "../dashboard/Issue1";
import Issue2 from "../dashboard/Issue2";
import Issue3 from "../dashboard/Issue3";
import ReportSuccess from "../dashboard/ReportSuccess";
import type { ReportFormData } from "../dashboard/types";

const ReportIssue = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const goNext = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.confirm) return;

    if (!formData.title || !formData.description) {
      alert("Please fill in the title and description before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      const result = await res.json();
      console.log("Report submitted:", result);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report. Try again.");
    } finally {
      setLoading(false);
    }
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
          const isCompleted = step < currentStep || (step === 3 && showSuccess);
          const isCurrent = step === currentStep && !showSuccess;

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
                  className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`}
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
        <Issue3
          goBack={goBack}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
};

export default ReportIssue;
