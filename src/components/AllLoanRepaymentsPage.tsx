import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  File,
  Calendar,
  SlidersHorizontal,
  MoreVertical,
} from "lucide-react";

/* ─── Repayment Data ─── */
interface Repayment {
  paymentId: string;
  paymentIdColor: string;
  date: string;
  avatar: string;
  avatarColor: string;
  name: string;
  memberId: string;
  loanId: string;
  instNum: string;
  instTotal: string;
  amountPaid: string;
  balance: string;
  method: string;
  methodColor: string;
  methodBg: string;
  branch: string;
}

const repayments: Repayment[] = [
  {
    paymentId: "#PAY-24891",
    paymentIdColor: "text-green-600",
    date: "Mar 22, 2024",
    avatar: "EW",
    avatarColor: "bg-blue-600 text-white",
    name: "Emily Watson",
    memberId: "MEM-0452",
    loanId: "LN-2024-105",
    instNum: "12",
    instTotal: "24",
    amountPaid: "$850.00",
    balance: "$5,240.00",
    method: "BANK TRANSFER",
    methodColor: "text-navy-700",
    methodBg: "bg-blue-50 border border-blue-200",
    branch: "HQ Branch",
  },
  {
    paymentId: "#PAY-24890",
    paymentIdColor: "text-green-600",
    date: "Mar 22, 2024",
    avatar: "MA",
    avatarColor: "bg-purple-600 text-white",
    name: "Marcus Aurelio",
    memberId: "MEM-0112-Y",
    loanId: "LN-2023-882",
    instNum: "08",
    instTotal: "12",
    amountPaid: "$1,200.00",
    balance: "$4,800.00",
    method: "DIRECT DEBIT",
    methodColor: "text-red-600",
    methodBg: "bg-red-50 border border-red-200",
    branch: "North Region",
  },
  {
    paymentId: "#PAY-24889",
    paymentIdColor: "text-green-600",
    date: "Mar 21, 2024",
    avatar: "SL",
    avatarColor: "bg-teal-600 text-white",
    name: "Sarah Lowery",
    memberId: "MEM-0294-L",
    loanId: "LN-2024-044",
    instNum: "03",
    instTotal: "36",
    amountPaid: "$450.00",
    balance: "$12,450.00",
    method: "MOBILE MONEY",
    methodColor: "text-green-700",
    methodBg: "bg-green-50 border border-green-200",
    branch: "South Sector",
  },
  {
    paymentId: "#PAY-24888",
    paymentIdColor: "text-green-600",
    date: "Mar 21, 2024",
    avatar: "JD",
    avatarColor: "bg-amber-600 text-white",
    name: "James Dean",
    memberId: "MEM-1290-D",
    loanId: "LN-2024-150",
    instNum: "01",
    instTotal: "12",
    amountPaid: "$2,100.00",
    balance: "$22,900.00",
    method: "CASH",
    methodColor: "text-green-700",
    methodBg: "bg-green-50 border border-green-200",
    branch: "HQ Branch",
  },
  {
    paymentId: "#PAY-24887",
    paymentIdColor: "text-navy-900",
    date: "Mar 20, 2024",
    avatar: "RK",
    avatarColor: "bg-rose-600 text-white",
    name: "Rachel King",
    memberId: "MEM-0023-R",
    loanId: "LN-2022-500",
    instNum: "24",
    instTotal: "24",
    amountPaid: "$300.00",
    balance: "$0.00",
    method: "BANK TRANSFER",
    methodColor: "text-navy-700",
    methodBg: "bg-blue-50 border border-blue-200",
    branch: "Lakeside Office",
  },
];

export default function AllLoanRepaymentsPage() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("All Branches");
  const [paymentMethod, setPaymentMethod] = useState("All Methods");
  const [currentPage, setCurrentPage] = useState(1);

  const totalResults = 1240;
  const perPage = 5;
  const totalPages = 124;

  return (
    <div className="space-y-6">
      {/* ─── Global Search ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Global search for members or loan IDs..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </div>
      </div>

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            All Loan Repayments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor all loan repayments across the cooperative system.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold tracking-wide uppercase">
            Export Data:
          </span>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            EXCEL
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            <File className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Repayments MTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (MTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">$45,200.00</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-green-600">↗12.5%</span>
            <span className="text-gray-400">vs last month</span>
          </p>
        </div>

        {/* Total Repayments YTD */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Total Repayments (YTD)
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">$580,450.00</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-red-500">↘2.4%</span>
            <span className="text-gray-400">vs last year</span>
          </p>
        </div>

        {/* Avg Repayment Amount */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Avg. Repayment Amount
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">$1,250.00</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-green-600">↗5.1%</span>
            <span className="text-gray-400">per transaction</span>
          </p>
        </div>

        {/* Active Repaying Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-bold mb-1">
            Active Repaying Members
          </p>
          <p className="text-2xl font-bold text-navy-900 mb-1">1,240</p>
          <p className="text-xs font-medium flex items-center gap-1">
            <span className="text-green-600">↗8.2%</span>
            <span className="text-gray-400">growth rate</span>
          </p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Member / Loan ID */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Search Member / Loan ID
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. LN-2024-001 or John Doe"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          {/* Branch */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Branch
            </p>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
              >
                <option>All Branches</option>
                <option>HQ Branch</option>
                <option>North Region</option>
                <option>South Sector</option>
                <option>Lakeside Office</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Payment Method
            </p>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
              >
                <option>All Methods</option>
                <option>Bank Transfer</option>
                <option>Direct Debit</option>
                <option>Mobile Money</option>
                <option>Cash</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1.5">
              Date Range
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                defaultValue="Mar 01 - Mar 31, 2024"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Apply Filters
        </button>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] tracking-[0.1em] uppercase text-red-500 font-bold">
                  Payment ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member Name & ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Loan ID
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Inst. #
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Amount Paid
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Balance
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Method
                </th>
                <th className="px-3 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Branch
                </th>
                <th className="w-10 px-2 py-4" />
              </tr>
            </thead>
            <tbody>
              {repayments.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Payment ID */}
                  <td className="px-5 py-5">
                    <p
                      className={`text-sm font-bold ${r.paymentIdColor}`}
                    >
                      {r.paymentId}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">{r.date}</p>
                  </td>

                  {/* Member */}
                  <td className="px-3 py-5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${r.avatarColor}`}
                      >
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">
                          {r.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {r.memberId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Loan ID */}
                  <td className="px-3 py-5">
                    <p className="text-sm text-navy-900 font-medium">
                      {r.loanId}
                    </p>
                  </td>

                  {/* Inst # */}
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">
                      {r.instNum} /{" "}
                      <span className="text-gray-400">{r.instTotal}</span>
                    </p>
                  </td>

                  {/* Amount Paid */}
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm font-semibold text-navy-900">
                      {r.amountPaid}
                    </p>
                  </td>

                  {/* Balance */}
                  <td className="px-3 py-5 text-center">
                    <p className="text-sm text-navy-900">{r.balance}</p>
                  </td>

                  {/* Method */}
                  <td className="px-3 py-5 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-[9px] font-bold tracking-wider ${r.methodBg} ${r.methodColor}`}
                    >
                      {r.method}
                    </span>
                  </td>

                  {/* Branch */}
                  <td className="px-3 py-5">
                    <p className="text-sm text-gray-600">{r.branch}</p>
                  </td>

                  {/* More */}
                  <td className="px-2 py-5">
                    <button className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {Math.min(currentPage * perPage, totalResults)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">{totalResults}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <span className="px-1 text-gray-400 text-sm">…</span>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "bg-navy-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {totalPages}
            </button>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
