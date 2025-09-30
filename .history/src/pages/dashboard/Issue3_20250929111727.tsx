import { useState } from "react";
import { motion } from "framer-motion";
import type { StepProps } from "./types";

const Issue3 = ({ goNext, goBack, formData, setFormData }: StepProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const inputClass =
    "border border-gray-300 rounded-lg px-3 py-3 text-base w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
          Please provide any additional steps you’ve taken and optionally upload a screenshot or file that illustrates the issue.
        </p>

        {/* STEPS TAKEN */}
        <div className="mb-8">
          <label className="block text-sm sm:text-base font-medium mb-2">
            Steps Taken
          </label>
          <textarea
            placeholder="Describe steps you took..."
            className={inputClass + " resize-none"}
            rows={6}
            value={formData.steps}
            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div className="mb-8">
          <label className="block text-sm sm:text-base font-medium mb-2">
            Upload Screenshot / File (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-64 h-auto border border-gray-300 rounded-md"
            />
          )}
        </div>

        {/* CONFIRMATION */}
        <div className="mb-8 flex items-center gap-3">
          <input
            type="checkbox"
            id="confirm"
            checked={formData.confirm}
            onChange={(e) => setFormData({ ...formData, confirm: e.target.checked })}
            className="w-5 h-5"
          />
          <label htmlFor="confirm" className="text-sm sm:text-base">
            I confirm that the information provided is accurate
          </label>
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
            disabled={!formData.confirm}
            className={`w-full sm:w-auto bg-[#032352] hover:bg-[#021a3d] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition flex items-center justify-center ${
              formData.confirm ? "" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Submit →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Issue3;
