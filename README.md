# Gerador Dinâmico de Animação Baseado em IA

**Tech Demo — Geração de comportamento via prompt**

---

## Contexto

Existe uma tendência crescente, especialmente em streaming e sistemas interativos, de geração de conteúdo dinâmico e personalizado com uso de IA. 

Em vez de conteúdo fixo, busca-se experiências que se adaptam em tempo real ao usuário.

---

## O Problema

A geração direta de mídia (vídeo ou animação renderizada frame a frame) é **computacionalmente custosa** e **pouco responsiva**. 

Isso limita drasticamente a interatividade e a adaptação contínua ao contexto do usuário.

---

## Nossa Proposta

Criar um sistema onde o prompt **não gera mídia diretamente**. 

Em vez disso, a IA define o **comportamento** de uma cena ao longo do tempo, manipulando programaticamente componentes visuais pré-definidos.

---

## Como Funciona

1. **Prompt do Usuário**  
   ↓
2. **Interpretação da IA**  
   Extração de parâmetros estruturados (posição, escala, expressões faciais, itens e estados).
   ↓
3. **Execução do Sistema**  
   Aplicação dos parâmetros em tempo real sobre os componentes visuais (Motor React/Framer Motion).
   ↓
4. **Iteração Contínua**  
   O usuário modifica o comportamento da cena dinamicamente, mantendo o contexto.

---

## Principais Características

* **Cenas não são pré-geradas** (renderização nativa no cliente).
* **Mudanças contínuas** sem necessidade de regeneração completa de recursos.
* **Interação direta** com o comportamento e coreografia da cena.
* **Resposta em tempo real** perfeitamente alinhada ao prompt.
* **Separação estrita** entre a definição lógica (IA) e a execução visual (Sistema).

---

## Ideia Central

> A IA atua como **geradora de regras e comportamento**, e não como geradora de conteúdo final.

O resultado emerge da execução contínua dessas regras pelo motor gráfico.

---

## Demonstração (Live Demo)

* Demonstração ao vivo do sistema em funcionamento.
* Exploração de diferentes prompts e coreografias.
* Visualização da evolução da cena em tempo real através da interação contínua do usuário.
