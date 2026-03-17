"use client";

import { useState, useCallback, useEffect } from "react";
import { useDocumentStore } from "@/store/document-store";
import { UploadCloud, FileType, Link as LinkIcon, Loader2, Trash2, Database, Globe } from "lucide-react";
import LuxeButton from "@/components/ui/LuxeButton";
import Sparkline from "@/components/ui/Sparkline";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const { documents, fetchDocuments, uploadDocument, deleteDocument, isLoading } = useDocumentStore();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith('.md')) {
        setFile(droppedFile);
        setUploadMode("file");
      } else {
        toast.error("Invalid file type. Please upload a PDF, DOCX, TXT, or MD file.");
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file && !url) {
      toast.error("Please provide a file or URL");
      return;
    }

    try {
      await uploadDocument(uploadMode === "file" ? file : null, uploadMode === "url" ? url : null, tags);
      toast.success("Document ingested successfully!");
      setFile(null);
      setUrl("");
      setTags("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (confirm(`Are you sure you want to remove '${filename}' from the knowledge base?`)) {
      try {
        await deleteDocument(id);
        toast.success("Document removed");
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Deletion failed: ${error.message}`);
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 gap-4 relative overflow-hidden">
      
      {/* Header */}
      <div className="ol-chat-header flex items-center gap-3 shrink-0">
        <span className="ol-chat-title font-[var(--serif)] italic font-light text-2xl tracking-wide text-[var(--gold-l)]">
          Knowledge Base
        </span>
        <span className="ol-chat-badge text-[0.65rem] p-[0.18rem_0.7rem] border border-[var(--edge3)] text-[var(--gold)] bg-[var(--gold-f)] font-[var(--mono)] tracking-[0.07em]">
          Vector Inventory
        </span>
        <div className="ml-auto flex items-center gap-[0.75rem]">
          <span className="text-[0.62rem] text-[var(--t4)] font-[var(--mono)] tracking-[0.1em] uppercase">
            Capacity: 4.2GB
          </span>
        </div>
      </div>

      {/* Ornamental separator */}
      <div className="ol-ornament flex items-center gap-2 shrink-0">
        <div className="ol-orn-line flex-1 h-[1px] bg-[linear-gradient(to_right,transparent,var(--edge2))]" />
        <div className="ol-orn-diamond w-[5px] h-[5px] bg-[var(--gold)] rotate-45 shrink-0 shadow-[0_0_4px_rgba(212,168,67,0.5)]" />
        <div className="ol-orn-line-rev flex-1 h-[1px] bg-[linear-gradient(to_left,transparent,var(--edge2))]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Ingestion Engine */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="ol-glass p-6 flex flex-col gap-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] border-[var(--edge2)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.68rem] font-semibold text-[var(--t3)] uppercase tracking-[0.14em]">Ingestion Engine</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setUploadMode("file")}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center border transition-all duration-200",
                    uploadMode === "file" ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-f2)] shadow-[0_0_10px_rgba(212,168,67,0.1)]" : "border-[var(--edge)] text-[var(--t4)] hover:text-[var(--t3)]"
                  )}
                >
                  <Database size={14} />
                </button>
                <button 
                  onClick={() => setUploadMode("url")}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center border transition-all duration-200",
                    uploadMode === "url" ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-f2)] shadow-[0_0_10px_rgba(212,168,67,0.1)]" : "border-[var(--edge)] text-[var(--t4)] hover:text-[var(--t3)]"
                  )}
                >
                  <Globe size={14} />
                </button>
              </div>
            </div>

            {uploadMode === "file" ? (
              <div 
                className={cn(
                  "ol-upload border-dashed border-[rgba(212,168,67,0.22)] p-[2rem_1.25rem] flex flex-col items-center justify-center gap-[0.4rem] cursor-pointer transition-all duration-[0.22s] bg-[rgba(212,168,67,0.01)] hover:border-[var(--gold)] hover:bg-[rgba(212,168,67,0.04)] hover:shadow-[0_0_18px_rgba(212,168,67,0.07)]",
                  dragActive && "border-[var(--gold)] bg-[rgba(212,168,67,0.06)]",
                  file && "border-[var(--gold)]"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <span className="ol-upload-icon text-[2rem] text-[var(--gold)] filter drop-shadow-[0_0_8px_rgba(212,168,67,0.55)] animate-[ol-float_3s_ease-in-out_infinite]">⬡</span>
                {file ? (
                  <div className="text-center font-[var(--serif)]">
                    <p className="text-[var(--gold-l)] text-sm mb-1">{file.name}</p>
                    <p className="text-[var(--t4)] text-[10px] uppercase font-[var(--mono)] tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={() => setFile(null)} className="text-[var(--crimson)] text-[10px] mt-2 uppercase font-[var(--mono)] tracking-wider hover:underline underline-offset-4">Discard</button>
                  </div>
                ) : (
                  <p className="ol-upload-text text-[0.65rem] text-[var(--t4)] text-center font-[var(--mono)] tracking-[0.05em] leading-[1.6]">
                    <em className="font-normal text-[var(--gold)] not-italic">Drag & Drop</em> or click to upload<br />
                    PDF · DOCX · TXT · MD
                  </p>
                )}
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
                {!file && <label htmlFor="file-upload" className="mt-2 text-[var(--gold-d)] text-[10px] uppercase font-[var(--mono)] tracking-[0.14em] cursor-pointer hover:text-[var(--gold)] transition-colors underline underline-offset-4">Browse Files</label>}
              </div>
            ) : (
              <div className="space-y-4 font-[var(--serif)]">
                <div className="space-y-2">
                  <label className="text-[0.68rem] text-[var(--t4)] font-[var(--mono)] tracking-[0.1em] uppercase">Web Anthology URL</label>
                  <Input 
                    placeholder="https://example.com/intelligence" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-[var(--surface)] border-[var(--edge)] text-[var(--t1)] italic placeholder:opacity-30 focus-visible:ring-0 focus-visible:border-[var(--gold-d)]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[0.68rem] text-[var(--t4)] font-[var(--mono)] tracking-[0.1em] uppercase italic">Taxonomy Tags (Optional)</label>
                <Input 
                  placeholder="finance, dossier-2024, confidential" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-[var(--surface)] border-[var(--edge)] text-[var(--t1)] font-[var(--serif)] italic placeholder:opacity-30 focus-visible:ring-0 focus-visible:border-[var(--gold-d)]"
                />
              </div>
              
              <LuxeButton 
                className="w-full justify-center" 
                onClick={handleUpload}
                disabled={isLoading || (!file && !url)}
              >
                {isLoading ? (
                  <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Encrypting...</>
                ) : (
                  <>Commence Ingestion</>
                )}
              </LuxeButton>
            </div>
          </div>

          <div className="ol-glass p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] border-[var(--edge2)] flex-1 overflow-hidden flex flex-col gap-4">
             <span className="text-[0.68rem] font-semibold text-[var(--t3)] uppercase tracking-[0.14em]">Index Statistics</span>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--gold-f)] border border-[var(--edge)]">
                   <p className="text-[0.62rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-wider mb-1">Total Assets</p>
                   <p className="text-xl font-[var(--serif)] text-[var(--gold-l)]">{documents.length}</p>
                </div>
                <div className="p-3 bg-[var(--gold-f)] border border-[var(--edge)]">
                   <p className="text-[0.62rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-wider mb-1">Vector States</p>
                   <p className="text-xl font-[var(--serif)] text-[var(--gold-l)]">Active</p>
                </div>
             </div>
             <div className="flex-1 border border-[var(--edge)] bg-[rgba(212,168,67,0.02)] p-4 flex flex-col items-center justify-center text-center">
                <p className="text-[0.65rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-[0.1em] mb-2 font-light">Memory Distribution</p>
                <div className="w-full h-[60px] opacity-40">
                   <Sparkline values={[40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90]} width={200} height={60} />
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Indexed Inventory */}
        <div className="ol-glass p-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] border-[var(--edge2)] flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[0.68rem] font-semibold text-[var(--t3)] uppercase tracking-[0.14em]">Archives Inventory</span>
            <div className="ol-more-btn w-[22px] h-[22px] bg-[var(--gold-f)] border border-[var(--edge)] cursor-pointer flex items-center justify-center text-[var(--t4)] text-[0.65rem] transition-all hover:text-[var(--gold)] hover:border-[var(--edge2)]">···</div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-3 custom-scrollbar min-h-0">
            {documents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <span className="text-4xl text-[var(--gold)]">Ω</span>
                <p className="text-[0.65rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-widest">The archives are silent</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="ol-doc-card group p-[0.8rem_0.875rem] bg-[rgba(10,10,12,0.88)] border border-[var(--edge)] cursor-pointer transition-all duration-200 hover:border-[var(--edge3)] hover:shadow-[0_0_14px_rgba(212,168,67,0.06)] hover:-translate-y-[1px]">
                  <div className="ol-doc-top flex items-center gap-[0.6rem] mb-[0.5rem]">
                    <div className="ol-doc-icon w-[28px] h-[28px] flex-shrink-0 bg-[var(--gold-f)] border border-[var(--edge2)] flex items-center justify-center text-[0.55rem] font-semibold font-[var(--mono)] text-[var(--gold)] tracking-[0.04em]">
                      {doc.file_type === "url" ? "WWW" : "PDF"}
                    </div>
                    <span className="ol-doc-name text-[0.75rem] font-light text-[var(--t1)] whitespace-nowrap overflow-hidden text-ellipsis flex-1 font-[var(--serif)] tracking-[0.02em]" title={doc.filename}>
                      {doc.filename}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.filename); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--t4)] hover:text-[var(--crimson)] transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="ol-doc-meta flex items-center justify-between">
                    <div className="flex gap-2 text-[0.62rem] text-[var(--t4)] font-[var(--mono)] uppercase tracking-tight">
                       <span>{doc.chunk_count} chunks</span>
                       <span className="opacity-20">|</span>
                       <span>
                          {doc.upload_date 
                            ? formatDistanceToNow(new Date(doc.upload_date), { addSuffix: true })
                            : "PRIME"}
                       </span>
                    </div>
                    <Sparkline values={[Math.random() * 50 + 20, Math.random() * 50 + 20, Math.random() * 50 + 20, Math.random() * 50 + 20]} width={60} height={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
