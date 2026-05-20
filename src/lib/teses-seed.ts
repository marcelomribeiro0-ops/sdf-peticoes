import type { Tese } from "./teses";

export const TESES_SEED: Tese[] = [
  {
    id: "prescricao-anua",
    nome: "Prescrição Ânua (art. 206, §1º, II, 'b', CC)",
    categoria: "preliminar",
    resumo:
      "Prescrição em 1 ano da pretensão do segurado/locador contra a seguradora — IAC nº 02 do STJ.",
    quandoAplicar:
      "Quando entre o fato gerador (inadimplemento, abandono, vistoria final, recusa de cobertura) e o ajuizamento da ação se passou mais de 1 ano.",
    palavrasChave: [
      "prescrição",
      "ânua",
      "prazo prescricional",
      "decurso do prazo",
      "art. 206",
      "seguro fiança",
      "fato gerador",
    ],
    texto: `DA PRESCRIÇÃO – TESE FIRMADA NO INCIDENTE DE ASSUNÇÃO DE COMPETÊNCIA Nº 02 DO STJ.

Inicialmente, importantíssimo destacar que o Superior Tribunal de Justiça solucionou a controvérsia jurisprudencial que permeava o prazo prescricional aplicável às relações securitárias. Assim, fixou para os fins do artigo 947 do CPC, durante o julgamento do Incidente de Assunção de Competência no REsp nº 1303374/ES, a seguinte tese:

"É ânuo o prazo prescricional para exercício de qualquer pretensão do segurado em face do segurador — e vice-versa — baseada em suposto inadimplemento de deveres (principais, secundários ou anexos) derivados do contrato de seguro, ex vi do disposto no artigo 206, § 1º, II, 'b', do Código Civil de 2002 (artigo 178, § 6º, II, do Código Civil de 1916)."

Veja-se, Excelência, que a tese fixada pelo STJ é claríssima ao dispor que é ÂNUO o prazo prescricional para exercício de QUALQUER pretensão do SEGURADO em face do SEGURADOR. Ou seja, não há distinção entre a natureza da pretensão, podendo ela ser oriunda de um seguro de vida, automóvel ou até mesmo seguro fiança locatícia, como no caso dos autos.

O artigo 206, § 1º, II, "b", do Código Civil, por sua vez, é claro:

Art. 206. Prescreve:
§ 1º Em um ano:
II - a pretensão do segurado contra o segurador, ou a deste contra aquele, contado o prazo:
b) quanto aos demais seguros, da ciência do fato gerador da pretensão.

Voltando ao caso dos autos, pela análise da Petição Inicial e documentos, verifica-se que a pretensão de cobrança da indenização teve como fato gerador {{FATO_GERADOR}}, ocorrido em {{DATA_FATO_GERADOR}}.

Assim, se o prazo prescricional começou a fluir em {{DATA_FATO_GERADOR}} e a presente Ação foi distribuída somente em {{DATA_AJUIZAMENTO}}, ou seja, mais de 1 ano após a ciência do fato gerador, não restam dúvidas que a prescrição ânua se operou.

Nesse exato sentido, o Tribunal de Justiça do Estado de São Paulo já se manifestou:

"SEGURO FIANÇA LOCATÍCIA Pretensão de cobrança da indenização julgada parcialmente procedente e improcedente a reconvenção - Aluguéis vencidos em novembro e dezembro de 2006 alcançados pela prescrição Multa compensatória devida exclusiva e proporcionalmente ao tempo remanescente da locação, abatida a franquia de 20% que não se tem por abusiva - Solução que merece prevalecer - Recurso não provido." (TJSP; Apelação Cível 0004897-36.2008.8.26.0020; Relator(a): Sá Duarte; 33ª Câmara de Direito Privado; Data do Julgamento: 28/07/2014).

Em casos análogos, o entendimento se repete:

"RECURSO INOMINADO – RELAÇÃO DE CONSUMO – SEGURO DE PROTEÇÃO PARA ESTABELECIMENTO COMERCIAL – PRESCRIÇÃO ÂNUA – ARTIGO 206, §1º, II, 'B', DO CÓDIGO CIVIL – INTELIGÊNCIA DA SÚMULA 101 DO STJ – PRECEDENTES DO STJ – PRELIMINAR DE PRESCRIÇÃO ACOLHIDA – RECURSO PROVIDO." (TJMT, N.U 8010092-19.2016.8.11.0078, Turma Recursal Única, Julgado em 12/12/2019).

Por todo o exposto, a presente ação deve ser totalmente extinta, com resolução de mérito, em razão da ocorrência da prescrição trazida pelo artigo 206, § 1º, II, "b", do Código Civil.`,
    pedido: `Seja a presente ação extinta, com resolução de mérito, em razão da ocorrência da prescrição ânua (art. 487, II, CPC c/c art. 206, §1º, II, "b", CC);`,
  },

  {
    id: "perda-direito-indenizacao",
    nome: "Perda do Direito à Indenização — Ausência/Atraso na Comunicação do Sinistro",
    categoria: "merito",
    resumo:
      "Locador não comunicou tempestivamente a expectativa de sinistro à Seguradora (Cláusulas 8 e 10 das Condições Gerais; art. 765 CC).",
    quandoAplicar:
      "Quando o locador demorou meses para acionar a Seguradora após o início da inadimplência, ou nunca comunicou e ajuizou direto.",
    palavrasChave: [
      "comunicação",
      "expectativa de sinistro",
      "aviso de sinistro",
      "boa-fé",
      "inadimplemento",
      "abandono",
      "imediatamente",
      "locador",
      "segurado",
    ],
    texto: `DA PERDA DO DIREITO À INDENIZAÇÃO – AUSÊNCIA DE COMUNICAÇÃO TEMPESTIVA DA EXPECTATIVA DE SINISTRO.

Em primeiro lugar, faz-se necessário tecer breves considerações acerca do Seguro Fiança Locatícia, uma modalidade de garantia prevista no artigo 37, III, da Lei nº 8.245/1991 e regulado pela Circular SUSEP nº 587/2019 e 671/2022:

"Art. 2º O seguro fiança locatícia destina-se a garantir o pagamento de indenização, ao segurado, pelos prejuízos que venha a sofrer em decorrência do inadimplemento das obrigações contratuais do locatário previstas no contrato de locação do imóvel, de acordo com as coberturas contratadas e limites da apólice."

Assim, o Seguro Fiança Locatícia é uma modalidade de garantia prestada pelo Locatário (Garantido) em favor do Locador (Segurado). Há, portanto, duas relações jurídicas distintas: (i) Locador e Locatário, consubstanciada no Contrato de Locação; (ii) Locador e Seguradora, consubstanciada na Apólice de Seguro Fiança Locatícia.

No caso dos autos, o(a) Autor(a)/Locador(a) simplesmente desconsiderou sua obrigação contratual (Cláusulas 8ª e 10ª) e legal (art. 765 do Código Civil) e, como consequência, perdeu o direito ao recebimento da indenização securitária, visto que deixou de comunicar à Seguradora a ocorrência do fato em {{DATA_INADIMPLEMENTO}}.

Nota-se que o(a) Autor(a)/Locador(a) {{DETALHE_COMUNICACAO_TARDIA}}.

A Cláusula 8ª – Obrigações – das Condições Gerais da Apólice estabelece a obrigação do Segurado de comunicar à Seguradora imediatamente após o conhecimento do fato causador de prejuízos.

Ainda nesse contexto, o item 10 das Condições Gerais da Apólice determina que é obrigação do Segurado comunicar a Seguradora imediatamente a inadimplência dos pagamentos, após o vencimento do 2º (segundo) aluguel e/ou encargos não pagos pela Garantida/Locatária. O item 10.3 também determina, sob pena de perda do direito à indenização, que o Segurado deveria buscar todas as medidas a fim de minimizar os prejuízos, dando imediata ciência à Seguradora.

A questão diz respeito à aniquilação das chances de a Seguradora Ré minimizar o sinistro ou as consequências da sua concretização (regresso). Trata-se da quebra da lealdade e da honestidade na relação contratual.

O dever de comunicação do sinistro tem fundamento em pelo menos três vertentes básicas: (a) a Seguradora pode adotar medidas perante o Tomador para que cumpra as obrigações, minorando as consequências do inadimplemento; (b) a Seguradora pode tomar medidas junto ao Tomador para aumentar ou executar antecipadamente suas contragarantias; (c) negar a emissão de outras apólices para este Tomador enquanto não regularizadas as obrigações.

Verifica-se que a postura inerte do(a) Autor(a)/Segurado(a) fez com que o débito aumentasse gradativamente, mês após mês, e, pior, fez com que sobre o débito incidissem encargos moratórios. Caso a expectativa de sinistro tivesse sido comunicada tempestivamente, nenhum desses encargos incidiriam, nos termos do item 10.1 e da Cláusula 13 das Condições Gerais.

Dispõe o artigo 765 do Código Civil que "o segurado e o segurador são obrigados a guardar na conclusão e na execução do contrato, a mais estrita boa-fé e veracidade, tanto a respeito do objeto como das circunstâncias e declarações a ele concernentes". A interpretação do referido dispositivo deve ser feita à luz do princípio da boa-fé objetiva (art. 422 CC). Não tendo o(a) Autor(a)/Segurado(a) cumprido suas obrigações contratuais relevantes, não pode exigir que a Seguradora Ré cumpra as suas (art. 476 CC).

Nesse sentido, o Egrégio Tribunal de Justiça de São Paulo já se manifestou:

"LOCAÇÃO DE IMÓVEIS – AÇÃO DE DESPEJO POR FALTA DE PAGAMENTO C.C. COBRANÇA - CONTRATO DE LOCAÇÃO COMERCIAL COM GARANTIA LOCATÍCIA – SEGURO FIANÇA CONTRATADO PELO LOCADOR – COMUNICAÇÃO TARDIA DO SINISTRO – DESCUMPRIMENTO DE CLÁUSULA CONTRATUAL - AUSÊNCIA DE RESPONSABILIDADE DA SEGURADORA - SENTENÇA REFORMADA – RECURSO PROVIDO." (TJ-SP, AC: 10026825920168260127, Relator: Paulo Ayrosa, 31ª Câmara de Direito Privado, 16/04/2019).

Assim, o(a) Autor(a)/Segurado(a) tem o DEVER contratual, legal, primordial e inafastável de prestar à Seguradora Ré toda informação relativa ao risco do contrato, sendo certo que, ao deixar de fazê-lo, perde o direito à indenização, nos termos da Cláusula 14, item 14.4, das Condições Gerais da Apólice.`,
    pedido: `Sejam os pedidos julgados totalmente improcedentes, visto que o(a) Autor(a)/Segurado(a) perdeu o direito ao recebimento da indenização securitária ao deixar de comunicar tempestivamente à Pottencial Seguradora a Expectativa de Sinistro;`,
  },

  {
    id: "riscos-nao-cobertos",
    nome: "Riscos Não Cobertos / Limite da Apólice (art. 757 CC)",
    categoria: "merito",
    resumo:
      "Pedidos que extrapolam o limite máximo de garantia ou estão no rol de prejuízos não indenizáveis das Coberturas Adicionais.",
    quandoAplicar:
      "Quando o locador cobra danos não contratados (limpeza, desgaste natural, multa moratória sem cobertura adicional, valores acima do LMG, modificações de uso/fim do imóvel).",
    palavrasChave: [
      "danos ao imóvel",
      "cobertura adicional",
      "risco excluído",
      "limite máximo",
      "limite da apólice",
      "art. 757",
      "multa moratória",
      "encargos",
      "pintura",
      "desgaste",
    ],
    texto: `DA RESPONSABILIDADE DA SEGURADORA ADSTRITA AOS TERMOS DA APÓLICE – RISCOS NÃO COBERTOS E LIMITE MÁXIMO DE GARANTIA.

Em primeiro lugar, faz-se necessário tecer breves considerações acerca do Seguro Fiança Locatícia, visto que, em hipótese alguma, a Ré pode ser condenada por danos que extrapolam à cobertura contratada, bem como o estipulado pelo Contrato de Locação.

O(A) Autor(a)/Locador(a), ao firmar a Apólice de Seguro Fiança Locatícia nº {{NUMERO_APOLICE}}, contratou, além da cobertura geral básica e obrigatória, as Coberturas Adicionais de {{COBERTURAS_CONTRATADAS}}.

As Coberturas Adicionais são aquelas que o(a) Segurado(a)/Locador(a) pode contratar, isoladamente, mediante pagamento de prêmio adicional. Ou seja, diferentemente da cobertura básica, que garante o inadimplemento apenas do aluguel, trata-se de escolha do(a) Segurado(a) contratar a Cobertura Adicional, ou não.

Em vista disso, pretende o(a) Autor(a)/Locador(a) o recebimento de {{ITENS_PEDIDOS}}. No entanto, {{MOTIVO_NAO_COBERTURA}}, eis que se encontram previstos no rol taxativo dos "Prejuízos Não Indenizáveis e Riscos Excluídos".

A pretensão do(a) Autor(a) carece de aderência ao próprio regime jurídico do contrato de seguro, que, como se sabe, é regido pelo princípio da estrita vinculação às coberturas contratadas, nos termos do artigo 757 do Código Civil:

"Art. 757. Pelo contrato de seguro, o segurador se obriga, mediante o pagamento do prêmio, a garantir interesse legítimo do segurado, relativo a pessoa ou a coisa, contra riscos predeterminados."

A responsabilidade da Seguradora não é ampla nem aberta, mas rigorosamente delimitada pelas garantias expressamente previstas na Apólice, que constitui o instrumento regulador do risco assumido. Não há espaço para ampliação interpretativa para abarcar eventos ou verbas que não foram objeto de contratação específica.

No caso concreto, é inequívoco que o(a) Autor(a)/Locador(a), embora tivesse plena liberdade para contratar coberturas adicionais aptas a abranger encargos acessórios, deliberadamente deixou de fazê-lo. Trata-se de decisão negocial consciente, que impacta diretamente a extensão da garantia securitária.

Nesse sentido, segue o entendimento dos Tribunais sobre a legalidade do art. 757 do CC:

"AÇÃO DE COBRANÇA. SEGURO DE DANOS. CONDOMÍNIO. VENDAVAL. TOLDOS DANIFICADOS. RISCO EXPRESSAMENTE EXCLUÍDO. INDENIZAÇÃO INDEVIDA. De acordo com o art. 757, caput, do Código Civil, pelo contrato de seguro, o segurador se obriga a garantir interesse legítimo do segurado, relativo a pessoa ou a coisa, contra riscos predeterminados. Desta forma, os riscos assumidos pelo segurador são exclusivamente os assinalados na apólice, dentro dos limites por ela fixados, não se admitindo a interpretação extensiva, nem analógica." (TJ-RS, Apelação Cível Nº 70071724686, Quinta Câmara Cível, Relator: Jorge André Pereira Gailhard, Julgado em 31/05/2017).

A obrigação da seguradora está limitada aos riscos predeterminados na apólice, o que se aplica ao limite máximo de indenização prevista, nos termos do artigo 757 do Código Civil.

Tem-se, assim, que a Seguradora, em estrita observância dos seus direitos e deveres, só estará obrigada a indenizar os prejuízos cobertos pela Apólice, excluindo-se os riscos pré-determinados, sob pena de ofensa aos artigos 757 e 760 do Código Civil.`,
    pedido: `Sejam os pedidos julgados totalmente improcedentes, ante a absoluta ausência de cobertura securitária para os valores pleiteados; subsidiariamente, caso reconhecida alguma obrigação, que se observe rigorosamente o Limite Máximo de Garantia da Apólice;`,
  },

  {
    id: "fraude-contrato-locacao",
    nome: "Fraude no Contrato de Locação — Princípio da Gravitação Jurídica",
    categoria: "merito",
    resumo:
      "Contrato principal nulo (fraude documental, usurpação de identidade) contamina o contrato acessório de seguro (art. 184 CC).",
    quandoAplicar:
      "Quando há evidências de fraude no contrato de locação (documentos adulterados, identidade falsa, suposto locatário desconhece a locação) e a Seguradora recusou o pagamento por isso.",
    palavrasChave: [
      "fraude",
      "documento falso",
      "adulteração",
      "usurpação de identidade",
      "contrato acessório",
      "gravitação jurídica",
      "nulidade",
      "carta de recusa",
      "boletim de ocorrência",
    ],
    texto: `DA NULIDADE DO CONTRATO DE LOCAÇÃO POR FRAUDE – CONTAMINAÇÃO DO CONTRATO ACESSÓRIO DE SEGURO – PRINCÍPIO DA GRAVITAÇÃO JURÍDICA.

Faz-se necessário tecer breves considerações acerca do Seguro Fiança Locatícia, visto que, em hipótese alguma, a Seguradora Ré pode ser condenada à indenização securitária perante fraude constatada no Contrato de Locação.

O Seguro Fiança Locatícia é modalidade de garantia prevista no artigo 37, III, da Lei nº 8.245/1991 e regulado pela Circular SUSEP nº 587/2019 e 671/2022.

Em {{DATA_AVISO_SINISTRO}}, a Imobiliária entrou em contato com a Pottencial Seguradora requerendo o registro de AVISO DE SINISTRO, em razão da existência de débitos vencidos e não pagos pelo Locatário.

Após o início do processo de Regulação de Sinistro, a Pottencial Seguradora recebeu a informação de que o verdadeiro Locatário – {{NOME_LOCATARIO_REAL}} – desconhecia a locação. Ademais, análises internas detectaram divergências nos documentos apresentados, o que motivou a emissão da Carta de Recusa e encerramento da Apólice.

A Companhia Seguradora realizou diversas diligências para verificar a autenticidade do Contrato de Locação em questão, constatando-se {{EVIDENCIAS_FRAUDE}}.

Evidentemente, ficou demonstrado que a Companhia Seguradora atua exclusivamente como garantidora do Contrato de Locação. Sua intervenção se limita a regular o sinistro em caso de inadimplência do Locatário e, sendo devido, efetuar o pagamento da indenização securitária. Todavia, a verificação e validação dos documentos essenciais ao contrato são de responsabilidade exclusiva da parte que celebrou o Contrato de Locação, ou seja, da Locadora ou da Administradora.

Uma vez constatada a nulidade do contrato principal em razão da fraude contratual, o contrato acessório também será inevitavelmente contaminado pela nulidade. No contexto de um Contrato de Seguro, a eficácia da garantia está vinculada à existência de um objeto protegido, que, neste caso, é o Contrato de Locação. Diante da nulidade do contrato principal, o seguro, como contrato acessório, também se torna nulo.

O Princípio da Gravitação Jurídica estabelece que a validade e a eficácia dos contratos acessórios dependem diretamente da existência e validade do contrato principal ao qual estão vinculados. O artigo 184 do Código Civil é expresso:

"Art. 184. Respeitada a intenção das partes, a invalidade parcial de um negócio jurídico não o prejudicará na parte válida, se esta for separável; a invalidade da obrigação principal implica a das obrigações acessórias, mas a destas não induz a da obrigação principal."

Aplica-se, ainda, o artigo 138 do Código Civil quanto ao erro substancial concernente à identidade da pessoa.

Nesse sentido, versa a jurisprudência:

"APELAÇÃO - PRELIMINAR - NULIDADE DA SENTENÇA - ILEGITIMIDADE DE PARTE - NÃO OCORRÊNCIA - ATRASO NA ENTREGA DE LOTE - AUSÊNCIA DE EXCLUDENTE DE RESPONSABILIDADE - RESCISÃO DO CONTRATO PRINCIPAL E DO CONTRATO DE FINANCIAMENTO/ALIENAÇÃO FIDUCIÁRIA - CONTRATO CONEXO - TEORIA DA GRAVITAÇÃO JURÍDICA. O contrato coligado, seja por força de lei ou por sua natureza acessória em relação a outro contrato, dito principal, encontra-se em relação de dependência, e pelo princípio da gravitação jurídica, segundo o qual o acessório segue o principal, rescindido o contrato principal por inadimplemento do contratado, rescinde-se também o contrato acessório." (TJMG, Apelação Cível 1.0000.22.031556-8/001, Relator: Des. Rui de Almeida Magalhães, 11ª Câmara Cível, 04/05/2022).

As Autoras/Locadoras CLARAMENTE assumiram o risco do negócio quando decidiram firmar um Contrato de Locação sem a devida conferência dos documentos básicos, de modo que não é crível tampouco razoável que a Companhia Seguradora suporte o prejuízo pela negligência das Autoras/Locadoras. Resta inequivocamente comprovada a ausência de responsabilidade da Seguradora Ré em indenizar o(a) Autor(a)/Locador(a), em razão da NULIDADE DO CONTRATO DE SEGURO.`,
    pedido: `Sejam os pedidos julgados totalmente improcedentes, ante a absoluta ausência de cobertura securitária em razão da nulidade do contrato principal de locação por fraude;`,
  },

  {
    id: "suspensao-regulacao-sinistro",
    nome: "Suspensão da Regulação de Sinistro — Cláusula 4.2 das Condições Gerais",
    categoria: "merito",
    resumo:
      "Locatário impugnou judicialmente os débitos; a regulação de sinistro fica suspensa até trânsito em julgado (Cláusula 4.2 'a' das CG).",
    quandoAplicar:
      "Quando há ação em curso movida pelo locatário discutindo os débitos (rescisão contratual, nulidade de cláusulas, declaratória de inexistência) e o locador/locatário cobra a indenização da Seguradora.",
    palavrasChave: [
      "suspensão",
      "impugnação judicial",
      "rescisão de contrato",
      "nulidade de cláusulas",
      "ação em curso",
      "regulação de sinistro",
      "sub-rogação",
      "reconvenção",
    ],
    texto: `DA SUSPENSÃO DA REGULAÇÃO DE SINISTRO – LEGALIDADE DA CLÁUSULA 4.2 "a" DAS CONDIÇÕES GERAIS DA APÓLICE.

Conforme visto, o(a) Autor(a) se limita a consignar que a Pottencial Seguradora suspendeu o pagamento das indenizações securitárias até que o processo movido pela Locatária fosse finalizado.

Convenientemente, porém, omite-se o fato de que a suspensão de pagamento das indenizações securitárias se deu com fundamento na Cláusula 4.2 "a" das Condições Gerais da Apólice de Seguro Fiança Locatícia, o que, por si só, rechaça toda a tese autoral de descumprimento contratual e violação da força obrigatória dos contratos.

O Seguro Fiança Locatícia é uma modalidade de garantia prevista no artigo 37, III, da Lei nº 8.245/1991. Em caso de pagamento da indenização securitária, a Seguradora se sub-roga nos direitos e privilégios dos Segurados/Locadores para reaver do Locatário tudo aquilo que desembolsou em função do seu inadimplemento contratual.

E é exatamente por este motivo que a Cláusula 4.2 "a" das Condições Gerais da Apólice determina que a Seguradora não responderá, sob nenhuma hipótese, pelos aluguéis, encargos legais mensais e demais coberturas adicionais impugnadas pelo Garantido/Locatário.

Isso porque, caso haja impugnação, sobretudo judicial, de algum débito locatício por parte do Locatário/Garantido, o direito de regresso (sub-rogação) da Seguradora poderá restar prejudicado na hipótese de êxito do Locatário em sua impugnação judicial.

Imagine-se que um Locatário impugne judicialmente um débito locatício em razão de vícios no imóvel e, mesmo sabendo da impugnação, a Seguradora realize o pagamento da indenização securitária. Se ao final do processo o Locatário lograr êxito (declaração de inexigibilidade de débito), a Seguradora terá pagado débito manifestamente inexigível e não poderá cobrar em regresso, jamais, do Locatário a indenização desembolsada.

Foi justamente por esta razão que a Pottencial Seguradora, legitimamente, com base na Cláusula 4.2 "a" das Condições Gerais da Apólice, suspendeu o pagamento da indenização securitária da Apólice de Seguro Fiança Locatícia nº {{NUMERO_APOLICE}}, quando tomou conhecimento do ajuizamento da Ação nº {{NUMERO_ACAO_RELACIONADA}}, movida pela Locatária e cujo objeto é justamente {{OBJETO_ACAO_RELACIONADA}}.

Em momento algum a Pottencial Seguradora negou o pagamento da indenização securitária, mas tão somente, por razão de cautela e com base nas Condições Gerais da Apólice, suspendeu o pagamento das indenizações.

Registra-se, outrossim, que caso haja a improcedência dos pedidos autorais no bojo da referida ação, com o devido trânsito em julgado da sentença, a Pottencial Seguradora retomará, imediatamente, o pagamento das indenizações securitárias, respeitando os limites, condições e coberturas contratados na Apólice.

Portanto, devidamente demonstrado que a Seguradora Ré simplesmente agiu no exercício regular do seu direito contratualmente previsto (Art. 188, I, CC), não há que se falar em descumprimento da Apólice e, muito menos, em violação à força obrigatória dos contratos.`,
    pedido: `Sejam os pedidos julgados totalmente improcedentes, mantendo-se a suspensão da regulação de sinistro até o trânsito em julgado da Ação nº {{NUMERO_ACAO_RELACIONADA}};`,
  },
];

