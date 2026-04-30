import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "mock-key";

export async function POST(req: Request) {
  try {
    const { prompt, currentConfig } = await req.json();

    const systemPrompt = `You are an animation director for a web canvas featuring two characters: a Blue Sheriff and a Red Bandit.
They animate through 4 steps: step1, step2, step3, and idle (the return step).
Each step has properties for both characters:
- dur: duration in ms (default 800-1200)
- bX/rX: X position (-300 to 300)
- bScale/rScale: size scale (0.5 to 3)
- bLook/rLook: look direction ("left", "forward", "right")
- bMood/rMood: facial expression ("neutral", "happy", "angry", "shocked")
- bItem/rItem: item held ("none", "gun", "money", "banana", "coffee", "bomb")

Given the user's prompt, output ONLY a valid JSON object matching the exact config structure. No markdown, no explanations. 
Analyze what the user wants to happen and adjust the positions, items, and facial expressions accordingly!
Make it highly dramatic and creative if the user is vague.

Config Structure:
{
  "step1": { "dur": 800, "bX": -140, "bScale": 1.0, "bLook": "right", "bMood": "neutral", "bItem": "gun", "rX": 140, "rScale": 1.0, "rLook": "left", "rMood": "happy", "rItem": "money" },
  "step2": { "dur": 1200, "bX": -40, "bScale": 1.2, "bLook": "forward", "bMood": "angry", "bItem": "gun", "rX": 40, "rScale": 1.2, "rLook": "forward", "rMood": "shocked", "rItem": "banana" },
  "step3": { "dur": 800, "bX": 140, "bScale": 1.0, "bLook": "right", "bMood": "happy", "bItem": "coffee", "rX": -140, "rScale": 1.0, "rLook": "left", "rMood": "angry", "rItem": "bomb" },
  "idle": { "dur": 800, "bX": -180, "bScale": 1.0, "bLook": "forward", "bMood": "neutral", "bItem": "none", "rX": 180, "rScale": 1.0, "rLook": "forward", "rMood": "neutral", "rItem": "none" }
}`;

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen3.5:2b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Current config:\n${JSON.stringify(currentConfig)}\n\nUser request: ${prompt}\n\nRemember, output ONLY JSON.` }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Ollama API returned an error:", response.status, errorText);
      throw new Error(`Ollama API error: ${errorText}`);
    }

    const data = await response.json();

    if (data.message && data.message.content) {
      const content = data.message.content;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonConfig = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        return NextResponse.json({ config: jsonConfig, isMock: false });
      } catch (e) {
        console.error("Failed to parse JSON from LLM:", content);
        throw new Error("LLM did not return valid JSON");
      }
    }

    throw new Error("Failed to generate config, missing message content.");
  } catch (error: any) {
    console.error("API error:", error);
    // Graceful fallback if Ollama crashes (ECONNRESET) or returns bad JSON
    const fallbackConfig = {
      ...currentConfig,
      step2: { ...currentConfig.step2, bMood: "shocked", bItem: "banana", rItem: "bomb", rMood: "happy" },
      step3: { ...currentConfig.step3, bMood: "angry", bItem: "gun", rItem: "gun", rMood: "angry" }
    };
    return NextResponse.json({ config: fallbackConfig, isMock: true, error: error.message });
  }
}
