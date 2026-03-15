"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Command } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";

export function InputBox() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-card border border-border/50 rounded-xl p-2 shadow-sm"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask KnowFlux anything... (Shift+Enter for new line)"
            className="flex-1 max-h-[150px] min-h-[44px] bg-transparent border-none resize-none focus:outline-none focus:ring-0 py-2.5 px-3 text-sm"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 shrink-0 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-lg transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex justify-between items-center px-2 py-1.5 text-[10px] text-muted-foreground/60 w-full">
          <span>Press Enter to send</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> Adaptive Routing Active
          </span>
        </div>
      </div>
    </div>
  );
}
