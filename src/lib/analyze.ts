import Anthropic from "@anthropic-ai/sdk";
import { TESES, Tese } from "./teses";
import { CONTEXTO_ESCRITORIO } from "./contexto-escritorio";

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
          justificativa: `Modo mock: encontrados ${s.hits} indicador(es) — ${s.tese.palavrasChave
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
    (t) =>
      `- id: ${t.id}
  nome: ${t.nome}
  resumo: ${t.resumo}
  quando aplicar: ${t.quandoAplicar}`,
  ).join("\n\n");

  const systemPrompt = `${CONTEXTO_ESCRITORIO}

Sua tarefa específica nesta requisição: analisar o documento enviado (que pode ser uma petição inicial isolada OU o arquivo único do processo contendo vários documentos — neste segundo caso, identifique e foque na petição inicial) e indicar, dentre o CATÁLOGO de teses do escritório, quais se aplicam ao caso.

CATÁLOGO DE TESES DISPONÍVEIS:
${catalogo}

REGRAS DE SAÍDA:
- Responda APENAS com JSON válido, sem markdown nem crases.
- Formato: { "sugestoes": [ { "teseId": "<id-do-catalogo>", "confianca": 0.0_a_1.0, "justificativa": "..." } ] }
- Inclua de 1 a 4 sugestões, ordenadas por confiança decrescente.
- Use apenas ids que existem no catálogo acima.
- Na "justificativa" (2-4 frases) cite trechos/fatos concretos da petição (datas, valores, partes, número de apólice/processo) que justificam a aplicação da tese.
- Se houver indícios de PRESCRIÇÃO, sempre sugira essa tese com alta confiança (é preliminar e prejudica o mérito).
- Se houver indícios de FRAUDE, sempre sugira essa tese.
- Múltiplas teses podem ser cumuláveis (ex: prescrição + perda do direito + limite da apólice).`;

  const userPrompt = `DOCUMENTO RECEBIDO:
"""
${peticao}
"""

Analise e retorne o JSON com as sugestões.`;

  const resp = await client.messages.create({
    model,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = resp.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return mockAnalyze(peticao);
  }

  let parsed: {
    sugestoes: Array<{ teseId: string; confianca: number; justificativa: string }>;
  };
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
