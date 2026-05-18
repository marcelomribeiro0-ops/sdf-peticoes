export type Tese = {
  id: string;
  nome: string;
  resumo: string;
  palavrasChave: string[];
  template: string;
};

export const TESES: Tese[] = [
  {
    id: "ilegitimidade-passiva",
    nome: "Ilegitimidade Passiva",
    resumo:
      "Cabível quando o réu não é a parte que deveria figurar no polo passivo da demanda.",
    palavrasChave: [
      "ilegitimidade",
      "parte ilegítima",
      "polo passivo",
      "não é responsável",
      "terceiro",
    ],
    template: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} DA COMARCA DE {{COMARCA}}/{{UF}}

Processo nº: {{NUMERO_PROCESSO}}

{{NOME_REU}}, já qualificado nos autos da ação que lhe move {{NOME_AUTOR}}, vem, respeitosamente, por seu advogado infra-assinado, com fundamento no art. 335 do Código de Processo Civil, apresentar

CONTESTAÇÃO

pelos fatos e fundamentos a seguir expostos.

I — DOS FATOS

{{RESUMO_DOS_FATOS}}

II — PRELIMINAR DE ILEGITIMIDADE PASSIVA

Antes de adentrar ao mérito, impõe-se reconhecer a manifesta ilegitimidade do(a) Réu(é) para figurar no polo passivo da presente demanda.

Isto porque {{MOTIVO_ILEGITIMIDADE}}, restando evidente que a parte que deveria responder pelos fatos narrados na inicial é {{PARTE_LEGITIMA}}.

A teor do art. 17 do CPC, "para postular em juízo é necessário ter interesse e legitimidade". A doutrina e a jurisprudência são uníssonas em reconhecer que a ilegitimidade passiva, quando manifesta, conduz à extinção do feito sem resolução de mérito (art. 485, VI, do CPC).

III — DO MÉRITO (por eventualidade)

Caso superada a preliminar, o que se admite apenas por amor ao debate, melhor sorte não assiste à parte Autora, eis que {{ARGUMENTOS_DE_MERITO}}.

IV — DOS PEDIDOS

Diante do exposto, requer:

a) o acolhimento da preliminar de ilegitimidade passiva, com a consequente extinção do feito sem resolução de mérito, nos termos do art. 485, VI, do CPC;

b) subsidiariamente, a improcedência total dos pedidos formulados na inicial;

c) a condenação da parte Autora ao pagamento das custas processuais e honorários advocatícios sucumbenciais.

Protesta provar o alegado por todos os meios de prova em direito admitidos.

Dá-se à causa o valor de R$ {{VALOR_CAUSA}}.

Termos em que,
Pede deferimento.

{{CIDADE}}, {{DATA}}.

{{NOME_ADVOGADO}}
OAB/{{UF_OAB}} {{NUMERO_OAB}}
`,
  },
  {
    id: "prescricao",
    nome: "Prescrição",
    resumo:
      "Cabível quando o direito de ação foi extinto pelo decurso do prazo prescricional.",
    palavrasChave: [
      "prescrição",
      "prazo prescricional",
      "decadência",
      "anos",
      "decurso do prazo",
    ],
    template: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} DA COMARCA DE {{COMARCA}}/{{UF}}

Processo nº: {{NUMERO_PROCESSO}}

{{NOME_REU}}, já qualificado nos autos, vem, respeitosamente, por seu advogado infra-assinado, apresentar

CONTESTAÇÃO

aos termos da ação que lhe move {{NOME_AUTOR}}, pelas razões a seguir.

I — DOS FATOS

{{RESUMO_DOS_FATOS}}

II — PRELIMINAR DE PRESCRIÇÃO

Inicialmente, cumpre arguir a prescrição da pretensão autoral.

Conforme se extrai da própria inicial, os fatos narrados ocorreram em {{DATA_FATO}}, ao passo que a presente ação foi ajuizada somente em {{DATA_AJUIZAMENTO}}, ou seja, após o transcurso de {{TEMPO_DECORRIDO}}.

Aplicável à espécie o prazo prescricional de {{PRAZO_PRESCRICIONAL}}, previsto no art. {{ARTIGO_PRESCRICAO}} do Código Civil/Código de Defesa do Consumidor.

Assim, encontrando-se fulminada a pretensão pelo decurso do prazo, impõe-se o reconhecimento da prescrição, com a consequente extinção do feito com resolução de mérito (art. 487, II, do CPC).

III — DO MÉRITO (por eventualidade)

Ainda que superada a prejudicial de prescrição, o que se admite apenas em sede de argumentação, os pedidos não merecem prosperar, pois {{ARGUMENTOS_DE_MERITO}}.

IV — DOS PEDIDOS

Diante do exposto, requer:

a) o reconhecimento da prescrição, com extinção do feito com resolução de mérito (art. 487, II, do CPC);

b) subsidiariamente, a total improcedência dos pedidos;

c) a condenação da Autora nas custas e honorários advocatícios.

Protesta provar o alegado por todos os meios admitidos em direito.

Dá-se à causa o valor de R$ {{VALOR_CAUSA}}.

Termos em que,
Pede deferimento.

{{CIDADE}}, {{DATA}}.

{{NOME_ADVOGADO}}
OAB/{{UF_OAB}} {{NUMERO_OAB}}
`,
  },
  {
    id: "inexistencia-dano-moral",
    nome: "Inexistência de Dano Moral",
    resumo:
      "Cabível quando o autor pleiteia dano moral sem comprovar efetiva ofensa a direito da personalidade.",
    palavrasChave: [
      "dano moral",
      "abalo psíquico",
      "honra",
      "constrangimento",
      "indenização por danos morais",
    ],
    template: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} DA COMARCA DE {{COMARCA}}/{{UF}}

