import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Upload,
  FileText,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { fetchDocuments, uploadFile, createDocument, deleteDocument } from "../lib/db";
import { useAuth } from "../auth/useAuth";
import { confirmToast, toastSuccess, toastError } from "../lib/toast";

export default function StaffDocumentsPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedStaffName, setSelectedStaffName] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { fetchStaff, fetchBranchAssignments } = await import("../lib/db");
        const isBranchManager = user?.role === "branch_manager";
        const isSecretaryOrOfficer = user?.role === "secretary" || user?.role === "officer";
        
        if ((isBranchManager || isSecretaryOrOfficer) && user?.branch) {
          const { data: branchRec } = await supabase
            .from("branches")
            .select("id")
            .ilike("name", user.branch)
            .maybeSingle();
          
          if (branchRec?.id) {
            const data = await fetchStaff({ branch_id: branchRec.id, user: user ? { id: user.id, role: user.role, branch: user.branch } : undefined });
            setStaffList(data || []);
          } else {
            setStaffList([]);
          }
        } else {
          const data = await fetchStaff({ user: user ? { id: user.id, role: user.role, branch: user.branch } : undefined });
          setStaffList(data || []);
        }
      } catch {}
    })();
  }, [user?.id, user?.role, user?.branch]);

  useEffect(() => {
    if (!selectedStaffId) return;
    setLoading(true);
    fetchDocuments("staff", selectedStaffId).then(setDocuments).catch(() => {}).finally(() => setLoading(false));
  }, [selectedStaffId]);

  const handleUpload = async () => {
    if (!docFile || !selectedStaffId) return;
    setUploading(true);
    try {
      const path = `staff/${selectedStaffId}/custom-${Date.now()}-${docFile.name}`;
      const url = await uploadFile("staff-documents", path, docFile);
      await createDocument({ owner_type: "staff", owner_id: selectedStaffId, document_type: docType, name: docFile.name, file_url: url, file_size: docFile.size, mime_type: docFile.type });
      const docs = await fetchDocuments("staff", selectedStaffId);
      setDocuments(docs);
      setDocFile(null);
      setDocType("other");
      const input = document.querySelector<HTMLInputElement>('#staff-docs-input');
      if (input) input.value = '';
      toastSuccess("Document uploaded");
    } catch (err: any) {
      toastError(err?.message || "Upload failed");
    }
    setUploading(false);
  };

  const handleDelete = async (docId: string) => {
    const confirmed = await confirmToast("Delete this document?");
    if (!confirmed) return;
    try {
      await deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toastSuccess("Document deleted");
    } catch (err: any) {
      toastError(err?.message || "Delete failed");
    }
  };

  const filteredStaff = staffList.filter((s: any) =>
    `${s.first_name} ${s.last_name} ${s.email} ${s.staff_id}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectStaff = (staff: any) => {
    setSelectedStaffId(staff.id);
    setSelectedStaffName(`${staff.first_name} ${staff.last_name}`);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Staff Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Manage documents uploaded by staff members.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Selection */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 lg:col-span-1">
          <h2 className="text-base font-bold text-navy-900 mb-4">Select Staff Member</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/20"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredStaff.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No staff found</p>
            ) : filteredStaff.map((s: any) => (
              <button
                key={s.id}
                onClick={() => handleSelectStaff(s)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedStaffId === s.id
                    ? "bg-navy-900 text-white"
                    : "text-navy-900 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium">{s.first_name} {s.last_name}</p>
                <p className={`text-xs ${selectedStaffId === s.id ? "text-white/70" : "text-gray-400"}`}>{s.staff_id || s.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedStaffId ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-400">Select a staff member to view and manage their documents.</p>
            </div>
          ) : (
            <>
              {/* Upload Form */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-base font-bold text-navy-900 mb-4">Upload Document for {selectedStaffName}</h2>
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
                    <input id="staff-docs-input" type="file" onChange={e => { setDocFile(e.target.files?.[0] || null); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800" />
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
              </div>

              {/* Documents List */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="text-base font-bold text-navy-900 mb-4">Documents</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-900" /></div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No documents for this staff member.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            View <ChevronRight className="w-3 h-3" />
                          </a>
                          <button onClick={() => handleDelete(doc.id)} className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
