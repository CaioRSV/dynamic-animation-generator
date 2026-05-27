"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Play, RotateCcw, Pause, Activity, Repeat, Settings2, SlidersHorizontal, Square, Sparkles, Infinity } from "lucide-react";

// --- Custom SVGs for Items ---
const GunSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10H16V14H12V18H8V14H4V10Z" fill="#4B5563" />
    <path d="M16 10H20V12H16V10Z" fill="#374151" />
  </svg>
);

const MoneySvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#22C55E" />
    <circle cx="12" cy="12" r="3" fill="#166534" />
    <path d="M12 10.5V13.5" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BananaSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 19C7 19 3 13 5 8C5 8 9 11 12 14C15 17 19 18 19 18C19 18 16 22 10 20C8.5 19.5 7 19 7 19Z" fill="#EAB308" />
    <path d="M5 8C4.5 7 3.5 6 3.5 6" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BombSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="14" r="7" fill="#1F2937" />
    <path d="M12 7V5C12 5 14 3 16 4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 4L18 2" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10" y="6" width="4" height="2" fill="#4B5563" />
  </svg>
);

const CoffeeSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10V16C6 18.2091 7.79086 20 10 20H14C16.2091 20 18 18.2091 18 16V10H6Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
    <path d="M18 12C19.6569 12 21 13.3431 21 15C21 16.6569 19.6569 18 18 18" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 5V7M12 4V7M15 5V7" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// --- Speech Bubble Component ---
