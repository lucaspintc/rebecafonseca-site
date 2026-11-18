/* Dados fixos da marca, locais de atendimento e propostas iniciais de conteúdo.
   Tudo aqui pode ser alterado depois em Gestão > Configurações. */
window.RF = window.RF || {};

RF.marca = {
  nome: 'Rebeca Fonseca',
  nomeCompleto: 'Rebeca H. Fonseca Ferreira',
  profissao: 'Fonoaudióloga',
  crfa: 'CRFa 4-15570',
  whatsapp: '5575983678360',
  whatsappTexto: '(75) 98367-8360',
  email: 'rebecaffs@outlook.com',
  instagram: 'rebecafonsca.fono',
  tiktok: 'rebecafonsca',
  msgAgenda: 'Olá, tudo bem? Desejo um horário na agenda da Fono Rebeca Fonseca. Tem disponibilidade?'
};

RF.formacao = [
  { titulo: 'Graduação em Fonoaudiologia', inst: 'Universidade Federal da Bahia (UFBA)', tipo: 'Formação' },
  { titulo: 'Pós-graduação em Linguagem Infantil', inst: 'Focus', tipo: 'Pós-graduação' },
  { titulo: 'PROMPT — Prompts for Restructuring Oral Muscular Phonetic Targets', inst: 'PROMPT Institute', tipo: 'Especialização' },
  { titulo: 'CAA / PODD — Placas Dinâmicas com Organização Pragmática', inst: 'Comunicação Aumentativa e Alternativa', tipo: 'Especialização' },
  { titulo: 'Teste da Linguinha — avaliação do frênulo lingual', inst: 'Protocolo de avaliação do frênulo da língua em bebês', tipo: 'Especialização' }
];

RF.sobre = {
  titulo: 'Cada criança tem um jeito de se comunicar. O meu trabalho é ajudar a família a encontrar esse caminho junto com ela.',
  paragrafos: [
    'Sou a Rebeca, fonoaudióloga formada pela Universidade Federal da Bahia e registrada no CRFa sob o número 4-15570. Escolhi a linguagem infantil porque é ali, nos primeiros anos, que uma palavra, um gesto ou um olhar compartilhado muda a forma como a criança se relaciona com o mundo.',
    'Sou pós-graduada em Linguagem Infantil pela Focus e me especializei em três abordagens que uso todos os dias: o método PROMPT, pelo PROMPT Institute, que trabalha a fala pelo toque e pelo movimento; a Comunicação Aumentativa e Alternativa com PODD, para que crianças que ainda não falam (ou falam pouco) tenham voz desde já; e o Teste da Linguinha, que avalia o frênulo da língua dos bebês e protege a amamentação.',
    'Muitas mães chegam até mim com o coração apertado: "será que é normal ele ainda não falar?", "será que eu fiz algo errado?". Atendo muitas crianças atípicas e sei o peso dessas perguntas. Por isso, no meu consultório, a família participa de tudo: entende o que estamos trabalhando, recebe orientações para casa e acompanha cada passo pelos relatórios e recados aqui no portal.',
    'Fora das sessões, gosto de mostrar a rotina real de quem trabalha com criança, com cuidado, organização e um olhar atento para a forma como a gente se apresenta. Comunicação também é postura.'
  ]
};

/* Locais de atendimento: dados confirmados no Google Maps em 08/11/2026.
   E-mail das clínicas: preencher em Gestão > Configurações quando confirmado. */
