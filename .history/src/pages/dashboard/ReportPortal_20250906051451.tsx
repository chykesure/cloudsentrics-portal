import { motion } from "framer-motion";

const ReportPortal = () => {
  return (
    <div className="p-6">
      {/* Page Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-6"
      >
        Request Portal
      </motion.h2>

      {/* Example Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <p className="text-gray-600">
          This is the <span className="font-semibold">Request Portal</span> page.
        </p>
      </motion.div>
    </div>
  );
};

export default ReportPortal;
