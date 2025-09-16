// Step1.tsx
import { useState } from "react";
import { motion } from "framer-motion";


interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}







const Step1 = ({ goNext, goBack }: StepProps) => {
  const [bucketNote, setBucketNote] = useState("");
  const [selectedStorageCount, setSelectedStorageCount] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<"aws" | "storage" | "change" | null>(null);


  // ✅ Missing states for change option
  const [fileSharing, setFileSharing] = useState<"Yes" | "No" | null>(null);
  const [fileOption, setFileOption] = useState<"Email" | "EmailOTP" | "WhatsApp" | null>(null);
  const [otpPlan, setOtpPlan] = useState<string | null>(null);
  const [customOtp, setCustomOtp] = useState("");
  const [accessLogging, setAccessLogging] = useState<"Yes" | "No" | null>(null);
  const [lifecycle, setLifecycle] = useState<"Yes" | "No" | null>(null);
  const [customerKey, setCustomerKey] = useState<"Yes" | "No" | null>(null);
  const [retentionDays, setRetentionDays] = useState("");
  const [retentionMonths, setRetentionMonths] = useState("");
  const [transitionGlacier, setTransitionGlacier] = useState(false);
  const [transitionStandard, setTransitionStandard] = useState(false);


  const maxLength = 1500;


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
          {/* AWS */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "aws"}
              onChange={() => setSelectedOption("aws")}
            />
            <span>Additional AWS Account(s)</span>
          </label>

          {/* Storage */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "storage"}
              onChange={() => setSelectedOption("storage")}
            />
            <span>Storage(s)</span>
          </label>

          {/* Change */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "change"}
              onChange={() => setSelectedOption("change")}
            />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>

        </div>
      </div>

      {/* ================== CONDITIONAL SECTION ================== */}

      {/* AWS Option */}
      {selectedOption === "aws" && (
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
              value={selectedStorageCount && selectedStorageCount > 5 ? selectedStorageCount : ""}
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
                if (selectedOption === "aws") {
                  jumpToStep(5); // 👈 go straight to Step 5
                }
              }}
              disabled={!selectedOption || selectedOption !== "aws"}
              className={`px-10 py-4 text-lg rounded-md ${!selectedOption || selectedOption !== "aws"
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
              value={selectedStorageCount && selectedStorageCount > 5 ? selectedStorageCount : ""}
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
                  goNext();
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

          {/* File Sharing Section */}
          <div className="p-6 bg-white shadow-md rounded-lg mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              File Sharing
            </h4>

            {/* Yes/No File Sharing */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="fileSharing"
                  value="Yes"
                  checked={fileSharing === "Yes"}
                  onChange={() => setFileSharing("Yes")}
                  className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                />
                <span className="text-[#032352]">Yes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="fileSharing"
                  value="No"
                  checked={fileSharing === "No"}
                  onChange={() => setFileSharing("No")}
                  className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                />
                <span className="text-[#032352]">No</span>
              </label>
            </div>

            {/* File Sharing Options */}
            {fileSharing === "Yes" && (
              <div className="ml-4 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="fileOption"
                    value="Email"
                    checked={fileOption === "Email"}
                    onChange={() => setFileOption("Email")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Option 1: Email Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="fileOption"
                    value="EmailOTP"
                    checked={fileOption === "EmailOTP"}
                    onChange={() => setFileOption("EmailOTP")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Option 2: Email + OTP</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="fileOption"
                    value="WhatsApp"
                    checked={fileOption === "WhatsApp"}
                    onChange={() => setFileOption("WhatsApp")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Option 3: WhatsApp Only</span>
                </label>

                {/* OTP Subscription Plans */}
                {(fileOption === "EmailOTP" || fileOption === "WhatsApp") && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h5 className="font-semibold mb-3">
                      How many OTPs do you want to subscribe for per month?
                    </h5>
                    <div className="flex flex-wrap gap-4">
                      {["500", "1000", "1500"].map((plan) => (
                        <label
                          key={plan}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            name="otpPlan"
                            value={plan}
                            checked={otpPlan === plan}
                            onChange={() => setOtpPlan(plan)}
                            className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                          />
                          <span className="text-[#032352]">{plan}</span>
                        </label>
                      ))}

                      {/* Custom OTP Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customOtp}
                          onChange={(e) => {
                            setCustomOtp(e.target.value);
                            setOtpPlan("custom");
                          }}
                          placeholder="Custom number"
                          className="px-3 py-2 border rounded-md text-lg w-40"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Two-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Enable Access Logging */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Enable Access Logging (Recommended)
              </h4>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accessLogging"
                    value="Yes"
                    checked={accessLogging === "Yes"}
                    onChange={() => setAccessLogging("Yes")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accessLogging"
                    value="No"
                    checked={accessLogging === "No"}
                    onChange={() => setAccessLogging("No")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">No</span>
                </label>
              </div>
            </div>

            {/* Enable Lifecycle Management */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Enable Lifecycle Management
              </h4>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="lifecycle"
                    value="Yes"
                    checked={lifecycle === "Yes"}
                    onChange={() => setLifecycle("Yes")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="lifecycle"
                    value="No"
                    checked={lifecycle === "No"}
                    onChange={() => setLifecycle("No")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Customer Managed Key */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Managed Key
              </h4>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="customerKey"
                    value="Yes"
                    checked={customerKey === "Yes"}
                    onChange={() => setCustomerKey("Yes")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="customerKey"
                    value="No"
                    checked={customerKey === "No"}
                    onChange={() => setCustomerKey("No")}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">No</span>
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-600 italic">
                Note: Additional Charges may apply for CMK storage and usage
              </p>
            </div>

            {/* Retention + Transition (only if Lifecycle = Yes) */}
            {lifecycle === "Yes" && (
              <div className="p-6 bg-white shadow-md rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Retention Duration:
                </h4>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                    placeholder="Input no of days"
                    className="w-1/2 px-3 py-2 border rounded-md text-lg"
                  />
                  <input
                    type="text"
                    value={retentionMonths}
                    onChange={(e) => setRetentionMonths(e.target.value)}
                    placeholder="Input no of months"
                    className="w-1/2 px-3 py-2 border rounded-md text-lg"
                  />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Transition Settings:
                </h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transitionGlacier}
                      onChange={() => setTransitionGlacier(!transitionGlacier)}
                      className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                    />
                    <span className="text-gray-700">
                      Move to Glacier after X days
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transitionStandard}
                      onChange={() => setTransitionStandard(!transitionStandard)}
                      className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                    />
                    <span className="text-gray-700">
                      Move to Standard-IA after X days
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
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
      )}

    </motion.div>
  );
};

export default Step1;