const SpeechBubble = ({ text, isBandit }: { text: string, isBandit: boolean }) => {
  if (!text) return null;

  // Sheriff: ABOVE. Bandit: BELOW. Guarantees no horizontal overlap.
  const positionClass = isBandit
    ? 'top-[calc(100%+1rem)] sm:top-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2'
    : 'bottom-[calc(100%+1rem)] sm:bottom-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2';

  // Sheriff's tail is below its bubble, pointing down.
  // Bandit's tail is above its bubble, pointing up.
  // We use calc(100% - 2px) to overlap the bubble border seamlessly.
  const tailPositionClass = isBandit
    ? 'bottom-[calc(100%-2px)] left-1/2 -translate-x-1/2'
    : 'top-[calc(100%-2px)] left-1/2 -translate-x-1/2';

  const tailFillPath = isBandit ? "M16 0 L32 32 L0 32 Z" : "M0 0 L32 0 L16 32 Z";
  const tailStrokePath = isBandit ? "M0 32 L16 0 L32 32" : "M0 0 L16 32 L32 0";

  return (
    <div className={`absolute ${positionClass} z-[200] bg-white/95 backdrop-blur-md text-zinc-900 px-6 py-4 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-zinc-200/80 text-sm sm:text-lg font-black w-max max-w-[320px] md:max-w-[480px] leading-snug text-center flex items-center justify-center`}>
      {text}
      {/* Slanted Triangular Tail */}
      <div className={`absolute ${tailPositionClass} w-6 h-6 sm:w-8 sm:h-8 pointer-events-none`}>
        <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d={tailFillPath} fill="white" />
          <path d={tailStrokePath} stroke="currentColor" strokeWidth="1" className="text-zinc-200/80" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

// --- Face Component ---
const Face = ({ look, mood, isBandit }: { look: string, mood: string, isBandit: boolean }) => {
  const pupilSize = mood === 'shocked' ? 'w-1.5 h-1.5' : (isBandit ? 'w-3.5 h-3.5' : 'w-3 h-3');
  const leftPupilOffset = look === 'left' ? '-translate-x-1.5' : look === 'right' ? 'translate-x-1.5' : '';
  const rightPupilOffset = look === 'left' ? '-translate-x-1.5' : look === 'right' ? 'translate-x-1.5' : '';
  const eyebrowColor = isBandit ? 'bg-yellow-700' : 'bg-amber-950';

  return (
    <div className={`relative flex flex-col items-center ${isBandit ? 'gap-1.5' : 'gap-1'}`}>
      {/* Eyebrows (Dynamic based on mood) */}
      <div className={`absolute -top-2 w-[130%] flex justify-between z-30 px-0.5 pointer-events-none`}>
        <div className={`w-8 h-2.5 ${eyebrowColor} rounded-full transition-all duration-300 shadow-sm ${mood === 'angry' ? 'rotate-[25deg] translate-y-2.0' :
          mood === 'sad' ? '-rotate-[20deg] -translate-y-0.5' :
            mood === 'shocked' ? '-rotate-[20deg] -translate-y-1' :
              mood === 'happy' ? '-rotate-[10deg] translate-y-0.5' : 'rotate-0 translate-y-0.5'
          }`}></div>
        <div className={`w-8 h-2.5 ${eyebrowColor} rounded-full transition-all duration-300 shadow-sm ${mood === 'angry' ? '-rotate-[25deg] translate-y-2.0' :
          mood === 'sad' ? 'rotate-[20deg] -translate-y-0.5' :
            mood === 'shocked' ? 'rotate-[20deg] -translate-y-1' :
              mood === 'happy' ? 'rotate-[10deg] translate-y-0.5' : 'rotate-0 translate-y-0.5'
          }`}></div>
      </div>

      {/* Eyes */}
      <div className={`flex items-center justify-center ${isBandit ? 'gap-1.5' : 'gap-1'}`}>
        <div className={`bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border ${isBandit ? 'border-zinc-900 border-2 w-8 h-8' : 'border-zinc-300 w-7 h-7'} ${mood === 'shocked' ? 'scale-110' : ''}`}>
          <div className={`bg-black rounded-full transition-all duration-200 ${pupilSize} ${leftPupilOffset} ${mood === 'sad' ? 'translate-y-2 opacity-80' : 'translate-y-1'}`} />
        </div>
        <div className={`bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border ${isBandit ? 'border-zinc-900 border-2 w-7 h-7' : 'border-zinc-300 w-7 h-7'} ${mood === 'shocked' ? 'scale-110' : ''}`}>
          <div className={`bg-black rounded-full transition-all duration-200 ${pupilSize} ${rightPupilOffset} ${mood === 'sad' ? 'translate-y-2 opacity-80' : 'translate-y-1'}`} />
        </div>
      </div>

    </div>
  );
};


export interface StepConfig {
  dur: number;
  bX: number; bLook: string; bMood: string; bItem: string; bSpeech: string;
  rX: number; rLook: string; rMood: string; rItem: string; rSpeech: string;
}

export interface AnimationConfigData {
  step1: StepConfig;
  step2: StepConfig;
  step3: StepConfig;
  step4: StepConfig;
  step5: StepConfig;
  step6: StepConfig;
  step7: StepConfig;
  step8: StepConfig;
}

interface AnimationCanvasProps {
  isLoading?: boolean;
  config: AnimationConfigData;
  setConfig: React.Dispatch<React.SetStateAction<AnimationConfigData>>;
  isAutoGenerate?: boolean;
  setIsAutoGenerate?: React.Dispatch<React.SetStateAction<boolean>>;
  onGenerateNewScene?: () => void;
  onSequenceComplete?: () => void;
  isLogsExpanded?: boolean;
  isFacialExpanded?: boolean;
}

export default function AnimationCanvas({
  isLoading,
  config,
  setConfig,
  isAutoGenerate = false,
  setIsAutoGenerate,
  onGenerateNewScene,
  onSequenceComplete,
  isLogsExpanded = true,
  isFacialExpanded = true
}: AnimationCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const [animationState, setAnimationState] = useState<"step1" | "step2" | "step3" | "step4" | "step5" | "step6" | "step7" | "step8">("step1");
  const [progress, setProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const width = entries[0].contentRect.width;
        // Assume 900px is a good reference width for scale = 1.
        // Scale down proportionally if the canvas is smaller to ensure visibility.
        setBaseScale(Math.min(1, width / 900));
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const isAutoGenerateRef = useRef(isAutoGenerate);
  useEffect(() => { isAutoGenerateRef.current = isAutoGenerate; }, [isAutoGenerate]);

  const configRef = useRef(config);
  const animationSessionRef = useRef(0);

  useEffect(() => {
    configRef.current = config;
    // When config changes (new generation), increment session to cancel current movement
    animationSessionRef.current++;

    // If it was playing, restart from step1 with the new config
    if (isPlayingRef.current) {
      playSequence();
    }
  }, [config]);

  const simulateProgress = async (start: number, end: number, duration: number) => {
    const sessionId = animationSessionRef.current;
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        // Abort if stopped OR if a new session (config change) started
        if (!isPlayingRef.current || animationSessionRef.current !== sessionId) {
          clearInterval(interval);
          reject(new Error("aborted"));
          return;
        }
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min(start + (end - start) * (elapsed / duration), end);
        setProgress(currentProgress);
        if (elapsed >= duration) {
          clearInterval(interval);
          resolve();
        }
      }, 16);
    });
  };

  const playSequence = async () => {
    // Increment session for a clean start
    const sessionId = ++animationSessionRef.current;

    // Ensure we are in a playing state
    isPlayingRef.current = true;
    if (!isPlaying) setIsPlaying(true);

    while (isPlayingRef.current && animationSessionRef.current === sessionId) {
      setProgress(0);
      try {
        setAnimationState("step1");
        await simulateProgress(0, 12.5, configRef.current.step1.dur);

        setAnimationState("step2");
        await simulateProgress(12.5, 25, configRef.current.step2.dur);

        setAnimationState("step3");
        await simulateProgress(25, 37.5, configRef.current.step3.dur);

        setAnimationState("step4");
        await simulateProgress(37.5, 50, configRef.current.step4.dur);

        setAnimationState("step5");
        await simulateProgress(50, 62.5, configRef.current.step5.dur);

        setAnimationState("step6");
        await simulateProgress(62.5, 75, configRef.current.step6.dur);

        setAnimationState("step7");
        await simulateProgress(75, 87.5, configRef.current.step7.dur);

        setAnimationState("step8");
        await simulateProgress(87.5, 100, configRef.current.step8.dur);

        if (isAutoGenerateRef.current && onSequenceComplete) {
          onSequenceComplete();
        }
      } catch (e) {
        break; // Aborted by session change or stop
      }
    }

    // Only clean up if this was the last active session
    if (animationSessionRef.current === sessionId) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setProgress(0);
    }
  };

  const runTimeline = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      animationSessionRef.current++; // Kill current session
      setAnimationState("step1");
      setProgress(0);
    } else {
      playSequence();
    }
  };

  const resetCanvas = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    animationSessionRef.current++; // Kill current session
    setAnimationState("step1");
    setProgress(0);
  };

  // Build variants from config state dynamically
  const blueVariants: Variants = {
    step1: { x: config?.step1?.bX ?? -140, transition: { duration: (config?.step1?.dur ?? 800) / 1000, ease: "easeOut" } },
    step2: { x: config?.step2?.bX ?? -40, transition: { duration: (config?.step2?.dur ?? 1200) / 1000, ease: "easeInOut" } },
    step3: { x: config?.step3?.bX ?? 140, transition: { duration: (config?.step3?.dur ?? 800) / 1000, ease: "easeIn" } },
    step4: { x: config?.step4?.bX ?? 140, transition: { duration: (config?.step4?.dur ?? 800) / 1000, ease: "easeIn" } },
    step5: { x: config?.step5?.bX ?? 100, transition: { duration: (config?.step5?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step6: { x: config?.step6?.bX ?? 50, transition: { duration: (config?.step6?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step7: { x: config?.step7?.bX ?? 0, transition: { duration: (config?.step7?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step8: { x: config?.step8?.bX ?? -100, transition: { duration: (config?.step8?.dur ?? 800) / 1000, ease: "easeOut" } }
  };

  const redVariants: Variants = {
    step1: { x: config?.step1?.rX ?? 140, transition: { duration: (config?.step1?.dur ?? 800) / 1000, ease: "easeOut" } },
    step2: { x: config?.step2?.rX ?? 40, transition: { duration: (config?.step2?.dur ?? 1200) / 1000, ease: "easeInOut" } },
    step3: { x: config?.step3?.rX ?? -140, transition: { duration: (config?.step3?.dur ?? 800) / 1000, ease: "easeIn" } },
    step4: { x: config?.step4?.rX ?? -140, transition: { duration: (config?.step4?.dur ?? 800) / 1000, ease: "easeIn" } },
    step5: { x: config?.step5?.rX ?? -100, transition: { duration: (config?.step5?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step6: { x: config?.step6?.rX ?? -50, transition: { duration: (config?.step6?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step7: { x: config?.step7?.rX ?? 0, transition: { duration: (config?.step7?.dur ?? 800) / 1000, ease: "easeInOut" } },
    step8: { x: config?.step8?.rX ?? 100, transition: { duration: (config?.step8?.dur ?? 800) / 1000, ease: "easeOut" } }
  };

  const currentBlueLook = config?.[animationState]?.bLook ?? "forward";
  const currentBlueMood = config?.[animationState]?.bMood ?? "neutral";
  const currentBlueItem = config?.[animationState]?.bItem ?? "none";
  const currentBlueSpeech = config?.[animationState]?.bSpeech ?? "";

  const currentRedLook = config?.[animationState]?.rLook ?? "forward";
  const currentRedMood = config?.[animationState]?.rMood ?? "neutral";
  const currentRedItem = config?.[animationState]?.rItem ?? "none";
  const currentRedSpeech = config?.[animationState]?.rSpeech ?? "";

  const updateConfig = (stepKey: string, field: string, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [stepKey]: {
        ...(prev as any)[stepKey],
        [field]: value
      }
    }));
  };

  const renderHand = (item: string, lookDirection: string, colorClass: string) => {
    if (item === 'none') return null;
    const isLeft = lookDirection === 'left';
    return (
      <div className={`absolute top-8 ${isLeft ? '-left-8' : '-right-8'} w-12 h-12 flex items-center justify-center z-30 transition-all duration-300`}>
        <div className={`absolute w-6 h-6 rounded-full z-10 shadow-md ${colorClass}`}></div>
        <div className={`absolute z-20 ${isLeft ? '-scale-x-100 -translate-x-4' : 'translate-x-4'} scale-[2.2] drop-shadow-lg transition-transform duration-300 origin-center`}>
          {item === 'gun' && <GunSvg />}
          {item === 'money' && <MoneySvg />}
          {item === 'banana' && <BananaSvg />}
          {item === 'coffee' && <CoffeeSvg />}
          {item === 'bomb' && <BombSvg />}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-2 sm:p-6">
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-2">
        <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full mb-2">
          <Activity size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-red-500">
          Dynamic Animation Generator
        </h1>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9] rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-black/50 group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floor Line */}
        <div className="absolute top-1/2 mt-10 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full shadow-inner z-0"></div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute top-4 right-4 z-[60] bg-white/80 dark:bg-zinc-900/80 p-2 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Activity className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Gerando...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Scale Container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: baseScale * (!isLogsExpanded && !isFacialExpanded ? 1.4 : (!isLogsExpanded || !isFacialExpanded ? 1.2 : 1)) }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Blue Sheriff */}
          <motion.div
            variants={blueVariants}
            initial="idle"
            animate={animationState}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center z-10"
          >
            <SpeechBubble text={currentBlueSpeech} isBandit={false} />

            {/* Sheriff Hat */}
            <div className={`absolute -top-6 w-24 flex flex-col items-center z-30 transition-transform duration-300 ${currentBlueLook === 'left' ? '-rotate-6 -translate-x-1' : currentBlueLook === 'right' ? 'rotate-6 translate-x-1' : ''}`}>
              <div className="w-10 h-6 bg-amber-700 rounded-t-lg -mb-1 shadow-inner"></div>
              <div className="w-24 h-2 bg-amber-800 rounded-full shadow-md"></div>
            </div>

            {/* Face */}
            <div className={`absolute top-2 flex flex-col items-center z-40 transition-all duration-300 ${currentBlueLook === 'left' ? '-translate-x-3' : currentBlueLook === 'right' ? 'translate-x-3' : ''}`}>
              <Face look={currentBlueLook} mood={currentBlueMood} isBandit={false} />
            </div>

            {/* Mustache */}
            <div className={`absolute top-9 flex justify-center z-20 transition-all duration-300 ${currentBlueLook === 'left' ? '-translate-x-3' : currentBlueLook === 'right' ? 'translate-x-3' : ''}`}>
              <div className="relative flex items-center justify-center drop-shadow-sm">
                <div className="w-7 h-3 border-b-[10px] border-r-[10px] border-amber-900 rounded-br-full rotate-[5deg] origin-right translate-x-[2px]"></div>
                <div className="w-7 h-3 border-b-[10px] border-l-[10px] border-amber-900 rounded-bl-full -rotate-[5deg] origin-left -translate-x-[2px]"></div>
              </div>
            </div>

            {/* Hand with Item */}
            {renderHand(currentBlueItem, currentBlueLook, 'bg-blue-600')}
          </motion.div>

          {/* Red Bandit */}
          <motion.div
            variants={redVariants}
            initial="idle"
            animate={animationState}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center z-10"
          >
            <SpeechBubble text={currentRedSpeech} isBandit={true} />

            {/* Beanie */}
            <div className={`absolute -top-1 w-16 h-8 overflow-hidden z-30 rounded-t-full flex flex-col transition-transform duration-300 ${currentRedLook === 'left' ? '-rotate-6 -translate-x-1' : currentRedLook === 'right' ? 'rotate-6 translate-x-1' : ''}`}>
              <div className="w-full h-2 bg-zinc-900"></div>
              <div className="w-full h-2 bg-zinc-100"></div>
              <div className="w-full h-2 bg-zinc-900"></div>
              <div className="w-full h-2 bg-zinc-100"></div>
            </div>

            {/* Face embedded in Mask */}
            <div className={`absolute top-3 flex flex-col items-center z-40 transition-all duration-300 ${currentRedLook === 'left' ? '-translate-x-3' : currentRedLook === 'right' ? 'translate-x-3' : ''}`}>
              <div className="relative flex items-center justify-center bg-zinc-900 pt-1 pb-2.5 px-2 rounded-full shadow-md min-w-[3.5rem]">
                <div className="mt-0.5">
                  <Face look={currentRedLook} mood={currentRedMood} isBandit={true} />
                </div>
              </div>
            </div>

            {/* Hand with Item */}
            {renderHand(currentRedItem, currentRedLook, 'bg-red-600')}
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-2 bg-zinc-200/50 dark:bg-zinc-800/50 z-40">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

      </div>

      {/* Controls Container (Below Canvas) */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-wrap justify-center items-center gap-2 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm w-full lg:w-auto">
          <button onClick={runTimeline} disabled={isLoading} className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-1 lg:flex-none flex justify-center disabled:opacity-50" title={isPlaying ? "Parar" : "Tocar"}>
            {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <div className="hidden lg:block w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          <button onClick={() => {
            const nextVal = !isAutoGenerate;
            if (setIsAutoGenerate) {
              setIsAutoGenerate(nextVal);
            }
            if (nextVal) {
              if (onGenerateNewScene) {
                onGenerateNewScene();
              }
              if (!isPlayingRef.current) {
                runTimeline();
              }
            }
          }} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all flex-[2] lg:flex-none min-w-[180px] ${isAutoGenerate ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"}`} title="Alternar Geração Automática">
            <Infinity size={18} className={isAutoGenerate ? "animate-pulse" : ""} />
            <span>Geração Automática</span>
          </button>
          <div className="hidden lg:block w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          {/* <button onClick={() => {
            if (onGenerateNewScene) {
              onGenerateNewScene();
            }
            if (!isPlayingRef.current) {
              runTimeline();
            }
          }} disabled={isLoading} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex-[2] lg:flex-none min-w-[180px]`} title="Gerar Nova Cena">
            <Sparkles size={18} className={isLoading ? "animate-pulse" : ""} />
            <span>Gerar Nova Cena</span>
          </button> */}
          <div className="hidden lg:block w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          <button onClick={() => setShowDebug(!showDebug)} className={`p-2.5 rounded-xl transition-colors flex-1 lg:flex-none flex justify-center ${showDebug ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`} title="Alternar Modo Diretor">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Debugging Mode Panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex-shrink-0">
            <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm max-h-[40vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-6 text-zinc-800 dark:text-zinc-200 font-semibold text-lg">
                <SlidersHorizontal size={20} className="text-blue-500" />
                <h3>Modo Diretor (Configuração)</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'].map((stepKey, idx) => {
                  const stepLabel = `Passo ${idx + 1}`;
                  const stepData = (config as any)?.[stepKey] || {};

                  return (
                    <div key={stepKey} className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">{stepLabel}</h4>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duração</span><span>{stepData.dur}ms</span></label>
                        <input type="range" min="200" max="3000" value={stepData.dur} onChange={(e) => updateConfig(stepKey, 'dur', Number(e.target.value))} className="accent-green-500 h-1.5" />
                      </div>

                      {/* Sheriff Settings */}
                      <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col gap-3">
                        <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400">Xerife (Azul)</h5>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <select value={stepData.bLook} onChange={(e) => updateConfig(stepKey, 'bLook', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full">
                            <option value="left">Olhar Esquerda</option>
                            <option value="forward">Olhar Frente</option>
                            <option value="right">Olhar Direita</option>
                          </select>
                          <select value={stepData.bMood} onChange={(e) => updateConfig(stepKey, 'bMood', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full font-bold">
                            <option value="neutral">😐 Neutro</option>
                            <option value="happy">😀 Feliz</option>
                            <option value="angry">😠 Irritado</option>
                            <option value="shocked">😲 Chocado</option>
                          </select>
                          <select value={stepData.bItem} onChange={(e) => updateConfig(stepKey, 'bItem', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full col-span-2">
                            <option value="none">Item: Vazio</option>
                            <option value="gun">Item: Arma</option>
                            <option value="money">Item: Dinheiro</option>
                            <option value="banana">Item: Banana</option>
                            <option value="coffee">Item: Café</option>
                            <option value="bomb">Item: Bomba</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>Posição X</span><span>{stepData.bX}px</span></label>
                          <input type="range" min="-300" max="300" value={stepData.bX} onChange={(e) => updateConfig(stepKey, 'bX', Number(e.target.value))} className="accent-blue-500 h-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input type="text" placeholder="Fala..." value={stepData.bSpeech} onChange={(e) => updateConfig(stepKey, 'bSpeech', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full text-[10px]" />
                        </div>
                      </div>

                      {/* Bandit Settings */}
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex flex-col gap-3">
                        <h5 className="text-xs font-bold text-red-600 dark:text-red-400">Bandido (Vermelho)</h5>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <select value={stepData.rLook} onChange={(e) => updateConfig(stepKey, 'rLook', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full">
                            <option value="left">Olhar Esquerda</option>
                            <option value="forward">Olhar Frente</option>
                            <option value="right">Olhar Direita</option>
                          </select>
                          <select value={stepData.rMood} onChange={(e) => updateConfig(stepKey, 'rMood', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full font-bold">
                            <option value="neutral">😐 Neutro</option>
                            <option value="happy">😀 Feliz</option>
                            <option value="angry">😠 Irritado</option>
                            <option value="shocked">😲 Chocado</option>
                          </select>
                          <select value={stepData.rItem} onChange={(e) => updateConfig(stepKey, 'rItem', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full col-span-2">
                            <option value="none">Item: Vazio</option>
                            <option value="gun">Item: Arma</option>
                            <option value="money">Item: Dinheiro</option>
                            <option value="banana">Item: Banana</option>
                            <option value="coffee">Item: Café</option>
                            <option value="bomb">Item: Bomba</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>Posição X</span><span>{stepData.rX}px</span></label>
                          <input type="range" min="-300" max="300" value={stepData.rX} onChange={(e) => updateConfig(stepKey, 'rX', Number(e.target.value))} className="accent-red-500 h-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input type="text" placeholder="Fala..." value={stepData.rSpeech} onChange={(e) => updateConfig(stepKey, 'rSpeech', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full text-[10px]" />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
