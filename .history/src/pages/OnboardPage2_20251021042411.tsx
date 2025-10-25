import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import type { OnboardingData } from "../types/onboarding";

interface OnboardingForm2Props {}

const OnboardingForm2: React.FC<OnboardingForm2Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get formDataStep1 from Step 1
  const formDataStep1 = (location.state as { formDataStep1?: OnboardingData["companyInfo"] })?.formDataStep1;

  // Redirect back if Step 1 data is missing
  useEffect(() => {
    if (!formDataStep1) {
      navigate("/signup/step1", { replace: true });
    }
  }, [formDataStep1, navigate]);

  // States
  const [selectedAccounts, setSelectedAccounts] = useState<number | null>(null); // checkbox 1-5
  const [moreThanFive, setMoreThanFive] = useState<string>(""); // free number input
  const [aliases, setAliases] = useState<{ [key: string]: string }>({}); // for discrete inputs A..F
  const [bulkAliases, setBulkAliases] = useState<string>(""); // for >6 mode
  const [extraAliases, setExtraAliases] = useState<string>(""); // optional textarea for extras

  // Helper: parse the number entered in the "more than 5" input
  const parseMoreThanFive = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  // Determine effective alias count:
  // - If selectedAccounts is set (1..5) -> use it
  // - else if moreThanFive is set -> use it (could be >6)
  // - else 0
  const effectiveCount = selectedAccounts ?? (moreThanFive ? parseMoreThanFive(moreThanFive) : 0);

  // Bulk mode if count > 6
  const isBulkMode = effectiveCount > 6;

  // When user changes number (selectedAccounts or moreThanFive), reset appropriate states
  useEffect(() => {
    if (isBulkMode) {
      // Bulk: clear per-letter aliases and keep bulkAliases (user should type into it)
      setAliases({});
      // keep bulkAliases as-is (so user doesn't lose typed content if they change from <=6 to >6 intentionally)
    } else {
      // Not bulk: generate aliases object keys up to effectiveCount (max 6)
      const count = Math.max(0, Math.min(6, effectiveCount)); // clamp to 6
      const newAliases: { [key: string]: string } = {};
      for (let i = 0; i < count; i++) {
        newAliases[String.fromCharCode(65 + i)] = aliases[String.fromCharCode(65 + i)] ?? "";
      }
      setAliases(newAliases);
      // clear bulkAliases since we are back to discrete mode
      setBulkAliases("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccounts, moreThanFive]); // run when either changes

  // Handlers
  const handleCheckboxChange = (num: number) => {
    // selecting a checkbox should clear the "moreThanFive" field and reset bulk
    setSelectedAccounts(num);
    setMoreThanFive("");
    setBulkAliases("");
    setExtraAliases("");
  };

  const handleMoreThanFiveChange = (value: string) => {
    // user typing a number for >5 case
    // clear selectedAccounts checkboxes
    setMoreThanFive(value);
    setSelectedAccounts(null);
    setExtraAliases("");
    // do not immediately clear bulkAliases here; effect will decide bulk vs discrete
  };

  const handleAliasChange = (key: string, value: string) => {
    setAliases((prev) => ({ ...prev, [key]: value }));
  };

  // Validation: Next button enabled only when:
  // - effectiveCount > 0 (some number chosen), AND
  // - if bulk mode -> bulkAliases has content (non-empty), OR
  // - if not bulk -> all generated alias inputs (aliasKeys) are non-empty
  const aliasKeys = !isBulkMode
    ? Array.from({ length: Math.max(0, Math.min(6, effectiveCount)) }, (_, i) => String.fromCharCode(65 + i))
    : []; // no alias keys in bulk mode

  const allDiscreteFilled = aliasKeys.length > 0 && aliasKeys.every((k) => (aliases[k] ?? "").trim() !== "");
  const bulkFilled = isBulkMode ? bulkAliases.trim().length > 0 : false;

  const isNextDisabled = effectiveCount === 0 || (isBulkMode ? !bulkFilled : !allDiscreteFilled);

  // On Next: prepare payload; if bulk mode, send parsed lines as bulkAliasesText (string) and number
  const handleNext = () => {
    if (!formDataStep1) return;
    if (isNextDisabled) return;

    const awsSetupData = {
      numberOfAccounts: effectiveCount,
      aliases: isBulkMode ? {} : aliases,
      bulkAliases: isBulkMode ? bulkAliases.trim() : undefined,
      extraAliases,
    };

    navigate("/signup/step3", { state: { formDataStep1, awsSetupData } });
  };

  if (!formDataStep1) return null; // avoid rendering if missing

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
        <img src={logo} alt="Cloud Sentrics" className="mb-4 h-12 sm:h-16 object-contain" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 w-full max-w-md mx-auto md:mx-0">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-blue-700 bg-blue-700 text-white text-sm sm:text-base font-semibold">
              ✓
            </div>
          </div>

          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>

          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 text-sm sm:text-base font-semibold">
              2
            </div>
          </div>

          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>

          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 text-sm sm:text-base font-semibold">
              3
            </div>
          </div>
        </div>

        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 text-center md:text-left">
          AWS ACCOUNT SET UP
        </h2>

        {/* Number of Accounts */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm sm:text-lg font-semibold mb-2 sm:mb-3">
            Number of AWS Accounts Needed
          </label>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-sm sm:text-base">
            {[1, 2, 3, 4, 5].map((num) => (
              <label key={num} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAccounts === num}
                  onChange={() => handleCheckboxChange(num)}
                  className="w-4 h-4 sm:w-6 sm:h-6 border-gray-400"
                />
                <span>{num}</span>
              </label>
            ))}
          </div>

          <div>
            <span className="block text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Enter number if more than 5</span>
            <input
              type="number"
              min={1}
              value={moreThanFive}
              onChange={(e) => handleMoreThanFiveChange(e.target.value)}
              placeholder="Enter number here (e.g. 6, 7, 10)"
              className="w-full sm:w-72 border rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-700 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: If you enter a number greater than 6, use the textarea that appears to paste aliases (one per line).
            </p>
          </div>
        </div>

        {/* Preferred Aliases (discrete inputs) */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm sm:text-lg font-semibold mb-2">Preferred AWS Alias for each account</label>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Note: Provide the Organization Name / Department to appear after <code>cloudsentrics-aws-</code>
          </p>

          {!isBulkMode && effectiveCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {aliasKeys.map((key) => (
                <div key={key} className="flex items-center border rounded-md overflow-hidden">
                  <span className="px-2 bg-gray-100 font-semibold text-xs sm:text-base">{key}</span>
                  <span className="px-2 text-gray-600 text-xs sm:text-base">cloudsentrics-aws-</span>
                  <input
                    type="text"
                    value={aliases[key] || ""}
                    onChange={(e) => handleAliasChange(key, e.target.value)}
                    placeholder="Organization/Dept"
                    className="flex-1 px-2 py-2 text-xs sm:text-base outline-none"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* Bulk Mode textarea for >6 */}
          {isBulkMode && (
            <div>
              <p className="text-gray-600 text-sm mb-2">
                You entered more than 6 accounts ({effectiveCount}). Please paste or type each alias on its own line in the textarea below.
              </p>
              <textarea
                value={bulkAliases}
                onChange={(e) => setBulkAliases(e.target.value)}
                placeholder={`cloudsentrics-aws-sales\ncloudsentrics-aws-hr\ncloudsentrics-aws-marketing\n... (one per line)`}
                rows={6}
                className="w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-700 outline-none"
              />
              <div className="text-xs text-gray-500 mt-1">{bulkAliases.trim().split("\n").filter(Boolean).length} aliases entered</div>
            </div>
          )}

          {/* Message when no count chosen */}
          {effectiveCount === 0 && (
            <p className="text-gray-500 italic text-sm">Select or enter number of accounts to show input fields.</p>
          )}
        </div>

        {/* Extra Aliases */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm sm:text-lg font-semibold mb-2">Enter more AWS Aliases if more than selected number</label>
          <textarea
            value={extraAliases}
            onChange={(e) => setExtraAliases(e.target.value)}
            placeholder="Starting with cloudsentrics-aws- (optional)"
            rows={3}
            maxLength={500}
            className="w-full border rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-700 outline-none"
          />
          <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">{extraAliases.length}/500</div>
        </div>

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
            className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg border border-gray-400 text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-100 w-full sm:w-auto"
          >
            Back
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: isNextDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isNextDisabled ? 1 : 0.95 }}
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-5 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold shadow w-full sm:w-auto transition ${
              isNextDisabled ? "bg-gray-400 cursor-not-allowed text-gray-200" : "bg-blue-800 text-white hover:bg-blue-900"
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
          <h2 className="text-base sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-6">Customer Onboarding Form</h2>
          <p className="text-xs sm:text-base md:text-xl leading-relaxed mb-2 sm:mb-6">
            This form captures the confirmed details of your Cloud Sentrics service so we can provision your AWS environment accurately.
          </p>
          <p className="mt-2 sm:mt-4 italic text-xs sm:text-lg md:text-xl">Please review each section carefully and ensure all details match your intended set up.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingForm2;
