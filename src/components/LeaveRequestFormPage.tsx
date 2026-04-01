import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CalendarDays,
  Send,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { fetchStaff, createLeaveRequest, uploadFile } from "../lib/db";

export default function LeaveRequestFormPage() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [supportDoc, setSupportDoc] = useState<File | null>(null);
  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => { fetchStaff().then(setStaffList).catch(() => {}); }, []);

  const filteredStaff = staffSearch.length >= 2
    ? staffList.filter(s => `${s.first_name} ${s.last_name} ${s.staff_id || ""}`.toLowerCase().includes(staffSearch.toLowerCase())).slice(0, 8)
    : [];

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalDays = form.startDate && form.endDate
    ? Math.max(Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000*60*60*24)) + 1, 0)
    : 0;

  const handleSubmit = async () => {
    if (!selectedStaff || !form.leaveType || !form.startDate || !form.endDate) {
      setError("Please fill all required fields"); return;
    }
    setError(""); setSubmitting(true);
    try {
      const leaveData = await createLeaveRequest({
        staff_id: selectedStaff.id,
        leave_type: form.leaveType,
        start_date: form.startDate,
        end_date: form.endDate,
        days: totalDays,
        reason: form.reason,
      });
      if (supportDoc && leaveData?.id) {
        await uploadFile("leave-documents", `${leaveData.id}/${supportDoc.name}`, supportDoc);
      }
      navigate("/hr/leave-requests");
    } catch (e: any) { setError(e.message || "Failed to submit leave request"); }
    setSubmitting(false);
  };

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
                value={selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name} (${selectedStaff.staff_id || ""})` : staffSearch}
                onChange={(e) => { setStaffSearch(e.target.value); setSelectedStaff(null); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search staff by name or ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {showDropdown && filteredStaff.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredStaff.map(s => (
                    <button key={s.id} type="button" onClick={() => { setSelectedStaff(s); setShowDropdown(false); setStaffSearch(""); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                      {s.first_name} {s.last_name} {s.staff_id ? `(${s.staff_id})` : ""}
                    </button>
                  ))}
                </div>
              )}
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
              <option value="compassionate">Compassionate Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="study">Study Leave</option>
              <option value="unpaid">Unpaid Leave</option>
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
              <p className="text-lg font-bold text-navy-900">{totalDays} Days</p>
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
          <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-navy-900">
              {supportDoc ? supportDoc.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              PDF, JPG or PNG (MAX. 5MB)
            </p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setSupportDoc(e.target.files?.[0] ?? null)} />
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Example: Medical reports for sick leave, travel itineraries, etc.
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => navigate("/hr/leave-requests")} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
