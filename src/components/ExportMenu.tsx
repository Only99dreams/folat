import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

interface Props {
  data: () => Record<string, unknown>[];
  filename: string;
  label?: string;
  className?: string;
}

export default function ExportMenu({ data, filename, label = "Export", className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCSV = () => {
    import("../lib/exportUtils").then((m) => m.downloadCSV(data(), filename));
    setOpen(false);
  };

  const handlePDF = () => {
    import("../lib/exportUtils").then((m) => m.downloadPDF(data(), filename));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={
          className ||
          "flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-navy-900 hover:bg-gray-50 transition-colors"
        }
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          <button
            onClick={handleCSV}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-900 hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 text-green-600" />
            Export as CSV
          </button>
          <button
            onClick={handlePDF}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-navy-900 hover:bg-gray-50 border-t border-gray-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-red-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
