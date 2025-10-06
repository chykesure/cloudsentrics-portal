// src/dashboard/Step6.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";

const Step6 = ({ goBack, onSubmit, formData }: StepProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.reporterEmail) {
      toast.error("Reporter email is missing");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: "Request",                     // hardcoded
        reporterEmail: formData.reporterEmail,
        awsAccounts: formData.awsAccounts || [],
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

      if (!res.ok) {
        console.error("Backend error:", data);
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success(`Request submitted! Jira Issue: ${data.jiraIssueKey}`);
      console.log("✅ Request submitted:", data);

      if (onSubmit) onSubmit();

    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      toast.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
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
          REVIEW & SUBMIT
        </div>

        <div className="space-y-4 text-base sm:text-lg text-gray-800 mb-10">
          <p><strong>Reporter Email:</strong> {formData.reporterEmail}</p>
          <p><strong>Number of AWS Accounts:</strong> {formData.awsAccounts?.length || 0}</p>
          {formData.awsAccounts?.map((acc, i) => (
            <p key={i}>
              {i + 1}. Alias: {acc.alias} | Org: {acc.orgName}
            </p>
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
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 text-base sm:text-lg rounded-md transition ${
              !loading ? "bg-[#032352] text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
