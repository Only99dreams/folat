import { useState } from "react";
import { Plus, FileEdit } from "lucide-react";

/* ─── Salary Data ─── */
interface SalaryRole {
  role: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  netSalary: string;
}

const salaryRoles: SalaryRole[] = [
  {
    role: "Loan Officer",
    basicSalary: "₦2,500.00",
    allowances: "₦500.00",
    deductions: "₦300.00",
    netSalary: "₦2,700.00",
  },
  {
    role: "Accountant",
    basicSalary: "₦3,000.00",
    allowances: "₦600.00",
    deductions: "₦400.00",
    netSalary: "₦3,200.00",
  },
  {
    role: "Branch Manager",
    basicSalary: "₦4,500.00",
    allowances: "₦1,000.00",
    deductions: "₦700.00",
    netSalary: "₦4,800.00",
  },
];

export default function SalaryStructurePage() {
  const [form, setForm] = useState({
    selectedRole: "Loan Officer",
    currency: "NGN (₦)",
    basicSalary: "250,000",
    allowances: "50,000",
    taxDeductions: "3,000",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Salary Structure
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure and manage role-based compensation packages.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add New Role
        </button>
      </div>

      {/* ─── Salary Table ─── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Role
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Basic Salary
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Allowances
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Deductions
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Net Salary
                </th>
                <th className="px-4 py-4 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {salaryRoles.map((role, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-5 text-center">
                    <p className="text-sm font-semibold text-navy-900">
                      {role.role}
                    </p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-gray-600">{role.basicSalary}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-gray-600">{role.allowances}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <p className="text-sm text-gray-600">{role.deductions}</p>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                      {role.netSalary}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button className="text-sm font-medium text-navy-900 hover:text-green-600 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit Role Salary + Breakdown Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Role Salary Form */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileEdit className="w-5 h-5 text-navy-900" />
            <h2 className="text-base font-bold text-navy-900">
              Edit Role Salary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-6">
            {/* Selected Role */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Selected Role
              </label>
              <select
                value={form.selectedRole}
                onChange={(e) => update("selectedRole", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option>Loan Officer</option>
                <option>Accountant</option>
                <option>Branch Manager</option>
                <option>HR Manager</option>
                <option>Admin</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 mb-8">
            {/* Basic Salary */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Basic Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  ₦
                </span>
                <input
                  type="text"
                  value={form.basicSalary}
                  onChange={(e) => update("basicSalary", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Allowances */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Allowances
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  ₦
                </span>
                <input
                  type="text"
                  value={form.allowances}
                  onChange={(e) => update("allowances", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tax Deductions */}
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Tax Deductions
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  ₦
                </span>
                <input
                  type="text"
                  value={form.taxDeductions}
                  onChange={(e) => update("taxDeductions", e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button className="px-6 py-2.5 text-sm font-medium text-navy-900 hover:text-gray-600 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Breakdown Preview */}
        <div className="bg-navy-900 rounded-xl p-6 text-white h-fit">
          <h2 className="text-lg font-bold mb-6">Breakdown Preview</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">Basic Salary</p>
              <p className="text-sm font-semibold">+₦2,500.00</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">Total Allowances</p>
              <p className="text-sm font-semibold">+₦500.00</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">Total Deductions</p>
              <p className="text-sm font-semibold text-red-400">-₦300.00</p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-5 mb-5">
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold mb-1">
              Estimated Net Salary
            </p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold">₦2,700.00</p>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-medium text-gray-300 mb-1">
                Monthly Cycle
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              "Net Salary is calculated as: (Basic Salary + Allowances) -
              Deductions. Changes will be applied to the next payroll cycle."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
