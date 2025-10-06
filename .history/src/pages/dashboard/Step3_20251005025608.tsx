import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { StepProps } from "../dashboard/types";

interface AccessRow {
  fullName: string;
  email: string;
  accessLevel: string;
}

const Step3 = ({ goBack, jumpToStep }: StepProps) => {
  const [rows, setRows] = useState<AccessRow[]>([
    { fullName: "", email: "", accessLevel: "" },
  ]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accessOptions = ["Read", "Write", "Read/Write"];

  // ✅ Revalidate whenever rows change
  useEffect(() => {
    const allFilled = rows.every(
      (row) =>
        row.fullName.trim() !== "" &&
        row.email.trim() !== "" &&
        row.accessLevel.trim() !== ""
    );
    setIsFormComplete(allFilled);
  }, [rows]);

  // ✅ Handle change
  const handleChange = (index: number, field: keyof AccessRow, value: string) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // ✅ Add/remove rows
  const addRow = () => setRows([...rows, { fullName: "", email: "", accessLevel: "" }]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 px-2 sm:px-4 pt-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-4 sm:p-8 md:p-10 rounded-lg md:rounded-2xl shadow-xl w-full max-w-7xl"
      >
        {/* REQUEST TYPE */}
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
            REQUEST TYPE
          </h3>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4 text-lg md:text-xl">
            <label className="flex items-center space-x-2 cursor-not-allowed opacity-60">
              <input type="checkbox" className="w-6 h-6" disabled />
              <span>Additional AWS Account(s)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input type="checkbox" className="w-6 h-6" checked readOnly />
              <span>Storage(s)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-not-allowed opacity-60">
              <input type="checkbox" className="w-6 h-6" disabled />
              <span>Change to Existing Account or Storage(s) settings</span>
            </label>
          </div>
        </div>

        {/* INFO NOTE */}
        <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
          Note: All Cloud Sentrics Storage comes by default with versioning and
          SSE-S3 encryption enabled. Additional settings may incur extra charges
          and will be reflected on your invoice.
        </p>

        {/* WHO REQUIRE ACCESS */}
        <div className="mb-10">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-4">
            WHO REQUIRE ACCESS
          </h3>
          <p className="text-sm md:text-md text-gray-600 mb-4">
            Tips: <b>Read</b> = View/download only. <b>Write</b> = Upload, modify, delete.{" "}
            <b>Read/Write</b> = Full access.
          </p>

          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center border-b pb-4"
              >
                {/* Full Name */}
                <div className="md:col-span-4">
                  <input
                    type="text"
                    placeholder="Eg Polycarp Chike"
                    value={row.fullName}
                    onChange={(e) => handleChange(index, "fullName", e.target.value)}
                    className="w-full px-3 py-2 md:px-4 border border-gray-300 rounded-md text-base md:text-lg"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-5">
                  <input
                    type="email"
                    placeholder="Eg sola@gmail.com"
                    value={row.email}
                    onChange={(e) => handleChange(index, "email", e.target.value)}
                    className="w-full px-3 py-2 md:px-4 border border-gray-300 rounded-md text-base md:text-lg"
                  />
                </div>

                {/* Access Level Dropdown */}
                <div className="md:col-span-2 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                    className="flex items-center justify-between w-full px-3 py-2 md:px-4 bg-[#032352] text-white rounded-md text-base md:text-lg"
                  >
                    {row.accessLevel || "Select Level"}
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  </button>

                  {openDropdown === index && (
                    <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                      {accessOptions.map((option) => (
                        <div
                          key={option}
                          className="px-3 py-2 md:px-4 text-gray-700 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            handleChange(index, "accessLevel", option);
                            setOpenDropdown(null);

                            // ✅ Force revalidation immediately after selecting a level
                            setTimeout(() => {
                              const allFilled = rows.every(
                                (r) =>
                                  r.fullName.trim() !== "" &&
                                  r.email.trim() !== "" &&
                                  (r.accessLevel.trim() !== "" || (r === rows[index] && option))
                              );
                              setIsFormComplete(allFilled);
                            }, 0);
                          }}

                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add More */}
          <button
            type="button"
            onClick={addRow}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            + Add More
          </button>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between mt-12">
          <button
            onClick={goBack}
            className="px-6 md:px-10 py-2 md:py-3 bg-white border border-gray-400 rounded-md text-base md:text-xl text-gray-700 hover:bg-gray-100"
          >
            ← Back
          </button>

          <button
            onClick={() => {
              if (isFormComplete) jumpToStep?.(4);
            }}
            disabled={!isFormComplete}
            className={`px-6 md:px-10 py-2 md:py-3 text-base md:text-xl rounded-md transition ${isFormComplete
                ? "bg-[#032352] text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Next →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step3;
