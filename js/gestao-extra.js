/* Gestão: recursos terapêuticos com fundamentação, prancha personalizável, estrelas, termos */
(function () {
  const H = RF.G; const E = () => RF.Jogos.Estrelas; const T = () => RF.Termos;
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const ROT = { categoria: 'Categoria', pares: 'Pares', som: 'Som inicial', rotina: 'Rotina', nivel: 'Nível', historia: 'História', passos: 'Passos da ordem', grupos: 'Grupos', alvo: 'Alvo', velocidade: 'Velocidade', desafio: 'Desafio', caixas: 'Caixas' };
  const OPC = { facil: 'Fácil (1 a 2 sílabas)', medio: 'Médio (2 a 3)', dificil: 'Difícil (3 a 4)', manha: 'Rotina da manhã', banho: 'Hora do banho', lanche: 'Hora do lanche', pipoca: 'O passeio do Pipoca', bolo: 'Lia e o bolo de banana', 'animais-comidas': 'Animais × comidas', 'brinquedos-casa': 'Brinquedos × casa', 'transportes-roupas': 'Transportes × roupas', 'P-B': 'Começa com P × B', devagar: 'Devagar', medio_v: 'Médio', rapido: 'Rápido', nomear: 'Nomear', frase: 'Fazer uma frase', imitar: 'Imitar som ou gesto' };
  const rot = (k, o) => (k === 'velocidade' && o === 'medio' ? 'Médio' : OPC[o] || o);

  /* ---------------- Grade de recursos ---------------- */
  RF.GX = {};
  RF.GX.grade = function (p, rcs) {
    const area = App.sub.g.rcArea || '';
    const lista = Object.entries(RF.jogos).filter(([, j]) => !area || j.area === area || (area === 'junto' && j.modo === 'junto'));
    const prancha = rcs.find((x) => x.jogo === 'prancha');
    return `<div class="row"><button class="chip" aria-pressed="${!area}" data-act="rc-area" data-a="">Todos · ${Object.keys(RF.jogos).length}</button><button class="chip" aria-pressed="${area === 'junto'}" data-act="rc-area" data-a="junto">Brincar junto</button>${Object.entries(RF.areas).map(([k, n]) => `<button class="chip" aria-pressed="${area === k}" data-act="rc-area" data-a="${k}">${n}</button>`).join('')}</div>
      <div class="games">${lista.map(([k, j]) => {
        const r = rcs.find((x) => x.jogo === k) || {}; const on = !!r.ativo; const cfg = r.cfg || {};
        const cfgHtml = Object.entries(j.config).map(([ck, ops]) => `<div class="field"><label>${ROT[ck] || ck}</label><select class="input" data-rc-cfg="${ck}">${ops.map((o) => `<option value="${o}" ${String(cfg[ck]) === String(o) ? 'selected' : ''}>${esc(rot(ck, String(o)))}</option>`).join('')}</select></div>`).join('');
        return `<div class="panel stack" data-rc-jogo="${k}" data-rc-id="${r.id || ''}" style="border-color:${on ? 'var(--olive)' : 'var(--line)'}">
          <div class="row between"><span style="font-size:30px">${j.icone}</span><label class="check"><input type="checkbox" data-rc-on ${on ? 'checked' : ''}><span class="small">${on ? 'Liberado' : 'Liberar'}</span></label></div>
          <b style="font-size:16px">${esc(j.nome)}</b><p class="small muted">${esc(j.desc)}</p>
          <div class="row" style="gap:6px"><span class="pill sage">${esc(RF.areas[j.area])}</span>${j.modo === 'junto' ? '<span class="pill rose">Brincar junto</span>' : ''}<span class="pill">${esc(j.idade)}</span></div>
          ${cfgHtml}
          ${k === 'prancha' ? `<button class="btn btn-olive btn-sm" data-act="pe-abrir" data-pac="${p.id}">${ic('board')} Personalizar prancha${prancha && prancha.cfg && prancha.cfg.prancha ? ' (personalizada)' : ''}</button>` : ''}
          <div class="field"><label>Orientação para a família</label><input class="input" data-rc-nota value="${esc(r.nota || '')}" placeholder="Ex.: 10 minutos por dia, revezando a vez"></div>
          <div class="row"><button class="btn btn-primary btn-sm" data-act="rc-salvar" data-pac="${p.id}">Salvar</button><button class="btn btn-ghost btn-sm" data-act="rc-testar">${ic('play')} Testar</button><button class="linkbtn small" data-act="porque" data-jogo="${k}">Fundamentação</button></div>
          ${on ? `<div class="row">${H.botoesWhats(H.respsDe(p), (rr) => Whats.preencher(RF.modelosRecado[3].texto, { responsavel: rr.nome.split(' ')[0], paciente: p.nome.split(' ')[0] }), `data-pac="${p.id}"`)}</div>` : ''}
        </div>`; }).join('')}</div>`;
  };
  Acoes['rc-area'] = (b) => { App.sub.g.rcArea = b.dataset.a; App.render(); };
  const lerCfg = (card) => { const cfg = {}; $$('[data-rc-cfg]', card).forEach((s) => { cfg[s.dataset.rcCfg] = isNaN(+s.value) ? s.value : +s.value; }); return cfg; };
  Acoes['rc-salvar'] = async (b) => {
    const card = b.closest('[data-rc-jogo]'); const ativo = card.querySelector('[data-rc-on]').checked; const id = card.dataset.rcId || null; const atual = id ? Dados.get('recursos', id) : null;
    await Dados.salvar('recursos', id, { ...(atual || {}), pacienteId: b.dataset.pac, jogo: card.dataset.rcJogo, ativo, cfg: { ...((atual && atual.cfg) || {}), ...lerCfg(card) }, nota: card.querySelector('[data-rc-nota]').value.trim(), liberadoEm: ativo && !(atual && atual.ativo) ? new Date().toISOString() : (atual && atual.liberadoEm) || '' });
    UI.toast(ativo ? 'Recurso liberado na Área do Usuário.' : 'Recurso salvo como não liberado.'); App.render();
  };
  Acoes['rc-testar'] = (b) => { const card = b.closest('[data-rc-jogo]'); const atual = card.dataset.rcId ? Dados.get('recursos', card.dataset.rcId) : null; RF.Jogos.abrir(card.dataset.rcJogo, { ...((atual && atual.cfg) || {}), ...lerCfg(card) }); };

  /* ---------------- Editor da prancha ---------------- */
  const PALETA = '👩 👨 👵 👴 👶 🧒 👧 👦 🧑‍🏫 🐶 🐱 🍎 🍌 🍇 🍓 🍉 🥛 💧 🧃 🍞 🍪 🍕 🍝 🥣 🍦 🍫 ⚽ 🧸 🚗 🪀 🎈 🧩 🎨 📚 🎵 📺 📱 🛝 🏠 🏫 🛁 🚽 🛏️ 🌳 🏖️ 🛒 🍽️ 🥤 🎮 🏃 🛌 🚿 🪥 🤗 👀 🆘 🤲 ✏️ 😊 😢 😠 🤕 😴 🥵 🥶 🤢 😨 👍 👎 👋 🙏 💛 🙅 ✋ ❓ 📍 ⏰ ➕ ✅'.split(' ');
  const novoItem = () => ({ id: Math.random().toString(36).slice(2, 9), s: '⭐', t: 'nova palavra', cor: 'subst', img: '' });
  function pe() { return RF.PE; }
  function peHtml() {
    const P = pe(); const p = Dados.get('pacientes', P.pid); const g = P.p.grupos[P.g] || P.p.grupos[0];
    return `<div class="modal-head"><div><div class="eyebrow">Prancha de comunicação</div><h2>${esc(p ? p.nome.split(' ')[0] : '')}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="row between"><div class="row"><label class="small muted" for="pe-tam">Tamanho dos símbolos</label><select class="input" id="pe-tam" data-change="pe-tam" style="max-width:160px">${[['grande', 'Grande'], ['medio', 'Médio'], ['pequeno', 'Pequeno']].map(([k, n]) => `<option value="${k}" ${P.p.tamanho === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="row"><button class="btn btn-ghost btn-sm" data-act="pe-padrao">Restaurar padrão</button><button class="btn btn-ghost btn-sm" data-act="pe-testar">${ic('play')} Testar</button><button class="btn btn-primary btn-sm" data-act="pe-salvar">${ic('check')} Salvar prancha</button></div></div>
      <div class="subtabs" style="margin-top:14px">${P.p.grupos.map((x, i) => `<button class="subtab" aria-selected="${i === P.g}" data-act="pe-grupo" data-i="${i}">${esc(x.nome)}</button>`).join('')}<button class="subtab" data-act="pe-grupo-add">+ Página</button></div>
      <div class="row" style="margin:12px 0"><input class="input" id="pe-gnome" data-input="pe-gnome" value="${esc(g.nome)}" style="max-width:260px" aria-label="Nome da página"><button class="btn btn-ghost btn-xs" data-act="pe-grupo-del" ${P.p.grupos.length < 2 ? 'disabled' : ''}>${ic('trash')} Excluir página</button></div>
      <div class="pe-grid">${g.itens.map((x, i) => `<div class="pe-item fz-${x.cor} ${P.sel === i ? 'sel' : ''}">
        <button class="pe-prev" data-act="pe-sel" data-i="${i}" aria-label="Selecionar símbolo">${x.img ? `<img src="${esc(x.img)}" alt="">` : `<span>${x.s}</span>`}</button>
        <input class="input" data-input="pe-t" data-i="${i}" value="${esc(x.t)}" aria-label="Palavra">
        <div class="row" style="gap:4px"><input class="input pe-emo" data-input="pe-s" data-i="${i}" value="${esc(x.s)}" aria-label="Figura (emoji)"><select class="input" data-change="pe-cor" data-i="${i}" aria-label="Cor da categoria">${Object.entries(RF.Jogos.CORES_CAA).map(([k, n]) => `<option value="${k}" ${x.cor === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="row" style="gap:4px;justify-content:space-between"><label class="btn btn-ghost btn-xs">${ic('upload')} Foto<input type="file" accept="image/*" class="sr" data-change="pe-foto" data-i="${i}"></label>${x.img ? `<button class="btn btn-ghost btn-xs" data-act="pe-semfoto" data-i="${i}">Tirar foto</button>` : ''}<button class="btn btn-ghost btn-xs" data-act="pe-mv" data-i="${i}" data-d="-1" aria-label="Mover para trás">←</button><button class="btn btn-ghost btn-xs" data-act="pe-mv" data-i="${i}" data-d="1" aria-label="Mover para frente">→</button><button class="btn btn-danger btn-xs" data-act="pe-del" data-i="${i}" aria-label="Remover">${ic('x')}</button></div>
      </div>`).join('')}<button class="pe-add" data-act="pe-add">${ic('plus')}<span>Adicionar símbolo</span></button></div>
      <div style="margin-top:14px"><span class="label">Figuras rápidas ${P.sel != null ? '(aplica no símbolo selecionado)' : '(toque para criar um símbolo)'}</span><div class="paleta">${PALETA.map((e) => `<button data-act="pe-emoji" data-e="${e}">${e}</button>`).join('')}</div></div>
      <div class="note" style="margin-top:14px">${ic('info')}<div>As cores seguem a chave de Fitzgerald, comum em CAA: pessoas em amarelo, ações em verde, coisas em laranja, descrições em azul, social em rosa, negação em vermelho e perguntas em roxo. Fotos reais da família e dos objetos da criança costumam funcionar melhor nas primeiras pranchas.</div></div>`;
  }
  function peRender() { const m = $('#modal .modal'); if (m) m.innerHTML = peHtml(); }
  Acoes['pe-abrir'] = (b) => {
    const pid = b.dataset.pac; const r = Dados.lista('recursos').find((x) => x.pacienteId === pid && x.jogo === 'prancha');
    RF.PE = { pid, rcId: r ? r.id : null, p: JSON.parse(JSON.stringify((r && r.cfg && r.cfg.prancha) || RF.Jogos.pranchaPadrao())), g: 0, sel: null };
    UI.modal(peHtml(), { wide: true });
  };
  const grupo = () => pe().p.grupos[pe().g];
  Acoes['pe-tam'] = (s) => { pe().p.tamanho = s.value; };
  Acoes['pe-grupo'] = (b) => { pe().g = +b.dataset.i; pe().sel = null; peRender(); };
  Acoes['pe-grupo-add'] = () => { pe().p.grupos.push({ nome: 'Nova página', itens: [] }); pe().g = pe().p.grupos.length - 1; pe().sel = null; peRender(); };
  Acoes['pe-grupo-del'] = () => { if (pe().p.grupos.length < 2) return; pe().p.grupos.splice(pe().g, 1); pe().g = 0; pe().sel = null; peRender(); };
  Acoes['pe-gnome'] = (i) => { grupo().nome = i.value; const t = $$('#modal .subtab')[pe().g]; if (t) t.textContent = i.value; };
  Acoes['pe-t'] = (i) => { grupo().itens[+i.dataset.i].t = i.value; };
  Acoes['pe-s'] = (i) => { grupo().itens[+i.dataset.i].s = i.value; const prev = i.closest('.pe-item').querySelector('.pe-prev span'); if (prev) prev.textContent = i.value; };
  Acoes['pe-cor'] = (s) => { grupo().itens[+s.dataset.i].cor = s.value; peRender(); };
  Acoes['pe-sel'] = (b) => { const i = +b.dataset.i; pe().sel = pe().sel === i ? null : i; peRender(); };
  Acoes['pe-add'] = () => { grupo().itens.push(novoItem()); pe().sel = grupo().itens.length - 1; peRender(); };
  Acoes['pe-del'] = (b) => { grupo().itens.splice(+b.dataset.i, 1); pe().sel = null; peRender(); };
  Acoes['pe-mv'] = (b) => { const i = +b.dataset.i, d = +b.dataset.d, a = grupo().itens; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; pe().sel = j; peRender(); };
  Acoes['pe-emoji'] = (b) => { if (pe().sel == null) { const it = novoItem(); it.s = b.dataset.e; grupo().itens.push(it); pe().sel = grupo().itens.length - 1; } else { const it = grupo().itens[pe().sel]; it.s = b.dataset.e; it.img = ''; } peRender(); };
  Acoes['pe-foto'] = async (inp) => { const f = inp.files && inp.files[0]; if (!f) return; try { grupo().itens[+inp.dataset.i].img = await Img.reduzir(f, 160, 0.72); peRender(); } catch { UI.toast('Não consegui ler essa imagem.', 'bad'); } };
  Acoes['pe-semfoto'] = (b) => { grupo().itens[+b.dataset.i].img = ''; peRender(); };
  Acoes['pe-padrao'] = () => { pe().p = RF.Jogos.pranchaPadrao(); pe().g = 0; pe().sel = null; peRender(); };
  Acoes['pe-testar'] = () => { const copia = JSON.parse(JSON.stringify(pe().p)); const guard = RF.PE; RF.Jogos.abrir('prancha', { prancha: copia }); RF.PE = guard; };
  Acoes['pe-salvar'] = async () => {
    const P = pe(); const atual = P.rcId ? Dados.get('recursos', P.rcId) : null;
    const s = await Dados.salvar('recursos', P.rcId, { ...(atual || {}), pacienteId: P.pid, jogo: 'prancha', ativo: atual ? atual.ativo : true, cfg: { ...((atual && atual.cfg) || {}), prancha: P.p }, nota: (atual && atual.nota) || '', liberadoEm: (atual && atual.liberadoEm) || new Date().toISOString() });
    P.rcId = s.id; UI.fechar(); UI.toast('Prancha salva e liberada na Área do Usuário.'); App.render();
  };

  /* ---------------- Estrelas, fases e presentes ---------------- */
  const tagFase = (st) => `<span class="pill fase-pill" style="--fase:${esc(st.cor)}">★ ${esc(st.nome)}${st.corNome ? ` · ${esc(st.corNome)}` : ''}</span>`;
  RF.GX.presentesPanel = function () {
    const c = E().cfg();
    const lst = H.pacientesAtivos().map((p) => ({ p, st: E().status(p.id) })).filter((x) => x.st.pendentes > 0);
    return `<div class="panel"><div class="panel-head"><h3>Presentes para entregar</h3><span class="pill rose">🎁 ${lst.reduce((t, x) => t + x.st.pendentes, 0)}</span></div>${lst.length ? `<div class="list">${lst.map((x) => `<div class="li">${UI.avatar(x.p)}<div class="grow"><div class="t">${esc(x.p.nome.split(' ')[0])}${H.exTag(x.p)}</div><div class="s">${x.st.pendentes} presente${x.st.pendentes > 1 ? 's' : ''} · ${esc(x.st.nome)} · ${esc(H.nomeLocal(x.p.local))}</div></div><button class="btn btn-ghost btn-xs" data-act="entregar-presente" data-pac="${x.p.id}">Entregue</button></div>`).join('')}</div>` : `<p class="small muted">Nenhum presente pendente. A cada ${c.conclusoesPorEstrela} recursos concluídos a criança ganha 1 estrela (até ${c.limite} por ${({ dia: 'dia', semana: 'semana', mes: 'mês' })[c.periodo]}); a cada ${c.estrelasPorPresente} estrelas, um presente.</p>`}</div>`;
  };
  RF.GX.estrelasFicha = function (p) {
    if (p.ativo === false) return '';
    const st = E().status(p.id); const d = E().de(p.id);
    const rcs = Dados.lista('recursos').filter((x) => x.pacienteId === p.id && x.ativo && RF.jogos[x.jogo] && x.jogo !== 'prancha');
    const valem = rcs.filter((x) => !st.concluidos.includes(x.id));
    const falta = Math.max(0, st.por - Math.min(st.progresso, st.por));
    const nomeRc = (id) => { const r = Dados.get('recursos', id); return r && RF.jogos[r.jogo] ? RF.jogos[r.jogo].nome : 'Recurso removido'; };
    return `<div class="panel" style="margin-top:20px"><div class="panel-head"><h3>Estrelas e presentes</h3><div class="row">${tagFase(st)}${E().barra(p.id, true)}</div></div>
      <div class="cols-2" style="gap:16px"><div class="cred-box"><span class="muted">Fase atual</span><span>${esc(st.nome)}${st.corNome ? ` (estrelas ${esc(st.corNome)})` : ''}</span>
        <span class="muted">Estrelas nesta fase</span><b>${st.estrelasFase}</b><span class="muted">Estrelas no total</span><span>${st.estrelas}</span>
        <span class="muted">Próxima estrela</span><span style="display:flex;gap:8px;align-items:center">${E().pontos(p.id)} ${Math.min(st.progresso, st.por)} de ${st.por}</span>
        <span class="muted">Limite</span><span>${st.limite} por ${esc(st.nomePeriodo)} · ${st.guardada ? `estrela guardada, chega a partir de ${esc(E().dataProxima(st))}` : st.bloqueado ? `já conquistada nesta ${esc(st.nomePeriodo)}` : 'disponível'}</span>
        <span class="muted">Presentes</span><span>${st.presentes} conquistado${st.presentes === 1 ? '' : 's'} · ${st.entregues} entregue${st.entregues === 1 ? '' : 's'}${st.pendentes ? ` · <b style="color:var(--terra-ink)">${st.pendentes} para entregar</b>` : ''}</span></div>
      <div><span class="label">Recursos nesta fase</span>${rcs.length ? `<div class="list">${rcs.map((x) => { const c = d.concluidos.find((y) => y.rc === x.id); return `<div class="li"><span>${RF.jogos[x.jogo].icone}</span><div class="grow"><div class="t small">${esc(RF.jogos[x.jogo].nome)}</div><div class="s">${c ? `Concluído em ${fmt.data(c.em.slice(0, 10))}` : 'Ainda vale estrela'}</div></div>${c ? '<span class="pill ok">✓</span>' : `<span class="pill vale" style="--fase:${esc(st.cor)}">★</span>`}</div>`; }).join('')}</div>` : '<p class="small muted">Nenhum recurso liberado.</p>'}
        ${st.unicoPorFase && valem.length < falta ? `<div class="note warn" style="margin-top:10px">${ic('info')}<div>Restam ${valem.length} recurso${valem.length === 1 ? '' : 's'} que ainda vale${valem.length === 1 ? '' : 'm'} estrela e faltam ${falta} conclusões para a próxima. Libere mais recursos ou inicie uma nova fase.</div></div>` : ''}</div></div>
      <div class="row" style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-act="dar-estrela" data-pac="${p.id}">★ Dar 1 estrela (sessão)</button>${st.pendentes ? `<button class="btn btn-primary btn-sm" data-act="entregar-presente" data-pac="${p.id}">🎁 Marcar presente entregue</button>` : ''}<button class="btn btn-olive btn-sm" data-act="fase-nova" data-pac="${p.id}">${ic('refresh')} Zerar e iniciar nova fase</button></div>
      ${d.fases.length ? `<div style="margin-top:14px"><span class="label">Fases anteriores</span><div class="list">${d.fases.slice().reverse().map((x) => { const f = E().fase(x.fase); return `<div class="li"><span class="fase-estrela" style="--fase:${esc(f.cor)}">★</span><div class="grow"><div class="t small">${esc(f.nome)}</div><div class="s">${x.inicio ? fmt.data(x.inicio.slice(0, 10)) + ' a ' : 'até '}${fmt.data(x.fim.slice(0, 10))} · ${x.estrelas} estrela${x.estrelas === 1 ? '' : 's'} · ${x.concluidos} recurso${x.concluidos === 1 ? '' : 's'} concluído${x.concluidos === 1 ? '' : 's'}</div></div></div>`; }).join('')}</div></div>` : ''}
      ${d.concluidos.length ? `<p class="small muted" style="margin-top:10px">Últimas conclusões: ${d.concluidos.slice(-4).reverse().map((x) => `${esc(nomeRc(x.rc))} (${fmt.data(x.em.slice(0, 10))})`).join(', ')}.</p>` : ''}</div>`;
  };
  Acoes['dar-estrela'] = async (b) => { const r = await E().darEstrela(b.dataset.pac); UI.toast(r.presente ? 'Estrela dada! Presente conquistado 🎁' : 'Estrela dada!'); App.render(); };
  Acoes['entregar-presente'] = async (b) => { await E().entregar(b.dataset.pac); UI.toast('Presente registrado como entregue.'); App.render(); };
  Acoes['fase-nova'] = (b) => {
    const p = Dados.get('pacientes', b.dataset.pac); if (!p) return; const st = E().status(p.id); const prox = E().fase(st.fase + 1);
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Nova fase · ${esc(p.nome.split(' ')[0])}</div><h2>Iniciar ${esc(prox.nome)}?</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="stack"><p>Os jogos e as estrelas da ${esc(st.nome)} são zerados: todos os recursos voltam a valer estrela. Na nova fase as estrelas ficam <b class="fase-nome" style="--fase:${esc(prox.cor)}">★ ${esc(prox.corNome || 'de outra cor')}</b>.</p>
        <p class="small muted">O histórico da ${esc(st.nome)} (${st.estrelasFase} estrela${st.estrelasFase === 1 ? '' : 's'}, ${st.concluidos.length} recurso${st.concluidos.length === 1 ? '' : 's'} concluído${st.concluidos.length === 1 ? '' : 's'}) fica guardado. Presentes já conquistados continuam para entregar.</p>
        <label class="check"><input type="checkbox" id="nf-desativar" checked><span>Desativar os recursos atuais para liberar recursos novos (a prancha de comunicação continua liberada)</span></label>
        <label class="check"><input type="checkbox" id="nf-presente"><span>Zerar também as estrelas que contam para o próximo presente (hoje: ${st.cicloPresente} de ${st.porPresente})</span></label>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-act="fechar">Cancelar</button><button class="btn btn-primary" data-act="fase-nova-ok" data-pac="${p.id}">${ic('refresh')} Iniciar ${esc(prox.nome)}</button></div></div>`);
  };
  Acoes['fase-nova-ok'] = async (b) => {
    const pid = b.dataset.pac; const desativar = $('#nf-desativar').checked; const zerar = $('#nf-presente').checked; b.disabled = true;
    const st = await E().novaFase(pid, { zerarPresente: zerar });
    if (desativar) for (const r of Dados.lista('recursos').filter((x) => x.pacienteId === pid && x.ativo && x.jogo !== 'prancha')) await Dados.atualizar('recursos', r.id, { ativo: false });
    UI.fechar(); App.sub.g.fichaTab = desativar ? 'recursos' : (App.sub.g.fichaTab || 'resumo'); App.render();
    UI.toast(`${st.nome} iniciada.${desativar ? ' Libere os recursos novos.' : ''}`);
  };
  RF.GX.cfgEstrelas = function () {
    const c = E().cfg(); const fases = App.sub.g.gFases || c.fases;
    return `<form class="panel stack" style="max-width:760px" data-submit="salvar-estrelas"><h3>Estrelas e presentes</h3>
      <p class="small muted">A criança ganha estrela concluindo os recursos liberados na Área do Usuário. Você também pode dar estrelas nas sessões, pela ficha do paciente; essas não contam no limite.</p>
      <div class="grid-form">
        <div class="field"><label for="ge-conc">Recursos concluídos para ganhar 1 estrela</label><input class="input tnum" id="ge-conc" type="number" min="1" max="20" value="${c.conclusoesPorEstrela}"></div>
        <div class="field"><span class="label">Limite de estrelas por paciente</span><div class="row" style="flex-wrap:nowrap"><input class="input tnum" id="ge-lim" type="number" min="1" max="10" value="${c.limite}" style="max-width:90px" aria-label="Quantidade"><span class="small">por</span><select class="input" id="ge-per" aria-label="Período">${[['dia', 'dia'], ['semana', 'semana (segunda a domingo)'], ['mes', 'mês']].map(([k, n]) => `<option value="${k}" ${c.periodo === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
        <div class="field"><label for="ge-por">Estrelas para ganhar um presente</label><input class="input tnum" id="ge-por" type="number" min="1" max="20" value="${c.estrelasPorPresente}"></div>
      </div>
      <label class="check"><input type="checkbox" id="ge-unico" ${c.unicoPorFase ? 'checked' : ''}><span>Cada recurso vale estrela uma vez por fase. Jogar de novo continua liberado, mas só volta a valer quando você zerar e abrir uma nova fase.</span></label>
      <div class="field"><label for="ge-msg">Mensagem ao ganhar o presente</label><textarea class="input" id="ge-msg" rows="2">${esc(c.mensagem)}</textarea></div>
      <div class="field"><span class="label">Fases e cores das estrelas</span>
        <div class="fases-ed">${fases.map((f, i) => `<div class="fase-row" data-fase-row><span class="fase-estrela" style="--fase:${esc(f.cor)}">★</span><input class="input" data-f="nome" value="${esc(f.nome)}" aria-label="Nome da fase ${i + 1}"><input class="input cor" type="color" data-f="cor" value="${esc(f.cor)}" aria-label="Cor da fase ${i + 1}" data-input="fase-cor"><input class="input" data-f="corNome" value="${esc(f.corNome || '')}" placeholder="ex.: azuis" aria-label="Nome da cor da fase ${i + 1}"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-act="fase-del" data-i="${i}" ${fases.length < 2 ? 'disabled' : ''} aria-label="Remover fase ${i + 1}">${ic('trash')}</button></div>`).join('')}</div>
        <div class="row"><button type="button" class="btn btn-ghost btn-sm" data-act="fase-add">${ic('plus')} Adicionar fase</button><span class="hint">Depois da última, as cores recomeçam.</span></div></div>
      <div class="field"><label for="ge-msgf">Mensagem de nova fase (use {cor} para o nome da cor)</label><textarea class="input" id="ge-msgf" rows="2">${esc(c.mensagemFase)}</textarea></div>
      <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Salvar</button></div></form>`;
  };
  const lerFases = () => $$('[data-fase-row]').map((r) => ({ nome: r.querySelector('[data-f="nome"]').value.trim() || 'Fase', cor: r.querySelector('[data-f="cor"]').value, corNome: r.querySelector('[data-f="corNome"]').value.trim() }));
  Acoes['fase-cor'] = (i) => { const s = i.closest('[data-fase-row]').querySelector('.fase-estrela'); if (s) s.style.setProperty('--fase', i.value); };
  Acoes['fase-add'] = () => { const f = lerFases(); const paleta = ['#E9B52F', '#3E9BD6', '#5DAE3B', '#E0679A', '#8E6AD1', '#E07A3E', '#2BB3A3']; f.push({ nome: `Fase ${f.length + 1}`, cor: paleta[f.length % paleta.length], corNome: '' }); App.sub.g.gFases = f; App.render(); };
  Acoes['fase-del'] = (b) => { const f = lerFases(); f.splice(+b.dataset.i, 1); App.sub.g.gFases = f; App.render(); };
  Acoes['salvar-estrelas'] = async () => {
    const n = (id, d, max = 20) => Math.min(max, Math.max(1, Math.round(+val(id) || d)));
    const g = { conclusoesPorEstrela: n('ge-conc', 3), limite: n('ge-lim', 1, 10), periodo: val('ge-per') || 'semana', unicoPorFase: $('#ge-unico').checked, estrelasPorPresente: n('ge-por', 3), mensagem: val('ge-msg').trim() || RF.gamificacao.mensagem, mensagemFase: val('ge-msgf').trim() || RF.gamificacao.mensagemFase, fases: lerFases() };
    await Dados.salvar('config', 'site', { ...Dados.config(), gamificacao: g }); App.sub.g.gFases = null; UI.toast('Regras das estrelas salvas.'); App.render();
  };

  /* ---------------- Termos na ficha e configuração ---------------- */
  RF.GX.imgPill = function (p) { const s = T().imagemPaciente(p); return `<span class="pill ${s.cls}">${s.txt}</span>`; };
  RF.GX.termosFicha = function (p, rs) {
    const s = T().imagemPaciente(p);
    return `<div class="note ${s.st === 'autorizado' ? '' : s.st === 'negado' ? 'warn' : 'rose'}">${ic('info')}<div><b>${s.txt}.</b> ${s.st === 'autorizado' ? 'Pode usar imagem, vídeo e voz em conteúdos educativos, sem diagnóstico, nome completo ou dados da família.' : s.st === 'negado' ? 'Não use imagem, vídeo ou voz desta criança nas redes ou no site.' : 'Aguarde a resposta dos responsáveis no primeiro acesso antes de usar qualquer imagem.'}</div></div>
      <div class="cols-3" style="margin-top:16px">${rs.map((r) => { const t = T().tcle(r, p.id); const lg = T().lgpdOk(r);
        return `<div class="panel stack"><b>${esc(r.nome)}</b>
          <div class="cred-box"><span class="muted">LGPD</span><span>${lg ? `<span class="pill ok">Aceito</span> ${fmt.dataHora(r.lgpd.em)}` : r.lgpd ? '<span class="pill warn">Versão antiga</span>' : '<span class="pill warn">Pendente</span>'}</span><span class="muted">Imagem</span><span>${!t ? '<span class="pill warn">Pendente</span>' : t.revogadoEm ? `<span class="pill bad">Revogado</span> ${fmt.dataHora(t.revogadoEm)}` : t.resposta === 'sim' ? `<span class="pill ok">Autorizou</span> ${fmt.dataHora(t.em)}` : `<span class="pill bad">Não autorizou</span> ${fmt.dataHora(t.em)}`}</span>${t && t.hash ? `<span class="muted">Código</span><span class="small tnum">${esc(t.hash.slice(0, 16))}</span>` : ''}</div>
          <div class="row">${r.lgpd ? `<button class="btn btn-ghost btn-xs" data-act="g-pdf-lgpd" data-id="${r.id}">${ic('download')} LGPD</button>` : ''}${t ? `<button class="btn btn-ghost btn-xs" data-act="g-pdf-tcle" data-id="${r.id}" data-pac="${p.id}">${ic('download')} TCLE</button>` : ''}</div></div>`; }).join('')}</div>`;
  };
  Acoes['g-pdf-lgpd'] = (b) => T().pdfLGPD(Dados.get('responsaveis', b.dataset.id));
  Acoes['g-pdf-tcle'] = (b) => T().pdfTCLE(Dados.get('responsaveis', b.dataset.id), b.dataset.pac);
  const paraTexto = (t) => t.secoes.map(([a, b]) => `## ${a}\n${b}`).join('\n\n');
  const deTexto = (s) => s.split(/^##\s*/m).map((x) => x.trim()).filter(Boolean).map((x) => { const i = x.indexOf('\n'); return i < 0 ? [x, ''] : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
  RF.GX.cfgTermos = function () {
    const box = (tipo, nome) => { const t = T().atual(tipo); return `<form class="panel stack" data-submit="salvar-termo" data-tipo="${tipo}"><div class="row between"><h3>${nome}</h3><span class="pill">Versão ${esc(t.versao)}</span></div>
      <div class="grid-form"><div class="field"><label>Título</label><input class="input" data-k="titulo" value="${esc(t.titulo)}"></div><div class="field"><label>Versão</label><input class="input" data-k="versao" value="${esc(t.versao)}"><span class="hint">Mudou o texto? Aumente a versão (ex.: 1.1) para pedir novo aceite.</span></div></div>
      <div class="field"><label>Texto (cada seção começa com ## e o título)</label><textarea class="input" data-k="texto" rows="14" style="font-size:13px">${esc(paraTexto(t))}</textarea>${tipo === 'tcle' ? '<span class="hint">Use {crianca}, {responsavel} e {documento} para preencher automaticamente.</span>' : ''}</div>
      <div class="row" style="justify-content:space-between"><button type="button" class="btn btn-ghost btn-sm" data-act="termo-restaurar" data-tipo="${tipo}">Restaurar modelo</button><div class="row"><button type="button" class="btn btn-ghost btn-sm" data-act="termo-previa" data-tipo="${tipo}">${ic('download')} PDF de exemplo</button><button class="btn btn-primary btn-sm" type="submit">Salvar</button></div></div></form>`; };
    return `<div class="note warn">${ic('info')}<div><b>Modelos iniciais.</b> Os textos foram escritos com base na LGPD, no ECA e no Código Civil, mas não substituem a revisão de um advogado. Revise antes do lançamento oficial.</div></div><div class="cols-2" style="margin-top:16px">${box('lgpd', 'Termo LGPD')}${box('tcle', 'TCLE · uso de imagem')}</div>`;
  };
  Acoes['salvar-termo'] = async (f) => {
    const tipo = f.dataset.tipo; const g = (k) => f.querySelector(`[data-k="${k}"]`).value.trim(); const secoes = deTexto(f.querySelector('[data-k="texto"]').value);
    if (!secoes.length) { UI.toast('O texto precisa ter pelo menos uma seção começando com ##.', 'bad'); return; }
    const c = Dados.config(); await Dados.salvar('config', 'site', { ...c, termos: { ...(c.termos || {}), [tipo]: { titulo: g('titulo'), versao: g('versao') || '1.0', secoes } } }); UI.toast('Termo salvo.'); App.render();
  };
  Acoes['termo-restaurar'] = async (b) => { const c = Dados.config(); const t = { ...(c.termos || {}) }; delete t[b.dataset.tipo]; await Dados.salvar('config', 'site', { ...c, termos: t }); UI.toast('Modelo restaurado.'); App.render(); };
  Acoes['termo-previa'] = (b) => { const tipo = b.dataset.tipo; const t = T().atual(tipo); PDF.salvarTermo({ titulo: t.titulo, secoes: T().secoes(tipo, {}), registro: [['Situação', 'Exemplo sem assinatura']], nomeArquivo: `${tipo.toUpperCase()}-modelo.pdf` }); };
})();
