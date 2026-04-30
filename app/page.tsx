"use client";

import { useState } from "react";
import AnimationCanvas from "@/components/AnimationCanvas";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChatSubmit = (message: string) => {
    // Mock the AI generation process
    setIsGenerating(true);

    // Simulate a 5 second loading period for the mocked AI backend
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 max-w-[1800px] mx-auto items-stretch">
      <div className="flex-1 flex flex-col">
        <AnimationCanvas isLoading={isGenerating} />
      </div>
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-[600px] lg:h-[calc(100vh-4rem)]">
        <ChatInterface isLoading={isGenerating} onSubmit={handleChatSubmit} />
      </div>
    </div>
  );
}
