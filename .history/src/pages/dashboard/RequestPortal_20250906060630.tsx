import { motion } from "framer-motion";
import React, { useState } from "react";

const RequestPortal = () => {
  const [bucketNote, setBucketNote] = useState("");
  const maxLength = 1500;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6"
      >
        Request Portal
      </motion.h2>

      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`w-5 h-5 rounded-full ${
                i < 4 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            {i < 4 && <div className="flex-1 h-1 bg-blue-600 mx-2" />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-xl shadow-lg"
      >
        {/* Request Type */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">
            REQUEST TYPE
          </h3>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Additional AWS Account(s)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" defaultChecked />
              <span>Storage(s)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Change to Existing Account or Storage(s) settings</span>
            </label>
          </div>
        </div>

        {/* Note */}
        <p className="text-sm text-gray-600 mb-4">
          Note: All Cloud Sentrics Storage comes by default with versioning and
          SSE-S3 encryption enabled. Additional settings may incur extra charges
          and will be reflected on your invoice.
        </p>

        {/* Storage Count */}
        <div className="flex items-center mb-4 space-x-4">
          <label className="font-medium">
            Number of Storages (Buckets) required:
          </label>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex items-center space-x-1">
              <input type="checkbox" className="form-checkbox" />
              <span>{n}</span>
            </label>
          ))}
          <input
            type="number"
            placeholder="Enter number if more than 5"
            className="ml-4 px-3 py-1 border border-gray-300 rounded-md text-sm w-56"
          />
        </div>

        {/* Bucket Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {["A", "B", "C", "D", "E", "F"].map((label) => (
            <div key={label}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {label}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm">
                  cloudcentrics-aws-
                </span>
                <input
                  type="text"
                  placeholder="Organization-Storage-Purpose-CustomerID"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* More Bucket Names */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter more Storage names if more than 6
          </label>
          <textarea
            rows={4}
            value={bucketNote}
            onChange={(e) => setBucketNote(e.target.value)}
            placeholder="cloudcentrics-[organization name-storage purpose-customer ID]."
            className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
            maxLength={maxLength}
          ></textarea>
          <div className="text-right text-xs text-gray-500 mt-1">
            {bucketNote.length}/{maxLength}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button className="px-6 py-2 bg-white border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100">
            Back
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Next →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestPortal;
