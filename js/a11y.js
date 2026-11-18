/* Botão de acessibilidade (arrastável para a borda esquerda ou direita) e tema: claro, escuro ou
   automático pelo horário (06:00–17:59 claro; 18:00–05:59 escuro). As escolhas ficam guardadas neste aparelho. */
(function () {
  const root = document.documentElement;
  const PADRAO = { aberto: false, tema: 'claro', temaEscolhido: false, fonte: 1, contraste: false, legivel: false, espaco: false, links: false, parado: false, leitor: false };
  const ZOOM = [0.9, 1, 1.12, 1.25, 1.4];
  let P = { ...PADRAO, ...(ls.get('a11y', {}) || {}) };
  /* Modo claro é o padrão: escuro ou automático só valem se a pessoa escolher na barra */
  if (!P.temaEscolhido) P.tema = 'claro';
  /* O painel sempre começa recolhido; só as escolhas de acessibilidade ficam guardadas */
  P.aberto = false;
  const salvar = () => ls.set('a11y', P);

  /* Posição do botão: borda (esq/dir) e altura (fração da tela). Sem escolha, fica à esquerda no site
     e à direita na Gestão, para não cobrir o menu lateral. */
  const naGestao = () => (location.hash || '').replace('#', '') === 'gestao';
  const lado = () => (P.posLado === 'esq' || P.posLado === 'dir') ? P.posLado : (naGestao() ? 'dir' : 'esq');
  const altura = () => (Number.isFinite(P.posY) ? Math.min(0.95, Math.max(0.05, P.posY)) : 0.5);
  const BOTAO_ALT = 56, MARGEM = 8;
  const yBotao = () => Math.round(Math.min(innerHeight - BOTAO_ALT / 2 - MARGEM, Math.max(BOTAO_ALT / 2 + MARGEM, altura() * innerHeight)));

  const temaAgora = () => { if (P.tema === 'claro') return 'light'; if (P.tema === 'escuro') return 'dark'; const h = new Date().getHours(); return h >= 6 && h < 18 ? 'light' : 'dark'; };
  function aplicar() {
    const t = temaAgora(); if (root.getAttribute('data-theme') !== t) root.setAttribute('data-theme', t);
    root.classList.toggle('a11y-contraste', P.contraste);
    root.classList.toggle('a11y-legivel', P.legivel);
    root.classList.toggle('a11y-espaco', P.espaco);
    root.classList.toggle('a11y-links', P.links);
    root.classList.toggle('a11y-parado', P.parado);
    root.classList.toggle('a11y-leitor', P.leitor);
    root.classList.toggle('a11y-aberta', P.aberto);
    root.classList.toggle('rota-gestao', naGestao());
    document.body.style.zoom = ZOOM[P.fonte] === 1 ? '' : String(ZOOM[P.fonte]);
    posicionar();
  }
  /* O claude.ai pode trocar o tema da página; a escolha feita aqui prevalece */
  new MutationObserver(() => { const t = temaAgora(); if (root.getAttribute('data-theme') !== t) root.setAttribute('data-theme', t); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  setInterval(aplicar, 60000);
  window.addEventListener('hashchange', aplicar);

  const ICONE = '<svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.2" r="1.8" fill="currentColor" stroke="none"/><path d="M5 8.2l7 1.6 7-1.6"/><path d="M12 9.8v4.6"/><path d="M8.6 21l3.4-6.6 3.4 6.6"/></svg>';
  const b = (act, rot, on, extra = '', titulo = '') => `<button type="button" class="a11y-bt" data-act="${act}" ${on === null ? '' : `aria-pressed="${!!on}"`} ${titulo ? `title="${esc(titulo)}"` : ''} ${extra}>${rot}</button>`;
  /* Botão com o ícone, preso numa borda; ao clicar, o painel com as opções expande ao lado dele.
     A animação de entrada só roda quando o painel abre, não a cada opção escolhida. */
  let abrindo = false;
  function html() {
    const botao = `<button type="button" class="a11y-fab" data-act="a11y-alternar" aria-expanded="${P.aberto}" aria-controls="a11y-barra" aria-label="${P.aberto ? 'Recolher' : 'Abrir'} opções de acessibilidade" title="Acessibilidade · arraste para mudar de lugar">${ICONE}</button>`;
    if (!P.aberto) return botao;
    const pct = Math.round(ZOOM[P.fonte] * 100);
    const anima = abrindo; abrindo = false;
    return `${botao}<div class="a11y-barra${anima ? ' a11y-anima' : ''}" id="a11y-barra" role="region" aria-label="Opções de acessibilidade">
      <div class="a11y-cab"><span class="a11y-tit">Acessibilidade</span><button type="button" class="a11y-x" data-act="a11y-fechar" aria-label="Recolher opções de acessibilidade">×</button></div>
      <div class="a11y-in">
        <div class="a11y-grupo" role="group" aria-labelledby="a11y-r-tema"><span class="a11y-rot" id="a11y-r-tema">Tema</span>${b('a11y-tema', '☀ Claro', P.tema === 'claro', 'data-v="claro"')}${b('a11y-tema', '☾ Escuro', P.tema === 'escuro', 'data-v="escuro"')}${b('a11y-tema', '◐ Automático', P.tema === 'auto', 'data-v="auto"', 'Claro das 6h às 17h59, escuro das 18h às 5h59')}</div>
        <div class="a11y-grupo" role="group" aria-labelledby="a11y-r-texto"><span class="a11y-rot" id="a11y-r-texto">Tamanho do texto</span>${b('a11y-fonte', 'A−', null, `data-d="-1" aria-label="Diminuir texto" ${P.fonte === 0 ? 'disabled' : ''}`)}<span class="a11y-pct" aria-live="polite">${pct}%</span>${b('a11y-fonte', 'A+', null, `data-d="1" aria-label="Aumentar texto" ${P.fonte === ZOOM.length - 1 ? 'disabled' : ''}`)}</div>
        <div class="a11y-grupo" role="group" aria-labelledby="a11y-r-leitura"><span class="a11y-rot" id="a11y-r-leitura">Leitura e navegação</span>${b('a11y-tg', '◑ Alto contraste', P.contraste, 'data-k="contraste"')}${b('a11y-tg', 'Aa Fonte legível', P.legivel, 'data-k="legivel"')}${b('a11y-tg', '↔ Espaçamento', P.espaco, 'data-k="espaco"')}${b('a11y-tg', '🔗 Destacar links', P.links, 'data-k="links"')}${b('a11y-tg', '⏸ Pausar animações', P.parado, 'data-k="parado"')}${b('a11y-tg', '🔊 Ler ao tocar', P.leitor, 'data-k="leitor"', 'Toque em um texto para ouvir')}</div>
        <div class="a11y-grupo" role="group" aria-labelledby="a11y-r-pos"><span class="a11y-rot" id="a11y-r-pos">Lugar deste botão</span>${b('a11y-lado', '⇤ Esquerda', lado() === 'esq', 'data-v="esq"')}${b('a11y-lado', 'Direita ⇥', lado() === 'dir', 'data-v="dir"')}${b('a11y-mover', '↑', null, 'data-d="-1" aria-label="Subir o botão"')}${b('a11y-mover', '↓', null, 'data-d="1" aria-label="Descer o botão"')}<span class="a11y-dica-pos">Ou arraste o botão até a borda que preferir.</span></div>
        <div class="a11y-grupo">${b('a11y-reset', '↺ Redefinir', null)}</div>
      </div>
      ${P.leitor ? '<p class="a11y-dica">Leitura ligada: toque em qualquer texto para ouvir.</p>' : ''}
    </div>`;
  }
  /* O botão fica fora do <body> para não ser afetado pelo zoom do texto (mantém o arraste preciso) */
  function caixa() { let box = document.getElementById('a11y'); if (!box) { box = document.createElement('div'); box.id = 'a11y'; root.appendChild(box); } return box; }
  function posicionar() {
    const box = document.getElementById('a11y'); if (!box) return;
    box.dataset.lado = lado();
    const y = yBotao(); box.style.setProperty('--a11y-y', y + 'px');
    const bar = document.getElementById('a11y-barra');
    if (bar) { const h = bar.offsetHeight; const topo = Math.min(innerHeight - h - MARGEM, Math.max(MARGEM, y - h / 2)); bar.style.top = Math.max(MARGEM, topo) + 'px'; }
  }
  function desenhar(foco) {
    const box = caixa(); box.innerHTML = html(); aplicar();
    if (foco) { const el = box.querySelector(foco); if (el) el.focus(); }
  }
  window.addEventListener('resize', posicionar);
  const mudar = (fn, foco) => { fn(); salvar(); desenhar(foco); };

  /* Arrastar o botão: segue o dedo/mouse e, ao soltar, encaixa na borda mais próxima */
  let arraste = null, acabouDeArrastar = false;
  root.addEventListener('pointerdown', (e) => {
    const fab = e.target.closest('.a11y-fab'); if (!fab || e.button > 0) return;
    arraste = { id: e.pointerId, x0: e.clientX, y0: e.clientY, movendo: false, fab };
  });
  root.addEventListener('pointermove', (e) => {
    if (!arraste || e.pointerId !== arraste.id) return;
    if (!arraste.movendo && Math.hypot(e.clientX - arraste.x0, e.clientY - arraste.y0) < 8) return;
    if (!arraste.movendo) { arraste.movendo = true; try { arraste.fab.setPointerCapture(e.pointerId); } catch {} if (P.aberto) { P.aberto = false; desenhar(); arraste.fab = document.querySelector('.a11y-fab'); } caixa().classList.add('arrastando'); }
    const box = caixa(); box.style.setProperty('--a11y-x', Math.round(e.clientX) + 'px'); box.style.setProperty('--a11y-y', Math.round(e.clientY) + 'px');
    e.preventDefault();
  });
  const soltar = (e) => {
    if (!arraste || e.pointerId !== arraste.id) return;
    const a = arraste; arraste = null; if (!a.movendo) return;
    caixa().classList.remove('arrastando');
    P.posLado = e.clientX < innerWidth / 2 ? 'esq' : 'dir'; P.posY = e.clientY / innerHeight;
    /* No celular o navegador ainda manda um "clique" logo depois de soltar: ignora por um instante */
    acabouDeArrastar = true; setTimeout(() => { acabouDeArrastar = false; }, 450);
    salvar(); desenhar('.a11y-fab');
  };
  root.addEventListener('pointerup', soltar);
  root.addEventListener('pointercancel', soltar);

  Acoes['a11y-alternar'] = () => { if (acabouDeArrastar) return; mudar(() => { P.aberto = !P.aberto; abrindo = P.aberto; }, P.aberto ? '.a11y-fab' : '.a11y-bt'); };
  Acoes['a11y-abrir'] = () => mudar(() => { P.aberto = true; abrindo = true; }, '.a11y-bt');
  Acoes['a11y-fechar'] = () => mudar(() => { P.aberto = false; }, '.a11y-fab');
  Acoes['a11y-lado'] = (el) => mudar(() => { P.posLado = el.dataset.v; }, `[data-act="a11y-lado"][data-v="${el.dataset.v}"]`);
  Acoes['a11y-mover'] = (el) => mudar(() => { P.posY = Math.min(0.95, Math.max(0.05, altura() + 0.08 * +el.dataset.d)); }, `[data-act="a11y-mover"][data-d="${el.dataset.d}"]`);
  /* Recolhe com Esc ou ao tocar fora do painel */
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && P.aberto && !document.getElementById('modal')) mudar(() => { P.aberto = false; }, '.a11y-fab'); });
  document.addEventListener('click', (e) => { if (P.aberto && e.target.isConnected && !e.target.closest('#a11y')) mudar(() => { P.aberto = false; }); });
  Acoes['a11y-tema'] = (el) => mudar(() => { P.tema = el.dataset.v; P.temaEscolhido = true; }, `[data-act="a11y-tema"][data-v="${el.dataset.v}"]`);
  Acoes['a11y-fonte'] = (el) => mudar(() => { P.fonte = Math.max(0, Math.min(ZOOM.length - 1, P.fonte + +el.dataset.d)); }, `[data-act="a11y-fonte"][data-d="${el.dataset.d}"]`);
  Acoes['a11y-tg'] = (el) => mudar(() => { P[el.dataset.k] = !P[el.dataset.k]; if (el.dataset.k === 'leitor' && !P.leitor) try { speechSynthesis.cancel(); } catch {} }, `[data-act="a11y-tg"][data-k="${el.dataset.k}"]`);
  /* Redefinir volta as opções de acessibilidade ao padrão, mas mantém o botão onde a pessoa o deixou */
  Acoes['a11y-reset'] = () => mudar(() => { P = { ...PADRAO, aberto: true, posLado: P.posLado, posY: P.posY }; try { speechSynthesis.cancel(); } catch {} }, '[data-act="a11y-reset"]');

  /* Leitura ao tocar */
  function falar(txt) {
    try {
      if (!txt || !window.speechSynthesis) return; speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(txt).replace(/\s+/g, ' ').slice(0, 600)); u.lang = 'pt-BR'; u.rate = 1;
      const v = RF.Jogos && RF.Jogos.Voz && RF.Jogos.Voz.atual ? RF.Jogos.Voz.atual() : null; if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch {}
  }
  document.addEventListener('click', (e) => {
    if (!P.leitor || e.target.closest('#a11y')) return;
    const interativo = e.target.closest('button, a, input, select, textarea, label, [data-act]');
    let el = interativo || e.target.closest('p, h1, h2, h3, h4, h5, li, td, th, dt, dd, small, figcaption, blockquote, .t, .s, .eyebrow, .pill, .msg, .note, .valor');
    if (!el && e.target.innerText && e.target.innerText.length <= 300) el = e.target;
    if (!el) return;
    const txt = interativo ? (interativo.getAttribute('aria-label') || interativo.innerText || interativo.value || '') : el.innerText;
    falar(txt);
    if (!interativo) { el.classList.add('a11y-lendo'); setTimeout(() => el.classList.remove('a11y-lendo'), 1400); }
  }, true);
  document.addEventListener('focusin', (e) => { if (!P.leitor || e.target.closest('#a11y')) return; const el = e.target; if (el.matches && el.matches(':focus-visible')) falar(el.getAttribute('aria-label') || el.innerText || el.value || el.placeholder || ''); });

  RF.A11y = { aplicar, desenhar, prefs: () => ({ ...P }) };
  if (document.body) desenhar(); else document.addEventListener('DOMContentLoaded', () => desenhar());
})();
