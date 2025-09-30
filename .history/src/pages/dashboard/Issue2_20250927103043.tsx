// Issue2.tsx
import { useState } from "react";
import { motion } from "framer-motion";

type StepProps = {
  goNext: () => void;
  goBack: () => void;
  formData: {
    title: string;
    description: string;
    priority: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      priority: string;
    }>
  >;
};


const Issue2 = ({ goNext, goBack }: StepProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const categories = [
    "Storage Access",
    "Upload/Download",
    "File or Folder Not Found",
    "Permission Problem (Can't open or upload)",
    "Slow to Open or Download",
    "Unable to Access Account",
  ];

  const inputClass =
    "border border-gray-300 rounded-lg px-3 py-3 text-base w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 bg-white shadow-md rounded-lg">
        {/* Instruction */}
        <p className="mb-8 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
          If you are experiencing a problem with your CloudSentric account or
          storage, please fill out this form so our support team can assist you
          quickly. Provide as much detail as possible to help us resolve your
          issue faster.
        </p>

        {/* ISSUE INFORMATION Section */}
        <div className="mb-12">
          <h3 className="bg-orange-100 py-3 px-5 text-blue-900 font-semibold text-lg sm:text-xl rounded-md mb-6 uppercase tracking-wide">
            Issue Information
          </h3>

          {/* Date Issue Started + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date Issue Started */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Date Issue Started
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Picker */}
                <input
                  type="date"
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />

                {/* Time Picker */}
                <input
                  type="time"
                  className={inputClass}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Category
              </label>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Issue Category</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Other Category */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer text-sm sm:text-base font-medium mb-2">
              <input
                type="checkbox"
                className="w-5 h-5 border-gray-400 rounded"
                checked={category === "Other"}
                onChange={(e) => setCategory(e.target.checked ? "Other" : "")}
              />
              <span>Other Category</span>
            </label>

            {category === "Other" && (
              <textarea
                placeholder="Please specify the other category..."
                className="border border-gray-300 rounded-lg px-3 py-3 text-sm sm:text-base w-full resize-none"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </div>

          {/* Description of the Issue */}
          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">
              Description of the Issue
            </label>
            <textarea
              placeholder="Give the description of the issue you are having"
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm sm:text-base w-full resize-none"
              rows={6}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {description.length}/5000
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
          <button
            onClick={goBack}
            className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            className="w-full sm:w-auto bg-[#032352] hover:bg-[#021a3d] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition flex items-center justify-center"
          >
            Next →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Issue2;
