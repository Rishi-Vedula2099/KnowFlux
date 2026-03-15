"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./message";
import { Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWindow() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto relative" ref={containerRef}>
      <div className="flex flex-col gap-6 py-8 pb-32 w-full items-center justify-end min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4 my-auto mt-24">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground mb-3">
              How can I help you today?
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              I&apos;m KnowFlux, an Adaptive RAG assistant. I&apos;ll automatically choose between analyzing documents, reasoning, or searching the web based on your query.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {[
                "What is the capital of France?",
                "Summarize my latest uploaded document.",
                "Compare concepts across the knowledge base.",
                "What's the weather in Tokyo today?",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  className="p-3 text-xs bg-card border border-border/50 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground text-left line-clamp-2"
                  onClick={() => {
                    const input = document.querySelector('textarea');
                    if (input) {
                      input.value = suggestion;
                      // Trigger react synthetic event if needed, or better expose a method from store/context
                    }
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} className="h-1" />
      </div>
      
      {/* Scroll to bottom button (optional) */}
      {messages.length > 5 && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-8 rounded-full shadow-lg bg-background/80 backdrop-blur"
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <ArrowDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
