import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Users,
  PiggyBank,
  Landmark,
  Percent,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Map,
  TrendingUp,
  TrendingDown,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { fetchBranch, fetchMembers, fetchStaff, updateBranch } from "../lib/db";

const tabs = ["Overview", "Staff", "Members"];

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("Overview");
  const [branch, setBranch] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ── Edit Modal ── */
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", address: "", city: "", state: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const loadBranch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await fetchBranch(id);
      setBranch(b);
      setEditForm({ name: b.name, address: b.address, city: b.city, state: b.state, phone: b.phone, email: b.email });
      const mResult = await fetchMembers({ branch_id: id });
      setMembers(mResult.data);
      setMemberCount(mResult.count ?? mResult.data.length);
      const sResult = await fetchStaff({ branch_id: id });
      const staffArr = Array.isArray(sResult) ? sResult : [];
      setStaff(staffArr);
      setStaffCount(staffArr.length);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadBranch(); }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateBranch(id, editForm);
      setBranch({ ...branch, ...updated });
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update branch");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Branch not found.</p>
        <Link to="/branches" className="text-navy-900 hover:underline text-sm mt-2 inline-block">Back to Branches</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <Link
          to="/branches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 uppercase tracking-wide hover:text-green-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Branches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {branch.name} ({branch.code})
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {branch.address}, {branch.city}, {branch.state}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Branch
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
              Disable
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
              <FileText className="w-4 h-4" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Members"
          value={memberCount.toLocaleString()}
          sub={`${memberCount} registered`}
          subColor="text-gray-400"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Total Savings"
          value="—"
        />
        <StatCard
          icon={Landmark}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Active Loans"
          value="—"
        />
        <StatCard
          icon={Percent}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Repayment Rate"
          value="—"
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Staff Count"
          value={String(staffCount)}
          sub={`${staffCount} assigned`}
          subColor="text-gray-400"
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-navy-900 text-navy-900"
                  : "border-transparent text-gray-400 hover:text-navy-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content: Overview ─── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Branch Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
            <h3 className="text-base font-bold text-navy-900">
              Branch Information
            </h3>

            {/* Manager */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Branch Manager
              </p>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                  {branch.manager?.full_name ? branch.manager.full_name.split(" ").map((n: string) => n[0]).join("") : "--"}
                </span>
                <span className="text-sm font-medium text-navy-900">
                  {branch.manager?.full_name || "Not assigned"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Primary Address
              </p>
              <div className="flex items-start gap-2 text-sm text-navy-900">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>
                  {branch.address || "—"}
                  {branch.city && <><br />{branch.city}, {branch.state}</>}
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">
                Contact Details
              </p>
              <div className="flex items-center gap-2 text-sm text-navy-900">
                <Phone className="w-4 h-4 text-gray-400" />
                {branch.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-900">
                <Mail className="w-4 h-4 text-gray-400" />
                {branch.email || "—"}
              </div>
            </div>

            {/* Status & Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">Branch Code</p>
                <p className="text-sm font-medium text-navy-900">{branch.code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">Status</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${branch.status === "active" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${branch.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                  {branch.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Created */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-gray-400 font-semibold">Date Created</p>
              <p className="text-sm font-medium text-navy-900">{new Date(branch.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          {/* Right: Summary Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-bold text-navy-900 mb-4">Quick Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Registered Members</p>
                  <p className="text-sm font-bold text-navy-900">{memberCount}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Assigned Staff</p>
                  <p className="text-sm font-bold text-navy-900">{staffCount}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Branch Manager</p>
                  <p className="text-sm font-bold text-navy-900">{branch.manager?.full_name || "Not assigned"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Manager Email</p>
                  <p className="text-sm font-bold text-navy-900">{branch.manager?.email || "—"}</p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden border border-gray-100 relative h-48">
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-navy-900/30 flex flex-col items-center justify-end pb-4 text-white">
                <MapPin className="w-8 h-8 text-green-400 mb-2 drop-shadow" />
                <p className="text-sm font-bold">{branch.city || branch.name}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">{branch.address}</p>
              </div>
              <div className="w-full h-full bg-gray-200" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content: Staff ─── */}
      {activeTab === "Staff" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-bold text-navy-900 mb-5">Branch Staff ({staffCount})</h3>
          {staff.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No staff assigned to this branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-navy-900">{s.full_name}</td>
                      <td className="py-3 text-gray-500 capitalize">{s.role?.replace(/_/g, " ")}</td>
                      <td className="py-3 text-gray-500">{s.email || "—"}</td>
                      <td className="py-3 text-gray-500">{s.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Content: Members ─── */}
      {activeTab === "Members" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-bold text-navy-900 mb-5">Branch Members ({memberCount})</h3>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No members in this branch.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-semibold">Member</th>
                    <th className="pb-3 font-semibold">Member ID</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-navy-900">
                        <Link to={`/members/${m.id}`} className="hover:underline">{m.first_name} {m.last_name}</Link>
                      </td>
                      <td className="py-3 text-gray-500">{m.member_id}</td>
                      <td className="py-3 text-gray-500">{m.phone || "—"}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {m.status || "active"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Edit Branch Modal ═══════════ */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy-900">Edit Branch</h2>
              <button onClick={() => setShowEdit(false)} className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">Branch Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-1.5">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-1.5">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-1.5">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-1.5">Email</label>
                  <input
                    type="text"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowEdit(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
  subIcon,
  progressPct,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  subIcon?: "up" | "down";
  progressPct?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-navy-900">{value}</p>
      {sub && (
        <p className={`text-[10px] mt-1 flex items-center gap-0.5 ${subColor}`}>
          {subIcon === "up" && <TrendingUp className="w-3 h-3" />}
          {subIcon === "down" && <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
      {progressPct !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-navy-900 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
