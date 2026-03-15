"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { BrainCircuit, User, AlertCircle, Link as LinkIcon, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [showTrace, setShowTrace] = useState(false);
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={cn("flex w-full px-4 sm:px-0", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-4 max-w-4xl w-full", isUser ? "flex-row-reverse" : "flex-row")}>

        {/* Avatar */}
        <div className="shrink-0 mt-1">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border",
            isUser
              ? "bg-secondary border-border"
              : "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          )}>
            {isUser ? <User className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
          </div>
        </div>

        {/* Content Box */}
        <div className={cn(
          "flex flex-col gap-2 min-w-[10%] max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Metadata headers for Assistant */}
          {!isUser && message.query_type && (
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] bg-background/50 border-primary/20 text-primary uppercase tracking-wider">
                {message.query_type.replace('_', ' ')}
              </Badge>

              {message.confidence !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-full border border-border/50">
                  <AlertCircle className={cn(
                    "w-3 h-3",
                    message.confidence > 0.8 ? "text-green-500" :
                      message.confidence > 0.5 ? "text-amber-500" : "text-red-500"
                  )} />
                  {Math.round(message.confidence * 100)}% Confident
                </div>
              )}
            </div>
          )}

          {/* Reasoning Trace Collapsible */}
          {!isUser && message.reasoning_trace && message.reasoning_trace.length > 0 && (
            <div className="w-full bg-secondary/20 border border-border/40 rounded-lg overflow-hidden transition-all text-xs mb-2">
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="flex items-center gap-2 w-full px-3 py-2 text-muted-foreground hover:bg-secondary/40 transition-colors"
              >
                {showTrace ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <BrainCircuit className="w-3 h-3" />
                <span>Agent Reasoning Trace</span>
              </button>

              {showTrace && (
                <div className="px-3 py-2 border-t border-border/40 font-mono text-muted-foreground/80 space-y-1 bg-black/20">
                  {message.reasoning_trace.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="opacity-50">[{i + 1}]</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content Bubble */}
          <div className={cn(
            "rounded-2xl px-5 py-3.5 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border/50 prose-a:text-primary",
            isUser ? "bg-secondary text-foreground" : "glass-panel border-primary/10 shadow-lg"
          )}>
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : message.isStreaming ? (
              <div className="flex items-center h-5 gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : null}
          </div>

          {/* Sources Section */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="w-full mt-2">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                {showSources ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span className="font-medium">Sources ({message.sources.length})</span>
              </button>

              {showSources && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {message.sources.map((source, i) => (
                    <div key={i} className="bg-card border border-border/60 rounded-lg p-3 text-xs hover:border-primary/30 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LinkIcon className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="font-semibold truncate text-foreground/80" title={source.source}>
                          [{i + 1}] {source.source}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-3 leading-snug">
                        {source.content}...
                      </p>
                      <div className="mt-2 text-[10px] text-muted-foreground/60 flex justify-between">
                        <span>Relevance: {(source.relevance * 100).toFixed(0)}%</span>
                        {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View link</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