Processo nº: {{NUMERO_PROCESSO}}

{{NOME_REU}}, já qualificado, vem, por seu advogado, apresentar

CONTESTAÇÃO

à ação proposta por {{NOME_AUTOR}}, expondo:

I — DOS FATOS

{{RESUMO_DOS_FATOS}}

II — DO MÉRITO — DA INEXISTÊNCIA DE DANO MORAL INDENIZÁVEL

Pretende a parte Autora ser indenizada a título de dano moral em razão de {{FATO_ALEGADO}}.

Contudo, não há nos autos qualquer prova de efetiva ofensa a direito da personalidade. O mero {{NATUREZA_DO_FATO}} configura, no máximo, mero aborrecimento, insuficiente à caracterização do dano moral indenizável.

É pacífico na jurisprudência do Superior Tribunal de Justiça que "o mero dissabor, aborrecimento, mágoa, irritação ou sensibilidade exacerbada estão fora da órbita do dano moral" (STJ, REsp 844.736/DF).

Ademais, {{ARGUMENTOS_COMPLEMENTARES}}.

III — DA EVENTUAL FIXAÇÃO DO QUANTUM

Caso, por hipótese, venha esse juízo a entender pela existência de dano moral indenizável, o valor pretendido na inicial ({{VALOR_PRETENDIDO}}) mostra-se manifestamente desproporcional, devendo a fixação observar os critérios da razoabilidade e proporcionalidade, atentando-se às condições econômicas das partes e à natureza do fato.

IV — DOS PEDIDOS

Diante do exposto, requer:

a) a total improcedência dos pedidos formulados na inicial;

b) subsidiariamente, caso reconhecido o dano moral, sua fixação em valor compatível com a razoabilidade e proporcionalidade;

c) a condenação da parte Autora ao pagamento das custas e honorários advocatícios.

Protesta provar o alegado por todos os meios em direito admitidos.

Dá-se à causa o valor de R$ {{VALOR_CAUSA}}.

Termos em que,
Pede deferimento.

{{CIDADE}}, {{DATA}}.

{{NOME_ADVOGADO}}
OAB/{{UF_OAB}} {{NUMERO_OAB}}
`,
  },
  {
    id: "cobranca-indevida",
    nome: "Inexistência de Débito / Cobrança Indevida",
    resumo:
      "Cabível quando o autor é cobrado por dívida inexistente ou já quitada, geralmente com inscrição indevida em cadastros de inadimplentes.",
    palavrasChave: [
      "cobrança indevida",
      "inexistência de débito",
      "negativação",
      "serasa",
      "spc",
      "inscrição indevida",
    ],
    template: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{VARA}} DA COMARCA DE {{COMARCA}}/{{UF}}

Processo nº: {{NUMERO_PROCESSO}}

{{NOME_REU}}, já qualificado, vem, por seu advogado, apresentar

CONTESTAÇÃO

aos termos da ação que lhe move {{NOME_AUTOR}}, conforme razões a seguir.

I — DOS FATOS

{{RESUMO_DOS_FATOS}}

II — DO MÉRITO — DA REGULARIDADE DA CONDUTA E INEXISTÊNCIA DE COBRANÇA INDEVIDA

Ao contrário do alegado na inicial, o débito que ensejou {{CONDUTA_QUESTIONADA}} é plenamente existente e devido, decorrente de {{ORIGEM_DEBITO}}.

A documentação anexa demonstra de forma cabal a regularidade da contratação/cobrança, restando comprovado que {{PROVAS_DA_REGULARIDADE}}.

Assim, agiu o(a) Réu(é) em exercício regular de direito, nos termos do art. 188, I, do Código Civil, não havendo que se falar em ato ilícito.

III — DA INEXISTÊNCIA DE DANO MORAL

Ainda que assim não fosse, eventual {{CONDUTA_QUESTIONADA}} não gerou dano moral indenizável, especialmente porque {{ARGUMENTOS_DANO}}.

Aplicável, ademais, a Súmula 385 do STJ caso a parte Autora ostente outras anotações preexistentes.

IV — DOS PEDIDOS

Diante do exposto, requer:

a) a total improcedência dos pedidos formulados na inicial;

b) subsidiariamente, a fixação de eventual indenização em patamar razoável e proporcional;

c) a condenação da parte Autora ao pagamento das custas e honorários sucumbenciais.

Protesta provar o alegado por todos os meios admitidos em direito, especialmente prova documental suplementar.

Dá-se à causa o valor de R$ {{VALOR_CAUSA}}.

Termos em que,
Pede deferimento.

{{CIDADE}}, {{DATA}}.

{{NOME_ADVOGADO}}
OAB/{{UF_OAB}} {{NUMERO_OAB}}
`,
  },
];

export function getTeseById(id: string): Tese | undefined {
  return TESES.find((t) => t.id === id);
}
