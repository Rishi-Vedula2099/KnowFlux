import { create } from 'zustand';

export type QueryType = 'simple' | 'retrieval' | 'multi_hop' | 'web_search';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: any[];
  query_type?: QueryType;
  confidence?: number;
  reasoning_trace?: string[];
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearChat: () => void;
  setConversationId: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  isLoading: false,
  error: null,

  setConversationId: (id) => set({ conversationId: id }),
  
  clearChat: () => set({ messages: [], conversationId: null, error: null }),
  
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
    
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  sendMessage: async (content: string) => {
    const { conversationId, addMessage, updateMessage } = get();
    
    // Add user message
    const userMsgId = Date.now().toString();
    addMessage({
      id: userMsgId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    });

    // Add empty assistant message for streaming/loading state
    const assistantMsgId = (Date.now() + 1).toString();
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      reasoning_trace: [],
    });

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversation_id: conversationId }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let fullContent = '';
      let currentTrace: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'metadata') {
              updateMessage(assistantMsgId, { query_type: data.query_type });
            } else if (data.type === 'sources') {
              updateMessage(assistantMsgId, { sources: data.sources });
            } else if (data.type === 'reasoning') {
              currentTrace = data.trace;
              updateMessage(assistantMsgId, { reasoning_trace: currentTrace });
            } else if (data.type === 'token') {
              fullContent += data.content;
              updateMessage(assistantMsgId, { content: fullContent });
            } else if (data.type === 'done') {
              updateMessage(assistantMsgId, { 
                confidence: data.confidence,
                isStreaming: false 
              });
              if (data.conversation_id) {
                set({ conversationId: data.conversation_id });
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Chat error:', error);
        set({ error: error.message });
        updateMessage(assistantMsgId, { 
          content: 'Sorry, I encountered an error processing your request.',
          isStreaming: false 
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
