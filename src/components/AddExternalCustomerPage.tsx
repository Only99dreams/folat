import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  CreditCard,
  Briefcase,
  ClipboardCheck,
  Users,
  CloudUpload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createMember, generateMemberId } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function AddExternalCustomerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Personal Information ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  /* ── Contact Details ── */
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  /* ── Identification ── */
  const [nationalId, setNationalId] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ── Employment Details ── */
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [employer, setEmployer] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  /* ── Eligibility & Credit ── */
  const [creditScore, setCreditScore] = useState(500);
  const [existingLoans, setExistingLoans] = useState("No");

  /* ── Guarantor Information ── */
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [guarantorRelationship, setGuarantorRelationship] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const memberId = await generateMemberId();
      await createMember({
        member_id: memberId,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone,
        date_of_birth: dob || null,
        gender: gender || null,
        address,
        employer: employer || null,
        member_type: "external",
        national_id: nationalId || null,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
        guarantor_name: guarantorName || null,
        guarantor_phone: guarantorPhone || null,
        guarantor_relationship: guarantorRelationship || null,
        created_by: user?.id,
        status: "active",
      });
      navigate("/members");
    } catch (err: any) {
      setError(err.message || "Failed to add customer");
    }
    setSubmitting(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) setDocFile(e.dataTransfer.files[0]);
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
              placeholder="e.g. Michael"
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
              placeholder="e.g. Henderson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <Label>Date of Birth</Label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Gender — toggle buttons */}
          <div>
            <Label>Gender</Label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    gender === g
                      ? "bg-navy-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } ${g !== "Male" ? "border-l border-gray-200" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
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
              placeholder="michael.h@example.com"
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
              placeholder="Street, City, State, ZIP Code"
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
              placeholder="000-00-0000"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Document Upload — drag and drop */}
          <div>
            <Label>Document Upload</Label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`flex flex-col items-center justify-center gap-1.5 w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragOver
                  ? "border-navy-900 bg-navy-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <CloudUpload className="w-6 h-6 text-gray-400" />
              <p className="text-sm text-gray-500">
                {docFile ? (
                  <span className="font-medium text-navy-900">
                    {docFile.name}
                  </span>
                ) : (
                  <>
                    Click to upload or{" "}
                    <span className="font-medium">drag and drop</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-gray-400">
                PNG, JPG or PDF (MAX. 5MB)
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) =>
                  setDocFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </label>
          </div>
        </div>
      </section>

      {/* ═══════════ Employment Details ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={Briefcase} title="Employment Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Employment Status */}
          <div>
            <Label>Employment Status</Label>
            <div className="relative">
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 bg-white"
              >
                <option>Employed</option>
                <option>Self-Employed</option>
                <option>Unemployed</option>
                <option>Retired</option>
                <option>Student</option>
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

          {/* Employer / Business Name */}
          <div>
            <Label>Employer / Business Name</Label>
            <input
              type="text"
              placeholder="Company Name"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Monthly Income */}
          <div>
            <Label>Monthly Income (₦)</Label>
            <input
              type="text"
              placeholder="enter a figure"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Eligibility & Credit ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading icon={ClipboardCheck} title="Eligibility & Credit" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Credit Score Slider */}
          <div>
            <Label>Estimated Credit Score</Label>
            <div className="mt-1">
              <input
                type="range"
                min={300}
                max={850}
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-900"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-gray-400">300</span>
                <span className="text-xs font-semibold text-navy-900">
                  {creditScore}
                </span>
                <span className="text-xs text-gray-400">850</span>
              </div>
            </div>
          </div>

          {/* Existing Loans */}
          <div>
            <Label>Existing Loans?</Label>
            <div className="flex items-center gap-5 mt-2">
              <button
                type="button"
                onClick={() => setExistingLoans("Yes")}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    existingLoans === "Yes"
                      ? "border-navy-900"
                      : "border-gray-300"
                  }`}
                >
                  {existingLoans === "Yes" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-navy-900" />
                  )}
                </span>
                Yes
              </button>

              <button
                type="button"
                onClick={() => setExistingLoans("No")}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    existingLoans === "No"
                      ? "border-navy-900"
                      : "border-gray-300"
                  }`}
                >
                  {existingLoans === "No" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-navy-900" />
                  )}
                </span>
                No
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Guarantor Information ═══════════ */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <SectionHeading
          icon={Users}
          title="Guarantor Information (Only for Group Leaders)"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Guarantor Name */}
          <div>
            <Label>Guarantor Name</Label>
            <input
              type="text"
              placeholder="Full Name"
              value={guarantorName}
              onChange={(e) => setGuarantorName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Guarantor Phone */}
          <div>
            <Label>Guarantor Phone</Label>
            <input
              type="tel"
              placeholder="+1..."
              value={guarantorPhone}
              onChange={(e) => setGuarantorPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>

          {/* Relationship */}
          <div>
            <Label>Relationship</Label>
            <input
              type="text"
              placeholder="e.g. Spouse, Friend"
              value={guarantorRelationship}
              onChange={(e) => setGuarantorRelationship(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ Error Display ═══════════ */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ═══════════ Footer Actions ═══════════ */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {submitting ? "Creating…" : "Create Customer"}
        </button>
        <Link
          to="/members"
          className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
