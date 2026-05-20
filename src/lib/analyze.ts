import Anthropic from "@anthropic-ai/sdk";
import { listarTeses, type Tese } from "./teses";
import { CONTEXTO_ESCRITORIO } from "./contexto-escritorio";
import type { DadosExtraidos } from "./montagem";

export type Sugestao = {
  teseId: string;
  nome: string;
  categoria: "preliminar" | "merito" | "subsidiario";
  confianca: number;
  justificativa: string;
};

export type AnalyzeResult = {
  sugestoes: Sugestao[];
  dados: DadosExtraidos;
  modo: "ia" | "mock";
};

async function mockAnalyze(peticao: string): Promise<AnalyzeResult> {
  const TESES = await listarTeses();
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
      ? scored.map((s) => ({
          teseId: s.tese.id,
          nome: s.tese.nome,
          categoria: s.tese.categoria,
          confianca: s.confianca,
          justificativa: `Modo mock: indicadores encontrados — ${s.tese.palavrasChave
            .filter((kw) => texto.includes(kw.toLowerCase()))
            .join(", ")}.`,
        }))
      : TESES.map((t) => ({
          teseId: t.id,
          nome: t.nome,
          categoria: t.categoria,
          confianca: 0.2,
          justificativa: "Modo mock: nenhum indicador específico encontrado.",
        }));

  return { sugestoes, dados: {}, modo: "mock" };
}

export async function analyzePeticao(peticao: string): Promise<AnalyzeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return mockAnalyze(peticao);

  const TESES = await listarTeses();
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const catalogo = TESES.map(
    (t) =>
      `- id: ${t.id}
  nome: ${t.nome}
  categoria: ${t.categoria}
  resumo: ${t.resumo}
  quando aplicar: ${t.quandoAplicar}`,
  ).join("\n\n");

  const systemPrompt = `${CONTEXTO_ESCRITORIO}

IMPORTANTE: você NÃO escreve textos jurídicos. Você APENAS:
1) extrai metadados do documento (vara, comarca, partes, processo, valores)
2) classifica quais teses do catálogo do escritório se aplicam ao caso

O documento abaixo pode ser a petição inicial isolada OU o arquivo único do processo. Identifique a petição inicial dentro do material.

CATÁLOGO DE TESES DO ESCRITÓRIO:
${catalogo}

REGRAS DE SAÍDA:
- Responda APENAS com JSON válido, sem markdown nem crases.
- Formato:
{
  "dados": {
    "vara": "string ou null",
    "comarca": "string ou null",
    "uf": "string ou null (sigla 2 letras)",
    "numeroProcesso": "string ou null",
    "nomeAutor": "string ou null (nome completo em maiúsculas como aparece nos autos)",
    "tipoAcao": "string ou null (ex: Ação de Cobrança, Ação de Despejo c/c Cobrança, Ação Declaratória de Inexistência de Débito)",
    "sinteseInicial": "string com 2-4 frases resumindo o que o autor narra na inicial",
    "valorPretendido": "string ou null (valor numérico formatado, ex: 84.280,09)",
    "naturezaValor": "string ou null (ex: indenização securitária, danos morais)",
    "numeroApolice": "string ou null"
  },
  "sugestoes": [
    {
      "teseId": "<id-do-catalogo>",
      "confianca": 0.0_a_1.0,
      "justificativa": "1-3 frases citando trecho/fato concreto da petição (datas, valores, partes, número da apólice) que justifica essa tese"
    }
  ]
}

- Em "sugestoes" inclua de 1 a 5 teses, ordenadas por confiança decrescente. Pode haver várias cumulativamente (ex: prescrição + perda do direito + limite da apólice).
- Use apenas ids que existem no catálogo.
- Se houver indícios de PRESCRIÇÃO (lapso > 1 ano), sempre sugira com alta confiança.
- Se houver indícios de FRAUDE, sempre sugira.
- Não invente metadados — se o documento não trouxer o dado, use null.`;

  const userPrompt = `DOCUMENTO RECEBIDO:
"""
${peticao}
"""

Analise e retorne o JSON conforme as regras.`;

  const resp = await client.messages.create({
    model,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = resp.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return mockAnalyze(peticao);
  }

  let parsed: {
    dados?: Record<string, string | null>;
    sugestoes: Array<{ teseId: string; confianca: number; justificativa: string }>;
  };
  try {
    const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
    parsed = JSON.parse(cleaned);
  } catch {
    return mockAnalyze(peticao);
  }

  const byId = new Map<string, Tese>(TESES.map((t) => [t.id, t]));
  const sugestoes: Sugestao[] = (parsed.sugestoes || [])
    .filter((s) => byId.has(s.teseId))
    .map((s) => {
      const tese = byId.get(s.teseId)!;
      return {
        teseId: s.teseId,
        nome: tese.nome,
        categoria: tese.categoria,
        confianca: Math.max(0, Math.min(1, s.confianca)),
        justificativa: s.justificativa,
      };
    });

  const d = parsed.dados || {};
  const dados: DadosExtraidos = {
    vara: d.vara || undefined,
    comarca: d.comarca || undefined,
    uf: d.uf || undefined,
    numeroProcesso: d.numeroProcesso || undefined,
    nomeAutor: d.nomeAutor || undefined,
    tipoAcao: d.tipoAcao || undefined,
    sinteseInicial: d.sinteseInicial || undefined,
    valorPretendido: d.valorPretendido || undefined,
    naturezaValor: d.naturezaValor || undefined,
    numeroApolice: d.numeroApolice || undefined,
  };

  return { sugestoes, dados, modo: "ia" };
}
