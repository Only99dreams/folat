import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  DollarSign,
  Save,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Users,
  PiggyBank,
  X,
} from "lucide-react";
import { fetchStaff, updateStaffSalary, fetchBranches, fetchLoanApplications, syncStaffCooperativeMember, recordBulkSavingsDeposits } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

export default function StaffSalaryPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [success, setSuccess] = useState("");
  const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";

  /* ── Savings modal state ── */
  const [savingsModalStaff, setSavingsModalStaff] = useState<any>(null);
  const [savingsMonths, setSavingsMonths] = useState<number>(1);
  const [savingsAmount, setSavingsAmount] = useState<number>(0);
  const [savingsNotes, setSavingsNotes] = useState("");
  const [savingsLoading, setSavingsLoading] = useState(false);
  const [savingsError, setSavingsError] = useState("");
  const [savingsSuccess, setSavingsSuccess] = useState("");

  useEffect(() => {
    fetchBranches().then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRestricted || !user?.branch) return;
    (async () => {
      const { data } = await supabase
        .from("branches")
        .select("id")
        .ilike("name", user.branch)
        .maybeSingle();
      if (data?.id) setBranchFilter(data.id);
    })();
  }, [isRestricted, user?.branch]);

  // Auto-detect cooperative members when staff list loads
  useEffect(() => {
    (async () => {
      if (staffList.length === 0) return;
      try {
        const emails = staffList.filter(s => s.email).map(s => s.email);
        const staffIds = staffList.map(s => s.id);

        const { data: cooperativeMembers } = await supabase
          .from("members")
          .select("email, staff_id, id")
          .eq("member_type", "cooperative")
          .or(`email.in.(${emails.join(",")}),staff_id.in.(${staffIds.join(",")})`);

        const members = cooperativeMembers ?? [];
        const formUpdates: Record<string, any> = {};
        const backfills: Promise<any>[] = [];

        for (const staff of staffList) {
          const member = members.find(m =>
            (m.staff_id && m.staff_id === staff.id) ||
            (staff.email && m.email && m.email.toLowerCase() === staff.email.toLowerCase())
          );

          if (member) {
            if (!editForm[staff.id]?.is_cooperative_member && !staff.is_cooperative_member) {
              const loanRes = await fetchLoanApplications({ member_id: member.id, status: ["approved", "disbursed", "active"], pageSize: 1 });
              const hasActiveLoan = (loanRes?.count || 0) > 0;
              const defaultSavings = hasActiveLoan ? 5000 : 7000;
              formUpdates[staff.id] = {
                is_cooperative_member: true,
                cooperative_savings_amount: staff.cooperative_savings_amount || defaultSavings,
              };
            }
          } else if (staff.is_cooperative_member) {
            // Self-heal: staff flagged as a cooperative member but with no members row yet
            backfills.push(
              syncStaffCooperativeMember(staff, { created_by: user?.id })
                .then(() => {
                  if (!editForm[staff.id]?.is_cooperative_member) {
                    formUpdates[staff.id] = {
                      is_cooperative_member: true,
                      cooperative_savings_amount: staff.cooperative_savings_amount || 7000,
                    };
                  }
                })
                .catch((err) => console.error("Cooperative member backfill failed:", err))
            );
          }
        }

        await Promise.allSettled(backfills);

        if (Object.keys(formUpdates).length > 0) {
          setEditForm(prev => {
            const next = { ...prev };
            for (const [staffId, updates] of Object.entries(formUpdates)) {
              next[staffId] = { ...(next[staffId] || {}), ...updates };
            }
            return next;
          });
        }
      } catch {}
    })();
  }, [staffList]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (branchFilter) filters.branch_id = branchFilter;
        if (search) filters.search = search;
        const data = await fetchStaff(filters);
        setStaffList(data);
        // Initialize edit forms with current staff data
        const initialForms: Record<string, any> = {};
        for (const staff of data) {
          initialForms[staff.id] = {
            basic_salary: staff.basic_salary || 0,
            housing_allowance: staff.housing_allowance || 0,
            transport_allowance: staff.transport_allowance || 0,
            other_allowances: staff.other_allowances || 0,
            is_cooperative_member: staff.is_cooperative_member || false,
            cooperative_savings_amount: staff.cooperative_savings_amount || 0,
            loan_repayment_amount: staff.loan_repayment_amount || 0,
            savings_months: staff.savings_months ?? "",
          };
        }
        setEditForm(initialForms);
      } catch {}
      setLoading(false);
    })();
  }, [branchFilter, search]);

  const handleSave = async (staffId: string) => {
    setSaving(staffId);
    try {
      const payload = { ...(editForm[staffId] || {}) };
      if (payload.savings_months === "" || payload.savings_months === null || payload.savings_months === undefined) {
        payload.savings_months = null;
      } else {
        payload.savings_months = Number(payload.savings_months) || 0;
      }

      if (payload.is_cooperative_member) {
        const staff = staffList.find(s => s.id === staffId);
        if (staff) {
          await syncStaffCooperativeMember(staff, { created_by: user?.id });
        }
      }

      await updateStaffSalary(staffId, payload);
      setSuccess("Salary updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh staff list to get updated data
      const filters: any = {};
      if (branchFilter) filters.branch_id = branchFilter;
      if (search) filters.search = search;
      const data = await fetchStaff(filters);
      setStaffList(data);
    } catch (e: any) {
      alert(e.message || "Failed to update salary");
    }
    setSaving(null);
  };

  const updateField = (staffId: string, field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        [field]: value
      }
    }));
  };

  const getInitialForm = (staff: any) => {
    return {
      basic_salary: staff.basic_salary || 0,
      housing_allowance: staff.housing_allowance || 0,
      transport_allowance: staff.transport_allowance || 0,
      other_allowances: staff.other_allowances || 0,
      is_cooperative_member: staff.is_cooperative_member || false,
      cooperative_savings_amount: staff.cooperative_savings_amount || 7000,
      loan_repayment_amount: staff.loan_repayment_amount || 0,
      savings_months: staff.savings_months ?? "",
    };
  };

  const grossSalary = (staff: any) => {
    const form = editForm[staff.id] || getInitialForm(staff);
    return (form.basic_salary || 0) + (form.housing_allowance || 0) + (form.transport_allowance || 0) + (form.other_allowances || 0);
  };

  const savingsDeduction = (staff: any) => {
    const form = editForm[staff.id] || getInitialForm(staff);
    if (!form.is_cooperative_member) return 0;
    return Number(form.cooperative_savings_amount || 0);
  };

  const handleRecordSavings = async () => {
    if (!savingsModalStaff) return;
    setSavingsLoading(true);
    setSavingsError("");
    setSavingsSuccess("");
    try {
      const { member } = await syncStaffCooperativeMember(savingsModalStaff, { created_by: user?.id });
      if (!member?.id) throw new Error("Failed to create/find cooperative member record");

      const result = await recordBulkSavingsDeposits({
        member_id: member.id,
        amount_per_month: savingsAmount,
        months: savingsMonths,
        notes: savingsNotes || "Manual savings by admin",
        recorded_by: user?.id || "",
        branch_id: savingsModalStaff.branch_id || undefined,
      });

      setSavingsSuccess(
        `${savingsMonths} month${savingsMonths > 1 ? "s" : ""} of savings recorded! Total: ₦${result.total.toLocaleString()}`
      );
      setSavingsMonths(1);
      setSavingsAmount(0);
      setSavingsNotes("");
      setTimeout(() => { setSavingsSuccess(""); setSavingsModalStaff(null); }, 3000);
    } catch (err: any) {
      setSavingsError(err?.message || "Failed to record savings");
    }
    setSavingsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Staff Salary & Deductions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage staff salaries, cooperative membership, and salary deductions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Search Staff</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, staff ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
              />
            </div>
          </div>
          {!isRestricted && (
            <div className="w-48">
              <label className="block text-xs text-gray-500 font-medium mb-1.5">Branch</label>
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                >
                  <option value="">All Branches</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Staff</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Basic Salary</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Allowances</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Gross Salary</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Cooperative Member</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Savings Amount</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Months Saved</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Savings Deduction</th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan Repayment</th>
                <th className="px-4 py-4 text-right text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No staff found.</td></tr>
              ) : staffList.map((staff) => {
                const form = editForm[staff.id] || getInitialForm(staff);
                return (
                  <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{staff.first_name} {staff.last_name}</p>
                        <p className="text-xs text-gray-400">{staff.staff_id} • {staff.job_role || "Staff"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={form.basic_salary}
                        onChange={(e) => updateField(staff.id, "basic_salary", parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <input type="number" placeholder="Housing" value={form.housing_allowance} onChange={(e) => updateField(staff.id, "housing_allowance", parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right" />
                        <input type="number" placeholder="Transport" value={form.transport_allowance} onChange={(e) => updateField(staff.id, "transport_allowance", parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right" />
                        <input type="number" placeholder="Other" value={form.other_allowances} onChange={(e) => updateField(staff.id, "other_allowances", parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-navy-900">₦{grossSalary(staff).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_cooperative_member}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateField(staff.id, "is_cooperative_member", checked);
                            if (checked && !form.cooperative_savings_amount) {
                              const min = (staff.loan_repayment_amount || 0) > 0 ? 5000 : 7000;
                              updateField(staff.id, "cooperative_savings_amount", min);
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className={`text-xs font-semibold ${form.is_cooperative_member ? 'text-green-600' : 'text-gray-400'}`}>
                          {form.is_cooperative_member ? "Auto-Detected" : "No"}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      {form.is_cooperative_member ? (
                        <input
                          type="number"
                          min={(staff.loan_repayment_amount || 0) > 0 ? 5000 : 7000}
                          value={form.cooperative_savings_amount}
                          onChange={(e) => updateField(staff.id, "cooperative_savings_amount", parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                          placeholder="₦0"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {form.is_cooperative_member ? (
                        <input
                          type="number"
                          min="0"
                          value={form.savings_months ?? ""}
                          onChange={(e) => updateField(staff.id, "savings_months", e.target.value === "" ? null : (parseInt(e.target.value, 10) || 0))}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-right"
                          placeholder="Months"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-green-600">₦{savingsDeduction(staff).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        value={form.loan_repayment_amount}
                        onChange={(e) => updateField(staff.id, "loan_repayment_amount", parseFloat(e.target.value) || 0)}
                        className="w-28 px-3 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {form.is_cooperative_member && (
                          <button
                            onClick={() => {
                              setSavingsModalStaff(staff);
                              setSavingsMonths(1);
                              setSavingsAmount(staff.cooperative_savings_amount || 7000);
                              setSavingsNotes("");
                              setSavingsError("");
                              setSavingsSuccess("");
                            }}
                            title="Record Savings"
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
                          >
                            <PiggyBank className="w-3.5 h-3.5" />
                            Savings
                          </button>
                        )}
                        <button
                          onClick={() => handleSave(staff.id)}
                          disabled={saving === staff.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {saving === staff.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ Record Savings Modal ═══════════ */}
      {savingsModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-900">Record Savings</h3>
              <button
                onClick={() => setSavingsModalStaff(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-navy-900">{savingsModalStaff.first_name} {savingsModalStaff.last_name}</p>
                <p className="text-xs text-gray-400">{savingsModalStaff.staff_id}</p>
              </div>

              {savingsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{savingsError}</div>
              )}
              {savingsSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{savingsSuccess}</div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Months *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSavingsMonths(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        savingsMonths === m
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={savingsMonths}
                    onChange={(e) => setSavingsMonths(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Or enter custom months..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Amount Per Month (₦) *</label>
                <input
                  type="number"
                  min="1"
                  value={savingsAmount || ""}
                  onChange={(e) => setSavingsAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 7000"
                />
                {savingsAmount > 0 && savingsMonths > 0 && (
                  <p className="mt-2 text-sm font-semibold text-navy-900">
                    Total: ₦{(savingsAmount * savingsMonths).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={savingsNotes}
                  onChange={(e) => setSavingsNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Backdated savings for Q1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setSavingsModalStaff(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordSavings}
                disabled={savingsLoading || savingsAmount <= 0 || savingsMonths < 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PiggyBank className="w-4 h-4" />}
                Record ₦{(savingsAmount * savingsMonths).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
