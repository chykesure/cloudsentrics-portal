// Step1.tsx
import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void; // 👉 allows jumping directly to Step2 or Step3
}

const Step1 = ({ goNext, goBack, jumpToStep }: StepProps) => {
  const [bucketNote, setBucketNote] = useState("");
  const [selectedStorageCount, setSelectedStorageCount] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const maxLength = 1500;

  const handleSelect = (option: string) => {
    setSelectedOption(option);

    // 👉 if Storage selected, skip to Step2 immediately
    if (option === "storage" && jumpToStep) {
      jumpToStep(2);
    }

    // 👉 if Change selected, skip to Step3 immediately
    if (option === "change" && jumpToStep) {
      jumpToStep(3);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white min-h-screen w-full p-10"
    >
      {/* Request Type */}
      <div className="mb-8">
        <h3 className="text-3xl font-semibold text-blue-900 mb-4">
          REQUEST TYPE
        </h3>
        <div className="flex flex-wrap gap-6 text-xl">
          {/* Additional AWS Account(s) */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "aws"}
              onChange={() => handleSelect("aws")}
            />
            <span>Additional AWS Account(s)</span>
          </label>

          {/* Storage(s) */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "storage"}
              onChange={() => handleSelect("storage")}
            />
            <span>Storage(s)</span>
          </label>

          {/* Change to Existing */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "change"}
              onChange={() => handleSelect("change")}
            />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>
        </div>
      </div>

      {/* ================== CONDITIONAL SECTION ================== */}

      {/* 1. AWS Account(s) fields stay here */}
      {selectedOption === "aws" && (
        <div className="mb-12">
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning and
            SSE-S3 encryption enabled. Additional settings may incur extra charges
            and will be reflected on your invoice.
          </p>

          {/* Storage Count */}
          <div className="flex flex-wrap items-center mb-8 gap-4 text-xl">
            <label className="font-medium">
              Number of Storages (Buckets) required:
            </label>

            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="flex items-center space-x-2 relative cursor-pointer">
                <input
                  type="radio"
                  name="storageCount"
                  value={n}
                  checked={selectedStorageCount === n}
                  onChange={() => setSelectedStorageCount(n)}
                  className="appearance-none w-6 h-6 border border-gray-400 rounded-sm
                             checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                />
                <span
                  className={`pointer-events-none absolute left-1 top-0.5 w-5 h-5 flex items-center justify-center text-white
                  ${selectedStorageCount === n ? "opacity-100" : "opacity-0"}
                  transition-opacity duration-200`}
                >
                  ✓
                </span>
                <span className="ml-7">{n}</span>
              </label>
            ))}

            <input
              type="number"
              placeholder="More than 5"
              className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-lg w-64"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedStorageCount(isNaN(val) ? null : val);
              }}
              value={
                selectedStorageCount && selectedStorageCount > 5
                  ? selectedStorageCount
                  : ""
              }
            />
          </div>

          {/* Bucket Name Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {["A", "B", "C", "D", "E", "F"].map((label) => (
              <div key={label}>
                <label className="text-xl font-medium text-gray-700 mb-2 block">
                  {label}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-lg">
                    cloudsentrics-aws-
                  </span>
                  <input
                    type="text"
                    placeholder="Organization-Storage-Purpose-CustomerID"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-md text-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Storage Textarea */}
          <div className="mb-10">
            <label className="block text-xl font-medium text-gray-700 mb-3">
              Enter more Storage names if more than 6
            </label>
            <textarea
              rows={6}
              value={bucketNote}
              onChange={(e) => setBucketNote(e.target.value)}
              placeholder="cloudsentrics-[organization name-storage purpose-customer ID]."
              className="w-full p-4 border border-gray-300 rounded-md text-lg resize-none"
              maxLength={maxLength}
            ></textarea>
            <div className="text-right text-md text-gray-500 mt-1">
              {bucketNote.length}/{maxLength}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={goBack}
          className="px-10 py-4 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            if (selectedOption === "aws") {
              goNext(); // Normal next for AWS
            } else if (selectedOption === "storage" && jumpToStep) {
              jumpToStep(2); // Jump straight to Step2
            } else if (selectedOption === "change" && jumpToStep) {
              jumpToStep(3); // Jump straight to Step3
            }
          }}
          disabled={!selectedOption}
          className={`px-10 py-4 text-lg rounded-md ${
            selectedOption
              ? "bg-[#032352] text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default Step1;
