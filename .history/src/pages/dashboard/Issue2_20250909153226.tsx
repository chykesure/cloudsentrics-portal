import { useState } from "react";
import { motion } from "framer-motion";

interface StepProps {
    goNext: () => void;
    goBack: () => void;
}

const Issue2 = ({ goNext, goBack }: StepProps) => {
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [time, setTime] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    const categories = [
        "Storage Access",
        "Upload/Download",
        "File or Folder Not Found",
        "Permission Problem (Can't open or upload)",
        "Slow to Open or Download",
        "Unable to Access Account",
    ];

    // Generate years dynamically: from 2000 up to current year + 1
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1999 + 2 }, (_, i) => 2000 + i);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-gray-50 flex flex-col"
        >
            <div className="flex-1 w-full p-10 bg-white shadow-md">
                {/* Instruction */}
                <p className="mb-8 text-gray-700 text-lg leading-relaxed max-w-5xl">
                    If you are experiencing a problem with your Cloud Sentrics account or
                    storage, please fill out this form so our support team can assist you
                    quickly. Please provide as much detail as possible to help us resolve
                    your issue faster.
                </p>

                {/* ISSUE INFORMATION Section */}
                <div className="mb-12">
                    <h3 className="bg-orange-100 py-3 px-5 text-blue-900 font-semibold text-base rounded-md mb-6 uppercase tracking-wide">
                        Issue Information
                    </h3>

                    {/* Date Issue Started + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Date Issue Started */}
                        <div>
                            <label className="block text-base font-medium mb-2">
                                Date Issue Started
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                >
                                    <option value="">Day</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d}>{d}</option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />

                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    <option value="">Month</option>
                                    {[
                                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                                    ].map((m) => (
                                        <option key={m}>{m}</option>
                                    ))}
                                </select>

                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    <option value="">Year</option>
                                    {years.map((y) => (
                                        <option key={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-base font-medium mb-2">Category</label>
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select Issue Category</option>
                                {categories.map((cat) => (
                                    <option key={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    {/* Other Category */}
                    <div className="mb-6">
                        <label className="flex items-center space-x-3 cursor-pointer text-base font-medium mb-2">
                            <input
                                type="checkbox"
                                className="w-5 h-5 border-gray-400 rounded"
                                checked={category === "Other"}
                                onChange={(e) => setCategory(e.target.checked ? "Other" : "")}
                            />
                            <span>Other Category</span>
                        </label>

                        {/* Show textarea only if 'Other' is checked */}
                        {category === "Other" && (
                            <textarea
                                placeholder="Please specify the other category..."
                                className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full resize-none"
                                rows={4}
                                maxLength={1000}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Description of the Issue */}
                    <div>
                        <label className="block text-base font-medium mb-2">
                            Description of the Issue
                        </label>
                        <textarea
                            placeholder="Give the description of the issue you are having"
                            className="border border-gray-300 rounded-lg px-3 py-3 text-base w-full resize-none"
                            rows={6}
                            maxLength={5000}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {description.length}/5000
                        </div>
                    </div>

                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between max-w-5xl">
                    <button
                        onClick={goBack}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={goNext}
                        className="bg-[#032352] hover:bg-[#021a3d] text-white px-8 py-3 rounded-lg font-semibold shadow-md transition flex items-center"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Issue2;
