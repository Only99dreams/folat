import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Upload,
  Palette,
  Clock,
  DollarSign,
  Loader2,
  X,
} from "lucide-react";
import { fetchOrgSettings, updateOrgSetting, uploadFile } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    orgType: "Cooperative Society",
    regNumber: "",
    dateEstablished: "",
    email: "",
    phone: "",
    altPhone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zipCode: "",
    currency: "NGN",
    timezone: "Africa/Lagos (GMT+1)",
    dateFormat: "DD/MM/YYYY",
    financialYearStart: "January",
    language: "English",
    primaryColor: "#109050",
    secondaryColor: "#1a2744",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const settings = await fetchOrgSettings();
      setForm((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(settings).filter(([, v]) => typeof v === "string")
        ),
      }));
      if (settings.logoUrl) setLogoUrl(settings.logoUrl);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      for (const [key, value] of Object.entries(form)) {
        await updateOrgSetting(key, value, user.id);
      }
      if (logoUrl) {
        await updateOrgSetting("logoUrl", logoUrl, user.id);
      }
      setSuccess("Settings saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">General Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization profile, preferences, and system configuration.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
      {loading && <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Organization Profile (2 cols) ─── */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Organization Info */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Organization Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Organization Name</label>
                  <input type="text" value={form.orgName} onChange={(e) => update("orgName", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Organization Type</label>
                  <select value={form.orgType} onChange={(e) => update("orgType", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                    <option>Cooperative Society</option>
                    <option>Savings & Loan</option>
                    <option>Microfinance</option>
                    <option>Credit Union</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Registration Number</label>
                  <input type="text" value={form.regNumber} onChange={(e) => update("regNumber", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Date Established</label>
                  <input type="date" value={form.dateEstablished} onChange={(e) => update("dateEstablished", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Organization Logo</label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                      <button onClick={() => setLogoUrl("")} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-xl">{form.orgName?.[0]?.toUpperCase() || "F"}</div>
                  )}
                  <label className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 flex-1 text-center hover:border-green-300 transition-colors cursor-pointer">
                    <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { setError("Logo must be under 2 MB."); return; }
                      setLogoUploading(true);
                      try {
                        const ext = file.name.split(".").pop() || "png";
                        const url = await uploadFile("documents", `logos/org-logo.${ext}`, file);
                        setLogoUrl(url);
                        setSuccess("Logo uploaded. Click Save Changes to apply.");
                      } catch (err: any) { setError(err.message || "Upload failed"); }
                      setLogoUploading(false);
                    }} />
                    {logoUploading ? (
                      <Loader2 className="w-5 h-5 text-green-500 mx-auto animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Click to upload or drag & drop</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG (Max 2MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Contact Details
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.website} onChange={(e) => update("website", e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Phone Number</label>
                  <input type="text" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Alternate Phone</label>
                  <input type="text" value={form.altPhone} onChange={(e) => update("altPhone", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Address
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Street Address</label>
                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">City</label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">State</label>
                  <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Zip Code</label>
                  <input type="text" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="col-span-1 space-y-6">
          {/* System Preferences */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  System Preferences
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Timezone</label>
                <select value={form.timezone} onChange={(e) => update("timezone", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>Africa/Lagos (GMT+1)</option>
                  <option>Africa/Accra (GMT+0)</option>
                  <option>Africa/Nairobi (GMT+3)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Date Format</label>
                <select value={form.dateFormat} onChange={(e) => update("dateFormat", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Language</label>
                <select value={form.language} onChange={(e) => update("language", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>English</option>
                  <option>French</option>
                  <option>Hausa</option>
                  <option>Yoruba</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Financial Settings
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Currency</label>
                <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Financial Year Starts</label>
                <select value={form.financialYearStart} onChange={(e) => update("financialYearStart", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none">
                  <option>January</option>
                  <option>April</option>
                  <option>July</option>
                  <option>October</option>
                </select>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-green-600" />
                <h2 className="text-[11px] tracking-[0.12em] uppercase font-bold text-navy-900">
                  Branding
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: form.primaryColor }} />
                  <input type="text" value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: form.secondaryColor }} />
                  <input type="text" value={form.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
