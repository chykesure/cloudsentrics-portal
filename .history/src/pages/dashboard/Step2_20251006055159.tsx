// src/onboarding/Step2.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";

const Step2 = ({ goBack, goNext, updateFormData, formData }: StepProps) => {
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
      extras: "Priority handling over Standard customers. WhatsApp Support for quick queries.",
    },
    {
      id: "premium",
      title: "PREMIUM TIER",
      storage: "2TB",
      channels: ["Dashboard", "Email", "Live Chat", "Phone", "WhatsApp"],
      response: "Within 4 hrs (priority SLA)",
      availability: "24/7 support coverage",
      extras: "Dedicated account manager/customer success rep. Priority escalation for critical issues.",
    },
  ];

  const [selectedTier, setSelectedTier] = useState(formData.selectedTier || "");

  const handleSelectTier = (tier: any) => {
    setSelectedTier(tier.id);
    updateFormData({
      ...formData,
      selectedTier: tier.id,
      tierDetails: {
        title: tier.title,
        storage: tier.storage,
        channels: tier.channels.join(", "),
        response: tier.response,
        availability: tier.availability,
        extras: tier.extras,
      },
    });
  };

  const handleNext = () => {
    if (!selectedTier) {
      alert("Please select a tier before proceeding.");
      return;
    }
    goNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <h2 className="text-2xl font-bold mb-4">Choose a Storage Tier</h2>
      <p className="text-gray-600 mb-6">
        Note: All Cloud Sentrics Storage comes by default with versioning and
        SSE-S3 encryption enabled. Additional settings may incur extra charges
        and will be reflected on your invoice.
      </p>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 border rounded-xl shadow-md cursor-pointer transition-all ${
              selectedTier === tier.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => handleSelectTier(tier)}
          >
            <h3 className="text-lg font-semibold mb-2">{tier.title}</h3>
            <p className="font-medium text-blue-600 mb-2">
              Storage: {tier.storage}
            </p>
            <p className="text-sm mb-2">Channels: {tier.channels.join(", ")}</p>
            <p className="text-sm mb-2">Response: {tier.response}</p>
            <p className="text-sm mb-2">Availability: {tier.availability}</p>
            <p className="text-sm text-gray-600">Extras: {tier.extras}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Step2;
