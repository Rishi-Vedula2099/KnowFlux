"use client";

import { useState, useCallback, useEffect } from "react";
import { useDocumentStore } from "@/store/document-store";
import { UploadCloud, FileType, Link as LinkIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
            Knowledge Base
          </h1>
          <p className="text-muted-foreground text-lg">
            Train KnowFlux by uploading documents or scraping websites.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-primary/20 bg-background/50">
              <div className="flex bg-secondary/50 p-1 rounded-lg mb-6 max-w-fit">
                <button
                  onClick={() => setUploadMode("file")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === "file" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setUploadMode("url")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === "url" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URL Scraping
                </button>
              </div>

              {uploadMode === "file" ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                    dragActive 
                      ? "border-primary bg-primary/10" 
                      : file ? "border-green-500/50 bg-green-500/5" : "border-border/60 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <FileType className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-2">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <UploadCloud className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">Upload a Document</h3>
                      <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        accept=".pdf,.docx,.txt,.md"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="file-upload">
                        <span className="cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-border/50">
                          Browse Files
                        </span>
                      </label>
                      <p className="text-xs text-muted-foreground mt-4">Supported: PDF, DOCX, TXT, MD (Max 50MB)</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <LinkIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Web Address</label>
                    <Input 
                      placeholder="https://example.com/article" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="bg-background/50 border-white/10 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 text-muted-foreground block">Tags (comma separated, optional)</label>
                  <Input 
                    placeholder="finance, report-2024, confidential" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                
                <Button 
                  className="w-full gap-2 font-medium" 
                  size="lg"
                  onClick={handleUpload}
                  disabled={isLoading || (!file && !url)}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting to Vector Database...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> Start Ingestion</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <h3 className="text-xl font-semibold">Indexed Documents</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {documents.length} Total
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {documents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3">
                  <FileType className="w-12 h-12 opacity-20" />
                  <p>Knowledge base is empty</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                        {doc.file_type === "url" ? (
                          <LinkIcon className="w-5 h-5 text-amber-500" />
                        ) : (
                          <FileType className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate" title={doc.filename}>{doc.filename}</p>
                        <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{doc.chunk_count} chunks</span>
                          <span>•</span>
                          <span>
                            {doc.upload_date 
                              ? formatDistanceToNow(new Date(doc.upload_date), { addSuffix: true })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                      title="Remove from index"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
