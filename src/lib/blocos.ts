/**
 * Blocos estruturais que SEMPRE compõem a contestação, na ordem em que
 * são montados. Não são "teses" — são o esqueleto do documento.
 * Cada bloco tem um id, um tipo (titulo/texto) e o conteúdo com
 * placeholders {{...}} que são preenchidos pela extração da IA ou
 * manualmente no editor.
 */

export type BlocoEstrutural = {
  id: string;
  tipo: "endereçamento" | "qualificacao" | "titulo" | "texto" | "rodape";
  conteudo: string;
};

export const BLOCO_ENDERECAMENTO: BlocoEstrutural = {
  id: "enderecamento",
  tipo: "endereçamento",
  conteudo: `Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) de Direito da {{VARA}} da Comarca de {{COMARCA}}/{{UF}}.

Súmula:
Processo nº {{NUMERO_PROCESSO}}.
Espécie: Contestação.`,
};

export const BLOCO_QUALIFICACAO: BlocoEstrutural = {
  id: "qualificacao",
  tipo: "qualificacao",
  conteudo: `POTTENCIAL SEGURADORA S/A, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 11.699.534/0001-74, sediada na Avenida Raja Gabaglia, nº 1.143 - 19º andar, Bairro Luxemburgo, Belo Horizonte/MG, CEP. 30.380-403, endereço eletrônico intimacao@sdf.adv.br, vem, respeitosamente, perante Vossa Excelência, por intermédio de seus procuradores ut instrumento de mandato anexo (Doc. 01), nos autos da {{TIPO_ACAO}} proposta por {{NOME_AUTOR}}, já qualificado(a), apresentar sua Contestação, mediante as razões de fato e de direito que se passa a expor:`,
};

export const BLOCO_TITULO_TEMPESTIVIDADE: BlocoEstrutural = {
  id: "titulo_tempestividade",
  tipo: "titulo",
  conteudo: "I – DA TEMPESTIVIDADE.",
};

export const BLOCO_TEXTO_TEMPESTIVIDADE: BlocoEstrutural = {
  id: "texto_tempestividade",
  tipo: "texto",
  conteudo: `1. A presente contestação é apresentada de forma tempestiva, tendo em vista que {{DESCRICAO_TEMPESTIVIDADE}}.`,
};

export const BLOCO_TITULO_SINTESE: BlocoEstrutural = {
  id: "titulo_sintese",
  tipo: "titulo",
  conteudo: "II – BREVE SÍNTESE DA PETIÇÃO INICIAL.",
};

export const BLOCO_TEXTO_SINTESE: BlocoEstrutural = {
  id: "texto_sintese",
  tipo: "texto",
  conteudo: `2. Em apertada síntese, sustenta o(a) Autor(a) que {{SINTESE_INICIAL}}.

3. Pugna pela condenação da Pottencial Seguradora ao pagamento de R$ {{VALOR_PRETENDIDO}}, a título de {{NATUREZA_VALOR}}.

4. Todavia, conforme passa-se a demonstrar, sorte não assiste ao(à) Autor(a), devendo os pedidos serem julgados improcedentes pelas razões a seguir.`,
};

export const BLOCO_TITULO_PRELIMINARES: BlocoEstrutural = {
  id: "titulo_preliminares",
  tipo: "titulo",
  conteudo: "III – DAS PRELIMINARES E PREJUDICIAIS DE MÉRITO.",
};

export const BLOCO_TITULO_MERITO: BlocoEstrutural = {
  id: "titulo_merito",
  tipo: "titulo",
  conteudo: "IV – DO MÉRITO.",
};

export const BLOCO_TITULO_PEDIDOS: BlocoEstrutural = {
  id: "titulo_pedidos",
  tipo: "titulo",
  conteudo: "V – DOS PEDIDOS.",
};

export const BLOCO_INTRO_PEDIDOS: BlocoEstrutural = {
  id: "intro_pedidos",
  tipo: "texto",
  conteudo: `Isto posto, a Pottencial Seguradora S/A requer a Vossa Excelência:`,
};

export const BLOCO_PEDIDO_FINAL: BlocoEstrutural = {
  id: "pedido_final",
  tipo: "texto",
  conteudo: `Por fim, a condenação do(a) Autor(a) ao pagamento das custas processuais e honorários advocatícios sucumbenciais.

Protesta provar o alegado por todos os meios de prova em direito admitidos, especialmente prova documental suplementar.`,
};

export const BLOCO_RODAPE: BlocoEstrutural = {
  id: "rodape",
  tipo: "rodape",
  conteudo: `Nestes Termos,
Pede-se deferimento.

{{CIDADE}}, {{DATA}}.

Felipe Bueno Siqueira              Marcelo Moreira Ribeiro
OAB/MG 116.885                     OAB/MG 179.978

Izabela Cristina Chaves            Clara Villar Marroso
OAB/MG 210.399                     OAB/MG 223.175`,
};
