import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  CreditCard,
  Building2,
  PiggyBank,
  Heart,
  Users,
  Upload,
} from "lucide-react";

export default function AddCooperativeMemberPage() {
  const navigate = useNavigate();

  /* ── Personal Information ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  /* ── Contact Details ── */
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  /* ── Identification ── */
  const [nationalId, setNationalId] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);

  /* ── Cooperative Details ── */
  const [branch, setBranch] = useState("");
  const [group, setGroup] = useState("");
  const [joinDate, setJoinDate] = useState("");

  /* ── Savings Setup ── */
  const [initialDeposit, setInitialDeposit] = useState("0.00");
  const [contributionType, setContributionType] = useState("Monthly");

  /* ── Next of Kin ── */
  const [kinName, setKinName] = useState("");
  const [kinRelationship, setKinRelationship] = useState("");
  const [kinPhone, setKinPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // submit logic here
    navigate("/members");
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
  const Label = ({
    children,
    optional,
  }: {
    children: React.ReactNode;
    optional?: boolean;
  }) => (
    <label className="block text-sm font-medium text-navy-900 mb-1.5">
      {children}
      {optional && (
        <span className="text-gray-400 font-normal ml-1">(Optional)</span>
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8 pb-8">
      {/* ═══════════ Personal Information ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={User} title="Personal Information" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Name */}
          <div>
            <Label>First Name</Label>
            <input
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Last Name */}
          <div>
            <Label>Last Name</Label>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Gender */}
          <div>
            <Label>Gender</Label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
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

          {/* Date of Birth */}
          <div>
            <Label>Date of Birth</Label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Contact Details ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={Phone} title="Contact Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone Number */}
          <div>
            <Label>Phone Number</Label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email Address</Label>
            <input
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Residential Address — full width */}
          <div className="md:col-span-2">
            <Label>Residential Address</Label>
            <textarea
              rows={2}
              placeholder="123 Street Name, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Identification ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={CreditCard} title="Identification" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* National ID Number */}
          <div>
            <Label>National ID Number</Label>
            <input
              type="text"
              placeholder="ID-000-000-000"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Upload ID Card */}
          <div>
            <Label>Upload ID Card</Label>
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-400 cursor-pointer hover:border-navy-900/40 hover:text-gray-500 transition-colors">
              <Upload className="w-4 h-4" />
              {idFile ? idFile.name : "Click to upload file"}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  setIdFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </label>
          </div>
        </div>
      </section>

      {/* ═══════════ Cooperative Details ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={Building2} title="Cooperative Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Member ID — auto-generated, read-only green */}
          <div>
            <Label>Member ID</Label>
            <input
              type="text"
              value="MBR-000245"
              readOnly
              className="w-full px-4 py-2.5 border border-green-200 rounded-lg text-sm font-medium text-green-700 bg-green-50 cursor-not-allowed"
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
                <option value="">Select Branch</option>
                <option>Main Branch</option>
                <option>North Branch</option>
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

          {/* Group Assignment */}
          <div>
            <Label optional>Group Assignment</Label>
            <div className="relative">
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option value="">Select Group</option>
                <option>Farmers Group A</option>
                <option>Retail Traders</option>
                <option>Poultry Cluster</option>
                <option>Micro-Entrepreneurs</option>
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

          {/* Join Date */}
          <div>
            <Label>Join Date</Label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Savings Setup ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={PiggyBank} title="Savings Setup" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Initial Deposit */}
          <div>
            <Label>Initial Deposit (USD)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                $
              </span>
              <input
                type="text"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          {/* Contribution Type — radio buttons */}
          <div>
            <Label>Contribution Type</Label>
            <div className="flex gap-3 mt-0.5">
              <button
                type="button"
                onClick={() => setContributionType("Monthly")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                  contributionType === "Monthly"
                    ? "border-navy-900 bg-navy-900/5 text-navy-900"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    contributionType === "Monthly"
                      ? "border-navy-900"
                      : "border-gray-300"
                  }`}
                >
                  {contributionType === "Monthly" && (
                    <span className="w-2 h-2 rounded-full bg-navy-900" />
                  )}
                </span>
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setContributionType("Weekly")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
                  contributionType === "Weekly"
                    ? "border-navy-900 bg-navy-900/5 text-navy-900"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    contributionType === "Weekly"
                      ? "border-navy-900"
                      : "border-gray-300"
                  }`}
                >
                  {contributionType === "Weekly" && (
                    <span className="w-2 h-2 rounded-full bg-navy-900" />
                  )}
                </span>
                Weekly
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Next of Kin ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={Heart} title="Next of Kin" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Full Name */}
          <div>
            <Label>Full Name</Label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={kinName}
              onChange={(e) => setKinName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Relationship */}
          <div>
            <Label>Relationship</Label>
            <input
              type="text"
              placeholder="Spouse, Sibling, etc."
              value={kinRelationship}
              onChange={(e) => setKinRelationship(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Phone Number */}
          <div>
            <Label>Phone Number</Label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={kinPhone}
              onChange={(e) => setKinPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Footer Actions ═══════════ */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <Link
          to="/members"
          className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Users className="w-4 h-4" />
          Create Member
        </button>
      </div>
    </form>
  );
}
