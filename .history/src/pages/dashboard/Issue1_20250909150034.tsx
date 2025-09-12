import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
  goNext: () => void;
  goBack: () => void;
}

const Issue1 = ({ goNext }: StepProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [accountId, setAccountId] = useState("");
  const [bucketName, setBucketName] = useState("");

  const inputClass =
    "form-control w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-3xl"
    >
      {/* Instruction */}
      <p className="mb-8 text-gray-700 text-base leading-relaxed">
        If you are experiencing a problem with your CloudSentric account or
        storage, please fill out this form so our support team can assist you
        quickly. Provide as much detail as possible to help us resolve your
        issue faster.
      </p>

      {/* CUSTOMER INFORMATION Section */}
      <div className="mb-10">
        <h3 className="bg-orange-100 py-2 px-4 text-blue-900 font-semibold text-sm rounded-md mb-6">
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Company / Organization
            </label>
            <input
              type="text"
              placeholder="Enter company name"
              className={inputClass}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SERVICE DETAILS Section */}
      <div className="mb-10">
        <h3 className="bg-orange-100 py-2 px-4 text-blue-900 font-semibold text-sm rounded-md mb-6">
          Service Details
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Account ID</label>
          <input
            type="text"
            placeholder="Enter your account ID"
            className={inputClass}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Storage / Bucket Name
          </label>
          <input
            type="text"
            placeholder="Enter storage/bucket name"
            className={inputClass}
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
          />
        </div>
      </div>

      {/* Next Button */}
      <div>
        <button
          onClick={goNext}
          className="w-full bg-[#032352] hover:bg-[#021a3d] text-white py-3 rounded-lg text-lg font-semibold shadow-md transition"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Issue1;
