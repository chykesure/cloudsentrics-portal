// src/onboarding/Step6.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "../dashboard/types";
import toast from "react-hot-toast";
import SuccessScreen from "./SuccessScreen";

const Step6 = ({ goBack, formData }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>(formData?.acknowledgements || []);
  const [loading, setLoading] = useState(false);
  const [reporterEmail, setReporterEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const ackOptions = [
    "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
    "I understand that Cloud Sentrics may store my data outside my region",
    "I confirm the information provided is accurate and approve this request.",
  ];

  // Load reporter email
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setReporterEmail(user.companyEmail || "N/A");
    }
  }, []);

  const toggleAck = (option: string) => {
    setAcknowledgements(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const allChecked = ackOptions.every(opt => acknowledgements.includes(opt));

  const handleSubmit = async () => {
    if (!allChecked) {
      toast.error("Please check all acknowledgements before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Build AWS accounts (including extra aliases)
      const awsAccounts: { alias: string; orgName: string }[] = [];
      Object.entries(formData.awsAliases || {}).forEach(([label, orgName]) => {
        if (orgName.trim() !== "") {
          awsAccounts.push({ alias: `cloudsentrics-aws-${label}`, orgName });
        }
      });

      if (formData.bucketNote?.trim()) {
        formData.bucketNote
          .split("\n")
          .map(line => line.trim())
          .filter(line => line !== "")
          .forEach((alias, i) => awsAccounts.push({ alias: `cloudsentrics-aws-extra-${i + 1}`, orgName: alias }));
      }

      const awsCount = formData.selectedStorageCount ?? awsAccounts.length;

      // Build Jira ADF content
      const accessListContent =
        formData.accessList?.length > 0
          ? formData.accessList.map(user => ({
              type: "paragraph",
              content: [{ type: "text", text: `- ${user.fullName} (${user.email}) — Access: ${user.accessLevel}` }],
            }))
          : [{ type: "paragraph", content: [{ type: "text", text: "No access list provided" }] }];

      const step4Content = formData.step4Data
        ? [
            { type: "paragraph", content: [{ type: "text", text: `File Sharing: ${formData.step4Data.fileSharing || "N/A"}` }] },
            { type: "paragraph", content: [{ type: "text", text: `File Options: ${formData.step4Data.fileOptions?.join(", ") || "None"}` }] },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `OTP Plan: ${Object.entries(formData.step4Data.otpPlan || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "N/A"}`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Custom OTP: ${Object.entries(formData.step4Data.customOtp || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "N/A"}`,
                },
              ],
            },
            { type: "paragraph", content: [{ type: "text", text: `Lifecycle: ${formData.step4Data.lifecycle || "N/A"}` }] },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Retention: ${formData.step4Data.retentionDays || "0"} days, ${formData.step4Data.retentionMonths || "0"} months`,
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `Transition: Glacier=${formData.step4Data.transitionGlacier}, Standard=${formData.step4Data.transitionStandard}`,
                },
              ],
            },
          ]
        : [{ type: "paragraph", content: [{ type: "text", text: "No Step4 configuration provided" }] }];

      const ackContent =
        acknowledgements.length > 0
          ? acknowledgements.map(ack => ({ type: "paragraph", content: [{ type: "text", text: `✅ ${ack}` }] }))
          : [{ type: "paragraph", content: [{ type: "text", text: "No acknowledgements" }] }];

      const descriptionADF = {
        type: "doc",
        version: 1,
        content: [
          { type: "paragraph", content: [{ type: "text", text: `Reporter Email: ${reporterEmail}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Title: ${formData.title || "Request"}` }] },
          { type: "paragraph", content: [{ type: "text", text: `Selected Storage Count: ${awsCount}` }] },
          {
            type: "expand",
            attrs: { title: "AWS Accounts" },
            content: awsAccounts.map(acc => ({
              type: "paragraph",
              content: [{ type: "text", text: `- Alias: ${acc.alias} | Org: ${acc.orgName}` }],
            })),
          },
          { type: "expand", attrs: { title: "Access List" }, content: accessListContent },
          { type: "expand", attrs: { title: "Step4 Configuration" }, content: step4Content },
          { type: "expand", attrs: { title: "Acknowledgements" }, content: ackContent },
          { type: "paragraph", content: [{ type: "text", text: `Created At: ${new Date().toISOString()}` }] },
        ],
      };

      // Build payload for backend
      const payload = {
        title: formData.title || "Request from " + reporterEmail,
        reporterEmail,
        awsAccounts,
        selectedStorageCount: formData.selectedStorageCount,
        bucketNote: formData.bucketNote,
        awsCountText: formData.awsCountText,
        accessList: formData.accessList,
        step4Data: formData.step4Data,
        acknowledgements,
        descriptionADF,
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
        throw new Error(data.message || "Failed to submit request");
      }

      toast.success(`Request submitted successfully! Jira Issue: ${data.jiraKey}`);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(`Error submitting request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) return <SuccessScreen />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 bg-white shadow-md">
        <div className="bg-blue-100 px-3 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md mb-6">ACKNOWLEDGEMENTS</div>
        <div className="space-y-4 text-base sm:text-lg text-gray-800 mb-10">
          {ackOptions.map(option => (
            <label key={option} className="flex items-start space-x-3">
              <input type="checkbox" className="form-checkbox mt-1 w-5 h-5" checked={acknowledgements.includes(option)} onChange={() => toggleAck(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <button onClick={goBack} className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-400 rounded-md text-base sm:text-lg text-gray-700 hover:bg-gray-100">← Back</button>
          <button
            onClick={handleSubmit}
            disabled={!allChecked || loading}
            className={`w-full sm:w-auto px-6 py-3 text-base sm:text-lg rounded-md transition ${allChecked && !loading ? "bg-[#032352] text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Step6;
