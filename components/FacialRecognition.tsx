"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, CameraOff, Loader2 } from "lucide-react";

export default function FacialRecognition({ onExpressionChange }: { onExpressionChange?: (exp: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [expression, setExpression] = useState<string>("neutral");
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (onExpressionChange) {
      onExpressionChange(expression);
    }
  }, [expression, onExpressionChange]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load models", e);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (isModelsLoaded) {
      startVideo();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isModelsLoaded]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraAccess(true);
      })
      .catch((err) => {
        console.error("Error accessing webcam", err);
        setHasCameraAccess(false);
      });
  };

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const expressions = detections.expressions;
          const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
          if (sorted.length > 0) {
            setExpression(sorted[0][0]);
          }
        }
      }
    }, 200);
  };

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
    <div className="w-full h-full flex flex-col border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/50 relative aspect-square">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
          <Camera size={18} />
        </div>
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">Reconhecimento Facial</h2>
      </div>

      {/* Main Content */}
      <div className="relative flex-1 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {!isModelsLoaded && (
          <div className="absolute inset-0 z-20 bg-zinc-900/80 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
            <p className="text-zinc-300 font-medium animate-pulse">Carregando modelos de IA...</p>
          </div>
        )}

        {hasCameraAccess === false && (
          <div className="absolute inset-0 z-20 bg-zinc-900/80 flex flex-col items-center justify-center text-center p-6">
            <CameraOff className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-zinc-300 font-medium">Acesso à câmera negado</p>
            <p className="text-zinc-500 text-sm mt-2">Por favor, permita as permissões da câmera para usar o reconhecimento facial.</p>
          </div>
        )}

        <video
          ref={videoRef}
          onPlay={handleVideoPlay}
          autoPlay
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>

      {/* Footer / Label */}
      <div className="p-4 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md flex items-center justify-center gap-3">
        <span className="text-4xl">{expressionEmojis[expression] || "🤔"}</span>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Expressão Detectada</span>
          <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100 capitalize">{expression}</span>
        </div>
      </div>
    </div>
  );
}
