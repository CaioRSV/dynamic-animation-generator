"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Activity, Repeat, Settings2, SlidersHorizontal, Square } from "lucide-react";

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

// --- Face Component ---
const Face = ({ look, mood, isBandit }: { look: string, mood: string, isBandit: boolean }) => {
  const pupilSize = mood === 'shocked' ? 'w-1.5 h-1.5' : (isBandit ? 'w-3.5 h-3.5' : 'w-3 h-3');
  const leftPupilOffset = look === 'left' ? '-translate-x-1.5' : look === 'right' ? 'translate-x-1.5' : '';
  const rightPupilOffset = look === 'left' ? '-translate-x-1.5' : look === 'right' ? 'translate-x-1.5' : '';

  return (
    <div className={`relative flex flex-col items-center ${isBandit ? 'gap-1.5' : 'gap-1'}`}>
      {/* Eyebrows for Angry */}
      {mood === 'angry' && (
        <div className={`absolute -top-1.5 w-[115%] flex justify-between z-20 px-0.5`}>
          <div className="w-3.5 h-1.5 bg-zinc-800 rounded-full rotate-[25deg] translate-y-1"></div>
          <div className="w-3.5 h-1.5 bg-zinc-800 rounded-full -rotate-[25deg] translate-y-1"></div>
        </div>
      )}

      {/* Eyes */}
      <div className={`flex items-center justify-center ${isBandit ? 'gap-1.5' : 'gap-1'}`}>
        <div className={`bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border ${isBandit ? 'border-zinc-900 border-2 w-8 h-8' : 'border-zinc-300 w-7 h-7'} ${mood === 'shocked' ? 'scale-110' : ''}`}>
          <div className={`bg-black rounded-full transition-all duration-200 ${pupilSize} ${leftPupilOffset} translate-y-1`} />
        </div>
        <div className={`bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border ${isBandit ? 'border-zinc-900 border-2 w-7 h-7' : 'border-zinc-300 w-7 h-7'} ${mood === 'shocked' ? 'scale-110' : ''}`}>
          <div className={`bg-black rounded-full transition-all duration-200 ${pupilSize} ${rightPupilOffset} translate-y-1`} />
        </div>
      </div>

      {/* Mouths */}
      {mood === 'happy' && !isBandit && (
        <div className={`absolute -bottom-1 w-4 h-2 border-b-2 border-zinc-800 rounded-b-full`}></div>
      )}
      {mood === 'happy' && isBandit && (
        <div className={`absolute -bottom-2 w-4 h-2 border-b-2 border-zinc-800 rounded-b-full`}></div>
      )}
      {mood === 'shocked' && (
        <div className={`absolute ${isBandit ? '-bottom-3.5' : '-bottom-2.5'} w-3 h-4 bg-zinc-800 rounded-full`}></div>
      )}
    </div>
  );
};


export interface StepConfig {
  dur: number;
  bX: number; bScale: number; bLook: string; bMood: string; bItem: string;
  rX: number; rScale: number; rLook: string; rMood: string; rItem: string;
}

export interface AnimationConfigData {
  step1: StepConfig;
  step2: StepConfig;
  step3: StepConfig;
  idle: StepConfig;
}

interface AnimationCanvasProps {
  isLoading?: boolean;
  config: AnimationConfigData;
  setConfig: React.Dispatch<React.SetStateAction<AnimationConfigData>>;
}

