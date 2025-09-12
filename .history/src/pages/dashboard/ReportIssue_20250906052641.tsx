import { useState } from "react";
import { AlertTriangle } from "lucide-react";

const ReportIssue = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, category, description, file });
    // 🔗 Later: send this to backend API
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-800">Report an Issue</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of the issue"
            className="w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352]"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352]"
            required
          >
            <option value="">Select a category</option>
            <option value="bug">Bug / Error</option>
            <option value="ui">UI / Design</option>
            <option value="performance">Performance</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={5}
            className="w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352]"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach Screenshot / File (optional)
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full border rounded-lg px-4 py-2"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#032352] text-white px-6 py-2 rounded-lg hover:bg-[#021a3a] transition"
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;
