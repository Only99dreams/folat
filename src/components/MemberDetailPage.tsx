import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Pencil,
  FileText,
  CreditCard,
  Landmark,
  UserX,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  Upload,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { fetchMember, fetchSavingsAccount, fetchSavingsTransactions, fetchLoanApplications, fetchAuditLog, fetchDocuments, uploadFile, createDocument, updateMember, fetchBranches, fetchGroups } from "../lib/db";

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const tabs = ["Overview", "Savings", "Loans", "Documents", "Activity Log"];
  const [member, setMember] = useState<any>(null);
  const [savings, setSavings] = useState<any>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [allLoans, setAllLoans] = useState<any[]>([]);
  const [savingsTxns, setSavingsTxns] = useState<any[]>([]);
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /* ── Edit state ── */
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editError, setEditError] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const startEditing = (m?: any) => {
    const source = m || member;
    if (!source) return;
    setEditForm({
      first_name: source.first_name ?? "",
      last_name: source.last_name ?? "",
      other_names: source.other_names ?? "",
      gender: source.gender ?? "",
      date_of_birth: source.date_of_birth ?? "",
      phone: source.phone ?? "",
      email: source.email ?? "",
      address: source.address ?? "",
      city: source.city ?? "",
      state: source.state ?? "",
      national_id: source.national_id ?? "",
      branch_id: source.branch_id ?? "",
      group_id: source.group_id ?? "",
      status: source.status ?? "active",
      contribution_type: source.contribution_type ?? "monthly",
      nok_name: source.nok_name ?? "",
      nok_phone: source.nok_phone ?? "",
      nok_relationship: source.nok_relationship ?? "",
      nok_address: source.nok_address ?? "",
      guarantor_name: source.guarantor_name ?? "",
      guarantor_phone: source.guarantor_phone ?? "",
      guarantor_relationship: source.guarantor_relationship ?? "",
      guarantor_address: source.guarantor_address ?? "",
    });
    setEditError("");
    setEditing(true);
    // Load branches/groups for dropdowns
    if (branches.length === 0) fetchBranches().then(setBranches).catch(() => {});
    if (groups.length === 0) fetchGroups().then((g: any) => setGroups(g.data || g)).catch(() => {});
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setEditError("");
    try {
      await updateMember(id, editForm);
      const m = await fetchMember(id);
      setMember(m);
      setEditing(false);
    } catch (err: any) {
      setEditError(err?.message || "Failed to save changes");
    }
    setSaving(false);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const m = await fetchMember(id);
        setMember(m);
        const sa = await fetchSavingsAccount(id).catch(() => null);
        setSavings(sa);
        const [disbursedLoans, allLoansRes, txns, audit] = await Promise.all([
          fetchLoanApplications({ member_id: id, status: "disbursed" }),
          fetchLoanApplications({ member_id: id, pageSize: 50 }),
          sa ? fetchSavingsTransactions({ member_id: id, pageSize: 50 }) : Promise.resolve({ data: [], count: 0 }),
          fetchAuditLog({ page: 1, pageSize: 20 }),
        ]);
        setActiveLoans(disbursedLoans.data);
        setAllLoans(allLoansRes.data);
        setSavingsTxns(txns.data);
        setAuditEntries(audit.data.filter((a: any) => a.entity_id === id));
        const docs = await fetchDocuments("member", id);
        setDocuments(docs);
        if (searchParams.get("edit") === "true") {
          startEditing(m);
          setSearchParams({}, { replace: true });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!member) return <div className="text-center py-20 text-gray-400">Member not found</div>;

  return (
    <>
    <div className="space-y-6">
      {/* ─── Back Link ─── */}
      <Link
        to="/members"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Link>

      {/* ═══════════ Header ═══════════ */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-navy-900">
                  {member.first_name} {member.last_name}
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-navy-900">{member.member_id}</span>
                <span className="mx-1.5">·</span>
                {member.branch?.name ?? "—"}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {member.address || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button onClick={() => startEditing()} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <Link to={`/savings/statement?member_id=${id}`} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Statement
            </Link>
            <Link to={`/savings/deposit?member_id=${id}`} className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
              <CreditCard className="w-4 h-4" />
              Record Deposit
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════ Quick Actions ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate(`/savings/deposit?member_id=${id}`)}
          className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-xl border border-gray-100 hover:border-navy-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-navy-900" />
          </div>
          <span className="text-sm font-medium text-navy-900">Record Deposit</span>
        </button>
        <button
          onClick={() => navigate(`/loans/apply?member_id=${id}`)}
          className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-xl border border-gray-100 hover:border-navy-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-navy-900" />
          </div>
          <span className="text-sm font-medium text-navy-900">Apply Loan</span>
        </button>
        <button
          onClick={async () => {
            if (!id || !member) return;
            const newStatus = member.status === "suspended" ? "active" : "suspended";
            try {
              await updateMember(id, { status: newStatus });
              const m = await fetchMember(id);
              setMember(m);
            } catch {}
          }}
          className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-xl border border-gray-100 hover:border-navy-200 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <UserX className="w-5 h-5 text-navy-900" />
          </div>
          <span className="text-sm font-medium text-navy-900">
            {member.status === "suspended" ? "Activate Member" : "Suspend Member"}
          </span>
        </button>
      </div>

      {/* ═══════════ Stats Row ═══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Savings Balance */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Savings Balance
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{savings ? Number(savings.balance).toLocaleString() : 0}</p>
        </div>

        {/* Active Loan */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Active Loan
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{activeLoans.length > 0 ? Number(activeLoans[0].amount_approved ?? activeLoans[0].amount_requested).toLocaleString() : 0}</p>
          <p className="text-xs text-gray-400 mt-1.5">{activeLoans.length > 0 ? `Loan: ${activeLoans[0].loan_id}` : "No active loan"}</p>
        </div>

        {/* Loan Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Loan Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-navy-900">{activeLoans.length > 0 ? "Active" : "None"}</p>
            <span className={`w-2.5 h-2.5 rounded-full ${activeLoans.length > 0 ? "bg-green-500" : "bg-gray-400"}`} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {activeLoans.length > 0 ? "On track for repayment" : "No active loan"}
          </p>
        </div>

        {/* Total Deposits */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
            Total Deposits
          </p>
          <p className="text-2xl font-bold text-navy-900 mt-1">₦{savings ? Number(savings.balance).toLocaleString() : 0}</p>
          <p className="text-xs text-gray-400 mt-1.5">Lifetime total value</p>
        </div>
      </div>

      {/* ═══════════ Tab Bar ═══════════ */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-navy-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ Tab Content ═══════════ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ─── Left Column (2/3) ─── */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-navy-900">
                  Personal Information
                </h3>
                <button onClick={() => startEditing()} className="text-sm text-navy-900 font-medium hover:underline">
                  Update
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.first_name} {member.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Email Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Home Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.address || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Occupation
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.occupation || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cooperative Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Cooperative Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Membership ID
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.member_id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Date Joined
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {new Date(member.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Branch
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.branch?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
                    Membership Status
                  </p>
                  {(() => {
                    const s = (member.status || "active").toLowerCase();
                    const colors: Record<string,string> = { active: "bg-green-50 text-green-700 border-green-200", inactive: "bg-gray-100 text-gray-500 border-gray-200", suspended: "bg-red-50 text-red-600 border-red-200" };
                    const dotColors: Record<string,string> = { active: "bg-green-500", inactive: "bg-gray-400", suspended: "bg-red-500" };
                    return (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${colors[s] || colors.active}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[s] || dotColors.active}`} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column (1/3) ─── */}
          <div className="space-y-5">
            {/* Guarantor Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Guarantor Info
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-bold">
                  {member.guarantor_name ? member.guarantor_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2) : "—"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {member.guarantor_name || "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {member.guarantor_relationship || "No guarantor assigned"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Contact
                  </p>
                  <p className="text-sm font-medium text-navy-900">
                    {member.guarantor_phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-0.5">
                    Address
                  </p>
                  <p className="text-sm font-medium text-navy-900">{member.guarantor_address || "—"}</p>
                </div>
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-5">
                Financial Snapshot
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-base font-bold text-navy-900">₦{savings?.balance?.toLocaleString() ?? "0"}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Active Loans
                  </p>
                  <p className="text-base font-bold text-navy-900">{activeLoans.length}</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total Loan Amount
                  </p>
                  <p className="text-base font-bold text-navy-900">₦{activeLoans.reduce((s: number, l: any) => s + (l.amount || 0), 0).toLocaleString()}</p>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Membership tenure: {Math.max(0, Math.floor((Date.now() - new Date(member.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))} years
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Savings Tab ═══════════ */}
      {activeTab === "Savings" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-navy-900">Savings Transactions</h3>
            <p className="text-sm text-gray-500">
              Balance: <span className="font-bold text-navy-900">₦{savings ? Number(savings.balance).toLocaleString() : "0"}</span>
            </p>
          </div>
          {savingsTxns.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No savings transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] tracking-[0.1em] uppercase text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Balance After</th>
                    <th className="pb-3 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {savingsTxns.map((txn: any) => (
                    <tr key={txn.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-gray-500 text-xs">{new Date(txn.created_at).toLocaleDateString()}</td>
                      <td className="py-3 font-medium text-navy-900 text-xs">{txn.transaction_id}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          txn.type === "deposit" ? "bg-green-50 text-green-700" : txn.type === "withdrawal" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
                        }`}>
                          {txn.type === "deposit" ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-3 font-semibold ${txn.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                        {txn.type === "deposit" ? "+" : "-"}₦{Number(txn.amount).toLocaleString()}
                      </td>
                      <td className="py-3 text-navy-900 font-medium">₦{Number(txn.balance_after).toLocaleString()}</td>
                      <td className="py-3 text-gray-500 text-xs capitalize">{txn.payment_method || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Loans Tab ═══════════ */}
      {activeTab === "Loans" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-bold text-navy-900 mb-4">Loan Applications</h3>
          {allLoans.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No loan applications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] tracking-[0.1em] uppercase text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Loan ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {allLoans.map((loan: any) => {
                    const statusCls: Record<string, string> = {
                      pending: "bg-yellow-100 text-yellow-700",
                      approved: "bg-green-100 text-green-700",
                      rejected: "bg-red-100 text-red-700",
                      active: "bg-blue-100 text-blue-700",
                      disbursed: "bg-green-100 text-green-700",
                      completed: "bg-gray-100 text-gray-700",
                      defaulted: "bg-red-100 text-red-700",
                    };
                    return (
                      <tr key={loan.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 font-medium text-navy-900 text-xs">{loan.loan_id}</td>
                        <td className="py-3 text-gray-500 text-xs capitalize">{loan.loan_type}</td>
                        <td className="py-3 font-semibold text-navy-900">₦{Number(loan.amount_approved ?? loan.amount_requested).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCls[loan.status] || "bg-gray-100 text-gray-600"}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{loan.duration_months} months</td>
                        <td className="py-3 text-gray-400 text-xs">{new Date(loan.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Documents Tab ═══════════ */}
      {activeTab === "Documents" && (
        <div className="space-y-6">
          {/* Upload Form */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-navy-900 mb-4">Upload Document</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 font-medium mb-1">Document Type</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900">
                  <option value="id_card">ID Card</option>
                  <option value="passport">Passport</option>
                  <option value="guarantor_form">Guarantor Form</option>
                  <option value="loan_agreement">Loan Agreement</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 font-medium mb-1">File</label>
                <input type="file" onChange={e => { setDocFile(e.target.files?.[0] || null); setUploadError(""); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800" />
              </div>
              <button
                disabled={!docFile || uploading}
                onClick={async () => {
                  if (!docFile || !id) return;
                  setUploading(true);
                  setUploadError("");
                  try {
                    const path = `members/${id}/${docType}-${Date.now()}-${docFile.name}`;
                    const url = await uploadFile("documents", path, docFile);
                    await createDocument({ owner_type: "member", owner_id: id, document_type: docType, name: docFile.name, file_url: url, file_size: docFile.size, mime_type: docFile.type });
                    const docs = await fetchDocuments("member", id);
                    setDocuments(docs);
                    setDocFile(null);
                    setDocType("other");
                    const fileInput = document.querySelector<HTMLInputElement>('#member-doc-input');
                    if (fileInput) fileInput.value = '';
                  } catch (err: any) {
                    setUploadError(err?.message || "Upload failed");
                  }
                  setUploading(false);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload
              </button>
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          </div>

          {/* Document List */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-bold text-navy-900 mb-4">Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No documents uploaded for this member yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {doc.file_size > 0 && <p className="text-xs text-gray-300">{(doc.file_size / 1024).toFixed(0)} KB</p>}
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
      )}

      {/* ═══════════ Activity Log Tab ═══════════ */}
      {activeTab === "Activity Log" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-bold text-navy-900 mb-4">Activity Log</h3>
          {auditEntries.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No activity recorded for this member yet.</p>
          ) : (
            <div className="space-y-4">
              {auditEntries.map((a: any) => {
                const ago = (() => {
                  const mins = Math.floor((Date.now() - new Date(a.created_at).getTime()) / 60000);
                  if (mins < 60) return `${mins} mins ago`;
                  if (mins < 1440) return `${Math.floor(mins / 60)} hours ago`;
                  return `${Math.floor(mins / 1440)} days ago`;
                })();
                return (
                  <div key={a.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 bg-green-500" />
                    <div>
                      <p className="text-xs text-navy-900 font-medium">
                        {a.user?.full_name || "System"} — {a.action} {a.entity_type}
                      </p>
                      <p className="text-[10px] text-gray-400">{ago} · {new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

      {/* ═══════════ Edit Member Modal ═══════════ */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-navy-900">Edit Member</h3>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {editError && <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{editError}</div>}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                <input type="text" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                <input type="text" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Other Names</label>
                <input type="text" value={editForm.other_names} onChange={e => setEditForm(f => ({ ...f, other_names: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                <select value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">National ID</label>
                <input type="text" value={editForm.national_id} onChange={e => setEditForm(f => ({ ...f, national_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input type="text" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                <input type="text" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                <input type="text" value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Branch / Group / Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                <select value={editForm.branch_id} onChange={e => setEditForm(f => ({ ...f, branch_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select branch</option>
                  {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Group</label>
                <select value={editForm.group_id} onChange={e => setEditForm(f => ({ ...f, group_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select group</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contribution Type</label>
                <select value={editForm.contribution_type} onChange={e => setEditForm(f => ({ ...f, contribution_type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Next of Kin */}
              <div className="md:col-span-2 pt-2"><p className="text-sm font-bold text-navy-900 border-b border-gray-100 pb-2">Next of Kin</p></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input type="text" value={editForm.nok_name} onChange={e => setEditForm(f => ({ ...f, nok_name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" value={editForm.nok_phone} onChange={e => setEditForm(f => ({ ...f, nok_phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                <input type="text" value={editForm.nok_relationship} onChange={e => setEditForm(f => ({ ...f, nok_relationship: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input type="text" value={editForm.nok_address} onChange={e => setEditForm(f => ({ ...f, nok_address: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Guarantor */}
              <div className="md:col-span-2 pt-2"><p className="text-sm font-bold text-navy-900 border-b border-gray-100 pb-2">Guarantor</p></div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                <input type="text" value={editForm.guarantor_name} onChange={e => setEditForm(f => ({ ...f, guarantor_name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input type="text" value={editForm.guarantor_phone} onChange={e => setEditForm(f => ({ ...f, guarantor_phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                <input type="text" value={editForm.guarantor_relationship} onChange={e => setEditForm(f => ({ ...f, guarantor_relationship: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <input type="text" value={editForm.guarantor_address} onChange={e => setEditForm(f => ({ ...f, guarantor_address: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !editForm.first_name?.trim() || !editForm.last_name?.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
