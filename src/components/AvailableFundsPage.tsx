import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  fetchAvailableFunds,
  addAvailableFund,
  updateAvailableFund,
  deleteAvailableFund,
} from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { confirmToast, toastError, toastSuccess } from "../lib/toast";

export default function AvailableFundsPage() {
  const { user } = useAuth();
  const [funds, setFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    setLoading(true);
    try {
      const data = await fetchAvailableFunds();
      setFunds(data);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!amount || isNaN(Number(amount))) {
      toastError("Please enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await addAvailableFund(Number(amount), description, user?.id || "");
      toastSuccess("Fund added successfully");
      setAmount("");
      setDescription("");
      setShowForm(false);
      await loadFunds();
    } catch (e: any) {
      toastError(e.message || "Failed to add fund");
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !amount || isNaN(Number(amount))) {
      toastError("Please enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await updateAvailableFund(editingId, {
        amount: Number(amount),
        description,
      });
      toastSuccess("Fund updated successfully");
      setEditingId(null);
      setEditAmount("");
      setEditDescription("");
      await loadFunds();
    } catch (e: any) {
      toastError(e.message || "Failed to update fund");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmToast(
      "Are you sure you want to delete this fund entry?"
    );
    if (!confirmed) return;
    try {
      await deleteAvailableFund(id);
      toastSuccess("Fund deleted successfully");
      await loadFunds();
    } catch (e: any) {
      toastError(e.message || "Failed to delete fund");
    }
  };

  const startEdit = (fund: any) => {
    setEditingId(fund.id);
    setEditAmount(String(fund.amount));
    setEditDescription(fund.description || "");
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditDescription("");
  };

  const totalFunds = funds.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Available Funds
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage available funds for loan disbursement.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add Funds"}
        </button>
      </div>

      {/* Total Available Funds Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              Total Available Balance
            </p>
            <p className="text-3xl font-bold text-navy-900">
              ₦{totalFunds.toLocaleString()}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingId) && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-navy-900 mb-4">
            {editingId ? "Edit Fund Entry" : "Add New Fund Entry"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Amount (₦)
              </label>
              <input
                type="number"
                value={editingId ? editAmount : amount}
                onChange={(e) => editingId ? setEditAmount(e.target.value) : setAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={editingId ? editDescription : description}
                onChange={(e) => editingId ? setEditDescription(e.target.value) : setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                placeholder="e.g., Capital injection, Loan recovery"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              {editingId ? "Update" : "Add Funds"}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Funds List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-navy-900">
            Fund Entries ({funds.length})
          </h2>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-navy-900 mx-auto" />
          </div>
        ) : funds.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No fund entries yet. Add your first fund entry above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund) => (
                  <tr
                    key={fund.id}
                    className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm text-navy-900">
                        {fund.created_at
                          ? new Date(fund.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">
                        {fund.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          fund.amount >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        ₦{Number(fund.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(fund)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warning for insufficient funds */}
      {totalFunds <= 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              No available funds
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Add funds above to enable loan approvals. Loans cannot be approved without available funds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
