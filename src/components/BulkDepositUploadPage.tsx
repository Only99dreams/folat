import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  Upload,
  AlertCircle,
  FileUp,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { fetchMembers, recordDeposit } from "../lib/db";
import { useAuth } from "../auth/useAuth";

/* ─── Preview Row Type ─── */
interface PreviewRow {
  memberId: string;
  memberDbId: string | null;
  name: string;
  amount: number;
  date: string;
  status: "Valid" | "Missing Amount" | "Invalid ID";
}

const statusBadge = (status: PreviewRow["status"]) => {
  if (status === "Valid") return <span className="flex items-center gap-1 text-sm text-green-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Valid</span>;
  return <span className="flex items-center gap-1 text-sm text-red-500 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{status}</span>;
};

export default function BulkDepositUploadPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number } | null>(null);

  const downloadTemplate = () => {
    const csv = "member_id,amount,date\nFOL-2025-0001,5000,2026-03-31\nFOL-2025-0002,10000,2026-03-31\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_deposit_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = async (csvFile: File) => {
    setParsing(true);
    try {
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { setParsing(false); return; }
      // Expect: member_id, amount, date (optional)
      const rows: PreviewRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const memberId = cols[0] || "";
        const amountStr = cols[1] || "";
        const dateStr = cols[2] || new Date().toISOString().slice(0, 10);
        const amount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));

        if (!memberId) continue;

        // Look up member in DB
        let memberDbId: string | null = null;
        let name = "Unknown";
        let status: PreviewRow["status"] = "Valid";

        try {
          const { data } = await fetchMembers({ search: memberId });
          const match = data.find((m: any) => m.member_id === memberId);
          if (match) {
            memberDbId = match.id;
            name = `${match.first_name} ${match.last_name}`;
          } else {
            status = "Invalid ID";
          }
        } catch {
          status = "Invalid ID";
        }

        if (isNaN(amount) || amount <= 0) status = "Missing Amount";

        rows.push({ memberId, memberDbId, name, amount: isNaN(amount) ? 0 : amount, date: dateStr, status });
      }
      setPreviewRows(rows);
      setShowPreview(true);
    } catch (err) {
      console.error("CSV parse error:", err);
    }
    setParsing(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      parseCSV(f);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      const f = e.target.files[0];
      setFile(f);
      parseCSV(f);
    }
  };

  const errorCount = previewRows.filter((r) => r.status !== "Valid").length;
  const validRows = previewRows.filter((r) => r.status === "Valid");

  const handleUpload = async () => {
    setUploading(true);
    let success = 0;
    let failed = 0;
    for (const row of validRows) {
      if (!row.memberDbId) { failed++; continue; }
      try {
        await recordDeposit({
          member_id: row.memberDbId,
          amount: row.amount,
          payment_method: "bank_transfer",
          notes: "Bulk upload deposit",
          recorded_by: profile?.id ?? "",
        });
        success++;
      } catch {
        failed++;
      }
    }
    setUploadResult({ success, failed });
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">
            Bulk Deposit Upload
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a CSV file containing multiple member savings deposits.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* ═══════════ Upload Area ═══════════ */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`flex flex-col items-center justify-center w-full py-14 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-6 ${
          dragOver
            ? "border-navy-900 bg-navy-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center mb-4">
          <FileUp className="w-7 h-7 text-navy-900" />
        </div>
        <p className="text-base font-semibold text-navy-900">
          {parsing ? "Parsing CSV..." : file ? file.name : "Drag and drop CSV file"}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          or click to browse from your computer
        </p>
        <button
          type="button"
          className="mt-4 px-5 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors"
        >
          Select File
        </button>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </label>

      {/* ═══════════ Validation Banner ═══════════ */}
      {showPreview && errorCount > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">
                Validation Issues
              </p>
              <p className="text-sm text-red-600">
                {errorCount} rows contain errors and must be fixed before
                proceeding.
              </p>
            </div>
          </div>
          <button className="text-sm font-medium text-red-600 hover:underline whitespace-nowrap">
            View Details
          </button>
        </div>
      )}

      {/* ═══════════ Data Preview ═══════════ */}
      {showPreview && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-base font-bold text-navy-900">Data Preview</h3>
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-green-600">{validRows.length}</span> valid of{" "}
              <span className="font-medium text-gray-600">{previewRows.length}</span> records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Member ID
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[10px] tracking-[0.1em] uppercase text-gray-400 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${row.status === "Invalid ID" ? "text-red-500" : "text-navy-900"}`}>
                        {row.memberId}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">{row.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className={`text-sm font-medium ${row.status === "Missing Amount" ? "text-red-400" : "text-navy-900"}`}>
                        {row.amount > 0 ? `₦${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{row.date}</p>
                    </td>
                    <td className="px-4 py-4">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ Upload Result ═══════════ */}
      {uploadResult && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-700">Upload Complete</p>
            <p className="text-sm text-green-600">{uploadResult.success} deposits recorded successfully. {uploadResult.failed > 0 ? `${uploadResult.failed} failed.` : ""}</p>
          </div>
        </div>
      )}

      {/* ═══════════ Footer Actions ═══════════ */}
      <div className="flex items-center justify-end gap-4">
        <Link
          to="/savings"
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleUpload}
          disabled={uploading || validRows.length === 0 || !!uploadResult}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? `Uploading... (${validRows.length} deposits)` : `Confirm Upload (${validRows.length} valid)`}
        </button>
      </div>
    </div>
  );
}
