import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Briefcase,
  Loader2,
  X,
  Save,
  Pencil,
  Upload,
} from "lucide-react";
import { fetchStaffMember, fetchLeaveRequests, updateStaff, fetchBranches, fetchDocuments, uploadFile, createDocument } from "../lib/db";
import { FileText, ChevronRight } from "lucide-react";

/* ─── Tab options ─── */
const tabs = ["Overview", "Leaves", "Salary", "Documents", "Activity"];

const avatarColors = ["bg-blue-600","bg-green-600","bg-purple-600","bg-amber-500","bg-pink-600","bg-teal-600"];

export default function StaffProfilePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [staff, setStaff] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Edit state ── */
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [editError, setEditError] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [s, lr, br] = await Promise.all([
          fetchStaffMember(id),
          fetchLeaveRequests({ staff_id: id }),
          fetchBranches(),
        ]);
        setStaff(s);
        setLeaves(lr);
        setBranches(br);
        const docs = await fetchDocuments("staff", id);
        setDocuments(docs);
        if (searchParams.get("edit") === "true") {
          startEditing(s);
          setSearchParams({}, { replace: true });
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const startEditing = (s?: any) => {
    const source = s || staff;
    if (!source) return;
    setEditForm({
      first_name: source.first_name ?? "",
      last_name: source.last_name ?? "",
      gender: source.gender ?? "",
      date_of_birth: source.date_of_birth ?? "",
      phone: source.phone ?? "",
      email: source.email ?? "",
      address: source.address ?? "",
      branch_id: source.branch_id ?? "",
      job_role: source.job_role ?? "",
      department: source.department ?? "",
      employment_type: source.employment_type ?? "full_time",
      employment_status: source.employment_status ?? "active",
      basic_salary: source.basic_salary ?? 0,
      housing_allowance: source.housing_allowance ?? 0,
      transport_allowance: source.transport_allowance ?? 0,
      other_allowances: source.other_allowances ?? 0,
    });
    setEditError("");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setEditError("");
    try {
      await updateStaff(id, editForm);
      const s = await fetchStaffMember(id);
      setStaff(s);
      setEditing(false);
    } catch (err: any) {
      setEditError(err?.message || "Failed to save changes");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-navy-900" /></div>;
  if (!staff) return <div className="text-center py-20 text-gray-500">Staff member not found.</div>;

  const fullName = `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim();
  const initials = `${(staff.first_name?.[0] ?? "").toUpperCase()}${(staff.last_name?.[0] ?? "").toUpperCase()}`;
  const avatarBg = avatarColors[(fullName.length) % avatarColors.length];
  const joinedDate = staff.date_joined ? new Date(staff.date_joined) : null;
  const yearsInOrg = joinedDate ? Math.floor((Date.now() - joinedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
  const approvedLeaves = leaves.filter(l => l.status === "approved");
  const leaveDaysUsed = approvedLeaves.reduce((sum: number, l: any) => {
    if (!l.start_date || !l.end_date) return sum;
    const d = Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000*60*60*24)) + 1;
    return sum + Math.max(d, 0);
  }, 0);

  const grossSalary = Number(staff.basic_salary ?? 0) + Number(staff.housing_allowance ?? 0) + Number(staff.transport_allowance ?? 0) + Number(staff.other_allowances ?? 0);

  const personalInfo = [
    { label: "Full Name", value: fullName },
    { label: "Email", value: staff.email || "—" },
    { label: "Phone", value: staff.phone || "—" },
    { label: "Date of Birth", value: staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "—" },
    { label: "Gender", value: staff.gender ? staff.gender.charAt(0).toUpperCase() + staff.gender.slice(1) : "—" },
    { label: "Address", value: staff.address || "—" },
  ];

  const employmentDetails = [
    { label: "Staff ID", value: staff.staff_id || "—" },
    { label: "Job Role", value: staff.job_role || "—" },
    { label: "Department", value: staff.department || "—" },
    { label: "Branch", value: staff.branch?.name || "—" },
    { label: "Hired Date", value: joinedDate ? joinedDate.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "—" },
    { label: "Employment Type", value: (staff.employment_type || "full_time").replace("_", " ") },
    { label: "Status", value: staff.employment_status ? staff.employment_status.charAt(0).toUpperCase() + staff.employment_status.slice(1) : "—" },
  ];

  const statusColor: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    suspended: "bg-amber-50 text-amber-700 border-amber-200",
    resigned: "bg-red-50 text-red-700 border-red-200",
    terminated: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* ─── Back Link ─── */}
      <Link
        to="/hr/staff"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Staff List
      </Link>

      {/* ─── Profile Header ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className={`w-20 h-20 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-navy-900">{fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-navy-900 text-white text-[10px] font-bold tracking-wider">
                  {staff.staff_id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor[staff.employment_status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {(staff.employment_status || "active").charAt(0).toUpperCase() + (staff.employment_status || "active").slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{staff.job_role || "—"}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {staff.branch?.name || "—"}
                </span>
                {staff.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {staff.email}
                  </span>
                )}
              </div>
              {staff.phone && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  {staff.phone}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startEditing()}
              className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Years in Org */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">Years in Org</p>
            <CalendarDays className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">{yearsInOrg} {yearsInOrg === 1 ? "Year" : "Years"}</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            Since {joinedDate ? joinedDate.getFullYear() : "—"}
          </p>
        </div>

        {/* Leave Days Used */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">
              Leave Days Used
            </p>
            <CalendarDays className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">{leaveDaysUsed} Days</p>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {Math.max(20 - leaveDaysUsed, 0)} days remaining
          </p>
        </div>

        {/* Monthly Salary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium">Monthly Salary</p>
            <Briefcase className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-bold text-navy-900">₦{grossSalary.toLocaleString()}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Gross earnings
          </p>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="border-b border-gray-100">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-navy-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-navy-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ Overview Tab ═══════════ */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-navy-900 rounded-full" />
              <h2 className="text-base font-bold text-navy-900">Personal Information</h2>
            </div>
            <div className="space-y-3">
              {personalInfo.map((item, i) => (
                <div key={i} className="flex items-start">
                  <p className="text-sm text-gray-400 w-32 flex-shrink-0">{item.label}</p>
                  <p className="text-sm font-semibold text-navy-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-green-600 rounded-full" />
              <h2 className="text-base font-bold text-navy-900">Employment Details</h2>
            </div>
            <div className="space-y-3">
              {employmentDetails.map((item, i) => (
                <div key={i} className="flex items-start">
                  <p className="text-sm text-gray-400 w-36 flex-shrink-0">{item.label}</p>
                  <p className="text-sm font-semibold text-navy-900 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Leaves Tab ═══════════ */}
      {activeTab === "Leaves" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-navy-900">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Leave Type</th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Start Date</th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">End Date</th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Days</th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Reason</th>
                  <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No leave records</td></tr>
                ) : leaves.map((leave: any, i: number) => {
                  const days = leave.start_date && leave.end_date ? Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000*60*60*24)) + 1 : 0;
                  const statusColors: Record<string,string> = { approved: "bg-green-600 text-white", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-600" };
                  return (
                    <tr key={leave.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm text-navy-900 capitalize">{leave.leave_type || "—"} Leave</p></td>
                      <td className="px-4 py-4"><p className="text-sm text-gray-600">{leave.start_date ? new Date(leave.start_date).toLocaleDateString("en-NG", {year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                      <td className="px-4 py-4"><p className="text-sm text-gray-600">{leave.end_date ? new Date(leave.end_date).toLocaleDateString("en-NG", {year:"numeric",month:"short",day:"numeric"}) : "—"}</p></td>
                      <td className="px-4 py-4"><p className="text-sm text-gray-600">{days} {days === 1 ? "Day" : "Days"}</p></td>
                      <td className="px-4 py-4"><p className="text-sm text-gray-500 truncate max-w-[200px]">{leave.reason || "—"}</p></td>
                      <td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${statusColors[leave.status] || "bg-gray-100 text-gray-600"}`}>{(leave.status || "").toUpperCase()}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ Salary Tab ═══════════ */}
      {activeTab === "Salary" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-navy-900 mb-5">Compensation Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Basic Salary", value: Number(staff.basic_salary ?? 0) },
              { label: "Housing Allowance", value: Number(staff.housing_allowance ?? 0) },
              { label: "Transport Allowance", value: Number(staff.transport_allowance ?? 0) },
              { label: "Other Allowances", value: Number(staff.other_allowances ?? 0) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-sm font-bold text-navy-900">₦{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-xl flex items-center justify-between border border-green-100">
            <p className="text-sm font-bold text-green-700">Gross Monthly Salary</p>
            <p className="text-lg font-bold text-green-700">₦{grossSalary.toLocaleString()}</p>
          </div>
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
                <input id="staff-doc-input" type="file" onChange={e => { setDocFile(e.target.files?.[0] || null); setUploadError(""); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800" />
              </div>
              <button
                disabled={!docFile || uploading}
                onClick={async () => {
                  if (!docFile || !id) return;
                  setUploading(true);
                  setUploadError("");
                  try {
                    const path = `staff/${id}/${docType}-${Date.now()}-${docFile.name}`;
                    const url = await uploadFile("staff-documents", path, docFile);
                    await createDocument({ owner_type: "staff", owner_id: id, document_type: docType, name: docFile.name, file_url: url, file_size: docFile.size, mime_type: docFile.type });
                    const docs = await fetchDocuments("staff", id);
                    setDocuments(docs);
                    setDocFile(null);
                    setDocType("other");
                    const fileInput = document.querySelector<HTMLInputElement>('#staff-doc-input');
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
                <p className="text-sm text-gray-400">No documents uploaded for this staff member yet.</p>
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

      {/* ═══════════ Activity Tab ═══════════ */}
      {activeTab === "Activity" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center py-12">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Activity log for this staff member will appear here.</p>
        </div>
      )}

      {/* ═══════════ Edit Modal ═══════════ */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-900">Edit Staff Profile</h3>
              <button
                onClick={() => setEditing(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{editError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">First Name *</label>
                  <input type="text" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name *</label>
                  <input type="text" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                  <select value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Birth</label>
                  <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                  <input type="text" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <hr className="border-gray-100" />
              <h4 className="text-sm font-bold text-navy-900">Employment Details</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Job Role</label>
                  <input type="text" value={editForm.job_role} onChange={e => setEditForm(f => ({ ...f, job_role: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                  <input type="text" value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Branch</label>
                  <select value={editForm.branch_id} onChange={e => setEditForm(f => ({ ...f, branch_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Employment Type</label>
                  <select value={editForm.employment_type} onChange={e => setEditForm(f => ({ ...f, employment_type: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <select value={editForm.employment_status} onChange={e => setEditForm(f => ({ ...f, employment_status: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-100" />
              <h4 className="text-sm font-bold text-navy-900">Salary & Allowances</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.first_name || !editForm.last_name}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
