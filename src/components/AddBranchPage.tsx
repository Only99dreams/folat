import { useState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createBranch } from "../lib/db";

export default function AddBranchPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    branchName: "",
    branchCode: "",
    branchType: "Main Branch",
    branchStatus: true,
    country: "Nigeria",
    state: "Lagos",
    city: "",
    branchAddress: "",
    phone: "",
    email: "",
    manager: "",
    assistantManager: "",
    maxLoanLimit: "",
    approvalLevel: "Standard Branch Approval",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createBranch({
        name: form.branchName,
        code: form.branchCode,
        address: form.branchAddress,
        city: form.city,
        state: form.state,
        phone: form.phone,
        email: form.email,
      });
      navigate("/branches");
    } catch (err: any) {
      setError(err.message || "Failed to create branch");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Add New Branch</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure a new operational location for the FOLAT Cooperative.
          </p>
        </div>
        <Link
          to="/branches"
          className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Basic Information ─── */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-bold text-navy-900">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Branch Name */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                value={form.branchName}
                onChange={(e) => update("branchName", e.target.value)}
                placeholder="e.g. Lagos Mainland Hub"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Branch Code */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Branch Code
              </label>
              <input
                type="text"
                value={form.branchCode}
                onChange={(e) => update("branchCode", e.target.value)}
                placeholder="BR-LGS-001"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Branch Type */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Branch Type
              </label>
              <select
                value={form.branchType}
                onChange={(e) => update("branchType", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option>Main Branch</option>
                <option>Regional Branch</option>
                <option>Satellite Office</option>
              </select>
            </div>
          </div>

          {/* Branch Status */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-2">
              Branch Status
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Inactive</span>
              <button
                type="button"
                onClick={() => update("branchStatus", !form.branchStatus)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.branchStatus ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.branchStatus ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-navy-900">Active</span>
            </div>
          </div>
        </section>

        {/* ─── Location Details ─── */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-bold text-navy-900">
            Location Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                State
              </label>
              <select
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Oyo</option>
                <option>Rivers</option>
                <option>Enugu</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Enter city name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Branch Address */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Branch Address
              </label>
              <input
                type="text"
                value={form.branchAddress}
                onChange={(e) => update("branchAddress", e.target.value)}
                placeholder="Building number, street name..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* ─── Contact Information + Branch Management ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-bold text-navy-900">
              Contact Information
            </h2>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+234  800 000 0000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="branch@folatcoop.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Branch Management */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-bold text-navy-900">
              Branch Management
            </h2>

            {/* Manager */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Manager
              </label>
              <select
                value={form.manager}
                onChange={(e) => update("manager", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Select Manager</option>
                <option>Babatunde O.</option>
                <option>Chioma A.</option>
                <option>Samuel L.</option>
              </select>
            </div>

            {/* Assistant Manager */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Assistant Manager
              </label>
              <select
                value={form.assistantManager}
                onChange={(e) => update("assistantManager", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Select Assistant Manager</option>
                <option>Adewale K.</option>
                <option>Fatima B.</option>
                <option>Emeka N.</option>
              </select>
            </div>
          </section>
        </div>

        {/* ─── Operational Settings ─── */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h2 className="text-base font-bold text-navy-900">
            Operational Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Maximum Loan Limit */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Maximum Loan Limit (₦)
              </label>
              <input
                type="text"
                value={form.maxLoanLimit}
                onChange={(e) => update("maxLoanLimit", e.target.value)}
                placeholder="5,000,000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Approval Level */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Approval Level
              </label>
              <select
                value={form.approvalLevel}
                onChange={(e) => update("approvalLevel", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option>Standard Branch Approval</option>
                <option>Regional Approval</option>
                <option>Headquarters Approval</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Notes &amp; Internal Comments
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Add any specific operational details for this branch..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
        </section>

        {/* ─── Error ─── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ─── Actions ─── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Saving…" : "Save Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}
