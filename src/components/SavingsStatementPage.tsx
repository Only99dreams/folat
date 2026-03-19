import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

/* ─── Statement Data ─── */
interface StatementTransaction {
  date: string;
  details: string;
  reference: string;
  amount: string;
  balance: string;
}

const statementTransactions: StatementTransaction[] = [
  {
    date: "02 Oct, 2023",
    details: "Monthly Contribution",
    reference: "FT-98234-AX",
    amount: "+₦ 50,000.00",
    balance: "₦ 250,000.00",
  },
  {
    date: "15 Oct, 2023",
    details: "Special Savings Deposit",
    reference: "FT-98441-ZC",
    amount: "+₦ 75,000.00",
    balance: "₦ 325,000.00",
  },
  {
    date: "28 Oct, 2023",
    details: "Dividend Credit",
    reference: "DV-2023-OCT",
    amount: "+₦ 25,000.00",
    balance: "₦ 350,000.00",
  },
];

const periods = ["30d", "3m", "6m", "Custom"] as const;

export default function SavingsStatementPage() {
  const [search, setSearch] = useState("");
  const [activePeriod, setActivePeriod] = useState<string>("30d");

  return (
    <div className="space-y-6">
      {/* ─── Search Bar ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Name, Member ID, or Transaction ID (TxID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>
      </div>

      {/* ─── Statement Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
          {/* Left — Logo & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="FOLAT"
                className="w-8 h-8 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">
                Savings Statement
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Statement period: Oct 01, 2023 - Oct 31, 2023
              </p>
            </div>
          </div>

          {/* Right — Member Info */}
          <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-b border-r border-gray-200">
                Member Name:
              </div>
              <div className="px-4 py-2 font-semibold text-navy-900 border-b border-gray-200">
                Ajibola Christopher
              </div>
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-b border-r border-gray-200">
                Member ID:
              </div>
              <div className="px-4 py-2 font-semibold text-navy-900 border-b border-gray-200">
                MBR-000234
              </div>
              <div className="px-4 py-2 bg-gray-50 font-medium text-gray-500 border-r border-gray-200">
                Branch:
              </div>
              <div className="px-4 py-2 font-semibold text-navy-900">
                Lagos Mainland
              </div>
            </div>
          </div>
        </div>

        {/* Period Toggle & Generated On */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activePeriod === p
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:text-navy-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Generated on: Oct 31, 2023 14:45 GMT
          </p>
        </div>

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Opening Balance */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
              Opening Balance
            </p>
            <p className="text-xl font-bold text-navy-900">₦200,000.00</p>
          </div>

          {/* Total Deposits */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">
              Total Deposits
            </p>
            <p className="text-xl font-bold text-green-600">₦150,000.00</p>
          </div>

          {/* Total Withdrawals */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-red-500 font-semibold mb-1">
              Total Withdrawals
            </p>
            <p className="text-xl font-bold text-red-500">₦0.00</p>
          </div>

          {/* Closing Balance */}
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-[10px] tracking-[0.1em] uppercase text-navy-200 font-semibold mb-1">
              Closing Balance
            </p>
            <p className="text-xl font-bold text-white">₦350,000.00</p>
          </div>
        </div>

        {/* ─── Transactions Table ─── */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-10">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Transaction Details
                </th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Reference
                </th>
                <th className="px-4 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {statementTransactions.map((txn, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {txn.date}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-navy-900">
                    {txn.details}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400 font-mono">
                    {txn.reference}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-green-600 text-right">
                    {txn.amount}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-navy-900 text-right">
                    {txn.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* ─── Signatures Section ─── */}
        <div className="flex items-end justify-between px-4 mb-10">
          {/* Customer Acknowledgement */}
          <div className="text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-green-600 font-semibold mb-8">
              Customer Acknowledgement
            </p>
            <div className="w-56 border-b border-gray-300 mb-3" />
            <p className="text-sm font-medium text-navy-900">
              Ajibola Christopher
            </p>
          </div>

          {/* Authorized Official */}
          <div className="text-center">
            <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 font-semibold mb-4">
              Authorized Official
            </p>
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-navy-900" />
            </div>
            <p className="text-sm font-medium text-navy-900">
              Operations Manager - Lagos Mainland
            </p>
          </div>
        </div>

        {/* ─── Footer Disclaimer ─── */}
        <div className="border-t border-gray-100 pt-6 text-center space-y-1">
          <p className="text-xs text-gray-400">
            This is a computer-generated document. No signature is required for
            electronic verification.
          </p>
          <p className="text-xs text-gray-400">
            FOLAT Financial Services | 123 Finance Plaza, Victoria Island, Lagos
            | info@folat.com | +234 1 234 5678
          </p>
        </div>
      </div>
    </div>
  );
}
