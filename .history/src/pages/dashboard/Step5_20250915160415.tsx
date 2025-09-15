// Step5.tsx
import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
}

const Step5 = ({ goNext, goBack }: StepProps) => {
  const [existingStorageName, setExistingStorageName] = useState("");
  const [details, setDetails] = useState("");
  const [changesRequested, setChangesRequested] = useState<string[]>([]);

  const maxLength = 1500;

  const changeOptions = [
    "Enable/Disable Access Login",
    "Enable/Disable life cycle Management",
    "Update retention/Transition Settings",
    "Add/Remove User or Change Access Level",
  ];

  const handleCheckboxChange = (option: string) => {
    setChangesRequested((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-none shadow-lg w-full min-h-screen"
    >
      {/* REQUEST TYPE */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-blue-900 mb-4">
          REQUEST TYPE
        </h3>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-xl">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6 cursor-not-allowed opacity-60"
              disabled
            />
            <span>Additional AWS Account(s)</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              defaultChecked
            />
            <span>Storage(s)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-not-allowed opacity-60">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              disabled
              defaultChecked
            />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>
        </div>
      </div>

      {/* Note */}
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Note: All Cloud Sentrics Storage comes by default with versioning and
        SSE-S3 encryption enabled. Additional settings may incur extra charges
        and will be reflected on your invoice.
      </p>

      {/* Change to Existing Settings */}
      <div className="mb-8">
        <div className="bg-blue-100 px-4 py-2 text-lg font-semibold text-blue-900 rounded-md">
          CHANGE TO EXISTING SETTINGS
        </div>
        <div className="px-4 py-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Existing Storage Name
          </label>
          <input
            type="text"
            value={existingStorageName}
            onChange={(e) => setExistingStorageName(e.target.value)}
            placeholder="Existing Account ID or Existing Storage Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Changes Requested */}
      <div className="mb-8">
        <div className="bg-blue-100 px-4 py-2 text-lg font-semibold text-blue-900 rounded-md">
          CHANGES REQUESTED (Multi-Select)
        </div>
        <div className="px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
          {changeOptions.map((option) => (
            <label key={option} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="form-checkbox w-5 h-5"
                checked={changesRequested.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* DETAILS */}
      <div className="mb-10">
        <div className="bg-blue-100 px-4 py-2 text-lg font-semibold text-blue-900 rounded-md">
          DETAILS
        </div>
        <div className="px-4 py-6">
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter your details here"
            maxLength={maxLength}
            className="w-full p-4 border border-gray-300 rounded-md text-lg resize-none focus:ring-2 focus:ring-blue-400"
            rows={6}
          />
          <div className="text-right text-sm text-gray-500 mt-2">
            {details.length}/{maxLength}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="px-8 py-3 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 bg-[#032352] text-white text-lg rounded-md hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default Step5;
