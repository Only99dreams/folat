import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import {
  fetchGuarantorRequestsForProfile,
  reviewGuarantorRequest,
} from "../lib/db";

export default function GuarantorRequestsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const loadRequests = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await fetchGuarantorRequestsForProfile(profile.id);
      setRequests(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load guarantor requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [profile?.id]);

  const handleDecision = async (
    req: any,
    decision: "approved" | "rejected"
  ) => {
    setError("");
    setActiveId(req.id + String(req.guarantor_slot));
    try {
      await reviewGuarantorRequest({
        loanId: req.id,
        slot: req.guarantor_slot,
        decision,
        note: note[req.id + String(req.guarantor_slot)] || "",
      });
      await loadRequests();
    } catch (e: any) {
      setError(e?.message || "Unable to submit guarantor decision");
    }
    setActiveId(null);
  };

  const pendingCount = requests.filter((r) => r.guarantor_status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Guarantor Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review loan guarantor requests assigned to you and approve or reject.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Pending: {pendingCount}
        </span>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-navy-900" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-500">
          No guarantor requests assigned to your account.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const key = req.id + String(req.guarantor_slot);
            const isBusy = activeId === key;
            const isPending = req.guarantor_status === "pending";
            const borrowerName = req.member
              ? `${req.member.first_name} ${req.member.last_name}`
              : "Unknown borrower";

            return (
              <div key={key} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-400">Loan ID</p>
                    <p className="text-base font-bold text-navy-900">{req.loan_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Guarantor Slot</p>
                    <p className="text-sm font-semibold text-navy-900">#{req.guarantor_slot}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Borrower</p>
                    <p className="font-semibold text-navy-900">{borrowerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Branch</p>
                    <p className="font-semibold text-navy-900">{req.branch?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="font-semibold text-navy-900">
                      NGN {Number(req.amount_requested || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Eligibility</p>
                    <p
                      className={`font-semibold ${
                        req.guarantor_eligibility === "eligible"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {req.guarantor_eligibility === "eligible" ? "Eligible" : "Not Eligible"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      req.guarantor_status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : req.guarantor_status === "rejected"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {req.guarantor_status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-navy-900 font-medium mb-1.5">
                    Decision Note
                  </label>
                  <textarea
                    value={note[key] || ""}
                    onChange={(e) => setNote((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Optional note for your decision"
                    rows={3}
                    disabled={!isPending || isBusy}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isBusy}
                      onClick={() => handleDecision(req, "approved")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => handleDecision(req, "rejected")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
