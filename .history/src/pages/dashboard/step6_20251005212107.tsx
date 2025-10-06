// src/onboarding/Step6.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";
import SuccessScreen from "./SuccessScreen";

const Step6 = ({ goBack, formData }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>(
    formData?.acknowledgements || []
  );
  const [loading, setLoading] = useState(false);
  const [reporterEmail, setReporterEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const ackOptions = [
    "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
    "I understand that Cloud Sentrics may store my data outside my region",
    "I confirm the information provided is accurate and approve this request.",
  ];

  // Load reporter email from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setReporterEmail(user.companyEmail || "N/A");
    }
  }, []);

  // Toggle acknowledgement
  const toggleAck = (option: string) => {
    setAcknowledgements((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const allChecked = ackOptions.every((opt) => acknowledgements.includes(opt));

  // Build AWS accounts array including Storage & Change flows
  const buildAwsAccounts = () => {
    const awsAccounts: { alias: string; orgName: string }[] = [];

    // AWS aliases
    Object.entries(formData.awsAliases || {}).forEach(([label, orgName]) => {
      if (orgName.trim() !== "") {
        awsAccounts.push({ alias: `cloudsentrics-aws-${label}`, orgName });
      }
    });

    // Extra aliases from bucket note (Storage)
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

    // Change flow: If user added custom changes
    if (formData.changeList?.trim()) {
      const changeItems = formData.changeList
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");
      changeItems.forEach((change, i) => {
        awsAccounts.push({
          alias: `cloudsentrics-change-${i + 1}`,
          orgName: change,
        });
      });
    }

    return awsAccounts;
  };

  // Submit request
  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error("Please check all acknowledgements before submitting.");
      return;
    }

    setLoading(true);

    try {
      const awsAccounts = buildAwsAccounts();
      const payload = {
        reporterName: formData.reporterName,
        reporterEmail,
        phone: formData.phone,
        company: formData.company,
        accountId: formData.accountId,
        bucketName: formData.bucketName,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        selectedTier: formData.selectedTier,
        awsAccounts,
        selectedStorageCount: formData.selectedStorageCount,
        bucketNote: formData.bucketNote,
        awsCountText: formData.awsCountText,
        accessList: formData.accessList, // Step3
        step4Data: formData.step4Data,   // Step4
        acknowledgements,               // Step6
      };

      console.log("📤 Payload sent to backend:", payload);

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

      toast.success(`Request submitted successfully! Jira Key: ${data.jiraKey}`);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      toast.error(`Error: ${error.message}`);
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
