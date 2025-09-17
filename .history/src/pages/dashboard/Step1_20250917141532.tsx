// Step1.tsx
import { useState } from "react";
import { motion } from "framer-motion";


interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}

const Step1 = ({ goBack, jumpToStep }: StepProps) => {
  const [bucketNote, setBucketNote] = useState("");
  const [selectedStorageCount, setSelectedStorageCount] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<"aws" | "storage" | "change" | null>(null);


  const [existingStorageName, setExistingStorageName] = useState("");
  const [details, setDetails] = useState("");
  const [changesRequested, setChangesRequested] = useState<string[]>([]);

  const [additionalAccount, setAdditionalAccount] = useState<"yes" | "no" | null>(null);
  const [existingAccountId, setExistingAccountId] = useState("");
  const [newAccountAlias, setNewAccountAlias] = useState("");


  const maxLength = 1500;

  const changeOptions = [
    "Enable/Disable Access Login",
    "Enable/Disable life cycle Management",
    "Update retention/Transition Settings",
    "Add/Remove User or Change Access Level",
    "Decommission an AWS Account(s)",
    "Decommission a Storage(s)",
  ];

  const handleCheckboxChange = (option: string) => {
    setChangesRequested((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleOptionChange = (option: "aws" | "storage" | "change") => {
    setSelectedOption(option);

    // reset everything whenever user switches
    setBucketNote("");
    setSelectedStorageCount(null);
    setExistingStorageName("");
    setDetails("");
    setChangesRequested([]);

    // ✅ also reset additional AWS account state
    setAdditionalAccount(null);
    setExistingAccountId("");
    setNewAccountAlias("");
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
        <h3 className="text-3xl font-semibold text-blue-900 mb-4">REQUEST TYPE</h3>
        <div className="flex flex-wrap gap-6 text-xl">
          {/* AWS */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "aws"}
              onChange={() => handleOptionChange("aws")}
            />
            <span>Additional AWS Account(s)</span>
          </label>

          {/* Storage */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "storage"}
              onChange={() => handleOptionChange("storage")}
            />
            <span>Storage(s)</span>
          </label>

          {/* Change */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "change"}
              onChange={() => handleOptionChange("change")}
            />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>

        </div>
      </div>

      {/* ================== CONDITIONAL SECTION ================== */}

      {/* AWS Option */}
      {selectedOption === "aws" && (
        <div className="mb-12">
          {/* ✅ Additional AWS Account */}
          <div className="mb-10">
            <h3 className="bg-gray-100 px-4 py-2 font-semibold text-lg text-gray-800 rounded-md">
              ADDITIONAL AWS ACCOUNT
            </h3>
            <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
              Is the account existing in your organization? Select one
            </p>

            {/* Yes / No Section */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
              {/* YES option */}
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="additionalAccount"
                  value="yes"
                  checked={additionalAccount === "yes"}
                  onChange={() => setAdditionalAccount("yes")}
                  className="w-4 h-4 border-gray-400"
                />
                <span className="font-medium text-gray-700">Yes</span>
                {additionalAccount === "yes" && (
                  <input
                    type="text"
                    placeholder="Input Existing Account ID"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm md:text-base"
                    value={existingAccountId}
                    onChange={(e) => setExistingAccountId(e.target.value)}
                  />
                )}
              </label>

              {/* NO option */}
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  name="additionalAccount"
                  value="no"
                  checked={additionalAccount === "no"}
                  onChange={() => setAdditionalAccount("no")}
                  className="w-4 h-4 border-gray-400"
                />
                <span className="font-medium text-gray-700">No</span>
                {additionalAccount === "no" && (
                  <input
                    type="text"
                    placeholder="Input preferred Alias for new Account"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm md:text-base"
                    value={newAccountAlias}
                    onChange={(e) => setNewAccountAlias(e.target.value)}
                  />
                )}
              </label>
            </div>
          </div>

          {/* ✅ Storage Count */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 text-base md:text-xl">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="font-medium">Number of AWS Account Needed</label>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex items-center relative cursor-pointer">
                  <input
                    type="radio"
                    name="storageCount"
                    value={n}
                    checked={selectedStorageCount === n}
                    onChange={() => setSelectedStorageCount(n)}
                    className="appearance-none w-6 h-6 border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
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

            {/* Enter more than 5 */}
            <div className="flex flex-col w-full md:w-64">
              <label className="text-sm text-gray-600 mb-1">Enter number if more than 5</label>
              <input
                type="number"
                placeholder="Enter number here"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-base md:text-lg"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSelectedStorageCount(isNaN(val) ? null : val);
                }}
                value={selectedStorageCount ?? ""}
              />
            </div>
          </div>

          {/* ✅ Preferred AWS Alias */}
          <div className="mb-10">
            <b>Preferred AWS Alias for each account</b>
            <p className="text-gray-600 text-sm mb-4">
              Note: Provide the Organization Name / Department using the account
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["A", "B", "C", "D", "E", "F"].map((label) => (
                <div key={label}>
                  <label className="text-base md:text-xl font-medium text-gray-700 mb-2 block">
                    {label}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm md:text-lg">
                      cloudsentrics-aws-
                    </span>
                    <input
                      type="text"
                      placeholder="Organization Name/Department"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-md text-base md:text-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Additional Storage Textarea */}
          <div className="mb-10">
            <label className="block text-base md:text-xl font-medium text-gray-700 mb-3">
              Enter more AWS Alias if more than 6
            </label>
            <textarea
              rows={6}
              value={bucketNote}
              onChange={(e) => setBucketNote(e.target.value)}
              placeholder="Starting with cloudsentrics-aws-"
              className="w-full p-4 border border-gray-300 rounded-md text-base md:text-lg resize-none"
              maxLength={maxLength}
            ></textarea>
            <div className="text-right text-sm md:text-md text-gray-500 mt-1">
              {bucketNote.length}/{maxLength}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-10">
            <button
              onClick={goBack}
              className="w-full md:w-auto px-6 md:px-10 py-3 md:py-4 bg-white border border-gray-400 rounded-md text-base md:text-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (selectedOption === "aws") {
                  jumpToStep?.(6);
                }
              }}
              disabled={!selectedOption || selectedOption !== "aws"}
              className={`w-full md:w-auto px-6 md:px-10 py-3 md:py-4 text-base md:text-lg rounded-md ${!selectedOption || selectedOption !== "aws"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#032352] text-white hover:bg-blue-700"
                }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}


      {/* STORAGE OPTION (Step2 merged inline) */}
      {selectedOption === "storage" && (
        <div className="mb-12">
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning and
            SSE-S3 encryption enabled. Additional settings may incur extra charges
            and will be reflected on your invoice.
          </p>

          {/* Storage Count */}
          <div className="flex flex-wrap items-center mb-8 gap-4 text-xl">
            <label className="font-medium">Number of Storages (Buckets) required:</label>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="flex items-center space-x-2 relative cursor-pointer">
                <input
                  type="radio"
                  name="storageCount"
                  value={n}
                  checked={selectedStorageCount === n}
                  onChange={() => setSelectedStorageCount(n)}
                  className="appearance-none w-6 h-6 border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
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
              className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-lg w-64"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedStorageCount(isNaN(val) ? null : val);
              }}
              value={selectedStorageCount ?? ""} // ✅ just show whatever user typed
            />
          </div>

          {/* Bucket Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {["A", "B", "C", "D", "E", "F"].map((label) => (
              <div key={label}>
                <label className="text-xl font-medium text-gray-700 mb-2 block">{label}</label>
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
          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <button
              onClick={goBack}
              className="px-10 py-4 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (selectedOption === "storage") {
                  jumpToStep?.(2); // 👈 go straight to Step 5
                }
              }}
              disabled={!selectedOption || selectedOption !== "storage"}
              className={`px-10 py-4 text-lg rounded-md ${!selectedOption || selectedOption !== "storage"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#032352] text-white hover:bg-blue-700"
                }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* CHANGE OPTION (Step3 merged inline) */}
      {selectedOption === "change" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-10 rounded-none shadow-lg w-full min-h-screen"
        >
          {/* Note */}
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning and
            SSE-S3 encryption enabled. Additional settings may incur extra charges
            and will be reflected on your invoice.
          </p>

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
              onClick={() => {
                jumpToStep?.(6); // 👈 explicitly jump to Step2
              }}
              className="px-8 py-3 bg-[#032352] text-white text-lg rounded-md hover:bg-blue-700"
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
