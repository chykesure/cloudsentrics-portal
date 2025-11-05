import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";
import SuccessScreen from "./SuccessScreen";

type AliasMap = Record<string, string>;

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

  // ✅ Load reporter email from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setReporterEmail(user.companyEmail || "N/A");
    }
  }, []);

  // ✅ Handle toggling acknowledgements
  const toggleAck = (option: string) => {
    setAcknowledgements((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const allChecked = ackOptions.every((opt) => acknowledgements.includes(opt));

  // ✅ Utility: Remove null/empty/"N/A" values recursively
  const cleanObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj
        .map(cleanObject)
        .filter(
          (v) =>
            v !== null && v !== undefined && v !== "" && v !== "N/A"
        );
    }
    if (typeof obj === "object" && obj !== null) {
      const cleaned: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        const cleanedValue = cleanObject(value);
        if (
          cleanedValue !== null &&
          cleanedValue !== undefined &&
          cleanedValue !== "" &&
          cleanedValue !== "N/A" &&
          !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
          !(
            typeof cleanedValue === "object" &&
            Object.keys(cleanedValue).length === 0
          )
        ) {
          cleaned[key] = cleanedValue;
        }
      });
      return cleaned;
    }
    return obj;
  };

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error("Please check all acknowledgements before submitting.");
      return;
    }

    setLoading(true);

    try {
      // ---------------------------
      // ✅ Build AWS Accounts
      // ---------------------------
      const awsAccounts: { alias: string; orgName: string }[] = [];
      const awsAliases = (formData.awsAliases || {}) as AliasMap;

      Object.entries(awsAliases).forEach(([label, orgName]) => {
        if (orgName.trim() !== "") {
          awsAccounts.push({
            alias: `cloudsentrics-aws-${label}`,
            orgName,
          });
        }
      });

      // ---------------------------
      // ✅ Build STORAGE Accounts
      // ---------------------------
      const storageAccounts: { alias: string; orgName: string }[] = [];
      const storageAliases = (formData.storageAliases || {}) as AliasMap;

      Object.entries(storageAliases).forEach(([label, orgName]) => {
        if (orgName.trim() !== "") {
          storageAccounts.push({
            alias: `cloudsentrics-storage-${label}`,
            orgName,
          });
        }
      });

      // ---------------------------
      // ✅ Add extra aliases from bucketNote
      // ---------------------------
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

      const storageCount =
        formData.selectedStorageCount ?? storageAccounts.length;
      const awsCount = formData.selectedAwsCount ?? awsAccounts.length;

      // ---------------------------
      // ✅ Atlassian Document Format (ADF)
      // ---------------------------
      const descriptionContent: any[] = [];

      if (reporterEmail) {
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: `Reporter Email: ${reporterEmail}` }],
        });
      }

      // ✅ Determine request type safely (fixes AWS/Storage mix-up)
      const requestType = (formData.requestType || "").toLowerCase();
      const isAWS = requestType.includes("aws");


      // ✅ AWS section
      if (isAWS && awsAccounts.length > 0) {
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "AWS Account Summary" }],
        });
        descriptionContent.push({
          type: "paragraph",
          content: [
            { type: "text", text: `Number of AWS Account(s) Needed: ${awsCount}` },
          ],
        });
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "AWS Accounts:" }],
        });
        awsAccounts.forEach((acc) =>
          descriptionContent.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `- Alias: ${acc.alias} | Org: ${acc.orgName}`,
              },
            ],
          })
        );
      }

      // ✅ STORAGE section
      if (!isAWS && storageAccounts.length > 0) {
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "Storage Account Summary" }],
        });
        descriptionContent.push({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `Number of STORAGE Account(s) Needed: ${storageCount}`,
            },
          ],
        });
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "Storage Accounts:" }],
        });
        storageAccounts.forEach((acc) =>
          descriptionContent.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `- Alias: ${acc.alias} | Org: ${acc.orgName}`,
              },
            ],
          })
        );
      }

      // ---------------------------
      // 🆕 Change Request Details
      // ---------------------------
      const hasChangeData =
        formData.existingAccountId ||
        formData.existingStorageName ||
        (formData.changesRequested && formData.changesRequested.length > 0) ||
        formData.details;

      if (hasChangeData) {
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "Change Request Details:" }],
        });
        if (formData.existingAccountId)
          descriptionContent.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Existing Account ID: ${formData.existingAccountId}`,
              },
            ],
          });
        if (formData.existingStorageName)
          descriptionContent.push({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Existing Storage Name: ${formData.existingStorageName}`,
              },
            ],
          });
        (formData.changesRequested || []).forEach((change: string) => {
          if (change && change.trim() !== "")
            descriptionContent.push({
              type: "paragraph",
              content: [{ type: "text", text: `- ${change}` }],
            });
        });
        if (formData.details)
          descriptionContent.push({
            type: "paragraph",
            content: [
              { type: "text", text: `Additional Details: ${formData.details}` },
            ],
          });
      }

      // ---------------------------
      // ✅ Acknowledgements Section
      // ---------------------------
      if (acknowledgements.length > 0) {
        descriptionContent.push({
          type: "paragraph",
          content: [{ type: "text", text: "Acknowledgements:" }],
        });
        acknowledgements.forEach((ack) =>
          descriptionContent.push({
            type: "paragraph",
            content: [{ type: "text", text: `- ${ack} ✅` }],
          })
        );
      }

      descriptionContent.push({
        type: "paragraph",
        content: [
          { type: "text", text: `Date/Time: ${new Date().toISOString()}` },
        ],
      });

      const descriptionADF = {
        type: "doc",
        version: 1,
        content: descriptionContent,
      };

      // ---------------------------
// ✅ Final Payload (includes requestType)
// ---------------------------
const payload = cleanObject({
  title: formData.title || "Request from " + reporterEmail,
  reporterEmail,
  requestType: formData.requestType, // ✅ <-- ADD THIS LINE
  selectedTier: formData.selectedTier,
  awsAccounts,
  storageNames: formData.storageNames,
  acknowledgements,
  selectedStorageCount: formData.selectedStorageCount,
  bucketNote: formData.bucketNote,
  awsCountText: formData.awsCountText,
  accessList: formData.accessList,
  step4Data: formData.step4Data,
  existingAccountId: formData.existingAccountId,
  existingStorageName: formData.existingStorageName,
  changesRequested: formData.changesRequested,
  details: formData.details,
  descriptionADF,
});


      console.log("📤 Final Payload Sent:", payload);

      const res = await fetch(
        "https://api.onboardingportal.cloudsentrics.org/api/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Backend error:", data);
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success(
        `Request submitted successfully! Jira Issue: ${data.jiraIssueKey}`
      );
      setShowSuccess(true);
    } catch (error: any) {
      console.error("❌ Error submitting request:", error);
      toast.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success Screen
  if (showSuccess) return <SuccessScreen />;

  // ✅ UI
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

        {/* Acknowledgement checkboxes */}
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

        {/* Buttons */}
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
            className={`w-full sm:w-auto px-6 py-3 text-base sm:text-lg rounded-md transition ${allChecked && !loading
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
