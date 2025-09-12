// ReportIssue.tsx
import { useState } from "react";
import { motion } from "framer-motion";

import Issue1 from "../dashboard/Issue1";
import Issue2 from "../dashboard/Issue2";
import Issue3 from "../dashboard/Issue3";
import ReportSuccess from "../dashboard/ReportSuccess";

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
                {[1, 2, 3].map((step, i) => (
                    <div key={step} className="flex-1 flex items-center">
                        {/* Circle */}
                        <div
                            className={`
          flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold
          ${step < currentStep ? "bg-green-600 text-white" : ""}  /* ✅ Completed steps */
          ${step === currentStep ? "bg-[#032352] text-white" : ""} /* ✅ Current step */
          ${step > currentStep ? "bg-gray-300 text-gray-600" : ""} /* ✅ Upcoming steps */
        `}
                        >
                            {step < currentStep ? "✓" : step} {/* ✅ Show checkmark if completed */}
                        </div>

                        {/* Connector line */}
                        {i < 2 && (
                            <div
                                className={`flex-1 h-1 mx-2 ${step < currentStep ? "bg-green-600" : "bg-gray-300"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Components or Success Screen */}
            {showSuccess ? (
                <ReportSuccess />
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
