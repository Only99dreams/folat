import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import { uploadFile } from "../lib/db";

export default function UserProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ─── Form state ─── */
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarInitials, setAvatarInitials] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  /* ─── Password change ─── */
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ─── UI state ─── */
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ─── Load profile from Supabase ─── */
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_initials, avatar_url")
        .eq("id", user!.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatar_url ?? "");
        setAvatarInitials(
          data.avatar_initials ??
            (data.full_name ?? "")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        );
      }
    }

    loadProfile();
  }, [user]);

  /* ─── Save profile ─── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setMessage({ type: "error", text: "Full name is required." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const initials =
      avatarInitials.trim() ||
      trimmedName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        phone: phone.trim(),
        avatar_initials: initials,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully. Changes will reflect on next login." });
    }

    setSaving(false);
  }

  /* ─── Change password ─── */
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    }

    setChangingPassword(false);
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-navy-900">My Profile</h1>
          <p className="text-sm text-gray-400">View and edit your account details</p>
        </div>
      </div>

      {/* ─── Profile Card ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-green-600 to-emerald-500" />

        {/* Avatar + basic info */}
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-navy-900 border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {avatarInitials || user.avatar}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-green-700 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { setMessage({ type: "error", text: "Photo must be under 2 MB." }); return; }
                  try {
                    const ext = file.name.split(".").pop() || "jpg";
                    const url = await uploadFile("documents", `avatars/${user.id}.${ext}`, file);
                    setAvatarUrl(url);
                    setMessage({ type: "success", text: "Photo uploaded. Click Save Changes to apply." });
                  } catch (err: any) { setMessage({ type: "error", text: err.message || "Upload failed" }); }
                }} />
              </label>
            </div>
            <div className="sm:pb-1">
              <h2 className="text-lg font-bold text-navy-900">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {user.roleLabel}
                </span>
                {user.branch && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {user.branch}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Form ─── */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-base font-semibold text-navy-900">Edit Profile</h3>

        {message && (
          <div
            className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed from here.</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Role (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={user.roleLabel}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Contact an admin to change your role.</p>
        </div>

        {/* Branch (read-only) */}
        {user.branch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={user.branch}
                readOnly
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Avatar Initials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar Initials</label>
          <input
            type="text"
            value={avatarInitials}
            onChange={(e) => setAvatarInitials(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            className="w-24 px-4 py-2.5 text-sm text-center font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase tracking-widest"
            placeholder="AB"
          />
          <p className="text-xs text-gray-400 mt-1">Two letters shown on your avatar.</p>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ─── Change Password ─── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-navy-900">Security</h3>
          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPasswordMessage(null);
            }}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            {showPasswordSection ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
            {passwordMessage && (
              <div
                className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {passwordMessage.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {changingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