export default function AnimationCanvas({ isLoading, config, setConfig }: AnimationCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const [animationState, setAnimationState] = useState<"idle" | "step1" | "step2" | "step3">("idle");
  const [progress, setProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    isLoopingRef.current = next;
    if (next && !isPlayingRef.current) {
      runTimeline();
    }
  };

  const simulateProgress = async (start: number, end: number, duration: number) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (!isPlayingRef.current) {
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
    do {
      setProgress(0);
      try {
        setAnimationState("step1");
        await simulateProgress(0, 25, config.step1.dur);

        setAnimationState("step2");
        await simulateProgress(25, 60, config.step2.dur);

        setAnimationState("step3");
        await simulateProgress(60, 85, config.step3.dur);

        setAnimationState("idle");
        await simulateProgress(85, 100, config.idle.dur);

      } catch (e) {
        break; // Aborted
      }
    } while (isLoopingRef.current && isPlayingRef.current);

    if (isPlayingRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setProgress(0);
    }
  };

  const runTimeline = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAnimationState("idle");
      setProgress(0);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      playSequence();
    }
  };

  const resetCanvas = () => {
    isLoopingRef.current = false;
    setIsLooping(false);
    isPlayingRef.current = false;
    setIsPlaying(false);
    setAnimationState("idle");
    setProgress(0);
  };

  // Build variants from config state dynamically (only X and Scale)
  const blueVariants = {
    idle: { x: config.idle.bX, scale: config.idle.bScale, transition: { duration: config.idle.dur / 1000, ease: "easeInOut" } },
    step1: { x: config.step1.bX, scale: config.step1.bScale, transition: { duration: config.step1.dur / 1000, ease: "easeOut" } },
    step2: { x: config.step2.bX, scale: config.step2.bScale, transition: { duration: config.step2.dur / 1000, ease: "easeInOut" } },
    step3: { x: config.step3.bX, scale: config.step3.bScale, transition: { duration: config.step3.dur / 1000, ease: "easeIn" } }
  };

  const redVariants = {
    idle: { x: config.idle.rX, scale: config.idle.rScale, transition: { duration: config.idle.dur / 1000, ease: "easeInOut" } },
    step1: { x: config.step1.rX, scale: config.step1.rScale, transition: { duration: config.step1.dur / 1000, ease: "easeOut" } },
    step2: { x: config.step2.rX, scale: config.step2.rScale, transition: { duration: config.step2.dur / 1000, ease: "easeInOut" } },
    step3: { x: config.step3.rX, scale: config.step3.rScale, transition: { duration: config.step3.dur / 1000, ease: "easeIn" } }
  };

  const currentBlueLook = config[animationState].bLook;
  const currentBlueMood = config[animationState].bMood;
  const currentBlueItem = config[animationState].bItem;

  const currentRedLook = config[animationState].rLook;
  const currentRedMood = config[animationState].rMood;
  const currentRedItem = config[animationState].rItem;

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

      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-black/50 group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floor Line */}
        <div className="absolute top-1/2 mt-10 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full shadow-inner z-0"></div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300 font-medium animate-pulse">Applying AI adjustments...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center">

          {/* Blue Sheriff */}
          <motion.div
            variants={blueVariants}
            initial="idle"
            animate={animationState}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center z-10"
          >
            {/* Sheriff Hat */}
            <div className={`absolute -top-6 w-24 flex flex-col items-center z-30 transition-transform duration-300 ${currentBlueLook === 'left' ? '-rotate-6 -translate-x-1' : currentBlueLook === 'right' ? 'rotate-6 translate-x-1' : ''}`}>
              <div className="w-10 h-6 bg-amber-700 rounded-t-lg -mb-1 shadow-inner"></div>
              <div className="w-24 h-2 bg-amber-800 rounded-full shadow-md"></div>
            </div>

            {/* Face */}
            <div className={`absolute top-2 flex flex-col items-center z-20 transition-all duration-300 ${currentBlueLook === 'left' ? '-translate-x-3' : currentBlueLook === 'right' ? 'translate-x-3' : ''}`}>
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
            {/* Beanie */}
            <div className={`absolute -top-1 w-16 h-8 overflow-hidden z-30 rounded-t-full flex flex-col transition-transform duration-300 ${currentRedLook === 'left' ? '-rotate-6 -translate-x-1' : currentRedLook === 'right' ? 'rotate-6 translate-x-1' : ''}`}>
              <div className="w-full h-2 bg-zinc-900"></div>
              <div className="w-full h-2 bg-zinc-100"></div>
              <div className="w-full h-2 bg-zinc-900"></div>
              <div className="w-full h-2 bg-zinc-100"></div>
            </div>

            {/* Face embedded in Mask */}
            <div className={`absolute top-3 flex flex-col items-center z-20 transition-all duration-300 ${currentRedLook === 'left' ? '-translate-x-3' : currentRedLook === 'right' ? 'translate-x-3' : ''}`}>
              <div className="relative flex items-center justify-center bg-zinc-900 pt-1 pb-2.5 px-2 rounded-full shadow-md min-w-[3.5rem]">
                <div className="mt-0.5">
                  <Face look={currentRedLook} mood={currentRedMood} isBandit={true} />
                </div>
              </div>
            </div>

            {/* Hand with Item */}
            {renderHand(currentRedItem, currentRedLook, 'bg-red-600')}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-2 bg-zinc-200/50 dark:bg-zinc-800/50 z-40">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-300 z-50">
          <button onClick={runTimeline} disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 min-w-[140px] justify-center">
            {isPlaying ? (<><Square size={16} fill="currentColor" /><span>Stop</span></>) : (<><Play size={18} /><span>Play</span></>)}
          </button>
          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          <button onClick={resetCanvas} className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Reset Canvas"><RotateCcw size={20} /></button>
          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          <button onClick={toggleLoop} disabled={isLoading} className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${isLooping ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`} title="Toggle Loop">
            <Repeat size={18} className={isLooping ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">{isLooping ? "Looping" : "Loop"}</span>
          </button>
          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          <button onClick={() => setShowDebug(!showDebug)} className={`p-2.5 rounded-full transition-colors ${showDebug ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`} title="Toggle Debug Mode">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Debugging Mode Panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-zinc-800 dark:text-zinc-200 font-semibold text-lg">
                <SlidersHorizontal size={20} className="text-blue-500" />
                <h3>Director Mode (Horizontal Layout)</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
                {['step1', 'step2', 'step3', 'idle'].map((stepKey, idx) => {
                  const stepLabel = stepKey === 'idle' ? 'Step 4: Return' : `Step ${idx + 1}: ${idx === 0 ? 'Start' : idx === 1 ? 'Swap' : 'Clash'}`;
                  const stepData = (config as any)[stepKey];

                  return (
                    <div key={stepKey} className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">{stepLabel}</h4>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duration</span><span>{stepData.dur}ms</span></label>
                        <input type="range" min="200" max="3000" value={stepData.dur} onChange={(e) => updateConfig(stepKey, 'dur', Number(e.target.value))} className="accent-green-500 h-1.5" />
                      </div>

                      {/* Sheriff Settings */}
                      <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col gap-3">
                        <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400">Sheriff (Blue)</h5>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <select value={stepData.bLook} onChange={(e) => updateConfig(stepKey, 'bLook', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full">
                            <option value="left">Look Left</option>
                            <option value="forward">Look Fwd</option>
                            <option value="right">Look Right</option>
                          </select>
                          <select value={stepData.bMood} onChange={(e) => updateConfig(stepKey, 'bMood', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full font-bold">
                            <option value="neutral">😐 Neutral</option>
                            <option value="happy">😀 Happy</option>
                            <option value="angry">😠 Angry</option>
                            <option value="shocked">😲 Shocked</option>
                          </select>
                          <select value={stepData.bItem} onChange={(e) => updateConfig(stepKey, 'bItem', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full col-span-2">
                            <option value="none">Item: Empty</option>
                            <option value="gun">Item: Gun</option>
                            <option value="money">Item: Money</option>
                            <option value="banana">Item: Banana</option>
                            <option value="coffee">Item: Coffee</option>
                            <option value="bomb">Item: Bomb</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>X Pos</span><span>{stepData.bX}px</span></label>
                          <input type="range" min="-300" max="300" value={stepData.bX} onChange={(e) => updateConfig(stepKey, 'bX', Number(e.target.value))} className="accent-blue-500 h-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>Scale</span><span>{stepData.bScale}x</span></label>
                          <input type="range" min="0.5" max="3" step="0.1" value={stepData.bScale} onChange={(e) => updateConfig(stepKey, 'bScale', Number(e.target.value))} className="accent-zinc-500 h-1" />
                        </div>
                      </div>

                      {/* Bandit Settings */}
                      <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex flex-col gap-3">
                        <h5 className="text-xs font-bold text-red-600 dark:text-red-400">Bandit (Red)</h5>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <select value={stepData.rLook} onChange={(e) => updateConfig(stepKey, 'rLook', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full">
                            <option value="left">Look Left</option>
                            <option value="forward">Look Fwd</option>
                            <option value="right">Look Right</option>
                          </select>
                          <select value={stepData.rMood} onChange={(e) => updateConfig(stepKey, 'rMood', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full font-bold">
                            <option value="neutral">😐 Neutral</option>
                            <option value="happy">😀 Happy</option>
                            <option value="angry">😠 Angry</option>
                            <option value="shocked">😲 Shocked</option>
                          </select>
                          <select value={stepData.rItem} onChange={(e) => updateConfig(stepKey, 'rItem', e.target.value)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-1 w-full col-span-2">
                            <option value="none">Item: Empty</option>
                            <option value="gun">Item: Gun</option>
                            <option value="money">Item: Money</option>
                            <option value="banana">Item: Banana</option>
                            <option value="coffee">Item: Coffee</option>
                            <option value="bomb">Item: Bomb</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>X Pos</span><span>{stepData.rX}px</span></label>
                          <input type="range" min="-300" max="300" value={stepData.rX} onChange={(e) => updateConfig(stepKey, 'rX', Number(e.target.value))} className="accent-red-500 h-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-medium text-zinc-500 flex justify-between"><span>Scale</span><span>{stepData.rScale}x</span></label>
                          <input type="range" min="0.5" max="3" step="0.1" value={stepData.rScale} onChange={(e) => updateConfig(stepKey, 'rScale', Number(e.target.value))} className="accent-zinc-500 h-1" />
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
