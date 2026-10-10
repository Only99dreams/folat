import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  UserCheck,
  Building2,
  Users,
} from "lucide-react";
import { fetchBranches, fetchStaff, assignBranchStaff, fetchBranchAssignments, removeBranchAssignment } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";

export default function BranchAssignmentsPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState<"branch_manager" | "secretary" | "officer">("secretary");
  const isBranchManager = user?.role === "branch_manager";
  const isSecretaryOrOfficer = user?.role === "secretary" || user?.role === "officer";
  const restrictToOwnBranch = isBranchManager || isSecretaryOrOfficer;

  useEffect(() => {
    fetchBranches().then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    if (restrictToOwnBranch && user?.branch && !selectedBranch) {
      (async () => {
        const { data: branchData } = await supabase
          .from("branches")
          .select("id")
          .ilike("name", user.branch)
          .maybeSingle();
        if (branchData?.id) setSelectedBranch(branchData.id);
      })();
    }
  }, [restrictToOwnBranch, user?.branch]);

  useEffect(() => {
    if (!selectedBranch) {
      setAssignments([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchBranchAssignments(selectedBranch);
        setAssignments(data);
      } catch {}
      setLoading(false);
    })();
  }, [selectedBranch]);

  useEffect(() => {
    (async () => {
      if (!search.trim()) { setStaffList([]); return; }
      try {
        const data = await fetchStaff({ search, user: user ? { id: user.id, role: user.role, branch: user.branch } : undefined });
        setStaffList(data);
      } catch {
        setStaffList([]);
      }
    })();
  }, [search]);

  const handleAssign = async () => {
    if (!selectedBranch || !selectedStaffId) return;
    
    setSaving(true);
    try {
      await assignBranchStaff(selectedBranch, selectedStaffId, assignmentType);
      setSearch("");
      setSelectedStaffId(null);
      setStaffList([]);
      const data = await fetchBranchAssignments(selectedBranch);
      setAssignments(data);
    } catch (e: any) {
      alert(e.message || "Failed to assign");
    }
    setSaving(false);
  };

  const handleRemove = async (assignmentId: string, staffId: string, type: string) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      await removeBranchAssignment(selectedBranch, staffId, type);
      const data = await fetchBranchAssignments(selectedBranch);
      setAssignments(data);
    } catch (e: any) {
      alert(e.message || "Failed to remove");
    }
  };

  const branchName = branches.find(b => b.id === selectedBranch)?.name || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Branch Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Assign Branch Managers, Secretaries, or Officers to branches.
        </p>
      </div>

      {/* Branch Selector */}
      {!restrictToOwnBranch && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2">Select Branch</label>
          <div className="relative max-w-md">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            >
              <option value="">Choose a branch...</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {selectedBranch && (
        <>
          {/* Assign New Staff */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-navy-900 mb-4">Assign Staff to {branchName}</h2>
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
                {search && staffList.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {staffList.slice(0, 5).map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSearch(`${s.first_name} ${s.last_name} (${s.staff_id})`); setSelectedStaffId(s.id); }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0 ${selectedStaffId === s.id ? "bg-green-50 text-green-700" : ""}`}
                      >
                        {s.first_name} {s.last_name} • {s.staff_id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-48">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value as any)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  >
                    {restrictToOwnBranch ? (
                      <>
                        <option value="secretary">Secretary</option>
                        <option value="officer">Officer</option>
                      </>
                    ) : (
                      <>
                        <option value="branch_manager">Branch Manager</option>
                        <option value="secretary">Secretary</option>
                        <option value="officer">Officer</option>
                      </>
                    )}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleAssign}
                disabled={saving || !selectedStaffId}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Assign
              </button>
            </div>
          </div>

          {/* Current Assignments */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-navy-900">Current Assignments</h2>
            </div>
            {loading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" /></div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No assignments yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {assignments.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        a.assignment_type === 'branch_manager' ? 'bg-blue-50 text-blue-600' :
                        a.assignment_type === 'secretary' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {a.assignment_type === 'branch_manager' ? <Building2 className="w-5 h-5" /> :
                         a.assignment_type === 'secretary' ? <UserCheck className="w-5 h-5" /> :
                         <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{a.staff?.first_name} {a.staff?.last_name}</p>
                        <p className="text-xs text-gray-400">{a.staff?.staff_id} • {a.staff?.job_role || "Staff"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold tracking-wider px-3 py-1 rounded-full ${
                        a.assignment_type === 'branch_manager' ? 'bg-blue-100 text-blue-700' :
                        a.assignment_type === 'secretary' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{a.assignment_type.replace('_', ' ')}</span>
                      <button
                        onClick={() => handleRemove(a.id, a.staff_id, a.assignment_type)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove assignment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
