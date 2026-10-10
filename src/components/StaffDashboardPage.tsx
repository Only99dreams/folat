import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  CalendarDays,
  ArrowRight,
  Loader2,
  ChevronRight,
  PiggyBank,
  Landmark,
  Upload,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { fetchStaffByProfileId, fetchLoanApplications, fetchMemberByEmail, fetchSavingsAccount, fetchSavingsTransactions, fetchDocuments, uploadFile, createDocument, createStaff, updateStaffSalary } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [savingsAccount, setSavingsAccount] = useState<any>(null);
  const [savingsTxns, setSavingsTxns] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [paidBackLoans, setPaidBackLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [salaryVisible, setSalaryVisible] = useState(false);
  const [editingSavings, setEditingSavings] = useState(false);
  const [savingsInput, setSavingsInput] = useState("");
  const [savingsError, setSavingsError] = useState("");
  const [savingSavings, setSavingSavings] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        let staff = await fetchStaffByProfileId(user.id);
        if (!staff && user.email) {
          const { data: staffByEmail } = await supabase.from("staff").select("*").eq("email", user.email).limit(1);
          if (staffByEmail?.[0]) staff = staffByEmail[0];
        }
        if (staff) {
          setStaffId(staff.id);
          setStaffData(staff);
          const { data: linkedMember } = await supabase
            .from("members")
            .select("id")
            .eq("staff_id", staff.id)
            .maybeSingle();
          const member = linkedMember ?? (staff.email ? await fetchMemberByEmail(staff.email) : null);
          const mid = member?.id;
          if (mid) setMemberId(mid);
          const [active, overdue, savings, txns, paidBack] = await Promise.all([
            fetchLoanApplications({ status: ["approved", "disbursed"], member_id: mid || undefined, pageSize: 5, user: { id: user.id, role: user.role, branch: user.branch } }),
            fetchLoanApplications({ status: "overdue", member_id: mid || undefined, pageSize: 5, user: { id: user.id, role: user.role, branch: user.branch } }),
            mid ? fetchSavingsAccount(mid) : Promise.resolve(null),
            mid ? fetchSavingsTransactions({ member_id: mid, pageSize: 10 }) : Promise.resolve({ data: [] }),
            mid ? fetchLoanApplications({ status: "completed", member_id: mid, pageSize: 10, user: { id: user.id, role: user.role, branch: user.branch } }) : Promise.resolve({ data: [] }),
          ]);
          setActiveLoans(active.data);
          setOverdueLoans(overdue.data);
          setSavingsAccount(savings);
          setSavingsTxns(txns.data || []);
          setPaidBackLoans(paidBack.data || []);
          const docs = await fetchDocuments("staff", staff.id);
          setDocuments(docs);
        } else if (user.email) {
          const { data: existing } = await supabase.from("staff").select("id").eq("profile_id", user.id).limit(1);
          if (existing?.[0]) {
            setStaffId(existing[0].id);
          } else {
            const names = (user.name || "Staff Member").split(" ");
            const hash = Math.random().toString(36).slice(2, 6).toUpperCase();
            const staffIdStr = "STF-" + new Date().getFullYear() + "-" + hash;
            try {
              const newStaff = await createStaff({
                profile_id: user.id,
                staff_id: staffIdStr,
                first_name: names[0] || "Staff",
                last_name: names.slice(1).join(" ") || "Member",
                email: user.email,
                phone: "",
                job_role: "staff_member",
                employment_type: "full_time",
                date_joined: new Date().toISOString().split("T")[0],
                employment_status: "active",
              });
              if (newStaff) setStaffId(newStaff.id);
            } catch (createErr) {
              console.error("Failed to auto-create staff record:", createErr);
            }
          }
        }
      } catch (err) {
        console.error("StaffDashboard load error:", err);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const totalLoanBalance = [...activeLoans, ...overdueLoans].reduce((s, l) => s + Number(l.outstanding_balance ?? l.amount_approved ?? l.amount_requested ?? 0), 0);
  const totalSavings = Number(savingsAccount?.balance ?? 0);
  const grossSalary = (staffData?.basic_salary || 0) + (staffData?.housing_allowance || 0) + (staffData?.transport_allowance || 0) + (staffData?.other_allowances || 0);
  const savingsDeduction = staffData?.is_cooperative_member ? Number(staffData?.cooperative_savings_amount || 0) : 0;
  const loanRepayment = Number(staffData?.loan_repayment_amount || 0);
  const netSalary = grossSalary - savingsDeduction - loanRepayment;

  const handleUpload = async () => {
    if (!docFile) return;
    if (!staffId) { setUploadError("Loading staff profile... please wait."); return; }
    setUploading(true);
    setUploadError("");
    try {
      const path = `staff/${staffId}/custom-${Date.now()}-${docFile.name}`;
      const url = await uploadFile("staff-documents", path, docFile);
      await createDocument({ owner_type: "staff", owner_id: staffId, document_type: docType, name: docFile.name, file_url: url, file_size: docFile.size, mime_type: docFile.type });
      const docs = await fetchDocuments("staff", staffId);
      setDocuments(docs);
      setDocFile(null);
      setDocType("other");
      const fileInput = document.querySelector<HTMLInputElement>('#staff-dashboard-doc-input');
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err?.message || "Upload failed");
    }
    setUploading(false);
  };

  const quickLinks = [
    {
      title: "Cooperative Loan Request",
      description: "Apply for a cooperative loan for yourself.",
      to: "/loans/cooperative-request",
      icon: FileText,
    },
    {
      title: "Messages",
      description: "Send and receive internal communication.",
      to: "/communication/messages",
      icon: MessageSquare,
    },
    {
      title: "Leave Requests",
      description: "Submit and track your leave applications.",
      to: "/hr/leave-requests",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome. Use the quick actions below to access your daily tools.
          </p>
        </div>
        <button
          onClick={() => setSalaryVisible(!salaryVisible)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
          title={salaryVisible ? "Hide salary information" : "Show salary information"}
        >
          {salaryVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {salaryVisible ? "Hide Salary" : "Show Salary"}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
              <PiggyBank className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Amount Saved</p>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-navy-900 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-navy-900">₦{totalSavings.toLocaleString()}</p>
              )}
              {savingsAccount?.account_number && (
                <p className="text-xs text-gray-400 mt-1">Account: {savingsAccount.account_number}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <Landmark className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Amount Owed</p>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-navy-900 mt-1" />
              ) : (
                <p className="text-3xl font-bold text-navy-900">₦{totalLoanBalance.toLocaleString()}</p>
              )}
              {!loading && <p className="text-xs text-gray-400 mt-1">{activeLoans.length + overdueLoans.length} active loan(s)</p>}
            </div>
          </div>
        </div>

        {staffData && salaryVisible && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Net Salary</p>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-navy-900 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-navy-900">₦{netSalary.toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Gross ₦{grossSalary.toLocaleString()} − Savings ₦{savingsDeduction.toLocaleString()} − Loan ₦{loanRepayment.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {staffData?.is_cooperative_member && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-navy-900">My Monthly Savings</h2>
              {!editingSavings && (
                <button
                  onClick={() => { setEditingSavings(true); setSavingsInput(String(staffData?.cooperative_savings_amount || "")); setSavingsError(""); }}
                  className="text-xs font-semibold text-green-600 hover:text-green-700"
                >
                  Edit
                </button>
              )}
            </div>
            {editingSavings ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1">Monthly Savings Amount (₦)</label>
                  <input
                    type="number"
                    min={totalLoanBalance > 0 ? 5000 : 7000}
                    value={savingsInput}
                    onChange={(e) => { setSavingsInput(e.target.value); setSavingsError(""); }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                    placeholder={totalLoanBalance > 0 ? "Minimum ₦5,000" : "Minimum ₦7,000"}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum: {totalLoanBalance > 0 ? "₦5,000 (you have an active loan)" : "₦7,000"}
                  </p>
                </div>
                {savingsError && <p className="text-xs text-red-500">{savingsError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const val = parseFloat(savingsInput);
                      const min = totalLoanBalance > 0 ? 5000 : 7000;
                      if (!val || val < min) {
                        setSavingsError(`Minimum savings is ₦${min.toLocaleString()}`);
                        return;
                      }
                      setSavingSavings(true);
                      try {
                        await updateStaffSalary(staffId, { cooperative_savings_amount: val });
                        setStaffData((prev: any) => ({ ...prev, cooperative_savings_amount: val }));
                        setEditingSavings(false);
                      } catch (e: any) {
                        setSavingsError(e?.message || "Failed to save");
                      }
                      setSavingSavings(false);
                    }}
                    disabled={savingSavings}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {savingSavings ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingSavings(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-navy-900 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-lg font-bold text-green-700">
                {staffData?.is_cooperative_member 
                  ? `₦${Number(staffData?.cooperative_savings_amount || 0).toLocaleString()}/month`
                  : "N/A"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-xl border border-gray-100 bg-white p-5 transition hover:border-green-200 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-navy-900">{item.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Salary & Deductions Summary */}
      {staffData && salaryVisible && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-navy-900 mb-4">My Salary & Deductions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Basic Salary</p>
              <p className="text-lg font-bold text-navy-900 mt-1">₦{Number(staffData?.basic_salary ?? 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Gross Salary</p>
              <p className="text-lg font-bold text-navy-900 mt-1">₦{Number((staffData?.basic_salary || 0) + (staffData?.housing_allowance || 0) + (staffData?.transport_allowance || 0) + (staffData?.other_allowances || 0)).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold">Savings Deduction</p>
              <p className="text-lg font-bold text-green-700 mt-1">
                {staffData?.is_cooperative_member ? `₦${Number(staffData?.cooperative_savings_amount || 0).toLocaleString()}` : "N/A"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-[10px] tracking-[0.1em] uppercase text-blue-600 font-semibold">Loan Repayment</p>
              <p className="text-lg font-bold text-blue-700 mt-1">₦{Number(staffData?.loan_repayment_amount ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Loans & Overdue Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">My Active Loans</h2>
            <Link to="/loans/active" className="text-xs font-semibold text-green-600 hover:text-green-700">View All</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
          ) : activeLoans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active loans</p>
          ) : (
            <div className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Link to={`/loans/${loan.id}`} className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                      <p className="text-xs text-gray-400">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()} owed</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-navy-900">My Overdue Loans</h2>
            <Link to="/loans/overdue" className="text-xs font-semibold text-green-600 hover:text-green-700">View All</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
          ) : overdueLoans.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No overdue loans</p>
          ) : (
            <div className="space-y-3">
              {overdueLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                  <Link to={`/loans/${loan.id}`} className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{loan.loan_id}</p>
                      <p className="text-xs text-red-500">₦{Number(loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0).toLocaleString()} owed</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paid Back Loans */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Paid Back Loans</h2>
          <Link to="/loans/completed" className="text-xs font-semibold text-green-600 hover:text-green-700">View All</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
        ) : paidBackLoans.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No paid back loans yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Loan ID</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Type</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {paidBackLoans.slice(0, 5).map((loan: any) => (
                  <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/loans/${loan.id}`} className="text-sm font-semibold text-navy-900 hover:text-green-700">{loan.loan_id}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">{loan.loan_type}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">₦{Number(loan.status === 'completed' ? (loan.amount_approved ?? loan.amount_requested ?? 0) : (loan.outstanding_balance ?? loan.amount_approved ?? loan.amount_requested ?? 0)).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{loan.updated_at ? new Date(loan.updated_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-navy-900">Recent Savings Transactions</h2>
          <Link to="/savings/transactions" className="text-xs font-semibold text-green-600 hover:text-green-700">View All</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
        ) : savingsTxns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Date</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Type</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Amount</th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Ref</th>
                </tr>
              </thead>
              <tbody>
                {savingsTxns.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold capitalize ${t.type === "deposit" ? "text-green-600" : "text-red-500"}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-semibold ${t.type === "deposit" ? "text-green-600" : "text-red-500"}`}>
                        {t.type === "deposit" ? "+" : "-"}₦{Number(t.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{t.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-navy-900 mb-4">My Documents</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end mb-6">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium mb-1">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900">
              <option value="contract">Contract</option>
              <option value="resume">Resume / CV</option>
              <option value="id_card">ID Card</option>
              <option value="passport">Passport</option>
              <option value="certificate">Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium mb-1">File</label>
            <input id="staff-dashboard-doc-input" type="file" onChange={e => { setDocFile(e.target.files?.[0] || null); setUploadError(""); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800" />
          </div>
          <button
            disabled={!docFile || uploading}
            onClick={handleUpload}
            className="flex items-center gap-2 px-5 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
        </div>
        {uploadError && <p className="text-xs text-red-500 mb-3">{uploadError}</p>}
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc: any) => (
              <div key={doc.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{(doc.document_type || "other").replace("_", " ")}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors">
                    View Document <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
