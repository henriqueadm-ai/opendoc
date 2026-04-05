#!/usr/bin/env node
/**
 * Adds specialized legal knowledge sections to each of the 39 specialist agents.
 * Each agent gets a unique block with key legislation, priority courts, 
 * binding precedents, and optimized search terms for conectese-scraper.
 */
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');

const KNOWLEDGE = {
  'direito-administrativo': {
    title: 'Direito Administrativo',
    legislacao: [
      'Constituição Federal — Arts. 37-43 (Princípios da Administração Pública)',
      'Lei 8.666/1993 — Licitações e Contratos (e Lei 14.133/2021 — Nova Lei de Licitações)',
      'Lei 8.112/1990 — Regime Jurídico dos Servidores Públicos Federais',
      'Lei 9.784/1999 — Processo Administrativo Federal',
      'Lei 12.846/2013 — Lei Anticorrupção (Pessoa Jurídica)',
      'Lei 4.717/1965 — Ação Popular',
      'Decreto-Lei 3.365/1941 — Desapropriação por Utilidade Pública',
    ],
    tribunais: ['STF (controle direto)', 'STJ (mandados de segurança)', 'Tribunais de Contas (TCU, TCE)', 'Tribunais Regionais Federais'],
    sumulas: ['Súmula Vinculante 3 (TCU e contraditório)', 'Súmula Vinculante 13 (Nepotismo)', 'Súmula Vinculante 33 (Aposentadoria Especial)', 'Tema 1.199/STF (Estabilidade do servidor)'],
    termos_busca: ['licitação impugnação', 'ato administrativo nulidade', 'poder de polícia limites', 'servidor público PAD', 'desapropriação indireta indenização'],
  },
  'direito-aduaneiro': {
    title: 'Direito Aduaneiro',
    legislacao: [
      'Decreto-Lei 37/1966 — Imposto de Importação',
      'Decreto 6.759/2009 — Regulamento Aduaneiro',
      'Lei 10.865/2004 — PIS/COFINS-Importação',
      'Instrução Normativa RFB 1.700/2017 — Despacho Aduaneiro',
      'Acordo de Valoração Aduaneira (GATT/OMC)',
    ],
    tribunais: ['CARF (Conselho Administrativo de Recursos Fiscais)', 'TRFs (1ª e 3ª Região)', 'STJ'],
    sumulas: ['Súmula 323/STF (Apreensão de mercadorias como coerção)', 'Tema 1.042/STJ (Valor aduaneiro)'],
    termos_busca: ['pena de perdimento mercadoria', 'classificação fiscal NCM', 'valoração aduaneira GATT', 'despacho aduaneiro desembaraço', 'regime especial drawback'],
  },
  'direito-aeroportuario': {
    title: 'Direito Aeroportuário',
    legislacao: [
      'Código Brasileiro de Aeronáutica — Lei 7.565/1986',
      'Convenção de Varsóvia (1929) e Protocolo de Montreal (1999)',
      'Resoluções ANAC (Agência Nacional de Aviação Civil)',
      'Lei 11.182/2005 — Criação da ANAC',
    ],
    tribunais: ['STJ (responsabilidade civil e transporte)', 'Justiça Federal', 'Juizados Especiais Cíveis'],
    sumulas: ['Tema 210/STF (Prevalência da Convenção de Montreal)', 'Súmula 550/STJ (Prescrição em contratos internacionais)'],
    termos_busca: ['atraso voo indenização', 'extravio bagagem dano moral', 'responsabilidade companhia aérea', 'regulamentação ANAC passageiros'],
  },
  'direito-agrario': {
    title: 'Direito Agrário',
    legislacao: [
      'Estatuto da Terra — Lei 4.504/1964',
      'Constituição Federal — Arts. 184-191 (Política Agrícola e Fundiária)',
      'Lei 8.629/1993 — Reforma Agrária',
      'Lei Complementar 76/1993 — Desapropriação para Reforma Agrária',
      'Lei 6.746/1979 — Módulo Rural e ITR',
    ],
    tribunais: ['STF (desapropriação)', 'STJ', 'Tribunais Regionais Federais', 'Varas Agrárias'],
    sumulas: ['Súmula 354/STJ (Juros compensatórios desapropriação)', 'Tema 1.036/STJ (ITR imunidade)'],
    termos_busca: ['desapropriação reforma agrária', 'usucapião rural pro labore', 'módulo fiscal função social', 'conflito agrário posse', 'ITR isenção pequena propriedade'],
  },
  'direito-ambiental': {
    title: 'Direito Ambiental',
    legislacao: [
      'Constituição Federal — Art. 225 (Meio Ambiente)',
      'Lei 6.938/1981 — Política Nacional do Meio Ambiente',
      'Lei 9.605/1998 — Crimes Ambientais',
      'Código Florestal — Lei 12.651/2012',
      'Lei 9.985/2000 — SNUC (Unidades de Conservação)',
      'Lei 11.445/2007 — Saneamento Básico',
    ],
    tribunais: ['STF', 'STJ (Turma Especial Ambiental)', 'Tribunais Regionais Federais'],
    sumulas: ['Súmula 613/STJ (Dano ambiental e inversão do ônus)', 'Súmula 629/STJ (DPVAT ambiental)', 'Tema 999/STF (Código Florestal)'],
    termos_busca: ['dano ambiental responsabilidade objetiva', 'licenciamento ambiental EIA RIMA', 'área de preservação permanente APP', 'reserva legal Código Florestal', 'crime ambiental pessoa jurídica'],
  },
  'direito-bancario': {
    title: 'Direito Bancário',
    legislacao: [
      'Código de Defesa do Consumidor — Lei 8.078/1990 (aplicável a bancos)',
      'Lei 4.595/1964 — Sistema Financeiro Nacional',
      'Resoluções do CMN e Circulares do BACEN',
      'Lei 10.820/2003 — Consignado em Folha',
      'Lei 14.181/2021 — Superendividamento',
    ],
    tribunais: ['STJ (2ª Seção — Contratos Bancários)', 'Juizados Especiais Cíveis', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 297/STJ (CDC aplica-se a bancos)', 'Súmula 379/STJ (Revisão contratual de ofício)', 'Súmula 382/STJ (Capitalização de juros)', 'Súmula 530/STJ (Mora e revisão)', 'Tema 952/STJ (Juros remuneratórios)'],
    termos_busca: ['revisional contrato bancário', 'juros abusivos capitalização', 'empréstimo consignado fraude', 'superendividamento consumidor', 'busca e apreensão alienação fiduciária'],
  },
  'direito-civil': {
    title: 'Direito Civil',
    legislacao: [
      'Código Civil — Lei 10.406/2002 (Parte Geral, Obrigações, Contratos, Responsabilidade Civil, Coisas, Família, Sucessões)',
      'Lei 8.078/1990 — Código de Defesa do Consumidor',
      'Lei 10.741/2003 — Estatuto do Idoso',
      'Lei 13.709/2018 — LGPD (Responsabilidade Civil)',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas — Direito Privado)', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 37/STJ (Dano moral e material cumuláveis)', 'Súmula 227/STJ (PJ e dano moral)', 'Súmula 54/STJ (Juros moratórios)', 'Tema 210/STJ (Dano moral e quantum)', 'Tema 1.039/STJ (Prescrição contratual)'],
    termos_busca: ['responsabilidade civil dano moral', 'inadimplemento contratual resolução', 'vícios redibitórios prazo', 'usucapião ordinária extraordinária', 'prescrição intercorrente Civil'],
  },
  'direito-constitucional': {
    title: 'Direito Constitucional',
    legislacao: [
      'Constituição Federal de 1988 (íntegra)',
      'EC 119/2022 — Piso Nacional da Enfermagem',
      'EC 132/2023 — Reforma Tributária',
      'Lei 9.882/1999 — ADPF',
      'Lei 9.868/1999 — ADI e ADC',
    ],
    tribunais: ['STF (Plenário e Turmas)', 'Tribunais de Justiça Estaduais (Controle Difuso)'],
    sumulas: ['Todas as 58 Súmulas Vinculantes', 'Temas de Repercussão Geral com mérito julgado'],
    termos_busca: ['controle de constitucionalidade ADI', 'direitos fundamentais colisão', 'repercussão geral tema', 'mandado de injunção omissão legislativa', 'federalismo competência legislativa'],
  },
  'direito-da-crianca-e-do-adolescente-eca': {
    title: 'Direito da Criança e do Adolescente (ECA)',
    legislacao: [
      'Estatuto da Criança e do Adolescente — Lei 8.069/1990',
      'Constituição Federal — Art. 227 (Proteção Integral)',
      'Convenção sobre os Direitos da Criança (ONU, 1989)',
      'Lei 12.010/2009 — Nova Lei de Adoção',
      'Lei 13.431/2017 — Escuta Especializada',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'Varas da Infância e Juventude', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 383/STJ (Competência vara da infância)', 'Súmula 500/STJ (Ato infracional)', 'Tema 778/STJ (Guarda compartilhada)'],
    termos_busca: ['guarda compartilhada interesse criança', 'ato infracional medida socioeducativa', 'adoção consentimento genitores', 'alimentos menores necessidades', 'destituição poder familiar abandono'],
  },
  'direito-da-propriedade-intelectual': {
    title: 'Direito da Propriedade Intelectual',
    legislacao: [
      'Lei 9.279/1996 — Propriedade Industrial (Marcas e Patentes)',
      'Lei 9.610/1998 — Direitos Autorais',
      'Lei 9.609/1998 — Proteção de Software',
      'Lei 11.484/2007 — Topografias de Circuitos Integrados',
      'Acordo TRIPS (OMC)',
    ],
    tribunais: ['STJ', 'Tribunais Regionais Federais (2ª Região — RJ)', 'INPI (Instituto Nacional da Propriedade Industrial)'],
    sumulas: ['Súmula 143/STJ (Marca notória e proteção)', 'Tema 1.106/STJ (Direito autoral reprodução)'],
    termos_busca: ['violação marca registrada INPI', 'patente nulidade prior art', 'direito autoral plágio indenização', 'trade dress concorrência desleal', 'software proteção registro'],
  },
  'direito-de-familia': {
    title: 'Direito de Família',
    legislacao: [
      'Código Civil — Livro IV (Direito de Família)',
      'Lei 11.340/2006 — Lei Maria da Penha',
      'Lei 6.515/1977 — Divórcio',
      'Lei 12.318/2010 — Alienação Parental',
      'Lei 13.058/2014 — Guarda Compartilhada',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'Varas de Família', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 301/STJ (Recusa ao exame de DNA)', 'Súmula 358/STJ (Cancelamento pensão)', 'Súmula 364/STJ (Bem de família)', 'Tema 809/STF (União estável e casamento)'],
    termos_busca: ['divórcio partilha bens comunicáveis', 'guarda compartilhada domicílio', 'alienação parental medidas', 'alimentos exoneração maior', 'união estável reconhecimento direitos'],
  },
  'direito-de-transito': {
    title: 'Direito de Trânsito',
    legislacao: [
      'Código de Trânsito Brasileiro — Lei 9.503/1997',
      'Resoluções CONTRAN',
      'Lei 13.546/2017 — Penalidades embriaguez ao volante',
      'Constituição Federal — Art. 22, XI (Competência legislativa)',
    ],
    tribunais: ['STJ', 'Tribunais de Justiça Estaduais', 'Juizados Especiais Cíveis e Criminais'],
    sumulas: ['Súmula 465/STJ (DPVAT parcelas iguais)', 'Súmula 580/STJ (DPVAT invalidez)'],
    termos_busca: ['multa trânsito nulidade CONTRAN', 'suspensão CNH defesa prévia', 'acidente trânsito responsabilidade civil', 'embriaguez volante recusa bafômetro', 'DPVAT indenização invalidez'],
  },
  'direito-desportivo': {
    title: 'Direito Desportivo',
    legislacao: [
      'Lei 9.615/1998 — Lei Pelé',
      'Lei 14.597/2023 — Lei Geral do Esporte',
      'Constituição Federal — Art. 217 (Desporto)',
      'Código Brasileiro de Justiça Desportiva (CBJD)',
      'Regulamentos FIFA/CBF',
    ],
    tribunais: ['STJD (Superior Tribunal de Justiça Desportiva)', 'TJD (Tribunais de Justiça Desportiva)', 'Justiça do Trabalho', 'STJ'],
    sumulas: ['Tema 123/STJ (Contrato de atleta profissional)'],
    termos_busca: ['contrato atleta profissional cláusula penal', 'transferência jogador mecanismo solidariedade', 'justiça desportiva punição', 'direito arena transmissão', 'dopagem suspensão WADA'],
  },
  'direito-digital': {
    title: 'Direito Digital',
    legislacao: [
      'Lei 13.709/2018 — LGPD (Lei Geral de Proteção de Dados)',
      'Lei 12.965/2014 — Marco Civil da Internet',
      'Decreto 8.771/2016 — Regulamentação do Marco Civil',
      'Lei 12.737/2012 — Lei Carolina Dieckmann (Crimes Informáticos)',
      'Lei 14.155/2021 — Fraude Digital e Estelionato Eletrônico',
    ],
    tribunais: ['STJ', 'STF', 'ANPD (Autoridade Nacional de Proteção de Dados)', 'Juizados Especiais'],
    sumulas: ['Tema 533/STJ (Responsabilidade de provedores)', 'Tema 987/STF (Direito ao esquecimento)'],
    termos_busca: ['violação dados pessoais LGPD ANPD', 'remoção conteúdo internet Marco Civil', 'crime cibernético invasão dispositivo', 'estelionato digital fraude eletrônica', 'proteção dados base legal consentimento'],
  },
  'direito-do-consumidor': {
    title: 'Direito do Consumidor',
    legislacao: [
      'Código de Defesa do Consumidor — Lei 8.078/1990',
      'Decreto 2.181/1997 — Organização do SNDC',
      'Lei 14.181/2021 — Superendividamento',
      'Lei 12.291/2010 — CDC em Estabelecimentos',
    ],
    tribunais: ['STJ (2ª Seção)', 'PROCON', 'Juizados Especiais Cíveis', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 297/STJ (CDC e bancos)', 'Súmula 359/STJ (Cadastros negativos)', 'Súmula 385/STJ (Inscrição prévia indevida)', 'Súmula 479/STJ (Responsabilidade bancária)', 'Súmula 532/STJ (CDC e plano de saúde)', 'Tema 952/STJ (Juros bancários)'],
    termos_busca: ['vício produto recall defeito', 'propaganda enganosa dano moral', 'negativação indevida SPC SERASA', 'plano de saúde negativa cobertura', 'superendividamento renegociação'],
  },
  'direito-do-trabalho': {
    title: 'Direito do Trabalho',
    legislacao: [
      'CLT — Consolidação das Leis do Trabalho (Decreto-Lei 5.452/1943)',
      'Constituição Federal — Arts. 7-11 (Direitos Sociais)',
      'Lei 13.467/2017 — Reforma Trabalhista',
      'Lei 5.889/1973 — Trabalho Rural',
      'NRs do MTE (Normas Regulamentadoras)',
    ],
    tribunais: ['TST (Tribunal Superior do Trabalho)', 'TRTs (Tribunais Regionais do Trabalho)', 'Varas do Trabalho'],
    sumulas: ['Súmula 443/TST (Dispensa discriminatória)', 'Súmula 331/TST (Terceirização)', 'Súmula 212/TST (Ônus da prova dispensa)', 'OJ-SDI1-383/TST (Pejotização)', 'Tema 1.046/STF (Negociação coletiva)'],
    termos_busca: ['vínculo empregatício pejotização', 'dispensa discriminatória reintegração', 'horas extras jornada trabalho', 'acidente trabalho estabilidade', 'assédio moral trabalhista indenização'],
  },
  'direito-economico': {
    title: 'Direito Econômico',
    legislacao: [
      'Constituição Federal — Arts. 170-181 (Ordem Econômica)',
      'Lei 12.529/2011 — Defesa da Concorrência (CADE)',
      'Lei 8.137/1990 — Crimes Contra a Ordem Econômica',
      'Lei 13.874/2019 — Lei da Liberdade Econômica',
    ],
    tribunais: ['CADE (Tribunal Administrativo de Defesa Econômica)', 'STJ', 'STF', 'Tribunais Regionais Federais'],
    sumulas: ['Tema 962/STF (Livre iniciativa e regulação)'],
    termos_busca: ['cartel formação preço CADE', 'abuso poder dominante concorrência', 'ato concentração fusão aprovação', 'ordem econômica intervenção estatal', 'livre concorrência prática predatória'],
  },
  'direito-eleitoral': {
    title: 'Direito Eleitoral',
    legislacao: [
      'Constituição Federal — Arts. 14-16 (Direitos Políticos)',
      'Código Eleitoral — Lei 4.737/1965',
      'Lei 9.504/1997 — Lei das Eleições',
      'Lei 9.096/1995 — Partidos Políticos',
      'Lei Complementar 64/1990 — Inelegibilidades (Lei da Ficha Limpa — LC 135/2010)',
    ],
    tribunais: ['TSE (Tribunal Superior Eleitoral)', 'TREs (Tribunais Regionais Eleitorais)', 'STF (controle)'],
    sumulas: ['Súmula 19/TSE (Propaganda antecipada)', 'Súmula 72/TSE (Militares e inelegibilidade)'],
    termos_busca: ['inelegibilidade ficha limpa LC 135', 'abuso poder econômico eleição', 'propaganda eleitoral irregular multa', 'cassação mandato impugnação', 'prestação contas partido rejeição'],
  },
  'direito-empresarial': {
    title: 'Direito Empresarial',
    legislacao: [
      'Código Civil — Livro II (Direito de Empresa)',
      'Lei 11.101/2005 — Recuperação Judicial e Falência (e Lei 14.112/2020 — Reforma)',
      'Lei 6.404/1976 — Sociedades por Ações (Lei das S.A.)',
      'Lei Complementar 123/2006 — Simples Nacional e ME/EPP',
      'Lei 11.795/2008 — Consórcios',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'Varas Empresariais', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 480/STJ (Desconsideração menor complexidade)', 'Súmula 581/STJ (Recuperação judicial e cessão de créditos)', 'Tema 1.051/STJ (Stay period)'],
    termos_busca: ['recuperação judicial plano credores', 'desconsideração personalidade jurídica', 'dissolução parcial sociedade', 'falência pedido crédito', 'contrato social alteração exclusão sócio'],
  },
  'direito-financeiro': {
    title: 'Direito Financeiro',
    legislacao: [
      'Constituição Federal — Arts. 163-169 (Finanças Públicas)',
      'Lei 4.320/1964 — Normas Gerais de Direito Financeiro',
      'Lei Complementar 101/2000 — Lei de Responsabilidade Fiscal (LRF)',
      'Lei 12.527/2011 — Lei de Acesso à Informação',
    ],
    tribunais: ['TCU (Tribunal de Contas da União)', 'TCEs (Tribunais de Contas Estaduais)', 'STF'],
    sumulas: ['Súmula Vinculante 3 (TCU e contraditório)', 'Tema 835/STF (Teto remuneratório e vantagens)'],
    termos_busca: ['responsabilidade fiscal LRF descumprimento', 'orçamento público crédito adicional', 'precatório RPV pagamento', 'controle externo TCU irregularidade', 'Lei 4.320 empenho liquidação'],
  },
  'direito-imobiliario': {
    title: 'Direito Imobiliário',
    legislacao: [
      'Código Civil — Direitos Reais (Arts. 1.196-1.510)',
      'Lei 8.245/1991 — Lei do Inquilinato',
      'Lei 4.591/1964 — Condomínio e Incorporações',
      'Lei 6.766/1979 — Parcelamento do Solo Urbano',
      'Lei 13.465/2017 — REURB (Regularização Fundiária)',
      'Lei 9.514/1997 — Alienação Fiduciária de Imóveis',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'Tribunais de Justiça Estaduais', 'Varas Cíveis'],
    sumulas: ['Súmula 76/STJ (Art. 4 Lei Inquilinato)', 'Súmula 549/STJ (Alienação fiduciária e leilão)', 'Tema 1.095/STJ (Usucapião tabular)'],
    termos_busca: ['despejo locação comercial renovatória', 'usucapião urbano rural requisitos', 'incorporação imobiliária atraso entrega', 'alienação fiduciária imóvel execução', 'condomínio taxa inadimplência cobrança'],
  },
  'direito-indigena': {
    title: 'Direito Indígena',
    legislacao: [
      'Constituição Federal — Arts. 231-232 (Dos Índios)',
      'Estatuto do Índio — Lei 6.001/1973',
      'Convenção 169 da OIT (Povos Indígenas)',
      'Declaração da ONU sobre Direitos dos Povos Indígenas (2007)',
    ],
    tribunais: ['STF (demarcação de terras)', 'TRFs', 'Justiça Federal (1ª instância)'],
    sumulas: ['Tema 1.031/STF (Marco Temporal — Lei 14.701/2023)', 'Súmula 650/STF (Terras indígenas e aldeamentos extintos)'],
    termos_busca: ['demarcação terra indígena FUNAI', 'marco temporal posse imemorial', 'consulta prévia livre informada OIT 169', 'proteção comunidades tradicionais', 'tutela direitos indígenas MPF'],
  },
  'direito-internacional': {
    title: 'Direito Internacional',
    legislacao: [
      'Constituição Federal — Art. 4 (Princípios de Relações Internacionais)',
      'Convenção de Viena sobre Direito dos Tratados (1969)',
      'Carta da ONU',
      'Protocolo de Cooperação e Assistência Jurisdicional do MERCOSUL',
      'Decreto 3.413/2000 — Convenção de Haia sobre Sequestro Internacional de Crianças',
    ],
    tribunais: ['STF (homologação de sentenças estrangeiras)', 'STJ (cooperação jurídica internacional)', 'Corte Internacional de Justiça (CIJ)', 'Corte Interamericana de Direitos Humanos'],
    sumulas: ['Tema 944/STJ (Homologação sentença estrangeira arbitral)'],
    termos_busca: ['homologação sentença estrangeira exequatur', 'cooperação jurídica internacional tratado', 'extradição requisitos STF', 'arbítrio internacional convenção', 'sequestro internacional criança Haia'],
  },
  'direito-maritimo': {
    title: 'Direito Marítimo',
    legislacao: [
      'Código Comercial — Parte II (Do Comércio Marítimo)',
      'Lei 7.652/1988 — Registro de Embarcações',
      'Convenção de Hamburgo (1978) — Transporte Marítimo de Mercadorias',
      'NORMAM (Normas da Marinha)',
      'Lei 9.537/1997 — Segurança do Tráfego Aquaviário (LESTA)',
    ],
    tribunais: ['Tribunal Marítimo (TM)', 'Justiça Federal', 'STJ'],
    sumulas: ['Súmula 151/STF (Prescrição transporte marítimo)'],
    termos_busca: ['avaria grossa particular marítimo', 'frete marítimo demurrage', 'tribunal marítimo acidente navegação', 'responsabilidade transportador mercadoria', 'seguro marítimo indenização naufrágio'],
  },
  'direito-medico-e-da-saude': {
    title: 'Direito Médico e da Saúde',
    legislacao: [
      'Constituição Federal — Arts. 196-200 (Saúde)',
      'Lei 8.080/1990 — SUS (Lei Orgânica da Saúde)',
      'Lei 9.656/1998 — Planos de Saúde',
      'Código de Ética Médica (Resolução CFM 2.217/2018)',
      'Lei 13.989/2020 — Telemedicina',
    ],
    tribunais: ['STJ (2ª Seção — Planos de Saúde)', 'Conselhos de Medicina (CRM/CFM)', 'Juizados Especiais', 'ANS (Agência Nacional de Saúde Suplementar)'],
    sumulas: ['Súmula 469/STJ (CDC e plano de saúde)', 'Súmula 597/STJ (Cláusula de coparticipação)', 'Tema 990/STJ (Taxa de saúde suplementar reajuste)', 'Tema 952/STJ (Rol da ANS)'],
    termos_busca: ['erro médico responsabilidade civil', 'plano saúde negativa cobertura ANS', 'reajuste plano saúde idoso abusivo', 'medicamento alto custo SUS fornecimento', 'cirurgia urgência autorização plano'],
  },
  'direito-militar': {
    title: 'Direito Militar',
    legislacao: [
      'Código Penal Militar — Decreto-Lei 1.001/1969',
      'Código de Processo Penal Militar — Decreto-Lei 1.002/1969',
      'Estatuto dos Militares — Lei 6.880/1980',
      'Lei 13.491/2017 — Competência da Justiça Militar',
    ],
    tribunais: ['STM (Superior Tribunal Militar)', 'Tribunais de Justiça Militar (TJM)', 'Auditorias Militares'],
    sumulas: ['Súmula 721/STF (Competência do Tribunal do Júri e Justiça Militar)', 'Súmula Vinculante 36 (Competência militar)'],
    termos_busca: ['crime militar próprio impróprio', 'deserção transgressão disciplinar', 'conselho de justificação exclusão', 'reforma militar invalidez', 'competência justiça militar crime'],
  },
  'direito-notarial-e-registral': {
    title: 'Direito Notarial e Registral',
    legislacao: [
      'Lei 6.015/1973 — Registros Públicos',
      'Lei 8.935/1994 — Serviços Notariais e de Registro',
      'Lei 7.433/1985 — Requisitos para Escritura Pública',
      'Provimentos da Corregedoria Nacional de Justiça',
    ],
    tribunais: ['Corregedoria Nacional de Justiça (CNJ)', 'Corregedorias Estaduais', 'STJ'],
    sumulas: ['Súmula 239/STJ (Cartório e responsabilidade)', 'Provimento 63/CNJ (Registro de nascimento)'],
    termos_busca: ['registro imóvel matrícula retificação', 'escritura pública autenticidade', 'usucapião extrajudicial cartório', 'reconhecimento paternidade cartório', 'ata notarial prova digital'],
  },
  'direito-penal': {
    title: 'Direito Penal',
    legislacao: [
      'Código Penal — Decreto-Lei 2.848/1940',
      'Lei 11.343/2006 — Lei de Drogas',
      'Lei 8.072/1990 — Crimes Hediondos',
      'Lei 12.850/2013 — Organizações Criminosas',
      'Lei 11.340/2006 — Lei Maria da Penha',
      'Lei 9.099/1995 — JECRIM',
    ],
    tribunais: ['STF (HC e RHC)', 'STJ (5ª e 6ª Turmas — Direito Penal)', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula Vinculante 11 (Uso de algemas)', 'Súmula 545/STJ (Absolvição imprópria)', 'Súmula 231/STJ (Atenuante abaixo do mínimo)', 'Súmula 444/STJ (IPL e maus antecedentes)', 'Tema 1.087/STF (Execução provisória após Júri)'],
    termos_busca: ['habeas corpus prisão preventiva ilegal', 'dosimetria pena circunstâncias judiciais', 'tráfico drogas privilegiado requisitos', 'legítima defesa excludente', 'audiência custódia ilegalidade prisão'],
  },
  'direito-previdenciario': {
    title: 'Direito Previdenciário',
    legislacao: [
      'Constituição Federal — Arts. 201-204 (Previdência Social)',
      'Lei 8.213/1991 — Planos de Benefícios da Previdência Social',
      'Lei 8.212/1991 — Custeio da Seguridade Social',
      'EC 103/2019 — Reforma da Previdência',
      'Decreto 3.048/1999 — Regulamento da Previdência Social',
    ],
    tribunais: ['STJ', 'STF', 'TNU (Turma Nacional de Uniformização dos JEFs)', 'Juizados Especiais Federais'],
    sumulas: ['Tema 1.012/STJ (Período de graça)', 'Tema 999/STJ (Conversão tempo especial)', 'Súmula 149/STJ (Competência JEF previdenciário)'],
    termos_busca: ['aposentadoria especial atividade insalubre', 'benefício por incapacidade auxílio-doença', 'revisão da vida toda cálculo', 'pensão por morte dependentes', 'LOAS BPC salário mínimo critério'],
  },
  'direito-processal-civil': {
    title: 'Direito Processual Civil',
    legislacao: [
      'Código de Processo Civil — Lei 13.105/2015',
      'Lei 9.099/1995 — Juizados Especiais Cíveis',
      'Lei 7.347/1985 — Ação Civil Pública',
      'Lei 12.016/2009 — Mandado de Segurança',
    ],
    tribunais: ['STJ (Recurso Especial)', 'STF (Recurso Extraordinário)', 'Todos os tribunais'],
    sumulas: ['Súmula 7/STJ (Reexame de prova)', 'Súmula 83/STJ (Jurisprudência dominante)', 'Tema 988/STJ (IRDR e precedentes)', 'Tema 1.076/STJ (Honorários sucumbenciais)'],
    termos_busca: ['tutela antecipada urgência evidência', 'cumprimento sentença penhora', 'embargos execução título extrajudicial', 'agravo instrumento hipótese cabimento', 'prescrição intercorrente processo civil'],
  },
  'direito-processal-do-trabalho': {
    title: 'Direito Processual do Trabalho',
    legislacao: [
      'CLT — Processo do Trabalho (Arts. 643-910)',
      'Lei 5.584/1970 — Assistência Judiciária Trabalhista',
      'Instrução Normativa 41/2018 TST — Reforma Trabalhista Processual',
      'CPC/2015 aplicável subsidiariamente (Art. 769 CLT)',
    ],
    tribunais: ['TST', 'TRTs', 'Varas do Trabalho'],
    sumulas: ['Súmula 219/TST (Honorários)", Súmula 331/TST (Terceirização responsabilidade)', 'Súmula 392/TST (Dano moral trabalhista)', 'OJ-SDI2-142 (Mandado de segurança trabalhista)'],
    termos_busca: ['reclamação trabalhista petição inicial', 'execução trabalhista penhora BACENJUD', 'recurso ordinário trabalhista prazo', 'audiência trabalhista instrução', 'acordo trabalhista homologação'],
  },
  'direito-processal-militar': {
    title: 'Direito Processual Militar',
    legislacao: [
      'Código de Processo Penal Militar — Decreto-Lei 1.002/1969',
      'Lei 13.491/2017 — Competência da Justiça Militar Federal',
      'Regimento Interno do STM',
    ],
    tribunais: ['STM (Superior Tribunal Militar)', 'Auditorias Militares', 'TJM Estaduais'],
    sumulas: ['Súmula 9/STM (Competência JMU)', 'Súmula 721/STF'],
    termos_busca: ['inquérito policial militar IPM', 'processo penal militar rito', 'competência justiça militar federal estadual', 'menagem prisão militar', 'recurso criminal militar prazo'],
  },
  'direito-processal-penal': {
    title: 'Direito Processual Penal',
    legislacao: [
      'Código de Processo Penal — Decreto-Lei 3.689/1941',
      'Constituição Federal — Art. 5, LIV-LXXVIII (Garantias Processuais)',
      'Lei 12.850/2013 — Colaboração Premiada',
      'Lei 11.719/2008 — Reforma do CPP (Procedimentos)',
      'Pacote Anticrime — Lei 13.964/2019',
    ],
    tribunais: ['STF (HC originário)', 'STJ (5ª e 6ª Turmas)', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula Vinculante 14 (Acesso aos autos do inquérito)', 'Súmula 347/STJ (Competência pelo lugar da infração)', 'Tema 1.068/STF (Acordo de não persecução penal)', 'Súmula 523/STF (Deficiência de defesa e nulidade)'],
    termos_busca: ['habeas corpus liberdade prisão', 'acordo não persecução penal ANPP', 'prova ilícita exclusão processo', 'audiência custódia prazo CPP', 'júri popular quesitação sentença'],
  },
  'direito-securitario': {
    title: 'Direito Securitário',
    legislacao: [
      'Código Civil — Arts. 757-802 (Seguros)',
      'Decreto-Lei 73/1966 — Sistema Nacional de Seguros',
      'Lei 6.194/1974 — Seguro DPVAT',
      'Resoluções CNSP (Conselho Nacional de Seguros Privados)',
      'Circulares SUSEP',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'SUSEP (Superintendência de Seguros Privados)', 'Tribunais de Justiça Estaduais'],
    sumulas: ['Súmula 465/STJ (DPVAT parcelas)', 'Súmula 529/STJ (Seguro e risco agravado)', 'Súmula 537/STJ (Início da prescrição seguro)'],
    termos_busca: ['seguro recusa pagamento sinistro', 'DPVAT invalidez indenização', 'contrato seguro exclusão cobertura', 'prescrição seguro início prazo', 'regulação sinistro prazo SUSEP'],
  },
  'direito-sindical': {
    title: 'Direito Sindical',
    legislacao: [
      'Constituição Federal — Arts. 8-11 (Organização Sindical)',
      'CLT — Título V (Da Organização Sindical)',
      'Lei 11.648/2008 — Centrais Sindicais',
      'Convenções OIT 87 (Liberdade Sindical) e 98 (Direito de Negociação)',
    ],
    tribunais: ['TST', 'TRTs', 'STF (unicidade sindical)'],
    sumulas: ['Súmula 677/STF (Contribuição sindical)', 'Súmula Vinculante 40 (Contribuição confederativa)', 'Precedente Normativo 119/TST (Greve)'],
    termos_busca: ['contribuição sindical obrigatória reforma', 'enquadramento sindical categoria', 'negociação coletiva convenção acordo', 'greve direito exercício limites', 'representatividade sindical legitimidade'],
  },
  'direito-societario': {
    title: 'Direito Societário',
    legislacao: [
      'Código Civil — Arts. 981-1.141 (Sociedades)',
      'Lei 6.404/1976 — Sociedades por Ações',
      'Lei Complementar 123/2006 — ME/EPP',
      'Instrução CVM 480 — Companhias Abertas',
    ],
    tribunais: ['STJ (3ª e 4ª Turmas)', 'CVM (Comissão de Valores Mobiliários)', 'Varas Empresariais'],
    sumulas: ['Súmula 430/STJ (Ação de dissolução)', 'Tema 570/STJ (Apuração de haveres)'],
    termos_busca: ['dissolução parcial sociedade quotas', 'exclusão sócio minoritário majoritário', 'apuração haveres balanço determinação', 'acordo acionistas vinculação', 'conflito sócios administração societária'],
  },
  'direito-tributario': {
    title: 'Direito Tributário',
    legislacao: [
      'Código Tributário Nacional — Lei 5.172/1966',
      'Constituição Federal — Arts. 145-162 (Sistema Tributário)',
      'EC 132/2023 — Reforma Tributária (IBS e CBS)',
      'Lei Complementar 87/1996 — Lei Kandir (ICMS)',
      'Lei 9.430/1996 — Legislação Tributária Federal',
    ],
    tribunais: ['STF (ADIs tributárias)', 'STJ (1ª e 2ª Turmas)', 'CARF (Conselho Administrativo de Recursos Fiscais)', 'TIT-SP'],
    sumulas: ['Súmula Vinculante 24 (Crime tributário e constituição definitiva)', 'Súmula Vinculante 28 (Depósito prévio)', 'Súmula 166/STJ (ICMS mera circulação)', 'Tema 69/STF (Exclusão ICMS base PIS/COFINS)', 'Tema 962/STF (Contribuições intermediárias)'],
    termos_busca: ['exclusão ICMS base PIS COFINS', 'mandado segurança tributário liminar', 'execução fiscal exceção pré-executividade', 'planejamento tributário elisão evasão', 'CARF auto infração defesa'],
  },
  'direito-urbanistico': {
    title: 'Direito Urbanístico',
    legislacao: [
      'Constituição Federal — Arts. 182-183 (Política Urbana)',
      'Estatuto da Cidade — Lei 10.257/2001',
      'Lei 6.766/1979 — Parcelamento do Solo Urbano',
      'Lei 13.465/2017 — REURB',
      'Lei 11.977/2009 — Minha Casa Minha Vida (urbanização)',
    ],
    tribunais: ['STF', 'STJ', 'Tribunais de Justiça Estaduais', 'Prefeituras (contencioso administrativo)'],
    sumulas: ['Tema 1.010/STJ (IPTU e função social)', 'Tema 348/STF (Competência municipal)'],
    termos_busca: ['plano diretor município função social', 'usucapião urbano Estatuto Cidade', 'regularização fundiária REURB', 'loteamento irregular responsabilidade', 'zoneamento embargo obra irregular'],
  },
  'direitos-humanos': {
    title: 'Direitos Humanos',
    legislacao: [
      'Declaração Universal dos Direitos Humanos (1948)',
      'Constituição Federal — Título II (Direitos e Garantias Fundamentais)',
      'Pacto de San José da Costa Rica (Convenção Americana de DH)',
      'Pacto Internacional sobre Direitos Civis e Políticos (PIDCP)',
      'Lei 13.146/2015 — Estatuto da Pessoa com Deficiência',
    ],
    tribunais: ['STF', 'Corte Interamericana de Direitos Humanos (CIDH)', 'Comissão Interamericana de DH', 'Comitês da ONU'],
    sumulas: ['Tema 944/STF (Tratados de DH e supralegalidade)', 'ADPF 153/STF (Lei de Anistia)'],
    termos_busca: ['violação direitos humanos Estado responsabilidade', 'tortura tratamento degradante', 'discriminação racial gênero orientação', 'refugiados proteção asilo', 'sistema interamericano petição CIDH'],
  },
};

let updatedCount = 0;

for (const [folder, data] of Object.entries(KNOWLEDGE)) {
  const agentFile = path.join(AGENTS_DIR, folder, 'AGENT.md');
  if (!fs.existsSync(agentFile)) {
    console.log(`⚠️  ${folder} — file not found`);
    continue;
  }

  let content = fs.readFileSync(agentFile, 'utf8');

  // Check if already has specialized knowledge
  if (content.includes('## Conhecimento Especializado')) {
    console.log(`⏭️  ${folder} — already has knowledge`);
    continue;
  }

  const knowledgeBlock = `

## Conhecimento Especializado — ${data.title}

### 📜 Legislação-Chave
${data.legislacao.map(l => `- ${l}`).join('\n')}

### 🏛️ Tribunais e Órgãos Prioritários
${data.tribunais.map(t => `- ${t}`).join('\n')}

### 📌 Súmulas, Temas e Precedentes Relevantes
${data.sumulas.map(s => `- ${s}`).join('\n')}

### 🔍 Termos de Busca Otimizados para \`conectese-scraper\`
${data.termos_busca.map(t => `\`${t}\``).join(' · ')}
`;

  content = content.trimEnd() + knowledgeBlock;
  fs.writeFileSync(agentFile, content, 'utf8');
  updatedCount++;
  console.log(`✅ ${folder}`);
}

console.log(`\n🏁 Knowledge added to ${updatedCount} agents`);
