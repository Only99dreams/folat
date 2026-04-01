import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Save,
  User,
  Mail,
  Briefcase,
  KeyRound,
  FileUp,
  ImageIcon,
  FileText,
  File,
  Loader2,
} from "lucide-react";
import { fetchBranches, createStaff, uploadFile } from "../lib/db";

export default function AddStaffPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
    staffId: "",
    branch: "",
    jobRole: "",
    dateJoined: new Date().toISOString().split("T")[0],
    employmentStatus: "full_time",
    username: "",
    password: "",
    rolePermission: "Standard User",
  });

  useEffect(() => {
    fetchBranches().then(setBranches).catch(() => {});
    const sid = `STF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setForm(prev => ({ ...prev, staffId: sid }));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) { setError("First name, last name and email are required"); return; }
    setError("");
    setSubmitting(true);
    try {
      const staffData = await createStaff({
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.gender,
        date_of_birth: form.dob || undefined,
        phone: form.phone,
        email: form.email,
        address: form.address,
        staff_id: form.staffId,
        branch_id: form.branch || undefined,
        job_role: form.jobRole,
        date_joined: form.dateJoined,
        employment_type: form.employmentStatus,
        employment_status: "active",
      });
      // Upload documents to storage
      const staffId = staffData.id;
      if (idCardFile) {
        await uploadFile("staff-documents", `${staffId}/id-card-${idCardFile.name}`, idCardFile);
      }
      if (contractFile) {
        await uploadFile("staff-documents", `${staffId}/contract-${contractFile.name}`, contractFile);
      }
      if (resumeFile) {
        await uploadFile("staff-documents", `${staffId}/resume-${resumeFile.name}`, resumeFile);
      }
      navigate("/hr/staff");
    } catch (e: any) { setError(e.message || "Failed to add staff"); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Add New Staff</h1>
          <p className="text-sm text-gray-500 mt-1">
            Onboard a new employee to the organization database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/hr/staff" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Staff
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* ─── Section 1: Personal Info ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-navy-900" />
          <h2 className="text-base font-bold text-navy-900">
            Section 1: Personal Info
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ─── Section 2: Contact Info ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="w-5 h-5 text-navy-900" />
          <h2 className="text-base font-bold text-navy-900">
            Section 2: Contact Info
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Home Address - full width */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Home Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ─── Section 3: Employment Details ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="w-5 h-5 text-navy-900" />
          <h2 className="text-base font-bold text-navy-900">
            Section 3: Employment Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {/* Staff ID */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Staff ID
            </label>
            <input
              type="text"
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              readOnly
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Branch
            </label>
            <select
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Job Role
            </label>
            <select
              value={form.jobRole}
              onChange={(e) => update("jobRole", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="branch_manager">Branch Manager</option>
              <option value="finance_officer">Finance Officer</option>
              <option value="loan_officer">Loan Officer</option>
              <option value="front_desk">Front Desk</option>
              <option value="auditor">Auditor</option>
              <option value="hr_manager">HR Manager</option>
            </select>
          </div>

          {/* Date Joined */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Date Joined
            </label>
            <input
              type="date"
              value={form.dateJoined}
              onChange={(e) => update("dateJoined", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Employment Status
            </label>
            <select
              value={form.employmentStatus}
              onChange={(e) => update("employmentStatus", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Section 4: Login Access ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound className="w-5 h-5 text-navy-900" />
          <h2 className="text-base font-bold text-navy-900">
            Section 4: Login Access
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Role Permission */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Role Permission
            </label>
            <select
              value={form.rolePermission}
              onChange={(e) => update("rolePermission", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="Standard User">Standard User</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Section 5: Documents ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileUp className="w-5 h-5 text-navy-900" />
          <h2 className="text-base font-bold text-navy-900">
            Section 5: Documents
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* ID Card */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              ID Card
            </label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">{idCardFile ? idCardFile.name : "Upload Image/PDF"}</p>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setIdCardFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {/* Contract */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Contract
            </label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">{contractFile ? contractFile.name : "Upload signed PDF"}</p>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setContractFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Resume
            </label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <File className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">{resumeFile ? resumeFile.name : "Upload PDF/DOCX"}</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <Link to="/hr/staff" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          Cancel Changes
        </Link>
        <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save New Staff Member
        </button>
      </div>
    </div>
  );
}
