import { useState } from "react";
import { Link } from "react-router-dom";
import { FileUp } from "lucide-react";

export default function NewFundRequestPage() {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    purpose: "",
    priorityLevel: "Medium",
    justification: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">New Fund Request</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit a new request for operational or emergency funds for your
          branch.
        </p>
      </div>

      {/* ─── Branch Information ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
            Branch Information
          </h2>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch Name */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1.5">
              Branch Name
            </p>
            <p className="text-sm font-semibold text-navy-900">
              Lagos Mainland
            </p>
          </div>

          {/* Branch Code */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1.5">
              Branch Code
            </p>
            <p className="text-sm font-semibold text-navy-900">LMB001</p>
          </div>

          {/* Requester Name */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1.5">
              Requester Name
            </p>
            <p className="text-sm font-semibold text-navy-900">John Doe</p>
          </div>
        </div>
      </div>

      {/* ─── Request Details ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
            Request Details
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            {/* Amount Requested */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Amount Requested
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  ₦
                </span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">Select Category</option>
                <option value="office-renovation">Office Renovation</option>
                <option value="equipment">Equipment Purchase</option>
                <option value="operations">Operations</option>
                <option value="maintenance">Maintenance</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Purpose / Subject */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Purpose / Subject
              </label>
              <input
                type="text"
                placeholder="Briefly state the reason"
                value={form.purpose}
                onChange={(e) => update("purpose", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Priority Level
              </label>
              <select
                value={form.priorityLevel}
                onChange={(e) => update("priorityLevel", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Detailed Explanation & Justification */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Detailed Explanation &amp; Justification
            </label>
            <textarea
              rows={4}
              placeholder="Provide a detailed breakdown of the required funds and why they are needed at this time."
              value={form.justification}
              onChange={(e) => update("justification", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ─── Supporting Documents ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
            Supporting Documents
          </h2>
        </div>

        <div className="px-6 py-6">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
            <FileUp className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-navy-900">
              Drag and drop invoices, quotes, or receipts here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or{" "}
              <span className="text-navy-900 font-semibold underline">
                browse files
              </span>{" "}
              to
            </p>
            <p className="text-sm text-gray-400">upload</p>
            <p className="text-xs text-blue-500 mt-2">
              PDF, JPG, PNG (MAX 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="flex items-center justify-between pb-4">
        <Link to="/finance/fund-requests" className="text-sm font-medium text-navy-900 hover:text-gray-600 transition-colors">
          Cancel
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 border border-navy-900 rounded-xl text-sm font-semibold text-navy-900 hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
