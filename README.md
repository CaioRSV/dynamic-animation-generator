# Gerador Dinâmico de Animação Baseado em IA

**Tech Demo — Protótipo de Gerador de Animação dinâmico com direção por emoção facial**

---

## Contexto

Existe uma tendência crescente na geração de conteúdo dinâmico e personalizado com uso de IA. Em vez de consumir conteúdo fixo ou vídeos estáticos, busquei criar experiências "vivas" que se adaptam de forma contínua e autônoma ao espectador.

---

## O Problema

A geração direta de mídia via modelos de IA generativa (como vídeos renderizados frame a frame) é **computacionalmente extremamente custosa**, **lenta** e **pouco interativa**. Isso impossibilita a criação de conteúdo em tempo real que reaja de fato ao usuário sem sofrer de engasgos ou quebras bruscas de continuidade.

---

## A proposta

Criar um sistema onde a IA **não gera pixels ou vídeos**. Em vez disso, a IA (Gemini) atua como **Diretora de Cena**, definindo o comportamento, a narrativa e a coreografia de personagens com base no feedback do usuário e histórico recente de diálogos. 

Aliado a isso, removi a necessidade de inputs textuais clássicos (digitar prompts no teclado): a história se desenrola de forma autônoma e **molda sua narrativa reagindo à expressão facial de quem está assistindo**.

---

## Como Funciona

1. **Reconhecimento Facial (Frontend)**  
   A webcam do usuário capta continuamente as expressões faciais (feliz, triste, surpreso, irritado) processando os dados 100% localmente no navegador (utilizando `face-api.js`), garantindo privacidade e baixíssima latência.
   ↓
2. **Contexto e Prompting Dinâmico**  
   O sistema agrupa o estado emocional atual do usuário com o histórico recente das falas (memória da história) e injeta essas variáveis em um prompt complexo enviado para a IA.
   ↓
3. **Geração de Coreografia Estruturada (O Cérebro)**  
   A IA atua estritamente como diretora, retornando um payload (JSON estruturado) contendo uma sequência de 3 passos (`steps`). Cada passo define: diálogos, emoções dos personagens (`mood`), itens empunhados, direção do olhar e posicionamento espacial (`X Pos`).
   ↓
4. **Execução Visual em Tempo Real**  
   O motor frontend (React + Framer Motion) consome esses parâmetros estritos e interpola os movimentos suavemente na tela, animando os vetores da cena de forma nativa a 60 FPS sem gargalos de rede.
   ↓
5. **Loop Infinito (Geração Automática)**  
   Através do modo de Geração Automática, o sistema age como um canal de TV infinito. A cada 15 segundos, enquanto a cena atual é exibida, a próxima já está sendo calculada e orquestrada para garantir uma transição perfeita.

---

## Principais Características

* **Geração Automática Contínua**: O sistema roda num loop autossustentável, criando uma peça de teatro procedural e infinita.
* **Storytelling Responsivo**: Os atores na tela reagem ativamente à emoção do espectador, mudando o tom da conversa (cômico, tenso, consolador) dependendo da cara de quem assiste.
* **Renderização Nativa e Leve**: Sem buffers de vídeo demorados ou taxas caras de GPUs em nuvem para vídeos. Apenas renderização DOM nativa.
* **Painel de Diretor (Debug)**: Controles precisos em tempo real que abrem a "caixa preta", mostrando a duração milissegundo a milissegundo, posições e props que a IA escolheu para a engine.
* **Motor de Restrições**: Lógicas pós-processamento (como o `enforceSpacing`) garantem que as alucinações da IA não quebrem a cena (ex: impedindo que os personagens se sobreponham fisicamente).

---

## Ideia Central

> A IA atua exclusivamente como **máquina de estados e motor narrativo**, e nunca como geradora de pixels.

A mágica real surge da tradução instantânea e estruturada do pensamento da IA para um motor gráfico de alto desempenho em um ecossistema Web.
