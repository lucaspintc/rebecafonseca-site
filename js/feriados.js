/* Feriados nacionais, estaduais (BA), municipais das cidades de atendimento e datas móveis.
   Fontes: Lei 662/1949 e Lei 14.759/2023 (nacionais); Constituição da Bahia (2 de Julho);
   TJBA, Decreto Judiciário nº 09/2026 (municipais). Carnaval e Corpus Christi são ponto
   facultativo nacional, mas contam como dia sem atendimento.
   Cidade nova na agenda: acrescente os feriados dela em MUNICIPAIS (o nome é comparado sem acentos). */
(function () {
  const sem = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

  /* [mês-dia, nome oficial, nome curto] */
  const NACIONAIS = [
    ['01-01', 'Confraternização Universal', 'Ano Novo'],
    ['04-21', 'Tiradentes', 'Tiradentes'],
    ['05-01', 'Dia do Trabalho', 'Dia do Trabalho'],
    ['09-07', 'Independência do Brasil', 'Independência'],
    ['10-12', 'Nossa Senhora Aparecida', 'N. Sra. Aparecida'],
    ['11-02', 'Finados', 'Finados'],
    ['11-15', 'Proclamação da República', 'Proclamação da República'],
    ['11-20', 'Dia Nacional de Zumbi e da Consciência Negra', 'Consciência Negra'],
    ['12-25', 'Natal', 'Natal']
  ];
  /* [dias a partir do Domingo de Páscoa, nome, curto, tipo] */
  const MOVEIS = [
    [-48, 'Carnaval (segunda-feira)', 'Carnaval', 'facultativo'],
    [-47, 'Carnaval (terça-feira)', 'Carnaval', 'facultativo'],
    [-2, 'Sexta-feira Santa (Paixão de Cristo)', 'Sexta-feira Santa', 'nacional'],
    [60, 'Corpus Christi', 'Corpus Christi', 'facultativo']
  ];
  const ESTADUAIS = { BA: [['07-02', 'Independência da Bahia', 'Independência da Bahia']] };
  const MUNICIPAIS = {
    'feira de santana': [
      ['06-24', 'São João', 'São João'],
      ['07-26', 'Senhora Sant’Ana, padroeira da cidade', 'Senhora Sant’Ana']
    ],
    'conceicao do jacuipe': [
      ['06-24', 'São João', 'São João'],
      ['10-20', 'Aniversário da cidade (emancipação política)', 'Aniversário da cidade'],
      ['12-08', 'Nossa Senhora da Conceição, padroeira da cidade', 'N. Sra. da Conceição']
    ],
    'irara': [
      ['02-02', 'Nossa Senhora da Purificação, padroeira da cidade', 'N. Sra. da Purificação'],
      ['05-27', 'Feriado municipal', 'Feriado municipal'],
      ['09-23', 'Feriado municipal', 'Feriado municipal'],
      ['12-08', 'Nossa Senhora da Conceição', 'N. Sra. da Conceição']
    ]
  };

  /* Datas como texto AAAA-MM-DD, calculadas em UTC para não sofrer com fuso */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const data = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d)); };
  const somar = (s, n) => { const d = data(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const diaSemana = (s) => data(s).getUTCDay();
  const dataCurta = (s) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

  /* Domingo de Páscoa (algoritmo gregoriano anônimo, Meeus/Jones/Butcher) */
  function pascoa(ano) {
    const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return `${ano}-${pad(mes)}-${pad(dia)}`;
  }

  /* Hoje no horário da Bahia, qualquer que seja o fuso do aparelho */
  function hojeISO() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch { return iso(new Date(Date.now() - 3 * 36e5)); }
  }

  const cacheAno = {};
  function gerais(ano, uf) {
    const k = ano + uf; if (cacheAno[k]) return cacheAno[k];
    const mapa = {};
    const por = (dia, nome, curto, tipo) => { (mapa[dia] = mapa[dia] || []).push({ dia, nome, curto, tipo }); };
    NACIONAIS.forEach(([md, n, c]) => por(`${ano}-${md}`, n, c, 'nacional'));
    const p = pascoa(ano); MOVEIS.forEach(([o, n, c, t]) => por(somar(p, o), n, c, t));
    (ESTADUAIS[uf] || []).forEach(([md, n, c]) => por(`${ano}-${md}`, n, c, 'estadual'));
    return (cacheAno[k] = mapa);
  }
  /* Feriados que valem em todas as cidades do estado (nacionais, móveis e estaduais) */
  const geral = (dia, uf = 'BA') => gerais(+dia.slice(0, 4), uf)[dia] || [];
  /* Feriados só daquela cidade */
  function municipal(dia, cidade) {
    const md = dia.slice(5);
    return (MUNICIPAIS[sem(cidade)] || []).filter((x) => x[0] === md).map(([, nome, curto]) => ({ dia, nome, curto, tipo: 'municipal', cidade }));
  }
  const doDia = (dia, cidade, uf = 'BA') => [...geral(dia, uf), ...(cidade ? municipal(dia, cidade) : [])];

  /* Próximos dias de atendimento da clínica que caem em feriado */
  function proximos(local, dias = 60, desde = hojeISO()) {
    const ds = new Set((local.dias || []).map((x) => x.d)); const out = [];
    for (let i = 0; i <= dias; i++) {
      const dia = somar(desde, i); const d = diaSemana(dia);
      if (!ds.has(d)) continue;
      const fs = doDia(dia, local.cidade, local.uf || 'BA');
      if (fs.length) out.push({ dia, d, feriados: fs });
    }
    return out;
  }

  const rotulo = (f) => f.tipo === 'nacional' ? 'Feriado nacional' : f.tipo === 'estadual' ? 'Feriado na Bahia' : f.tipo === 'municipal' ? `Feriado em ${f.cidade}` : 'Feriado';
  const curto = (f) => f.curto || f.nome;

  RF.Feriados = { pascoa, hojeISO, somar, diaSemana, dataCurta, geral, municipal, doDia, proximos, rotulo, curto, base: { NACIONAIS, MOVEIS, ESTADUAIS, MUNICIPAIS } };
})();
