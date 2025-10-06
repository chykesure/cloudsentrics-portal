import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goBack: () => void;
}

const Step6 = ({ goBack }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const ackOptions = [
    "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
    "I understand that Cloud Sentrics may store my data outside my region",
    "I confirm the information provided is accurate and approve this request.",
  ];

  const toggleAck = (option: string) => {
    setAcknowledgements((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const allChecked = ackOptions.every((opt) => acknowledgements.includes(opt));

  // 🚀 Submit handler
  const handleSubmit = async () => {
    if (!allChecked) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if JWT
        },
        body: JSON.stringify({
          acknowledgements,
          // You can also pass step1 data here (e.g. awsAliases, storageCount) 
          // from your context or parent component
        }),
      });

      if (!res.ok) throw new Error("Failed to submit request");

      const data = await res.json();
      console.log("✅ Saved:", data);

      alert("Request submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Error submitting request");
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
      {/* Main Wrapper */}
      <div className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 bg-white shadow-md">
        {/* Acknowledgement Title */}
        <div className="bg-blue-100 px-3 py-2 text-base sm:text-lg font-semibold text-blue-900 rounded-md mb-6">
          ACKNOWLEDGEMENT
        </div>

        {/* Acknowledgement Options */}
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

        {/* Navigation Buttons */}
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
