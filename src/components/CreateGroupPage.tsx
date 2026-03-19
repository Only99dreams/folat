import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Info,
  Users,
  Settings,
  UserPlus,
  FileText,
  Search,
  Plus,
  UserX,
  Save,
} from "lucide-react";

export default function CreateGroupPage() {
  const navigate = useNavigate();

  /* ── Basic Information ── */
  const [groupName, setGroupName] = useState("");
  const [branch, setBranch] = useState("Main HQ Office");
  const [statusActive, setStatusActive] = useState(true);

  /* ── Group Leadership ── */
  const [leader, setLeader] = useState("");
  const [secretary, setSecretary] = useState("");

  /* ── Group Settings ── */
  const [maxMembers, setMaxMembers] = useState("20");
  const [loanRule, setLoanRule] = useState("6 Months Contribution");
  const [minSavings, setMinSavings] = useState("0.00");

  /* ── Member Assignment ── */
  const [memberSearch, setMemberSearch] = useState("");
  const [assignedMembers] = useState<string[]>([]);

  /* ── Notes ── */
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/groups");
  };

  /* ── Reusable section heading ── */
  const SectionHeading = ({
    icon: Icon,
    title,
  }: {
    icon: React.ElementType;
    title: string;
  }) => (
    <div className="flex items-center gap-2 mb-6">
      <Icon className="w-5 h-5 text-navy-900" />
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
    </div>
  );

  /* ── Reusable label ── */
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-navy-900 mb-1.5">
      {children}
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* ─── Page Header ─── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Create Group</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up a new cooperative group and assign initial members.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════ Basic Information ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <SectionHeading icon={Info} title="Basic Information" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Group Name */}
            <div>
              <Label>Group Name</Label>
              <input
                type="text"
                placeholder="e.g. Unity Savings Group"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            {/* Group ID — auto-generated, read-only */}
            <div>
              <Label>Group ID</Label>
              <input
                type="text"
                value="GRP-2023-089"
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-navy-900 bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Branch */}
            <div>
              <Label>Branch</Label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  <option>Main HQ Office</option>
                  <option>North Branch</option>
                  <option>East Region</option>
                  <option>West Region</option>
                  <option>South Sector</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-navy-900">
                  Status
                </span>
                <button
                  type="button"
                  onClick={() => setStatusActive(!statusActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    statusActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      statusActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {statusActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ Group Leadership ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <SectionHeading icon={Users} title="Group Leadership" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Group Leader */}
            <div>
              <Label>Group Leader</Label>
              <div className="relative">
                <select
                  value={leader}
                  onChange={(e) => setLeader(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  <option value="">Select Leader</option>
                  <option>Michael Chen</option>
                  <option>Robert Wilson</option>
                  <option>David Osei</option>
                  <option>Alice Thompson</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Secretary */}
            <div>
              <Label>Secretary</Label>
              <div className="relative">
                <select
                  value={secretary}
                  onChange={(e) => setSecretary(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  <option value="">Select Secretary</option>
                  <option>Sarah Johnson</option>
                  <option>Maria Garcia</option>
                  <option>Amara Okafor</option>
                  <option>Grace Kim</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ Group Settings ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <SectionHeading icon={Settings} title="Group Settings" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Max Members */}
            <div>
              <Label>Max Members</Label>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>

            {/* Loan Eligibility Rule */}
            <div>
              <Label>Loan Eligibility Rule</Label>
              <div className="relative">
                <select
                  value={loanRule}
                  onChange={(e) => setLoanRule(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
                >
                  <option>6 Months Contribution</option>
                  <option>3 Months Contribution</option>
                  <option>12 Months Contribution</option>
                  <option>Immediate</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Min Group Savings */}
            <div>
              <Label>Min Group Savings ($)</Label>
              <input
                type="text"
                value={minSavings}
                onChange={(e) => setMinSavings(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>
        </section>

        {/* ═══════════ Member Assignment ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-navy-900" />
              <h2 className="text-lg font-bold text-navy-900">
                Member Assignment
              </h2>
            </div>
            <span className="text-sm font-medium text-green-600">
              {assignedMembers.length} Members Added
            </span>
          </div>

          {/* Search + Add */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by name, ID or phone..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Empty state */}
          {assignedMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <UserX className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-navy-900">
                No members assigned yet
              </p>
              <p className="text-xs text-gray-400 text-center mt-1 max-w-[260px]">
                Search and select members to include them in this cooperative
                group.
              </p>
            </div>
          )}
        </section>

        {/* ═══════════ Notes ═══════════ */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <SectionHeading icon={FileText} title="Notes" />

          <textarea
            rows={4}
            placeholder="Internal group descriptions, goals, or historical context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          />
        </section>

        {/* ═══════════ Footer Actions ═══════════ */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <Link
            to="/groups"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Group
          </button>
        </div>
      </form>
    </div>
  );
}
