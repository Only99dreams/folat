import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileUp, Loader2, X } from "lucide-react";
import { createFundRequest, uploadFile, fetchBranches } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function NewFundRequestPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [form, setForm] = useState({
    amount: "",
    category: "",
    purpose: "",
    priorityLevel: "normal",
    justification: "",
  });

  useEffect(() => {
    if (profile?.branch_id) {
      fetchBranches().then(branches => {
        const b = branches.find((br: any) => br.id === profile.branch_id || br.name === profile.branch);
        if (b) { setBranchName(b.name); setBranchCode(b.code || b.id?.slice(0,6)?.toUpperCase()); }
      }).catch(() => {});
    }
  }, [profile?.branch_id, profile?.branch]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.amount || !form.category || !form.purpose) { setError("Please fill in amount, category and purpose"); return; }
    setError("");
    setSubmitting(true);
    try {
      let document_url: string | undefined;
      if (docFile) {
        const ext = docFile.name.split(".").pop() || "pdf";
        const path = `fund-requests/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        document_url = await uploadFile("documents", path, docFile);
      }
      await createFundRequest({
        requested_by: profile?.id ?? "",
        amount: parseFloat(form.amount.replace(/,/g, "")),
        purpose: form.purpose,
        category: form.category,
        urgency: form.priorityLevel,
        branch_id: profile?.branch_id ?? undefined,
        justification: form.justification || undefined,
        document_url,
      });
      navigate("/finance/fund-requests");
    } catch (e: any) { setError(e.message || "Failed to submit request"); }
    setSubmitting(false);
  };

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
              {branchName || profile?.branch || 'N/A'}
            </p>
          </div>

          {/* Branch Code */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1.5">
              Branch Code
            </p>
            <p className="text-sm font-semibold text-navy-900">{branchCode || '\u2014'}</p>
          </div>

          {/* Requester Name */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1.5">
              Requester Name
            </p>
            <p className="text-sm font-semibold text-navy-900">{profile?.full_name ?? 'N/A'}</p>
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
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical / Urgent</option>
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
          {docFile ? (
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
              <FileUp className="w-5 h-5 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900 truncate">{docFile.name}</p>
                <p className="text-xs text-gray-400">{(docFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setDocFile(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 10 * 1024 * 1024) { setError("File must be under 10 MB"); return; }
                if (f) setDocFile(f);
              }} />
              <FileUp className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-navy-900">
                Drag and drop invoices, quotes, or receipts here
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or <span className="text-navy-900 font-semibold underline">browse files</span> to upload
              </p>
              <p className="text-xs text-blue-500 mt-2">PDF, JPG, PNG (MAX 10MB)</p>
            </label>
          )}
        </div>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="flex items-center justify-between pb-4">
        <Link to="/finance/fund-requests" className="text-sm font-medium text-navy-900 hover:text-gray-600 transition-colors">
          Cancel
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setForm({ amount: "", category: "", purpose: "", priorityLevel: "normal", justification: "" }); setDocFile(null); }}
            className="px-6 py-2.5 border border-navy-900 rounded-xl text-sm font-semibold text-navy-900 hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
