import {
  BLOCO_ENDERECAMENTO,
  BLOCO_QUALIFICACAO,
  BLOCO_TITULO_TEMPESTIVIDADE,
  BLOCO_TEXTO_TEMPESTIVIDADE,
  BLOCO_TITULO_SINTESE,
  BLOCO_TEXTO_SINTESE,
  BLOCO_TITULO_PRELIMINARES,
  BLOCO_TITULO_MERITO,
  BLOCO_TITULO_PEDIDOS,
  BLOCO_INTRO_PEDIDOS,
  BLOCO_PEDIDO_FINAL,
  BLOCO_RODAPE,
} from "./blocos";
import { getTesesPorIds } from "./teses";

/** Metadados extraídos da petição inicial pela IA (todos opcionais). */
export type DadosExtraidos = {
  vara?: string;
  comarca?: string;
  uf?: string;
  numeroProcesso?: string;
  nomeAutor?: string;
  tipoAcao?: string;
  sinteseInicial?: string;
  valorPretendido?: string;
  naturezaValor?: string;
  numeroApolice?: string;
};

function aplicarPlaceholders(
  texto: string,
  dados: DadosExtraidos,
): string {
  const mapa: Record<string, string | undefined> = {
    VARA: dados.vara,
    COMARCA: dados.comarca,
    UF: dados.uf,
    NUMERO_PROCESSO: dados.numeroProcesso,
    NOME_AUTOR: dados.nomeAutor,
    TIPO_ACAO: dados.tipoAcao,
    SINTESE_INICIAL: dados.sinteseInicial,
    VALOR_PRETENDIDO: dados.valorPretendido,
    NATUREZA_VALOR: dados.naturezaValor,
    NUMERO_APOLICE: dados.numeroApolice,
  };
  return texto.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
    const v = mapa[key];
    return v && v.trim() ? v : `{{${key}}}`;
  });
}

type SecaoMontada = {
  tipo: "titulo" | "texto" | "tese";
  conteudo: string;
};

export async function montarContestacao(
  teseIds: string[],
  dados: DadosExtraidos,
): Promise<SecaoMontada[]> {
  const teses = await getTesesPorIds(teseIds);
  const preliminares = teses.filter((t) => t.categoria === "preliminar");
  const meritos = teses.filter(
    (t) => t.categoria === "merito" || t.categoria === "subsidiario",
  );

  const secoes: SecaoMontada[] = [];

  // Cabeçalho + qualificação + tempestividade + síntese
  secoes.push({
    tipo: "texto",
    conteudo: aplicarPlaceholders(BLOCO_ENDERECAMENTO.conteudo, dados),
  });
  secoes.push({
    tipo: "texto",
    conteudo: aplicarPlaceholders(BLOCO_QUALIFICACAO.conteudo, dados),
  });
  secoes.push({ tipo: "titulo", conteudo: BLOCO_TITULO_TEMPESTIVIDADE.conteudo });
  secoes.push({
    tipo: "texto",
    conteudo: BLOCO_TEXTO_TEMPESTIVIDADE.conteudo,
  });
  secoes.push({ tipo: "titulo", conteudo: BLOCO_TITULO_SINTESE.conteudo });
  secoes.push({
    tipo: "texto",
    conteudo: aplicarPlaceholders(BLOCO_TEXTO_SINTESE.conteudo, dados),
  });

  // Preliminares
  if (preliminares.length > 0) {
    secoes.push({
      tipo: "titulo",
      conteudo: BLOCO_TITULO_PRELIMINARES.conteudo,
    });
    preliminares.forEach((tese, i) => {
      secoes.push({
        tipo: "tese",
        conteudo: aplicarPlaceholders(
          numerarSecao(tese.texto, `III.${i + 1}`),
          dados,
        ),
      });
    });
  }

  // Mérito
  if (meritos.length > 0) {
    const prefixoBase = preliminares.length > 0 ? "IV" : "III";
    secoes.push({
      tipo: "titulo",
      conteudo:
        preliminares.length > 0
          ? BLOCO_TITULO_MERITO.conteudo
          : BLOCO_TITULO_MERITO.conteudo.replace("IV", "III"),
    });
    meritos.forEach((tese, i) => {
      secoes.push({
        tipo: "tese",
        conteudo: aplicarPlaceholders(
          numerarSecao(tese.texto, `${prefixoBase}.${i + 1}`),
          dados,
        ),
      });
    });
  }

  // Pedidos
  const numTituloPedidos =
    preliminares.length > 0 && meritos.length > 0
      ? "V"
      : preliminares.length > 0 || meritos.length > 0
        ? "IV"
        : "III";
  secoes.push({
    tipo: "titulo",
    conteudo: BLOCO_TITULO_PEDIDOS.conteudo.replace(/^V/, numTituloPedidos),
  });
  secoes.push({
    tipo: "texto",
    conteudo: BLOCO_INTRO_PEDIDOS.conteudo,
  });
  const todosPedidos = teses.map((t, i) =>
    `${alfabetico(i)}) ${aplicarPlaceholders(t.pedido, dados)}`,
  );
  if (todosPedidos.length > 0) {
    secoes.push({ tipo: "texto", conteudo: todosPedidos.join("\n\n") });
  }
  secoes.push({ tipo: "texto", conteudo: BLOCO_PEDIDO_FINAL.conteudo });

  // Rodapé
  secoes.push({
    tipo: "texto",
    conteudo: aplicarPlaceholders(BLOCO_RODAPE.conteudo, dados),
  });

  return secoes;
}

function numerarSecao(texto: string, prefixo: string): string {
  // Primeira linha = título da tese; mantém maiúscula com prefixo numérico.
  const [titulo, ...resto] = texto.split("\n");
  return `${prefixo} – ${titulo}\n${resto.join("\n")}`;
}

function alfabetico(i: number): string {
  return String.fromCharCode("a".charCodeAt(0) + i);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function secoesToHtml(secoes: SecaoMontada[]): string {
  return secoes
    .map((s) => {
      if (s.tipo === "titulo") {
        return `<p><strong>${escapeHtml(s.conteudo)}</strong></p>`;
      }
      // Cada quebra de linha (\n) vira um parágrafo próprio, evitando que o
      // Word estique linhas curtas como "Súmula:" / "Processo nº..." ao
      // aplicar justificação. Linhas vazias são descartadas.
      const linhas = s.conteudo
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
      return linhas
        .map((linha, i) => {
          // Para "tese", a primeira linha é o título da seção argumentativa
          const ehTituloDeTese =
            s.tipo === "tese" && i === 0 && linha.length < 200;
          if (ehTituloDeTese) {
            return `<p><strong>${escapeHtml(linha)}</strong></p>`;
          }
          return `<p>${escapeHtml(linha)}</p>`;
        })
        .join("");
    })
    .join("");
}

export function dadosVazios(): DadosExtraidos {
  return {};
}
