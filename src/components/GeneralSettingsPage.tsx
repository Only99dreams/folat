import { useState } from "react";
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
} from "lucide-react";

export default function GeneralSettingsPage() {
  const [form, setForm] = useState({
    orgName: "FOLAT Multipurpose Investment",
    orgType: "Cooperative Society",
    regNumber: "RC-2023-0042185",
    dateEstablished: "2018-03-15",
    email: "info@folatcooperative.org",
    phone: "+234 812 345 6789",
    altPhone: "+234 901 234 5678",
    website: "www.folatcooperative.org",
    address: "12 Cooperative Avenue, Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    zipCode: "101241",
    currency: "NGN",
    timezone: "Africa/Lagos (GMT+1)",
    dateFormat: "DD/MM/YYYY",
    financialYearStart: "January",
    language: "English",
    primaryColor: "#109050",
    secondaryColor: "#1a2744",
  });

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
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

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
                  <div className="w-16 h-16 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-xl">F</div>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 flex-1 text-center hover:border-green-300 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG (Max 2MB)</p>
                  </div>
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
                  <option>NGN</option>
                  <option>USD</option>
                  <option>GBP</option>
                  <option>EUR</option>
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
