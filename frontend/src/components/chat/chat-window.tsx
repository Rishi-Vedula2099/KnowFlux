"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./message";
import { Sparkles, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatWindow() {
  const { messages, sendMessage } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="ol-glass flex-1 overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.3)] mx-4 my-2">
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar" ref={containerRef}>
          <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-[var(--gold-f)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--edge2)] shadow-[0_0_30px_rgba(212,168,67,0.1)]">
                  <Sparkles className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h2 className="text-3xl font-[var(--serif)] italic font-light text-[var(--gold-l)] mb-4 tracking-tight">
                  How may I serve your enquiry?
                </h2>
                <p className="text-sm text-[var(--t3)] font-[var(--ui)] mb-10 tracking-[0.02em] max-w-md">
                  I am KnowFlux, your Adaptive RAG assistant. I shall consult the archives or the wider web to provide the intelligence you seek.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                  {[
                    "What are the key findings in the latest report?",
                    "Summarize my knowledge base documents.",
                    "Compare expansion strategies in APAC.",
                    "Analyze the competitive landscape.",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      className="ol-doc-card group p-[1rem] bg-[rgba(10,10,12,0.6)] border border-[var(--edge)] transition-all duration-200 hover:border-[var(--edge3)] hover:shadow-[0_0_14px_rgba(212,168,67,0.06)] hover:-translate-y-[1px] text-left"
                      onClick={() => sendMessage(suggestion)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="ol-doc-icon w-8 h-8 flex-shrink-0 bg-[var(--gold-f)] border border-[var(--edge2)] flex items-center justify-center text-[10px] text-[var(--gold)] font-[var(--mono)] group-hover:bg-[var(--gold-f2)]">
                          IQ
                        </div>
                        <span className="text-xs font-[var(--serif)] text-[var(--t1)] tracking-wide group-hover:text-[var(--gold-l)]">Suggestion</span>
                      </div>
                      <p className="text-xs text-[var(--t4)] font-[var(--ui)] line-clamp-2 leading-relaxed italic group-hover:text-[var(--t3)]">
                        &quot;{suggestion}&quot;
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {messages.length > 5 && (
        <button
          className="absolute bottom-10 right-10 w-10 h-10 rounded-full border border-[var(--edge2)] bg-[rgba(20,18,14,0.8)] backdrop-blur text-[var(--gold)] flex items-center justify-center shadow-2xl transition-all duration-300 hover:border-[var(--gold)] hover:scale-110"
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
