// Step3.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react"; // for delete icon

interface StepProps {
  goNext: () => void;
  goBack: () => void;
}

const accessLevels = ["Read", "Write", "Both"];

const Step3 = ({ goNext, goBack }: StepProps) => {
  const [users, setUsers] = useState([
    { name: "", email: "", access: "" },
    { name: "", email: "", access: "" },
  ]);

  const handleUserChange = (index: number, field: string, value: string) => {
    const updatedUsers = [...users];
    (updatedUsers[index] as any)[field] = value;
    setUsers(updatedUsers);
  };

  const addMoreUser = () => {
    setUsers([...users, { name: "", email: "", access: "" }]);
  };

  const removeUser = (index: number) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl mx-auto"
    >
      {/* Request Type */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-blue-900 mb-4">
          REQUEST TYPE
        </h3>
        <div className="flex flex-wrap gap-6 text-lg">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" />
            <span>Additional AWS Account(s)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox w-5 h-5" defaultChecked />
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
      <div className="mb-10">
        <div className="bg-blue-100 px-4 py-3 rounded-t-md text-lg font-semibold text-blue-900 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>WHO REQUIRE ACCESS</span>
          <span className="text-sm font-normal text-gray-600">
            Tips: <strong>Read</strong> = View/download only.{" "}
            <strong>Write</strong> = Upload, Modify, delete.{" "}
            <strong>Both</strong> = Full Access
          </span>
        </div>

        {/* User Inputs without borders */}
        <div className="bg-white rounded-b-md">
          {users.map((user, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 items-end relative"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="E.g Ademola Ayodeji Johnson"
                  value={user.name}
                  onChange={(e) =>
                    handleUserChange(index, "name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="E.g cloudsentric@gmail.com"
                  value={user.email}
                  onChange={(e) =>
                    handleUserChange(index, "email", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg"
                />
              </div>

              {/* Access Level */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <select
                    value={user.access}
                    onChange={(e) =>
                      handleUserChange(index, "access", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg bg-white"
                  >
                    <option value="">Select Level</option>
                    {accessLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeUser(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add More Users */}
      <div className="text-center mb-10">
        <button
          onClick={addMoreUser}
          className="text-blue-600 font-medium text-lg hover:underline"
        >
          Add More +
        </button>
      </div>

      {/* Navigation */}
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
