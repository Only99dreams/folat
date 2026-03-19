import { useState } from "react";
import {
  Info,
  ClipboardList,
  Settings,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function FundRequestReviewPage() {
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Fund Request Review
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: <span className="text-blue-600">FR-00245</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
          <Clock className="w-4 h-4" />
          View History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column (2/3) ─── */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-navy-900">
                Request Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              {/* Branch */}
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">
                  Branch
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  Lagos Mainland
                </p>
              </div>

              {/* Amount Requested */}
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">
                  Amount Requested
                </p>
                <p className="text-2xl font-bold text-navy-900">₦500,000</p>
              </div>

              {/* Purpose */}
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">
                  Purpose
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  Office Renovation
                </p>
              </div>

              {/* Date Submitted */}
              <div>
                <p className="text-[10px] tracking-[0.1em] uppercase text-green-600 font-semibold mb-1">
                  Date Submitted
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  October 24, 2023
                </p>
              </div>
            </div>
          </div>

          {/* Branch Financial Status */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-navy-900" />
              <h2 className="text-base font-bold text-navy-900">
                Branch Financial Status
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {/* Total Income */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Total Income
                </p>
                <p className="text-xl font-bold text-green-600">₦3,000,000</p>
              </div>

              {/* Total Expenses */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Total Expenses
                </p>
                <p className="text-xl font-bold text-red-500">₦1,200,000</p>
              </div>

              {/* Available Balance */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Available Balance
                </p>
                <p className="text-xl font-bold text-navy-900">₦1,800,000</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: "27.7%" }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Request is 27.7% of available branch balance.
            </p>
          </div>
        </div>

        {/* ─── Right Column (1/3) ─── */}
        <div className="space-y-6">
          {/* Approval Decision */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="w-5 h-5 text-navy-900" />
              <h2 className="text-base font-bold text-navy-900">
                Approval Decision
              </h2>
            </div>

            {/* Final Decision */}
            <p className="text-sm font-semibold text-navy-900 mb-3">
              Final Decision
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setDecision("approve")}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  decision === "approve"
                    ? "border-green-500 text-green-600 bg-green-50/50"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => setDecision("reject")}
                className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  decision === "reject"
                    ? "border-red-500 text-red-600 bg-red-50/50"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Reject
              </button>
            </div>

            {/* Decision Notes */}
            <p className="text-sm font-semibold text-navy-900 mb-2">
              Decision Notes
            </p>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter justification for approval or reason for rejection..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-5"
            />

            {/* Action Buttons */}
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Approve Request
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              <XCircle className="w-4 h-4" />
              Reject Request
            </button>
          </div>

          {/* Auditor Note */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-navy-900">Auditor Note</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              This request is within the standard quarterly budget for office
              maintenance. Previous renovation for this branch was 18 months
              ago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
