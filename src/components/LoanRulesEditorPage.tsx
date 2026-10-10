import { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { fetchLoanRules, createLoanRule, updateLoanRule, deleteLoanRule, seedDefaultLoanRules, } from "../lib/db";
import { useAuth } from "../auth/useAuth";

interface LoanRule {
  id: string;
  title: string;
  content: string;
  category: string;
  display_order: number;
  is_active: boolean;
}

const CATEGORIES = [
  { value: "cooperative", label: "Cooperative" },
  { value: "general", label: "General" },
  { value: "external", label: "External" },
  { value: "staff", label: "Staff" },
];

export default function LoanRulesEditorPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<LoanRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [category, setCategory] = useState("cooperative");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addContent, setAddContent] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadRules();
  }, [category]);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await fetchLoanRules(category);
      setRules(data);
    } catch (err: any) {
      setError(err.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!user || !addTitle.trim() || !addContent.trim()) return;
    try {
      setSaving(true);
      setError("");
      await createLoanRule({
        title: addTitle.trim(),
        content: addContent.trim(),
        category,
        display_order: rules.length + 1,
        created_by: user.id,
      });
      setAddTitle("");
      setAddContent("");
      setShowAdd(false);
      setSuccess("Rule added successfully.");
      await loadRules();
    } catch (err: any) {
      setError(err.message || "Failed to add rule");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(rule: LoanRule) {
    setEditingId(rule.id);
    setEditTitle(rule.title);
    setEditContent(rule.content);
  }

  async function handleSaveEdit(ruleId: string) {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      setSaving(true);
      setError("");
      await updateLoanRule(ruleId, { title: editTitle.trim(), content: editContent.trim() });
      setEditingId(null);
      setSuccess("Rule updated successfully.");
      await loadRules();
    } catch (err: any) {
      setError(err.message || "Failed to update rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      setSaving(true);
      setError("");
      await deleteLoanRule(ruleId);
      setSuccess("Rule removed successfully.");
      await loadRules();
    } catch (err: any) {
      setError(err.message || "Failed to remove rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDefaults() {
    if (!user) return;
    try {
      setSeeding(true);
      setError("");
      await seedDefaultLoanRules(user.id);
      setSuccess("Default cooperative terms have been restored.");
      await loadRules();
    } catch (err: any) {
      setError(err.message || "Failed to restore defaults");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Loan Rules Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage terms and conditions displayed on loan application pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding || category !== "cooperative"}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-navy-900 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Restore Defaults
          </button>
          <button
            onClick={() => { setShowAdd(true); setAddTitle(""); setAddContent(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}
      {success || error ? <button onClick={() => { setSuccess(""); setError(""); }} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button> : null}

      {/* ─── Category Tabs ─── */}
      <div className="flex gap-2 border-b border-gray-100 pb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              category === cat.value
                ? "bg-navy-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── Add Rule Form ─── */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Add New Rule</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">Title</label>
            <input
              type="text"
              value={addTitle}
              onChange={e => setAddTitle(e.target.value)}
              placeholder="e.g. Minimum Savings Period"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">Content</label>
            <textarea
              value={addContent}
              onChange={e => setAddContent(e.target.value)}
              placeholder="Full description of the rule..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 border border-gray-200 text-navy-900 rounded-xl text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !addTitle.trim() || !addContent.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* ─── Rules List ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-semibold">No rules found</p>
            <p className="text-xs text-gray-400 mt-1">Add a rule or restore defaults to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rules.map((rule, i) => (
              <div key={rule.id} className="p-6">
                {editingId === rule.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy-900 mb-2">Content</label>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-200 text-navy-900 rounded-xl text-sm font-semibold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(rule.id)}
                        disabled={saving || !editTitle.trim() || !editContent.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-navy-900">{rule.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rule.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
