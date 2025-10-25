import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";

const Step4 = ({ goBack, jumpToStep, formData, setFormData }: StepProps) => {
  // ✅ Local States
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

  // ✅ Prefill Data from formData (only on mount!)
  useEffect(() => {
    if (formData?.step4Data) {
      const data = formData.step4Data;
      setFileSharing(data.fileSharing || null);
      setFileOptions(data.fileOptions || []);
      setOtpPlan(data.otpPlan || {});
      setCustomOtp(data.customOtp || {});
      setAccessLogging(data.accessLogging || null);
      setLifecycle(data.lifecycle || null);
      setCustomerKey(data.customerKey || null);
      setRetentionDays(data.retentionDays || "");
      setRetentionMonths(data.retentionMonths || "");
      setTransitionGlacier(data.transitionGlacier || false);
      setTransitionStandard(data.transitionStandard || false);
    }
  }, []); // ⚡ Only on mount to avoid render loop

  // ✅ Save Data to Parent formData on any change
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      step4Data: {
        fileSharing,
        fileOptions,
        otpPlan,
        customOtp,
        accessLogging,
        lifecycle,
        customerKey,
        retentionDays,
        retentionMonths,
        transitionGlacier,
        transitionStandard,
      },
    }));
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
    transitionGlacier,
    transitionStandard,
    setFormData, // ✅ include setter just in case
  ]);

  // ✅ Validation Logic
  useEffect(() => {
    let complete = true;

    if (!fileSharing) complete = false;
    if (fileSharing === "Yes" && fileOptions.length === 0) complete = false;

    if (fileSharing === "Yes") {
      for (const opt of fileOptions) {
        if (opt !== "Email") {
          if (!otpPlan[opt] && !customOtp[opt]) complete = false;
        }
      }
    }

    if (!accessLogging) complete = false;
    if (!lifecycle) complete = false;
    if (!customerKey) complete = false;

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

  // ✅ UI
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

          {/* Delivery Options */}
          {fileSharing === "Yes" && (
            <div className="ml-2 sm:ml-4 space-y-4">
              {[
                { value: "Email", label: "Email Only:", description: "Delivered via email." },
                {
                  value: "EmailOTP",
                  label: "Email + OTP:",
                  description: "Delivered via email and requires OTP on WhatsApp.",
                },
                { value: "WhatsApp", label: "WhatsApp Only:", description: "Delivered via WhatsApp." },
                {
                  value: "WhatsAppEmail",
                  label: "Both WhatsApp & Email:",
                  description: "Delivered via both channels.",
                },
              ].map(({ value, label, description }) => (
                <div key={value} className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fileOptions.includes(value)}
                      onChange={() => {
                        setFileOptions((prev) =>
                          prev.includes(value)
                            ? prev.filter((v) => v !== value)
                            : [...prev, value]
                        );
                      }}
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">
                      <strong>{label}</strong> {description}
                    </span>
                  </label>

                  {fileOptions.includes(value) && value !== "Email" && (
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50 space-y-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {value === "EmailOTP"
                          ? "One-Time-Passcode (OTP) Subscription Tier per month."
                          : value === "WhatsApp"
                            ? "Number of files delivered via WhatsApp per month."
                            : "Number of files delivered via WhatsApp & Email per month."}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        {["500", "1000", "1500"].map((plan) => (
                          <label key={plan} className="flex items-center gap-2 cursor-pointer">
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
                          placeholder="Custom"
                          className="px-3 py-2 border rounded-md text-base md:text-lg w-32 md:w-40"
                          value={customOtp[value] || ""}
                          onChange={(e) => {
                            setCustomOtp({ ...customOtp, [value]: e.target.value });
                            setOtpPlan({ ...otpPlan, [value]: "custom" });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Access Logging + Lifecycle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Access Logging */}
          <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Enable Access Logging
            </h4>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
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
                <label key={val} className="flex items-center gap-2 cursor-pointer">
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
          {/* Customer Key */}
          <div className="p-4 sm:p-6 bg-white shadow-md rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Managed Key
            </h4>
            <div className="flex gap-6">
              {["Yes", "No"].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
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
                  placeholder="Days"
                  className="w-1/2 px-3 py-2 border rounded-md"
                />
                <input
                  type="number"
                  value={retentionMonths}
                  onChange={(e) => setRetentionMonths(e.target.value)}
                  placeholder="Months"
                  className="w-1/2 px-3 py-2 border rounded-md"
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
                    className="h-5 w-5 text-[#032352]"
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
                    className="h-5 w-5 text-[#032352]"
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
            className="px-6 py-2 bg-white border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={() => jumpToStep?.(6)}
            disabled={!isFormComplete}
            className={`px-6 py-2 rounded-md text-white ${isFormComplete
                ? "bg-[#032352] hover:bg-blue-700"
                : "bg-gray-300 cursor-not-allowed"
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
