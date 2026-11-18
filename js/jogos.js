/* Recursos terapêuticos: voz feminina alegre, festa de acerto, estrelas e presentes, jogos */
(function () {
  /* ---------------- Voz ---------------- */
  const FEM = /francisca|thalita|maria|luciana|fernanda|vit[oó]ria|raquel|leila|yara|manuela|brenda|giovanna|let[ií]cia|elza|camila|j[uú]lia|helena|google portugu[eê]s do brasil|female|feminina|mulher/i;
  const MASC = /daniel|felipe|ant[oô]nio|f[aá]bio|ricardo|heitor|humberto|j[uú]lio|val[eé]rio|donato|nicolau|joaquim|male|masculin/i;
  const Voz = {
    lista: [],
    carregar() { try { this.lista = speechSynthesis.getVoices().filter((v) => /^pt/i.test(v.lang)); } catch { this.lista = []; } },
    ordenadas() {
      const score = (v) => (FEM.test(v.name) ? 0 : MASC.test(v.name) ? 3 : 1) + (/pt[-_]BR/i.test(v.lang) ? 0 : 1.5) + (/natural|neural|online|enhanced|premium/i.test(v.name) ? -0.5 : 0);
      return [...this.lista].sort((a, b) => score(a) - score(b));
    },
    atual() { const pref = ls.get('voz', ''); return this.lista.find((v) => v.name === pref) || this.ordenadas()[0] || null; },
    falar(t, { festa = false } = {}) {
      try {
        const s = window.speechSynthesis; if (!s || ls.get('vozDesligada', false)) return;
        if (!this.lista.length) this.carregar();
        s.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR';
        const v = this.atual(); if (v) u.voice = v;
        const masculina = v && MASC.test(v.name) && !FEM.test(v.name);
        u.pitch = festa ? 1.6 : masculina ? 1.5 : 1.3; u.rate = festa ? 1.1 : 1.02; u.volume = 1;
        s.speak(u);
      } catch {}
    }
  };
  try { Voz.carregar(); speechSynthesis.addEventListener('voiceschanged', () => Voz.carregar()); } catch {}
  const falar = (t, o) => Voz.falar(t, o);
  const ELOGIOS = ['Isso aí!', 'Muito bem!', 'Arrasou!', 'Que demais!', 'Você é fera!', 'Uhuul, acertou!', 'Mandou bem!'];
  const QUASE = ['Quase! Tenta de novo.', 'Hum, essa não. Vamos tentar outra?', 'Opa, olha de novo!'];
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];

  /* ---------------- Efeitos: sons sintetizados e confete ---------------- */
  let AC = null;
  const ctx = () => { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch { AC = null; } return AC; };
  const somLigado = () => !ls.get('somDesligado', false);
  function tom(f, t0, dur, tipo = 'sine', vol = 0.18) {
    const a = ctx(); if (!a) return; const o = a.createOscillator(), g = a.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t0); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function ruido(seg) { const a = ctx(); const b = a.createBuffer(1, a.sampleRate * seg, a.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  const Som = {
    acerto() { if (!somLigado() || !ctx()) return; const t = AC.currentTime; [784, 988, 1175, 1568].forEach((f, i) => tom(f, t + i * 0.06, 0.4, 'triangle', 0.16)); tom(2093, t + 0.26, 0.5, 'sine', 0.06); },
    erro() { if (!somLigado() || !ctx()) return; const t = AC.currentTime; tom(330, t, 0.18, 'sine', 0.12); tom(262, t + 0.14, 0.28, 'sine', 0.12); },
    tambor() { if (!somLigado() || !ctx()) return; const t = AC.currentTime; const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.2); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 0.32); },
    festa() {
      if (!somLigado() || !ctx()) return; const a = AC, t = a.currentTime;
      // fanfarra
      [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.38]].forEach(([f, d]) => { tom(f, t + d, d === 0.38 ? 0.9 : 0.2, 'square', 0.07); tom(f, t + d, d === 0.38 ? 0.9 : 0.2, 'triangle', 0.12); });
      // cornetas de festa
      [0.5, 0.75].forEach((d, k) => { const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter(), lfo = a.createOscillator(), lg = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(320 + k * 60, t + d); o.frequency.linearRampToValueAtTime(640 + k * 80, t + d + 0.35); lfo.frequency.value = 9; lg.gain.value = 18; lfo.connect(lg).connect(o.frequency); lp.type = 'lowpass'; lp.frequency.value = 2200; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(0.06, t + d + 0.05); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.6); o.connect(lp).connect(g).connect(a.destination); o.start(t + d); lfo.start(t + d); o.stop(t + d + 0.65); lfo.stop(t + d + 0.65); });
      // vozes de festa ("êêê!")
      for (let k = 0; k < 7; k++) { const o = a.createOscillator(), g = a.createGain(), f1 = a.createBiquadFilter(), f2 = a.createBiquadFilter(), d = 0.55 + Math.random() * 0.25; const f0 = 210 + Math.random() * 240; o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t + d); o.frequency.linearRampToValueAtTime(f0 * 1.4, t + d + 0.22); o.frequency.linearRampToValueAtTime(f0 * 1.15, t + d + 1.1); f1.type = 'bandpass'; f1.frequency.value = 560; f1.Q.value = 6; f2.type = 'bandpass'; f2.frequency.value = 1900; f2.Q.value = 8; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(0.09, t + d + 0.08); g.gain.linearRampToValueAtTime(0.0001, t + d + 1.25); o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(a.destination); o.start(t + d); o.stop(t + d + 1.3); }
      // aplausos
      const buf = ruido(1);
      for (let i = 0; i < 70; i++) { const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); const d = 0.55 + Math.pow(Math.random(), 1.6) * 2.6; s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 900 + Math.random() * 2200; bp.Q.value = 1.2; g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(0.35 * (1 - (d - 0.55) / 3), t + d + 0.003); g.gain.exponentialRampToValueAtTime(0.0005, t + d + 0.09); s.connect(bp).connect(g).connect(a.destination); s.start(t + d, Math.random() * 0.8, 0.12); }
    }
  };
  const reduzir = () => document.documentElement.classList.contains('a11y-parado') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function confete(qtd = 180, origem) {
    if (reduzir()) return;
    const cv = document.createElement('canvas'); cv.className = 'confete'; document.body.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const cores = ['#8f5c3d', '#788035', '#adb778', '#d4958f', '#f6c945', '#4fb0e6', '#e76f51', '#ffffff'];
    const ox = origem ? origem.x : innerWidth / 2, oy = origem ? origem.y : innerHeight * 0.35;
    const P = Array.from({ length: qtd }, () => ({ x: origem ? ox : Math.random() * innerWidth, y: origem ? oy : -20 - Math.random() * innerHeight * 0.4, vx: origem ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 2.5, vy: origem ? -Math.random() * 9 - 3 : Math.random() * 2 + 2, r: Math.random() * 360, vr: (Math.random() - 0.5) * 14, w: 6 + Math.random() * 7, h: 8 + Math.random() * 10, c: cores[Math.floor(Math.random() * cores.length)], f: Math.random() < 0.3 }));
    const ini = performance.now(); const dur = origem ? 1400 : 3200;
    (function quadro(agora) {
      const el = agora - ini; g.clearRect(0, 0, innerWidth, innerHeight);
      P.forEach((p) => { p.vy += origem ? 0.32 : 0.04; p.x += p.vx; p.y += p.vy; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate((p.r * Math.PI) / 180); g.globalAlpha = Math.max(0, 1 - el / dur); g.fillStyle = p.c; if (p.f) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, Math.PI * 2); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * 0.6); g.restore(); });
      if (el < dur) requestAnimationFrame(quadro); else cv.remove();
    })(ini);
  }
  const Festa = {
    acerto(el) { Som.acerto(); if (el && el.getBoundingClientRect) { const r = el.getBoundingClientRect(); confete(36, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); } falar(sorteia(ELOGIOS), { festa: true }); },
    erro(el) { Som.erro(); if (el) { el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 450); } },
    grande(frase = 'Êêêê! Parabéns! Você conseguiu!') { Som.festa(); confete(220); setTimeout(() => falar(frase, { festa: true }), 1900); }
  };

  /* ---------------- Estrelas, fases e presentes ----------------
     Regras (ajustáveis em Configurações → Estrelas e presentes):
     - cada recurso liberado conta 1 conclusão por fase (jogar de novo não conta);
     - a cada N conclusões (padrão 3) a criança ganha 1 estrela, no máximo X por período (padrão 1 por semana);
     - conclusões que completam uma estrela num período já premiado ficam guardadas e a estrela chega no período seguinte;
     - a fono zera e abre uma nova fase: estrelas de outra cor e novos recursos;
     - a cada M estrelas (padrão 3) a criança ganha um presente da fono. */
  const pad2 = (n) => String(n).padStart(2, '0');
  const ymdL = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const inicioPeriodo = (per, d = new Date()) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (per === 'dia') return x;
    if (per === 'mes') return new Date(d.getFullYear(), d.getMonth(), 1);
    const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow); return x; // semana começa na segunda
  };
  const proximoPeriodo = (per, d = new Date()) => { const x = inicioPeriodo(per, d); if (per === 'dia') x.setDate(x.getDate() + 1); else if (per === 'mes') x.setMonth(x.getMonth() + 1); else x.setDate(x.getDate() + 7); return x; };
  const chavePeriodo = (per, d = new Date()) => { const x = inicioPeriodo(per, d); return per === 'mes' ? ymdL(x).slice(0, 7) : ymdL(x); };
  const NOME_PERIODO = { dia: 'dia', semana: 'semana', mes: 'mês' };
  const Estrelas = {
    cfg() {
      const c = { ...RF.gamificacao, ...(Dados.config().gamificacao || {}) };
      c.conclusoesPorEstrela = Math.max(1, +c.conclusoesPorEstrela || 3); c.limite = Math.max(1, +c.limite || 1);
      c.periodo = ['dia', 'semana', 'mes'].includes(c.periodo) ? c.periodo : 'semana';
      c.estrelasPorPresente = Math.max(1, +c.estrelasPorPresente || 3);
      c.fases = Array.isArray(c.fases) && c.fases.length ? c.fases : RF.gamificacao.fases;
      if (c.unicoPorFase === undefined) c.unicoPorFase = true;
      return c;
    },
    fase(n) { const f = this.cfg().fases; const x = f[(Math.max(1, n) - 1) % f.length]; return { nome: n <= f.length ? x.nome : `Fase ${n}`, cor: x.cor, corNome: x.corNome || '' }; },
    de(pid) {
      const d = Dados.get('conquistas', pid) || {};
      const fase = +d.fase || 1;
      return {
        ...d, fase, concluidos: d.concluidos || [], progresso: +d.progresso || 0, estrelasFase: d.estrelasFase !== undefined ? +d.estrelasFase : (+d.estrelas || 0),
        estrelas: +d.estrelas || 0, cicloPresente: d.cicloPresente !== undefined ? +d.cicloPresente : (+d.estrelas || 0) % this.cfg().estrelasPorPresente,
        presentes: d.presentes !== undefined ? +d.presentes : Math.floor((+d.estrelas || 0) / this.cfg().estrelasPorPresente),
        entregues: +d.entregues || 0, entregas: d.entregas || [], log: d.log || [], fases: d.fases || [], faseInicio: d.faseInicio || ''
      };
    },
    status(pid) {
      const c = this.cfg(), d = this.de(pid), k = chavePeriodo(c.periodo);
      const noPeriodo = d.log.filter((x) => x.origem !== 'sessao' && x.periodo === k).length;
      const bloqueado = noPeriodo >= c.limite;
      return {
        ...this.fase(d.fase), fase: d.fase, estrelas: d.estrelas, estrelasFase: d.estrelasFase, progresso: d.progresso, por: c.conclusoesPorEstrela,
        porPresente: c.estrelasPorPresente, cicloPresente: d.cicloPresente, presentes: d.presentes, entregues: d.entregues, pendentes: Math.max(0, d.presentes - d.entregues),
        limite: c.limite, periodo: c.periodo, nomePeriodo: NOME_PERIODO[c.periodo], noPeriodo, bloqueado, guardada: d.progresso >= c.conclusoesPorEstrela && bloqueado,
        proxima: proximoPeriodo(c.periodo), concluidos: d.concluidos.map((x) => x.rc), unicoPorFase: c.unicoPorFase
      };
    },
    _premiar(d, origem) {
      const c = this.cfg(); d.estrelas += 1; d.estrelasFase += 1; d.cicloPresente += 1; let presente = false;
      if (d.cicloPresente >= c.estrelasPorPresente) { d.cicloPresente = 0; d.presentes += 1; presente = true; }
      d.log = [...d.log, { em: new Date().toISOString(), periodo: chavePeriodo(c.periodo), fase: d.fase, origem }].slice(-200);
      return presente;
    },
    async _salvar(pid, d) { const { log, ...resto } = d; await Dados.salvar('conquistas', pid, { ...resto, log }, { silencioso: true }); },
    /* A criança terminou um recurso pela Área do Usuário */
    async concluir(pid, rc, jogo) {
      const c = this.cfg(), d = this.de(pid);
      if (rc && c.unicoPorFase && d.concluidos.some((x) => x.rc === rc)) return { ...this.status(pid), repetido: true };
      d.concluidos = [...d.concluidos, { rc: rc || '', jogo, em: new Date().toISOString() }]; d.progresso += 1;
      let ganhou = false, presente = false;
      const st0 = this.status(pid);
      if (d.progresso >= c.conclusoesPorEstrela && !st0.bloqueado) { d.progresso -= c.conclusoesPorEstrela; presente = this._premiar(d, 'jogo'); ganhou = true; }
      if (!d.faseInicio) d.faseInicio = new Date().toISOString();
      await this._salvar(pid, d);
      const st = this.status(pid); return { ...st, contou: true, ganhou, presente, guardada: !ganhou && st.progresso >= st.por };
    },
    /* Entrega a estrela guardada quando começa um novo período */
    _sinc: {},
    async sincronizar(pid) {
      if (this._sinc[pid]) return null; const st = this.status(pid); if (!(st.progresso >= st.por && !st.bloqueado)) return null;
      this._sinc[pid] = true;
      try { const d = this.de(pid); d.progresso -= st.por; const presente = this._premiar(d, 'jogo'); await this._salvar(pid, d); return { ...this.status(pid), ganhou: true, presente }; }
      finally { this._sinc[pid] = false; }
    },
    async darEstrela(pid) { const d = this.de(pid); const presente = this._premiar(d, 'sessao'); await this._salvar(pid, d); return { ...this.status(pid), presente }; },
    async entregar(pid, presente) { const d = this.de(pid); d.entregues += 1; d.entregas = [...d.entregas, { em: new Date().toISOString(), presente: presente || '' }]; await this._salvar(pid, d); },
    /* Zera os jogos e as estrelas da fase e abre a próxima fase */
    async novaFase(pid, { zerarPresente = false } = {}) {
      const d = this.de(pid); const agora = new Date().toISOString();
      d.fases = [...d.fases, { fase: d.fase, inicio: d.faseInicio || '', fim: agora, estrelas: d.estrelasFase, concluidos: d.concluidos.length }];
      d.fase += 1; d.faseInicio = agora; d.concluidos = []; d.progresso = 0; d.estrelasFase = 0; if (zerarPresente) d.cicloPresente = 0;
      await this._salvar(pid, d); return this.status(pid);
    },
    barra(pid, grande = false, cheia = false) {
      const s = this.status(pid); const n = cheia ? s.porPresente : s.cicloPresente;
      return `<div class="estrelas ${grande ? 'lg' : ''}" style="--fase:${esc(s.cor)}" aria-label="${s.nome}: ${n} de ${s.porPresente} estrelas até o próximo presente">${Array.from({ length: s.porPresente }, (_, i) => `<span class="st ${i < n ? 'on' : ''}">★</span>`).join('')}<span class="gift ${s.pendentes ? 'on' : ''}">🎁</span></div>`;
    },
    pontos(pid) { const s = this.status(pid); const n = Math.min(s.progresso, s.por); return `<span class="prog-estrela" style="--fase:${esc(s.cor)}" aria-label="${n} de ${s.por} conclusões para a próxima estrela">${Array.from({ length: s.por }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`; },
    dataProxima(st) { return st.proxima.toLocaleDateString('pt-BR', { weekday: st.periodo === 'semana' ? 'long' : undefined, day: '2-digit', month: '2-digit' }); }
  };
  function telaPresente(st) {
    const div = document.createElement('div'); div.className = 'presente-bg';
    div.innerHTML = `<div class="presente" role="dialog" aria-modal="true"><div class="caixa-presente">🎁</div><h2>Você ganhou um presente!</h2><p>${esc(Estrelas.cfg().mensagem)}</p><p class="small muted">${st.estrelas} estrelas no total</p><button class="btn btn-primary" data-act="fechar-presente">Oba!</button></div>`;
    document.body.appendChild(div); Festa.grande('Uhuul! Você ganhou um presente da Fono Rebeca!');
    setTimeout(() => { const c = div.querySelector('.caixa-presente'); if (c) { c.textContent = '🧸'; c.classList.add('aberto'); } }, 1600);
  }
  Acoes['fechar-presente'] = (b) => b.closest('.presente-bg').remove();

  /* ---------------- Dados dos jogos ---------------- */
  const CAT = {
    animais: [['🐶', 'cachorro'], ['🐱', 'gato'], ['🐮', 'vaca'], ['🐷', 'porco'], ['🐔', 'galinha'], ['🐴', 'cavalo'], ['🐑', 'ovelha'], ['🦆', 'pato']],
    comidas: [['🍎', 'maçã'], ['🍌', 'banana'], ['🍞', 'pão'], ['🥛', 'leite'], ['🍉', 'melancia'], ['🥕', 'cenoura'], ['🧀', 'queijo'], ['🍓', 'morango']],
    brinquedos: [['⚽', 'bola'], ['🧸', 'ursinho'], ['🚗', 'carrinho'], ['🪁', 'pipa'], ['🎈', 'balão'], ['🥁', 'tambor'], ['🪀', 'ioiô'], ['🛴', 'patinete']],
    casa: [['🛏️', 'cama'], ['🪑', 'cadeira'], ['🚪', 'porta'], ['🛁', 'banheira'], ['🪥', 'escova'], ['🥄', 'colher'], ['🧦', 'meia'], ['📺', 'televisão']],
    transportes: [['🚌', 'ônibus'], ['🚲', 'bicicleta'], ['✈️', 'avião'], ['🚂', 'trem'], ['⛵', 'barco'], ['🏍️', 'moto'], ['🚁', 'helicóptero'], ['🚒', 'caminhão de bombeiro']],
    corpo: [['👀', 'olhos'], ['👃', 'nariz'], ['👄', 'boca'], ['👂', 'orelha'], ['✋', 'mão'], ['🦶', 'pé'], ['🦷', 'dente'], ['💪', 'braço']],
    roupas: [['👕', 'camisa'], ['👖', 'calça'], ['👗', 'vestido'], ['🧢', 'boné'], ['🧥', 'casaco'], ['👟', 'tênis'], ['👒', 'chapéu'], ['🩳', 'bermuda']]
  };
  const SONS = [['🐶', 'au au', 'cachorro'], ['🐱', 'miau', 'gato'], ['🐮', 'muuu', 'vaca'], ['🐷', 'óinc óinc', 'porco'], ['🐔', 'có có có', 'galinha'], ['🦆', 'quá quá', 'pato'], ['🐑', 'béé', 'ovelha'], ['🚗', 'bi bi', 'carro'], ['🚂', 'piuí', 'trem'], ['🐝', 'zzzz', 'abelha'], ['🐍', 'sssss', 'cobra'], ['🐸', 'croac', 'sapo']];
  const INICIAL = {
    B: { s: 'ba', w: [['⚽', 'bola'], ['🍌', 'banana'], ['👶', 'bebê'], ['🎂', 'bolo'], ['⛵', 'barco'], ['🎈', 'balão']] },
    P: { s: 'pa', w: [['🦆', 'pato'], ['🍞', 'pão'], ['🍿', 'pipoca'], ['🐟', 'peixe'], ['🐷', 'porco'], ['🦶', 'pé']] },
    M: { s: 'ma', w: [['🍎', 'maçã'], ['🐒', 'macaco'], ['✋', 'mão'], ['🏍️', 'moto'], ['🍯', 'mel'], ['🍓', 'morango']] },
    F: { s: 'fa', w: [['🦭', 'foca'], ['🌸', 'flor'], ['🔥', 'fogo'], ['🐜', 'formiga'], ['🧚', 'fada'], ['🫘', 'feijão']] },
    S: { s: 'sa', w: [['🐸', 'sapo'], ['☀️', 'sol'], ['🍦', 'sorvete'], ['👞', 'sapato'], ['🔔', 'sino'], ['🛋️', 'sofá']] },
    T: { s: 'ta', w: [['🍅', 'tomate'], ['🐢', 'tartaruga'], ['🚂', 'trem'], ['🐯', 'tigre'], ['☎️', 'telefone'], ['🥁', 'tambor']] }
  };
  const ROTINAS = {
    manha: { nome: 'Rotina da manhã', passos: [['🛏️', 'Acordar'], ['🪥', 'Escovar os dentes'], ['👕', 'Vestir a roupa'], ['🥣', 'Tomar café'], ['🎒', 'Ir para a escola']] },
    banho: { nome: 'Hora do banho', passos: [['👕', 'Tirar a roupa'], ['🚿', 'Entrar no chuveiro'], ['🧼', 'Passar sabonete'], ['🧺', 'Enxugar o corpo'], ['👚', 'Vestir o pijama']] },
    lanche: { nome: 'Hora do lanche', passos: [['🧼', 'Lavar as mãos'], ['🍎', 'Escolher a fruta'], ['🍽️', 'Comer'], ['🥛', 'Beber'], ['🧽', 'Guardar o prato']] }
  };
  const RIMAS = [[['🐱', 'gato'], ['🦆', 'pato']], [['🍞', 'pão'], ['✋', 'mão']], [['🐭', 'rato'], ['🍽️', 'prato']], [['☝️', 'dedo'], ['😱', 'medo']], [['🪟', 'janela'], ['🍲', 'panela']], [['🦭', 'foca'], ['👄', 'boca']], [['🪑', 'cadeira'], ['🍼', 'mamadeira']], [['🎈', 'balão'], ['🦁', 'leão']], [['🌙', 'lua'], ['🛣️', 'rua']], [['🌸', 'flor'], ['🥁', 'tambor']], [['🧦', 'meia'], ['🐋', 'baleia']], [['🐌', 'caracol'], ['☀️', 'sol']]];
  const SILABAS = [['☀️', 'sol', ['sol']], ['🍞', 'pão', ['pão']], ['🦶', 'pé', ['pé']], ['⚽', 'bola', ['bo', 'la']], ['🐱', 'gato', ['ga', 'to']], ['🏠', 'casa', ['ca', 'sa']], ['🦆', 'pato', ['pa', 'to']], ['🍌', 'banana', ['ba', 'na', 'na']], ['🐒', 'macaco', ['ma', 'ca', 'co']], ['👞', 'sapato', ['sa', 'pa', 'to']], ['🪆', 'boneca', ['bo', 'ne', 'ca']], ['🍿', 'pipoca', ['pi', 'po', 'ca']], ['🐊', 'jacaré', ['ja', 'ca', 'ré']], ['🦋', 'borboleta', ['bor', 'bo', 'le', 'ta']], ['☎️', 'telefone', ['te', 'le', 'fo', 'ne']], ['🐘', 'elefante', ['e', 'le', 'fan', 'te']]];
  const ADIVINHAS = [['🍌', 'banana', ['Sou amarela.', 'Sou uma fruta.', 'O macaco adora me comer.']], ['🐶', 'cachorro', ['Tenho quatro patas.', 'Balanço o rabo quando estou feliz.', 'Faço au au.']], ['⚽', 'bola', ['Sou redonda.', 'Sou de brincar.', 'Você me chuta no futebol.']], ['🪥', 'escova', ['Fico no banheiro.', 'Uso pasta.', 'Limpo os seus dentes.']], ['🚌', 'ônibus', ['Tenho rodas.', 'Levo muitas pessoas.', 'Sou grande e amarelo no caminho da escola.']], ['🐮', 'vaca', ['Moro na fazenda.', 'Dou leite.', 'Faço muuu.']], ['🛏️', 'cama', ['Fico no quarto.', 'Tenho travesseiro.', 'Você dorme em mim.']], ['🍉', 'melancia', ['Sou verde por fora.', 'Sou vermelha por dentro.', 'Sou uma fruta grande e tenho sementes.']], ['🐸', 'sapo', ['Sou verde.', 'Pulo muito.', 'Faço croac.']], ['☂️', 'guarda-chuva', ['Abro e fecho.', 'Uso quando está chovendo.', 'Protejo você da chuva.']], ['🧢', 'boné', ['Sou de vestir.', 'Fico na cabeça.', 'Protejo do sol.']], ['🥛', 'leite', ['Sou branco.', 'Sou de beber.', 'A vaca me dá.']]];
  const DESAFIOS = ['Fale o nome bem alto!', 'Fale o nome bem baixinho, como um segredo.', 'Bata uma palma para cada pedacinho da palavra.', 'Faça o som ou o gesto dessa figura.', 'Invente uma frase com essa palavra.', 'Diga de que cor ela é.', 'Fale o nome bem devagar.', 'Diga onde a gente encontra isso.'];
  const HISTORIAS = {
    pipoca: { titulo: 'O passeio do Pipoca', paginas: [
      { cena: '🐶🏡☀️', texto: 'Era uma vez um cachorrinho chamado Pipoca. Num dia de sol, ele quis passear.', pergunta: 'Complete: “Era uma vez um cachorrinho chamado…”', tipo: 'Completar' },
      { cena: '🐶⚽🌳', texto: 'No parque, Pipoca achou uma bola vermelha e saiu correndo atrás dela.', pergunta: 'O que o Pipoca achou no parque?', tipo: 'O quê?' },
      { cena: '⚽🌊🐶', texto: 'A bola rolou, rolou… e caiu no lago! Pipoca ficou triste.', pergunta: 'Como você acha que o Pipoca ficou? Por quê?', tipo: 'Pergunta aberta' },
      { cena: '🦆⚽🐶', texto: 'Um patinho nadou até a bola e empurrou ela de volta. Pipoca balançou o rabo, feliz!', pergunta: 'Quem ajudou o Pipoca?', tipo: 'Quem?' },
      { cena: '🐶🦆💛', texto: 'Desde aquele dia, Pipoca e o patinho brincam juntos no parque.', pergunta: 'E você, já ajudou um amigo? Conta como foi.', tipo: 'Ligar à vida' }
    ] },
    bolo: { titulo: 'Lia e o bolo de banana', paginas: [
      { cena: '👧👵🏠', texto: 'Lia foi passar a tarde na casa da vovó.', pergunta: 'Onde a Lia foi passar a tarde?', tipo: 'Onde?' },
      { cena: '🍌🥚🥛', texto: 'A vovó pegou banana, ovo e leite. “Vamos fazer um bolo?”', pergunta: 'O que a vovó pegou para fazer o bolo?', tipo: 'O quê?' },
      { cena: '👧🥣🥄', texto: 'Lia mexeu, mexeu, mexeu a massa com a colher de pau.', pergunta: 'Complete: “Lia mexeu, mexeu, mexeu a…”', tipo: 'Completar' },
      { cena: '🔥⏰🎂', texto: 'O bolo foi para o forno. Que cheiro gostoso!', pergunta: 'Do que você acha que é o cheiro? O que vai acontecer agora?', tipo: 'Pergunta aberta' },
      { cena: '👧👵🎂😋', texto: 'Na hora do lanche, Lia e a vovó comeram o bolo juntinhas.', pergunta: 'E você, qual é o bolo que você mais gosta?', tipo: 'Ligar à vida' }
    ] }
  };
  const GRUPOS = {
    'animais-comidas': [['Animais', '🐾', CAT.animais], ['Comidas', '🍽️', CAT.comidas]],
    'brinquedos-casa': [['Brinquedos', '🧸', CAT.brinquedos], ['Coisas da casa', '🏠', CAT.casa]],
    'transportes-roupas': [['Transportes', '🚦', CAT.transportes], ['Roupas', '👕', CAT.roupas]],
    'P-B': [['Começa com P', 'P', INICIAL.P.w], ['Começa com B', 'B', INICIAL.B.w]]
  };
  const PRAXIAS = [['😃', 'Sorria bem grande'], ['😗', 'Faça um biquinho'], ['😛', 'Coloque a língua para fora'], ['👅', 'Tente encostar a língua no nariz'], ['😮', 'Abra bem a boca'], ['😝', 'Língua de um lado para o outro, como um relógio'], ['😚', 'Mande um beijo estalado'], ['🐡', 'Encha as bochechas de ar'], ['🐴', 'Estale a língua como o cavalinho'], ['😬', 'Mostre os dentes']];

  /* Prancha padrão com chave de cores de Fitzgerald */
  const CORES_CAA = { pessoa: 'Pessoas', verbo: 'Ações', subst: 'Coisas', adj: 'Como é / sinto', social: 'Social', neg: 'Negação', pergunta: 'Perguntas' };
  const item = (s, t, cor) => ({ id: Math.random().toString(36).slice(2, 9), s, t, cor, img: '' });
  function pranchaPadrao() {
    return { tamanho: 'medio', grupos: [
      { nome: 'Pessoas', itens: [item('🙋', 'eu', 'pessoa'), item('👉', 'você', 'pessoa'), item('👩', 'mamãe', 'pessoa'), item('👨', 'papai', 'pessoa'), item('👵', 'vovó', 'pessoa'), item('🧑‍⚕️', 'Fono Rebeca', 'pessoa')] },
      { nome: 'Ações', itens: [item('🤲', 'quero', 'verbo'), item('🍽️', 'comer', 'verbo'), item('🥤', 'beber', 'verbo'), item('🎮', 'brincar', 'verbo'), item('🏃', 'vamos', 'verbo'), item('🆘', 'ajuda', 'verbo'), item('👀', 'olha', 'verbo'), item('😴', 'dormir', 'verbo')] },
      { nome: 'Coisas', itens: [item('💧', 'água', 'subst'), item('🥛', 'leite', 'subst'), item('🍪', 'biscoito', 'subst'), item('🍎', 'fruta', 'subst'), item('⚽', 'bola', 'subst'), item('🚗', 'carrinho', 'subst'), item('🎵', 'música', 'subst'), item('📚', 'livro', 'subst')] },
      { nome: 'Sinto', itens: [item('😊', 'feliz', 'adj'), item('😢', 'triste', 'adj'), item('😠', 'bravo', 'adj'), item('🤕', 'dor', 'adj'), item('🥵', 'calor', 'adj'), item('➕', 'mais', 'adj')] },
      { nome: 'Social', itens: [item('👋', 'oi', 'social'), item('🫡', 'tchau', 'social'), item('👍', 'sim', 'social'), item('🙏', 'por favor', 'social'), item('💛', 'obrigado', 'social'), item('👎', 'não', 'neg'), item('🙅', 'não quero', 'neg'), item('✋', 'acabou', 'neg')] },
      { nome: 'Perguntas', itens: [item('❓', 'o quê?', 'pergunta'), item('📍', 'onde?', 'pergunta'), item('🧑', 'quem?', 'pergunta'), item('⏰', 'quando?', 'pergunta')] }
    ] };
  }

  /* ---------------- Estrutura de tela ---------------- */
  let S = {}; let CTX = {}; let ultimo = null;
  const emb = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* Se o modal foi fechado, timers pendentes desenham num elemento solto e não fazem nada visível */
  const J = () => $('#jogo') || document.createElement('div');
  const pontos = (n, t) => `<div class="score" aria-label="${n} de ${t}">${Array.from({ length: t }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  const vez = () => (S.turno % 2 === 0 ? `<span class="pill rose">Vez da criança</span>` : `<span class="pill sage">Vez do adulto</span>`);
  async function fim(msg) {
    clearInterval(S.t); clearTimeout(S.to);
    if (!$('#jogo')) return;
    Festa.grande();
    let extra = ''; let r = null;
    if (CTX.pacienteId && CTX.rc) {
      r = await Estrelas.concluir(CTX.pacienteId, CTX.rc, CTX.jogo); const pid = CTX.pacienteId;
      const falta = Math.max(0, r.por - Math.min(r.progresso, r.por));
      if (r.repetido) extra = `<p class="small muted">Este recurso já valeu nesta fase. Jogue os outros para ganhar a próxima estrela!</p>${Estrelas.pontos(pid)}`;
      else if (r.ganhou) extra = `<div class="ganhou" style="--fase:${esc(r.cor)}">+1 <span>★</span></div>${Estrelas.barra(pid, true, r.presente)}<p class="small muted">${r.presente ? 'Presente conquistado!' : `Faltam ${r.porPresente - r.cicloPresente} estrela${r.porPresente - r.cicloPresente > 1 ? 's' : ''} para o próximo presente.`}</p>`;
      else if (r.guardada) extra = `<p><b>Estrela garantida!</b> Ela chega ${({ dia: 'amanhã', semana: 'na próxima semana', mes: 'no próximo mês' })[r.periodo]}, a partir de ${esc(Estrelas.dataProxima(r))}.</p>${Estrelas.pontos(pid)}`;
      else extra = `<p class="small">Muito bem! ${falta === 1 ? 'Falta 1 recurso' : `Faltam ${falta} recursos`} para a próxima estrela.</p>${Estrelas.pontos(pid)}`;
    } else if (CTX.pacienteId) extra = '';
    else if (!CTX.semEstrelas) extra = '<p class="small muted">Modo teste: as estrelas contam quando a criança joga pela Área do Usuário.</p>';
    J().innerHTML = `<div class="empty fim" style="padding:24px"><h3 style="font-size:30px">${esc(msg)}</h3>${extra}<div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="jogo-repetir">Jogar de novo</button><button class="btn btn-ghost" data-act="fechar-jogo">Sair</button></div></div>`;
    const hb = $('#jogo-estrelas'); if (hb && CTX.pacienteId) hb.innerHTML = Estrelas.barra(CTX.pacienteId);
    if (r && r.ganhou && r.presente) setTimeout(() => telaPresente(r), 2600);
    if (CTX.aoConcluir) CTX.aoConcluir();
  }

  /* ---------------- Jogos ---------------- */
  const G = {};
  G.memoria = { init(cfg) { const pares = +cfg.pares || 4; const lista = emb(CAT[cfg.categoria || 'animais'] || CAT.animais).slice(0, pares); S = { cartas: emb([...lista, ...lista]).map((c, i) => ({ i, e: c[0], n: c[1], ok: false })), abertas: [], achados: 0, pares }; },
    draw() { J().innerHTML = `<p class="prompt-big">Encontre os pares e fale o nome de cada figura</p><div class="board" style="grid-template-columns:repeat(${S.pares <= 3 ? 3 : 4},1fr)">${S.cartas.map((c) => `<button class="tile back" data-act="mem" data-i="${c.i}" aria-label="Carta virada"></button>`).join('')}</div>${pontos(0, S.pares)}`; } };
  Acoes['mem'] = (b) => {
    const c = S.cartas[+b.dataset.i]; if (c.ok || S.abertas.includes(c) || S.abertas.length === 2) return;
    b.classList.remove('back'); b.innerHTML = `${c.e}<small>${esc(c.n)}</small>`; falar(c.n); S.abertas.push(c);
    if (S.abertas.length === 2) {
      const [a, d] = S.abertas;
      setTimeout(() => {
        const bs = S.abertas.map((x) => $(`[data-act="mem"][data-i="${x.i}"]`));
        if (a.n === d.n) { a.ok = d.ok = true; bs.forEach((x) => x.classList.add('ok')); S.achados++; Festa.acerto(bs[1]); $('.score').outerHTML = pontos(S.achados, S.pares); if (S.achados === S.pares) setTimeout(() => fim('Você achou todos os pares!'), 900); }
        else bs.forEach((x) => { x.classList.add('back'); x.innerHTML = ''; });
        S.abertas = [];
      }, 900);
    }
  };

  G.sons = { init() { S = { rodada: 0, total: 5, acertos: 0, fila: emb(SONS).slice(0, 5) }; },
    draw() { const alvo = S.fila[S.rodada]; const ops = emb([alvo, ...emb(SONS.filter((x) => x !== alvo)).slice(0, 3)]);
      J().innerHTML = `<p class="prompt-big">Quem faz “${esc(alvo[1])}”?</p><div class="row" style="justify-content:center"><button class="btn btn-olive" data-act="som-ouvir">${ic('sound')} Ouvir de novo</button></div><div class="board">${ops.map((o) => `<button class="tile" data-act="som-resp" data-n="${esc(o[2])}">${o[0]}<small>${esc(o[2])}</small></button>`).join('')}</div>${pontos(S.acertos, S.total)}`;
      falar(`Quem faz ${alvo[1]}?`); } };
  Acoes['som-ouvir'] = () => falar(`Quem faz ${S.fila[S.rodada][1]}?`);
  Acoes['som-resp'] = (b) => { const a = S.fila[S.rodada]; if (b.dataset.n === a[2]) { b.classList.add('ok'); S.acertos++; Festa.acerto(b); setTimeout(() => { falar(`O ${a[2]} faz ${a[1]}!`, { festa: true }); S.rodada++; setTimeout(() => (S.rodada >= S.total ? fim('Você conhece os sons!') : G.sons.draw()), 1500); }, 900); } else { Festa.erro(b); falar(sorteia(QUASE)); } };

  G.inicial = { init(cfg) { S = { L: cfg.som || 'B', rodada: 0, total: 5, acertos: 0 }; },
    draw() { const g = INICIAL[S.L]; const alvo = emb(g.w)[0]; const outros = emb(Object.entries(INICIAL).filter(([k]) => k !== S.L).flatMap(([, v]) => v.w)).slice(0, 3); S.alvo = alvo[1];
      J().innerHTML = `<p class="prompt-big">Qual figura começa com “${esc(g.s)}”?</p><div class="row" style="justify-content:center"><button class="btn btn-olive" data-act="ini-ouvir">${ic('sound')} Ouvir o som</button></div><div class="board">${emb([alvo, ...outros]).map((o) => `<button class="tile" data-act="ini-resp" data-n="${esc(o[1])}">${o[0]}<small>${esc(o[1])}</small></button>`).join('')}</div>${pontos(S.acertos, S.total)}`;
      falar(`Qual figura começa com ${g.s}?`); } };
  Acoes['ini-ouvir'] = () => { const s = INICIAL[S.L].s; falar(`${s}... ${s}... ${s}`); };
  Acoes['ini-resp'] = (b) => { if (b.dataset.n === S.alvo) { b.classList.add('ok'); S.acertos++; Festa.acerto(b); S.rodada++; setTimeout(() => (S.rodada >= S.total ? fim('Você é craque nos sons!') : G.inicial.draw()), 1800); } else { Festa.erro(b); falar(b.dataset.n); } };

  G.silabas = { init(cfg) { const n = cfg.nivel || 'medio'; const pool = SILABAS.filter((w) => (n === 'facil' ? w[2].length <= 2 : n === 'medio' ? w[2].length >= 2 && w[2].length <= 3 : w[2].length >= 3)); S = { fila: emb(pool).slice(0, 6), rodada: 0, toques: 0, acertos: 0 }; },
    draw() { const w = S.fila[S.rodada]; S.toques = 0;
      J().innerHTML = `<p class="prompt-big">Quantos pedacinhos tem “${esc(w[1])}”?</p><div style="text-align:center;font-size:90px;line-height:1">${w[0]}</div><div class="row" style="justify-content:center"><button class="btn btn-olive" data-act="sil-ouvir">${ic('sound')} Ouvir em pedacinhos</button></div>
        <div class="row" style="justify-content:center"><button class="tambor" data-act="sil-bater" aria-label="Bater no tambor">🥁</button></div><div class="pal" id="sil-pal" aria-live="polite"></div>
        <div class="row" style="justify-content:center"><button class="btn btn-ghost" data-act="sil-zerar">Recomeçar</button><button class="btn btn-primary" data-act="sil-ok">Pronto!</button></div>${pontos(S.acertos, S.fila.length)}`;
      falar(w[1]); } };
  Acoes['sil-ouvir'] = () => falar(S.fila[S.rodada][2].join('... '));
  Acoes['sil-bater'] = (b) => { Som.tambor(); S.toques++; b.classList.remove('bate'); void b.offsetWidth; b.classList.add('bate'); $('#sil-pal').innerHTML = Array.from({ length: S.toques }, () => '<span>👏</span>').join(''); };
  Acoes['sil-zerar'] = () => { S.toques = 0; $('#sil-pal').innerHTML = ''; };
  Acoes['sil-ok'] = (b) => { const w = S.fila[S.rodada]; if (S.toques === w[2].length) { S.acertos++; Festa.acerto(b); setTimeout(() => falar(w[2].join(', ') + '!', { festa: true }), 700); S.rodada++; setTimeout(() => (S.rodada >= S.fila.length ? fim('Você bateu as palmas certinho!') : G.silabas.draw()), 2400); } else { Festa.erro(b); falar(`Vamos contar de novo: ${w[2].join('... ')}`); S.toques = 0; $('#sil-pal').innerHTML = ''; } };

  G.rimas = { init(cfg) { const n = +cfg.pares || 4; const ps = emb(RIMAS).slice(0, n); S = { ps, esq: ps.map((p, k) => ({ e: p[0][0], n: p[0][1], k })), dir: emb(ps.map((p, k) => ({ e: p[1][0], n: p[1][1], k }))), sel: null, feitos: [] }; },
    draw() { J().innerHTML = `<p class="prompt-big">Toque em uma figura e depois na que rima com ela</p><div class="rimas"><div class="col">${S.esq.map((x) => `<button class="tile ${S.feitos.includes(x.k) ? 'ok' : ''} ${S.sel === x.k ? 'sel' : ''}" data-act="rima-e" data-k="${x.k}" ${S.feitos.includes(x.k) ? 'disabled' : ''}>${x.e}<small>${esc(x.n)}</small></button>`).join('')}</div><div class="col">${S.dir.map((x) => `<button class="tile ${S.feitos.includes(x.k) ? 'ok' : ''}" data-act="rima-d" data-k="${x.k}" ${S.feitos.includes(x.k) ? 'disabled' : ''}>${x.e}<small>${esc(x.n)}</small></button>`).join('')}</div></div>${pontos(S.feitos.length, S.ps.length)}`; } };
  Acoes['rima-e'] = (b) => { S.sel = +b.dataset.k; falar(S.esq.find((x) => x.k === S.sel).n); G.rimas.draw(); };
  Acoes['rima-d'] = (b) => {
    const k = +b.dataset.k; const d = S.dir.find((x) => x.k === k); if (S.sel === null) { falar(d.n); return; }
    if (k === S.sel) { const e = S.esq.find((x) => x.k === k); S.feitos.push(k); S.sel = null; Festa.acerto(b); setTimeout(() => falar(`${e.n}, ${d.n}! Rimou!`, { festa: true }), 700); G.rimas.draw(); if (S.feitos.length === S.ps.length) setTimeout(() => fim('Você achou todas as rimas!'), 1800); }
    else { Festa.erro(b); falar(`${d.n}... não rima. Tenta outra!`); }
  };

  G.sequencia = { init(cfg) { const r = ROTINAS[cfg.rotina || 'manha']; S = { r, prox: 0, ordem: emb(r.passos) }; },
    draw() { const feitos = S.r.passos.slice(0, S.prox); const rest = S.ordem.filter((p) => !feitos.includes(p));
      J().innerHTML = `<p class="prompt-big">${S.r.nome}: o que vem ${S.prox === 0 ? 'primeiro' : 'depois'}?</p><div class="frase">${feitos.map((p, i) => `<span class="pic"><span>${p[0]}</span>${i + 1}. ${esc(p[1])}</span>`).join('') || '<span class="muted small">Toque na figura certa para começar</span>'}</div><div class="seq">${rest.map((p) => `<button class="tile" data-act="seq-resp" data-n="${esc(p[1])}">${p[0]}<small>${esc(p[1])}</small></button>`).join('')}</div>`; } };
  Acoes['seq-resp'] = (b) => { const c = S.r.passos[S.prox]; if (b.dataset.n === c[1]) { Festa.acerto(b); S.prox++; G.sequencia.draw(); if (S.prox === S.r.passos.length) setTimeout(() => { falar('Primeiro, ' + S.r.passos.map((p) => p[1].toLowerCase()).join(', depois, ') + '!', { festa: true }); setTimeout(() => fim('Rotina completa!'), 5200); }, 900); } else { Festa.erro(b); falar(sorteia(QUASE)); } };

  G.historia = { init(cfg) { S = { h: HISTORIAS[cfg.historia || 'pipoca'] || HISTORIAS.pipoca, p: 0 }; },
    draw() { const pg = S.h.paginas[S.p];
      J().innerHTML = `<div class="livro"><div class="cena">${pg.cena}</div><p class="txt">${esc(pg.texto)}</p><button class="btn btn-olive btn-sm" data-act="hist-ler">${ic('sound')} Ouvir a página</button>
        <div class="note rose" style="text-align:left">${ic('chat')}<div><b>Pergunta para o adulto fazer</b> <span class="pill">${esc(pg.tipo)}</span><br>${esc(pg.pergunta)}<br><span class="small muted">Espere a resposta com calma e repita o que a criança disse acrescentando uma palavra.</span></div></div>
        <div class="row" style="justify-content:space-between"><button class="btn btn-ghost" data-act="hist-nav" data-d="-1" ${S.p === 0 ? 'disabled' : ''}>← Voltar</button><span class="small muted tnum">${S.p + 1} de ${S.h.paginas.length}</span><button class="btn btn-primary" data-act="hist-nav" data-d="1">${S.p === S.h.paginas.length - 1 ? 'Fim da história' : 'Próxima →'}</button></div></div>`;
      falar(pg.texto); } };
  Acoes['hist-ler'] = () => falar(S.h.paginas[S.p].texto);
  Acoes['hist-nav'] = (b) => { const d = +b.dataset.d; if (d > 0 && S.p === S.h.paginas.length - 1) { fim('Que história linda vocês contaram!'); return; } S.p = Math.max(0, S.p + d); G.historia.draw(); };

  G.comando = { init(cfg) { S = { passos: +cfg.passos || 1, rodada: 0, total: 6, acertos: 0 }; },
    draw() { const itens = emb([...CAT.animais, ...CAT.brinquedos, ...CAT.comidas]).slice(0, 6); S.itens = itens; S.alvo = emb(itens).slice(0, S.passos).map((x) => x[1]); S.toques = [];
      const frase = 'Toque ' + S.alvo.map((n, i) => (i === 0 ? '' : i === S.alvo.length - 1 ? ' e depois ' : ', depois ') + artigo(n)).join('');
      S.frase = frase;
      J().innerHTML = `<p class="prompt-big">Ouça e toque na ordem certa</p><div class="row" style="justify-content:center"><button class="btn btn-olive" data-act="cmd-ouvir">${ic('sound')} Ouvir a ordem</button></div><div class="board">${itens.map((o) => `<button class="tile" data-act="cmd-toque" data-n="${esc(o[1])}">${o[0]}<small>${esc(o[1])}</small></button>`).join('')}</div>${pontos(S.acertos, S.total)}`;
      falar(frase); } };
  function artigo(n) { const fem = /a$|ã$|ção$|ade$|agem$/.test(n) && !/^(dia|mapa|sofá|tamanduá)$/.test(n); return (fem ? 'na ' : 'no ') + n; }
  Acoes['cmd-ouvir'] = () => falar(S.frase);
  Acoes['cmd-toque'] = (b) => {
    const n = b.dataset.n; const esperado = S.alvo[S.toques.length];
    if (n === esperado) { S.toques.push(n); b.classList.add('ok'); Som.acerto(); if (S.toques.length === S.alvo.length) { S.acertos++; Festa.acerto(b); S.rodada++; setTimeout(() => (S.rodada >= S.total ? fim('Você seguiu todos os comandos!') : G.comando.draw()), 1700); } }
    else { Festa.erro(b); falar('Ops! Vamos ouvir de novo.'); S.toques = []; $$('[data-act="cmd-toque"]').forEach((x) => x.classList.remove('ok')); setTimeout(() => falar(S.frase), 1300); }
  };

  G.adivinha = { init() { S = { fila: emb(ADIVINHAS).slice(0, 6), rodada: 0, pista: 0, acertos: 0 }; },
    draw() { const a = S.fila[S.rodada]; S.pista = 0; const ops = emb([a, ...emb(ADIVINHAS.filter((x) => x !== a)).slice(0, 3)]);
      J().innerHTML = `<p class="prompt-big">Adivinha quem sou?</p><div class="pistas" id="pistas"><p>💬 ${esc(a[2][0])}</p></div><div class="row" style="justify-content:center"><button class="btn btn-olive" data-act="adv-pista">${ic('spark')} Mais uma pista</button><button class="btn btn-ghost" data-act="adv-ouvir">${ic('sound')} Ouvir</button></div><div class="board">${ops.map((o) => `<button class="tile" data-act="adv-resp" data-n="${esc(o[1])}">${o[0]}<small>${esc(o[1])}</small></button>`).join('')}</div>${pontos(S.acertos, S.fila.length)}`;
      falar(a[2][0]); } };
  Acoes['adv-pista'] = () => { const a = S.fila[S.rodada]; if (S.pista >= a[2].length - 1) return; S.pista++; $('#pistas').insertAdjacentHTML('beforeend', `<p>💬 ${esc(a[2][S.pista])}</p>`); falar(a[2][S.pista]); };
  Acoes['adv-ouvir'] = () => { const a = S.fila[S.rodada]; falar(a[2].slice(0, S.pista + 1).join(' ')); };
  Acoes['adv-resp'] = (b) => { const a = S.fila[S.rodada]; if (b.dataset.n === a[1]) { S.acertos++; b.classList.add('ok'); Festa.acerto(b); setTimeout(() => falar(`Eu sou ${artigo(a[1]).replace(/^n/, '')}!`, { festa: true }), 700); S.rodada++; setTimeout(() => (S.rodada >= S.fila.length ? fim('Você é um ótimo detetive!') : G.adivinha.draw()), 2200); } else { Festa.erro(b); falar('Não sou eu! Quer mais uma pista?'); } };

  G.grupos = { init(cfg) { const g = GRUPOS[cfg.grupos || 'animais-comidas'] || GRUPOS['animais-comidas']; const itens = emb([...emb(g[0][2]).slice(0, 4).map((x) => ({ e: x[0], n: x[1], g: 0 })), ...emb(g[1][2]).slice(0, 4).map((x) => ({ e: x[0], n: x[1], g: 1 }))]); S = { g, itens, feitos: 0, sel: null }; },
    draw() { const atual = S.itens[S.feitos];
      J().innerHTML = `<p class="prompt-big">Arraste a figura para o cesto certo</p><div class="arena" id="arena"><div class="peca" id="peca" data-n="${esc(atual.n)}">${atual.e}<small>${esc(atual.n)}</small></div></div>
        <div class="cestos">${S.g.map((c, i) => `<button class="cesto" data-act="cesto" data-i="${i}" data-cesto="${i}"><span class="ce">${c[1]}</span>${esc(c[0])}</button>`).join('')}</div><p class="small muted" style="text-align:center">Também dá para tocar na figura e depois no cesto.</p>${pontos(S.feitos, S.itens.length)}`;
      falar(atual.n); arrastar(); } };
  function arrastar() {
    const p = $('#peca'); if (!p) return; let ox = 0, oy = 0, ativo = false;
    p.addEventListener('pointerdown', (e) => { ativo = true; p.setPointerCapture(e.pointerId); ox = e.clientX; oy = e.clientY; p.classList.add('drag'); });
    p.addEventListener('pointermove', (e) => { if (!ativo) return; p.style.transform = `translate(${e.clientX - ox}px, ${e.clientY - oy}px) scale(1.06)`; $$('.cesto').forEach((c) => { const r = c.getBoundingClientRect(); c.classList.toggle('alvo', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }); });
    p.addEventListener('pointerup', (e) => {
      ativo = false; p.classList.remove('drag'); const alvo = $$('.cesto').find((c) => { const r = c.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
      $$('.cesto').forEach((c) => c.classList.remove('alvo'));
      if (Math.abs(e.clientX - ox) + Math.abs(e.clientY - oy) < 8) { S.sel = true; p.classList.add('sel'); falar(S.itens[S.feitos].n); p.style.transform = ''; return; }
      if (alvo) soltar(+alvo.dataset.cesto, alvo); else p.style.transform = '';
    });
  }
  function soltar(i, el) {
    const atual = S.itens[S.feitos]; const p = $('#peca');
    if (atual.g === i) { Festa.acerto(el); S.feitos++; if (S.feitos >= S.itens.length) setTimeout(() => fim('Tudo no lugar certo!'), 900); else setTimeout(() => G.grupos.draw(), 900); if (p) p.style.visibility = 'hidden'; }
    else { Festa.erro(el); falar(`Hum, ${atual.n} não vai aí.`); if (p) { p.style.transform = ''; p.classList.add('no'); setTimeout(() => p.classList.remove('no'), 450); } }
  }
  Acoes['cesto'] = (b) => { if (S.sel) { S.sel = null; soltar(+b.dataset.cesto, b); } };

  G.toupeira = { init(cfg) { const alvo = cfg.alvo || 'animais'; const vel = { devagar: 1700, medio: 1250, rapido: 900 }[cfg.velocidade || 'devagar']; const outros = Object.keys(CAT).filter((k) => k !== alvo && k !== 'corpo').flatMap((k) => CAT[k]); S = { alvo, vel, alvos: CAT[alvo], outros, acertos: 0, meta: 8, saidas: 0, buraco: -1 }; },
    draw() { J().innerHTML = `<p class="prompt-big">Toque só nos ${esc(S.alvo === 'comidas' ? 'alimentos' : S.alvo)}!</p><div class="buracos">${Array.from({ length: 9 }, (_, i) => `<button class="buraco" data-act="toup" data-i="${i}" aria-label="Buraco ${i + 1}"><span></span></button>`).join('')}</div>${pontos(S.acertos, S.meta)}`; falar(`Toque só nos ${S.alvo === 'comidas' ? 'alimentos' : S.alvo}!`); S.to = setTimeout(sobe, 1600); } };
  function sobe() {
    if (!J() || !$('.buracos')) return;
    $$('.buraco').forEach((b) => { b.classList.remove('up'); b.querySelector('span').textContent = ''; });
    if (S.acertos >= S.meta) return;
    let i; do { i = Math.floor(Math.random() * 9); } while (i === S.buraco); S.buraco = i;
    const eAlvo = Math.random() < 0.55; const f = eAlvo ? emb(S.alvos)[0] : emb(S.outros)[0];
    const b = $$('.buraco')[i]; b.dataset.alvo = eAlvo ? '1' : ''; b.dataset.n = f[1]; b.querySelector('span').textContent = f[0]; b.classList.add('up');
    S.to = setTimeout(sobe, S.vel);
  }
  Acoes['toup'] = (b) => {
    if (!b.classList.contains('up')) return; b.classList.remove('up');
    if (b.dataset.alvo) { S.acertos++; Festa.acerto(b); $('.score').outerHTML = pontos(S.acertos, S.meta); if (S.acertos >= S.meta) { clearTimeout(S.to); setTimeout(() => fim('Que reflexo! Pegou todos!'), 900); } }
    else { Festa.erro(b); falar(`${b.dataset.n}? Esse não!`); }
  };

  G.roleta = { init(cfg) { S = { itens: emb(CAT[cfg.categoria || 'animais'] || CAT.animais).slice(0, 8), desafio: cfg.desafio || 'nomear', giros: 0, total: 6, turno: 0, ang: 0, girando: false }; },
    draw() { const n = S.itens.length, R = 140; const cores = ['#8f5c3d', '#adb778', '#d4958f', '#788035', '#c98a84', '#e9c46a', '#8f5c3d', '#adb778'];
      const fatias = S.itens.map((it, i) => { const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2, am = (a0 + a1) / 2; return `<path d="M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z" fill="${cores[i % cores.length]}"/><text x="${R * 0.66 * Math.cos(am)}" y="${R * 0.66 * Math.sin(am) + 11}" text-anchor="middle" font-size="30">${it[0]}</text>`; }).join('');
      J().innerHTML = `<div class="row" style="justify-content:center">${vez()}<span class="small muted">Giro ${Math.min(S.giros + 1, S.total)} de ${S.total}</span></div><div class="roleta"><svg viewBox="-150 -150 300 300" id="roda" style="transform:rotate(${S.ang}deg)">${fatias}<circle r="22" fill="#fff"/></svg><div class="ponteiro">▼</div></div><div id="desafio" class="desafio"></div><div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="girar" ${S.girando ? 'disabled' : ''}>${ic('play')} Girar</button></div>`; } };
  Acoes['girar'] = (b) => {
    if (S.girando) return; S.girando = true; b.disabled = true; const n = S.itens.length; const alvo = Math.floor(Math.random() * n);
    const centro = ((alvo + 0.5) / n) * 360; S.ang = S.ang - (S.ang % 360) + 360 * 5 + (360 - centro);
    const roda = $('#roda'); roda.style.transition = 'transform 3.2s cubic-bezier(.17,.67,.21,1)'; roda.style.transform = `rotate(${S.ang}deg)`;
    let k = 0; const tic = setInterval(() => { Som.tambor(); if (++k > 10) clearInterval(tic); }, 280);
    setTimeout(() => {
      S.girando = false; const it = S.itens[alvo]; const txt = { nomear: `Diga o nome: ${it[1]}!`, frase: `Faça uma frase com ${it[1]}.`, imitar: `Imite ${artigo(it[1]).replace(/^n/, '')}: o som ou o gesto!` }[S.desafio] || `Diga o nome: ${it[1]}!`;
      const dz = $('#desafio'); if (!dz) return;
      dz.innerHTML = `<div class="desafio-card"><div style="font-size:64px">${it[0]}</div><b>${esc(txt)}</b><div class="row" style="justify-content:center;margin-top:10px"><button class="btn btn-olive" data-act="roleta-ok">${ic('check')} Conseguimos!</button></div></div>`;
      falar(txt, { festa: true });
    }, 3300);
  };
  Acoes['roleta-ok'] = (b) => { Festa.acerto(b); S.giros++; S.turno++; if (S.giros >= S.total) setTimeout(() => fim('Que rodada divertida!'), 900); else setTimeout(() => G.roleta.draw(), 1100); };

  G.caixa = { init(cfg) { const n = +cfg.caixas || 9; const base = CAT[cfg.categoria || 'animais'] || CAT.animais; S = { cx: Array.from({ length: n }, (_, i) => ({ i, it: base[i % base.length], d: DESAFIOS[i % DESAFIOS.length], aberta: false })), turno: 0 }; S.cx = emb(S.cx).map((c, i) => ({ ...c, i })); },
    draw() { J().innerHTML = `<div class="row" style="justify-content:center">${vez()}</div><p class="prompt-big">Escolha uma caixa surpresa</p><div class="caixas">${S.cx.map((c) => `<button class="cx ${c.aberta ? 'aberta' : ''}" data-act="abrir-cx" data-i="${c.i}" ${c.aberta ? 'disabled' : ''}>${c.aberta ? c.it[0] : `<span class="num">${c.i + 1}</span>`}</button>`).join('')}</div><div id="cx-desafio"></div>`; } };
  Acoes['abrir-cx'] = (b) => { const c = S.cx[+b.dataset.i]; c.aberta = true; Som.acerto(); confete(30, (() => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()); G.caixa.draw(); $('#cx-desafio').innerHTML = `<div class="desafio-card"><div style="font-size:64px">${c.it[0]}</div><b>${esc(c.it[1])}</b><p>${esc(c.d)}</p><button class="btn btn-olive" data-act="cx-ok">${ic('check')} Feito!</button></div>`; falar(`${c.it[1]}! ${c.d}`, { festa: true }); };
  Acoes['cx-ok'] = (b) => { Festa.acerto(b); S.turno++; if (S.cx.every((c) => c.aberta)) setTimeout(() => fim('Vocês abriram todas as caixas!'), 900); else setTimeout(() => G.caixa.draw(), 800); };

  G.praxias = { init() { S = { i: 0, lista: emb(PRAXIAS).slice(0, 6) }; },
    draw() { const p = S.lista[S.i]; const R = 52, C = 2 * Math.PI * R;
      J().innerHTML = `<p class="small muted" style="text-align:center">Fique de frente para um espelho e faça junto com a criança. ${S.i + 1} de ${S.lista.length}</p><div style="text-align:center;font-size:96px;line-height:1">${p[0]}</div><p class="prompt-big">${esc(p[1])}</p>
        <svg class="timer-ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="8"/><circle id="anel" cx="60" cy="60" r="${R}" fill="none" stroke="var(--rose)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="0" transform="rotate(-90 60 60)"/><text id="seg" x="60" y="68" text-anchor="middle" style="font:600 26px var(--f-body);fill:var(--ink)">5</text></svg>
        <div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="px-iniciar">${ic('play')} Começar (5 segundos)</button><button class="btn btn-ghost" data-act="px-prox">Próxima</button></div>`;
      falar(p[1]); } };
  Acoes['px-iniciar'] = () => { clearInterval(S.t); let t = 5; const C = 2 * Math.PI * 52; S.t = setInterval(() => { t--; const s = $('#seg'), a = $('#anel'); if (s) s.textContent = t; if (a) a.setAttribute('stroke-dashoffset', String(C * (1 - t / 5))); if (t <= 0) { clearInterval(S.t); Festa.acerto($('#anel')); setTimeout(() => Acoes['px-prox'](), 1400); } }, 1000); };
  Acoes['px-prox'] = () => { clearInterval(S.t); S.i++; if (S.i >= S.lista.length) fim('Treino completo! Até amanhã!'); else G.praxias.draw(); };

  /* Prancha de comunicação (personalizável por paciente) */
  G.prancha = { init(cfg) { S = { p: cfg.prancha && cfg.prancha.grupos ? cfg.prancha : pranchaPadrao(), frase: [], g: 0 }; },
    draw() { const p = S.p; const g = p.grupos[S.g] || p.grupos[0];
      J().innerHTML = `<div class="frase" id="frase">${S.frase.map((x) => `<span class="pic fz-${x.cor}">${x.img ? `<img src="${esc(x.img)}" alt="">` : `<span>${x.s}</span>`}${esc(x.t)}</span>`).join('') || '<span class="muted small">Toque nos símbolos para montar a frase</span>'}</div>
        <div class="row"><button class="btn btn-primary" data-act="pr-falar">${ic('sound')} Falar</button><button class="btn btn-ghost" data-act="pr-apagar">Apagar último</button><button class="btn btn-ghost" data-act="pr-limpar">Limpar</button></div>
        <div class="subtabs">${p.grupos.map((x, i) => `<button class="subtab" aria-selected="${i === S.g}" data-act="pr-grupo" data-i="${i}">${esc(x.nome)}</button>`).join('')}</div>
        <div class="prancha tam-${p.tamanho || 'medio'}">${g.itens.map((x, i) => `<button class="pic fz-${x.cor}" data-act="pr-add" data-i="${i}">${x.img ? `<img src="${esc(x.img)}" alt="">` : `<span>${x.s}</span>`}${esc(x.t)}</button>`).join('')}</div>
        <div class="legenda-fz">${Object.entries(CORES_CAA).map(([k, n]) => `<span class="pic fz-${k}">${n}</span>`).join('')}</div>`; } };
  Acoes['pr-grupo'] = (b) => { S.g = +b.dataset.i; G.prancha.draw(); };
  Acoes['pr-add'] = (b) => { const x = S.p.grupos[S.g].itens[+b.dataset.i]; S.frase.push(x); falar(x.t); G.prancha.draw(); };
  Acoes['pr-falar'] = () => falar(S.frase.map((x) => x.t).join(' ') || 'Toque nos símbolos');
  Acoes['pr-apagar'] = () => { S.frase.pop(); G.prancha.draw(); };
  Acoes['pr-limpar'] = () => { S.frase = []; G.prancha.draw(); };

  /* ---------------- Abertura, voz e fundamentação ---------------- */
  function seletorVoz() {
    Voz.carregar(); const vs = Voz.ordenadas(); const at = Voz.atual();
    return `<div class="row small" style="gap:8px"><label for="voz-sel" class="muted">Voz</label><select class="input" id="voz-sel" data-change="voz-sel" style="max-width:240px;padding:6px 10px">${vs.length ? vs.map((v) => `<option value="${esc(v.name)}" ${at && at.name === v.name ? 'selected' : ''}>${esc(v.name.replace(/Microsoft |Google /, ''))}${FEM.test(v.name) ? ' (feminina)' : ''}</option>`).join('') : '<option>Voz do aparelho</option>'}</select><button class="btn btn-ghost btn-xs" data-act="voz-testar">${ic('sound')} Testar</button><label class="check"><input type="checkbox" data-change="som-toggle" ${somLigado() ? 'checked' : ''}><span>Sons de festa</span></label></div>`;
  }
  Acoes['voz-sel'] = (s) => { ls.set('voz', s.value); falar('Oi! Eu sou a voz dos jogos. Vamos brincar?', { festa: true }); };
  Acoes['voz-testar'] = () => { Som.acerto(); falar('Oi! Eu sou a voz dos jogos. Vamos brincar?', { festa: true }); };
  Acoes['som-toggle'] = (c) => ls.set('somDesligado', !c.checked);

  function abrir(jogo, cfg = {}, recurso, ctxJogo = {}) {
    const g = G[jogo]; const meta = RF.jogos[jogo]; if (!g || !meta) return;
    ultimo = [jogo, cfg, recurso, ctxJogo]; CTX = { ...ctxJogo, jogo, rc: recurso && recurso.id }; clearTimeout(S.to); clearInterval(S.t);
    g.init(cfg || {});
    const titulo = jogo === 'sequencia' ? (ROTINAS[cfg.rotina || 'manha'] || {}).nome : jogo === 'historia' ? S.h.titulo : meta.nome;
    UI.modal(`<div class="modal-head"><div><div class="row" style="gap:6px"><span class="eyebrow">${esc(RF.areas[meta.area] || 'Recurso terapêutico')}</span>${meta.modo === 'junto' ? '<span class="pill rose">Brincar junto</span>' : ''}</div><h2>${esc(titulo)}</h2></div><div class="row">${CTX.pacienteId ? `<span id="jogo-estrelas">${Estrelas.barra(CTX.pacienteId)}</span>` : ''}<button class="btn btn-ghost btn-icon" data-act="fechar-jogo" aria-label="Fechar">${ic('x')}</button></div></div>
      <div class="play" id="jogo"></div>
      ${recurso && recurso.nota ? `<div class="note rose" style="margin-top:18px">${ic('heart')}<div><b>Dica da Rebeca:</b> ${esc(recurso.nota)}</div></div>` : ''}
      <div class="row between" style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px">${seletorVoz()}<button class="linkbtn small" data-act="porque" data-jogo="${jogo}">Por que este recurso?</button></div>`,
    { wide: true, onClose: () => { clearInterval(S.t); clearTimeout(S.to); try { speechSynthesis.cancel(); } catch {} } });
    g.draw();
  }
  function refsHtml(keys) { return `<ul class="refs">${keys.map((k) => RF.refs[k]).filter(Boolean).map((r) => `<li>${esc(r.t)}${r.u ? ` <a href="${esc(r.u)}" target="_blank" rel="noopener">Acessar</a>` : ''}</li>`).join('')}</ul>`; }
  function porque(jogo) {
    const m = RF.jogos[jogo]; if (!m) return '';
    return `<div class="stack"><div class="row"><span class="pill sage">${esc(RF.areas[m.area])}</span><span class="pill">${esc(m.idade)}</span>${m.modo === 'junto' ? '<span class="pill rose">Brincar junto</span>' : '<span class="pill">Com um adulto por perto</span>'}</div>
      <div><span class="label">Para que serve</span><p>${esc(m.objetivo)}</p></div>
      <div><span class="label">Como brincar em casa</span><ol class="como">${m.como.map((c) => `<li>${esc(c)}</li>`).join('')}</ol></div>
      <div><span class="label">Respaldo científico</span>${refsHtml(m.refs)}</div>
      <div class="note">${ic('info')}<div>${esc(RF.telas.texto)}${refsHtml(RF.telas.refs)}</div></div></div>`;
  }
  Acoes['porque'] = (b) => { const j = b.dataset.jogo; const m = RF.jogos[j]; const reabrir = !!$('#jogo'); UI.modal(`<div class="modal-head"><div><div class="eyebrow">Por que este recurso?</div><h2>${esc(m.nome)}</h2></div><button class="btn btn-ghost btn-icon" data-act="${reabrir ? 'voltar-jogo' : 'fechar'}" aria-label="Fechar">${ic('x')}</button></div>${porque(j)}${reabrir ? `<div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-act="voltar-jogo">Voltar ao jogo</button></div>` : ''}`, { wide: true }); };
  Acoes['voltar-jogo'] = () => { if (ultimo) abrir(...ultimo); };
  Acoes['fechar-jogo'] = () => UI.fechar();
  Acoes['jogo-repetir'] = () => { if (ultimo) abrir(...ultimo); };

  RF.Jogos = { abrir, porque, refsHtml, pranchaPadrao, CORES_CAA, Estrelas, Festa, Voz };
})();
