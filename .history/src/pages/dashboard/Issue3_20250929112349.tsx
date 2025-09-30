import { motion } from "framer-motion";
import type { StepProps } from "./types";
import { Image } from "lucide-react";
import { useState } from "react";

const Issue3 = ({ goBack, formData, setFormData }: StepProps) => {
  const [submitting, setSubmitting] = useState(false);
  const maxLength = 500;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  // Submit form data to backend
  const handleSubmit = async () => {
    if (!formData.confirm) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      for (const key in formData) {
        const value = formData[key as keyof typeof formData];
        if (value !== null && value !== undefined) {
          payload.append(key, value instanceof File ? value : String(value));
        }
      }

      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        body: payload,
      });

      const result = await res.json();
      console.log("Report submitted:", result);
      alert("Report submitted successfully!");
      // Optionally reset form or navigate
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 bg-white shadow-md rounded-lg">
        <p className="mb-6 text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
          Please provide additional details about the issue you are experiencing
          with your CloudSentric account or storage.
        </p>

        <div>
          <div className="bg-orange-100 py-3 px-5 uppercase text-blue-900 font-semibold text-lg sm:text-xl rounded-md mb-6 tracking-wide">
            Additional Details
          </div>

          {/* Steps */}
          <div className="mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2">
              Steps Taken Before this Report (Optional)
            </label>
            <textarea
              placeholder="State the steps taken before filling the report form"
              className="w-full border border-gray-400 rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows={4}
              maxLength={maxLength}
              value={formData.steps}
              onChange={(e) =>
                setFormData({ ...formData, steps: e.target.value })
              }
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {formData.steps?.length || 0}/{maxLength}
            </div>
          </div>

          {/* File upload */}
          <div className="mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2">
              Attach Screenshot or Error Message
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-8 sm:p-12 cursor-pointer hover:bg-gray-50 text-center">
              <Image className="w-12 h-12 sm:w-14 sm:h-14 text-gray-500 mb-3" />
              <span className="text-blue-700 font-medium text-sm sm:text-base">
                {formData.image ? formData.image.name : "Upload or drag and drop image here"}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 mt-1">
                Supports JPEG and PNG
              </span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Checkbox */}
          <div className="flex items-start mb-10">
            <input
              type="checkbox"
              checked={formData.confirm}
              onChange={() =>
                setFormData({ ...formData, confirm: !formData.confirm })
              }
              className="w-5 h-5 border-gray-400 rounded mt-1 mr-3"
            />
            <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
              I confirm that the details provided are accurate to the best of my knowledge
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={goBack}
            className="w-full sm:w-auto flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 py-4 rounded-lg text-base sm:text-lg font-semibold"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.confirm || submitting}
            className={`w-full sm:w-auto flex-1 py-4 rounded-lg text-base sm:text-lg font-semibold transition ${
              formData.confirm
                ? "bg-[#032352] hover:bg-[#021a3d] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Issue3;
