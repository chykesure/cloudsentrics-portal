import { useState } from "react";
import { motion } from "framer-motion";


interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}
const Step4 = ({ goBack, jumpToStep }: StepProps) => {
  const [accessLogging, setAccessLogging] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<string | null>(null);
  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [retentionDays, setRetentionDays] = useState("");
  const [retentionMonths, setRetentionMonths] = useState("");
  const [transitionGlacier, setTransitionGlacier] = useState(false);
  const [transitionStandard, setTransitionStandard] = useState(false);

  // New States for File Sharing
  const [fileSharing, setFileSharing] = useState<string | null>(null);
  const [otpPlan, setOtpPlan] = useState<string | null>(null);
  const [customOtp, setCustomOtp] = useState("");

  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);






  const [glacierDays, setGlacierDays] = useState("");
  const [glacierMonths, setGlacierMonths] = useState("");
  const [standardDays, setStandardDays] = useState("");
  const [standardMonths, setStandardMonths] = useState("");



  return (
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

      {/* ✅ Yes/No File Sharing */}
      <div className="flex gap-6 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
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
            type="radio"
            name="fileSharing"
            value="No"
            checked={fileSharing === "No"}
            onChange={() => {
              setFileSharing("No");
              setSelectedOption(null);
              setOtpPlan(null);
              setCustomOtp("");
            }}
            className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
          />
          <span className="text-[#032352]">No</span>
        </label>
      </div>

      {/* ✅ Delivery Method Options */}
      {fileSharing === "Yes" && (
        <div className="ml-4 space-y-4">
          {[
            {
              value: "Email",
              label: (
                <>
                  <span className="font-bold">Email Only:</span>{" "}
                  File securely delivered to recipient's email address provided.
                </>
              ),
            },
            {
              value: "EmailOTP",
              label: (
                <>
                  <span className="font-bold">Email + OTP:</span>{" "}
                  File delivered to recipient's email, but requires OTP sent to
                  their WhatsApp before download.
                </>
              ),
            },
            {
              value: "WhatsApp",
              label: (
                <>
                  <span className="font-bold">WhatsApp Only:</span>{" "}
                  File securely delivered to recipient's WhatsApp number
                  provided.
                </>
              ),
            },
            {
              value: "WhatsAppEmail",
              label: (
                <>
                  <span className="font-bold">WhatsApp &amp; Email:</span>{" "}
                  File securely delivered to both recipient's WhatsApp Number
                  and Email address.
                </>
              ),
            },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={value}
                checked={selectedOption === value}
                onChange={() => {
                  setSelectedOption(value);
                  setOtpPlan(null);
                  setCustomOtp("");
                }}
                className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
              />
              <span className="text-[#032352]">{label}</span>
            </label>
          ))}

          {/* ✅ OTP Subscription Plans */}
          {["EmailOTP", "WhatsApp", "WhatsAppEmail"].includes(
            selectedOption || ""
          ) && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h5 className="font-semibold mb-3">
                {{
                  EmailOTP: "Number of files sent via Email OTP per month?",
                  WhatsApp: "Number of files sent via WhatsApp per month?",
                  WhatsAppEmail:
                    "Number of files sent via WhatsApp & Email per month?",
                }[selectedOption as string]}
              </h5>

              <div className="flex flex-wrap gap-4">
                {["500", "1000", "1500"].map((plan) => (
                  <label
                    key={plan}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="otpPlan"
                      value={plan}
                      checked={otpPlan === plan}
                      onChange={() => {
                        setOtpPlan(plan);
                        setCustomOtp(""); // reset custom if standard plan chosen
                      }}
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">{plan}</span>
                  </label>
                ))}

                {/* ✅ Custom OTP Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customOtp}
                    onChange={(e) => {
                      setCustomOtp(e.target.value);
                      setOtpPlan("custom");
                    }}
                    onFocus={() => setOtpPlan("custom")}
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
  );
}

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
            {/* 🔹 Retention Duration */}
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Retention Duration:
            </h4>
            <div className="flex gap-4 mb-6">
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                placeholder="Input no of days"
                className="w-1/2 px-3 py-2 border rounded-md text-lg"
              />
              <input
                type="number"
                value={retentionMonths}
                onChange={(e) => setRetentionMonths(e.target.value)}
                placeholder="Input no of months"
                className="w-1/2 px-3 py-2 border rounded-md text-lg"
              />
            </div>

            {/* 🔹 Transition Settings */}
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Transition Settings:
            </h4>
            <div className="flex flex-col gap-6">

              {/* ✅ Glacier Transition */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={transitionGlacier}
                    onChange={() => setTransitionGlacier(!transitionGlacier)}
                    className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                  />
                  <span className="text-gray-700">
                    Move to Glacier after expiration of Retention Duration
                  </span>
                </label>

                {transitionGlacier && (
                  <div className="flex gap-4 ml-8">
                    <input
                      type="number"
                      value={glacierDays}
                      onChange={(e) => setGlacierDays(e.target.value)}
                      placeholder="Input no of days"
                      className="w-1/2 px-3 py-2 border rounded-md text-lg"
                    />
                    <input
                      type="number"
                      value={glacierMonths}
                      onChange={(e) => setGlacierMonths(e.target.value)}
                      placeholder="Input no of months"
                      className="w-1/2 px-3 py-2 border rounded-md text-lg"
                    />
                  </div>
                )}
              </div>

              {/* ✅ Standard-IA Transition */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={transitionStandard}
                    onChange={() => setTransitionStandard(!transitionStandard)}
                    className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                  />
                  <span className="text-gray-700">
                    Move to Standard-IA after expiration of Retention Duration
                  </span>
                </label>

                {transitionStandard && (
                  <div className="flex gap-4 ml-8">
                    <input
                      type="number"
                      value={standardDays}
                      onChange={(e) => setStandardDays(e.target.value)}
                      placeholder="Input no of days"
                      className="w-1/2 px-3 py-2 border rounded-md text-lg"
                    />
                    <input
                      type="number"
                      value={standardMonths}
                      onChange={(e) => setStandardMonths(e.target.value)}
                      placeholder="Input no of months"
                      className="w-1/2 px-3 py-2 border rounded-md text-lg"
                    />
                  </div>
                )}
              </div>

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
          onClick={() => {
            jumpToStep?.(6); // 👈 explicitly jump to Step2
          }}
          className="px-8 py-3 bg-[#032352] text-white text-lg rounded-md hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default Step4;
