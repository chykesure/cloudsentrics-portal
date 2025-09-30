import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "./types";

const Issue2 = ({ goNext, goBack, formData, setFormData }: StepProps) => {
  const [date, setDate] = useState(formData.date || "");
  const [time, setTime] = useState(formData.time || "");
  const [category, setCategory] = useState(formData.category || "");
  const [description, setDescription] = useState(formData.description || "");
  const [otherCategoryDesc, setOtherCategoryDesc] = useState(formData.otherCategoryDesc || "");

  const categories = [
    "Storage Access",
    "Upload/Download",
    "File or Folder Not Found",
    "Permission Problem (Can't open or upload)",
    "Slow to Open or Download",
    "Unable to Access Account",
    "Other",
  ];

  const inputClass =
    "border border-gray-300 rounded-lg px-3 py-3 text-base w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  // Validate form fields
  const isValid =
    date &&
    time &&
    category &&
    (category === "Other" ? otherCategoryDesc.trim().length > 0 : description.trim().length > 0);

  // Sync state with formData on change
  useEffect(() => {
    setFormData({
      ...formData,
      date,
      time,
      category,
      description,
      otherCategoryDesc,
    });
  }, [date, time, category, description, otherCategoryDesc]);

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
          Please provide detailed information about the issue you are facing with your CloudSentric account or storage.
        </p>

        {/* ISSUE INFORMATION Section */}
        <div className="mb-12">
          <h3 className="bg-orange-100 py-3 px-5 text-blue-900 font-semibold text-lg sm:text-xl rounded-md mb-6 uppercase tracking-wide">
            Issue Information
          </h3>

          {/* Date & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">
                Date Issue Started
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
                <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium mb-2">Category</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select Issue Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Other Category Field */}
          {category === "Other" && (
            <div className="mb-6">
              <textarea
                placeholder="Please specify the other category..."
                className={`${inputClass} resize-none`}
                rows={4}
                maxLength={1000}
                value={otherCategoryDesc}
                onChange={(e) => setOtherCategoryDesc(e.target.value)}
              />
              <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
                {otherCategoryDesc.length}/1000
              </div>
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-sm sm:text-base font-medium mb-2">Description of the Issue</label>
            <textarea
              placeholder="Give the description of the issue you are having"
              className={`${inputClass} resize-none`}
              rows={6}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">{description.length}/5000</div>
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
            disabled={!isValid}
            className={`w-full sm:w-auto text-white px-8 py-3 rounded-lg font-semibold shadow-md transition flex items-center justify-center ${
              isValid ? "bg-[#032352] hover:bg-[#021a3d]" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Issue2;
