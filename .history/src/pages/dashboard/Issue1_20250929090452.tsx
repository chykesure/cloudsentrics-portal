import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { StepProps } from "./types";

const Issue1 = ({ goNext, formData, setFormData }: StepProps) => {
  const [accountValid, setAccountValid] = useState<boolean | null>(null); // null = not checked
  const [checking, setChecking] = useState(false);

  const inputClass =
    "form-control w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  // Check if all required fields are filled AND account is valid
  const isValid =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.company &&
    formData.accountId &&
    formData.bucketName &&
    accountValid;

  // Validate account ID when it changes
  useEffect(() => {
    if (!formData.accountId) {
      setAccountValid(null);
      return;
    }

    const validateAccount = async () => {
      setChecking(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/validate-account/${formData.accountId}`
        );
        const data = await res.json();
        setAccountValid(data.valid); // backend returns { valid: true/false }
      } catch (err) {
        console.error("Account validation error:", err);
        setAccountValid(false);
      } finally {
        setChecking(false);
      }
    };

    const timer = setTimeout(validateAccount, 500); // debounce
    return () => clearTimeout(timer);
  }, [formData.accountId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="flex-1 w-full p-4 sm:p-6 md:p-8 lg:p-10 bg-white shadow-md">
        {/* ... Customer Information and Service Details ... */}

        {/* Account ID */}
        <div className="mb-4">
          <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">
            Account ID
          </label>
          <input
            type="text"
            placeholder="Enter your account ID"
            className={inputClass}
            value={formData.accountId || ""}
            onChange={(e) =>
              setFormData({ ...formData, accountId: e.target.value })
            }
          />
          {checking && <p className="text-sm text-gray-500 mt-1">Checking account...</p>}
          {accountValid === false && !checking && (
            <p className="text-sm text-red-500 mt-1">Invalid Account ID</p>
          )}
          {accountValid && !checking && (
            <p className="text-sm text-green-600 mt-1">Account ID is valid</p>
          )}
        </div>

        {/* Next Button */}
        <div className="w-full">
          <button
            onClick={goNext}
            disabled={!isValid}
            className={`w-full py-4 sm:py-5 rounded-lg text-lg sm:text-xl font-semibold shadow-lg transition ${
              isValid
                ? "bg-[#032352] hover:bg-[#021a3d] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Issue1;
