import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";

const Step4 = ({ goBack, jumpToStep }: StepProps) => {
  // ✅ Main States
  const [fileSharing, setFileSharing] = useState<string | null>(null);
  const [fileOptions, setFileOptions] = useState<string[]>([]);
  const [otpPlan, setOtpPlan] = useState<Record<string, string>>({});
  const [customOtp, setCustomOtp] = useState<Record<string, string>>({});

  const [accessLogging, setAccessLogging] = useState<string | null>(null);
  const [lifecycle, setLifecycle] = useState<string | null>(null);
  const [customerKey, setCustomerKey] = useState<string | null>(null);

  const [retentionDays, setRetentionDays] = useState("");
  const [retentionMonths, setRetentionMonths] = useState("");
  const [transitionGlacier, setTransitionGlacier] = useState(false);
  const [transitionStandard, setTransitionStandard] = useState(false);

  const [isFormComplete, setIsFormComplete] = useState(false);

  // ✅ Handle File Option Toggle
  const toggleFileOption = (value: string) => {
    setFileOptions((prev) => {
      if (prev.includes(value)) {
        const newOtp = { ...otpPlan };
        const newCustom = { ...customOtp };
        delete newOtp[value];
        delete newCustom[value];
        setOtpPlan(newOtp);
        setCustomOtp(newCustom);
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // ✅ Validation Logic
  useEffect(() => {
    let complete = true;

    // File Sharing must be selected
    if (!fileSharing) complete = false;

    // If file sharing = Yes, must pick at least one delivery option
    if (fileSharing === "Yes" && fileOptions.length === 0) complete = false;

    // If OTP options exist, validate they have plan or custom
    if (fileSharing === "Yes") {
      for (const opt of fileOptions) {
        if (opt !== "Email") {
          if (!otpPlan[opt] && !customOtp[opt]) complete = false;
        }
      }
    }

    // Must select Access Logging
    if (!accessLogging) complete = false;

    // Must select Lifecycle
    if (!lifecycle) complete = false;

    // Must select Customer Managed Key
    if (!customerKey) complete = false;

    // If Lifecycle is Yes, retention fields must be filled
    if (lifecycle === "Yes") {
      if (!retentionDays && !retentionMonths) complete = false;
    }

    setIsFormComplete(complete);
  }, [
    fileSharing,
    fileOptions,
    otpPlan,
    customOtp,
    accessLogging,
    lifecycle,
    customerKey,
    retentionDays,
    retentionMonths,
  ]);

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 px-2 sm:px-4 pt-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-4 sm:p-6 md:p-10 rounded-lg md:rounded-2xl shadow-xl w-full max-w-7xl"
      >
        {/* Note */}
        <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
          Note: All Cloud Sentrics Storage comes by default with versioning and
          SSE-S3 encryption enabled. Additional settings may incur extra charges
          and will be reflected on your invoice.
        </p>

        {/* File Sharing Section */}
        <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            File Sharing
          </h4>

          {/* Yes/No */}
          <div className="flex gap-6 mb-4">
            {["Yes", "No"].map((val) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="fileSharing"
                  value={val}
                  checked={fileSharing === val}
                  onChange={() => {
                    setFileSharing(val);
                    if (val === "No") {
                      setFileOptions([]);
                      setOtpPlan({});
                      setCustomOtp({});
                    }
                  }}
                  className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                />
                <span className="text-[#032352]">{val}</span>
              </label>
            ))}
          </div>

          {/* Delivery Method Options */}
          {fileSharing === "Yes" && (
            <div className="ml-2 sm:ml-4 space-y-4">
              {[
                {
                  value: "Email",
                  label:
                    "Email Only: File securely delivered to recipient's email address provided.",
                },
                {
                  value: "EmailOTP",
                  label:
                    "Email + OTP: File delivered to recipient's email, but requires OTP sent to their WhatsApp before download.",
                },
                {
                  value: "WhatsApp",
                  label:
                    "WhatsApp Only: File securely delivered to recipient's WhatsApp number provided.",
                },
                {
                  value: "WhatsAppEmail",
                  label:
                    "WhatsApp & Email: File securely delivered to both recipient's WhatsApp Number and Email address.",
                },
              ].map(({ value, label }) => (
                <div key={value} className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fileOptions.includes(value)}
                      onChange={() => toggleFileOption(value)}
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">{label}</span>
                  </label>

                  {fileOptions.includes(value) && value !== "Email" && (
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50 space-y-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {{
                          EmailOTP:
                            "One-Time-Passcode (OTP) Subscription Tier per month.",
                          WhatsApp:
                            "Number of files delivered via WhatsApp per month.",
                          WhatsAppEmail:
                            "Number of files delivered via WhatsApp & Email per month.",
                        }[value]}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        {["500", "1000", "1500"].map((plan) => (
                          <label
                            key={plan}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              name={`otpPlan-${value}`}
                              value={plan}
                              checked={otpPlan[value] === plan}
                              onChange={() => {
                                setOtpPlan({ ...otpPlan, [value]: plan });
                                setCustomOtp({ ...customOtp, [value]: "" });
                              }}
                              className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                            />
                            <span className="text-[#032352]">{plan}</span>
                          </label>
                        ))}

                        {/* Custom */}
                        <input
                          type="number"
                          placeholder="Custom number"
                          className="px-3 py-2 border rounded-md text-base md:text-lg w-32 md:w-40"
                          value={customOtp[value] || ""}
                          onChange={(e) => {
                            setCustomOtp({
                              ...customOtp,
                              [value]: e.target.value,
                            });
                            setOtpPlan({ ...otpPlan, [value]: "custom" });
                          }}
                          onFocus={() =>
                            setOtpPlan({ ...otpPlan, [value]: "custom" })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Access Logging */}
          <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Enable Access Logging (Recommended)
            </h4>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="accessLogging"
                    value={val}
                    checked={accessLogging === val}
                    onChange={() => setAccessLogging(val)}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">{val}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lifecycle Management */}
          <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Enable Lifecycle Management
            </h4>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="lifecycle"
                    value={val}
                    checked={lifecycle === val}
                    onChange={() => setLifecycle(val)}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">{val}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Key + Retention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Customer Managed Key */}
          <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Managed Key
            </h4>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="customerKey"
                    value={val}
                    checked={customerKey === val}
                    onChange={() => setCustomerKey(val)}
                    className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                  />
                  <span className="text-[#032352]">{val}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600 italic">
              Note: Additional Charges may apply for CMK storage and usage
            </p>
          </div>

          {/* Retention + Transition */}
          {lifecycle === "Yes" && (
            <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Retention Duration
              </h4>
              <div className="flex gap-4 mb-6">
                <input
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  placeholder="Input no of days"
                  className="w-1/2 px-3 py-2 border rounded-md text-base md:text-lg"
                />
                <input
                  type="number"
                  value={retentionMonths}
                  onChange={(e) => setRetentionMonths(e.target.value)}
                  placeholder="Input no of months"
                  className="w-1/2 px-3 py-2 border rounded-md text-base md:text-lg"
                />
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Transition Settings
              </h4>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transitionGlacier}
                    onChange={() => {
                      setTransitionGlacier(!transitionGlacier);
                      if (!transitionGlacier) setTransitionStandard(false);
                    }}
                    className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                  />
                  <span className="text-gray-700">Move to Glacier</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transitionStandard}
                    onChange={() => {
                      setTransitionStandard(!transitionStandard);
                      if (!transitionStandard) setTransitionGlacier(false);
                    }}
                    className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
                  />
                  <span className="text-gray-700">Move to Standard-IA</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={goBack}
            className="px-6 md:px-8 py-2 md:py-3 bg-white border border-gray-400 rounded-md text-base md:text-lg text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={() => jumpToStep?.(6)}
            disabled={!isFormComplete}
            className={`px-6 md:px-8 py-2 md:py-3 rounded-md text-base md:text-lg transition ${
              isFormComplete
                ? "bg-[#032352] text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step4;
