"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { InputBox } from "@/components/chat/input-box";
import LuxeToggle from "@/components/ui/LuxeToggle";

export default function ChatPage() {
  return (
    <div className="ol-chat flex flex-col h-full gap-4 min-w-0 p-4 relative">
      {/* Header */}
      <div className="ol-chat-header flex items-center gap-3 shrink-0">
        <span className="ol-chat-title font-[var(--serif)] italic font-light text-2xl tracking-wide text-[var(--gold-l)]">
          The Oracle
        </span>
        <span className="ol-chat-badge text-[0.65rem] p-[0.18rem_0.7rem] border border-[var(--edge3)] text-[var(--gold)] bg-[var(--gold-f)] font-[var(--mono)] tracking-[0.07em]">
          Adaptive RAG · Active
        </span>
        <div className="ol-hd-right ml-auto flex items-center gap-[0.75rem]">
          <LuxeToggle label="Stream" defaultOn />
        </div>
      </div>

      {/* Ornamental separator */}
      <div className="ol-ornament flex items-center gap-2 shrink-0">
        <div className="ol-orn-line flex-1 h-[1px] bg-[linear-gradient(to_right,transparent,var(--edge2))]" />
        <div className="ol-orn-diamond w-[5px] h-[5px] bg-[var(--gold)] rotate-45 shrink-0 shadow-[0_0_4px_rgba(212,168,67,0.5)]" />
        <div className="ol-orn-line-rev flex-1 h-[1px] bg-[linear-gradient(to_left,transparent,var(--edge2))]" />
      </div>

      {/* Main Chat Area */}
      <ChatWindow />

      {/* Input Area */}
      <InputBox />
    </div>
  );
}
