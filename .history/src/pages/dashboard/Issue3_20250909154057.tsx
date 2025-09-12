import { useState } from "react";
import { motion } from "framer-motion";
import { Image } from "lucide-react"; // icon for upload

interface Issue3Props {
  goBack: () => void;
  onSubmit: () => void;
}

const Issue3 = ({ goBack, onSubmit }: Issue3Props) => {
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [confirm, setConfirm] = useState(false);

  const maxLength = 500;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto"
    >
      {/* Instruction */}
      <p className="mb-6 text-gray-800 text-base leading-relaxed">
        If you are a experiencing problem with your Cloud Sentrics account or
        storage, please fill out this form so our support team can assist your
        quickly. Please provide as much details as possible to help us resolve
        your issue faster.
      </p>

      {/* ADDITIONAL DETAILS Section */}
      <div>
        <div className="bg-orange-50 py-2 px-4 uppercase text-blue-900 font-semibold mb-4">
          ADDITIONAL DETAILS
        </div>

        {/* Steps textarea */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Steps Taken Before this Report (Optional)
          </label>
          <textarea
            placeholder="State the steps taken before filling the report form"
            className="w-full border border-gray-400 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows={4}
            maxLength={maxLength}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
          />
          <div className="text-right text-xs text-gray-500">
            {steps.length}/{maxLength}
          </div>
        </div>

        {/* File upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Attach Screenshot or Error Message
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl p-10 cursor-pointer hover:bg-gray-50">
            <Image className="w-12 h-12 text-gray-500 mb-2" />
            <span className="text-blue-700 font-medium">
              {image ? image.name : "Upload Image or drag and drop image here"}
            </span>
            <span className="text-xs text-gray-500 mt-1">
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
        <div className="flex items-center mb-8">
          <input
            type="checkbox"
            checked={confirm}
            onChange={() => setConfirm(!confirm)}
            className="w-4 h-4 border-gray-400 rounded mr-2"
          />
          <span className="text-sm text-gray-700">
            I confirm that the details provided are accurate to the best of my
            knowledge
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={goBack}
          className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 py-3 rounded-lg text-base font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!confirm}
          className={`flex-1 py-3 rounded-lg text-base font-semibold ${
            confirm
              ? "bg-[#032352] hover:bg-[#021a3d] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>
    </motion.div>
  );
};

export default Issue3;
