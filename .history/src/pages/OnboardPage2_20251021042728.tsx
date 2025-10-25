import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import type { OnboardingData } from "../types/onboarding";

const OnboardingForm2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formDataStep1 = (location.state as { formDataStep1?: OnboardingData["companyInfo"] })?.formDataStep1;

  useEffect(() => {
    if (!formDataStep1) navigate("/signup/step1", { replace: true });
  }, [formDataStep1, navigate]);

  const [selectedAccounts, setSelectedAccounts] = useState<number | null>(null);
  const [moreThanFive, setMoreThanFive] = useState("");
  const [aliases, setAliases] = useState<{ [key: string]: string }>({});
  const [bulkAliases, setBulkAliases] = useState("");
  const [extraAliases, setExtraAliases] = useState("");

  // Determine number of accounts
  const getAliasCount = () => {
    if (selectedAccounts) return selectedAccounts;
    if (moreThanFive && Number(moreThanFive) > 0) return Number(moreThanFive);
    return 0;
  };

  const aliasCount = getAliasCount();
  const isHybridMode = aliasCount > 6;
  const aliasKeys = Array.from({ length: Math.min(aliasCount, 6) }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Handle changes
  const handleCheckboxChange = (num: number) => {
    setSelectedAccounts(num);
    setMoreThanFive("");
    setAliases({});
    setBulkAliases("");
  };

  const handleMoreThanFiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMoreThanFive(e.target.value);
    setSelectedAccounts(null);
    setAliases({});
    setBulkAliases("");
  };

  const handleAliasChange = (key: string, value: string) => {
    setAliases((prev) => ({ ...prev, [key]: value }));
  };

  // Validation
  const filledAliasesCount = aliasKeys.filter(
    (key) => aliases[key]?.trim() !== ""
  ).length;

  const allSixFilled = aliasKeys.length === 6 && filledAliasesCount === 6;
  const isNextDisabled = (() => {
    if (aliasCount === 0) return true;
    if (isHybridMode) return !allSixFilled || bulkAliases.trim() === "";
    return filledAliasesCount < aliasKeys.length;
  })();

  const handleNext = () => {
    if (isNextDisabled) return;
    const awsSetupData = {
      numberOfAccounts: aliasCount,
      aliases,
      bulkAliases: isHybridMode ? bulkAliases.trim() : undefined,
      extraAliases,
    };
    navigate("/signup/step3", { state: { formDataStep1, awsSetupData } });
  };

  if (!formDataStep1) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left Section */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 p-6 md:p-12"
      >
        <img src={logo} alt="CloudSentrics Logo" className="h-12 mb-8" />

        <h2 className="text-2xl font-bold mb-6">AWS Account Setup</h2>

        {/* Number of Accounts */}
        <div className="mb-6">
          <label className="font-semibold mb-2 block text-gray-700">
            Number of AWS Accounts Needed
          </label>

          <div className="flex gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <label
                key={num}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts === num}
                  onChange={() => handleCheckboxChange(num)}
                  className="w-4 h-4"
                />
                <span>{num}</span>
              </label>
            ))}
          </div>

          <input
            type="number"
            placeholder="Enter number if more than 5"
            value={moreThanFive}
            onChange={handleMoreThanFiveChange}
            className="border rounded-md px-3 py-2 w-60"
          />
          <p className="text-xs text-gray-500 mt-1">
            If you enter a number greater than 6, you'll get 6 inputs + textarea
          </p>
        </div>

        {/* Alias Inputs */}
        {aliasCount > 0 && (
          <div className="mb-6">
            <label className="font-semibold mb-2 block text-gray-700">
              Preferred AWS Alias for each account
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Provide the organization name to appear after
              <code> cloudsentrics-aws-</code>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aliasKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center border rounded-md overflow-hidden"
                >
                  <span className="px-2 bg-gray-100 font-semibold text-sm">
                    {key}
                  </span>
                  <span className="px-2 text-gray-600 text-sm">
                    cloudsentrics-aws-
                  </span>
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

        {/* Hybrid Mode - Textarea after filling 6 inputs */}
        {isHybridMode && (
          <div className="mb-6">
            <label className="font-semibold mb-2 block text-gray-700">
              Enter additional aliases (7 and above)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Only active once all 6 alias inputs above are filled.
            </p>
            <textarea
              value={bulkAliases}
              onChange={(e) => setBulkAliases(e.target.value)}
              disabled={!allSixFilled}
              rows={5}
              placeholder={
                allSixFilled
                  ? "cloudsentrics-aws-marketing\ncloudsentrics-aws-hr..."
                  : "Fill all six alias inputs above to enable this field"
              }
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 ${
                allSixFilled
                  ? "focus:ring-blue-700 outline-none"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            />
          </div>
        )}

        {/* Optional Extra Field */}
        <div className="mb-6">
          <label className="font-semibold mb-2 block text-gray-700">
            Optional: Add Notes or Comments
          </label>
          <textarea
            value={extraAliases}
            onChange={(e) => setExtraAliases(e.target.value)}
            rows={3}
            placeholder="Any extra notes about your AWS setup..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-700 outline-none"
          />
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-6 py-2 rounded-md font-semibold ${
              isNextDisabled
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </motion.div>

      {/* Right Side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 bg-gradient-to-br from-blue-800 to-blue-900 text-white flex items-center justify-center p-8"
      >
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Customer Onboarding Form</h2>
          <p className="text-sm">
            This form captures your confirmed AWS setup details. Please fill all
            alias names correctly — especially if you have multiple accounts.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingForm2;
