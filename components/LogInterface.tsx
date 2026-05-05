"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface LogMessage {
  content: string;
  emotion?: string;
  timestamp: string;
}

interface LogInterfaceProps {
  isLoading: boolean;
  logs: LogMessage[];
}

export default function LogInterface({ isLoading, logs }: LogInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isLoading]);

  const expressionEmojis: Record<string, string> = {
    neutral: "😐",
    happy: "😀",
    sad: "😢",
    angry: "😠",
    fearful: "😨",
    disgusted: "🤢",
    surprised: "😲",
  };

  return (
    <div className="w-full h-full flex flex-col border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/50 relative">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
          <Sparkles size={18} />
        </div>
        <div className="flex">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">Logs do Diretor</h2>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1.5 mt-0.5 py-2 flex-0.5">
            <span className="text-[20px] text-blue-500 font-bold uppercase tracking-wider animate-pulse">Gerando...</span>
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Logs Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {logs.length === 0 && !isLoading && (
          <p className="text-zinc-500 text-sm text-center mt-10">Aguardando cenas serem geradas...</p>
        )}
        {logs.map((log, idx) => (
          <div key={idx} className="flex flex-col gap-1 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm relative">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <span className="text-xs text-zinc-400 font-mono shrink-0">{log.timestamp}</span>
              {log.emotion && log.emotion !== "none (initial)" && (
                <span className="text-xs px-2.5 py-1 bg-zinc-200/50 dark:bg-zinc-800 rounded-md text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 max-w-full">
                  <span className="shrink-0">Detected: {expressionEmojis[log.emotion] || "🤔"}</span>
                  <span className="truncate" title={log.emotion.toUpperCase()}>{log.emotion.toUpperCase()}</span>
                </span>
              )}
            </div>
            <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
              {log.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
