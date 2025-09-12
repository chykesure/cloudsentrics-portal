import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react"; // tick icon

interface StepProps {
    goNext: () => void;
    goBack: () => void;
}

const Step4 = ({ goNext, goBack }: StepProps) => {
    const [accessLogging, setAccessLogging] = useState<string | null>(null);
    const [lifecycle, setLifecycle] = useState<string | null>(null);
    const [customerKey, setCustomerKey] = useState<string | null>(null);
    const [retentionDays, setRetentionDays] = useState("");
    const [retentionMonths, setRetentionMonths] = useState("");
    const [transitionGlacier, setTransitionGlacier] = useState(false);
    const [transitionStandard, setTransitionStandard] = useState(false);

    // ✅ Reusable checkbox-like radio button
    const RadioCheck = ({
        label,
        selected,
        onClick,
    }: {
        label: string;
        selected: boolean;
        onClick: () => void;
    }) => (
        <div
            onClick={onClick}
            className="flex items-center gap-2 cursor-pointer select-none"
        >
            <div
                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all ${selected ? "bg-blue-600 border-blue-600" : "border-gray-400 bg-white"
                    }`}
            >
                {selected && <Check size={16} className="text-white" />}
            </div>
            <span className="text-lg">{label}</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl mx-auto"
        >
            {/* Request Type */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-3">REQUEST TYPE</h3>
                <div className="bg-[#fef7f2] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Select one or more</h4>
                    <div className="flex flex-col md:flex-row md:flex-wrap gap-6 text-lg">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5" />
                            <span>Additional AWS Account(s)</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5" defaultChecked />
                            <span>Storage(s)</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="w-5 h-5" />
                            <span>Change to Existing Account or Storage(s) settings</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Note */}
            <p className="text-sm text-gray-700 mb-8 leading-relaxed">
                Note: All Cloud Sentrics Storage comes by default with versioning and
                SSE-S3 encryption enabled. Addition settings may incur extra charges and
                will be reflected on your invoice.
            </p>

            {/* Two-Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Enable Access Logging */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Enable Access Logging (Recommended)
                    </h4>
                    <div className="flex gap-6">
                        <RadioCheck
                            label="Yes"
                            selected={accessLogging === "Yes"}
                            onClick={() => setAccessLogging("Yes")}
                        />
                        <RadioCheck
                            label="No"
                            selected={accessLogging === "No"}
                            onClick={() => setAccessLogging("No")}
                        />
                    </div>
                </div>

                {/* Enable Lifecycle Management */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Enable Lifecycle Management
                    </h4>
                    <div className="flex gap-6">
                        <RadioCheck
                            label="Yes"
                            selected={lifecycle === "Yes"}
                            onClick={() => setLifecycle("Yes")}
                        />
                        <RadioCheck
                            label="No"
                            selected={lifecycle === "No"}
                            onClick={() => setLifecycle("No")}
                        />
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Customer Managed Key */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Customer Managed Key
                    </h4>
                    <div className="flex gap-6">
                        <RadioCheck
                            label="Yes"
                            selected={customerKey === "Yes"}
                            onClick={() => setCustomerKey("Yes")}
                        />
                        <RadioCheck
                            label="No"
                            selected={customerKey === "No"}
                            onClick={() => setCustomerKey("No")}
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-600 italic">
                        Note: Additional Charges may apply for CMYK storage and usage
                    </p>
                </div>

                {/* Retention + Transition */}
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Retention Duration:
                    </h4>
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={retentionDays}
                            onChange={(e) => setRetentionDays(e.target.value)}
                            placeholder="Input no of days"
                            className="w-1/2 px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                            type="text"
                            value={retentionMonths}
                            onChange={(e) => setRetentionMonths(e.target.value)}
                            placeholder="Input no of months"
                            className="w-1/2 px-3 py-2 border rounded-md text-sm"
                        />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Transition Settings:
                    </h4>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={transitionGlacier}
                                onChange={() => setTransitionGlacier(!transitionGlacier)}
                            />
                            Move to Glacier after X days
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={transitionStandard}
                                onChange={() => setTransitionStandard(!transitionStandard)}
                            />
                            Move to Standard-IA after X days
                        </label>
                    </div>
                </div>
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

export default Step4;
