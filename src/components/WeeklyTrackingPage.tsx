import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Download,
  Check,
  Clock,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react";
import ExportMenu from "./ExportMenu";
import { fetchWeeklyPayments, recordWeeklyPayment, fetchGroups, fetchBranches, fetchMembers } from "../lib/db";
import { useAuth } from "../auth/useAuth";

/* ── Week helpers ── */
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

const statusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
          <Check className="w-3 h-3" /> PAID
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" /> PARTIAL
        </span>
      );
    case "overdue":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
          <AlertTriangle className="w-3 h-3" /> OVERDUE
        </span>
      );
    case "missed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          <X className="w-3 h-3" /> MISSED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
          <Clock className="w-3 h-3" /> PENDING
        </span>
      );
  }
};

export default function WeeklyTrackingPage() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  // Filters
  const [groupFilter, setGroupFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 50;

  // Record modal
  const [showRecord, setShowRecord] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [recordGroup, setRecordGroup] = useState("");
  const [recordBranch, setRecordBranch] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bookletRef, setBookletRef] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchWeeklyPayments({
        group_id: groupFilter || undefined,
        branch_id: branchFilter || undefined,
        status: statusFilter || undefined,
        year: selectedYear,
        page: currentPage,
        pageSize: perPage,
      });
      setPayments(data);
      setTotalCount(count);
    } catch (err) {
      console.error("Failed to load weekly payments:", err);
    } finally {
      setLoading(false);
    }
  }, [groupFilter, branchFilter, statusFilter, selectedYear, currentPage]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  useEffect(() => {
    fetchGroups().then(r => setGroups(r.data)).catch(console.error);
    fetchBranches().then(setBranches).catch(console.error);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [groupFilter, branchFilter, statusFilter, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  // Summary stats
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount_paid), 0);
  const totalOutstanding = payments.reduce((s, p) => s + Number(p.outstanding), 0);
  const paidCount = payments.filter(p => p.status === "paid").length;
  const overdueCount = payments.filter(p => ["overdue", "missed"].includes(p.status)).length;

  // Member search for record modal
  const handleMemberSearch = useCallback(async (q: string) => {
    setMemberSearch(q);
    if (q.length < 2) { setMemberResults([]); return; }
    try {
      const { data } = await fetchMembers({ search: q, pageSize: 5 });
      setMemberResults(data);
    } catch { setMemberResults([]); }
  }, []);

  const handleRecordPayment = async () => {
    if (!selectedMember || !amountDue || !profile) return;
    setSubmitting(true);
    setError("");
    try {
      const now = new Date();
      await recordWeeklyPayment({
        member_id: selectedMember.id,
        group_id: recordGroup || undefined,
        branch_id: recordBranch || selectedMember.branch_id || undefined,
        week_number: getWeekNumber(now),
        week_start_date: getMonday(now),
        year: now.getFullYear(),
        amount_due: Number(amountDue),
        amount_paid: Number(amountPaid || 0),
        payment_method: paymentMethod,
        booklet_reference: bookletRef,
        notes: recordNotes,
        recorded_by: profile.id,
      });
      setShowRecord(false);
      resetRecordForm();
      loadPayments();
    } catch (err: any) {
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetRecordForm = () => {
    setSelectedMember(null);
    setMemberSearch("");
    setMemberResults([]);
    setRecordGroup("");
    setRecordBranch("");
    setAmountDue("");
    setAmountPaid("");
    setPaymentMethod("cash");
    setBookletRef("");
    setRecordNotes("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Weekly Payment Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Record and manage weekly payments from group booklets. Data entered by branch managers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu data={() => payments.map((p: any) => ({ Member: p.member?.first_name + ' ' + p.member?.last_name, Group: p.group?.name || '', Week: p.week_number, Amount: p.amount, Status: p.status, Date: p.payment_date }))} filename="weekly_tracking" label="Export" />
          <button
            onClick={() => setShowRecord(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Total Collected</p>
          <p className="text-2xl font-bold text-green-600 mt-1">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₦{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Paid This Week</p>
          <p className="text-2xl font-bold text-navy-900 mt-1">{paidCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Overdue</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{overdueCount}</p>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Group</label>
            <div className="relative">
              <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                <option value="">All Groups</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Branch</label>
            <div className="relative">
              <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                <option value="">All Branches</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Status</label>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="missed">Missed</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-2">Year</label>
            <div className="relative">
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white">
                {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>Booklet records entered digitally</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Member</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Group</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Week</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Amount Due</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Paid</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">Outstanding</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">Status</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Booklet Ref</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Loading records…</p>
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No weekly payment records found.</p>
                  <p className="text-xs text-gray-300 mt-1">Click "Record Payment" to enter data from booklets.</p>
                </td></tr>
              ) : payments.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-navy-900">{p.member?.first_name} {p.member?.last_name}</p>
                    <p className="text-xs text-gray-400">{p.member?.member_id}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-navy-900">{p.group?.name ?? "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-navy-900">Wk {p.week_number}</p>
                    <p className="text-xs text-gray-400">{new Date(p.week_start_date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-navy-900">₦{Number(p.amount_due).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-green-600">₦{Number(p.amount_paid).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className={`text-sm font-semibold ${Number(p.outstanding) > 0 ? "text-red-600" : "text-gray-400"}`}>
                      ₦{Number(p.outstanding).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">{statusBadge(p.status)}</td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-500">{p.booklet_reference || "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-gray-500">{p.recorder?.full_name ?? "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-navy-900">{Math.min((currentPage - 1) * perPage + 1, totalCount)}-{Math.min(currentPage * perPage, totalCount)}</span> of <span className="font-semibold text-green-600">{totalCount}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-navy-900">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ Record Payment Modal ═══════════ */}
      {showRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-900">Record Weekly Payment</h3>
              <button onClick={() => { setShowRecord(false); resetRecordForm(); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}

              {/* Member search */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Member *</label>
                {selectedMember ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{selectedMember.first_name} {selectedMember.last_name}</p>
                      <p className="text-xs text-gray-500">{selectedMember.member_id}</p>
                    </div>
                    <button onClick={() => { setSelectedMember(null); setMemberSearch(""); }} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={memberSearch}
                      onChange={e => handleMemberSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                    />
                    {memberResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {memberResults.map((m: any) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedMember(m); setMemberSearch(""); setMemberResults([]); if (m.branch_id) setRecordBranch(m.branch_id); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          >
                            <span className="font-medium">{m.first_name} {m.last_name}</span>
                            <span className="text-gray-400 ml-2">{m.member_id}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Group & Branch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Group</label>
                  <select value={recordGroup} onChange={e => setRecordGroup(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20">
                    <option value="">Select Group</option>
                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Branch</label>
                  <select value={recordBranch} onChange={e => setRecordBranch(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20">
                    <option value="">Select Branch</option>
                    {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount Due (₦) *</label>
                  <input type="number" value={amountDue} onChange={e => setAmountDue(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount Paid (₦)</label>
                  <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
                </div>
              </div>

              {/* Payment method & booklet ref */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20">
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Booklet Reference</label>
                  <input type="text" value={bookletRef} onChange={e => setBookletRef(e.target.value)} placeholder="e.g. Page 12" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes</label>
                <textarea value={recordNotes} onChange={e => setRecordNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 resize-none" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowRecord(false); resetRecordForm(); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!selectedMember || !amountDue || submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
