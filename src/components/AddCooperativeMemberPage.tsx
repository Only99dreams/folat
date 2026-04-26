import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  PiggyBank,
  Users,
  Loader2,
  AlertCircle,
  Search,
  CheckCircle2,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import {
  createMember,
  generateMemberId,
  fetchBranches,
  searchStaffForCooperative,
} from "../lib/db";
import { useAuth } from "../auth/useAuth";

/* ─── read-only display field ─── */
const ReadField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-navy-900 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
      {value || "—"}
    </p>
  </div>
);

export default function AddCooperativeMemberPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Step 1: staff search ── */
  const [staffSearch, setStaffSearch] = useState("");
  const [staffResults, setStaffResults] = useState<any[]>([]);
  const [searchingStaff, setSearchingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  /* ── Cooperative Details ── */
  const [memberId, setMemberId] = useState("");
  const [branch, setBranch] = useState("");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);

  /* ── Savings Setup ── */
  const [initialDeposit, setInitialDeposit] = useState("0.00");
  const [contributionType, setContributionType] = useState("monthly");

  /* ── State ── */
  const [branches, setBranches] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    generateMemberId().then(setMemberId).catch(console.error);
    fetchBranches().then(setBranches).catch(console.error);
  }, []);

  /* ── staff search ── */
  const handleStaffSearch = useCallback(async (q: string) => {
    setStaffSearch(q);
    if (q.length < 2) { setStaffResults([]); return; }
    setSearchingStaff(true);
    try {
      const data = await searchStaffForCooperative(q);
      setStaffResults(data);
    } catch { setStaffResults([]); }
    setSearchingStaff(false);
  }, []);

  const pickStaff = (s: any) => {
    setSelectedStaff(s);
    setStaffSearch(`${s.first_name} ${s.last_name} (${s.staff_id})`);
    setStaffResults([]);
    if (s.branch_id) setBranch(s.branch_id);
    setAlreadyMember(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedStaff) {
      setError("Please search and select a staff member first.");
      return;
    }
    setSubmitting(true);
    try {
      const freshMemberId = await generateMemberId();
      setMemberId(freshMemberId);
      await createMember({
        member_id: freshMemberId,
        member_type: "cooperative",
        staff_id: selectedStaff.id,
        first_name: selectedStaff.first_name,
        last_name: selectedStaff.last_name,
        gender: selectedStaff.gender
          ? selectedStaff.gender.charAt(0).toUpperCase() + selectedStaff.gender.slice(1).toLowerCase()
          : "",
        date_of_birth: selectedStaff.date_of_birth || null,
        phone: selectedStaff.phone || "",
        email: selectedStaff.email || "",
        address: selectedStaff.address || "",
        branch_id: branch || selectedStaff.branch_id || null,
        group_id: null,
        join_date: joinDate,
        initial_deposit: parseFloat(initialDeposit.replace(/,/g, "")) || 0,
        contribution_type: contributionType,
        created_by: user?.id,
        status: "active",
      });
      navigate("/members");
    } catch (err: any) {
      if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
        setAlreadyMember(true);
        setError("This staff member is already registered as a cooperative member.");
      } else {
        setError(err.message || "Failed to register cooperative member.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-8">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Register Cooperative Member</h1>
        <p className="text-sm text-gray-500 mt-1">
          Only active staff can be registered as cooperative members. Search by name, phone number, or staff code.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ─── Section 1: Staff Search ─── */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-navy-900" />
          <h2 className="text-lg font-bold text-navy-900">Find Staff Member</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          Search the staff directory. Only active employees are shown. Registering here enrols them as a cooperative member.
        </p>

        <div className="relative">
          <label className="block text-sm font-medium text-navy-900 mb-1.5">
            Search by Name, Phone or Staff Code
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Adeyemi, 08012345678, STF-001..."
              value={staffSearch}
              onChange={(e) => handleStaffSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
            {searchingStaff && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {staffResults.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {staffResults.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickStaff(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-navy-900">
                    {s.first_name} {s.last_name}
                    <span className="ml-2 text-xs font-normal text-gray-400">{s.staff_id}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.job_role || "—"} · {s.phone}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStaff && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Staff member selected — details auto-filled from HR records
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ReadField label="Full Name" value={`${selectedStaff.first_name} ${selectedStaff.last_name}`} />
              <ReadField label="Staff Code" value={selectedStaff.staff_id} />
              <ReadField label="Phone" value={selectedStaff.phone} />
              <ReadField label="Email" value={selectedStaff.email} />
              <ReadField label="Job Role" value={selectedStaff.job_role} />
              <ReadField label="Gender" value={selectedStaff.gender} />
            </div>
          </div>
        )}

        {alreadyMember && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">This staff member is already a cooperative member.</p>
          </div>
        )}
      </section>

      {/* ─── Section 2: Cooperative Details ─── */}
      <section className={`bg-white rounded-xl border border-gray-100 p-6 space-y-5 transition-opacity ${!selectedStaff ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-navy-900" />
          <h2 className="text-lg font-bold text-navy-900">Cooperative Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-medium text-navy-900 mb-1.5">Member ID (auto-generated)</p>
            <input
              type="text"
              value={memberId}
              readOnly
              className="w-full px-4 py-2.5 border border-green-200 rounded-lg text-sm font-medium text-green-700 bg-green-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Join Date</label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-[38px] w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── Section 3: Savings Setup ─── */}
      <section className={`bg-white rounded-xl border border-gray-100 p-6 space-y-5 transition-opacity ${!selectedStaff ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank className="w-5 h-5 text-navy-900" />
          <h2 className="text-lg font-bold text-navy-900">Savings Setup</h2>
        </div>
        <p className="text-sm text-gray-500 -mt-2">
          The member must save for at least <strong>6 consecutive months</strong> before they can apply for a cooperative loan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Initial Deposit (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
              <input
                type="text"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-navy-900 mb-1.5">Contribution Type</p>
            <div className="flex gap-3">
              {["monthly", "weekly"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContributionType(type)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                    contributionType === type
                      ? "border-navy-900 bg-navy-900/5 text-navy-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${contributionType === type ? "border-navy-900" : "border-gray-300"}`}>
                    {contributionType === type && <span className="w-2 h-2 rounded-full bg-navy-900" />}
                  </span>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Link to="/members" className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || !selectedStaff}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {submitting ? "Registering…" : "Register Cooperative Member"}
        </button>
      </div>
    </form>
  );
}

