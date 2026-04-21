import { useState, useEffect } from "react";
import { FileEdit, Loader2, Save, X } from "lucide-react";
import { fetchStaff, updateStaff } from "../lib/db";

export default function SalaryStructurePage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Edit state ── */
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    basic_salary: 0,
    housing_allowance: 0,
    transport_allowance: 0,
    other_allowances: 0,
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await fetchStaff();
      setStaffList(data);
    } catch {}
    setLoading(false);
  };

  const startEdit = (s: any) => {
    setEditing(s);
    setEditForm({
      basic_salary: Number(s.basic_salary ?? 0),
      housing_allowance: Number(s.housing_allowance ?? 0),
      transport_allowance: Number(s.transport_allowance ?? 0),
      other_allowances: Number(s.other_allowances ?? 0),
    });
    setEditError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setEditError("");
    try {
      await updateStaff(editing.id, editForm);
      setEditing(null);
      await loadStaff();
    } catch (err: any) {
      setEditError(err?.message || "Failed to save");
    }
    setSaving(false);
  };

  const totalAllowances = editForm.housing_allowance + editForm.transport_allowance + editForm.other_allowances;
  const grossSalary = editForm.basic_salary + totalAllowances;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">
          Salary Structure
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage compensation for all staff members.
        </p>
      </div>

      {/* ─── Salary Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                  Staff
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Job Role
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Basic Salary
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Allowances
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Gross Pay
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No staff records found</td></tr>
              ) : staffList.map((s) => {
                const basic = Number(s.basic_salary ?? 0);
                const allowances = Number(s.housing_allowance ?? 0) + Number(s.transport_allowance ?? 0) + Number(s.other_allowances ?? 0);
                const gross = basic + allowances;
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-navy-900">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-gray-400">{s.staff_id}</p>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-600 capitalize">{(s.job_role || "—").replace("_", " ")}</p>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-600">₦{basic.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <p className="text-sm text-gray-600">₦{allowances.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        ₦{gross.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <button onClick={() => startEdit(s)} className="text-sm font-medium text-navy-900 hover:text-green-600 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Edit Salary</h3>
                <p className="text-sm text-gray-400">{editing.first_name} {editing.last_name} — {(editing.job_role || "").replace("_", " ")}</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {editError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{editError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Basic Salary (₦)</label>
                  <input type="number" min="0" value={editForm.basic_salary} onChange={e => setEditForm(f => ({ ...f, basic_salary: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Housing Allowance (₦)</label>
                  <input type="number" min="0" value={editForm.housing_allowance} onChange={e => setEditForm(f => ({ ...f, housing_allowance: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Transport Allowance (₦)</label>
                  <input type="number" min="0" value={editForm.transport_allowance} onChange={e => setEditForm(f => ({ ...f, transport_allowance: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Other Allowances (₦)</label>
                  <input type="number" min="0" value={editForm.other_allowances} onChange={e => setEditForm(f => ({ ...f, other_allowances: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              {/* Breakdown Preview */}
              <div className="bg-navy-900 rounded-xl p-5 text-white">
                <h4 className="text-sm font-bold mb-3">Breakdown Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-300">Basic Salary</span><span className="font-semibold">₦{editForm.basic_salary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Housing</span><span className="font-semibold">₦{editForm.housing_allowance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Transport</span><span className="font-semibold">₦{editForm.transport_allowance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Other</span><span className="font-semibold">₦{editForm.other_allowances.toLocaleString()}</span></div>
                  <div className="border-t border-white/20 pt-2 flex justify-between">
                    <span className="font-bold">Gross Monthly</span>
                    <span className="text-lg font-bold">₦{grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
