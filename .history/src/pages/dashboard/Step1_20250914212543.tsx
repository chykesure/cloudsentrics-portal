// Step1.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone, MessageSquare, Check } from "lucide-react";
import type { JSX } from "react";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
  jumpToStep?: (step: number) => void;
}

const Step1 = ({ goNext, goBack, jumpToStep }: StepProps) => {
  const [bucketNote, setBucketNote] = useState("");
  const [selectedStorageCount, setSelectedStorageCount] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const maxLength = 1500;

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    if (option === "change" && jumpToStep) {
      jumpToStep(3);
    }
  };

  // Step2 tiers
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white min-h-screen w-full p-10"
    >
      {/* Request Type */}
      <div className="mb-8">
        <h3 className="text-3xl font-semibold text-blue-900 mb-4">
          REQUEST TYPE
        </h3>
        <div className="flex flex-wrap gap-6 text-xl">
          {/* AWS */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "aws"}
              onChange={() => handleSelect("aws")}
            />
            <span>Additional AWS Account(s)</span>
          </label>

          {/* Storage(s) */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "storage"}
              onChange={() => handleSelect("storage")}
            />
            <span>Storage(s)</span>
          </label>

          {/* Change */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-6 h-6"
              checked={selectedOption === "change"}
              onChange={() => handleSelect("change")}
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
            <label className="font-medium">
              Number of Storages (Buckets) required:
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
                  onChange={() => setSelectedStorageCount(n)}
                  className="appearance-none w-6 h-6 border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                />
                <span
                  className={`pointer-events-none absolute left-1 top-0.5 w-5 h-5 flex items-center justify-center text-white ${
                    selectedStorageCount === n ? "opacity-100" : "opacity-0"
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
              value={
                selectedStorageCount && selectedStorageCount > 5
                  ? selectedStorageCount
                  : ""
              }
            />
          </div>

          {/* Bucket Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {["A", "B", "C", "D", "E", "F"].map((label) => (
              <div key={label}>
                <label className="text-xl font-medium text-gray-700 mb-2 block">
                  {label}
                </label>
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
        </div>
      )}

      {/* STORAGE OPTION (Step2 merged inline) */}
      {selectedOption === "storage" && (
        <div className="mt-8">
          <p className="text-xl text-gray-700 mb-6 leading-relaxed">
            Note: All Cloud Sentrics Storage comes by default with versioning
            and SSE-S3 encryption enabled. Additional settings may incur extra
            charges and will be reflected on your invoice.
          </p>

          <h4 className="text-2xl font-semibold text-gray-800 mb-6">
            Choose any of the tiers for your company
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between transition ${
                  selectedTier === tier.id
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
                      <span className="font-semibold">EXTRAS:</span>{" "}
                      {tier.extras}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTier(tier.id)}
                  className={`mt-8 py-3 px-6 rounded-lg text-xl font-semibold flex items-center justify-center gap-2 transition ${
                    selectedTier === tier.id
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
        </div>
      )}

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
              goNext();
            } else if (selectedOption === "storage" && jumpToStep) {
              // ✅ Only proceed if a tier is chosen
              if (selectedTier) jumpToStep(2);
            } else if (selectedOption === "change" && jumpToStep) {
              jumpToStep(3);
            }
          }}
          disabled={
            !selectedOption ||
            (selectedOption === "storage" && !selectedTier)
          }
          className={`px-10 py-4 text-lg rounded-md ${
            !selectedOption ||
            (selectedOption === "storage" && !selectedTier)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#032352] text-white hover:bg-blue-700"
          }`}
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default Step1;
