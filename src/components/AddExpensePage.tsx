import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Save, UploadCloud, Info, Loader2, X } from "lucide-react";
import { fetchBranches, createFinanceTransaction, uploadFile } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    branch: "",
    paymentMethod: "",
    expenseDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => { fetchBranches().then(setBranches).catch(() => {}); }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.category || !form.amount || !form.expenseDate) { setError("Please fill in category, amount and date"); return; }
    setError("");
    setSubmitting(true);
    try {
      let receipt_url = "";
      if (receiptFile) {
        const ext = receiptFile.name.split(".").pop() || "file";
        const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        try { receipt_url = await uploadFile("documents", path, receiptFile); } catch {}
      }
      await createFinanceTransaction({
        type: "expense",
        category: form.category,
        description: form.description,
        amount: parseFloat(form.amount.replace(/,/g, "")),
        payment_method: form.paymentMethod,
        branch_id: form.branch || undefined,
        date: form.expenseDate,
        recorded_by: profile?.id ?? "",
        receipt_url,
      });
      navigate("/finance");
    } catch (e: any) { setError(e.message || "Failed to save expense"); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── Form Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          {/* Expense Category */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Expense Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Category</option>
              <option value="office-supplies">Office Supplies</option>
              <option value="rent">Rent &amp; Utilities</option>
              <option value="salaries">Salaries &amp; Wages</option>
              <option value="transport">Transportation</option>
              <option value="maintenance">Maintenance</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                ₦
              </span>
              <input
                type="text"
                placeholder=""
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Branch
            </label>
            <select
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Payment Method
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) => update("paymentMethod", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Method</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="cheque">Cheque</option>
              <option value="direct-debit">Direct Debit</option>
            </select>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Expense Date
            </label>
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => update("expenseDate", e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description - full width */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Provide details about this expense..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Receipt Upload - full width */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Receipt Upload
            </label>
            {receiptFile ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <UploadCloud className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{receiptFile.name}</p>
                  <p className="text-xs text-gray-400">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button type="button" onClick={() => setReceiptFile(null)} className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-green-300 bg-green-50/40 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/70 transition-colors">
                <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm font-semibold text-navy-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, or PDF (max. 5MB)
                </p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size <= 5 * 1024 * 1024) setReceiptFile(f);
                    else if (f) setError("File too large (max 5MB)");
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <Link to="/finance" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </div>

      {/* ─── Audit Notice Banner ─── */}
      <div className="bg-navy-900 rounded-xl px-6 py-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-300 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          All expenses are subject to internal audit review. Ensure receipts are
          clear and legible before submission.
        </p>
      </div>
    </div>
  );
}
