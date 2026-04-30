"use client";

import React, { useState } from "react";
import { Send, Sparkles, Loader2, Bot, User } from "lucide-react";

interface ChatInterfaceProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatInterface({ isLoading, onSubmit }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I am the animation assistant. Tell me how you'd like to change the animation behavior, and I'll generate new code for it.",
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    
    // Trigger submit
    onSubmit(inputValue);
    setInputValue("");
  };

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/50 relative">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-zinc-600 dark:text-zinc-300 font-medium animate-pulse">
            Generating new animation behavior...
          </p>
        </div>
      )}

      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
          <Sparkles size={18} />
        </div>
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">AI Animation Editor</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user" ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-800" : "bg-blue-500 text-white"
            }`}>
              {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
              msg.role === "user" 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tr-sm" 
                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100 rounded-tl-sm"
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-4 flex-row">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="px-4 py-4 rounded-2xl max-w-[80%] bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100 rounded-tl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
         </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="E.g., Make them rotate 360 degrees while scaling up..."
            className="w-full bg-zinc-100 dark:bg-zinc-950 border border-transparent focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-full pl-6 pr-14 py-3.5 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 transition-colors"
          >
            <Send size={18} className={inputValue.trim() && !isLoading ? "translate-x-[1px] -translate-y-[1px]" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
