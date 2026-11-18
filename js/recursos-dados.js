/* Recursos terapêuticos: catálogo, fundamentação para os pais, termos LGPD/TCLE e regras das estrelas */
window.RF = window.RF || {};

/* Referências conferidas (autores, revista, ano). Links só quando confirmados. */
RF.refs = {
  zubler2022: { t: 'Zubler JM et al. Evidence-Informed Milestones for Developmental Surveillance Tools. Pediatrics, 2022;149(3):e2021052138.', u: 'https://doi.org/10.1542/peds.2021-052138' },
  robertsKaiser2011: { t: 'Roberts MY, Kaiser AP. The effectiveness of parent-implemented language interventions: a meta-analysis. American Journal of Speech-Language Pathology, 2011;20(3):180-199.', u: 'https://pubs.asha.org/doi/10.1044/1058-0360(2011/10-0055)' },
  hirshPasek2015: { t: 'Hirsh-Pasek K, Zosh JM, Golinkoff RM et al. Putting education in “educational” apps: lessons from the science of learning. Psychological Science in the Public Interest, 2015;16(1):3-34.', u: 'https://www.psychologicalscience.org/publications/educational-apps.html' },
  aap2016: { t: 'Academia Americana de Pediatria (AAP), Council on Communications and Media. Media and Young Minds. Pediatrics, 2016;138(5):e20162591.', u: 'https://doi.org/10.1542/peds.2016-2591' },
  sbp2019: { t: 'Sociedade Brasileira de Pediatria. Manual de Orientação #MenosTelas #MaisSaúde, 2019.', u: 'https://www.sbp.com.br/' },
  whitehurst1988: { t: 'Whitehurst GJ et al. Accelerating language development through picture book reading. Developmental Psychology, 1988;24(4):552-559.', u: 'https://doi.org/10.1037/0012-1649.24.4.552' },
  highKlass2014: { t: 'High PC, Klass P; AAP Council on Early Childhood. Literacy Promotion: An Essential Component of Primary Care Pediatric Practice. Pediatrics, 2014;134(2):404-409.', u: 'https://doi.org/10.1542/peds.2014-1384' },
  ehri2001: { t: 'Ehri LC et al. Phonemic awareness instruction helps children learn to read: evidence from the National Reading Panel’s meta-analysis. Reading Research Quarterly, 2001;36(3):250-287.', u: 'https://doi.org/10.1598/RRQ.36.3.2' },
  nelp2008: { t: 'National Early Literacy Panel. Developing Early Literacy: Report of the National Early Literacy Panel. National Institute for Literacy, 2008.', u: '' },
  knight2015: { t: 'Knight V, Sartini E, Spriggs AD. Evaluating visual activity schedules as evidence-based practice for individuals with autism spectrum disorders. Journal of Autism and Developmental Disorders, 2015;45(1):157-178.', u: '' },
  petersen2011: { t: 'Petersen DB. A systematic review of narrative-based language intervention with children who have language impairment. Communication Disorders Quarterly, 2011;32(4):207-220.', u: '' },
  millar2006: { t: 'Millar DC, Light JC, Schlosser RW. The impact of augmentative and alternative communication intervention on the speech production of individuals with developmental disabilities. Journal of Speech, Language, and Hearing Research, 2006;49(2):248-264.', u: 'https://doi.org/10.1044/1092-4388(2006/021)' },
  biggs2018: { t: 'Biggs EE, Carter EW, Gilson CB. Systematic review of interventions involving aided AAC modeling for children with complex communication needs. American Journal on Intellectual and Developmental Disabilities, 2018;123(5):443-473.', u: 'https://pubmed.ncbi.nlm.nih.gov/30198767/' },
  romski2005: { t: 'Romski M, Sevcik RA. Augmentative communication and early intervention: myths and realities. Infants & Young Children, 2005;18(3):174-185.', u: '' },
  ashaAAC: { t: 'ASHA Practice Portal — Augmentative and Alternative Communication.', u: 'https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/' },
  leeGibbon2015: { t: 'Lee ASY, Gibbon FE. Non-speech oral motor treatment for developmental speech sound disorders in children. Cochrane Database of Systematic Reviews, 2015, CD009383.', u: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD009383/information' },
  kasari2006: { t: 'Kasari C, Freeman S, Paparella T. Joint attention and symbolic play in young children with autism: a randomized controlled intervention study. Journal of Child Psychology and Psychiatry, 2006;47(6):611-620.', u: '' },
  laing2019: { t: 'Laing CE. A role for onomatopoeia in early language: evidence from phonological development. Language and Cognition, 2019;11(2):173-187.', u: '' }
};

/* Catálogo de recursos. modo: "junto" = pensado para brincar com o responsável; "apoio" = a criança joga com um adulto por perto. */
RF.areas = {
  vocab: 'Vocabulário', compreensao: 'Compreensão', fonologia: 'Consciência fonológica', narrativa: 'Narrativa e sequência',
  caa: 'Comunicação alternativa', motricidade: 'Motricidade orofacial', atencao: 'Atenção e turnos'
};
RF.jogos = {
  memoria: { nome: 'Memória das palavras', icone: '🃏', area: 'vocab', modo: 'junto', idade: 'a partir de 2 anos', desc: 'Encontrar pares de figuras e falar o nome de cada uma.', objetivo: 'Ampliar o vocabulário com repetição e atenção compartilhada.',
    como: ['Sente ao lado da criança e jogue em turnos: uma vez ela, uma vez você.', 'Ao virar a carta, fale o nome com entusiasmo e espere a criança tentar repetir.', 'Se ela apontar ou fizer um som, valorize e devolva a palavra completa.'],
    refs: ['robertsKaiser2011', 'hirshPasek2015'], config: { categoria: ['animais', 'comidas', 'brinquedos', 'casa', 'transportes', 'corpo', 'roupas'], pares: [3, 4, 6] } },
  sons: { nome: 'Qual é o som?', icone: '🐮', area: 'compreensao', modo: 'apoio', idade: 'a partir de 18 meses', desc: 'Ouvir o som e tocar na figura certa.', objetivo: 'Onomatopeias (au-au, muuu) costumam estar entre as primeiras “palavras” da criança e ajudam a construir a fala.',
    como: ['Imite o som junto com o jogo, exagerando a boca.', 'Depois do acerto, faça a pergunta ao contrário: “E a vaca, faz como?”.'], refs: ['laing2019', 'aap2016'], config: {} },
  inicial: { nome: 'Começa com…', icone: '🔤', area: 'fonologia', modo: 'apoio', idade: 'a partir de 4 anos', desc: 'Achar a figura que começa com o som pedido.', objetivo: 'Perceber os sons do começo das palavras, base para a fala e para a alfabetização.',
    como: ['Fale o som esticado: “ssssapo”.', 'Procure em casa outras coisas que começam com o mesmo som.'], refs: ['ehri2001', 'nelp2008'], config: { som: ['B', 'P', 'M', 'F', 'S', 'T'] } },
  silabas: { nome: 'Palmas das sílabas', icone: '👏', area: 'fonologia', modo: 'junto', idade: 'a partir de 4 anos', desc: 'Bater uma palma para cada pedacinho da palavra.', objetivo: 'Separar a palavra em sílabas, habilidade de consciência fonológica.',
    como: ['Batam palmas juntos enquanto falam a palavra devagar: “ba-na-na”.', 'Depois a criança toca no tambor da tela o mesmo número de vezes.'], refs: ['ehri2001', 'nelp2008'], config: { nivel: ['facil', 'medio', 'dificil'] } },
  rimas: { nome: 'Ligue as rimas', icone: '🎵', area: 'fonologia', modo: 'apoio', idade: 'a partir de 4 anos', desc: 'Juntar as palavras que terminam igual.', objetivo: 'Perceber rimas, outra peça da consciência fonológica.',
    como: ['Leia os dois nomes em voz alta, marcando o final: “gATO, pATO”.', 'Invente rimas bobas juntos depois do jogo.'], refs: ['ehri2001', 'nelp2008'], config: { pares: [3, 4, 5] } },
  sequencia: { nome: 'Rotina em ordem', icone: '🗓️', area: 'narrativa', modo: 'apoio', idade: 'a partir de 3 anos', desc: 'Organizar as etapas de uma rotina.', objetivo: 'Sequência lógica e narrativa: “primeiro, depois, por último”. Rotinas visuais também ajudam crianças autistas a antecipar o dia.',
    como: ['No fim, peça para a criança contar a rotina usando “primeiro… depois…”.', 'Use a mesma sequência no dia real, apontando as etapas.'], refs: ['knight2015', 'petersen2011'], config: { rotina: ['manha', 'banho', 'lanche'] } },
  historia: { nome: 'Histórias para contar juntos', icone: '📖', area: 'narrativa', modo: 'junto', idade: 'a partir de 2 anos', desc: 'Livrinho na tela com perguntas para o adulto fazer em cada página.', objetivo: 'Leitura dialógica: a criança deixa de só ouvir e passa a contar a história com você.',
    como: ['Leia a página e faça a pergunta sugerida.', 'Espere a resposta com calma, elogie e acrescente uma palavra ao que ela disse.', 'Na segunda leitura, deixe a criança “ler” as figuras para você.'], refs: ['whitehurst1988', 'highKlass2014'], config: { historia: ['pipoca', 'bolo'] } },
  comando: { nome: 'Siga o comando', icone: '👆', area: 'compreensao', modo: 'apoio', idade: 'a partir de 2 anos e meio', desc: 'Ouvir a ordem e tocar nas figuras na sequência certa.', objetivo: 'Compreensão de ordens com um, dois ou três passos e memória auditiva.',
    como: ['Repita a ordem só se a criança pedir: o desafio é guardar a frase.', 'Em casa, dê ordens de dois passos nas brincadeiras: “pega a bola e coloca na caixa”.'], refs: ['robertsKaiser2011'], config: { passos: [1, 2, 3] } },
  adivinha: { nome: 'Adivinha quem sou', icone: '❓', area: 'vocab', modo: 'junto', idade: 'a partir de 3 anos', desc: 'Ouvir pistas e descobrir a figura.', objetivo: 'Organizar o vocabulário por características: cor, forma, uso, categoria.',
    como: ['Depois do jogo, invertam: a criança dá as pistas e você adivinha.', 'Ajude com perguntas: “é de comer? é de brincar?”.'], refs: ['robertsKaiser2011', 'hirshPasek2015'], config: {} },
  grupos: { nome: 'Separe nos grupos', icone: '🧺', area: 'vocab', modo: 'apoio', idade: 'a partir de 3 anos', desc: 'Arrastar cada figura para o cesto certo.', objetivo: 'Categorização: entender que palavras se organizam em grupos ajuda a aprender e lembrar novas palavras.',
    como: ['Nomeie cada figura antes de arrastar.', 'Pergunte “por que vai nesse cesto?”.'], refs: ['hirshPasek2015', 'robertsKaiser2011'], config: { grupos: ['animais-comidas', 'brinquedos-casa', 'transportes-roupas', 'P-B'] } },
  toupeira: { nome: 'Pega-figura', icone: '🔨', area: 'atencao', modo: 'apoio', idade: 'a partir de 3 anos', desc: 'Toque rápido só nas figuras do grupo pedido.', objetivo: 'Atenção, controle do impulso e discriminação de categorias.',
    como: ['Combine antes qual é o alvo e falem juntos o nome de cada acerto.', 'Comece no modo devagar.'], refs: ['hirshPasek2015'], config: { alvo: ['animais', 'comidas', 'transportes'], velocidade: ['devagar', 'medio', 'rapido'] } },
  roleta: { nome: 'Roleta das palavras', icone: '🎡', area: 'atencao', modo: 'junto', idade: 'a partir de 2 anos', desc: 'Girar a roleta e cumprir o desafio da figura, um de cada vez.', objetivo: 'Revezar a vez, nomear e formar frases em uma brincadeira com o adulto.',
    como: ['Revezem: a criança gira, depois o adulto.', 'Quando for a sua vez, dê o exemplo do desafio para a criança imitar.'], refs: ['robertsKaiser2011', 'kasari2006'], config: { categoria: ['animais', 'comidas', 'brinquedos', 'casa', 'transportes'], desafio: ['nomear', 'frase', 'imitar'] } },
  caixa: { nome: 'Abra a caixa', icone: '🎁', area: 'atencao', modo: 'junto', idade: 'a partir de 2 anos e meio', desc: 'Abrir caixinhas surpresa com um desafio de fala em cada.', objetivo: 'Produzir palavras em situações divertidas, com o adulto como modelo.',
    como: ['Revezem a vez de abrir a caixa.', 'Façam o desafio juntos: o adulto primeiro, a criança depois.'], refs: ['robertsKaiser2011', 'hirshPasek2015'], config: { categoria: ['animais', 'comidas', 'brinquedos', 'casa'], caixas: [6, 9, 12] } },
  prancha: { nome: 'Minha prancha', icone: '🗣️', area: 'caa', modo: 'junto', idade: 'qualquer idade', desc: 'Prancha de comunicação personalizada para montar frases e ouvir.', objetivo: 'Dar um meio de comunicação agora, enquanto a fala se desenvolve. A CAA não atrapalha a fala e costuma ajudá-la.',
    como: ['Use a prancha você também ao falar com a criança (modelagem): toque nos símbolos enquanto fala.', 'Deixe a prancha sempre à vista nas refeições e brincadeiras.', 'Não exija que a criança fale antes de usar a prancha.'], refs: ['millar2006', 'biggs2018', 'romski2005', 'ashaAAC'], config: {} },
  praxias: { nome: 'Caretas da língua', icone: '👅', area: 'motricidade', modo: 'junto', idade: 'conforme indicação', desc: 'Imitar movimentos de boca e língua com tempo.', objetivo: 'Mobilidade e força da musculatura da boca para funções como mastigação e deglutição, quando indicado pela fono. Para a fala, a terapia trabalha os próprios sons.',
    como: ['Façam juntos em frente ao espelho.', 'Faça só os exercícios liberados e pelo tempo combinado com a Rebeca.'], refs: ['leeGibbon2015'], config: {} }
};

/* Uso de telas: orientação geral exibida para os pais */
RF.telas = { texto: 'Os recursos são para brincar junto: um adulto ao lado conversando, comentando e revezando a vez. Sessões curtas, de 10 a 15 minutos, funcionam melhor. Para crianças de 2 a 5 anos, as sociedades de pediatria recomendam até 1 hora de tela por dia, sempre com supervisão.', refs: ['aap2016', 'sbp2019', 'hirshPasek2015'] };

/* Estrelas e presentes (padrões; Rebeca ajusta em Configurações) */
RF.gamificacao = {
  conclusoesPorEstrela: 3,          // recursos diferentes concluídos para ganhar 1 estrela
  limite: 1, periodo: 'semana',     // no máximo 1 estrela por semana para cada paciente
  unicoPorFase: true,               // cada recurso vale uma vez por fase; volta a valer quando a fono abre nova fase
  estrelasPorPresente: 3,
  mensagem: 'Você ganhou um presente da Fono Rebeca! Mostre esta tela na próxima sessão.',
  mensagemFase: 'Nova fase! Agora suas estrelas são {cor}. A Fono Rebeca liberou recursos novos para você.',
  fases: [
    { nome: 'Fase 1', cor: '#E9B52F', corNome: 'douradas' },
    { nome: 'Fase 2', cor: '#3E9BD6', corNome: 'azuis' },
    { nome: 'Fase 3', cor: '#5DAE3B', corNome: 'verdes' },
    { nome: 'Fase 4', cor: '#E0679A', corNome: 'rosas' },
    { nome: 'Fase 5', cor: '#8E6AD1', corNome: 'roxas' }
  ]
};

/* Termos. Modelos iniciais para revisão jurídica antes do lançamento. */
RF.termos = {
  lgpd: {
    versao: '1.0',
    titulo: 'Termo de Consentimento para Tratamento de Dados Pessoais (LGPD)',
    secoes: [
      ['1. Quem cuida dos seus dados', 'A controladora dos dados é Rebeca H. Fonseca Ferreira, fonoaudióloga, CRFa 4-15570, que também atua como encarregada pelo tratamento de dados. Contato: WhatsApp (75) 98367-8360 e e-mail rebecaffs@outlook.com.'],
      ['2. Quais dados são tratados', 'Da criança: nome, data de nascimento, documento, foto de perfil, local de atendimento e informações de saúde e desenvolvimento (avaliações, evoluções, relatórios e participação nos recursos terapêuticos). Do responsável: nome, parentesco, documento, WhatsApp, e-mail e registros de acesso e de aceite dos termos.'],
      ['3. Para que os dados são usados', 'Acompanhamento fonoaudiológico da criança; elaboração e entrega de relatórios; comunicação com a família (recados, lembretes e avisos pelo WhatsApp e pelo portal); disponibilização de recursos terapêuticos; cumprimento de obrigações profissionais e legais.'],
      ['4. Base legal', 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018): art. 7º, para execução do atendimento e cumprimento de obrigação legal e regulatória; art. 11, por se tratar de dados de saúde, tratados para a tutela da saúde por profissional de saúde e mediante este consentimento específico; art. 14, por se tratar de dados de criança, tratados no seu melhor interesse e com o consentimento específico e em destaque de pelo menos um dos pais ou do responsável legal.'],
      ['5. Compartilhamento', 'Os dados não são vendidos nem usados para publicidade. Podem ser compartilhados apenas: com profissionais e instituições envolvidos no cuidado da criança (escola, médicos, clínicas), quando você autorizar ou pedir; com fornecedores de tecnologia que hospedam o sistema e com o WhatsApp, apenas para operar o serviço; com autoridades, quando houver obrigação legal.'],
      ['6. Armazenamento e segurança', 'Os dados ficam em ambiente com acesso restrito, com senhas guardadas de forma criptografada. Cada responsável vê apenas as informações das próprias crianças. Os registros clínicos são guardados pelo prazo exigido pelas normas do Conselho Federal de Fonoaudiologia e pela legislação aplicável.'],
      ['7. Seus direitos', 'Pelo art. 18 da LGPD, você pode a qualquer momento: confirmar que seus dados são tratados; acessá-los; corrigir dados incompletos ou desatualizados; pedir anonimização, bloqueio ou eliminação de dados desnecessários; pedir a portabilidade; saber com quem foram compartilhados; e revogar este consentimento, sem prejuízo do que já foi feito e dos registros que a lei obriga a guardar. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).'],
      ['8. Como exercer seus direitos', 'Pelo WhatsApp (75) 98367-8360 ou pelo e-mail rebecaffs@outlook.com. A resposta completa será dada em até 15 dias, conforme o art. 19 da LGPD.'],
      ['9. Declaração', 'Declaro que li e compreendi este termo e consinto, de forma livre, informada e inequívoca, com o tratamento dos meus dados pessoais e dos dados da criança sob minha responsabilidade, para as finalidades descritas acima.']
    ]
  },
  tcle: {
    versao: '1.0',
    titulo: 'Termo de Consentimento Livre e Esclarecido para Uso de Imagem, Vídeo e Voz',
    secoes: [
      ['1. Objetivo', 'Este termo pede sua autorização para que imagens (fotos), vídeos e voz de {crianca} possam ser usados em conteúdos educativos e institucionais da fonoaudióloga Rebeca Fonseca (CRFa 4-15570), publicados no Instagram @rebecafonsca.fono, no TikTok @rebecafonsca, no site e em materiais de divulgação profissional.'],
      ['2. Como as imagens serão usadas', 'Somente em conteúdos sobre desenvolvimento infantil, comunicação e fonoaudiologia, com respeito à dignidade da criança. Não serão divulgados diagnóstico, nome completo, endereço, escola ou outros dados que identifiquem a família sem nova autorização específica. A criança nunca será exposta a situação vexatória ou constrangedora (Estatuto da Criança e do Adolescente, arts. 17 e 18).'],
      ['3. Participação voluntária e gratuita', 'A autorização é voluntária e gratuita, sem qualquer pagamento. Recusar ou revogar não altera em nada o atendimento da criança.'],
      ['4. Prazo e revogação', 'A autorização vale por prazo indeterminado e pode ser revogada a qualquer momento pelo portal ou pelos contatos da profissional. Após a revogação, nenhuma nova publicação usará a imagem da criança e as publicações já feitas que a identifiquem serão removidas das contas da profissional. Conteúdos copiados ou compartilhados por terceiros podem fugir do controle da profissional.'],
      ['5. Base legal', 'Código Civil, art. 20 (uso da imagem); Estatuto da Criança e do Adolescente (Lei nº 8.069/1990), art. 17 (preservação da imagem); LGPD (Lei nº 13.709/2018), art. 14 (dados de crianças); Código de Ética da Fonoaudiologia.'],
      ['6. Assinatura eletrônica', 'Este termo é assinado eletronicamente, com registro de data, hora, usuário e código de verificação, meio de comprovação de autoria aceito pelas partes nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001.'],
      ['7. Declaração', 'Eu, {responsavel}, documento {documento}, responsável legal por {crianca}, declaro que li este termo, tive a oportunidade de esclarecer minhas dúvidas e AUTORIZO o uso de imagem, vídeo e voz da criança nas condições descritas acima.']
    ]
  }
};

/* Procedimentos de avaliação (relatórios). Outros são cadastrados em Relatórios e ficam salvos em Configurações. */
RF.procedimentos = ['POD', 'ABFW', 'ADL II', 'PROC', 'Avaliação clínica observacional'];
