import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  let currentConfig: any = {};
  try {
    const body = await req.json();
    const prompt = body.prompt;
    const emotion = body.emotion || "neutral";
    const history = (body.history || []).slice(-8);
    const isAutoLoop = body.isAutoLoop || false;
    const lastReasoning = currentConfig.reasoning || "";
    currentConfig = body.currentConfig || {};

    const systemPrompt = `Cena: Xerife interrogando suspeito ao ar livre (dia).
JSON OBRIGATÓRIO: {"reasoning":"...","steps":[{"sheriffMood":"...","sheriffSpeech":"...","banditMood":"...","banditSpeech":"..."}]}

REGRAS:
1. Gere uma lista (array) de EXATAMENTE 8 passos no campo "steps".
2. Moods: neutral, angry, shocked, sad.
3. Speech: Diálogos de 1-5 palavras, sempre em português brasileiro.
4. Alternância: Xerife fala nos passos ímpares (1,3,5,7), Bandido nos pares (2,4,6,8). Ouvinte usa "".
5. Reaja à EMOÇÃO do usuário. Xerife autoritário, Bandido sarcástico.
6. reasoning: máximo 10 palavras.
`;


    const response = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user", content: isAutoLoop
              ? `ULTIMO ACONTECIMENTO: ${lastReasoning}
DIÁLOGO RECENTE: ${history.join(' | ')}
EMOÇÃO ATUAL DO USUÁRIO: ${emotion}

TAREFA: Continue a cena. Gere EXATAMENTE 8 PASSOS. Foque em novo diálogo, não repita o anterior. Output JSON.`
              : `HISTÓRICO: ${history.join('\n')}
ULTIMO ESTADO: ${JSON.stringify(currentConfig.step8 || currentConfig.step4 || {})}
PEDIDO: ${prompt}
TAREFA: Gere uma cena COMPLETA (step1 a step8) baseada no pedido. Output JSON.`
          }
        ],
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Ollama API returned an error:", response.status, errorText);
      throw new Error(`Ollama API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    console.log("=== RAW AI RESPONSE ===");
    console.log(content);
    console.log("=======================");

    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonToParse = jsonMatch ? jsonMatch[0] : content;

        console.log("=== JSON TO PARSE ===");
        console.log(jsonToParse);
        console.log("=====================");

        let parsed = JSON.parse(jsonToParse);

        console.log("=== SUCCESSFULLY PARSED JSON ===");
        console.log(JSON.stringify(parsed, null, 2));
        console.log("================================");

        let sequences = parsed.sequences || [parsed];

        const mapSimplifiedState = (step: any) => {
          if (!step) return step;

          // Internal conversion from descriptive AI keys
          const bMood = step.sheriffMood || step.bMood || "neutral";
          const bSpeech = step.sheriffSpeech || step.bSpeech || "";
          const rMood = step.banditMood || step.rMood || "neutral";
          const rSpeech = step.banditSpeech || step.rSpeech || "";

          const bX = -120;
          const rX = 120;

          const bSpeechLower = bSpeech.toLowerCase();
          const rSpeechLower = rSpeech.toLowerCase();

          let bItem = "none";
          if (bSpeechLower.includes("arma") || bSpeechLower.includes("pistola") || bSpeechLower.includes("parado")) bItem = "gun";
          if (bSpeechLower.includes("café") || bSpeechLower.includes("bebida")) bItem = "coffee";
          if (bSpeechLower.includes("dinheiro") || bSpeechLower.includes("grana") || bSpeechLower.includes("money")) bItem = "money";
          
          // New tension logic: if both are angry, Sheriff draws his gun
          if (bMood === "angry" && rMood === "angry") {
            bItem = "gun";
          }

          let rItem = "none";
          if (rSpeechLower.includes("bomba") || rSpeechLower.includes("explosivo")) rItem = "bomb";
          if (rSpeechLower.includes("banana")) rItem = "banana";
          if (rSpeechLower.includes("dinheiro") || rSpeechLower.includes("grana") || rSpeechLower.includes("money") || rSpeechLower.includes("ouro")) rItem = "money";
          if (rSpeechLower.includes("arma") || rSpeechLower.includes("atirar")) rItem = "gun";

          return {
            bMood, bSpeech, rMood, rSpeech,
            dur: 3000,
            bX, rX, bItem, rItem,
            bLook: "right", rLook: "left"
          };
        };

        // Get steps from array
        let aiSteps = parsed.steps || [];
        if (!Array.isArray(aiSteps)) {
          const firstSeq = parsed.sequences?.[0] || parsed;
          aiSteps = [
            firstSeq.step1, firstSeq.step2, firstSeq.step3, firstSeq.step4,
            firstSeq.step5, firstSeq.step6, firstSeq.step7, firstSeq.step8
          ].filter(Boolean);
        }

        // Ensure we have exactly 8 steps
        if (aiSteps.length > 8) aiSteps = aiSteps.slice(0, 8);
        while (aiSteps.length < 8) {
          aiSteps.push(aiSteps[aiSteps.length - 1] || {});
        }

        let lastStep = currentConfig.step8 || currentConfig.step4 || {};
        const processedSteps: any = {};

        aiSteps.forEach((rawStep: any, idx: number) => {
          const mappedStep = mapSimplifiedState(rawStep || {});
          const merged = {
            ...lastStep,
            bSpeech: "",
            rSpeech: "",
            ...mappedStep
          };
          processedSteps[`step${idx + 1}`] = merged;
          lastStep = merged;
        });

        const finalSequence = {
          reasoning: parsed.reasoning,
          ...processedSteps
        };

        return NextResponse.json({ sequences: [finalSequence], reasoning: parsed.reasoning, isMock: false });
      } catch (e) {
        console.error("Failed to parse JSON from LLM:", content);
        throw new Error("LLM did not return valid JSON");
      }
    }

    throw new Error("Failed to generate config, missing message content.");
  } catch (error: any) {
    console.error("API error:", error);
    // Graceful fallback if Gemini API fails or returns bad JSON
    const last = currentConfig.step8 || currentConfig.step4 || {};
    const fallbackConfig = {
      step1: { ...last, bSpeech: "Opa...", rSpeech: "", bMood: "neutral" },
      step2: { ...last, bSpeech: "", rSpeech: "Hã?", rMood: "shocked" },
      step3: { ...last, bSpeech: "Algo deu errado na conexão.", rSpeech: "", bMood: "angry" },
      step4: { ...last, bSpeech: "", rSpeech: "Vou tentar de novo.", rMood: "neutral" },
      step5: { ...last, bSpeech: "Aguarde um momento...", rSpeech: "", bMood: "neutral" },
      step6: { ...last, bSpeech: "", rSpeech: "Tudo bem.", rMood: "happy" },
      step7: { ...last, bSpeech: "Ok.", rSpeech: "", bMood: "happy" },
      step8: { ...last, bSpeech: "", rSpeech: "Pronto.", rMood: "neutral" }
    };
    return NextResponse.json({ sequences: [fallbackConfig], isMock: true, error: error.message });
  }
}
