import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";
import logo from "../assets/logo.png";
import type { OnboardingData } from "../types/onboarding";

const OnboardingForm3: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fieldErrors, setFieldErrors] = useState({});


  // Receive data from Step 2
  const { formDataStep1, awsSetupData } = location.state as {
    formDataStep1?: OnboardingData["companyInfo"];
    awsSetupData?: OnboardingData["awsSetup"];
  };

  // Redirect back if any previous step data is missing
  useEffect(() => {
    if (!formDataStep1) {
      navigate("/signup/step1", { replace: true });
    } else if (!awsSetupData) {
      navigate("/signup/step2", { replace: true });
    }
  }, [formDataStep1, awsSetupData, navigate]);


  const [agreements, setAgreements] = useState({
    agree: false,
    acknowledge: false,
    confirm: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [step3Completed, setStep3Completed] = useState(false);

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSubmitDisabled = !agreements.agree || !agreements.acknowledge || !agreements.confirm;

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      toast.error("Please check all the boxes before submitting.", {
        position: "top-right",
      });
      return;
    }

    if (!formDataStep1 || !awsSetupData) return;

    const payload = {
      companyInfo: formDataStep1,
      awsSetup: awsSetupData,
      agreements,
      userId: "TEMP123", // ⚠️ include a userId if required in your schema
    };

    try {
      const res = await fetch("http://localhost:5000/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Onboarding saved! Customer ID: ${data.customerId}`);
        setStep3Completed(true);
        setShowModal(true);
      } else {
        // ✅ Always show backend error in toast
        toast.error(data.error || data.message || "Something went wrong", {
          position: "top-right",
        });

        // ✅ Extra: highlight duplicate field if provided
        if (data.error && data.error.includes("Duplicate entry")) {
          if (data.error.includes("companyInfo.companyEmail")) {
            setFieldErrors((prev) => ({
              ...prev,
              companyEmail: "This email is already registered.",
            }));
          }
          if (data.error.includes("customerId")) {
            setFieldErrors((prev) => ({
              ...prev,
              customerId: "A customer with this ID already exists.",
            }));
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to the server");
    }
  };


  // Prevent rendering if previous step data is missing while redirecting
  if (!formDataStep1 || !awsSetupData) return null;

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* ✅ Toast container */}
      <Toaster />

      {/* Left Section (Form) */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col flex-[1.5] px-4 sm:px-8 py-6 md:py-12 bg-white z-10"
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Cloud Sentrics"
          className="mb-2 h-12 sm:h-36 object-contain"
        />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 w-full max-w-md">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white text-sm sm:text-base font-semibold">
              ✓
            </div>
          </div>

          <div className="flex-1 h-[2px] bg-blue-700 mx-2"></div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white text-sm sm:text-base font-semibold">
              ✓
            </div>
          </div>

          <div
            className="flex-1 h-[2px] mx-2"
            style={{ backgroundColor: step3Completed ? "#1D4ED8" : "#D1D5DB" }}
          ></div>

          {/* Step 3 */}
          <div className="flex items-center">
            {step3Completed ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white text-sm sm:text-base font-semibold">
                ✓
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 text-sm sm:text-base font-semibold">
                3
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-10">
          AGREEMENT & CONFIRMATION
        </h2>

        {/* Agreement Checkboxes */}
        <div className="space-y-6 sm:space-y-8 text-base sm:text-lg leading-relaxed">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreements.agree}
              onChange={() => handleCheckboxChange("agree")}
              className="mt-1 w-5 h-5 sm:w-6 sm:h-6 border-gray-400"
            />
            <span>
              <strong>I agree</strong> that the selections above are accurate and I
              am authorized to submit this onboarding on behalf of my organization.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreements.acknowledge}
              onChange={() => handleCheckboxChange("acknowledge")}
              className="mt-1 w-5 h-5 sm:w-6 sm:h-6 border-gray-400"
            />
            <span>
              <strong>I acknowledge</strong> that Cloud Sentrics may store my data
              in AWS regions outside of my country or geographic region, and that
              such storage will still comply with all applicable data protection
              regulations.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreements.confirm}
              onChange={() => handleCheckboxChange("confirm")}
              className="mt-1 w-5 h-5 sm:w-6 sm:h-6 border-gray-400"
            />
            <span>
              <strong>I confirm</strong> that I will not upload, store, or process
              any prohibited data on Cloud Sentrics' systems. Prohibited data
              includes, but is not limited to: illegal content, malicious code,
              pornographic material, child sexual abuse material (CSAM), or any
              personal data for which I do not have a lawful basis to process.
            </span>
          </label>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sm:mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup/step2")}
            className="px-5 py-3 rounded-lg border border-gray-400 text-gray-700 text-base sm:text-lg font-medium hover:bg-gray-100 w-full sm:w-auto"
          >
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold shadow w-full sm:w-auto transition ${isSubmitDisabled
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-blue-800 text-white hover:bg-blue-900"
              }`}
          >
            Submit
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex relative flex-1 items-center justify-center overflow-hidden h-48 md:h-auto md:flex"
      >
        {/* Background Image */}
        {/* <img
          src={image1}
          alt="Onboarding background"
          className="absolute inset-0 w-full h-full object-cover"
        /> */}

        <img
          src="/Image2.jpg"
          alt="Onboarding background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/70" />

        {/* Foreground */}
        <div className="relative text-center text-white max-w-lg p-6 sm:p-12">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-4 sm:mb-6">
            Customer Onboarding Form
          </h2>
          <p className="text-sm sm:text-lg md:text-xl leading-relaxed mb-4 sm:mb-6">
            This form captures the confirmed details of your Cloud Sentrics service
            so we can provision your AWS environment accurately.
          </p>
          <p className="mt-2 sm:mt-4 italic text-sm sm:text-lg md:text-xl">
            Please review each section carefully and ensure all details match your
            intended set up.
          </p>
        </div>
      </motion.div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative bg-white rounded-lg shadow-lg p-10 w-[90%] max-w-2xl text-center"
          >
            {/* 🎉 Confetti Effect */}
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
            />

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-700 text-white text-3xl">
                ✓
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations
            </h2>
            <p className="text-gray-700 font-medium mb-2">
              Account Created Successfully
            </p>
            <p className="text-gray-600 mb-6">
              Check your email for your customer ID
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-700 font-semibold hover:underline"
            >
              Continue to Login
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OnboardingForm3;
