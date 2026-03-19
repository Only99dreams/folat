import { useState } from "react";
import {
  Search,
  CalendarDays,
  Send,
  UploadCloud,
} from "lucide-react";

export default function LeaveRequestFormPage() {
  const [form, setForm] = useState({
    staffName: "John Doe (EMP-042)",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Leave Request Form
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Please fill out the details below to submit your leave application.
        </p>
      </div>

      {/* ─── Leave Balance Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Annual Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Annual Balance
          </p>
          <p className="text-2xl font-bold text-navy-900">
            14 <span className="text-sm font-medium text-gray-400">Days</span>
          </p>
        </div>

        {/* Sick Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Sick Balance
          </p>
          <p className="text-2xl font-bold text-navy-900">
            08 <span className="text-sm font-medium text-gray-400">Days</span>
          </p>
        </div>

        {/* Casual Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Casual Balance
          </p>
          <p className="text-2xl font-bold text-navy-900">
            03 <span className="text-sm font-medium text-gray-400">Days</span>
          </p>
        </div>
      </div>

      {/* ─── Application Details Section Header ─── */}
      <div className="bg-navy-900 rounded-t-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-white" />
          <h2 className="text-base font-bold text-white">
            Application Details
          </h2>
        </div>
        <span className="px-3 py-1 rounded text-[10px] font-bold tracking-wider bg-white/20 text-white">
          DRAFT
        </span>
      </div>

      {/* ─── Form Card ─── */}
      <div className="bg-white rounded-b-xl border border-gray-100 border-t-0 -mt-6 p-6 pt-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          {/* Staff Name / ID */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Staff Name / ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.staffName}
                onChange={(e) => update("staffName", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.leaveType}
              onChange={(e) => update("leaveType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select type</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="maternity">Maternity Leave</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-gray-50 rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">
                Total Duration
              </p>
              <p className="text-lg font-bold text-navy-900">0 Days</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Calculated based on working days
          </p>
        </div>

        {/* Reason for Leave */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Briefly explain the reason for your request"
            value={form.reason}
            onChange={(e) => update("reason", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Supporting Documents */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Supporting Documents (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-navy-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-blue-500 mt-1">
              PDF, JPG or PNG (MAX. 5MB)
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Example: Medical reports for sick leave, travel itineraries, etc.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Send className="w-4 h-4" />
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
