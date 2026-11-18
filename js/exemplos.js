/* Registros de exemplo (marcados como "exemplo") para demonstrar o sistema.
   Podem ser excluídos a qualquer momento em Gestão. O WhatsApp do responsável de exemplo
   é o da própria Rebeca, para que os testes de envio cheguem só no celular dela. */
window.RF = window.RF || {};
RF.exemplos = function () {
  const hoje = new Date();
  const dia = (n) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return d.toISOString(); };
  const data = (n) => dia(n).slice(0, 10);
  return {
    pacientes: [
      { id: 'p-exemplo-davi', exemplo: true, nome: 'Davi Exemplo Santos', nascimento: '2023-05-14', docTipo: 'Certidão de nascimento', docNumero: '11223301552023100012345678901234', local: 'neuro1', foto: '', responsaveis: ['r-exemplo-mariana'], ativo: true, criadoEm: dia(60), queixa: 'Fala pouco para a idade; usa gestos e algumas palavras isoladas.' },
      { id: 'p-exemplo-helena', exemplo: true, nome: 'Helena Exemplo Lima', nascimento: '2024-09-02', docTipo: 'Certidão de nascimento', docNumero: '11223301552024100098765432109876', local: 'berimbau', foto: '', responsaveis: ['r-exemplo-carlos'], ativo: true, criadoEm: dia(20), queixa: 'Acompanhamento de motricidade orofacial após avaliação do frênulo.' },
      { id: 'p-exemplo-theo', exemplo: true, nome: 'Théo Exemplo Lima', nascimento: '2020-03-10', docTipo: 'Certidão de nascimento', docNumero: '11223301552020100055566677788899', local: 'centclin', foto: '', responsaveis: ['r-exemplo-carlos'], ativo: false, criadoEm: dia(520), inativoEm: dia(210), queixa: 'Trocas na fala (fonológicas) percebidas pela escola.',
        ciclo: { status: 'finalizado', motivo: 'Alta fonoaudiológica', data: data(210), relatorioId: 'rel-exemplo-alta', finalizadoEm: dia(210), por: 'Rebeca Fonseca' } }
    ],
    responsaveis: [
      { id: 'r-exemplo-mariana', exemplo: true, nome: 'Mariana Exemplo Santos', parentesco: 'Mãe', usuario: 'mariana.santos', docTipo: 'CPF', docNumero: '529.982.247-25', whatsapp: '5575983678360', email: '', pacientes: ['p-exemplo-davi'], primeiroAcesso: true, perfilCompleto: false, salt: '7f0cc9be928f418c3d40b6c478ba59c7', hash: 'ec2a5ce05abd93eb7295f7a611cdcd72b11a4351b7a2ed68ece0d4804eb69503', iter: 150000, criadoEm: dia(60) },
      { id: 'r-exemplo-carlos', exemplo: true, nome: 'Carlos Exemplo Lima', parentesco: 'Pai', usuario: 'carlos.lima', docTipo: 'CPF', docNumero: '111.444.777-35', whatsapp: '', email: '', pacientes: ['p-exemplo-helena', 'p-exemplo-theo'], primeiroAcesso: true, perfilCompleto: false, salt: '9a0e908d3a632c68b10806e87dd1b4c6', hash: '9f7f1b2ecc4c1d67bc116f104eff3665ab1dbb3fa44d8f699bd5f2ee2238a7c5', iter: 150000, criadoEm: dia(20) }
    ],
    relatorios: [
      { id: 'rel-exemplo-alta', exemplo: true, pacienteId: 'p-exemplo-theo', tipo: 'alta', titulo: 'Relatório de alta fonoaudiológica', data: data(210), status: 'publicado', publicadoEm: dia(210), envios: [], alta: { motivo: 'Alta fonoaudiológica', data: data(210) },
        secoes: [
          { titulo: 'Identificação', texto: 'Théo Exemplo Lima, 5 anos, acompanhado na CentClin, em Irará.' },
          { titulo: 'Motivo do encerramento', texto: 'Objetivos terapêuticos alcançados.' },
          { titulo: 'Período de acompanhamento', texto: 'Dez meses, com sessões semanais.' },
          { titulo: 'Objetivos trabalhados', texto: 'Adequar os processos fonológicos de anteriorização e simplificação de encontro consonantal.' },
          { titulo: 'Evolução e resultados alcançados', texto: 'Théo produz corretamente os fonemas trabalhados na fala espontânea, em casa e na escola.' },
          { titulo: 'Comunicação na alta', texto: '' },
          { titulo: 'Orientações à família', texto: 'Manter a leitura compartilhada e os jogos de rima. Se a escola notar novas trocas, procurar reavaliação.' },
          { titulo: 'Encaminhamentos', texto: '' }
        ] },
      { id: 'rel-exemplo-1', exemplo: true, pacienteId: 'p-exemplo-davi', tipo: 'evolucao', titulo: 'Relatório de evolução fonoaudiológica', data: data(5), status: 'publicado', publicadoEm: dia(5), envios: [],
        secoes: [
          { titulo: 'Identificação', texto: 'Davi Exemplo Santos, 3 anos, acompanhado na Clínica Neuro Infância I, com sessões semanais.' },
          { titulo: 'Período de acompanhamento', texto: 'Setembro a novembro de 2026 (8 sessões).' },
          { titulo: 'Objetivos terapêuticos', texto: 'Ampliar o vocabulário expressivo, estimular a combinação de duas palavras e favorecer a intenção comunicativa com apoio de Comunicação Aumentativa e Alternativa.' },
          { titulo: 'Evolução observada', texto: 'Davi passou a usar cerca de 30 palavras de forma espontânea e começou a combinar duas palavras em situações de brincadeira ("mais bola", "abre porta"). Usa a prancha de comunicação para fazer pedidos e comentar, o que reduziu momentos de frustração.' },
          { titulo: 'Orientações à família', texto: 'Manter a leitura compartilhada diária, dar tempo de espera antes de oferecer o objeto e repetir a fala da criança acrescentando uma palavra.' },
          { titulo: 'Conduta', texto: 'Manter acompanhamento semanal e reavaliar em 3 meses.' }
        ] }
    ],
    recados: [
      { id: 'rec-exemplo-1', exemplo: true, pacienteId: 'p-exemplo-davi', texto: 'Olá, Mariana! Para esta semana com Davi: na hora do lanche, ofereça duas opções e espere ele pedir com a palavra ou apontando na prancha.', enviadoEm: dia(3), para: [{ id: 'r-exemplo-mariana', nome: 'Mariana Exemplo Santos', whatsapp: '5575983678360' }], canal: 'whatsapp' },
      { id: 'rec-exemplo-2', exemplo: true, pacienteId: 'p-exemplo-davi', texto: 'Olá, Mariana! O novo relatório de Davi já está disponível na Área do Usuário. Qualquer dúvida, estou à disposição.', enviadoEm: dia(5), para: [{ id: 'r-exemplo-mariana', nome: 'Mariana Exemplo Santos', whatsapp: '5575983678360' }], canal: 'whatsapp' }
    ],
    evolucoes: [
      { id: 'ev-exemplo-1', exemplo: true, pacienteId: 'p-exemplo-davi', data: data(14), local: 'neuro1', objetivos: 'Pedidos com duas palavras; atenção compartilhada.', atividades: 'Brincadeira com carrinhos e massinha; modelagem "mais + objeto"; prancha com 12 símbolos.', resposta: 'Fez 6 pedidos com "mais + objeto" com modelo; 2 espontâneos. Manteve atenção por cerca de 8 minutos.', orientacoes: 'Repetir a estratégia no lanche.', proximos: 'Introduzir verbos de ação na prancha.' },
      { id: 'ev-exemplo-2', exemplo: true, pacienteId: 'p-exemplo-davi', data: data(7), local: 'neuro1', objetivos: 'Verbos de ação; imitação motora oral.', atividades: 'Livro de animais; jogo "Qual é o som?"; praxias com espelho.', resposta: 'Imitou 4 onomatopeias; usou "abre" e "dá" espontaneamente.', orientacoes: 'Liberado o jogo "Qual é o som?" no portal.', proximos: 'Combinar verbo + objeto.' },
      { id: 'ev-exemplo-3', exemplo: true, pacienteId: 'p-exemplo-helena', data: data(4), local: 'berimbau', objetivos: 'Mobilidade de língua; mastigação.', atividades: 'Exercícios lúdicos de língua; oferta de alimentos de diferentes consistências.', resposta: 'Boa aceitação; elevou a ponta da língua com apoio visual.', orientacoes: 'Praticar as "caretas da língua" 5 minutos por dia.', proximos: 'Reavaliar em 4 semanas.' }
    ],
    recursos: [
      { id: 'rc-exemplo-1', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'memoria', ativo: true, cfg: { categoria: 'animais', pares: 4 }, nota: 'Nomeie cada animal em voz alta quando virar a carta.', liberadoEm: dia(10) },
      { id: 'rc-exemplo-2', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'sons', ativo: true, cfg: {}, nota: 'Imite o som junto com ele antes de tocar na figura.', liberadoEm: dia(7) },
      { id: 'rc-exemplo-3', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'prancha', ativo: true, cfg: {}, nota: 'Use a prancha nas refeições para fazer pedidos.', liberadoEm: dia(7) },
      { id: 'rc-exemplo-4', exemplo: true, pacienteId: 'p-exemplo-helena', jogo: 'praxias', ativo: true, cfg: {}, nota: '5 minutos por dia, de preferência em frente ao espelho.', liberadoEm: dia(4) },
      { id: 'rc-exemplo-5', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'roleta', ativo: true, cfg: { categoria: 'animais', desafio: 'imitar' }, nota: 'Revezem a vez: um gira, o outro imita. Esperar a vez também é treino!', liberadoEm: dia(3) },
      { id: 'rc-exemplo-6', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'historia', ativo: true, cfg: { historia: 'pipoca' }, nota: 'Leia devagar e faça as perguntas de cada página. Repita o que ele disser acrescentando uma palavra.', liberadoEm: dia(3) },
      { id: 'rc-exemplo-7', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'grupos', ativo: true, cfg: { grupos: 'animais-comidas' }, nota: 'Arrastar com o dedo ajuda na coordenação. Pergunte: "por que vai aí?"', liberadoEm: dia(2) },
      { id: 'rc-exemplo-8', exemplo: true, pacienteId: 'p-exemplo-davi', jogo: 'caixa', ativo: true, cfg: { categoria: 'brinquedos', caixas: 6 }, nota: 'Abram uma caixa por vez e façam o desafio juntos.', liberadoEm: dia(1) }
    ],
    metricas: (() => {
      const out = []; const base = { ig: 1840, tt: 620 };
      for (let w = 7; w >= 0; w--) {
        const sem = data(w * 7); const i = 7 - w;
        out.push({ id: 'm-ig-' + sem, exemplo: true, rede: 'instagram', semana: sem, seguidores: base.ig + i * 46 + (i > 4 ? 60 : 0), alcance: 3200 + i * 420 + (i === 5 ? 2600 : 0), interacoes: 260 + i * 30 + (i === 5 ? 210 : 0), salvamentos: 40 + i * 9, compartilhamentos: 22 + i * 7 + (i === 5 ? 90 : 0), visitasPerfil: 180 + i * 20, cliquesWhats: 6 + i * 2, posts: i % 2 ? 3 : 2 });
        out.push({ id: 'm-tt-' + sem, exemplo: true, rede: 'tiktok', semana: sem, seguidores: base.tt + i * 38, alcance: 2100 + i * 530, interacoes: 190 + i * 41, salvamentos: 21 + i * 6, compartilhamentos: 15 + i * 6, visitasPerfil: 90 + i * 12, cliquesWhats: 1 + i, posts: 2 });
      }
      return out;
    })()
  };
};
