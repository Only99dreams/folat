import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function AddStaffPage() {
  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    gender: "",
    dob: "",
    phone: "+1 (555) 000-0000",
    email: "john.doe@company.com",
    address: "123 Main St, City, Country",
    staffId: "FLT-2024-001",
    branch: "",
    jobRole: "",
    dateJoined: "",
    employmentStatus: "Full-time",
    username: "j.doe",
    password: "••••••••",
    rolePermission: "Standard User",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
          <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
            Save Staff
          </button>
        </div>
      </div>

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
              <option value="main-branch">Main Branch</option>
              <option value="lagos-west">Lagos West</option>
              <option value="abuja-central">Abuja Central</option>
              <option value="ibadan">Ibadan Hub</option>
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
              <option value="admin">Admin</option>
              <option value="loan-officer">Loan Officer</option>
              <option value="accountant">Accountant</option>
              <option value="hr-manager">HR Manager</option>
              <option value="branch-manager">Branch Manager</option>
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
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
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
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">Upload Image/PDF</p>
            </div>
          </div>

          {/* Contract */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Contract
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">Upload signed PDF</p>
            </div>
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Resume
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50 transition-colors">
              <File className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">Upload PDF/DOCX</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer Actions ─── */}
      <div className="flex items-center justify-center gap-4 pb-4">
        <Link to="/hr/staff" className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          Cancel Changes
        </Link>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <Save className="w-4 h-4" />
          Save New Staff Member
        </button>
      </div>
    </div>
  );
}
