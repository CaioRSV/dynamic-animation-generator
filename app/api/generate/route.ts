import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  let currentConfig: any = {};
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const emotion = body.emotion || "neutral";
    const history = body.history || [];
    const isAutoLoop = body.isAutoLoop || false;
    currentConfig = body.currentConfig || {};

    const systemPrompt = `You are an animation director for a web canvas featuring two characters: a Blue Sheriff and a Red Bandit.
They animate through 3 sequential steps per sequence: step1, step2, and step3.
The narrative and story of this sequence unfolds slowly and methodically, focusing heavily on continuous dialogue.
Each step has properties for both characters:
- dur: duration in ms (default 2500-3500). This determines how long the speech bubble stays on screen! Give the viewer enough time to read it (at least 2.5 seconds).
- bX/rX: X position (-300 to 300). Keep transitions gradual across steps.
- bLook/rLook: look direction ("left", "forward", "right")
- bMood/rMood: facial expression ("neutral", "happy", "angry", "shocked")
- bItem/rItem: item held ("none", "gun", "money", "banana", "coffee", "bomb")
- bSpeech/rSpeech: Speech bubble text (1 to 5 words max). Focus heavily on the dialogue! Use empty string "" if they shouldn't speak in that specific step, but make sure they converse over the sequence. ALL DIALOGUE MUST BE IN PORTUGUESE (PT-BR).

Given the user's request, output ONLY a valid JSON object matching the exact config structure. No markdown, no explanations. 
You MUST output an array of sequences under the "sequences" key AND a "reasoning" string explaining how the user's emotion directed the story.
Ensure the animation is SMOOTH. Focus almost entirely on a continuous, slow-building conversation based on the provided dialogue history.
CRITICAL: Keep physical movements SUBTLE. Do not make them jump around suddenly. The physical movements (X position, look direction, mood) should logically align with the conversation but dialogue is the absolute priority.

Config Structure:
{
  "reasoning": "O usuário estava com raiva, então eu fiz o Xerife ser mais agressivo e o Bandido revidar.",
  "sequences": [
    {
      "step1": { "dur": 2500, "bX": -160, "bLook": "right", "bMood": "neutral", "bItem": "none", "bSpeech": "Quem está aí?", "rX": 160, "rLook": "left", "rMood": "neutral", "rItem": "none", "rSpeech": "..." },
      "step2": { "dur": 3000, "bX": -100, "bLook": "right", "bMood": "angry", "bItem": "none", "bSpeech": "Apareça devagar.", "rX": 100, "rLook": "left", "rMood": "neutral", "rItem": "banana", "rSpeech": "Calma aí, Xerife." },
      "step3": { "dur": 2500, "bX": -100, "bLook": "right", "bMood": "angry", "bItem": "gun", "bSpeech": "Não se mova.", "rX": 100, "rLook": "left", "rMood": "happy", "rItem": "banana", "rSpeech": "Eu não fiz nada." }
    }
  ]
}`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: isAutoLoop 
              ? `[CONTINUOUS DIALOGUE MODE]\n${emotion !== 'none (initial)' ? `The user is reacting with emotion: ${emotion}. Incorporate this into the dialogue!\n` : `This is the very first scene. Start a conversation.\n`}\n[DIALOGUE HISTORY (Read carefully!)]\n${history.length > 0 ? history.join('\n') : 'No previous dialogue.'}\n\n[CURRENT STATE]\n${JSON.stringify(currentConfig)}\n\nGenerate the next sequence of dialogue. Output ONLY JSON containing a "sequences" array and a "reasoning" string.`
              : `Current config:\n${JSON.stringify(currentConfig)}\n\nUser request: ${prompt}\n\nRemember, output ONLY JSON containing a "sequences" array of length 1.` 
            }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Gemini API returned an error:", response.status, errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        let parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        
        let sequences = parsed.sequences || [parsed];
        
        const enforceSpacing = (step: any) => {
          if (!step) return step;
          let bX = step.bX;
          let rX = step.rX;
          
          // Only adjust if both are provided by AI
          if (typeof bX === 'number' && typeof rX === 'number') {
            const MIN_DISTANCE = 110; // Minimum pixels between them
            if (rX - bX < MIN_DISTANCE) {
              const mid = (bX + rX) / 2;
              bX = Math.round(mid - MIN_DISTANCE / 2);
              rX = Math.round(mid + MIN_DISTANCE / 2);
            }
          }
          return { ...step, ...(typeof bX === 'number' ? { bX } : {}), ...(typeof rX === 'number' ? { rX } : {}) };
        };

        sequences = sequences.map((seq: any) => ({
          step1: { ...(currentConfig.step1 || {}), ...enforceSpacing(seq.step1) },
          step2: { ...(currentConfig.step2 || {}), ...enforceSpacing(seq.step2) },
          step3: { ...(currentConfig.step3 || {}), ...enforceSpacing(seq.step3) }
        }));

        return NextResponse.json({ sequences, reasoning: parsed.reasoning, isMock: false });
      } catch (e) {
        console.error("Failed to parse JSON from LLM:", content);
        throw new Error("LLM did not return valid JSON");
      }
    }

    throw new Error("Failed to generate config, missing message content.");
  } catch (error: any) {
    console.error("API error:", error);
    // Graceful fallback if Gemini API fails or returns bad JSON
    const fallbackConfig = {
      ...currentConfig,
      step2: { ...(currentConfig.step2 || {}), bMood: "shocked", bItem: "banana", rItem: "bomb", rMood: "happy" },
      step3: { ...(currentConfig.step3 || {}), bMood: "angry", bItem: "gun", rItem: "gun", rMood: "angry" }
    };
    return NextResponse.json({ sequences: [fallbackConfig], isMock: true, error: error.message });
  }
}
