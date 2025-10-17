import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { StepProps } from "./types";

const Issue1 = ({ goNext, formData, setFormData }: StepProps) => {
  const [accountValid, setAccountValid] = useState<boolean | null>(null); // null = not checked
  const [checking, setChecking] = useState(false);

  const inputClass =
    "form-control w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  // Enable Next button only if all fields are filled AND account is valid
  const isValid =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.company &&
    formData.accountId &&
    formData.bucketName &&
    accountValid;

  // Validate Account ID when it changes
  useEffect(() => {
    if (!formData.accountId) {
      setAccountValid(null);
      return;
    }

    const validateAccount = async () => {
      setChecking(true);
      try {
        const res = await fetch(
          `https://api.onboardingportal.cloudsentrics.org/api/auth/validate-account/${formData.accountId}`
        );
        if (!res.ok) throw new Error("Account not found");
        const data = await res.json();
        setAccountValid(data.valid); // expects backend: { valid: true/false }
      } catch (err) {
        console.error("Account validation error:", err);
        setAccountValid(false);
      } finally {
        setChecking(false);
      }
    };

    const timer = setTimeout(validateAccount, 500); // debounce typing
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
        {/* Instruction */}
        <p className="mb-8 sm:mb-10 text-gray-700 text-base sm:text-lg lg:text-xl leading-relaxed">
          If you are experiencing a problem with your CloudSentric account or
          storage, please fill out this form so our support team can assist you
          quickly. Provide as much detail as possible to help us resolve your
          issue faster.
        </p>

        {/* CUSTOMER INFORMATION Section */}
        <div className="mb-10 sm:mb-12">
          <h3 className="bg-orange-100 py-2 sm:py-3 px-3 sm:px-5 text-blue-900 font-semibold text-lg sm:text-xl rounded-md mb-6 uppercase tracking-wide">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className={inputClass}
                value={formData.fullName || ""}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className={inputClass}
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                className={inputClass}
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Company / Organization</label>
              <input
                type="text"
                placeholder="Enter company name"
                className={inputClass}
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SERVICE DETAILS Section */}
        <div className="mb-10 sm:mb-12">
          <h3 className="bg-orange-100 py-2 sm:py-3 px-3 sm:px-5 text-blue-900 font-semibold text-lg sm:text-xl rounded-md mb-6 uppercase tracking-wide">
            Service Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full">
            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Account ID</label>
              <input
                type="text"
                placeholder="Enter your account ID"
                className={inputClass}
                value={formData.accountId || ""}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              />
              {checking && <p className="text-sm text-gray-500 mt-1">Checking account...</p>}
              {accountValid === false && !checking && (
                <p className="text-sm text-red-500 mt-1">Invalid Account ID</p>
              )}
              {accountValid && !checking && (
                <p className="text-sm text-green-600 mt-1">Account ID is valid</p>
              )}
            </div>

            <div>
              <label className="block text-sm sm:text-base lg:text-lg font-medium mb-2">Storage / Bucket Name</label>
              <input
                type="text"
                placeholder="Enter storage/bucket name"
                className={inputClass}
                value={formData.bucketName || ""}
                onChange={(e) => setFormData({ ...formData, bucketName: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full">
          <button
            onClick={goNext}
            disabled={!isValid}
            className={`w-full py-4 sm:py-5 rounded-lg text-lg sm:text-xl font-semibold shadow-lg transition ${isValid
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
