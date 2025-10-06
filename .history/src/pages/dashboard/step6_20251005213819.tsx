// src/onboarding/Step6.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";
import SuccessScreen from "./SuccessScreen";

const Step6 = ({ goBack, formData, setFormData, jumpToStep }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>(
    formData?.acknowledgements || []
  );
  const [loading, setLoading] = useState(false);
  const [reporterEmail, setReporterEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Change section states
  const [existingAccountId, setExistingAccountId] = useState(
    formData?.existingAccountId || ""
  );
  const [existingStorageName, setExistingStorageName] = useState(
    formData?.existingStorageName || ""
  );
  const [changesRequested, setChangesRequested] = useState<string[]>(
    formData?.changesRequested || []
  );
  const [details, setDetails] = useState(formData?.details || "");
  const maxLength = 500;

  const ackOptions = [
    "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
    "I understand that Cloud Sentrics may store my data outside my region",
    "I confirm the information provided is accurate and approve this request.",
  ];

  const changeOptions = [
    "Increase storage size",
    "Enable versioning",
    "Change encryption settings",
    "Other modifications",
  ];

  // Load reporter email from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setReporterEmail(user.companyEmail || "N/A");
    }
  }, []);

  // Debug: log formData whenever it changes
  useEffect(() => {
    console.log("📝 Updated formData:", {
      acknowledgements,
      existingAccountId,
      existingStorageName,
      changesRequested,
      details,
      ...formData,
    });
  }, [acknowledgements, existingAccountId, existingStorageName, changesRequested, details, formData]);

  // Toggle acknowledgement options
  const toggleAck = (option: string) => {
    setAcknowledgements((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
    setFormData((prev) => ({
      ...prev,
      acknowledgements: prev.acknowledgements
        ? prev.acknowledgements.includes(option)
          ? prev.acknowledgements.filter((o) => o !== option)
          : [...prev.acknowledgements, option]
        : [option],
    }));
  };

  const allChecked = ackOptions.every((opt) => acknowledgements.includes(opt));

  // Submit full request (Step2 → Step6)
  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error("Please check all acknowledgements before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Build AWS accounts array
      const awsAccounts: { alias: string; orgName: string }[] = [];
      Object.entries(formData.awsAliases || {}).forEach(([label, orgName]) => {
        if (orgName.trim() !== "") {
          awsAccounts.push({ alias: `cloudsentrics-aws-${label}`, orgName });
        }
      });

      if (formData.bucketNote?.trim()) {
        const extraAliases = formData.bucketNote
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");
        extraAliases.forEach((alias, i) => {
          awsAccounts.push({
            alias: `cloudsentrics-aws-extra-${i + 1}`,
            orgName: alias,
          });
        });
      }

      const awsCount = formData.selectedStorageCount ?? awsAccounts.length;

      const descriptionADF = {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: `Reporter Email: ${reporterEmail}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Number of AWS Account(s) Needed: ${awsCount}` }] },
          { type: "paragraph", content: [{ type: "text", text: `AWS Accounts:` }] },
          ...(awsAccounts.map((acc) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- Alias: ${acc.alias} | Org: ${acc.orgName}` }],
          })) || []),
          { type: "paragraph", content: [{ type: "text", text: `Acknowledgements:` }] },
          ...(acknowledgements.map((ack) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- ${ack} ✅` }],
          })) || []),
          { type: "paragraph", content: [{ type: "text", text: `Changes Requested:` }] },
          ...(changesRequested.map((ch) => ({
            type: "paragraph",
            content: [{ type: "text", text: `- ${ch}` }],
          })) || []),
          { type: "paragraph", content: [{ type: "text", text: `Additional Details: ${details}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Date/Time: ${new Date().toISOString()}` }] },
        ],
      };

      const payload = {
        title: formData.title || "Request from " + reporterEmail,
        reporterEmail,
        awsAccounts,
        acknowledgements,
        changesRequested,
        details,
        selectedStorageCount: formData.selectedStorageCount,
        bucketNote: formData.bucketNote,
        awsCountText: formData.awsCountText,
        accessList: formData.accessList || [],
        step4Data: formData.step4Data || {},
        existingAccountId,
        existingStorageName,
        descriptionADF,
      };

      console.log("📤 Final Payload Sent:", payload);

      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Backend error:", data);
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success(`Request submitted successfully! Jira Issue: ${data.jiraIssueKey}`);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      toast.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) return <SuccessScreen />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 bg-white shadow-md">
        {/* ACKNOWLEDGEMENTS */}
        <div className="bg-blue-100 px-3 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md mb-6">
          ACKNOWLEDGEMENTS
        </div>
        <div className="space-y-4 text-base sm:text-lg text-gray-800 mb-10">
          {ackOptions.map((option) => (
            <label key={option} className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="form-checkbox mt-1 w-5 h-5"
                checked={acknowledgements.includes(option)}
                onChange={() => toggleAck(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        {/* CHANGE OPTION */}
        <div className="bg-blue-100 px-4 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md mb-4">
          CHANGE TO EXISTING SETTINGS
        </div>

        <div className="px-2 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
              Existing Account ID
            </label>
            <input
              type="text"
              value={existingAccountId}
              onChange={(e) => {
                const val = e.target.value;
                setExistingAccountId(val);
                setFormData((prev) => ({ ...prev, existingAccountId: val }));
              }}
              placeholder="Existing Account ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base sm:text-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-2">
              Existing Storage Name
            </label>
            <input
              type="text"
              value={existingStorageName}
              onChange={(e) => {
                const val = e.target.value;
                setExistingStorageName(val);
                setFormData((prev) => ({ ...prev, existingStorageName: val }));
              }}
              placeholder="Existing Storage Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-base sm:text-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-base sm:text-lg font-medium text-gray-700 mb-4">
            Changes Requested
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {changeOptions.map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                  checked={changesRequested.includes(option)}
                  onChange={() => {
                    const updated = changesRequested.includes(option)
                      ? changesRequested.filter((o) => o !== option)
                      : [...changesRequested, option];
                    setChangesRequested(updated);
                    setFormData((prev) => ({ ...prev, changesRequested: updated }));
                  }}
                />
                <span className="text-base sm:text-lg">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-base sm:text-lg font-medium text-gray-700 mb-3">
            Additional Details
          </label>
          <textarea
            rows={6}
            value={details}
            onChange={(e) => {
              const val = e.target.value;
              setDetails(val);
              setFormData((prev) => ({ ...prev, details: val }));
            }}
            placeholder="Provide further context for the changes requested..."
            className="w-full p-4 border border-gray-300 rounded-md text-sm sm:text-lg resize-none focus:ring-2 focus:ring-blue-400"
            maxLength={maxLength}
          ></textarea>
          <div className="text-right text-sm sm:text-md text-gray-500 mt-1">
            {details.length}/{maxLength}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
          <button
            onClick={goBack}
            className="w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !allChecked ||
              !existingAccountId.trim() ||
              !existingStorageName.trim() ||
              changesRequested.length === 0 ||
              loading
            }
            className={`w-full sm:w-auto px-8 py-3 sm:px-10 sm:py-4 text-base sm:text-lg rounded-md ${
              !allChecked ||
              !existingAccountId.trim() ||
              !existingStorageName.trim() ||
              changesRequested.length === 0 ||
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#032352] text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Step6;
