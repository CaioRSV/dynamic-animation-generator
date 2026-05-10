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

    const systemPrompt = `Você é o roteirista de uma animação de comédia no Velho Oeste.

PERFIS DOS PERSONAGENS (NUNCA SAIA DO PERSONAGEM):
- XERIFE: Autoritário, desconfiado e focado na lei. Ele sempre acusa o Bandido, faz perguntas incisivas e tenta desmascará-lo.
- BANDIDO: Sarcástico, dissimulado e cara-de-pau. Ele sempre nega os crimes usando as desculpas mais absurdas, cínicas e engraçadas possíveis. Finge inocência constantemente.

O CONTEXTO: O Xerife sempre está investigando um crime absurdo e o Bandido é sempre o principal suspeito, pego em flagrante com provas questionáveis. O interrogatório nunca acaba.

REGRAS RÍGIDAS DE FORMATAÇÃO (SIGA OU A ANIMAÇÃO VAI QUEBRAR):
1. Responda APENAS com um JSON válido. Não inclua texto fora do JSON.
2. O JSON deve ter o campo "reasoning" (resumo da cena e por que a emoção detectada a influenciou) e "steps" (lista com EXATAMENTE 8 itens).
3. Humor ("sheriffMood" e "banditMood") SÓ PODE SER: "neutral", "happy", "angry", "shocked" ou "sad".
4. Fala ("sheriffSpeech" e "banditSpeech"): devem ser frases naturais, conversacionais e curtas.
5. ALTERNÂNCIA ESTRITA DE FALAS: 
   - No passo 1, 3, 5, 7: O Xerife fala, e o Bandido DEVE ficar mudo ("").
   - No passo 2, 4, 6, 8: O Bandido fala, e o Xerife DEVE ficar mudo ("").

EXEMPLO DE SAÍDA JSON ESPERADA:
{
  "reasoning": "Como a emoção detectada foi 'shocked', o xerife foca em assustar o suspeito com a acusação do banco, e o bandido usa deboche fingindo choque.",
  "steps": [
    { "sheriffMood": "angry", "sheriffSpeech": "Parado! O que faz aqui?", "banditMood": "neutral", "banditSpeech": "" },
    { "sheriffMood": "angry", "sheriffSpeech": "", "banditMood": "shocked", "banditSpeech": "Eu? Só comendo minha banana." },
    { "sheriffMood": "angry", "sheriffSpeech": "Alguém roubou o banco hoje!", "banditMood": "shocked", "banditSpeech": "" },
    { "sheriffMood": "angry", "sheriffSpeech": "", "banditMood": "neutral", "banditSpeech": "Que horror. Fui eu não." },
    { "sheriffMood": "neutral", "sheriffSpeech": "Tem certeza? Achei esse dinheiro na sua bagagem.", "banditMood": "neutral", "banditSpeech": "" },
    { "sheriffMood": "neutral", "sheriffSpeech": "", "banditMood": "happy", "banditSpeech": "Impossível! Eu só tenho o dinheiro da minha carteira." },
    { "sheriffMood": "angry", "sheriffSpeech": "Alguém botou dinheiro na sua bolsa então, cidadão?", "banditMood": "happy", "banditSpeech": "" },
    { "sheriffMood": "angry", "sheriffSpeech": "", "banditMood": "angry", "banditSpeech": "Só pode ter sido.." }
  ]
}`;

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
              ? `CONTEXTO ANTERIOR (Não repita o diálogo, mas continue a partir dele): 
${history.join(' | ')}
RESUMO DA ÚLTIMA CENA: ${lastReasoning}
EMOÇÃO DO ESPECTADOR AGORA: ${emotion}

TAREFA: Continue o interrogatório. Mantenha os papéis estritamente: O Xerife pressiona com novas acusações ou evidências, e o Bandido desvia com desculpas esfarrapadas. Faça uma referência criativa à EMOÇÃO DO ESPECTADOR. Responda APENAS com JSON!`
              : `PEDIDO PARA A CENA: ${prompt}
EMOÇÃO DO ESPECTADOR AGORA: ${emotion}

TAREFA: Inicie a cena seguindo o PEDIDO. Mantenha os personagens em seus papéis (Xerife autoritário e desconfiado, Bandido cínico e sarcástico). Lembre-se da alternância de falas. Responda APENAS com JSON!`
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
