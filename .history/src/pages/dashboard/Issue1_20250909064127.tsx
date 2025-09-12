import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
    goNext: () => void;
    goBack: () => void;
}

const Issue1 = ({ goNext, goBack }: StepProps) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");

    const [accountId, setAccountId] = useState("");
    const [bucketName, setBucketName] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto"
        >
            {/* Instruction */}
            <p className="mb-6 text-gray-800 text-base leading-relaxed">
                If you are a experiencing problem with your Cloud Sentrics account or storage, please fill out this form so our support team can assist your quickly. Please provide as much details as possible to help us resolve your issue faster.
            </p>

            {/* CUSTOMER INFORMATION Section */}
            <div>
                <div className="bg-orange-50 py-2 px-4 uppercase text-blue-900 font-semibold mb-2">
                    CUSTOMER INFORMATION
                </div>

                {/* Table header */}
                <div className="grid grid-cols-4 text-white bg-gray-800 text-xs font-semibold uppercase px-3 py-2">
                    <div className="border border-gray-700 flex items-center justify-center">FULL NAME</div>
                    <div className="border border-gray-700 flex items-center justify-center">EMAIL ADDRESS</div>
                    <div className="border border-gray-700 flex items-center justify-center">PHONE NUMBER</div>
                    <div className="border border-gray-700 flex items-center justify-center">COMPANY / ORGANIZATION NAME</div>
                </div>

                {/* Input fields */}
                <div className="grid grid-cols-4 gap-2 px-3 py-4 bg-gray-50">
                    <input
                        type="text"
                        placeholder="Enter full name"
                        className="border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Your email address"
                        className="border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="tel"
                        placeholder="Your phone number"
                        className="border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Company's Name"
                        className="border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                </div>
            </div>

            {/* SERVICE DETAILS Section */}
            <div className="mt-8">
                <div className="bg-orange-50 py-2 px-4 uppercase text-blue-900 font-semibold mb-4">
                    SERVICE DETAILS
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Account ID</label>
                    <input
                        type="text"
                        placeholder="Enter your account ID"
                        className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Storage / Bucket Name</label>
                    <input
                        type="text"
                        placeholder="Enter your Storage / Bucket Name"
                        className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm"
                        value={bucketName}
                        onChange={(e) => setBucketName(e.target.value)}
                    />
                </div>
            </div>

            {/* Next Button */}
            <div className="mt-10">
                <button
                    onClick={goNext}
                    className="w-full bg-[#032352] hover:bg-[#021a3d] text-white py-3 rounded-lg text-lg font-semibold"
                >
                    Next
                </button>
            </div>
        </motion.div>
    );
};

export default Issue1;
