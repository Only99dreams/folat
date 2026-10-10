import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Loader2,
  Upload,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { fetchStaffByProfileId, fetchDocuments, uploadFile, createDocument, createStaff } from "../lib/db";
import { useAuth } from "../auth/useAuth";

export default function StaffMyDocumentsPage() {
  const { user } = useAuth();
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffNotFound, setStaffNotFound] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        let staff = await fetchStaffByProfileId(user.id);
        if (!staff && user.email) {
          const { data: staffByEmail } = await supabase.from("staff").select("*").eq("email", user.email).limit(1);
          if (staffByEmail?.[0]) staff = staffByEmail[0];
        }
        if (staff) {
          setStaffId(staff.id);
          const docs = await fetchDocuments("staff", staff.id);
          setDocuments(docs);
        } else if (user.email) {
          const { data: existing } = await supabase.from("staff").select("id").eq("profile_id", user.id).limit(1);
          if (existing?.[0]) {
            setStaffId(existing[0].id);
            setStaffNotFound(false);
            const docs = await fetchDocuments("staff", existing[0].id);
            setDocuments(docs);
          } else {
            const names = (user.name || "Staff Member").split(" ");
            const hash = Math.random().toString(36).slice(2, 6).toUpperCase();
            const staffIdStr = "STF-" + new Date().getFullYear() + "-" + hash;
            try {
              const newStaff = await createStaff({
                profile_id: user.id,
                staff_id: staffIdStr,
                first_name: names[0] || "Staff",
                last_name: names.slice(1).join(" ") || "Member",
                email: user.email,
                phone: "",
                job_role: "staff_member",
                employment_type: "full_time",
                date_joined: new Date().toISOString().split("T")[0],
                employment_status: "active",
              });
              if (newStaff) {
                setStaffId(newStaff.id);
                setStaffNotFound(false);
              }
            } catch (createErr) {
              console.error("Failed to auto-create staff record:", createErr);
              setStaffNotFound(true);
            }
          }
        } else {
          setStaffNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load staff profile:", err);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const handleUpload = async () => {
    if (!docFile) return;
    if (!staffId) { setUploadError("Contact HR to set up your staff profile before uploading documents."); return; }
    setUploading(true);
    setUploadError("");
    try {
      const path = `staff/${staffId}/custom-${Date.now()}-${docFile.name}`;
      const url = await uploadFile("staff-documents", path, docFile);
      await createDocument({ owner_type: "staff", owner_id: staffId, document_type: docType, name: docFile.name, file_url: url, file_size: docFile.size, mime_type: docFile.type });
      const docs = await fetchDocuments("staff", staffId);
      setDocuments(docs);
      setDocFile(null);
      setDocType("other");
      const fileInput = document.querySelector<HTMLInputElement>('#staff-docs-input');
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err?.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-navy-900">My Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Upload and view your personal documents.</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-navy-900 mb-4">Upload Document</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium mb-1">Document Type</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900">
              <option value="contract">Contract</option>
              <option value="resume">Resume / CV</option>
              <option value="id_card">ID Card</option>
              <option value="passport">Passport</option>
              <option value="certificate">Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 font-medium mb-1">File</label>
            <input id="staff-docs-input" type="file" onChange={e => { setDocFile(e.target.files?.[0] || null); setUploadError(""); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800" />
          </div>
          <button
            disabled={!docFile || uploading}
            onClick={handleUpload}
            className="flex items-center gap-2 px-5 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
        </div>
        {uploadError && <p className="text-xs text-red-500 mt-3">{uploadError}</p>}
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-base font-bold text-navy-900 mb-4">My Documents</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
        ) : staffNotFound ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-orange-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-600">Staff record not found</p>
            <p className="text-xs text-gray-400 mt-1">Please contact HR to link your account to a staff profile before uploading documents.</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc: any) => (
              <div key={doc.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{(doc.document_type || "other").replace("_", " ")}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors">
                    View Document <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
