"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import AnimationCanvas from "@/components/AnimationCanvas";
import LogInterface from "@/components/LogInterface";
import { ChevronLeft, ChevronRight, List, Camera as CameraIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FacialRecognition = dynamic(() => import("@/components/FacialRecognition"), { ssr: false });

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const [userEmotion, setUserEmotion] = useState("neutral");
  const [logs, setLogs] = useState<{ content: string, emotion?: string, timestamp: string }[]>([]);
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [isFacialExpanded, setIsFacialExpanded] = useState(true);

  const defaultSeq1 = {
    step1: { dur: 2500, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'none', bSpeech: 'Parado! O que faz aqui?', rX: 120, rLook: 'left', rMood: 'neutral', rItem: 'none', rSpeech: '' },
    step2: { dur: 3000, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'none', bSpeech: '', rX: 120, rLook: 'left', rMood: 'shocked', rItem: 'banana', rSpeech: 'Eu? Só comendo minha banana.' },
    step3: { dur: 3000, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'none', bSpeech: 'Alguém roubou o banco hoje!', rX: 120, rLook: 'left', rMood: 'shocked', rItem: 'banana', rSpeech: '' },
    step4: { dur: 2500, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'bomb', bSpeech: '', rX: 120, rLook: 'left', rMood: 'neutral', rItem: 'banana', rSpeech: 'Que horror. Fui eu não.' },
    step5: { dur: 3000, bX: -120, bLook: 'right', bMood: 'neutral', bItem: 'money', bSpeech: 'Tem certeza? Achei esse dinheiro na sua bagagem.', rX: 120, rLook: 'left', rMood: 'neutral', rItem: 'banana', rSpeech: '' },
    step6: { dur: 3000, bX: -120, bLook: 'right', bMood: 'neutral', bItem: 'money', bSpeech: '', rX: 120, rLook: 'left', rMood: 'happy', rItem: 'none', rSpeech: 'Impossível! Eu só tenho o dinheiro da minha carteira.' },
    step7: { dur: 2500, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'gun', bSpeech: 'Alguém botou dinheiro na sua bolsa então, cidadão?', rX: 120, rLook: 'left', rMood: 'happy', rItem: 'none', rSpeech: '' },
    step8: { dur: 3000, bX: -120, bLook: 'right', bMood: 'angry', bItem: 'none', bSpeech: '', rX: 120, rLook: 'left', rMood: 'angry', rItem: 'none', rSpeech: 'Só pode ter sido..' }
  };

  const [sequenceQueue, setSequenceQueue] = useState<any[]>([defaultSeq1]);
  const [config, setConfig] = useState(defaultSeq1);
  const [history, setHistory] = useState<string[]>([]);
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);

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
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    const currentEmotion = latestEmotion.current;

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
        const newSequences = data.sequences;

        setSequenceQueue(prev => {
          const wasEmpty = prev.length === 0;
          const nextQueue = [...prev, ...newSequences];
          // Se estava vazio, carrega a primeira agora. 
          // Se já tinha algo rodando, apenas empilha na fila para o onSequenceComplete carregar depois.
          if (wasEmpty) {
            setConfig(nextQueue[0]);
          }
          return nextQueue;
        });

        const getDialogueSequence = (seq: any) => {
          const turns: string[] = [];
          ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'].forEach(stepKey => {
            const step = seq[stepKey];
            if (step.bSpeech) turns.push(`Sheriff: "${step.bSpeech}"`);
            if (step.rSpeech) turns.push(`Bandido: "${step.rSpeech}"`);
          });
          return turns.join(" -> ");
        };

        const summary = data.sequences.map((seq: any) => getDialogueSequence(seq)).join(" | ");
        setHistory(prev => [...prev, summary].slice(-8)); // Keep last 8 sequence beats

        addLog(data.reasoning || `Cena gerada e bufferizada com sucesso!`, currentEmotion);
      }
    } catch (e) {
      console.error(e);
      addLog("Erro ao gerar cena.");
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  // Continuous background buffer loop
  useEffect(() => {
    if (isAutoGenerate && sequenceQueue.length < 3 && !isGeneratingRef.current) {
      const timer = setTimeout(() => {
        if (!isGeneratingRef.current) fetchNewScene();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAutoGenerate, sequenceQueue.length, isGenerating]);

  const handleSequenceComplete = () => {
    setSequenceQueue(prev => {
      let newQueue = [...prev];
      if (newQueue.length > 0) {
        newQueue.shift(); // Remove the finished one
      }
      if (newQueue.length > 0) {
        setConfig(newQueue[0]); // Load next sequence immediately
      }
      return newQueue;
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans flex flex-col lg:flex-row p-4 sm:p-6 gap-4 max-w-[2500px] mx-auto items-stretch">
      {/* Left side: Logs */}
      <div className="relative flex h-[40vh] lg:h-full shrink-0">
        <motion.div
          animate={{ width: isLogsExpanded ? (typeof window !== 'undefined' && window.innerWidth > 1024 ? 320 : "100%") : 0, opacity: isLogsExpanded ? 1 : 0 }}
          className="overflow-hidden h-full"
        >
          <div className="w-[320px] h-full">
            <LogInterface isLoading={isGenerating} logs={logs} />
          </div>
        </motion.div>
        <button
          onClick={() => setIsLogsExpanded(!isLogsExpanded)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md text-zinc-500 hover:text-blue-500 transition-colors hidden lg:block"
        >
          {isLogsExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Middle: Canvas & Controls */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pr-2">
        <AnimationCanvas
          config={config}
          setConfig={setConfig}
          isLoading={isGenerating}
          isAutoGenerate={isAutoGenerate}
          setIsAutoGenerate={setIsAutoGenerate}
          onSequenceComplete={handleSequenceComplete}
          isLogsExpanded={isLogsExpanded}
          isFacialExpanded={isFacialExpanded}
        />
      </div>

      {/* Right side: Facial Recognition */}
      <div className="relative flex h-auto lg:h-full shrink-0">
        <button
          onClick={() => setIsFacialExpanded(!isFacialExpanded)}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md text-zinc-500 hover:text-blue-500 transition-colors hidden lg:block"
        >
          {isFacialExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <motion.div
          animate={{ width: isFacialExpanded ? (typeof window !== 'undefined' && window.innerWidth > 1024 ? 320 : "100%") : 0, opacity: isFacialExpanded ? 1 : 0 }}
          className="overflow-hidden h-full"
        >
          <div className="w-[320px] h-full flex flex-col justify-start">
            <FacialRecognition onExpressionChange={setUserEmotion} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
