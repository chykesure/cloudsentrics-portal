// Step2.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import type { JSX } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  MessageSquare,
  Check,
} from "lucide-react";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}

const Step2 = ({ goNext, goBack, jumpToStep }: StepProps) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      id: "standard",
      title: "STANDARD TIER",
      storage: "200GB",
      channels: ["Dashboard", "Email"],
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras: "Access to knowledge base & FAQs",
    },
    {
      id: "business",
      title: "BUSINESS TIER",
      storage: "400GB",
      channels: ["Dashboard", "Live Chat (App/Web)", "WhatsApp"],
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras:
        "Priority handling over Standard customers. WhatsApp Support for quick queries.",
    },
    {
      id: "premium",
      title: "PREMIUM TIER",
      storage: "2TB",
      channels: ["Dashboard", "Email", "Live Chat", "Phone", "WhatsApp"],
      response: "Within 4 hrs (priority SLA)",
      availability: "24/7 support coverage",
      extras:
        "Dedicated account manager/customer success rep. Priority escalation for critical issues.",
    },
  ];

  const channelIcons: Record<string, JSX.Element> = {
    Email: <Mail size={20} className="text-blue-700" />,
    "Live Chat": <MessageSquare size={20} className="text-green-600" />,
    "Live Chat (App/Web)": <MessageSquare size={20} className="text-green-600" />,
    Phone: <Phone size={20} className="text-indigo-600" />,
    WhatsApp: <MessageCircle size={20} className="text-green-500" />,
    Dashboard: (
      <div className="w-5 h-5 rounded bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
        D
      </div>
    ),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-7xl"
      >
        {/* Request Type */}
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
                checked
                readOnly
              />
              <span>Storage(s)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-not-allowed opacity-60">
              <input
                type="checkbox"
                className="form-checkbox w-6 h-6"
                disabled
              />
              <span>Change to Existing Account or Storage(s) settings</span>
            </label>

          </div>
        </div>

        {/* Info Note */}
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          Note: All Cloud Sentrics Storage comes by default with versioning and
          SSE-S3 encryption enabled. Additional settings may incur extra charges
          and will be reflected on your invoice.
        </p>

        {/* Tiers */}
        <h4 className="text-2xl font-semibold text-gray-800 mb-6">
          Choose any of the tiers for your company
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between transition ${selectedTier === tier.id
                ? "border-blue-700 ring-2 ring-blue-200"
                : "border-gray-300"
                }`}
            >
              <div>
                <h5 className="text-2xl font-bold text-blue-900 mb-2">
                  {tier.title}
                </h5>
                <p className="text-gray-800 font-semibold text-lg mb-6">
                  {tier.storage}
                </p>

                <div className="space-y-4 text-gray-700 text-lg">
                  <p>
                    <span className="font-semibold block mb-1">CHANNELS:</span>
                    <div className="flex flex-wrap gap-3">
                      {tier.channels.map((ch) => (
                        <div
                          key={ch}
                          className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg"
                        >
                          {channelIcons[ch] || null}
                          <span>{ch}</span>
                        </div>
                      ))}
                    </div>
                  </p>

                  <p>
                    <span className="font-semibold">RESPONSE TIME:</span>{" "}
                    {tier.response}
                  </p>
                  <p>
                    <span className="font-semibold">AVAILABILITY:</span>{" "}
                    {tier.availability}
                  </p>
                  <p>
                    <span className="font-semibold">EXTRAS:</span> {tier.extras}
                  </p>
                </div>
              </div>

              {/* Select Button with Check Icon */}
              <button
                onClick={() => setSelectedTier(tier.id)}
                className={`mt-8 py-3 px-6 rounded-lg text-xl font-semibold flex items-center justify-center gap-2 transition ${selectedTier === tier.id
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-blue-900 hover:bg-blue-200"
                  }`}
              >
                {selectedTier === tier.id ? (
                  <>
                    <Check size={22} className="text-white" /> Selected
                  </>
                ) : (
                  "Select Tier"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <button
            onClick={goBack}
            className="px-10 py-3 bg-white border border-gray-400 rounded-md text-xl text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              goNext();
              jumpToStep?.(2); // 👈 explicitly jump to Step2
            }}
            disabled={!selectedTier}
            className={`px-10 py-3 rounded-md text-xl font-semibold ${selectedTier
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

export default Step2;
