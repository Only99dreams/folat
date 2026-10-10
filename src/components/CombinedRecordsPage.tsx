import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import ExportMenu from "./ExportMenu";
import { fetchCombinedRecords } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

export default function CombinedRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [branchFilterId, setBranchFilterId] = useState<string | null>(null);
  const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";

  useEffect(() => {
    if (!isRestricted || !user?.branch) return;
    (async () => {
      const { data } = await supabase
        .from("branches")
        .select("id")
        .ilike("name", user.branch)
        .maybeSingle();
      if (data?.id) setBranchFilterId(data.id);
    })();
  }, [isRestricted, user?.branch]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCombinedRecords({ branch_id: branchFilterId || undefined });
        setRecords(data);
      } catch {}
      setLoading(false);
    })();
  }, [branchFilterId]);

  const filtered = filter
    ? records.filter((r) =>
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.member_id.toLowerCase().includes(filter.toLowerCase())
      )
    : records;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Combined Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial summary for all staff and members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu
            data={() =>
              filtered.map((r) => ({
                Date: r.date ? new Date(r.date).toLocaleDateString() : "",
                Name: r.name,
                "Member ID": r.member_id,
                Type: r.type,
                "Savings Deposit": r.savings_deposit,
                "Savings Withdrawal": r.savings_withdrawal,
                "Savings Balance": r.savings_balance,
                "Loan Repayments": r.loan_repayments,
                "Loan Balance": r.loan_balance,
              }))
            }
            filename="combined_records"
            label="Export"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or member ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
          <div className="relative">
            <select
              value=""
              onChange={() => {}}
              className="appearance-none px-4 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option>All Dates</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Date
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Name
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Member ID
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Type
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Savings Deposit
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Savings Withdrawal
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Savings Balance
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Loan Repayments
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                  Loan Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm text-navy-900">
                        {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-navy-900">
                        {r.name}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{r.member_id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        r.type === "Staff & Member" ? "bg-blue-100 text-blue-700" :
                        r.type === "Staff" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ₦{Number(r.savings_deposit).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-red-500">
                        ₦{Number(r.savings_withdrawal).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-navy-900">
                        ₦{Number(r.savings_balance).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ₦{Number(r.loan_repayments).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-sm font-semibold text-navy-900">
                        ₦{Number(r.loan_balance).toLocaleString()}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Total Members:</span>
                <span className="ml-2 font-bold text-navy-900">
                  {filtered.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total Savings Balance:</span>
                <span className="ml-2 font-bold text-green-600">
                  ₦
                  {filtered
                    .reduce((s, r) => s + Number(r.savings_balance), 0)
                    .toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total Loan Balance:</span>
                <span className="ml-2 font-bold text-navy-900">
                  ₦
                  {filtered
                    .reduce((s, r) => s + Number(r.loan_balance), 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
