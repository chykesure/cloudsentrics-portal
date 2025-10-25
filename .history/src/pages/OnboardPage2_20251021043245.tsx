import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import type { OnboardingData } from "../types/onboarding";

interface OnboardingForm2Props {}

v

  // 🧠 State
  const [selectedAccounts, setSelectedAccounts] = useState<number | null>(null);
  const [moreThanFive, setMoreThanFive] = useState<string>("");
  const [aliases, setAliases] = useState<{ [key: string]: string }>({});
  const [bulkAliases, setBulkAliases] = useState<string>("");
  const [extraAliases, setExtraAliases] = useState<string>("");

  const parseMoreThanFive = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  const effectiveCount = selectedAccounts ?? (moreThanFive ? parseMoreThanFive(moreThanFive) : 0);

  // 🧩 Hybrid mode logic
  const isHybridMode = effectiveCount > 6;
  const aliasKeys = Array.from({ length: Math.min(effectiveCount, 6) }, (_, i) => String.fromCharCode(65 + i));

  useEffect(() => {
    const count = Math.min(6, effectiveCount);
    const newAliases: { [key: string]: string } = {};
    for (let i = 0; i < count; i++) {
      newAliases[String.fromCharCode(65 + i)] = aliases[String.fromCharCode(65 + i)] ?? "";
    }
    setAliases(newAliases);
    if (effectiveCount <= 6) {
      setBulkAliases("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccounts, moreThanFive]);

  const handleCheckboxChange = (num: number) => {
    setSelectedAccounts(num);
    setMoreThanFive("");
    setBulkAliases("");
    setExtraAliases("");
  };

  const handleMoreThanFiveChange = (value: string) => {
    setMoreThanFive(value);
    setSelectedAccounts(null);
    setExtraAliases("");
  };

  const handleAliasChange = (key: string, value: string) => {
    setAliases((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ Validation
  const allSixFilled = aliasKeys.length === 6 && aliasKeys.every((k) => (aliases[k] ?? "").trim() !== "");
  const partialFilled = aliasKeys.length > 0 && aliasKeys.every((k) => (aliases[k] ?? "").trim() !== "");
  const isNextDisabled =
    effectiveCount === 0 ||
    (isHybridMode ? !allSixFilled || bulkAliases.trim() === "" : !partialFilled);

  const handleNext = () => {
    if (!formDataStep1 || isNextDisabled) return;
    const awsSetupData = {
      numberOfAccounts: effectiveCount,
      aliases,
      bulkAliases: isHybridMode ? bulkAliases.trim() : undefined,
      extraAliases,
    };
    navigate("/signup/step3", { state: { formDataStep1, awsSetupData } });
  };

  if (!formDataStep1) return null;

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Left Section */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col flex-[1.5] px-4 sm:px-8 py-6 md:py-12 bg-white z-10"
      >
        <img src={logo} alt="Cloud Sentrics" className="mb-4 h-12 sm:h-16 object-contain" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 w-full max-w-md mx-auto md:mx-0">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white font-semibold">
              ✓
            </div>
          </div>
          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 font-semibold">
              2
            </div>
          </div>
          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 font-semibold">
              3
            </div>
          </div>
        </div>

        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
          AWS ACCOUNT SET UP
        </h2>

        {/* Account Number Input */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm sm:text-lg font-semibold mb-2">
            Number of AWS Accounts Needed
          </label>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-sm sm:text-base">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAccounts === num}
                  onChange={() => handleCheckboxChange(num)}
                  className="w-4 h-4 sm:w-6 sm:h-6"
                />
                <span>{num}</span>
              </label>
            ))}
          </div>

          <div>
            <span className="block text-sm sm:text-lg font-semibold mb-1">Enter number if more than 5</span>
            <input
              type="number"
              min={1}
              value={moreThanFive}
              onChange={(e) => handleMoreThanFiveChange(e.target.value)}
              placeholder="Enter number here (e.g. 7, 10, 12)"
              className="w-full sm:w-72 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-700 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you enter more than 6, 6 alias inputs will appear + textarea for the rest.
            </p>
          </div>
        </div>

        {/* Alias Inputs */}
        {effectiveCount > 0 && (
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-lg font-semibold mb-2">
              Preferred AWS Alias for each account
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Provide organization name to appear after <code>cloudsentrics-aws-</code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {aliasKeys.map((key) => (
                <div key={key} className="flex items-center border rounded-md overflow-hidden">
                  <span className="px-2 bg-gray-100 font-semibold text-sm">{key}</span>
                  <span className="px-2 text-gray-600 text-sm">cloudsentrics-aws-</span>
                  <input
                    type="text"
                    value={aliases[key] || ""}
                    onChange={(e) => handleAliasChange(key, e.target.value)}
                    placeholder="Organization/Dept"
                    className="flex-1 px-2 py-2 text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hybrid Mode Textarea */}
        {isHybridMode && (
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-lg font-semibold mb-2">
              Additional aliases (7 and above)
            </label>
            <p className="text-xs text-gray-600 mb-2">
              This activates after all 6 alias inputs are filled.
            </p>
            <textarea
              value={bulkAliases}
              onChange={(e) => setBulkAliases(e.target.value)}
              disabled={!allSixFilled}
              placeholder={
                allSixFilled
                  ? "Enter remaining aliases (one per line)"
                  : "Please fill all six aliases above to enable this field"
              }
              rows={5}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none ${
                allSixFilled
                  ? "focus:ring-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            />
          </div>
        )}


        {/* Navigation Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="px-4 sm:px-5 py-2 rounded-lg border border-gray-400 text-gray-700 text-sm font-medium hover:bg-gray-100"
          >
            Back
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: isNextDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isNextDisabled ? 1 : 0.95 }}
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-6 py-2 rounded-lg font-semibold shadow transition ${
              isNextDisabled
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-blue-800 text-white hover:bg-blue-900"
            }`}
          >
            Next
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex-1 items-center justify-center overflow-hidden h-40 sm:h-56 md:h-auto flex"
      >
        <img src="/Image2.jpg" alt="Onboarding background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/70" />
        <div className="relative text-center text-white max-w-lg p-4 sm:p-8 md:p-12">
          <h2 className="text-base sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-6">
            Customer Onboarding Form
          </h2>
          <p className="text-xs sm:text-base md:text-xl leading-relaxed">
            This form captures your AWS setup details accurately. Please ensure all alias names are correct.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingForm2;