RF.locais = [
  {
    id: 'berimbau', nome: 'Clínica da Família Berimbau', cidade: 'Conceição do Jacuípe',
    endereco: 'R. Tucides Moraes, 78 — Centro, Conceição do Jacuípe — BA, 44245-000',
    tel: '(75) 98178-9930', whatsapp: '5575981789930', email: '',
    maps: 'https://maps.app.goo.gl/4n4aYe4c78cw27R8A', lat: -12.3283803, lng: -38.7657187,
    dias: [{ d: 1, turno: 'Dia todo' }, { d: 5, turno: 'Tarde' }]
  },
  {
    id: 'neuro1', nome: 'Clínica Neuro Infância I', cidade: 'Feira de Santana',
    endereco: 'R. Profa. Edelvira de Oliveira, 1642 — Centro, Feira de Santana — BA, 44051-754',
    tel: '(75) 3022-9128', whatsapp: '557530229128', email: '',
    maps: 'https://maps.app.goo.gl/oXpsfHxoeTkGuqmm8', lat: -12.2501253, lng: -38.9575856,
    dias: [{ d: 2, turno: 'Dia todo' }, { d: 4, turno: 'Dia todo' }]
  },
  {
    id: 'neuro3', nome: 'Clínica Neuro Infância III', cidade: 'Feira de Santana',
    endereco: 'R. Domingos Barbosa de Araújo, 487 — Centro, Feira de Santana — BA, 44001-280',
    tel: '(75) 3301-7162', whatsapp: '557533017162', email: '',
    maps: 'https://maps.app.goo.gl/K8rPF2faRd1cLbN49', lat: -12.2530253, lng: -38.9581922,
    dias: [{ d: 3, turno: 'Dia todo' }]
  },
  {
    id: 'centclin', nome: 'Clínica CentClin', cidade: 'Irará',
    endereco: 'R. Alan Kardec, 98 — Centro, Irará — BA, 44255-000',
    tel: '(75) 98176-6422', whatsapp: '5575981766422', email: '',
    maps: 'https://maps.app.goo.gl/zrkHkexLgh1u1DSX9', lat: -12.0409526, lng: -38.7660101,
    dias: [{ d: 5, turno: 'Manhã' }, { d: 6, turno: 'Dia todo' }]
  }
];
RF.cidades = ['Feira de Santana', 'Conceição do Jacuípe', 'Irará'];
RF.diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/* Marcos de comunicação (CDC/AAP, revisão 2022 — Zubler et al., Pediatrics 2022).
   Os marcos representam o que 75% ou mais das crianças já fazem naquela idade. */
RF.marcos = [
  { idade: '12 meses', itens: ['Acena “tchau”', 'Chama os pais de “mamã” ou “papá” (ou outro nome especial)', 'Entende o “não” (pausa por um instante)'] },
  { idade: '18 meses', itens: ['Tenta dizer três ou mais palavras além de “mamã” e “papá”', 'Segue ordens de um passo sem gestos, como “me dá o brinquedo”', 'Aponta para mostrar algo que quer'] },
  { idade: '2 anos', itens: ['Junta pelo menos duas palavras, como “mais leite”', 'Aponta figuras no livro quando você pergunta', 'Usa gestos além de acenar e apontar, como mandar beijo ou balançar a cabeça para “sim”'] },
  { idade: '30 meses', itens: ['Fala cerca de 50 palavras', 'Junta duas ou mais palavras com uma ação, como “cachorro corre”', 'Nomeia coisas no livro quando você aponta e pergunta'] },
  { idade: '3 anos', itens: ['Conversa com você com pelo menos duas trocas de fala', 'Faz perguntas como “quem”, “o quê”, “onde” ou “por quê”', 'Fala bem o suficiente para outras pessoas entenderem na maior parte do tempo'] }
];

/* Pilares editoriais do perfil */
RF.pilares = {
  desenvolvimento: { nome: 'Desenvolvimento & marcos', cor: 'sage' },
  amamentacao: { nome: 'Amamentação & bebês', cor: 'rose' },
  atipicos: { nome: 'CAA & crianças atípicas', cor: 'olive' },
  dicas: { nome: 'Dicas para casa', cor: 'sage' },
  rotina: { nome: 'Rotina & bastidores', cor: 'terra' },
  looks: { nome: 'Looks & posicionamento', cor: 'terra' }
};

/* Janelas de melhor horário (horário local, Brasília).
   Instagram: Sprout Social 2026, setor saúde (dias úteis, fins de semana mais fracos),
   com um horário noturno de teste para mães (após as crianças dormirem).
   TikTok: Buffer 2026 (7 milhões de posts). Substituídos pelos dados reais
   do perfil quando a integração de métricas estiver conectada. */
