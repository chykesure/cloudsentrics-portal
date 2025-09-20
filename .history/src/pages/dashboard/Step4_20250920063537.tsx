import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}

const Step4 = ({ goBack, jumpToStep }: StepProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otpPlan, setOtpPlan] = useState<Record<string, string>>({});
  const [customOtp, setCustomOtp] = useState<Record<string, string>>({});

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
      setOtpPlan((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
      setCustomOtp((prev) => {
        const copy = { ...prev };
        delete copy[option];
        return copy;
      });
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-white shadow-md rounded-lg"
    >
      <h3 className="text-xl font-semibold mb-4 text-[#032352]">
        Delivery Options
      </h3>

      <div className="space-y-6">
        {/* ✅ Email + OTP */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes("EmailOTP")}
              onChange={() => toggleOption("EmailOTP")}
              className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
            />
            <span className="text-gray-700">
              <strong>Email + OTP:</strong> File delivered to recipient's email,
              but requires OTP sent to their WhatsApp before download.
            </span>
          </label>

          {selectedOptions.includes("EmailOTP") && (
            <div className="mt-3 ml-8 p-4 border rounded-lg bg-gray-50">
              <h5 className="font-semibold text-[#032352] mb-1">
                Email + OTP Subscription
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                One-Time-Passcode (OTP) Subscription Tier per month.
              </p>

              <div className="flex flex-wrap gap-4">
                {["500", "1000", "1500"].map((plan) => (
                  <label
                    key={plan}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="otpPlan-EmailOTP"
                      value={plan}
                      checked={otpPlan["EmailOTP"] === plan}
                      onChange={() =>
                        setOtpPlan({ ...otpPlan, EmailOTP: plan })
                      }
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">{plan}</span>
                  </label>
                ))}

                <input
                  type="number"
                  value={customOtp["EmailOTP"] || ""}
                  onChange={(e) => {
                    setCustomOtp({
                      ...customOtp,
                      EmailOTP: e.target.value,
                    });
                    setOtpPlan({ ...otpPlan, EmailOTP: "custom" });
                  }}
                  onFocus={() =>
                    setOtpPlan({ ...otpPlan, EmailOTP: "custom" })
                  }
                  placeholder="Custom number"
                  className="px-3 py-2 border rounded-md text-lg w-40"
                />
              </div>
            </div>
          )}
        </div>

        {/* ✅ WhatsApp Only */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes("WhatsApp")}
              onChange={() => toggleOption("WhatsApp")}
              className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
            />
            <span className="text-gray-700">
              <strong>WhatsApp Only:</strong> File securely delivered to
              recipient's WhatsApp number provided.
            </span>
          </label>

          {selectedOptions.includes("WhatsApp") && (
            <div className="mt-3 ml-8 p-4 border rounded-lg bg-gray-50">
              <h5 className="font-semibold text-[#032352] mb-1">
                WhatsApp Delivery
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Number of files delivered via WhatsApp per month.
              </p>

              <div className="flex flex-wrap gap-4">
                {["500", "1000", "1500"].map((plan) => (
                  <label
                    key={plan}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="otpPlan-WhatsApp"
                      value={plan}
                      checked={otpPlan["WhatsApp"] === plan}
                      onChange={() =>
                        setOtpPlan({ ...otpPlan, WhatsApp: plan })
                      }
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">{plan}</span>
                  </label>
                ))}

                <input
                  type="number"
                  value={customOtp["WhatsApp"] || ""}
                  onChange={(e) => {
                    setCustomOtp({
                      ...customOtp,
                      WhatsApp: e.target.value,
                    });
                    setOtpPlan({ ...otpPlan, WhatsApp: "custom" });
                  }}
                  onFocus={() =>
                    setOtpPlan({ ...otpPlan, WhatsApp: "custom" })
                  }
                  placeholder="Custom number"
                  className="px-3 py-2 border rounded-md text-lg w-40"
                />
              </div>
            </div>
          )}
        </div>

        {/* ✅ WhatsApp & Email */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes("WhatsAppEmail")}
              onChange={() => toggleOption("WhatsAppEmail")}
              className="h-5 w-5 text-[#032352] rounded border-gray-300 focus:ring-[#032352]"
            />
            <span className="text-gray-700">
              <strong>WhatsApp & Email:</strong> File securely delivered to both
              recipient's WhatsApp Number and Email address.
            </span>
          </label>

          {selectedOptions.includes("WhatsAppEmail") && (
            <div className="mt-3 ml-8 p-4 border rounded-lg bg-gray-50">
              <h5 className="font-semibold text-[#032352] mb-1">
                WhatsApp & Email Delivery
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                Number of files delivered via WhatsApp & Email per month.
              </p>

              <div className="flex flex-wrap gap-4">
                {["500", "1000", "1500"].map((plan) => (
                  <label
                    key={plan}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="otpPlan-WhatsAppEmail"
                      value={plan}
                      checked={otpPlan["WhatsAppEmail"] === plan}
                      onChange={() =>
                        setOtpPlan({ ...otpPlan, WhatsAppEmail: plan })
                      }
                      className="h-5 w-5 text-[#032352] focus:ring-[#032352]"
                    />
                    <span className="text-[#032352]">{plan}</span>
                  </label>
                ))}

                <input
                  type="number"
                  value={customOtp["WhatsAppEmail"] || ""}
                  onChange={(e) => {
                    setCustomOtp({
                      ...customOtp,
                      WhatsAppEmail: e.target.value,
                    });
                    setOtpPlan({ ...otpPlan, WhatsAppEmail: "custom" });
                  }}
                  onFocus={() =>
                    setOtpPlan({ ...otpPlan, WhatsAppEmail: "custom" })
                  }
                  placeholder="Custom number"
                  className="px-3 py-2 border rounded-md text-lg w-40"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goBack}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={goNext}
          className="px-6 py-2 rounded-lg bg-[#032352] text-white hover:bg-[#021a3a]"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Step4;
