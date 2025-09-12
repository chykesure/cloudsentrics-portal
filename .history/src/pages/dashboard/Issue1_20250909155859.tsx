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
        "form-control w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gray-50 flex flex-col"
        >
            {/* Container */}
            <div className="flex-1 w-full p-10 bg-white shadow-md">
                {/* Instruction */}
                <p className="mb-10 text-gray-700 text-lg leading-relaxed max-w-5xl">
                    If you are experiencing a problem with your CloudSentric account or
                    storage, please fill out this form so our support team can assist you
                    quickly. Provide as much detail as possible to help us resolve your
                    issue faster.
                </p>

                {/* CUSTOMER INFORMATION Section */}
                <div className="mb-12">
                    <h3 className="bg-orange-100 py-3 px-5 text-blue-900 font-semibold text-base rounded-md mb-6 uppercase tracking-wide">
                        Customer Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter full name"
                                className={inputClass}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={inputClass}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
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
                            <label className="block text-sm font-medium mb-2">
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
                <div className="mb-12">
                    <h3 className="bg-orange-100 py-3 px-5 text-blue-900 font-semibold text-base rounded-md mb-6 uppercase tracking-wide">
                        Service Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                        <div>
                            <label className="block text-sm font-medium mb-2">Account ID</label>
                            <input
                                type="text"
                                placeholder="Enter your account ID"
                                className={inputClass}
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
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
                </div>

                {/* Next Button */}
                <div className="max-w-5xl">
                    <button
                        onClick={goNext}
                        className="w-full bg-[#032352] hover:bg-[#021a3d] text-white py-4 rounded-lg text-lg font-semibold shadow-lg transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Issue1;
