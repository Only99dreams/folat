import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fetchMembers, fetchLoanApplications, fetchStaffDirectory } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function SearchResultsPage() {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get("q") ?? "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!q.trim()) {
        setMembers([]);
        setLoans([]);
        setStaff([]);
        return;
      }
      setLoading(true);
      try {
        const userObj = user ? { id: user.id, role: user.role, branch: user.branch } : undefined;
        const [mRes, lRes, sRes] = await Promise.all([
          fetchMembers({ search: q, pageSize: 5, user: userObj }),
          fetchLoanApplications({ search: q, pageSize: 5, user: userObj }),
          fetchStaffDirectory({ search: q }),
        ]);
        if (cancelled) return;
        setMembers(mRes.data ?? []);
        setLoans(lRes.data ?? []);
        setStaff(sRes ?? []);
      } catch (err) {
        console.error("Search error:", err);
        if (!cancelled) {
          setMembers([]);
          setLoans([]);
          setStaff([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy-900">Search Results</h1>
        <p className="text-sm text-gray-500 mt-1">Results for “{q}”</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <section className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h2 className="text-sm font-semibold text-navy-900 mb-2">Members</h2>
            {members.length === 0 ? (
              <p className="text-sm text-gray-400">No members found.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {members.map((m) => (
                  <li key={m.id} className="py-2">
                    <Link to={`/members/${m.id}`} className="block hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy-900">{m.first_name} {m.last_name}</span>
                        <span className="text-sm text-gray-400">{m.member_id ?? "-"}</span>
                      </div>
                      <div className="text-xs text-gray-500">{m.phone ?? m.email}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
            <h2 className="text-sm font-semibold text-navy-900 mb-2">Loans</h2>
            {loans.length === 0 ? (
              <p className="text-sm text-gray-400">No loans found.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {loans.map((l) => (
                  <li key={l.id} className="py-2">
                    <Link to={`/loans/${l.id}`} className="block hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy-900">{l.loan_id ?? l.id}</span>
                        <span className="text-sm text-gray-400">{l.amount_requested ? `₦${Number(l.amount_requested).toLocaleString()}` : ""}</span>
                      </div>
                      <div className="text-xs text-gray-500">{l.member?.first_name} {l.member?.last_name}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-navy-900 mb-2">Staff</h2>
            {staff.length === 0 ? (
              <p className="text-sm text-gray-400">No staff found.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {staff.map((s) => (
                  <li key={s.id} className="py-2">
                    <Link to={`/hr/staff/${s.id}`} className="block hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy-900">{s.first_name} {s.last_name}</span>
                        <span className="text-sm text-gray-400">{s.staff_id ?? "-"}</span>
                      </div>
                      <div className="text-xs text-gray-500">{s.job_role ?? s.department}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
