"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause, Activity, Repeat, Settings2, SlidersHorizontal, Square } from "lucide-react";

interface AnimationCanvasProps {
  isLoading?: boolean;
}

export default function AnimationCanvas({ isLoading }: AnimationCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  
  const [animationState, setAnimationState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const [debugConfig, setDebugConfig] = useState({
    // Step 1
    s1BlueY: -120, s1RedY: 120, s1Scale: 1.2, s1Duration: 800,
    // Step 2
    s2BlueY: 120, s2RedY: -120, s2Scale: 1.0, s2Duration: 1200,
    // Step 3
    s3BlueX: -40, s3RedX: 40, s3Scale: 1.5, s3Duration: 800,
    // Step 4 (Idle/Return)
    s4Duration: 800,
  });
  
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
        await simulateProgress(0, 25, debugConfig.s1Duration);

        setAnimationState("step2");
        await simulateProgress(25, 60, debugConfig.s2Duration);

        setAnimationState("step3");
        await simulateProgress(60, 85, debugConfig.s3Duration);

        setAnimationState("idle");
        await simulateProgress(85, 100, debugConfig.s4Duration);

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
      // Stop and reset
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAnimationState("idle");
      setProgress(0);
    } else {
      // Play
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

  // Variants for the blue ball
  const blueVariants = {
    idle: { 
      y: 0, x: 0, scale: 1, 
      transition: { duration: debugConfig.s4Duration / 1000, ease: "easeInOut" } 
    },
    step1: { 
      y: debugConfig.s1BlueY, x: 0, scale: debugConfig.s1Scale, 
      transition: { duration: debugConfig.s1Duration / 1000, ease: "easeOut" } 
    },
    step2: { 
      y: debugConfig.s2BlueY, x: 0, scale: debugConfig.s2Scale, 
      transition: { duration: debugConfig.s2Duration / 1000, ease: "easeInOut" } 
    },
    step3: { 
      y: 0, x: debugConfig.s3BlueX, scale: debugConfig.s3Scale, 
      transition: { duration: debugConfig.s3Duration / 1000, ease: "easeIn" } 
    }
  };

  // Variants for the red ball
  const redVariants = {
    idle: { 
      y: 0, x: 0, scale: 1, 
      transition: { duration: debugConfig.s4Duration / 1000, ease: "easeInOut" } 
    },
    step1: { 
      y: debugConfig.s1RedY, x: 0, scale: debugConfig.s1Scale, 
      transition: { duration: debugConfig.s1Duration / 1000, ease: "easeOut" } 
    },
    step2: { 
      y: debugConfig.s2RedY, x: 0, scale: debugConfig.s2Scale, 
      transition: { duration: debugConfig.s2Duration / 1000, ease: "easeInOut" } 
    },
    step3: { 
      y: 0, x: debugConfig.s3RedX, scale: debugConfig.s3Scale, 
      transition: { duration: debugConfig.s3Duration / 1000, ease: "easeIn" } 
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 p-2 sm:p-6">
      
      {/* Header section */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-2">
        <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full mb-2">
          <Activity size={24} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-red-500">
          Dynamic Animation Timeline
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-lg">
          A clean, interactive canvas utilizing robust React state sequencing to orchestrate vertical component movements.
        </p>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-2xl shadow-zinc-200/20 dark:shadow-black/50 group">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300 font-medium animate-pulse">
                Applying AI adjustments...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center gap-16">
          {/* Blue Ball */}
          <motion.div
            variants={blueVariants}
            initial="idle"
            animate={animationState}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center z-10"
          >
            <div className="absolute inset-1 rounded-full border border-white/30"></div>
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-white/40 rounded-full blur-md"></div>
          </motion.div>

          {/* Red Ball */}
          <motion.div
            variants={redVariants}
            initial="idle"
            animate={animationState}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center z-10"
          >
            <div className="absolute inset-1 rounded-full border border-white/30"></div>
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-white/40 rounded-full blur-md"></div>
          </motion.div>
        </div>

        {/* Real Progress Bar Overlay at bottom of canvas */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-zinc-200/50 dark:bg-zinc-800/50 z-40">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Floating Controls with z-50 to stay above animation elements */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-300 z-50">
          <button 
            onClick={runTimeline}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 min-w-[140px] justify-center"
          >
            {isPlaying ? (
              <>
                <Square size={16} fill="currentColor" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Play</span>
              </>
            )}
          </button>
          
          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          
          <button 
            onClick={resetCanvas}
            className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Reset Canvas"
          >
            <RotateCcw size={20} />
          </button>

          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

          <button 
            onClick={toggleLoop}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
              isLooping 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent"
            }`}
            title="Toggle Loop"
          >
            <Repeat size={18} className={isLooping ? "animate-pulse" : ""} />
            <span className="hidden sm:inline">{isLooping ? "Looping" : "Loop"}</span>
          </button>
          
          <div className="w-[1px] h-6 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
          
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2.5 rounded-full transition-colors ${
              showDebug 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
            title="Toggle Debug Mode"
          >
            <Settings2 size={20} />
          </button>
        </div>

      </div>

      {/* Debugging Mode Panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-zinc-800 dark:text-zinc-200 font-semibold text-lg">
                <SlidersHorizontal size={20} className="text-blue-500" />
                <h3>Step-by-Step Debug Attributes</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Step 1 */}
                <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">Step 1: Start</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duration</span><span>{debugConfig.s1Duration}ms</span></label>
                    <input type="range" min="200" max="2000" value={debugConfig.s1Duration} onChange={(e) => setDebugConfig({...debugConfig, s1Duration: Number(e.target.value)})} className="accent-blue-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Blue Y</span><span>{debugConfig.s1BlueY}px</span></label>
                    <input type="range" min="-300" max="300" value={debugConfig.s1BlueY} onChange={(e) => setDebugConfig({...debugConfig, s1BlueY: Number(e.target.value)})} className="accent-blue-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Red Y</span><span>{debugConfig.s1RedY}px</span></label>
                    <input type="range" min="-300" max="300" value={debugConfig.s1RedY} onChange={(e) => setDebugConfig({...debugConfig, s1RedY: Number(e.target.value)})} className="accent-red-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Scale</span><span>{debugConfig.s1Scale}x</span></label>
                    <input type="range" min="0.5" max="3" step="0.1" value={debugConfig.s1Scale} onChange={(e) => setDebugConfig({...debugConfig, s1Scale: Number(e.target.value)})} className="accent-zinc-500 h-1.5" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">Step 2: Swap</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duration</span><span>{debugConfig.s2Duration}ms</span></label>
                    <input type="range" min="200" max="2000" value={debugConfig.s2Duration} onChange={(e) => setDebugConfig({...debugConfig, s2Duration: Number(e.target.value)})} className="accent-purple-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Blue Y</span><span>{debugConfig.s2BlueY}px</span></label>
                    <input type="range" min="-300" max="300" value={debugConfig.s2BlueY} onChange={(e) => setDebugConfig({...debugConfig, s2BlueY: Number(e.target.value)})} className="accent-blue-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Red Y</span><span>{debugConfig.s2RedY}px</span></label>
                    <input type="range" min="-300" max="300" value={debugConfig.s2RedY} onChange={(e) => setDebugConfig({...debugConfig, s2RedY: Number(e.target.value)})} className="accent-red-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Scale</span><span>{debugConfig.s2Scale}x</span></label>
                    <input type="range" min="0.5" max="3" step="0.1" value={debugConfig.s2Scale} onChange={(e) => setDebugConfig({...debugConfig, s2Scale: Number(e.target.value)})} className="accent-zinc-500 h-1.5" />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">Step 3: Clash</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duration</span><span>{debugConfig.s3Duration}ms</span></label>
                    <input type="range" min="200" max="2000" value={debugConfig.s3Duration} onChange={(e) => setDebugConfig({...debugConfig, s3Duration: Number(e.target.value)})} className="accent-orange-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Blue X Offset</span><span>{debugConfig.s3BlueX}px</span></label>
                    <input type="range" min="-200" max="200" value={debugConfig.s3BlueX} onChange={(e) => setDebugConfig({...debugConfig, s3BlueX: Number(e.target.value)})} className="accent-blue-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Red X Offset</span><span>{debugConfig.s3RedX}px</span></label>
                    <input type="range" min="-200" max="200" value={debugConfig.s3RedX} onChange={(e) => setDebugConfig({...debugConfig, s3RedX: Number(e.target.value)})} className="accent-red-500 h-1.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Scale</span><span>{debugConfig.s3Scale}x</span></label>
                    <input type="range" min="0.5" max="3" step="0.1" value={debugConfig.s3Scale} onChange={(e) => setDebugConfig({...debugConfig, s3Scale: Number(e.target.value)})} className="accent-zinc-500 h-1.5" />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700 pb-2">Step 4: Return</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-500 flex justify-between"><span>Duration</span><span>{debugConfig.s4Duration}ms</span></label>
                    <input type="range" min="200" max="3000" value={debugConfig.s4Duration} onChange={(e) => setDebugConfig({...debugConfig, s4Duration: Number(e.target.value)})} className="accent-green-500 h-1.5" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Returns to x: 0, y: 0, scale: 1</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
