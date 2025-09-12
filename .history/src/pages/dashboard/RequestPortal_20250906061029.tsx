import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RequestPortal = () => {
  const [bucketNote, setBucketNote] = useState("");
  const maxLength = 1500;

  return (
    <div className="min-h-screen w-full bg-gray-50 p-10">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-gray-800"
      >
        Request Portal
      </motion.h2>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className={`w-6 h-6 rounded-full ${i < 4 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            {i < 4 && <div className="flex-1 h-1 bg-blue-600 mx-2" />}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 rounded-xl shadow-lg w-full max-w-6xl mx-auto"
      >
        {/* Request Type */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-blue-900 mb-4">REQUEST TYPE</h3>
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
          Note: All Cloud Sentrics Storage comes by default with versioning and SSE-S3 encryption enabled.
          Additional settings may incur extra charges and will be reflected on your invoice.
        </p>

        {/* Storage Count */}
        <div className="flex flex-wrap items-center mb-8 gap-4 text-lg">
          <label className="font-medium">Number of Storages (Buckets) required:</label>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox w-5 h-5" />
              <span>{n}</span>
            </label>
          ))}
          <input
            type="number"
            placeholder="More than 5"
            className="ml-4 px-4 py-2 border border-gray-300 rounded-md text-lg w-64"
          />
        </div>

        {/* Bucket Name Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((label) => (
            <div key={label}>
              <label className="text-lg font-medium text-gray-700 mb-2 block">
                {label}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-lg">
                  cloudcentrics-aws-
                </span>
                <input
                  type="text"
                  placeholder="Organization-Storage-Purpose-CustomerID"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md text-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Storage Textarea */}
        <div className="mb-10">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Enter more Storage names if more than 6
          </label>
          <textarea
            rows={5}
            value={bucketNote}
            onChange={(e) => setBucketNote(e.target.value)}
            placeholder="cloudcentrics-[organization name-storage purpose-customer ID]."
            className="w-full p-4 border border-gray-300 rounded-md text-lg resize-none"
            maxLength={maxLength}
          ></textarea>
          <div className="text-right text-md text-gray-500 mt-1">
            {bucketNote.length}/{maxLength}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          <button className="px-8 py-3 bg-white border border-gray-400 rounded-md text-lg text-gray-700 hover:bg-gray-100">
            ← Back
          </button>
          <button className="px-8 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700">
            Next →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RequestPortal;
