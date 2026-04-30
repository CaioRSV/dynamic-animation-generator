"use client";

import { useState } from "react";
import AnimationCanvas from "@/components/AnimationCanvas";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);

  const [config, setConfig] = useState({
    step1: { dur: 800,  bX: -140, bScale: 1.0, bLook: 'right',   bMood: 'neutral', bItem: 'gun',   rX: 140,  rScale: 1.0, rLook: 'left',   rMood: 'happy',   rItem: 'money' },
    step2: { dur: 1200, bX: -40,  bScale: 1.2, bLook: 'forward', bMood: 'angry',   bItem: 'gun',   rX: 40,   rScale: 1.2, rLook: 'forward', rMood: 'shocked', rItem: 'banana' },
    step3: { dur: 800,  bX: 140,  bScale: 1.0, bLook: 'right',   bMood: 'happy',   bItem: 'coffee',rX: -140, rScale: 1.0, rLook: 'left',   rMood: 'angry',   rItem: 'bomb' },
    idle:  { dur: 800,  bX: -180, bScale: 1.0, bLook: 'forward', bMood: 'neutral', bItem: 'none',  rX: 180,  rScale: 1.0, rLook: 'forward', rMood: 'neutral', rItem: 'none' }
  });

  const handleChatSubmit = async (message: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message, currentConfig: config })
      });
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        return data.isMock 
          ? "I updated the scene! (Mocked response, add a valid OpenRouter API key in .env.local to use the real AI)." 
          : "I've adapted the scene based on your request!";
      } else {
        return "Sorry, I couldn't understand that or there was an API error.";
      }
    } catch (e) {
      return "An error occurred while connecting to the AI.";
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 max-w-[1800px] mx-auto items-stretch">
      <div className="flex-1 flex flex-col">
        <AnimationCanvas config={config} setConfig={setConfig} isLoading={isGenerating} />
      </div>
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-[600px] lg:h-[calc(100vh-4rem)]">
        <ChatInterface isLoading={isGenerating} onSubmit={handleChatSubmit} />
      </div>
    </div>
  );
}
