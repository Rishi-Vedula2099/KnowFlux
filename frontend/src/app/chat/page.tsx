"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { InputBox } from "@/components/chat/input-box";
import { BrainCircuit, Info } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* Header */}
      <div className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-1.5 rounded-md">
            <BrainCircuit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">Adaptive Engine</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              GPT-4o <span className="w-1 h-1 rounded-full bg-green-500 inline-block" /> FAISS <span className="w-1 h-1 rounded-full bg-green-500 inline-block" /> Tavily Search
            </p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-2" title="System Info">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Area */}
      <ChatWindow />

      {/* Input Area */}
      <div className="shrink-0 z-10">
        <InputBox />
      </div>
    </div>
  );
}
