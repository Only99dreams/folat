import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  Upload,
  AlertCircle,
  FileUp,
} from "lucide-react";

/* ─── Preview Data ─── */
interface PreviewRow {
  memberId: string;
  memberIdError: boolean;
  name: string;
  amount: string;
  amountError: boolean;
  date: string;
  status: "Valid" | "Missing Amount" | "Invalid ID";
}

const previewRows: PreviewRow[] = [
  {
    memberId: "#MEM-9 021",
    memberIdError: false,
    name: "Sarah Jenkins",
    amount: "$1,250.00",
    amountError: false,
    date: "Oct 24, 2023",
    status: "Valid",
  },
  {
    memberId: "#MEM-8 842",
    memberIdError: false,
    name: "Michael Ross",
    amount: "—",
    amountError: true,
    date: "Oct 24, 2023",
    status: "Missing Amount",
  },
  {
    memberId: "#MEM-4 451",
    memberIdError: false,
    name: "Elena Rodriguez",
    amount: "$450.00",
    amountError: false,
    date: "Oct 23, 2023",
    status: "Valid",
  },
  {
    memberId: "#ERR-000",
    memberIdError: true,
    name: "Unknown Member",
    amount: "$2,100.00",
    amountError: false,
    date: "Oct 23, 2023",
    status: "Invalid ID",
  },
  {
    memberId: "#MEM-1 129",
    memberIdError: false,
    name: "David Chen",
    amount: "$85.00",
    amountError: false,
    date: "Oct 23, 2023",
    status: "Valid",
  },
];

const statusBadge = (status: PreviewRow["status"]) => {
  switch (status) {
    case "Valid":
      return (
        <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Valid
        </span>
      );
    case "Missing Amount":
      return (
        <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Missing Amount
        </span>
      );
    case "Invalid ID":
      return (
        <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Invalid ID
        </span>
      );
  }
};

export default function BulkDepositUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // true for demo

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0]);
      setShowPreview(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
      setShowPreview(true);
    }
  };

  const errorCount = previewRows.filter((r) => r.status !== "Valid").length;

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
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors">
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
          {file ? file.name : "Drag and drop CSV file"}
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
              Showing{" "}
              <span className="font-medium text-gray-600">15</span> of{" "}
              <span className="font-semibold text-green-600">124</span> records
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
                    {/* Member ID */}
                    <td className="px-6 py-4">
                      <p
                        className={`text-sm font-medium ${
                          row.memberIdError
                            ? "text-red-500"
                            : "text-navy-900"
                        }`}
                      >
                        {row.memberId}
                      </p>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-navy-900">{row.name}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4">
                      <p
                        className={`text-sm font-medium ${
                          row.amountError ? "text-red-400" : "text-navy-900"
                        }`}
                      >
                        {row.amount}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600">{row.date}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          onClick={() => navigate("/savings")}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Confirm Upload
        </button>
      </div>
    </div>
  );
}
