import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

interface FormData {
  companyName: string;
  companyEmail: string;
  primaryName: string;
  primaryPhone: string;
  primaryEmail: string;
  secondaryName: string;
  secondaryPhone: string;
  secondaryEmail: string;
}

const OnboardingForm1: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fieldError = location.state?.fieldError;

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    companyEmail: "",
    primaryName: "",
    primaryPhone: "",
    primaryEmail: "",
    secondaryName: "",
    secondaryPhone: "",
    secondaryEmail: "",
  });

  // Enable "Next" button only if required fields are filled
  const isNextDisabled =
    !formData.companyName ||
    !formData.companyEmail ||
    !formData.primaryName ||
    !formData.primaryPhone ||
    !formData.primaryEmail;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Load saved data if exists
  useEffect(() => {
    const savedData = sessionStorage.getItem("onboardingStep1");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    sessionStorage.setItem("onboardingStep1", JSON.stringify(formData));
  }, [formData]);


  const handleNext = () => {
    console.log("Form Data:", formData); // verify in console
    navigate("/signup/step2", { state: { formDataStep1: formData } });
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Left Section (Form) */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col flex-[1.5] px-4 sm:px-8 py-6 md:py-12 bg-white z-10"
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Cloud Sentrics"
          className="mb-4 h-12 sm:h-16 object-contain"
        />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 w-full max-w-md mx-auto md:mx-0">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white font-semibold text-sm sm:text-base">
              1
            </div>
          </div>
          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 font-semibold text-sm sm:text-base">
              2
            </div>
          </div>
          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 font-semibold text-sm sm:text-base">
              3
            </div>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center md:text-left">
          CUSTOMER INFORMATION
        </h2>

        {/* Company Info */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Company/Organization Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="E.g Cloud Sentrics"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Company/Organization Email
          </label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={handleChange}
            placeholder="E.g cloudcentrics@gmail.com"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none ${fieldError?.companyEmail
              ? "border-red-500 focus:ring-red-500"
              : "focus:ring-blue-700"
              }`}
          />
          {fieldError?.companyEmail && (
            <p className="text-red-600 text-sm mt-1">{fieldError.companyEmail}</p>
          )}
        </div>

        {/* Primary Contact */}
        <div className="bg-gray-200 px-4 py-2 font-semibold text-gray-800 rounded-md mb-3 text-sm sm:text-base">
          Primary Contact
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="primaryName"
            value={formData.primaryName}
            onChange={handleChange}
            placeholder="E.g Ademola Ayodeji Johnson"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            name="primaryPhone"
            value={formData.primaryPhone}
            onChange={handleChange}
            placeholder="E.g +2348194584357"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <input
          type="email"
          name="primaryEmail"
          value={formData.primaryEmail}
          onChange={handleChange}
          placeholder="E.g cloudcentrics@gmail.com"
          className="border rounded-lg px-3 py-2 text-sm w-full mb-4"
        />

        {/* Secondary Contact */}
        <div className="bg-gray-200 px-4 py-2 font-semibold text-gray-800 rounded-md mb-3 text-sm sm:text-base">
          Secondary Contact
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            name="secondaryName"
            value={formData.secondaryName}
            onChange={handleChange}
            placeholder="E.g Ademola Ayodeji Johnson"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            type="text"
            name="secondaryPhone"
            value={formData.secondaryPhone}
            onChange={handleChange}
            placeholder="E.g +2348194584357"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <input
          type="email"
          name="secondaryEmail"
          value={formData.secondaryEmail}
          onChange={handleChange}
          placeholder="E.g cloudcentrics@gmail.com"
          className="border rounded-lg px-3 py-2 text-sm w-full mb-6"
        />

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`w-full rounded-lg py-3 font-semibold shadow text-sm sm:text-base transition ${isNextDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-800 text-white hover:bg-blue-900"
            }`}
        >
          Next
        </button>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden md:flex relative flex-1 items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <img
          src="Image2.jpg"
          alt="Onboarding background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/70" />

        {/* Foreground */}
        <div className="relative text-center text-white max-w-xl p-6 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-snug">
            Customer Onboarding Form
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-4">
            This form captures the confirmed details of your Cloud Sentric service
            so we can provision your AWS environment accurately.
          </p>
          <p className="mt-2 sm:mt-4 italic text-sm sm:text-base md:text-lg">
            Please review each section carefully and ensure all details match
            your intended set up.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingForm1;
