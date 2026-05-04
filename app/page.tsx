"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import AnimationCanvas from "@/components/AnimationCanvas";
import LogInterface from "@/components/LogInterface";

const FacialRecognition = dynamic(() => import("@/components/FacialRecognition"), { ssr: false });

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmotion, setUserEmotion] = useState("neutral");
  const [logs, setLogs] = useState<{content: string, emotion?: string, timestamp: string}[]>([]);

  const [config, setConfig] = useState({
    step1: { dur: 2500, bX: -160, bLook: 'right', bMood: 'neutral', bItem: 'none', bSpeech: 'Quem está aí?', rX: 160, rLook: 'left', rMood: 'neutral', rItem: 'none', rSpeech: '...' },
    step2: { dur: 3000, bX: -100, bLook: 'right', bMood: 'angry', bItem: 'none', bSpeech: 'Apareça devagar.', rX: 100, rLook: 'left', rMood: 'neutral', rItem: 'banana', rSpeech: 'Calma aí, Xerife.' },
    step3: { dur: 2500, bX: -100, bLook: 'right', bMood: 'angry', bItem: 'gun', bSpeech: 'Não se mova.', rX: 100, rLook: 'left', rMood: 'happy', rItem: 'banana', rSpeech: 'Eu não fiz nada.' }
  });

  const [history, setHistory] = useState<string[]>([]);

  const latestEmotion = useRef(userEmotion);
  const latestConfig = useRef(config);
  const latestHistory = useRef(history);

  useEffect(() => { latestEmotion.current = userEmotion; }, [userEmotion]);
  useEffect(() => { latestConfig.current = config; }, [config]);
  useEffect(() => { latestHistory.current = history; }, [history]);

  const addLog = (content: string, emotion?: string) => {
    setLogs(prev => [...prev, {
      content,
      emotion,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const fetchNewScene = async () => {
    setIsGenerating(true);
    const currentEmotion = latestEmotion.current;
    
    addLog(`Nova cena solicitada para a IA.`, currentEmotion);

    try {
      const prompt = latestHistory.current.length === 0 
        ? "Esta é a primeira cena da história. Introduza um diálogo inicial focado entre os personagens." 
        : `Continue a conversa naturalmente com base no histórico de diálogos fornecido. O usuário está sentindo: ${currentEmotion}. Incorpore ou reaja a essa emoção no que os personagens estão dizendo.`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          emotion: currentEmotion, 
          history: latestHistory.current,
          currentConfig: latestConfig.current,
          isAutoLoop: true 
        })
      });
      const data = await res.json();
      if (data.sequences && data.sequences.length > 0) {
        const nextSeq = data.sequences[0];
        setConfig(nextSeq);
        
        const extractSpeech = (seq: any, prefix: string) => [seq.step1, seq.step2, seq.step3].map(s => s[`${prefix}Speech`]).filter(Boolean).join(" ");
        const summary = `Sheriff disse: "${extractSpeech(nextSeq, 'b')}". Bandido disse: "${extractSpeech(nextSeq, 'r')}".`;
        setHistory(prev => [...prev, summary].slice(-6));
        
        addLog(data.reasoning || `Nova cena gerada com sucesso!`, currentEmotion);
      }
    } catch (e) {
      console.error(e);
      addLog("Erro ao gerar cena.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-[2500px] mx-auto items-stretch">
      {/* Left side: Logs */}
      <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 h-[40vh] lg:h-full">
        <LogInterface isLoading={isGenerating} logs={logs} />
      </div>

      {/* Middle: Canvas & Controls */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pr-2">
        <AnimationCanvas 
          config={config} 
          setConfig={setConfig} 
          isLoading={isGenerating} 
          onGenerateNewScene={() => fetchNewScene()}
        />
      </div>

      {/* Right side: Facial Recognition */}
      <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col justify-start">
        <FacialRecognition onExpressionChange={setUserEmotion} />
      </div>
    </div>
  );
}
