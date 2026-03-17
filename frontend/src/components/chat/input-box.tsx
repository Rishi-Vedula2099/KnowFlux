"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Search, Command } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import LuxeButton from "@/components/ui/LuxeButton";

export function InputBox() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="ol-input-panel shrink-0 p-[0.875rem_1.1rem] bg-[rgba(10,10,12,0.92)] border border-[var(--edge2)] shadow-[inset_2px_2px_7px_rgba(0,0,0,0.4),inset_-2px_-2px_7px_rgba(0,0,0,0.2)] relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-[linear-gradient(90deg,transparent,var(--gold-d),transparent)] before:opacity-30">
      <div className="ol-input-row flex items-end gap-[0.75rem]">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your enquiry…"
          className="ol-textarea flex-1 bg-transparent border-none outline-none text-[var(--t1)] font-[var(--serif)] italic text-[0.925rem] leading-[1.6] resize-none min-h-[38px] max-h-[120px] p-[0.1rem_0] tracking-[0.02em] placeholder:text-[var(--t4)] placeholder:italic cursor-text"
          rows={1}
          disabled={isLoading}
        />
        <LuxeButton 
          onClick={handleSubmit} 
          disabled={!input.trim() || isLoading}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          Enquire
        </LuxeButton>
      </div>
      
      <div className="ol-toolbar flex items-center justify-between border-t border-[var(--edge)] pt-[0.6rem] mt-[0.5rem]">
        <div className="ol-toolbar-left flex items-center gap-[0.875rem]">
          <button className="ol-tool-btn bg-none border-none cursor-pointer text-[var(--t4)] p-[0.15rem] flex items-center justify-center transition-colors hover:text-[var(--gold-d)]" title="Attach">
            <Paperclip size={14} strokeWidth={1.5} />
          </button>
          <button className="ol-tool-btn bg-none border-none cursor-pointer text-[var(--t4)] p-[0.15rem] flex items-center justify-center transition-colors hover:text-[var(--gold-d)]" title="Search">
            <Search size={14} strokeWidth={1.5} />
          </button>
          <span className="text-[0.65rem] text-[var(--t4)] font-[var(--mono)] tracking-[0.04em]">
            adaptive-rag-4-6
          </span>
        </div>
        <span className="text-[0.6rem] text-[var(--t4)] font-[var(--mono)] tracking-[0.04em]">
          ⏎ send · ⇧⏎ newline
        </span>
      </div>
    </div>
  );
}
