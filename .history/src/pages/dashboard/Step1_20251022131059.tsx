// Step1.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";


const Step1 = ({ goBack, jumpToStep, setFormData }: StepProps) => {
  const [bucketNote, setBucketNote] = useState("");
  const [selectedStorageCount, setSelectedStorageCount] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<"aws" | "storage" | "change" | null>(null);

  const [existingStorageName, setExistingStorageName] = useState("");
  const [existingAccountId, setExistingAccountId] = useState("");
  const [details, setDetails] = useState("");
  const [changesRequested, setChangesRequested] = useState<string[]>([]);
  const [awsAliases, setAwsAliases] = useState<{ [key: string]: string }>({});  // ✅ new
  const [storageNames, setStorageNames] = useState<{ [key: string]: string }>({});

  const maxLength = 1500;

  // ✅ Validate AWS form completeness
  const isAwsFormValid = () => {
    if (!selectedOption || selectedOption !== "aws" || !selectedStorageCount) return false;

    // Case 1: 6 or fewer → all alias inputs must be filled
    if (selectedStorageCount <= 6) {
      for (let i = 0; i < selectedStorageCount; i++) {
        const label = String.fromCharCode(65 + i);
        if (!awsAliases[label]?.trim()) return false;
      }
      return true;
    }

    // Case 2: More than 6 → first 6 must be filled AND textarea not empty
    const allSixFilled = ["A", "B", "C", "D", "E", "F"].every(
      (label) => awsAliases[label]?.trim()
    );
    return allSixFilled && bucketNote.trim();
  };

  // ✅ Validate Storage form completeness
  const isStorageFormValid = () => {
    if (!selectedOption || selectedOption !== "storage" || !selectedStorageCount) return false;

    // Case 1: 6 or fewer → all visible fields must be filled
    if (selectedStorageCount <= 6) {
      for (let i = 0; i < selectedStorageCount; i++) {
        const label = String.fromCharCode(65 + i);
        if (!storageNames[label]?.trim()) return false;
      }
      return true;
    }

    // Case 2: More than 6 → first 6 must be filled AND textarea not empty
    const allSixFilled = ["A", "B", "C", "D", "E", "F"].every(
      (label) => storageNames[label]?.trim()
    );
    return allSixFilled && bucketNote.trim();
  };


  const changeOptions = [
    "Enable/Disable Access Login",
    "Enable/Disable life cycle Management",
    "Update retention/Transition Settings",
    "Add/Remove User or Change Access Level",
    "Decommission an AWS Account(s)",
    "Decommission a Storage(s)",
  ];

  /* const handleCheckboxChange = (option: string) => {
    setChangesRequested((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  }; */

  const handleOptionChange = (option: "aws" | "storage" | "change") => {
    setSelectedOption(option);

    // reset everything whenever user switches
    setBucketNote("");
    setSelectedStorageCount(null);
    setExistingStorageName("");
    setDetails("");
    setChangesRequested([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white min-h-screen w-full px-2 sm:px-4 md:px-6 lg:px-12"
    >
      {/* Request Type */}
      <div className="mb-8">
        <h3 className="text-xl sm:text-3xl font-semibold text-blue-900 mb-4 text-center sm:text-left">
          REQUEST TYPE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base sm:text-xl">
          {/* AWS */}
          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-3 rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0"
              checked={selectedOption === "aws"}
              onChange={() => handleOptionChange("aws")}
            />
            <span className="text-gray-800 flex-1 leading-snug">
              Additional AWS Account(s)
            </span>
          </label>

          {/* Storage */}
          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-3 rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0"
              checked={selectedOption === "storage"}
              onChange={() => handleOptionChange("storage")}
            />
            <span className="text-gray-800 flex-1 leading-snug">
              Storage(s)
            </span>
          </label>

          {/* Change */}
          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-3 rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0"
              checked={selectedOption === "change"}
              onChange={() => handleOptionChange("change")}
            />
            <span className="text-gray-800 flex-1 leading-snug">
              Change to Existing Account or Storage(s) settings
            </span>
          </label>
        </div>
      </div>

      {/* ================== CONDITIONAL SECTION ================== */}

      {/* AWS Option */}
      {selectedOption === "aws" && (
        <div className="w-full px-2 sm:px-6 mb-12">
          {/* Storage Count */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-4 text-base sm:text-xl">
            <label className="font-medium">Number of AWS Account Needed</label>

            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex items-center relative cursor-pointer">
                  <input
                    type="radio"
                    name="storageCount"
                    value={n}
                    checked={selectedStorageCount === n}
                    onChange={() => {
                      setSelectedStorageCount(n);
                      setFormData((prev) => ({ ...prev, selectedStorageCount: n }));
                    }}
                    className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                  />
                  <span
                    className={`pointer-events-none absolute left-1 top-0.5 w-5 h-5 flex items-center justify-center text-white ${selectedStorageCount === n ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-200`}
                  >
                    ✓
                  </span>
                  <span className="ml-7">{n}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col w-full sm:w-64">
              <label className="text-sm text-gray-600 mb-1">
                Enter number if more than 5
              </label>
              <input
                type="number"
                placeholder="Enter number here"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-base sm:text-lg"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const count = isNaN(val) ? null : val;
                  setSelectedStorageCount(count);
                  setFormData((prev) => ({ ...prev, selectedStorageCount: count }));
                }}
                value={selectedStorageCount ?? ""}
              />
            </div>
          </div>

          {/* AWS Alias Section */}
          <b className="block text-base sm:text-lg">Preferred AWS Alias for each account</b>
          <p className="text-sm sm:text-base mb-4">
            Note: Provide the Organization Name / Department using the account
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {["A", "B", "C", "D", "E", "F"].map((label) => (
              <div key={label}>
                <label className="text-base sm:text-xl font-medium text-gray-700 mb-2 block">{label}</label>
                <div className="flex flex-col sm:flex-row">
                  <span className="inline-flex items-center px-4 py-2 sm:py-0 rounded-t-md sm:rounded-l-md sm:rounded-t-none border border-b-0 sm:border-b border-gray-300 bg-gray-100 text-gray-600 text-sm sm:text-lg">
                    cloudsentrics-aws-
                  </span>
                  <input
                    type="text"
                    placeholder="Organization Name/Department"
                    value={awsAliases[label] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAwsAliases((prev) => {
                        const updated = { ...prev, [label]: val };
                        setFormData((prevData) => ({ ...prevData, awsAliases: updated }));
                        return updated;
                      });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-b-md sm:rounded-r-md text-sm sm:text-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra alias textarea if > 6 */}
          {selectedStorageCount && selectedStorageCount > 6 && (
            <div className="mb-10">
              <label className="block text-base sm:text-xl font-medium text-gray-700 mb-3">
                Enter more AWS Alias if more than 6
              </label>
              <textarea
                rows={6}
                value={bucketNote}
                onChange={(e) => {
                  const val = e.target.value;
                  setBucketNote(val);
                  setFormData((prev) => ({ ...prev, bucketNote: val }));
                }}
                placeholder="Starting with cloudsentrics-aws-"
                className="w-full p-4 border border-gray-300 rounded-md text-sm sm:text-lg resize-none"
                maxLength={maxLength}
              ></textarea>
              <div className="text-right text-sm sm:text-md text-gray-500 mt-1">
                {bucketNote.length}/{maxLength}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
            <button
              onClick={goBack}
              className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => jumpToStep?.(6)}
              disabled={
                !selectedOption ||
                selectedOption !== "aws" ||
                !selectedStorageCount ||
                // Validation logic:
                (
                  // Case 1: 6 or fewer accounts → all visible inputs (A–F up to count) must be filled
                  (selectedStorageCount <= 6 &&
                    Array.from({ length: selectedStorageCount }).some(
                      (_, i) => !awsAliases[String.fromCharCode(65 + i)]?.trim()
                    )) ||
                  // Case 2: More than 6 → first 6 must be filled AND textarea not empty
                  (selectedStorageCount > 6 &&
                    (["A", "B", "C", "D", "E", "F"].some(
                      (label) => !awsAliases[label]?.trim()
                    ) ||
                      !bucketNote.trim()))
                )
              }
              className={`w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-md ${!selectedOption ||
                selectedOption !== "aws" ||
                !selectedStorageCount ||
                (
                  (selectedStorageCount <= 6 &&
                    Array.from({ length: selectedStorageCount }).some(
                      (_, i) => !awsAliases[String.fromCharCode(65 + i)]?.trim()
                    )) ||
                  (selectedStorageCount > 6 &&
                    (["A", "B", "C", "D", "E", "F"].some(
                      (label) => !awsAliases[label]?.trim()
                    ) ||
                      !bucketNote.trim()))
                )
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#032352] text-white hover:bg-blue-700"
                }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}


      {/* STORAGE OPTION */}
      {selectedOption === "storage" && (
        <div className="mb-12">
          <p className="text-base sm:text-xl text-gray-700 mb-6 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning and
            SSE-S3 encryption enabled.
          </p>

          {/* Storage Count */}
          <div className="flex flex-wrap items-center mb-8 gap-4 text-base sm:text-xl">
            <label className="font-medium">
              Number of Storage(s) (Bucket(s)) required:
            </label>

            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex items-center space-x-2 relative cursor-pointer"
              >
                <input
                  type="radio"
                  name="storageCount"
                  value={n}
                  checked={selectedStorageCount === n}
                  onChange={() => {
                    setSelectedStorageCount(n);
                    setFormData((prev) => ({ ...prev, selectedStorageCount: n }));
                  }}
                  className="appearance-none w-5 h-5 sm:w-6 sm:h-6 border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                />
                <span
                  className={`pointer-events-none absolute left-1 top-0.5 w-5 h-5 flex items-center justify-center text-white ${selectedStorageCount === n ? "opacity-100" : "opacity-0"
                    } transition-opacity duration-200`}
                >
                  ✓
                </span>
                <span className="ml-7">{n}</span>
              </label>
            ))}

            <input
              type="number"
              placeholder="More than 5"
              className="ml-0 sm:ml-4 px-4 py-2 border border-gray-300 rounded-md text-base sm:text-lg w-full sm:w-64"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedStorageCount(isNaN(val) ? null : val);
                setFormData((prev) => ({
                  ...prev,
                  selectedStorageCount: isNaN(val) ? null : val,
                }));
              }}
              value={selectedStorageCount ?? ""}
            />
          </div>

          {/* Bucket Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {["A", "B", "C", "D", "E", "F"].map((label) => (
              <div key={label}>
                <label className="text-base sm:text-xl font-medium text-gray-700 mb-2 block">
                  {label}
                </label>
                <div className="flex flex-col sm:flex-row">
                  <span className="inline-flex items-center px-4 rounded-t-md sm:rounded-l-md sm:rounded-t-none border border-b-0 sm:border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm sm:text-lg">
                    cloudsentrics-storage-
                  </span>
                  <input
                    type="text"
                    placeholder="Organization-Storage-Purpose-CustomerID"
                    value={storageNames[label] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStorageNames((prev) => {
                        const updated = { ...prev, [label]: val };
                        setFormData((prevData) => ({
                          ...prevData,
                          storageNames: updated,
                        }));
                        return updated;
                      });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-b-md sm:rounded-r-md text-sm sm:text-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Storage Textarea */}
          <div className="mb-10">
            <label className="block text-base sm:text-xl font-medium text-gray-700 mb-3">
              Enter more Storage names if more than 6
            </label>
            <textarea
              rows={6}
              value={bucketNote}
              onChange={(e) => {
                const val = e.target.value;
                setBucketNote(val);
                setFormData((prev) => ({ ...prev, bucketNote: val }));
              }}
              placeholder="cloudsentrics-[organization name-storage purpose-customer ID]."
              className="w-full p-4 border border-gray-300 rounded-md text-sm sm:text-lg resize-none"
              maxLength={maxLength}
            ></textarea>
            <div className="text-right text-sm sm:text-md text-gray-500 mt-1">
              {bucketNote.length}/{maxLength}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
            <button
              onClick={goBack}
              className="w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (selectedOption === "storage") jumpToStep?.(2);
              }}
              disabled={!isAwsFormValid()}
              className={`w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg rounded-md ${
  !isStorageFormValid()
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-[#032352] text-white hover:bg-blue-700"
}`}

            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* CHANGE OPTION */}
      {selectedOption === "change" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-4 sm:p-10 rounded-none shadow-lg w-full min-h-screen"
        >
          {/* Note */}
          <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning and
            SSE-S3 encryption enabled.
          </p>

          <div className="mb-8">
            <div className="bg-blue-100 px-4 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md">
              CHANGE TO EXISTING SETTINGS
            </div>

            {/* Responsive Grid */}
            <div className="px-2 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing Account ID */}
              <div>
                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Existing Account ID
                </label>
                <input
                  type="text"
                  value={existingAccountId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExistingAccountId(val);
                    setFormData((prev) => ({ ...prev, existingAccountId: val }));
                  }}
                  placeholder="Existing Account ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base sm:text-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Existing Storage Name */}
              <div>
                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
                  Existing Storage Name
                </label>
                <input
                  type="text"
                  value={existingStorageName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExistingStorageName(val);
                    setFormData((prev) => ({ ...prev, existingStorageName: val }));
                  }}
                  placeholder="Existing Storage Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base sm:text-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Changes Requested */}
          <div className="mb-8">
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-4">
              Changes Requested
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {changeOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    checked={changesRequested.includes(option)}
                    onChange={() => {
                      const updated = changesRequested.includes(option)
                        ? changesRequested.filter((o) => o !== option)
                        : [...changesRequested, option];
                      setChangesRequested(updated);
                      setFormData((prev) => ({ ...prev, changesRequested: updated }));
                    }}
                  />
                  <span className="text-base sm:text-lg">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-10">
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-3">
              Additional Details
            </label>
            <textarea
              rows={6}
              value={details}
              onChange={(e) => {
                const val = e.target.value;
                setDetails(val);
                setFormData((prev) => ({ ...prev, details: val }));
              }}
              placeholder="Provide further context for the changes requested..."
              className="w-full p-4 border border-gray-300 rounded-md text-sm sm:text-lg resize-none focus:ring-2 focus:ring-blue-400"
              maxLength={maxLength}
            ></textarea>
            <div className="text-right text-sm sm:text-md text-gray-500 mt-1">
              {details.length}/{maxLength}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
            <button
              onClick={goBack}
              className="w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => jumpToStep?.(6)}
              disabled={
                !selectedOption ||
                selectedOption !== "change" ||
                !existingAccountId.trim() ||
                !existingStorageName.trim() ||
                changesRequested.length === 0
              }
              className={`w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg rounded-md ${!selectedOption ||
                selectedOption !== "change" ||
                !existingAccountId.trim() ||
                !existingStorageName.trim() ||
                changesRequested.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#032352] text-white hover:bg-blue-700"
                }`}
            >
              Next →
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step1;
