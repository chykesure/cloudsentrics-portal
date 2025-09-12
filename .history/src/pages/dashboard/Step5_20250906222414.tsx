// Step5.tsx
import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goBack: () => void;
  onSubmit: () => void;
}

const Step5 = ({ goBack, onSubmit }: StepProps) => {
  const [acknowledgements, setAcknowledgements] = useState<string[]>([]);

  const ackOptions = [
    "I understand additional settings such as CMYK or life cycle transitions may incur additional charges",
    "I understand that Cloud Sentrics may store my data outside my local region",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto"
    >
      {/* Acknowledgement Title */}
      <div className="bg-blue-100 px-4 py-2 text-lg font-semibold text-blue-900 rounded-md mb-6">
        ACKNOWLEDGEMENT
      </div>

      {/* Acknowledgement Options */}
      <div className="space-y-4 text-lg text-gray-800 mb-10">
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
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="px-8 py-3 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!allChecked}
          className={`px-8 py-3 text-lg rounded-md transition ${
            allChecked
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit Request
        </button>
      </div>
    </motion.div>
  );
};

export default Step5;
