// Step2.tsx
import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
}

const Step2 = ({ goNext, goBack }: StepProps) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const tiers = [
    {
      id: "standard",
      title: "STANDARD TIER",
      storage: "200GB",
      channels: "Dashboard & Email only",
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras: "Access to knowledge base & FAQs",
    },
    {
      id: "business",
      title: "BUSINESS TIER",
      storage: "400GB",
      channels: "Dashboard + Live Chat (website/app) + WhatsApp",
      response: "Within 24 hrs",
      availability: "24/7 support coverage",
      extras: "Priority handling over Standard customers. WhatsApp Support for quick queries.",
    },
    {
      id: "premium",
      title: "PREMIUM TIER",
      storage: "2TB",
      channels: "Dashboard + Email + Live Chat + Phone + WhatsApp",
      response: "Within 4 hrs (priority SLA)",
      availability: "24/7 support coverage",
      extras: "Dedicated account manager/customer success rep. Priority escalation for critical issues.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl mx-auto"
    >
      {/* Request Type */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-blue-900 mb-4">REQUEST TYPE</h3>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-lg">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" />
            <span>Additional AWS Account(s)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" defaultChecked />
            <span>Storage(s)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Note: All Cloud Sentrics Storage comes by default with versioning and
        SSE-S3 encryption enabled. Additional settings may incur extra charges
        and will be reflected on your invoice.
      </p>

      {/* Tiers */}
      <h4 className="text-lg font-medium text-gray-800 mb-6">
        Choose any of the tiers for your company
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`border rounded-xl p-6 shadow-sm flex flex-col justify-between ${
              selectedTier === tier.id ? "border-blue-700" : "border-gray-300"
            }`}
          >
            <div>
              <h5 className="text-xl font-bold text-blue-900 mb-2">{tier.title}</h5>
              <p className="text-gray-600 font-semibold mb-4">{tier.storage}</p>
              <div className="space-y-3 text-gray-700 text-sm">
                <p>
                  <span className="font-semibold">CHANNELS:</span> {tier.channels}
                </p>
                <p>
                  <span className="font-semibold">RESPONSE TIME:</span> {tier.response}
                </p>
                <p>
                  <span className="font-semibold">AVAILABILITY:</span> {tier.availability}
                </p>
                <p>
                  <span className="font-semibold">EXTRAS:</span> {tier.extras}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTier(tier.id)}
              className={`mt-6 py-2 px-4 rounded-md text-center font-medium ${
                selectedTier === tier.id
                  ? "bg-blue-900 text-white"
                  : "bg-gray-100 text-blue-900 hover:bg-blue-200"
              }`}
            >
              Select Tier
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={goBack}
          className="px-8 py-3 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          disabled={!selectedTier}
          className={`px-8 py-3 rounded-md text-lg ${
            selectedTier
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

export default Step2;
