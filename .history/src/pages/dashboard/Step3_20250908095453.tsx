import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
}

interface AccessRow {
  fullName: string;
  email: string;
  accessLevel: string;
}

const Step3 = ({ goNext, goBack }: StepProps) => {
  const [rows, setRows] = useState<AccessRow[]>([
    { fullName: "", email: "", accessLevel: "" },
    { fullName: "", email: "", accessLevel: "" },
    { fullName: "", email: "", accessLevel: "" },
    { fullName: "", email: "", accessLevel: "" },
  ]);

  const handleChange = (
    index: number,
    field: keyof AccessRow,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { fullName: "", email: "", accessLevel: "" }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl mx-auto"
    >
      {/* Request Type */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-blue-900 mb-4">
          REQUEST TYPE
        </h3>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-lg">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" />
            <span>Additional AWS Account(s)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5"
              defaultChecked
            />
            <span>Storage(s)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" />
            <span>Change to Existing Account or Storage(s) settings</span>
          </label>
        </div>
      </div>

      {/* Info Note */}
      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
        Note: All Cloud Sentrics Storage comes by default with versioning and
        SSE-S3 encryption enabled. Additional settings may incur extra charges
        and will be reflected on your invoice.
      </p>

      {/* Who Require Access */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          WHO REQUIRE ACCESS
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Tips: <b>Read</b> = View/download only. <b>Write</b> = Upload, Modify,
          delete. <b>Both</b> = Full Access
        </p>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              {/* Full Name */}
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Eg Ademola Ayodeji Johnson"
                  value={row.fullName}
                  onChange={(e) =>
                    handleChange(index, "fullName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-5">
                <input
                  type="email"
                  placeholder="Eg cloudsentric@gmail.com"
                  value={row.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg"
                />
              </div>

              {/* Access Level */}
              <div className="md:col-span-3">
                <select
                  value={row.accessLevel}
                  onChange={(e) =>
                    handleChange(index, "accessLevel", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg bg-white"
                >
                  <option value="">Select Level</option>
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Button */}
        <button
          type="button"
          onClick={addRow}
          className="mt-4 text-blue-600 font-medium hover:underline"
        >
          + Add More
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={goBack}
          className="px-8 py-3 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          className="px-8 py-3 bg-[#032352] text-white text-lg rounded-md hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
};

export default Step3;
