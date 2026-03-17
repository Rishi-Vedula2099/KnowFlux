"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import ReasoningTrace, { ReasoningStep } from "./ReasoningTrace";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end px-4">
        <div className="ol-msg-user max-w-[64%] p-[0.875rem_1.1rem] bg-[rgba(30,22,10,0.92)] border border-[rgba(212,168,67,0.14)] text-[var(--t3)] font-[var(--serif)] italic text-[0.95rem] line-height-[1.65] tracking-[0.02em] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),inset_-2px_-2px_5px_rgba(0,0,0,0.2)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // Assistant Message
  const luxeReasoning: ReasoningStep[] = message.reasoning_trace?.map(step => ({
    label: "Step",
    detail: step
  })) || [];

  if (message.query_type) {
    luxeReasoning.unshift({
      label: "Query Classified",
      detail: message.query_type.replace('_', ' ')
    });
  }

  return (
    <div className="flex w-full justify-start px-4">
      <div className="ol-msg-assistant max-w-[90%] p-[1.1rem_1.25rem] bg-[rgba(12,11,16,0.94)] border border-[var(--edge2)] text-[var(--t1)] font-[var(--serif)] text-[0.925rem] leading-[1.9] tracking-[0.02em] shadow-[inset_2px_2px_7px_rgba(0,0,0,0.4),inset_-2px_-2px_7px_rgba(0,0,0,0.2),0_0_20px_rgba(212,168,67,0.025)]">
        {luxeReasoning.length > 0 && <ReasoningTrace steps={luxeReasoning} />}
        
        <div className={cn("prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[var(--gold)]", luxeReasoning.length > 0 && "mt-2")}>
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : message.isStreaming ? (
            <div className="flex items-center h-5 gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)] opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)] opacity-30 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : null}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="ol-source-row flex flex-wrap gap-[0.375rem] mt-[0.875rem]">
            {message.sources.map((source, i) => (
              <button
                key={i}
                className="ol-source-pill p-[0.22rem_0.7rem] bg-[var(--gold-f)] border border-[var(--edge2)] text-[var(--gold)] text-[0.65rem] font-[var(--mono)] cursor-pointer transition-all duration-180 tracking-[0.06em] hover:bg-[var(--gold-f2)] hover:border-[var(--edge3)] hover:shadow-[0_0_10px_rgba(212,168,67,0.14)] hover:-translate-y-[1px]"
                title={source.content}
              >
                [{source.source}]
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
