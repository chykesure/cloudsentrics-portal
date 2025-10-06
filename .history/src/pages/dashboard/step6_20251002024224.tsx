// src/dashboard/Step6.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";

const Step6 = ({ goBack, onSubmit, formData }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>(formData?.acknowledgements || []);
  const [loading, setLoading] = useState(false);

  const ackOptions = [
    { key: "charges", label: "I understand additional settings such as CMYK or life cycle transitions may incur additional charges" },
    { key: "storage", label: "I understand that Cloud Sentrics may store my data outside my region" },
    { key: "confirm", label: "I confirm the information provided is accurate and approve this request." },
  ];

  const toggleAck = (key: string) => {
    setAcknowledgements((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const allChecked = ackOptions.every((opt) => acknowledgements.includes(opt.key));

  const handleSubmit = async () => {
    console.log("🚀 Step6: handleSubmit started");

    if (!allChecked) {
      console.log("⚠️ Not all acknowledgements checked");
      toast.error("Please check all acknowledgements before submitting.");
      return;
    }

    setLoading(true);
    console.log("📝 Sending request to backend...");

    try {
      // Convert selected acknowledgements to booleans
      const ackObj = {
        charges: acknowledgements.includes("charges"),
        storage: acknowledgements.includes("storage"),
        confirm: acknowledgements.includes("confirm"),
      };

      // Prepare payload
      const payload = {
        title: "Request",                     // hardcoded
        reporterEmail: formData.reporterEmail || "N/A",
        reporterName: formData.reporterName || "N/A",
        phone: formData.phone || "N/A",
        company: formData.company || "N/A",
        accountId: formData.accountId || "N/A",
        bucketName: formData.bucketName || "N/A",
        priority: formData.priority || "N/A",
        awsAccounts: formData.awsAccounts || [], // each { alias, orgName }
        acknowledgements: ackObj,
      };

      console.log("📤 Payload:", payload);

      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Backend response:", data);

      if (!res.ok) {
        console.error("Backend error:", data);
        throw new Error(data.message || "Failed to submit request");
      }

      console.log("✅ Request submitted successfully:", data);
      toast.success(`Request submitted successfully! Jira Issue: ${data.jiraIssueKey}`);

      if (onSubmit) {
        console.log("🔔 Calling onSubmit callback");
        onSubmit();
      }

    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      toast.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("⏹️ handleSubmit finished");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 bg-white shadow-md">
        <div className="bg-blue-100 px-3 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md mb-6">
          ACKNOWLEDGEMENT
        </div>

        <div className="space-y-4 text-base sm:text-lg text-gray-800 mb-10">
          {ackOptions.map((opt) => (
            <label key={opt.key} className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="form-checkbox mt-1 w-5 h-5"
                checked={acknowledgements.includes(opt.key)}
                onChange={() => toggleAck(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <button
            onClick={goBack}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allChecked || loading}
            className={`w-full sm:w-auto px-6 py-3 text-base sm:text-lg rounded-md transition ${
              allChecked && !loading
                ? "bg-[#032352] text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
