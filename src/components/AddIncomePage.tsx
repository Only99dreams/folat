import { useState } from "react";
import { Link } from "react-router-dom";
import { Save } from "lucide-react";

export default function AddIncomePage() {
  const [form, setForm] = useState({
    category: "",
    amount: "",
    branch: "",
    paymentMethod: "",
    transactionDate: "",
    referenceNumber: "",
    description: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Form Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
          {/* Income Category */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Income Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select category</option>
              <option value="member-dues">Member Dues</option>
              <option value="loan-interest">Loan Interest</option>
              <option value="registration-fees">Registration Fees</option>
              <option value="investment-returns">Investment Returns</option>
              <option value="penalties">Penalties &amp; Fines</option>
              <option value="other">Other Income</option>
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
                placeholder="0.00"
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
              <option value="">Select branch</option>
              <option value="lagos-central">Lagos Central</option>
              <option value="abuja">Abuja Branch</option>
              <option value="port-harcourt">Port Harcourt</option>
              <option value="ibadan">Ibadan Branch</option>
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
              <option value="">Select method</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="cheque">Cheque</option>
              <option value="direct-debit">Direct Debit</option>
            </select>
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Transaction Date
            </label>
            <input
              type="date"
              value={form.transactionDate}
              onChange={(e) => update("transactionDate", e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              placeholder="e.g. TR-998271"
              value={form.referenceNumber}
              onChange={(e) => update("referenceNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description - full width */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Enter additional transaction details..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Divider + Buttons */}
        <div className="border-t border-gray-100 mt-8 pt-6 flex items-center justify-end gap-3">
          <Link to="/finance" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            <Save className="w-4 h-4" />
            Save Income
          </button>
        </div>
      </div>

      {/* ─── Bottom Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Total */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Today's Total
          </p>
          <p className="text-xl font-bold text-navy-900">₦142,500.00</p>
        </div>

        {/* Pending Entries */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Pending Entries
          </p>
          <p className="text-xl font-bold text-navy-900">12</p>
        </div>

        {/* Top Category */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
            Top Category
          </p>
          <p className="text-xl font-bold text-navy-900">Loan Interest</p>
        </div>
      </div>
    </div>
  );
}