RF.melhoresHorarios = {
  instagram: [
    { d: 1, h: '12:30' }, { d: 1, h: '20:30' }, { d: 2, h: '11:30' }, { d: 3, h: '12:00' },
    { d: 3, h: '20:30' }, { d: 4, h: '11:30' }, { d: 5, h: '11:00' }
  ],
  tiktok: [
    { d: 0, h: '09:00' }, { d: 1, h: '13:00' }, { d: 2, h: '22:00' }, { d: 3, h: '22:00' },
    { d: 4, h: '13:00' }, { d: 5, h: '18:00' }, { d: 6, h: '17:00' }
  ],
  fontes: [
    { t: 'Sprout Social — Best times to post on Instagram (atualizado em março de 2026)', u: 'https://sproutsocial.com/insights/best-times-to-post-on-instagram/' },
    { t: 'Buffer — The best time to post on TikTok in 2026 (7 milhões de posts)', u: 'https://buffer.com/resources/best-time-to-post-on-tiktok' },
    { t: 'Buffer — How the Instagram algorithm works (2026): tempo de exibição, curtidas e envios por alcance', u: 'https://buffer.com/resources/instagram-algorithms/' }
  ]
};

/* Propostas iniciais de conteúdo — escritas a partir de fontes institucionais e científicas.
   Status inicial: aguardando aprovação. */
