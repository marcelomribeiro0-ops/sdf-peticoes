import Anthropic from "@anthropic-ai/sdk";
import { TESES, Tese } from "./teses";

export type Sugestao = {
  teseId: string;
  nome: string;
  confianca: number;
  justificativa: string;
};

export type AnalyzeResult = {
  sugestoes: Sugestao[];
  modo: "ia" | "mock";
};

function mockAnalyze(peticao: string): AnalyzeResult {
  const texto = peticao.toLowerCase();
  const scored = TESES.map((t) => {
    const hits = t.palavrasChave.filter((kw) =>
      texto.includes(kw.toLowerCase()),
    ).length;
    const confianca = Math.min(1, hits / Math.max(2, t.palavrasChave.length));
    return { tese: t, hits, confianca };
  })
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.confianca - a.confianca);

  const sugestoes: Sugestao[] =
    scored.length > 0
      ? scored.slice(0, 3).map((s) => ({
          teseId: s.tese.id,
          nome: s.tese.nome,
          confianca: s.confianca,
          justificativa: `Encontrados ${s.hits} indicador(es) no texto: ${s.tese.palavrasChave
            .filter((kw) => texto.includes(kw.toLowerCase()))
            .join(", ")}.`,
        }))
      : TESES.slice(0, 3).map((t) => ({
          teseId: t.id,
          nome: t.nome,
          confianca: 0.2,
          justificativa:
            "Modo mock: nenhum indicador encontrado, mostrando teses padrão.",
        }));

  return { sugestoes, modo: "mock" };
}

export async function analyzePeticao(
  peticao: string,
): Promise<AnalyzeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return mockAnalyze(peticao);

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const catalogo = TESES.map(
    (t) => `- id: ${t.id}\n  nome: ${t.nome}\n  resumo: ${t.resumo}`,
  ).join("\n");

  const prompt = `Você é um assistente jurídico de um escritório brasileiro. Sua tarefa é analisar a PETIÇÃO INICIAL abaixo e indicar, dentre o CATÁLOGO de teses de contestação disponíveis, quais são as mais aplicáveis ao caso.

CATÁLOGO DE TESES:
${catalogo}

PETIÇÃO INICIAL:
"""
${peticao}
"""

Responda APENAS com um JSON válido no formato:
{
  "sugestoes": [
    { "teseId": "<id-do-catalogo>", "confianca": 0.0_a_1.0, "justificativa": "1-2 frases explicando por que essa tese se aplica a este caso, citando trecho ou fato concreto da petição." }
  ]
}

Inclua no máximo 4 sugestões, ordenadas pela confiança (maior primeiro). Use apenas ids que existem no catálogo. Não envolva o JSON em markdown nem em crases.`;

  const resp = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = resp.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return mockAnalyze(peticao);
  }

  let parsed: { sugestoes: Array<{ teseId: string; confianca: number; justificativa: string }> };
  try {
    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    parsed = JSON.parse(cleaned);
  } catch {
    return mockAnalyze(peticao);
  }

  const byId = new Map<string, Tese>(TESES.map((t) => [t.id, t]));
  const sugestoes: Sugestao[] = parsed.sugestoes
    .filter((s) => byId.has(s.teseId))
    .map((s) => ({
      teseId: s.teseId,
      nome: byId.get(s.teseId)!.nome,
      confianca: Math.max(0, Math.min(1, s.confianca)),
      justificativa: s.justificativa,
    }));

  return { sugestoes, modo: "ia" };
}