RF.propostasIniciais = [
  {
    id: 'c-marcos-2anos', formato: 'carrossel', rede: 'instagram', pilar: 'desenvolvimento',
    titulo: 'Meu filho tem 2 anos e ainda não junta palavras. É normal?',
    gancho: 'Se você já se fez essa pergunta, este post é para você.',
    slides: [
      'Meu filho tem 2 anos e ainda não junta palavras. É normal?',
      'Aos 2 anos, a maioria das crianças já junta duas palavras: “mais água”, “papai foi”.',
      'Aos 18 meses, a maioria já tenta dizer 3 ou mais palavras além de “mamã” e “papá”.',
      'Esses marcos mostram o que 75% das crianças já fazem. Não é a média: é um sinal para agir cedo.',
      'Não junta palavras aos 2 anos? Procure avaliação fonoaudiológica. Esperar “o tempo dele” pode atrasar a ajuda.',
      'Salve este post e envie para aquela mãe que está com essa dúvida.'
    ],
    legenda: 'A pergunta que mais escuto no consultório. Os marcos do CDC foram revisados em 2022 e hoje mostram o que 75% das crianças já fazem em cada idade, ou seja: se seu filho ainda não chegou lá, vale avaliar agora, sem culpa e sem esperar. Me conta nos comentários a idade do seu pequeno.',
    hashtags: '#fonoaudiologia #fonoinfantil #desenvolvimentoinfantil #atrasodefala #feiradesantana',
    fontes: [
      { t: 'Zubler JM et al. Evidence-Informed Milestones for Developmental Surveillance Tools. Pediatrics. 2022;149(3):e2021052138.', u: 'https://doi.org/10.1542/peds.2021-052138' },
      { t: 'CDC — Learn the Signs. Act Early. Marcos dos 2 anos.', u: 'https://www.cdc.gov/ncbddd/actearly/milestones/milestones-2yr.html' }
    ]
  },
  {
    id: 'c-linguinha-lei', formato: 'reels', rede: 'instagram', pilar: 'amamentacao',
    titulo: 'Teste da Linguinha: o que é e por que é lei',
    gancho: 'Seu bebê fez o Teste da Linguinha na maternidade? Ele é obrigatório por lei.',
    roteiro: [
      '0–3s (texto na tela): “Teste da Linguinha é lei desde 2014”',
      'O que é: uma avaliação do frênulo da língua, aquela “cordinha” embaixo dela.',
      'Por que importa: quando o frênulo limita o movimento da língua, a pega na amamentação pode ficar difícil, com dor para a mãe e cansaço rápido no bebê.',
      'A Lei 13.002/2014 tornou obrigatória a aplicação do protocolo de avaliação do frênulo em bebês nas maternidades e hospitais.',
      'CTA: “Não sabe se o seu bebê fez? Me chama no WhatsApp que eu te explico.”'
    ],
    legenda: 'Língua presa pode atrapalhar a amamentação e, mais tarde, alguns movimentos da fala. A avaliação é rápida e protege o começo da vida do seu bebê. Marque aqui uma gestante que precisa saber disso.',
    hashtags: '#testedalinguinha #amamentacao #linguapresa #frenulolingual #fonoaudiologia',
    fontes: [
      { t: 'Lei nº 13.002, de 20 de junho de 2014 — obriga a realização do Protocolo de Avaliação do Frênulo da Língua em Bebês.', u: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l13002.htm' }
    ]
  },
  {
    id: 'c-telas', formato: 'card', rede: 'instagram', pilar: 'dicas',
    titulo: 'Telas antes dos 2 anos: o que dizem os pediatras',
    gancho: 'Antes dos 2 anos: nada de telas. Dos 2 aos 5: no máximo 1 hora por dia, com um adulto junto.',
    slides: ['Antes dos 2 anos: evitar telas. Dos 2 aos 5 anos: até 1 hora por dia, sempre com supervisão.'],
    legenda: 'Não é sobre culpa, é sobre trocar tempo de tela por tempo de conversa. Cada minuto de brincadeira cara a cara é linguagem acontecendo. Recomendação da Sociedade Brasileira de Pediatria.',
    hashtags: '#tempodetela #desenvolvimentoinfantil #fonoinfantil #maternidadereal',
    fontes: [
      { t: 'Sociedade Brasileira de Pediatria. Manual de Orientação #MenosTelas #MaisSaúde, 2019.', u: 'https://www.sbp.com.br/' }
    ]
  },
  {
    id: 'c-caa-mito', formato: 'reels', rede: 'instagram', pilar: 'atipicos',
    titulo: 'Usar CAA não impede a criança de falar',
    gancho: '“Se eu der a prancha, ele vai ficar preguiçoso para falar.” Mito.',
    roteiro: [
      '0–3s: Rebeca segurando uma prancha de comunicação. Texto: “CAA atrapalha a fala?”',
      'Os estudos mostram o contrário: a Comunicação Aumentativa e Alternativa não atrapalha o desenvolvimento da fala, e em muitos casos ajuda.',
      'Uma revisão sistemática (Millar, Light e Schlosser, 2006) não encontrou nenhum caso de perda de fala após a CAA, e a maioria das crianças teve ganhos.',
      'A prancha dá voz agora, enquanto a fala ainda está se construindo.',
      'CTA: “Quer saber se a CAA é para o seu filho? Comenta CAA que eu te respondo.”'
    ],
    legenda: 'Para as mães de crianças atípicas: comunicação vem antes da fala. Dar um meio de se expressar diminui a frustração e abre caminho para a fala. Envie para quem precisa ouvir isso hoje.',
    hashtags: '#caa #comunicacaoalternativa #autismo #maeatipica #podd #fonoaudiologia',
    fontes: [
      { t: 'Millar DC, Light JC, Schlosser RW. The impact of AAC intervention on the speech production of individuals with developmental disabilities. J Speech Lang Hear Res. 2006;49(2):248-264.', u: 'https://doi.org/10.1044/1092-4388(2006/021)' },
      { t: 'ASHA Practice Portal — Augmentative and Alternative Communication.', u: 'https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/' }
    ]
  },
  {
    id: 'c-amamentacao-fala', formato: 'carrossel', rede: 'instagram', pilar: 'amamentacao',
    titulo: 'Amamentação e fala: qual é a relação?',
    gancho: 'A boca que mama é a mesma que vai falar.',
    slides: [
      'Amamentação e fala: qual é a relação?',
      'Ao mamar no peito, o bebê usa lábios, língua e bochechas de forma coordenada.',
      'Esse exercício ajuda no desenvolvimento da musculatura da boca, que depois participa da mastigação e da fala.',
      'A recomendação: leite materno exclusivo até os 6 meses e continuado até os 2 anos ou mais.',
      'Dificuldade na pega, dor ou bebê que cansa rápido? Uma avaliação pode ajudar.'
    ],
    legenda: 'Amamentar vai além de nutrir. Se está difícil, você não precisa passar por isso sozinha: procure ajuda especializada.',
    hashtags: '#amamentacao #aleitamentomaterno #motricidadeorofacial #fono #bebe',
    fontes: [
      { t: 'Ministério da Saúde. Guia Alimentar para Crianças Brasileiras Menores de 2 Anos, 2019.', u: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_da_crianca_2019.pdf' },
      { t: 'Organização Mundial da Saúde — Breastfeeding (recomendações).', u: 'https://www.who.int/health-topics/breastfeeding' }
    ]
  },
  {
    id: 'c-mchat', formato: 'carrossel', rede: 'instagram', pilar: 'atipicos',
    titulo: 'Sinais de comunicação que merecem atenção entre 12 e 24 meses',
    gancho: 'Ele não aponta, não atende pelo nome, não mostra as coisas para você?',
    slides: [
      'Sinais de comunicação que merecem atenção entre 12 e 24 meses',
      'Não aponta para mostrar algo que quer ou que acha interessante.',
      'Não atende quando é chamado pelo nome, mesmo ouvindo bem.',
      'Não traz objetos para te mostrar e quase não busca o seu olhar.',
      'A Sociedade Brasileira de Pediatria recomenda a triagem M-CHAT-R/F entre 18 e 24 meses.',
      'Notou algum desses sinais? Converse com o pediatra e procure avaliação. Intervir cedo faz diferença.'
    ],
    legenda: 'Informação não é diagnóstico, e ninguém melhor do que você para perceber seu filho. Se algo te preocupa, a avaliação precoce é sempre o melhor caminho.',
    hashtags: '#autismo #tea #sinaisdeautismo #intervencaoprecoce #fonoinfantil',
    fontes: [
      { t: 'Sociedade Brasileira de Pediatria. Manual de Orientação — Transtorno do Espectro do Autismo, 2019.', u: 'https://www.sbp.com.br/' },
      { t: 'Robins DL et al. Validation of the M-CHAT-R/F. Pediatrics. 2014;133(1):37-45.', u: 'https://doi.org/10.1542/peds.2013-1813' }
    ]
  },
  {
    id: 'c-leitura', formato: 'video', rede: 'tiktok', pilar: 'dicas',
    titulo: '3 jeitos de ler para o seu filho que estimulam a fala',
    gancho: 'Você não precisa ler o livro inteiro. Faça isso:',
    roteiro: [
      '0–2s: “Pare de ler o livro inteiro para o seu filho.”',
      '1) Aponte e nomeie: “Olha o cachorro! Au-au!”',
      '2) Espere: faça uma pausa e dê tempo para a criança completar ou apontar.',
      '3) Expanda: se ele disse “bola”, você diz “bola vermelha”.',
      'Leitura compartilhada desde bebê é recomendada pela Academia Americana de Pediatria.',
      'CTA: “Salva e testa hoje antes de dormir.”'
    ],
    legenda: 'Leitura compartilhada é uma das formas mais simples de estimular a linguagem em casa.',
    hashtags: '#fonoaudiologia #leituracompartilhada #estimulacaodefala #maternidade',
    fontes: [
      { t: 'High PC, Klass P; AAP Council on Early Childhood. Literacy Promotion: An Essential Component of Primary Care Pediatric Practice. Pediatrics. 2014;134(2):404-409.', u: 'https://doi.org/10.1542/peds.2014-1384' }
    ]
  },
  {
    id: 'c-rotina-semana', formato: 'reels', rede: 'instagram', pilar: 'rotina',
    titulo: 'Uma semana comigo: 3 cidades, 4 clínicas',
    gancho: 'Segunda em Conceição do Jacuípe, sábado em Irará.',
    roteiro: [
      'Abertura: café + agenda da semana (texto: “3 cidades, 4 clínicas, 1 propósito”).',
      'Cortes rápidos: chegada em cada clínica, a mala de materiais, a prancha de CAA.',
      'Momento real: arrumando a sala antes da primeira criança.',
      'Fechamento: “Onde você me encontra: link na bio.”'
    ],
    legenda: 'A rotina de quem atende em Feira de Santana, Conceição do Jacuípe e Irará. Em qual dessas cidades você mora?',
    hashtags: '#rotinadefono #fonoaudiologa #bastidores #feiradesantana #irara',
    fontes: []
  },
  {
    id: 'c-look-atendimento', formato: 'reels', rede: 'instagram', pilar: 'looks',
    titulo: 'Look de atendimento: conforto para sentar no chão e postura de especialista',
    gancho: 'Dá para sentar no tapete com a criança e continuar elegante?',
    roteiro: [
      'Abertura: transição do look de casa para o look de atendimento.',
      'Peça 1: calça de alfaiataria com elastano (mobilidade para o chão).',
      'Peça 2: camisa ou blusa sem decote profundo (postura e tranquilidade).',
      'Peça 3: sapato fechado e confortável; acessórios discretos que não chamem a mão da criança.',
      'Fechamento: “Comunicação também é como a gente se apresenta.”'
    ],
    legenda: 'Moda corporativa na prática clínica infantil: o que funciona para mim. Quer ver o look de cada dia da semana?',
    hashtags: '#modacorporativa #lookdotrabalho #posicionamentoprofissional #fonoaudiologa',
    fontes: []
  },
  {
    id: 'c-chupeta', formato: 'video', rede: 'tiktok', pilar: 'dicas',
    titulo: 'Chupeta e mamadeira: o que a fono gostaria que você soubesse',
    gancho: 'A chupeta pode interferir na fala? Depende do quanto e até quando.',
    roteiro: [
      '0–2s: Rebeca mostra uma chupeta. Texto: “Chupeta x fala”',
      'O Guia Alimentar do Ministério da Saúde recomenda não oferecer mamadeira, chuquinha e chupeta.',
      'O uso prolongado pode alterar a posição da língua e dos dentes, o que pode interferir na mastigação e na fala.',
      'Se já usa: combine horários, evite durante o dia e durante a fala, e planeje a retirada com calma.',
      'CTA: “Comenta CHUPETA que eu te mando um passo a passo para a retirada.”'
    ],
    legenda: 'Sem julgamentos: cada família tem sua história. Informação ajuda a decidir melhor.',
    hashtags: '#chupeta #mamadeira #fonoaudiologia #desenvolvimentoinfantil',
    fontes: [
      { t: 'Ministério da Saúde. Guia Alimentar para Crianças Brasileiras Menores de 2 Anos, 2019.', u: 'https://bvsms.saude.gov.br/bvs/publicacoes/guia_da_crianca_2019.pdf' }
    ]
  }
];

/* Modelos de recado */
RF.modelosRecado = [
  { nome: 'Lembrete de sessão', texto: 'Olá, {responsavel}! Passando para lembrar da sessão de {paciente} amanhã, na {local}. Até lá!' },
  { nome: 'Tarefa para casa', texto: 'Olá, {responsavel}! Para esta semana com {paciente}: ' },
  { nome: 'Relatório disponível', texto: 'Olá, {responsavel}! O novo relatório de {paciente} já está disponível na Área do Usuário. Qualquer dúvida, estou à disposição.' },
  { nome: 'Novo recurso liberado', texto: 'Olá, {responsavel}! Liberei um novo jogo para {paciente} na Área do Usuário. Brinquem juntos alguns minutos por dia!' },
  { nome: 'Falta / reposição', texto: 'Olá, {responsavel}! Sentimos falta de {paciente} na sessão de hoje. Vamos combinar uma reposição?' }
];

/* Tipos de relatório com estrutura inicial */
RF.tiposRelatorio = {
  evolucao: { nome: 'Relatório de evolução', secoes: ['Identificação', 'Período de acompanhamento', 'Objetivos terapêuticos', 'Evolução observada', 'Orientações à família', 'Conduta'] },
  avaliacao: { nome: 'Avaliação fonoaudiológica', secoes: ['Identificação', 'Queixa principal', 'Histórico', 'Procedimentos de avaliação', 'Resultados', 'Hipótese fonoaudiológica', 'Conduta'] },
  escola: { nome: 'Relatório para a escola', secoes: ['Identificação', 'Acompanhamento fonoaudiológico', 'Como a criança se comunica', 'Estratégias que ajudam em sala', 'Contato'] },
  encaminhamento: { nome: 'Encaminhamento', secoes: ['Identificação', 'Motivo do encaminhamento', 'Observações'] },
  declaracao: { nome: 'Declaração de comparecimento', secoes: ['Declaração'] },
  alta: { nome: 'Alta fonoaudiológica', secoes: ['Identificação', 'Motivo do encerramento', 'Período de acompanhamento', 'Objetivos trabalhados', 'Evolução e resultados alcançados', 'Comunicação na alta', 'Orientações à família', 'Encaminhamentos'] }
};

/* Fim de ciclo: motivos padrão (outros são cadastrados e ficam em Configurações) e prazo mínimo para excluir inativos */
RF.motivosFim = ['Alta fonoaudiológica', 'Superou idade de atendimento', 'Transferência de clínica', 'Transferência de profissional'];
RF.ciclo = { mesesExclusao: 6 };

RF.tiposDoc = {
  paciente: ['CPF', 'Certidão de nascimento', 'RG', 'CIN', 'Passaporte', 'Outro'],
  responsavelCadastro: ['CPF', 'RG', 'CIN', 'CNH', 'Passaporte', 'Outro'],
  responsavelPerfil: ['CPF', 'RG', 'CIN']
};

