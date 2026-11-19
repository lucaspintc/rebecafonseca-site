/* Backoffice: login da equipe, painel, cadastros, ficha, relatórios, recados, evoluções, recursos e configurações. */
(function () {
  const G = App.sub.g = App.sub.g || { sec: 'painel' };
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const eu = () => App.sessao.gestao;
  const pac = (id) => Dados.get('pacientes', id);
  const respsDe = (p) => (p && p.responsaveis || []).map((id) => Dados.get('responsaveis', id)).filter(Boolean);
  const pacientesAtivos = () => Dados.lista('pacientes').filter((p) => p.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome));
  const nomeLocal = (id) => { const l = Dados.local(id); return l ? l.nome : '—'; };
  const exTag = (o) => o && o.exemplo ? ' <span class="ex">exemplo</span>' : '';
  const linkSite = () => Dados.config().linkSite || '';
  let falhas = 0, bloqueadoAte = 0;

  const NAV = [
    ['painel', 'home', 'Painel'], ['pacientes', 'users', 'Pacientes'], ['relatorios', 'file', 'Relatórios'], ['recados', 'chat', 'Recados'],
    ['evolucoes', 'pulse', 'Evoluções'], ['recursos', 'puzzle', 'Recursos terapêuticos'], '|Marketing', ['redes', 'insta', 'Redes sociais'], '|Sistema', ['config', 'gear', 'Configurações']
  ];
  const TITULOS = { painel: 'Painel', pacientes: 'Pacientes', 'pac-form': 'Cadastro de paciente', ficha: 'Ficha do paciente', relatorios: 'Relatórios', 'rel-editor': 'Relatório', recados: 'Recados', evolucoes: 'Evoluções', recursos: 'Recursos terapêuticos', redes: 'Redes sociais', config: 'Configurações' };

  /* ---------------- Login da equipe ---------------- */
  function telaAuth(titulo, corpo) {
    return `<div class="auth"><div class="side pattern">
      <button class="btn btn-sm" style="background:rgba(255,255,255,.18);color:#fff;align-self:flex-start" data-act="ir" data-rota="inicio">← Voltar ao site</button>
      <div class="stack auth-id" style="gap:18px"><div class="photo"><img src="img/rebeca-perfil.jpg" alt="Rebeca Fonseca, fonoaudióloga"></div><div class="auth-txt"><div class="quem"><b>Rebeca Fonseca</b><span>Fonoaudióloga · ${esc(RF.marca.crfa)}</span></div><h2>${titulo}</h2><p class="hide-sm" style="opacity:.88;max-width:380px">Pacientes, relatórios, recados, evoluções, recursos terapêuticos e redes sociais em um só lugar.</p></div></div>
      <img class="hide-sm" src="img/logo-branco.png" alt="Rebeca Fonseca Fonoaudióloga" style="width:220px">
    </div><div class="main">${corpo}</div></div>`;
  }

  function loginGestao() {
    if (Dados.modo === 'carregando' || (Dados.modo === 'db' && !Dados.pronto('equipe'))) return telaAuth('Gestão do consultório', '<p class="muted">Carregando…</p>');
    const demo = Dados.modo === 'local';
    return telaAuth('Gestão do consultório', `<form data-submit="login-gestao" autocomplete="on">
      <div class="eyebrow">Acesso restrito</div><h1>Entrar na gestão</h1>
      <div class="field"><label for="lg-u">Usuário</label><input class="input" id="lg-u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nome.sobrenome" required></div>
      <div class="field"><label for="lg-p">Senha</label>${UI.pw('lg-p', 'Somente números', 'inputmode="numeric" autocomplete="current-password" required')}<span class="hint">No primeiro acesso, a senha é o número do seu CPF (só números).</span></div>
      <div class="err" id="lg-err" role="alert"></div>
      <button class="btn btn-primary" type="submit">${ic('lock')} Entrar</button>
      ${demo ? `<div class="note warn">${ic('info')}<div><strong>Modo demonstração.</strong> Esta visualização não está ligada ao banco de dados do sistema, então as contas da equipe não aparecem aqui. Abra pelo link do claude.ai para usar os dados reais.</div></div><button class="btn btn-ghost" type="button" data-act="demo-gestao">Explorar a demonstração</button>` : ''}
    </form>`);
  }

  Acoes['login-gestao'] = async () => {
    const err = $('#lg-err');
    const u = val('lg-u').trim().toLowerCase(), p = val('lg-p').trim();
    if (!u || !p) { err.textContent = 'Preencha usuário e senha.'; return; }
    if (Dados.modo === 'supabase') {
      // Login conferido no servidor, com limite de tentativas e bloqueio temporário
      err.textContent = 'Conferindo…';
      try { await Auth.entrar(u, p, 'gestao'); G.sec = 'painel'; App.render(); }
      catch (e) { const el = $('#lg-err'); if (el) el.textContent = (e && e.message) || 'Usuário ou senha incorretos.'; }
      return;
    }
    if (Date.now() < bloqueadoAte) { err.textContent = 'Muitas tentativas. Aguarde 30 segundos e tente de novo.'; return; }
    const reg = Dados.get('equipe', u);
    if (!reg) {
      if (Dados.modo === 'db' && !Dados.lista('equipe').length) err.textContent = 'Sua conta do claude.ai ainda não tem acesso aos dados da equipe. Peça ao Lucas para compartilhar o sistema com você como Editora.';
      else err.textContent = 'Usuário ou senha incorretos.';
      return falhou();
    }
    err.textContent = 'Conferindo…';
    const ok = await Senha.confere(p, reg);
    if (!ok) { err.textContent = 'Usuário ou senha incorretos.'; return falhou(); }
    falhas = 0;
    App.sessao.gestao = { usuario: u, nome: reg.nome, apelido: reg.apelido || reg.nome.split(' ')[0], trocarSenha: !!reg.primeiroAcesso };
    ss.set('sessao:gestao', App.sessao.gestao); App.render();
  };
  function falhou() { falhas++; if (falhas >= 5) { bloqueadoAte = Date.now() + 30000; falhas = 0; } }
  Acoes['demo-gestao'] = () => { App.sessao.gestao = { usuario: 'demonstracao', nome: 'Demonstração', apelido: 'Rebeca', demo: true }; ss.set('sessao:gestao', App.sessao.gestao); App.render(); };
  Acoes['sair-gestao'] = async () => { App.sessao.gestao = null; ss.del('sessao:gestao'); G.sec = 'painel'; if (Dados.modo === 'supabase') await Auth.sair(); App.render(); };

  function senhaFraca(s) { return /^(\d)\1+$/.test(s) || '0123456789'.includes(s) || '9876543210'.includes(s); }

  function trocaSenhaGestao() {
    return telaAuth('Primeiro acesso', `<form data-submit="nova-senha-gestao" autocomplete="off">
      <div class="steps"><span class="on"></span><span></span></div>
      <div class="eyebrow">Olá, ${esc(eu().apelido)}</div><h1>Crie sua nova senha</h1>
      <p class="muted">Use de 6 a 8 números. Evite datas de aniversário e sequências como 123456.</p>
      <div class="field"><label for="ns-1">Nova senha</label>${UI.pw('ns-1', '6 a 8 números', 'inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" required')}</div>
      <div class="field"><label for="ns-2">Repita a nova senha</label>${UI.pw('ns-2', '', 'inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password" required')}</div>
      <div class="err" id="ns-err" role="alert"></div>
      <button class="btn btn-primary" type="submit">Salvar e continuar</button>
      <button class="linkbtn" type="button" data-act="sair-gestao">Sair</button>
    </form>`);
  }
  Acoes['nova-senha-gestao'] = async () => {
    const a = val('ns-1'), b = val('ns-2'), err = $('#ns-err');
    if (!/^\d{6,8}$/.test(a)) { err.textContent = 'A senha precisa ter de 6 a 8 números, sem letras.'; return; }
    if (senhaFraca(a)) { err.textContent = 'Essa senha é fácil de adivinhar. Escolha outra combinação.'; return; }
    if (a !== b) { err.textContent = 'As duas senhas não são iguais.'; return; }
    err.textContent = 'Salvando…';
    if (Dados.modo === 'supabase') {
      try { await Auth.trocarSenha(a); } catch (e) { err.textContent = (e && e.message) || 'Não foi possível salvar a senha.'; return; }
    } else {
      const h = await Senha.hash(a);
      await Dados.atualizar('equipe', eu().usuario, { ...h, primeiroAcesso: false, senhaTrocadaEm: new Date().toISOString() });
    }
    App.sessao.gestao.trocarSenha = false; ss.set('sessao:gestao', App.sessao.gestao);
    UI.toast('Senha criada. Bem-vinda!'); App.render();
  };

  /* ---------------- Estrutura ---------------- */
  function contagem(sec) {
    if (sec === 'redes') return Dados.lista('conteudos').filter((c) => c.status === 'proposto').length;
    if (sec === 'relatorios') return Dados.lista('relatorios').filter((r) => r.status !== 'publicado').length;
    return 0;
  }
  function navItens() {
    const atual = G.sec === 'pac-form' || G.sec === 'ficha' ? 'pacientes' : G.sec === 'rel-editor' ? 'relatorios' : G.sec;
    return NAV.map((n) => typeof n === 'string' ? `<div class="nav-sep">${n.slice(1)}</div>` : (() => { const c = contagem(n[0]); return `<button class="nav-item" data-act="g-sec" data-sec="${n[0]}" ${atual === n[0] ? 'aria-current="page"' : ''}>${ic(n[1])}${n[2]}${c ? `<span class="count">${c}</span>` : ''}</button>`; })()).join('');
  }
  function shell(titulo, acoes, corpo) {
    return `<div class="app">
      <aside class="sidebar"><div class="logo"><img class="brand-logo light-only" src="img/logo-verde.png" alt="Rebeca Fonseca"><img class="brand-logo dark-only" src="img/logo-branco.png" alt="" aria-hidden="true"></div>${navItens()}
        <div class="me"><div class="row">${UI.avatar({ nome: eu().nome })}<div class="grow"><b>${esc(eu().nome)}</b><div class="small muted">${esc(eu().usuario)}</div></div></div><div class="row"><button class="btn btn-ghost btn-xs" data-act="ir" data-rota="inicio">Ver site</button><button class="btn btn-ghost btn-xs" data-act="sair-gestao">${ic('out')} Sair</button></div></div>
      </aside>
      <div class="main">
        <div class="topbar"><div class="in"><h1>${titulo}</h1><div class="grow"></div>${acoes || ''}</div></div>
        <nav class="mobnav" aria-label="Seções">${navItens().replace(/<div class="nav-sep">.*?<\/div>/g, '')}<button class="nav-item" data-act="sair-gestao">${ic('out')}Sair</button></nav>
        <div class="content">${Dados.modo === 'local' ? `<div class="note warn">${ic('info')}<div><strong>Modo demonstração:</strong> os dados ficam só neste navegador. Abra pelo link do claude.ai para usar o banco de dados compartilhado.</div></div>` : ''}${corpo}</div>
      </div></div>`;
  }
  Acoes['g-sec'] = (b) => { G.sec = b.dataset.sec; if (G.sec !== 'ficha') G.fichaTab = 'resumo'; App.render(); window.scrollTo(0, 0); };

  App.views.gestao = function () {
    if (!eu()) return loginGestao();
    if (eu().trocarSenha) return trocaSenhaGestao();
    const sec = G.sec;
    if (sec === 'redes') return shell('Redes sociais', '', RF.Social ? RF.Social.render() : '');
    const map = { painel, pacientes, 'pac-form': pacForm, ficha, relatorios, 'rel-editor': relEditor, recados, evolucoes, recursos, config };
    const f = map[sec] || painel; const r = f();
    return shell(r.titulo || TITULOS[sec], r.acoes, r.corpo);
  };

  /* ---------------- Painel ---------------- */
  function filaDoDia() {
    const itens = []; const hoje = new Date(); const md = hoje.toISOString().slice(5, 10);
    /* Sem lembrete de sessão quando amanhã é feriado na cidade da clínica */
    const { dia: diaAmanha, d: amanha } = amanhaInfo();
    const locaisAmanha = Dados.locais().filter((l) => l.dias.some((d) => d.d === amanha) && !RF.Feriados.doDia(diaAmanha, l.cidade).length).map((l) => l.id);
    pacientesAtivos().forEach((p) => {
      const rs = respsDe(p);
      if (p.nascimento && p.nascimento.slice(5, 10) === md) itens.push({ tipo: 'Aniversário', p, rs, texto: (r) => `Olá, ${r.nome.split(' ')[0]}! Hoje é um dia especial: feliz aniversário, ${p.nome.split(' ')[0]}! Que alegria acompanhar o crescimento dele(a). Um abraço, Rebeca.` });
      if (locaisAmanha.includes(p.local)) itens.push({ tipo: 'Lembrete de sessão', p, rs, texto: (r) => Whats.preencher(RF.modelosRecado[0].texto, { responsavel: r.nome.split(' ')[0], paciente: p.nome.split(' ')[0], local: nomeLocal(p.local) }) });
    });
    Dados.lista('relatorios').filter((r) => r.status === 'publicado' && !(r.envios || []).length).forEach((rel) => {
      const p = pac(rel.pacienteId); if (!p) return;
      itens.push({ tipo: 'Relatório publicado', p, rs: respsDe(p), rel, texto: (r) => Whats.preencher(RF.modelosRecado[2].texto, { responsavel: r.nome.split(' ')[0], paciente: p.nome.split(' ')[0] }) + (linkSite() ? ' ' + linkSite() : '') });
    });
    return itens;
  }
  function botoesWhats(rs, textoFn, extra = '') {
    const com = rs.filter((r) => r.whatsapp);
    if (!com.length) return '<span class="small muted">Nenhum responsável com WhatsApp cadastrado.</span>';
    return com.map((r) => `<a class="btn btn-wa btn-xs" href="${Whats.link(r.whatsapp, textoFn(r))}" target="_blank" rel="noopener" data-act="registrar-envio" data-resp="${r.id}" data-texto="${esc(textoFn(r))}" ${extra}>${ic('whats')} ${esc(r.nome.split(' ')[0])}</a>`).join(' ');
  }
  Acoes['registrar-envio'] = (a) => {
    const r = Dados.get('responsaveis', a.dataset.resp); if (!r) return;
    const pid = a.dataset.pac || (r.pacientes || [])[0];
    Dados.salvar('recados', null, { pacienteId: pid, texto: a.dataset.texto, enviadoEm: new Date().toISOString(), para: [{ id: r.id, nome: r.nome, whatsapp: r.whatsapp }], canal: 'whatsapp', autor: eu().usuario });
    if (a.dataset.rel) { const rel = Dados.get('relatorios', a.dataset.rel); if (rel) Dados.atualizar('relatorios', rel.id, { envios: [...(rel.envios || []), { em: new Date().toISOString(), para: r.id }] }); }
  };

  function amanhaInfo() { const F = RF.Feriados; const dia = F.somar(F.hojeISO(), 1); return { dia, d: F.diaSemana(dia) }; }
  /* Clínicas com agenda no dia que caem em feriado na cidade delas */
  function emFeriado(dia) {
    const F = RF.Feriados; const d = F.diaSemana(dia);
    return Dados.locais().filter((l) => l.dias.some((x) => x.d === d)).map((l) => ({ l, fs: F.doDia(dia, l.cidade) })).filter((x) => x.fs.length);
  }
  const nomesFeriado = (fs) => fs.map(RF.Feriados.curto).filter((v, i, a) => a.indexOf(v) === i).join(' e ');
  function avisoFeriado(dia, quando) {
    const xs = emFeriado(dia); if (!xs.length) return '';
    const F = RF.Feriados; const geral = F.geral(dia);
    const amanha = quando === 'Amanhã';
    const txt = geral.length
      ? `${quando} é feriado: ${nomesFeriado(geral)}. Não há atendimento nas clínicas${amanha ? ', por isso não há lembretes de sessão' : ''}.`
      : xs.map((x) => `${quando} é feriado em ${x.l.cidade} (${nomesFeriado(x.fs)}): sem atendimento na ${nomeLocal(x.l.id)}.`).join(' ') + (amanha ? ` Os lembretes de sessão ${xs.length > 1 ? 'dessas clínicas' : 'dessa clínica'} não aparecem.` : '');
    return `<div class="note warn" style="margin-bottom:12px">${ic('flag')}<span>${esc(txt)}</span></div>`;
  }

  function painel() {
    const ps = pacientesAtivos(); const hojeDia = RF.Feriados.hojeISO(); const d = RF.Feriados.diaSemana(hojeDia);
    const ferHoje = emFeriado(hojeDia).map((x) => x.l.id);
    const locaisHoje = Dados.locais().filter((l) => l.dias.some((x) => x.d === d) && !ferHoje.includes(l.id));
    const rasc = Dados.lista('relatorios').filter((r) => r.status !== 'publicado');
    const sem = Date.now() - 7 * 864e5; const rec7 = Dados.lista('recados').filter((r) => new Date(r.enviadoEm).getTime() > sem);
    const props = Dados.lista('conteudos').filter((c) => c.status === 'proposto');
    const prox = Dados.lista('conteudos').filter((c) => c.status === 'agendado' && c.agendadoPara).sort((a, b) => a.agendadoPara.localeCompare(b.agendadoPara)).slice(0, 4);
    const fila = filaDoDia();
    const h = new Date().getHours(); const saud = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    const corpo = `
      <div class="bubble soft"><div class="row between"><div><div class="eyebrow">${RF.diasSemana[d]}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</div><h2 style="font-size:30px;margin-top:6px">${saud}, ${esc(eu().apelido)}.</h2><p class="muted" style="margin-top:6px">${locaisHoje.length ? 'Hoje você atende em ' + esc(locaisHoje.map((l) => `${l.nome} (${l.dias.find((x) => x.d === d).turno.toLowerCase()})`).join(' e ')) + '.' : ferHoje.length ? 'Hoje é feriado: não há atendimento na agenda.' : 'Hoje não há atendimento na agenda.'}</p></div>
        <div class="row"><button class="btn btn-primary" data-act="novo-paciente">${ic('plus')} Novo paciente</button><button class="btn btn-ghost" data-act="novo-relatorio">${ic('file')} Novo relatório</button></div></div></div>
      <div class="kpis">
        <div class="kpi"><div class="eyebrow">Pacientes ativos</div><div class="v">${ps.length}</div><div class="d muted">${Dados.lista('responsaveis').filter((r) => r.primeiroAcesso).length} acesso(s) aguardando primeiro login</div></div>
        <div class="kpi"><div class="eyebrow">Relatórios em rascunho</div><div class="v">${rasc.length}</div><div class="d muted">${Dados.lista('relatorios').filter((r) => r.status === 'publicado').length} publicados no portal</div></div>
        <div class="kpi"><div class="eyebrow">Recados em 7 dias</div><div class="v">${rec7.length}</div><div class="d muted">registrados com data e hora</div></div>
        <div class="kpi"><div class="eyebrow">Posts para aprovar</div><div class="v">${props.length}</div><div class="d"><button class="linkbtn" data-act="g-sec" data-sec="redes">Ver propostas</button></div></div>
      </div>
      <div class="cols-2">
        <div class="panel"><div class="panel-head"><div><h3>Envios do dia</h3><p class="small muted">Mensagens prontas geradas pelo sistema: aniversários, lembretes da sessão de amanhã e relatórios ainda não enviados.</p></div></div>
          ${avisoFeriado(hojeDia, 'Hoje')}${avisoFeriado(amanhaInfo().dia, 'Amanhã')}
          ${fila.length ? `<div class="list">${fila.map((it) => `<div class="li">${UI.avatar(it.p)}<div class="grow"><div class="t">${esc(it.p.nome)}${exTag(it.p)}</div><div class="s">${esc(it.tipo)}${it.tipo === 'Lembrete de sessão' ? ' · ' + esc(nomeLocal(it.p.local)) : ''}</div></div><div class="row">${botoesWhats(it.rs, it.texto, `data-pac="${it.p.id}"${it.rel ? ` data-rel="${it.rel.id}"` : ''}`)}</div></div>`).join('')}</div>` : `<div class="empty">${ic('check')}<div>Nada pendente para hoje.</div></div>`}
          <p class="small muted" style="margin-top:12px">Cada botão abre o WhatsApp com a mensagem pronta; é só tocar em enviar. O recado fica registrado na pasta do paciente.</p>
        </div>
        <div class="stack" style="gap:20px">
          ${RF.GX.presentesPanel()}
          <div class="panel"><div class="panel-head"><h3>Atalhos</h3></div><div class="row"><button class="btn btn-ghost btn-sm" data-act="g-sec" data-sec="recados">${ic('chat')} Enviar recado</button><button class="btn btn-ghost btn-sm" data-act="g-sec" data-sec="evolucoes">${ic('pulse')} Registrar evolução</button><button class="btn btn-ghost btn-sm" data-act="g-sec" data-sec="recursos">${ic('puzzle')} Liberar jogo</button><button class="btn btn-ghost btn-sm" data-act="redes-ir" data-tab="roteiros">${ic('video')} Ideias de vídeo</button></div></div>
          <div class="panel"><div class="panel-head"><h3>Próximas postagens</h3><button class="linkbtn" data-act="redes-ir" data-tab="conteudos">Calendário</button></div>
            ${prox.length ? `<div class="list">${prox.map((c) => `<div class="li"><span class="pill ${c.rede === 'tiktok' ? 'rose' : 'sage'}">${c.rede === 'tiktok' ? 'TikTok' : 'Instagram'}</span><div class="grow"><div class="t">${esc(c.titulo)}</div><div class="s tnum">${fmt.dataHora(c.agendadoPara)}</div></div></div>`).join('')}</div>` : `<p class="muted small">Nenhum post agendado. Aprove propostas em Redes sociais e o sistema escolhe o melhor horário.</p>`}
          </div>
        </div>
      </div>`;
    return { corpo };
  }
  Acoes['redes-ir'] = (b) => { G.sec = 'redes'; if (RF.Social) RF.Social.tab = b.dataset.tab; App.render(); window.scrollTo(0, 0); };

  /* ---------------- Pacientes ---------------- */
  function statusAcesso(rs) {
    if (!rs.length) return '<span class="pill bad">Sem responsável</span>';
    const pend = rs.filter((r) => r.primeiroAcesso).length;
    return pend ? `<span class="pill warn"><span class="dot"></span>${pend} aguardando 1º acesso</span>` : '<span class="pill ok"><span class="dot"></span>Acesso ativo</span>';
  }
  function pacientes() {
    if (G.pacFiltro === 'inativos') return { corpo: RF.Ciclo.abas() + RF.Ciclo.tabelaInativos(), acoes: `<button class="btn btn-primary" data-act="novo-paciente">${ic('plus')} Novo paciente</button>` };
    const ps = pacientesAtivos();
    const corpo = `${RF.Ciclo.abas()}<div class="panel">
      <div class="panel-head"><div class="row grow"><input class="input" id="busca-pac" data-input="busca-pac" placeholder="Buscar por nome do paciente ou responsável" style="max-width:380px"><select class="input" id="filtro-local" data-change="busca-pac" style="max-width:240px"><option value="">Todos os locais</option>${Dados.locais().map((l) => `<option value="${l.id}">${esc(l.nome)}</option>`).join('')}</select></div></div>
      ${ps.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Paciente</th><th>Idade</th><th>Local</th><th>Responsáveis</th><th>Acesso dos pais</th><th>Uso de imagem</th><th></th></tr></thead><tbody>
        ${ps.map((p) => { const rs = respsDe(p); return `<tr data-busca="${esc(semAcento((p.nome + ' ' + rs.map((r) => r.nome).join(' ')).toLowerCase()))}" data-local="${esc(p.local)}"><td><div class="row" style="flex-wrap:nowrap">${UI.avatar(p)}<b>${esc(p.nome)}</b>${exTag(p)}</div></td><td class="tnum">${esc(fmt.idade(p.nascimento))}</td><td>${esc(nomeLocal(p.local))}</td><td>${rs.map((r) => esc(r.nome.split(' ')[0]) + ` <span class="muted small">(${esc(r.parentesco || '')})</span>`).join(', ')}</td><td>${statusAcesso(rs)}</td><td>${RF.GX.imgPill(p)}</td><td><button class="btn btn-ghost btn-sm" data-act="abrir-ficha" data-id="${p.id}">Abrir ficha</button></td></tr>`; }).join('')}
      </tbody></table></div>` : `<div class="empty">${ic('users')}<div>Nenhum paciente cadastrado ainda.</div><button class="btn btn-primary" data-act="novo-paciente">${ic('plus')} Cadastrar o primeiro paciente</button></div>`}
    </div>`;
    return { corpo, acoes: `<button class="btn btn-primary" data-act="novo-paciente">${ic('plus')} Novo paciente</button>` };
  }
  Acoes['busca-pac'] = () => {
    const q = semAcento(val('busca-pac').toLowerCase()); const l = val('filtro-local');
    $$('tr[data-busca]').forEach((tr) => { tr.hidden = !(tr.dataset.busca.includes(q) && (!l || tr.dataset.local === l)); });
  };
  Acoes['abrir-ficha'] = (b) => { G.sec = 'ficha'; G.pacienteId = b.dataset.id; G.fichaTab = b.dataset.tab || 'resumo'; App.render(); window.scrollTo(0, 0); };
  Acoes['novo-paciente'] = () => { G.sec = 'pac-form'; G.editId = null; App.render(); window.scrollTo(0, 0); };
  Acoes['editar-paciente'] = (b) => { G.sec = 'pac-form'; G.editId = b.dataset.id; App.render(); window.scrollTo(0, 0); };

  /* ---------------- Cadastro de paciente e responsáveis ---------------- */
  const PARENTESCO = ['Mãe', 'Pai', 'Avó', 'Avô', 'Tia', 'Tio', 'Responsável legal', 'Outro'];
  function opts(arr, sel) { return arr.map((o) => `<option ${o === sel ? 'selected' : ''}>${esc(o)}</option>`).join(''); }
  function blocoResp(r, i, existente) {
    r = r || {}; const k = r.id || 'novo' + i;
    const docDig = so(r.docNumero || '');
    return `<div class="resp-card" data-resp-bloco="${esc(k)}" data-resp-id="${esc(r.id || '')}" data-manual="${r.usuario ? '1' : ''}">
      <div class="head"><b>${existente ? esc(r.nome) : 'Responsável'}</b>${existente ? statusAcesso([r]) : ''}<button type="button" class="btn btn-ghost btn-xs" data-act="remover-resp">${ic('x')} Remover</button></div>
      <div class="grid-form">
        <div class="field"><label>Nome completo *</label><input class="input" data-f="nome" data-input="resp-nome" value="${esc(r.nome || '')}" placeholder="Nome e sobrenome" autocomplete="off"></div>
        <div class="field"><label>Parentesco</label><select class="input" data-f="parentesco">${opts(PARENTESCO, r.parentesco || 'Mãe')}</select></div>
        <div class="field full"><label>Documento do responsável * <span class="muted">(define a senha inicial)</span></label><div class="inline-input"><select class="input" data-f="docTipo" data-change="resp-doc">${opts(RF.tiposDoc.responsavelCadastro, r.docTipo || 'CPF')}</select><input class="input" data-f="docNumero" data-input="resp-doc" value="${esc(r.docNumero || '')}" inputmode="numeric" autocomplete="off" placeholder="Número"></div><span class="err" data-err="doc"></span></div>
        <div class="field"><label>Usuário *</label><input class="input" data-f="usuario" data-input="resp-user" value="${esc(r.usuario || '')}" autocapitalize="none" spellcheck="false" placeholder="nome.sobrenome"><span class="hint">Sugestão automática no padrão nome.sobrenome.</span><span class="err" data-err="usuario"></span></div>
        <div class="field"><label>Senha inicial</label><div class="cred-box"><span class="muted">Senha</span><b data-senha>${docDig ? esc(docDig) : '—'}</b></div><span class="hint">Sempre o número do documento, só os números. No primeiro acesso o responsável cria uma senha de 6 números.</span></div>
        <div class="field"><label>WhatsApp <span class="muted">(opcional agora)</span></label><input class="input" data-f="whatsapp" data-input="mask-cel" value="${esc(r.whatsapp ? Valida.mascaraCel(so(r.whatsapp).replace(/^55/, '')) : '')}" inputmode="tel" placeholder="(75) 9 0000-0000"><span class="hint">Para enviar o acesso. O responsável confirma o número no primeiro acesso.</span><span class="err" data-err="whats"></span></div>
      </div>
    </div>`;
  }
  function pacForm() {
    const p = G.editId ? pac(G.editId) : null;
    const rs = p ? respsDe(p) : [];
    const outros = Dados.lista('responsaveis').filter((r) => !rs.find((x) => x.id === r.id));
    const corpo = `<form class="stack" style="gap:20px" data-submit="salvar-paciente" novalidate>
      <div class="panel"><div class="panel-head"><h3>Dados do paciente</h3>${p ? exTag(p) : ''}</div>
        <div class="row" style="gap:20px;align-items:flex-start">
          <label class="stack" style="gap:8px;align-items:center;cursor:pointer"><span class="avatar lg" id="pf-prev">${p && p.foto && Arquivos.src(p.foto) ? `<img src="${esc(Arquivos.src(p.foto))}" alt="">` : ic('user')}</span><span class="btn btn-ghost btn-xs">${ic('upload')} Foto do perfil</span><input type="file" accept="image/*" class="sr" id="pf-foto" data-change="foto-paciente"></label>
          <input type="hidden" id="pf-foto-data" value="${esc(p && p.foto || '')}">
          <div class="grid-form grow">
            <div class="field full"><label for="pf-nome">Nome *</label><input class="input" id="pf-nome" value="${esc(p ? p.nome : '')}" autocomplete="off" required></div>
            <div class="field"><label for="pf-nasc">Data de nascimento *</label><input class="input" type="date" id="pf-nasc" data-input="idade-viva" value="${esc(p ? p.nascimento : '')}" max="${new Date().toISOString().slice(0, 10)}" required><span class="hint" id="pf-idade">${p ? 'Idade: ' + esc(fmt.idade(p.nascimento)) : ''}</span></div>
            <div class="field"><label for="pf-local">Local de atendimento *</label><select class="input" id="pf-local" required><option value="">Selecione</option>${Dados.locais().map((l) => `<option value="${l.id}" ${p && p.local === l.id ? 'selected' : ''}>${esc(l.nome)} · ${esc(l.cidade)}</option>`).join('')}</select></div>
            <div class="field full"><label>Documento do paciente *</label><div class="inline-input"><select class="input" id="pf-doctipo" data-change="pac-doc">${opts(RF.tiposDoc.paciente, p ? p.docTipo : 'Certidão de nascimento')}</select><input class="input" id="pf-docnum" data-input="pac-doc" value="${esc(p ? Valida.mascaraDoc(p.docTipo, p.docNumero) : '')}" autocomplete="off" placeholder="Número do documento"></div><span class="err" id="pf-doc-err"></span></div>
            <div class="field full"><label for="pf-queixa">Queixa principal / observações</label><textarea class="input" id="pf-queixa" rows="3" placeholder="Opcional">${esc(p && p.queixa || '')}</textarea></div>
          </div>
        </div>
      </div>
      <div class="panel"><div class="panel-head"><div><h3>Responsáveis</h3><p class="small muted">Pelo menos um é obrigatório. Cada responsável recebe um acesso próprio à Área do Usuário.</p></div></div>
        <div class="stack" id="resp-lista">${rs.length ? rs.map((r, i) => blocoResp(r, i, true)).join('') : blocoResp(null, 0, false)}</div>
        <div class="row" style="margin-top:14px"><button type="button" class="btn btn-olive" data-act="add-resp">${ic('plus')} Cadastrar outro responsável</button>
          ${outros.length ? `<select class="input" id="vincular-resp" style="max-width:300px"><option value="">Vincular responsável já cadastrado…</option>${outros.map((r) => `<option value="${r.id}">${esc(r.nome)} (${esc(r.usuario)})</option>`).join('')}</select><button type="button" class="btn btn-ghost btn-sm" data-act="vincular-resp">Vincular</button>` : ''}
        </div>
        <div id="resp-vinculados" class="row" style="margin-top:10px"></div>
      </div>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-ghost" data-act="${p ? 'abrir-ficha' : 'g-sec'}" data-id="${p ? p.id : ''}" data-sec="pacientes">Cancelar</button><button class="btn btn-primary" type="submit">${ic('check')} ${p ? 'Salvar alterações' : 'Cadastrar paciente e gerar acessos'}</button></div>
    </form>`;
    return { corpo, titulo: p ? 'Editar paciente' : 'Novo paciente' };
  }
  G.vinculos = [];
  Acoes['add-resp'] = () => { const l = $('#resp-lista'); const n = $$('[data-resp-bloco]', l).length; l.insertAdjacentHTML('beforeend', blocoResp(null, n + Date.now() % 1000, false)); $$('[data-resp-bloco]', l).pop().querySelector('[data-f="nome"]').focus(); };
  Acoes['remover-resp'] = (b) => { const bl = b.closest('[data-resp-bloco]'); if ($$('[data-resp-bloco]').length + G.vinculos.length <= 1) { UI.toast('O paciente precisa de pelo menos um responsável.', 'bad'); return; } bl.remove(); };
  Acoes['vincular-resp'] = () => { const id = val('vincular-resp'); if (!id || G.vinculos.includes(id)) return; G.vinculos.push(id); const r = Dados.get('responsaveis', id); $('#resp-vinculados').insertAdjacentHTML('beforeend', `<span class="pill sage" data-vinc="${id}">${esc(r.nome)} <button type="button" class="linkbtn" data-act="desvincular" data-id="${id}" aria-label="Remover vínculo">${ic('x')}</button></span>`); };
  Acoes['desvincular'] = (b) => { G.vinculos = G.vinculos.filter((x) => x !== b.dataset.id); b.closest('[data-vinc]').remove(); };
  Acoes['resp-nome'] = (inp) => {
    const bl = inp.closest('[data-resp-bloco]'); if (bl.dataset.manual) return;
    const usados = Dados.lista('responsaveis').filter((r) => r.id !== bl.dataset.respId).map((r) => r.usuario).concat($$('[data-resp-bloco]').filter((x) => x !== bl).map((x) => x.querySelector('[data-f="usuario"]').value));
    bl.querySelector('[data-f="usuario"]').value = Senha.usuarioSugerido(inp.value, usados);
  };
  Acoes['resp-user'] = (inp) => { const bl = inp.closest('[data-resp-bloco]'); bl.dataset.manual = inp.value ? '1' : ''; inp.value = semAcento(inp.value).toLowerCase().replace(/[^a-z0-9.]/g, ''); };
  Acoes['resp-doc'] = (el) => {
    const bl = el.closest('[data-resp-bloco]'); const tipo = bl.querySelector('[data-f="docTipo"]').value; const inp = bl.querySelector('[data-f="docNumero"]');
    if (el === inp) inp.value = Valida.mascaraDoc(tipo, inp.value);
    inp.setAttribute('inputmode', tipo === 'Passaporte' || tipo === 'RG' ? 'text' : 'numeric');
    const d = so(inp.value); bl.querySelector('[data-senha]').textContent = d || '—';
    const ok = Valida.doc(tipo, inp.value); inp.classList.toggle('good', ok); inp.classList.toggle('bad', !!inp.value && !ok && d.length >= 11);
    bl.querySelector('[data-err="doc"]').textContent = '';
  };
  Acoes['mask-cel'] = (inp) => { inp.value = Valida.mascaraCel(inp.value); };
  Acoes['pac-doc'] = () => { const t = val('pf-doctipo'), i = $('#pf-docnum'); i.value = Valida.mascaraDoc(t, i.value); i.setAttribute('inputmode', ['Passaporte', 'RG', 'Outro'].includes(t) ? 'text' : 'numeric'); const ok = Valida.doc(t, i.value); i.classList.toggle('good', ok); $('#pf-doc-err').textContent = ''; };
  Acoes['idade-viva'] = (i) => { $('#pf-idade').textContent = i.value ? 'Idade: ' + fmt.idade(i.value) : ''; };
  Acoes['foto-paciente'] = async (inp) => {
    const f = inp.files && inp.files[0]; if (!f) return;
    try { const d = await Img.reduzir(f, 320, .8); $('#pf-foto-data').value = d; $('#pf-prev').innerHTML = `<img src="${d}" alt="">`; } catch { UI.toast('Não consegui ler essa imagem. Tente uma foto JPG ou PNG.', 'bad'); }
  };

  Acoes['salvar-paciente'] = async (form) => {
    const editando = G.editId ? pac(G.editId) : null;
    const erros = [];
    const nome = val('pf-nome').trim(), nasc = val('pf-nasc'), local = val('pf-local'), docTipo = val('pf-doctipo'), docNum = val('pf-docnum').trim();
    const marca = (id, ok) => { const el = document.getElementById(id); if (el) el.classList.toggle('bad', !ok); if (!ok) erros.push(id); };
    marca('pf-nome', nome.split(/\s+/).length >= 2);
    marca('pf-nasc', !!nasc && nasc <= new Date().toISOString().slice(0, 10));
    marca('pf-local', !!local);
    const docOk = Valida.doc(docTipo, docNum); marca('pf-docnum', docOk); if (!docOk) $('#pf-doc-err').textContent = Valida.msgDoc(docTipo);
    const blocos = $$('[data-resp-bloco]');
    const usadosForm = [];
    const novos = [];
    for (const bl of blocos) {
      const g = (f) => bl.querySelector(`[data-f="${f}"]`); const r = { id: bl.dataset.respId || '', nome: g('nome').value.trim(), parentesco: g('parentesco').value, docTipo: g('docTipo').value, docNumero: g('docNumero').value.trim(), usuario: g('usuario').value.trim().toLowerCase(), whatsapp: so(g('whatsapp').value) };
      const okNome = r.nome.split(/\s+/).length >= 2; g('nome').classList.toggle('bad', !okNome); if (!okNome) erros.push('resp-nome');
      const okDoc = Valida.doc(r.docTipo, r.docNumero) && so(r.docNumero).length >= 5; g('docNumero').classList.toggle('bad', !okDoc); bl.querySelector('[data-err="doc"]').textContent = okDoc ? '' : Valida.msgDoc(r.docTipo) + (so(r.docNumero).length < 5 ? ' A senha inicial precisa de pelo menos 5 números.' : ''); if (!okDoc) erros.push('resp-doc');
      const conflito = Dados.lista('responsaveis').find((x) => x.usuario === r.usuario && x.id !== r.id) || usadosForm.includes(r.usuario);
      const okUser = /^[a-z0-9]+(\.[a-z0-9]+)*$/.test(r.usuario) && !conflito; g('usuario').classList.toggle('bad', !okUser); bl.querySelector('[data-err="usuario"]').textContent = okUser ? '' : conflito ? 'Este usuário já existe. Ajuste, por exemplo, com um número no final.' : 'Use letras minúsculas e ponto, como maria.silva.'; if (!okUser) erros.push('resp-user');
      const okW = !r.whatsapp || Valida.celular(r.whatsapp); g('whatsapp').classList.toggle('bad', !okW); bl.querySelector('[data-err="whats"]').textContent = okW ? '' : 'Celular com DDD, ex.: (75) 9 8367-8360.'; if (!okW) erros.push('resp-whats');
      usadosForm.push(r.usuario); novos.push(r);
    }
    if (!novos.length && !G.vinculos.length) { UI.toast('Cadastre pelo menos um responsável.', 'bad'); return; }
    if (erros.length) { UI.toast('Confira os campos destacados em vermelho.', 'bad'); const el = form.querySelector('.bad'); if (el) el.focus(); return; }

    const pid = editando ? editando.id : uid('p-');
    const respIds = []; const criados = []; const acessos = [];
    const nuvem = Dados.modo === 'supabase';
    for (const r of novos) {
      const atual = r.id ? Dados.get('responsaveis', r.id) : null;
      const dados = { ...(atual || {}), nome: r.nome, parentesco: r.parentesco, docTipo: r.docTipo, docNumero: Valida.mascaraDoc(r.docTipo, r.docNumero), usuario: r.usuario, whatsapp: r.whatsapp ? Whats.numero(r.whatsapp) : (atual && atual.whatsapp) || '', pacientes: [...new Set([...(atual && atual.pacientes || []), pid])] };
      const docMudou = atual && atual.primeiroAcesso && so(atual.docNumero) !== so(r.docNumero);
      if (!atual) { Object.assign(dados, nuvem ? {} : await Senha.hash(so(r.docNumero)), { primeiroAcesso: true, perfilCompleto: false, criadoEm: new Date().toISOString(), email: '' }); }
      else if (docMudou && !nuvem) Object.assign(dados, await Senha.hash(so(r.docNumero)));
      const salvo = await Dados.salvar('responsaveis', atual ? atual.id : uid('r-'), dados);
      respIds.push(salvo.id); if (!atual) criados.push(salvo);
      if (nuvem && (!atual || docMudou || (atual && atual.usuario !== r.usuario))) acessos.push(salvo.id);
    }
    // No Supabase, a senha inicial (números do documento) é criada no servidor; o navegador nunca vê hashes
    for (const id of acessos) { try { await Auth.acesso('criar-acesso', 'responsavel', id); } catch (e) { UI.toast(`Acesso de ${(Dados.get('responsaveis', id) || {}).nome || 'responsável'}: ${(e && e.message) || 'não foi criado.'}`, 'bad'); } }
    for (const id of G.vinculos) { const r = Dados.get('responsaveis', id); if (r) { await Dados.atualizar('responsaveis', id, { pacientes: [...new Set([...(r.pacientes || []), pid])] }); respIds.push(id); } }
    if (editando) (editando.responsaveis || []).filter((id) => !respIds.includes(id)).forEach((id) => { const r = Dados.get('responsaveis', id); if (r) Dados.atualizar('responsaveis', id, { pacientes: (r.pacientes || []).filter((x) => x !== pid) }); });
    const foto = await Arquivos.guardarDataURL('fotos', `${pid}/foto-${Date.now()}.jpg`, val('pf-foto-data'));
    await Dados.salvar('pacientes', pid, { ...(editando || {}), nome, nascimento: nasc, local, docTipo, docNumero: Valida.mascaraDoc(docTipo, docNum), foto, queixa: val('pf-queixa').trim(), responsaveis: [...new Set(respIds)], ativo: true, criadoEm: editando ? editando.criadoEm : new Date().toISOString() });
    G.vinculos = []; G.sec = 'ficha'; G.pacienteId = pid; G.fichaTab = 'responsaveis'; App.render(); window.scrollTo(0, 0);
    UI.toast(editando ? 'Cadastro atualizado.' : 'Paciente cadastrado.');
    if (criados.length) modalAcessos(criados, pac(pid));
  };

  function msgAcesso(r, p) {
    const link = linkSite();
    return `Olá, ${r.nome.split(' ')[0]}! Aqui é a Rebeca Fonseca, fonoaudióloga de ${p ? p.nome.split(' ')[0] : 'seu filho(a)'}. Seu acesso à Área do Usuário já está pronto. Lá você encontra os relatórios, os recados e os jogos liberados para casa.\n\n${link ? 'Acesse: ' + link + '\n' : ''}Usuário: ${r.usuario}\nSenha inicial: o número do seu ${r.docTipo}, só os números.\n\nNo primeiro acesso, você vai criar uma senha nova de 6 números e confirmar seu WhatsApp.`;
  }
  function modalAcessos(rs, p) {
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Acessos gerados</div><h2>Envie o acesso aos responsáveis</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="stack">${rs.map((r) => `<div class="resp-card"><div class="head"><b>${esc(r.nome)}</b><span class="pill warn">Aguardando 1º acesso</span></div>
        <div class="cred-box"><span class="muted">Usuário</span><b>${esc(r.usuario)}</b><span class="muted">Senha inicial</span><b>número do ${esc(r.docTipo)} (só números)</b></div>
        <div class="row">${r.whatsapp ? `<a class="btn btn-wa btn-sm" href="${Whats.link(r.whatsapp, msgAcesso(r, p))}" target="_blank" rel="noopener">${ic('whats')} Enviar acesso pelo WhatsApp</a>` : '<span class="small muted">Sem WhatsApp cadastrado.</span>'}<button class="btn btn-ghost btn-sm" data-act="copiar" data-texto="${esc(msgAcesso(r, p))}">${ic('copy')} Copiar instruções</button></div></div>`).join('')}</div>
      ${linkSite() ? '' : `<div class="note warn" style="margin-top:16px">${ic('info')}<div>Cadastre o link do sistema em <b>Configurações › Site</b> para que ele vá junto na mensagem.</div></div>`}`);
  }
  Acoes['enviar-acesso'] = (b) => { const r = Dados.get('responsaveis', b.dataset.id); if (r) modalAcessos([r], pac(G.pacienteId)); };
  Acoes['resetar-senha'] = async (b) => {
    const r = Dados.get('responsaveis', b.dataset.id); if (!r) return;
    if (!(await UI.confirmar('Redefinir senha?', `A senha de ${r.nome} volta a ser o número do documento e um novo primeiro acesso será exigido.`, 'Redefinir'))) return;
    if (Dados.modo === 'supabase') {
      try { await Auth.acesso('redefinir', 'responsavel', r.id); await Dados.atualizar('responsaveis', r.id, { primeiroAcesso: true }, { silencioso: true }); }
      catch (e) { UI.toast((e && e.message) || 'Não foi possível redefinir a senha.', 'bad'); return; }
    } else await Dados.atualizar('responsaveis', r.id, { ...(await Senha.hash(so(r.docNumero))), primeiroAcesso: true });
    UI.toast('Senha redefinida.'); modalAcessos([Dados.get('responsaveis', r.id)], pac(G.pacienteId));
  };

  /* ---------------- Ficha do paciente ---------------- */
  const FTABS = [['resumo', 'Resumo'], ['responsaveis', 'Responsáveis'], ['relatorios', 'Relatórios'], ['recados', 'Recados'], ['evolucoes', 'Evoluções'], ['recursos', 'Recursos'], ['termos', 'Termos e imagem']];
  function ficha() {
    const p = pac(G.pacienteId); if (!p) { G.sec = 'pacientes'; return pacientes(); }
    const rs = respsDe(p); const tab = G.fichaTab || 'resumo';
    const rels = Dados.lista('relatorios').filter((r) => r.pacienteId === p.id).sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    const recs = Dados.lista('recados').filter((r) => r.pacienteId === p.id).sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
    const evs = Dados.lista('evolucoes').filter((r) => r.pacienteId === p.id).sort((a, b) => b.data.localeCompare(a.data));
    const rcs = Dados.lista('recursos').filter((r) => r.pacienteId === p.id);
    let conteudo = '';
    if (tab === 'resumo') conteudo = `<div class="cols-2"><div class="panel"><h3>Dados</h3><div class="cred-box" style="margin-top:12px"><span class="muted">Nascimento</span><span>${fmt.data(p.nascimento)} · ${esc(fmt.idade(p.nascimento))}</span><span class="muted">Documento</span><span>${esc(p.docTipo)}: ${esc(p.docNumero)}</span><span class="muted">Local</span><span>${esc(nomeLocal(p.local))}</span><span class="muted">Cadastro</span><span>${fmt.data(p.criadoEm)}</span></div>${p.queixa ? `<p style="margin-top:14px"><span class="label">Queixa / observações</span><br>${esc(p.queixa)}</p>` : ''}</div>
      <div class="panel"><h3>Última evolução</h3>${evs[0] ? `<p class="small muted" style="margin-top:8px">${fmt.data(evs[0].data)}</p><p style="margin-top:6px">${esc(evs[0].resposta || evs[0].atividades)}</p>` : '<p class="muted small" style="margin-top:8px">Nenhuma evolução registrada.</p>'}<h3 style="margin-top:20px">Último recado</h3>${recs[0] ? `<p class="small muted" style="margin-top:8px">${fmt.dataHora(recs[0].enviadoEm)}</p><p style="margin-top:6px">${esc(recs[0].texto)}</p>` : '<p class="muted small" style="margin-top:8px">Nenhum recado enviado.</p>'}</div></div>`;
    if (tab === 'resumo') conteudo += RF.GX.estrelasFicha(p);
    if (tab === 'termos') conteudo = RF.GX.termosFicha(p, rs);
    if (tab === 'responsaveis') conteudo = `<div class="cols-3">${rs.map((r) => `<div class="panel stack"><div class="row between"><b>${esc(r.nome)}</b>${statusAcesso([r])}</div><div class="cred-box"><span class="muted">Parentesco</span><span>${esc(r.parentesco || '')}</span><span class="muted">Usuário</span><b>${esc(r.usuario)}</b><span class="muted">Documento</span><span>${esc(r.docTipo)} ${esc(r.docNumero)}</span><span class="muted">WhatsApp</span><span>${r.whatsapp ? esc(fmt.tel(r.whatsapp)) : '<span class="muted">a confirmar</span>'}</span><span class="muted">E-mail</span><span>${esc(r.email || '—')}</span></div><div class="row"><button class="btn btn-ghost btn-sm" data-act="enviar-acesso" data-id="${r.id}">${ic('send')} Enviar acesso</button><button class="btn btn-ghost btn-sm" data-act="resetar-senha" data-id="${r.id}">${ic('lock')} Redefinir senha</button></div></div>`).join('')}</div>`;
    if (tab === 'relatorios') conteudo = `<div class="panel">${rels.length ? `<div class="list">${rels.map((r) => linhaRel(r)).join('')}</div>` : '<p class="muted">Nenhum relatório para este paciente.</p>'}<div class="row" style="margin-top:14px"><button class="btn btn-primary btn-sm" data-act="novo-relatorio" data-pac="${p.id}">${ic('plus')} Novo relatório</button></div></div>`;
    if (tab === 'recados') conteudo = `<div class="cols-2"><div class="panel"><h3>Novo recado</h3><div style="margin-top:12px">${compositorRecado(p)}</div></div><div class="panel"><h3>Histórico</h3><div class="timeline" style="margin-top:8px">${recs.length ? recs.map(tlRecado).join('') : '<p class="muted small">Nenhum recado enviado.</p>'}</div></div></div>`;
    if (tab === 'evolucoes') conteudo = `<div class="cols-2"><div class="panel"><h3>Nova evolução</h3><div style="margin-top:12px">${formEvolucao(p)}</div></div><div class="panel"><div class="panel-head"><h3>Registros</h3><span class="pill">${ic('lock')} interno</span></div><div class="timeline">${evs.length ? evs.map(tlEvolucao).join('') : '<p class="muted small">Nenhuma evolução registrada.</p>'}</div></div></div>`;
    if (tab === 'recursos') conteudo = gradeRecursos(p, rcs);
    const corpo = `<div class="panel"><div class="ficha-head">${UI.avatar(p, 'lg')}<div class="grow"><h2>${esc(p.nome)}${exTag(p)}</h2><div class="row" style="margin-top:8px"><span class="pill terra">${esc(fmt.idade(p.nascimento))}</span><span class="pill sage">${ic('pin')} ${esc(nomeLocal(p.local))}</span>${statusAcesso(rs)}${RF.GX.imgPill(p)}</div></div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-act="editar-paciente" data-id="${p.id}">${ic('edit')} Editar</button>${RF.Ciclo.botoesFicha(p)}</div></div></div>
      ${RF.Ciclo.banner(p)}
      <div class="subtabs" role="tablist">${FTABS.map(([k, n]) => `<button class="subtab" role="tab" aria-selected="${tab === k}" data-act="ficha-tab" data-tab="${k}">${n}</button>`).join('')}</div>${conteudo}`;
    return { corpo, titulo: 'Ficha do paciente', acoes: `<button class="btn btn-ghost btn-sm" data-act="g-sec" data-sec="pacientes">← Pacientes</button>` };
  }
  Acoes['ficha-tab'] = (b) => { G.fichaTab = b.dataset.tab; App.render(); };
  Acoes['arquivar-paciente'] = async (b) => { const p = pac(b.dataset.id); if (!p) return; if (!(await UI.confirmar('Arquivar paciente?', `${p.nome} sai da lista de ativos. Os registros continuam guardados.`, 'Arquivar'))) return; await Dados.atualizar('pacientes', p.id, { ativo: false }); G.sec = 'pacientes'; App.render(); UI.toast('Paciente arquivado.'); };

  /* ---------------- Relatórios ---------------- */
  function linhaRel(r) {
    const p = pac(r.pacienteId);
    return `<div class="li"><div class="grow"><div class="t">${esc(r.titulo || (RF.tiposRelatorio[r.tipo] || {}).nome)}${exTag(r)}</div><div class="s">${p ? esc(p.nome) + ' · ' : ''}${fmt.data(r.data)} · ${esc((RF.tiposRelatorio[r.tipo] || {}).nome || '')}</div></div>${r.status === 'publicado' ? '<span class="pill ok">Publicado no portal</span>' : '<span class="pill warn">Rascunho</span>'}${(r.envios || []).length ? `<span class="pill sage">${ic('whats')} enviado</span>` : ''}<button class="btn btn-ghost btn-sm" data-act="abrir-relatorio" data-id="${r.id}">Abrir</button></div>`;
  }
  function relatorios() {
    const rels = Dados.lista('relatorios').sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    const corpo = `<div class="panel">${rels.length ? `<div class="list">${rels.map(linhaRel).join('')}</div>` : `<div class="empty">${ic('file')}<div>Nenhum relatório ainda.</div></div>`}</div>`;
    return { corpo, acoes: `<button class="btn btn-primary" data-act="novo-relatorio">${ic('plus')} Novo relatório</button>` };
  }
  Acoes['novo-relatorio'] = (b) => {
    const pid = (b && b.dataset.pac) || (G.sec === 'ficha' ? G.pacienteId : '') || '';
    G.rel = { id: '', pacienteId: pid, tipo: 'evolucao', titulo: RF.tiposRelatorio.evolucao.nome, data: new Date().toISOString().slice(0, 10), status: 'rascunho', secoes: RF.tiposRelatorio.evolucao.secoes.map((t) => ({ titulo: t, texto: '' })) };
    preencherIdent(); G.sec = 'rel-editor'; App.render(); window.scrollTo(0, 0);
  };
  Acoes['abrir-relatorio'] = (b) => { const r = Dados.get('relatorios', b.dataset.id); if (!r) return; G.rel = JSON.parse(JSON.stringify(r)); G.sec = 'rel-editor'; App.render(); window.scrollTo(0, 0); };
  function preencherIdent() {
    const p = pac(G.rel.pacienteId); if (!p) return; const s = G.rel.secoes.find((x) => x.titulo === 'Identificação');
    if (s && !s.texto) s.texto = `${p.nome}, ${fmt.idade(p.nascimento)}, nascido(a) em ${fmt.data(p.nascimento)}, em acompanhamento fonoaudiológico na ${nomeLocal(p.local)}.`;
    const d = G.rel.secoes.find((x) => x.titulo === 'Declaração');
    if (d && !d.texto) d.texto = `Declaro, para os devidos fins, que ${p.nome} compareceu a atendimento fonoaudiológico nesta data, ${fmt.dataLonga(G.rel.data)}, na ${nomeLocal(p.local)}, acompanhado(a) de seu(sua) responsável.`;
  }
  function timbrado(rel) {
    const p = pac(rel.pacienteId);
    return `<div class="timbrado" id="rel-prev"><div class="th"><img src="img/logo-verde.png" alt="Rebeca Fonseca Fonoaudióloga"><div class="crfa">${esc(RF.marca.crfa.toUpperCase())}</div></div>
      <div class="tb"><h3>${esc(rel.titulo || '')}</h3><p style="text-align:center;color:#6d675f">${p ? esc(p.nome) + ' · ' : ''}${fmt.dataLonga(rel.data || new Date().toISOString().slice(0, 10))}</p>
      ${Rel.secoes(rel).map((s) => `${s.titulo !== 'Declaração' ? `<h4>${esc(s.titulo.toUpperCase())}</h4>` : ''}<p>${esc(s.texto)}</p>`).join('')}
      <div class="sign"><div class="ln"></div>${esc(RF.marca.nome)} — ${esc(RF.marca.profissao)}<br><span style="color:#6d675f">${esc(RF.marca.crfa)}</span></div></div>
      <div class="tf"><span>WhatsApp ${esc(RF.marca.whatsappTexto)} · ${esc(RF.marca.email)}</span><span>@${esc(RF.marca.instagram)}</span></div></div>`;
  }
  function relEditor() {
    const r = G.rel; if (!r) { G.sec = 'relatorios'; return relatorios(); }
    const p = pac(r.pacienteId);
    const corpo = `<div class="editor-grid"><div class="panel stack">
      <div class="grid-form">
        <div class="field"><label for="re-pac">Paciente *</label><select class="input" id="re-pac" data-change="rel-pac"><option value="">Selecione</option>${[...pacientesAtivos(), ...(p && p.ativo === false ? [p] : [])].map((x) => `<option value="${x.id}" ${x.id === r.pacienteId ? 'selected' : ''}>${esc(x.nome)}${x.ativo === false ? ' (inativo)' : ''}</option>`).join('')}</select></div>
        <div class="field"><label for="re-tipo">Tipo</label><select class="input" id="re-tipo" data-change="rel-tipo">${Object.entries(RF.tiposRelatorio).map(([k, t]) => `<option value="${k}" ${k === r.tipo ? 'selected' : ''}>${esc(t.nome)}</option>`).join('')}</select></div>
        <div class="field"><label for="re-tit">Título</label><input class="input" id="re-tit" data-input="rel-campo" data-k="titulo" value="${esc(r.titulo)}"></div>
        <div class="field"><label for="re-data">Data</label><input class="input" type="date" id="re-data" data-input="rel-campo" data-k="data" value="${esc(r.data)}"></div>
      </div>
      ${RF.Ciclo.blocoEditor(r)}
      <div class="note">${ic('spark')}<div class="grow"><strong>Rascunho com IA:</strong> a IA escreve o texto a partir das evoluções registradas e do tipo de relatório. Revise tudo antes de publicar.<div class="row" style="margin-top:8px"><button class="btn btn-olive btn-sm" data-act="rel-ia" ${p ? '' : 'disabled'}>${ic('wand')} Redigir a partir das evoluções</button><span class="small muted" id="rel-ia-st"></span></div></div></div>
      ${r.secoes.map((s, i) => s.titulo === Rel.PROC_TITULO ? `<div class="field"><span class="label">${esc(s.titulo)}</span><div class="row" role="group" aria-label="Procedimentos usados">${Rel.procedimentos().map((x) => `<button type="button" class="chip" data-act="rel-proc" data-v="${esc(x)}" aria-pressed="${(r.procedimentos || []).includes(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="row" style="margin-top:6px"><input class="input" id="re-proc-novo" placeholder="Outro procedimento" style="max-width:260px"><button type="button" class="btn btn-ghost btn-sm" data-act="rel-proc-novo">${ic('plus')} Cadastrar</button></div>
        <textarea class="input" id="re-s${i}" data-input="rel-secao" data-i="${i}" rows="2" placeholder="Observações sobre os procedimentos (opcional)">${esc(s.texto)}</textarea></div>` : `<div class="field"><label for="re-s${i}">${esc(s.titulo)}</label><textarea class="input" id="re-s${i}" data-input="rel-secao" data-i="${i}" rows="${s.titulo === 'Evolução observada' || s.titulo === 'Resultados' ? 6 : 3}" placeholder="Deixe em branco para não aparecer no relatório">${esc(s.texto)}</textarea></div>`).join('')}
      <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:16px">
        <span>${r.status === 'publicado' ? '<span class="pill ok">Publicado no portal dos pais</span>' : '<span class="pill warn">Rascunho — os pais ainda não veem</span>'}</span>
        <div class="row"><button class="btn btn-ghost" data-act="rel-salvar">Salvar rascunho</button><button class="btn btn-primary" data-act="rel-publicar">${ic('check')} ${r.status === 'publicado' ? 'Atualizar no portal' : r.tipo === 'alta' ? 'Publicar e finalizar ciclo' : 'Publicar para os pais'}</button></div>
      </div>
    </div>
    <div class="stack" style="position:sticky;top:84px">
      <div class="row"><button class="btn btn-ghost btn-sm" data-act="rel-pdf" data-modo="imprimir">${ic('print')} Imprimir</button><button class="btn btn-ghost btn-sm" data-act="rel-pdf">${ic('download')} Salvar PDF</button><button class="btn btn-wa btn-sm" data-act="rel-whats" ${p ? '' : 'disabled'}>${ic('whats')} Enviar via WhatsApp</button>${r.id ? `<button class="btn btn-danger btn-sm" data-act="rel-excluir">${ic('trash')}</button>` : ''}</div>
      ${timbrado(r)}
      <p class="small muted">Prévia no papel timbrado. Para imprimir, o sistema gera o PDF com o timbrado; abra o arquivo e use Imprimir.</p>
    </div></div>`;
    return { corpo, titulo: r.id ? 'Editar relatório' : 'Novo relatório', acoes: `<button class="btn btn-ghost btn-sm" data-act="g-sec" data-sec="relatorios">← Relatórios</button>` };
  }
  function atualizarPrev() { const el = $('#rel-prev'); if (el) el.outerHTML = timbrado(G.rel); }
  Acoes['rel-campo'] = (i) => { G.rel[i.dataset.k] = i.value; atualizarPrev(); };
  Acoes['rel-secao'] = (i) => { G.rel.secoes[+i.dataset.i].texto = i.value; atualizarPrev(); };
  Acoes['rel-proc'] = (b) => { const v = b.dataset.v; const set = new Set(G.rel.procedimentos || []); set.has(v) ? set.delete(v) : set.add(v); G.rel.procedimentos = Rel.procedimentos().filter((x) => set.has(x)); b.setAttribute('aria-pressed', set.has(v)); atualizarPrev(); };
  Acoes['rel-proc-novo'] = async () => {
    const v = val('re-proc-novo').trim(); if (!v) { UI.toast('Escreva o nome do procedimento.', 'bad'); return; }
    if (!Rel.procedimentos().includes(v)) { const c = Dados.config(); await Dados.salvar('config', 'site', { ...c, procedimentosExtras: [...(c.procedimentosExtras || []), v] }); }
    G.rel.procedimentos = [...new Set([...(G.rel.procedimentos || []), v])]; UI.toast('Procedimento cadastrado.'); App.render();
  };
  Acoes['rel-pac'] = (s) => { G.rel.pacienteId = s.value; preencherIdent(); App.render(); };
  Acoes['rel-tipo'] = (s) => {
    const t = RF.tiposRelatorio[s.value]; const antigas = Object.fromEntries(G.rel.secoes.map((x) => [x.titulo, x.texto]));
    const tituloPadrao = Object.values(RF.tiposRelatorio).some((x) => x.nome === G.rel.titulo);
    G.rel.tipo = s.value; if (tituloPadrao || RF.Ciclo.tituloPadrao(G.rel.titulo) || !G.rel.titulo) G.rel.titulo = t.nome;
    if (s.value === 'alta') RF.Ciclo.prepararAlta(G.rel);
    G.rel.secoes = t.secoes.map((x) => ({ titulo: x, texto: antigas[x] || '' })); preencherIdent(); App.render();
  };
  async function salvarRel(status) {
    const r = G.rel; if (!r.pacienteId) { UI.toast('Escolha o paciente.', 'bad'); return null; }
    const dados = { ...r, status: status || r.status || 'rascunho' }; if (status === 'publicado' && !r.publicadoEm) dados.publicadoEm = new Date().toISOString();
    const s = await Dados.salvar('relatorios', r.id || null, dados); G.rel = JSON.parse(JSON.stringify(s)); return s;
  }
  Acoes['rel-salvar'] = async () => { if (await salvarRel()) { UI.toast('Rascunho salvo.'); App.render(); } };
  Acoes['rel-publicar'] = async () => { if (G.rel.tipo === 'alta') { RF.Ciclo.publicarAlta(); return; } if (await salvarRel('publicado')) { UI.toast('Publicado: os responsáveis já podem ver o relatório no portal.'); App.render(); } };
  Acoes['rel-excluir'] = async () => { if (!(await UI.confirmar('Excluir relatório?', 'Esta ação não pode ser desfeita.', 'Excluir'))) return; await Dados.remover('relatorios', G.rel.id); G.sec = 'relatorios'; App.render(); };
  Acoes['rel-pdf'] = async (b) => { if (!G.rel.pacienteId) { UI.toast('Escolha o paciente.', 'bad'); return; } b.disabled = true; await PDF.salvar(G.rel, pac(G.rel.pacienteId), b.dataset.modo); b.disabled = false; };
  Acoes['rel-whats'] = async () => {
    if (G.rel.tipo === 'alta' && G.rel.status !== 'publicado') { RF.Ciclo.publicarAlta(); return; }
    const s = await salvarRel('publicado'); if (!s) return;
    App.render(); modalEnvio(s);
  };
  function modalEnvio(s, alta) {
    const p = pac(s.pacienteId); const rs = respsDe(p);
    const texto = (r) => `Olá, ${r.nome.split(' ')[0]}! O relatório "${s.titulo}" de ${p.nome.split(' ')[0]} já está disponível na Área do Usuário${linkSite() ? ': ' + linkSite() : ''}. Lá você pode ler e baixar o PDF. Qualquer dúvida, estou à disposição.`;
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">${alta ? 'Ciclo finalizado · enviar relatório de alta' : 'Enviar relatório'}</div><h2>${esc(s.titulo)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <p class="muted">${alta ? `${esc(p.nome.split(' ')[0])} agora está em <b>inativos</b>. Os responsáveis continuam com acesso ao portal, onde o relatório já está disponível. ` : 'O relatório foi publicado no portal. '}Envie o aviso a cada responsável; se quiser mandar o arquivo também, salve o PDF e anexe na conversa.</p>
      <div class="stack" style="margin-top:16px">${rs.map((r) => `<div class="li"><div class="grow"><div class="t">${esc(r.nome)}</div><div class="s">${r.whatsapp ? esc(fmt.tel(r.whatsapp)) : 'WhatsApp ainda não informado'}</div></div>${r.whatsapp ? `<a class="btn btn-wa btn-sm" href="${Whats.link(r.whatsapp, texto(r))}" target="_blank" rel="noopener" data-act="registrar-envio" data-resp="${r.id}" data-pac="${p.id}" data-rel="${s.id}" data-texto="${esc(texto(r))}">${ic('whats')} Enviar aviso</a>` : ''}</div>`).join('')}</div>
      <div class="row" style="margin-top:18px"><button class="btn btn-ghost" data-act="rel-pdf">${ic('download')} Salvar PDF para anexar</button></div>`);
  };
  Acoes['rel-ia'] = async (b) => {
    const r = G.rel; const p = pac(r.pacienteId); if (!p) return;
    const evs = Dados.lista('evolucoes').filter((e) => e.pacienteId === p.id).sort((a, c) => a.data.localeCompare(c.data)).slice(-12);
    const st = $('#rel-ia-st'); b.disabled = true; st.textContent = 'Escrevendo…';
    try {
      const out = await IA.json(`Redija um ${(RF.tiposRelatorio[r.tipo] || {}).nome} fonoaudiológico formal, em terceira pessoa, linguagem acessível para a família e adequada para profissionais.
Paciente: ${p.nome}, ${fmt.idade(p.nascimento)}. Local: ${nomeLocal(p.local)}. Queixa: ${p.queixa || 'não informada'}.
Evoluções registradas (use apenas estes fatos, não invente dados, testes ou números):
${evs.map((e) => `- ${fmt.data(e.data)} | objetivos: ${e.objetivos} | atividades: ${e.atividades} | resposta: ${e.resposta} | orientações: ${e.orientacoes} | próximos passos: ${e.proximos}`).join('\n') || '(nenhuma evolução registrada: escreva apenas a estrutura com indicações entre colchetes do que preencher)'}
Procedimentos de avaliação marcados: ${JSON.stringify(r.procedimentos || [])}.${r.alta && r.alta.motivo ? `\nEste é o relatório de encerramento do ciclo. Motivo: ${r.alta.motivo}. Na seção "Motivo do encerramento" escreva só um complemento curto (o motivo já aparece automaticamente).` : ''}
Textos já escritos pela fonoaudióloga (mantenha e melhore): ${JSON.stringify(r.secoes)}
Se não houver informação para uma seção, devolva o texto vazio (""): seções vazias não aparecem no relatório final.
Responda somente com JSON no formato {"secoes":[{"titulo":"...","texto":"..."}]} usando exatamente estes títulos, nesta ordem: ${JSON.stringify(r.secoes.map((s) => s.titulo))}.`, { modelTier: 'default' });
      if (out && Array.isArray(out.secoes)) { out.secoes.forEach((s) => { const alvo = r.secoes.find((x) => x.titulo === s.titulo); if (alvo && s.texto) alvo.texto = String(s.texto); }); App.render(); UI.toast('Rascunho pronto. Revise antes de publicar.'); }
    } catch (e) { st.textContent = IA.erro(e); b.disabled = false; }
  };

  /* ---------------- Recados ---------------- */
  function compositorRecado(p) {
    const rs = respsDe(p);
    return `<form class="stack" data-submit="enviar-recado" data-pac="${p.id}">
      <div class="field"><label for="rc-modelo">Modelo</label><select class="input" id="rc-modelo" data-change="rc-modelo" data-pac="${p.id}"><option value="">Escrever do zero</option>${RF.modelosRecado.map((m, i) => `<option value="${i}">${esc(m.nome)}</option>`).join('')}</select></div>
      <div class="field"><label for="rc-texto">Recado</label><textarea class="input" id="rc-texto" rows="5" placeholder="Escreva o recado para a família" required></textarea></div>
      <div class="field"><span class="label">Enviar para</span>${rs.map((r) => `<label class="check"><input type="checkbox" name="rc-para" value="${r.id}" ${r.whatsapp ? 'checked' : 'disabled'}><span>${esc(r.nome)} <span class="muted small">${r.whatsapp ? esc(fmt.tel(r.whatsapp)) : '— WhatsApp não informado'}</span></span></label>`).join('')}</div>
      <button class="btn btn-wa" type="submit">${ic('whats')} Registrar e enviar pelo WhatsApp</button>
    </form>`;
  }
  Acoes['rc-modelo'] = (s) => { const p = pac(s.dataset.pac); const m = RF.modelosRecado[s.value]; if (!m || !p) return; const r = respsDe(p)[0]; $('#rc-texto').value = Whats.preencher(m.texto, { responsavel: r ? r.nome.split(' ')[0] : '', paciente: p.nome.split(' ')[0], local: nomeLocal(p.local) }); $('#rc-texto').focus(); };
  Acoes['enviar-recado'] = async (form) => {
    const p = pac(form.dataset.pac); const texto = val('rc-texto').trim();
    const ids = $$('input[name="rc-para"]:checked', form).map((i) => i.value);
    if (!texto) { UI.toast('Escreva o recado.', 'bad'); return; }
    if (!ids.length) { UI.toast('Escolha pelo menos um responsável com WhatsApp.', 'bad'); return; }
    const para = ids.map((id) => Dados.get('responsaveis', id)).map((r) => ({ id: r.id, nome: r.nome, whatsapp: r.whatsapp }));
    const rec = await Dados.salvar('recados', null, { pacienteId: p.id, texto, enviadoEm: new Date().toISOString(), para, canal: 'whatsapp', autor: eu().usuario });
    App.render();
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Recado registrado · ${fmt.dataHora(rec.enviadoEm)}</div><h2>Envie pelo WhatsApp</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <p class="muted">Toque em cada botão: o WhatsApp abre com o recado pronto, é só enviar.</p>
      <div class="stack" style="margin-top:14px">${para.map((r) => `<a class="btn btn-wa" href="${Whats.link(r.whatsapp, texto)}" target="_blank" rel="noopener">${ic('whats')} Enviar para ${esc(r.nome)}</a>`).join('')}</div>`);
  };
  function tlRecado(r) {
    const p = pac(r.pacienteId);
    return `<div class="tl"><div class="when"><b>${fmt.data(r.enviadoEm)}</b>${new Date(r.enviadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div><div><div class="small muted">${G.sec !== 'ficha' && p ? esc(p.nome) + ' · ' : ''}para ${esc((r.para || []).map((x) => x.nome.split(' ')[0]).join(', '))} ${exTag(r)}</div><p style="margin-top:4px">${esc(r.texto)}</p></div></div>`;
  }
  function recados() {
    const ps = pacientesAtivos(); G.rcPac = G.rcPac || (ps[0] && ps[0].id);
    const p = pac(G.rcPac);
    const todos = Dados.lista('recados').sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm)).slice(0, 40);
    const corpo = `<div class="cols-2"><div class="panel"><div class="panel-head"><h3>Novo recado</h3></div>
      <div class="field" style="margin-bottom:14px"><label for="rc-pac">Paciente</label><select class="input" id="rc-pac" data-change="rc-pac">${ps.map((x) => `<option value="${x.id}" ${x.id === G.rcPac ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
      ${p ? compositorRecado(p) : '<p class="muted">Cadastre um paciente para enviar recados.</p>'}</div>
      <div class="panel"><div class="panel-head"><h3>Últimos recados</h3><span class="small muted">registrados com data e hora</span></div><div class="timeline">${todos.length ? todos.map(tlRecado).join('') : '<p class="muted small">Nenhum recado enviado.</p>'}</div></div></div>`;
    return { corpo };
  }
  Acoes['rc-pac'] = (s) => { G.rcPac = s.value; App.render(); };

  /* ---------------- Evoluções ---------------- */
  function formEvolucao(p) {
    return `<form class="stack" data-submit="salvar-evolucao" data-pac="${p.id}">
      <div class="grid-form"><div class="field"><label for="ev-data">Data</label><input class="input" type="date" id="ev-data" value="${new Date().toISOString().slice(0, 10)}"></div><div class="field"><label for="ev-local">Local</label><select class="input" id="ev-local">${Dados.locais().map((l) => `<option value="${l.id}" ${l.id === p.local ? 'selected' : ''}>${esc(l.nome)}</option>`).join('')}</select></div></div>
      <details class="note" style="display:block"><summary style="cursor:pointer;font-weight:500">${'Anotações rápidas → organizar com IA'}</summary><div class="stack" style="margin-top:10px"><textarea class="input" id="ev-rapido" rows="3" placeholder="Ex.: fez 6 pedidos com mais+objeto, 2 espontâneos; prancha 12 símbolos; mãe vai repetir no lanche"></textarea><button type="button" class="btn btn-olive btn-sm" data-act="ev-ia">${ic('wand')} Organizar nos campos</button><span class="small muted" id="ev-ia-st"></span></div></details>
      ${[['ev-obj', 'Objetivos trabalhados'], ['ev-ativ', 'Atividades e estratégias'], ['ev-resp', 'Resposta da criança'], ['ev-ori', 'Orientações à família'], ['ev-prox', 'Próximos passos']].map(([id, l]) => `<div class="field"><label for="${id}">${l}</label><textarea class="input" id="${id}" rows="2"></textarea></div>`).join('')}
      <button class="btn btn-primary" type="submit">${ic('check')} Salvar evolução</button>
      <p class="small muted">${ic('lock').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} Registro interno: não aparece para os pais.</p>
    </form>`;
  }
  Acoes['ev-ia'] = async (b) => {
    const t = val('ev-rapido').trim(); if (!t) { UI.toast('Escreva as anotações primeiro.', 'bad'); return; }
    const st = $('#ev-ia-st'); b.disabled = true; st.textContent = 'Organizando…';
    try {
      const o = await IA.json(`Organize estas anotações de sessão de fonoaudiologia nos campos de uma evolução clínica, sem inventar nada além do que está escrito (campo sem informação fica vazio). Anotações: """${t}"""
Responda somente JSON: {"objetivos":"","atividades":"","resposta":"","orientacoes":"","proximos":""}`, { modelTier: 'quick' });
      const m = { objetivos: 'ev-obj', atividades: 'ev-ativ', resposta: 'ev-resp', orientacoes: 'ev-ori', proximos: 'ev-prox' };
      Object.entries(m).forEach(([k, id]) => { if (o && o[k]) $('#' + id).value = o[k]; }); st.textContent = 'Pronto. Revise e salve.';
    } catch (e) { st.textContent = IA.erro(e); }
    b.disabled = false;
  };
  Acoes['salvar-evolucao'] = async (form) => {
    const d = { pacienteId: form.dataset.pac, data: val('ev-data'), local: val('ev-local'), objetivos: val('ev-obj').trim(), atividades: val('ev-ativ').trim(), resposta: val('ev-resp').trim(), orientacoes: val('ev-ori').trim(), proximos: val('ev-prox').trim(), autor: eu().usuario };
    if (!d.objetivos && !d.atividades && !d.resposta) { UI.toast('Preencha pelo menos objetivos, atividades ou resposta.', 'bad'); return; }
    const e = await Dados.salvar('evolucoes', null, d); App.render(); modalTextoEvolucao(e);
  };
  function textoEvolucao(e) {
    const p = pac(e.pacienteId); const l = Dados.local(e.local);
    const campos = [['Objetivos trabalhados', e.objetivos], ['Atividades e estratégias', e.atividades], ['Resposta da criança', e.resposta], ['Orientações à família', e.orientacoes], ['Próximos passos', e.proximos]].filter((x) => x[1]);
    return ['EVOLUÇÃO FONOAUDIOLÓGICA', `Paciente: ${p ? p.nome : ''}`, `Data: ${fmt.data(e.data)}${l ? ' | Local: ' + l.nome : ''}`, '', ...campos.map(([k, v]) => `${k}: ${v}`), '', `${RF.marca.nome} | ${RF.marca.profissao} | ${RF.marca.crfa}`].join('\n');
  }
  function modalTextoEvolucao(e) {
    const t = textoEvolucao(e);
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Evolução registrada · uso interno</div><h2>Texto para o sistema da clínica</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <p class="muted small">Copie e cole no prontuário eletrônico da clínica. Este texto não aparece para os pais.</p>
      <textarea class="input" id="ev-texto" rows="12" readonly style="font-family:ui-monospace,Menlo,monospace;font-size:13px;margin-top:10px">${esc(t)}</textarea>
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" data-act="copiar-ev">${ic('copy')} Copiar texto</button></div>`);
  }
  Acoes['copiar-ev'] = () => { const ta = $('#ev-texto'); UI.copiar(ta.value, ta); try { ta.select(); } catch {} };
  Acoes['ev-copiar'] = (b) => { const e = Dados.get('evolucoes', b.dataset.id); if (e) modalTextoEvolucao(e); };
  function tlEvolucao(e) {
    return `<div class="tl"><div class="when"><b>${fmt.data(e.data)}</b>${esc((Dados.local(e.local) || {}).cidade || '')}<button class="btn btn-ghost btn-xs" style="margin-top:8px" data-act="ev-copiar" data-id="${e.id}">${ic('copy')} Copiar texto</button></div><div class="stack" style="gap:4px">${exTag(e) ? `<div>${exTag(e)}</div>` : ''}${[['Objetivos', e.objetivos], ['Atividades', e.atividades], ['Resposta', e.resposta], ['Orientações', e.orientacoes], ['Próximos passos', e.proximos]].filter((x) => x[1]).map(([k, v]) => `<div><span class="label">${k}</span><p>${esc(v)}</p></div>`).join('')}</div></div>`;
  }
  function evolucoes() {
    const ps = pacientesAtivos(); G.evPac = G.evPac || (ps[0] && ps[0].id); const p = pac(G.evPac);
    const evs = p ? Dados.lista('evolucoes').filter((e) => e.pacienteId === p.id).sort((a, b) => b.data.localeCompare(a.data)) : [];
    const corpo = `<div class="note">${ic('lock')}<div>As evoluções são registros internos da Rebeca. Elas alimentam os relatórios, mas nunca aparecem na Área do Usuário.</div></div>
      <div class="field" style="max-width:420px"><label for="ev-pac">Paciente</label><select class="input" id="ev-pac" data-change="ev-pac">${ps.map((x) => `<option value="${x.id}" ${x.id === G.evPac ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
      ${p ? `<div class="cols-2"><div class="panel"><h3>Nova evolução</h3><div style="margin-top:12px">${formEvolucao(p)}</div></div><div class="panel"><h3>Histórico de ${esc(p.nome.split(' ')[0])}</h3><div class="timeline" style="margin-top:8px">${evs.length ? evs.map(tlEvolucao).join('') : '<p class="muted small">Nenhum registro.</p>'}</div></div></div>` : '<p class="muted">Cadastre um paciente primeiro.</p>'}`;
    return { corpo };
  }
  Acoes['ev-pac'] = (s) => { G.evPac = s.value; App.render(); };

  /* ---------------- Recursos terapêuticos ---------------- */
  function gradeRecursos(p, rcs) { return RF.GX.grade(p, rcs); }
  function recursos() {
    const ps = pacientesAtivos(); G.rcsPac = G.rcsPac || (ps[0] && ps[0].id); const p = pac(G.rcsPac);
    const corpo = `<p class="muted">Escolha o paciente, libere os jogos indicados para as necessidades dele e ajuste o nível. Só os jogos liberados aparecem na Área do Usuário.</p>
      <div class="field" style="max-width:420px"><label for="rcs-pac">Paciente</label><select class="input" id="rcs-pac" data-change="rcs-pac">${ps.map((x) => `<option value="${x.id}" ${x.id === G.rcsPac ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
      ${p ? gradeRecursos(p, Dados.lista('recursos').filter((r) => r.pacienteId === p.id)) : ''}`;
    return { corpo };
  }
  Acoes['rcs-pac'] = (s) => { G.rcsPac = s.value; App.render(); };

  /* ---------------- Configurações ---------------- */
  function config() {
    const tab = G.cfgTab || 'locais'; const c = Dados.config(); const locs = Dados.locais();
    let conteudo = '';
    if (tab === 'locais') conteudo = RF.Clinicas.cfg();
    if (tab === 'site') conteudo = `<div class="stack" style="margin-top:16px">${RF.Clinicas.cfgContatos()}<form class="panel stack" data-submit="salvar-site"><h3>Textos e link</h3>
        <div class="field"><label for="cf-link">Link do sistema (enviado nas mensagens aos pais)</label><input class="input" id="cf-link" value="${esc(c.linkSite || '')}" placeholder="https://..."><span class="hint">Cole aqui o link de compartilhamento do sistema ou, no futuro, o domínio próprio (ex.: rebecafonsecafono.com.br).</span></div>
        <div class="field"><label for="cf-sobre-t">Frase de abertura do “Sobre mim”</label><textarea class="input" id="cf-sobre-t" rows="2">${esc((c.sobre || RF.sobre).titulo)}</textarea></div>
        <div class="field"><label for="cf-sobre-p">Texto do “Sobre mim” (um parágrafo por linha em branco)</label><textarea class="input" id="cf-sobre-p" rows="12">${esc(((c.sobre || RF.sobre).paragrafos || []).join('\n\n'))}</textarea></div>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Salvar</button></div></form></div>`;
    if (tab === 'senha') conteudo = `<form class="panel stack" style="max-width:460px" data-submit="trocar-senha-gestao"><h3>Alterar minha senha</h3>
        <div class="field"><label for="ts-0">Senha atual</label>${UI.pw('ts-0', '', 'inputmode="numeric" autocomplete="current-password"')}</div>
        <div class="field"><label for="ts-1">Nova senha (6 a 8 números)</label>${UI.pw('ts-1', '', 'inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password"')}</div>
        <div class="field"><label for="ts-2">Repita a nova senha</label>${UI.pw('ts-2', '', 'inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="new-password"')}</div>
        <div class="err" id="ts-err"></div><button class="btn btn-primary" type="submit">Alterar senha</button></form>`;
    if (tab === 'seguranca') conteudo = `<div class="panel stack"><h3>Proteção de dados (LGPD)</h3>
        <p>Dados de saúde de crianças são <b>dados pessoais sensíveis</b> pela Lei Geral de Proteção de Dados (Lei 13.709/2018). Nesta versão:</p>
        ${Dados.modo === 'supabase' ? `<ul style="margin:0;padding-left:20px;display:grid;gap:6px"><li>O login é conferido no servidor, com bloqueio temporário após várias tentativas erradas. As senhas nunca passam pelo navegador de outras pessoas.</li><li>O banco de dados fica no Brasil (São Paulo) e cada família só consegue ler os dados dos próprios filhos, por regra do próprio banco.</li><li>Evoluções, dados da equipe e redes sociais só são lidos pela equipe.</li><li>Fotos, assinaturas e vídeos ficam em arquivos privados, abertos só por links temporários.</li></ul>`
        : `<ul style="margin:0;padding-left:20px;display:grid;gap:6px"><li>As senhas são guardadas apenas como código criptográfico (PBKDF2), nunca em texto.</li><li>As evoluções e os dados da equipe só são lidos por quem tem acesso de editora no sistema.</li><li>Os responsáveis só veem, na tela, os dados dos próprios filhos.</li></ul>
        <div class="note warn">${ic('info')}<div><strong>Modo demonstração:</strong> os dados ficam só neste navegador.</div></div>`}</div>`;
    if (tab === 'equipe') conteudo = `<div class="panel"><h3>Equipe com acesso total</h3><div class="list" style="margin-top:10px">${(Dados.lista('equipe').length ? Dados.lista('equipe') : [{ nome: eu().nome, usuario: eu().usuario }]).map((u) => `<div class="li">${UI.avatar(u)}<div class="grow"><div class="t">${esc(u.nome)}</div><div class="s">${esc(u.usuario || u.id)}</div></div>${u.primeiroAcesso ? '<span class="pill warn">Aguardando 1º acesso</span>' : '<span class="pill ok">Ativo</span>'}</div>`).join('')}</div></div>`;
    if (tab === 'estrelas') conteudo = RF.GX.cfgEstrelas();
    if (tab === 'termos') conteudo = RF.GX.cfgTermos();
    if (tab === 'ciclo') conteudo = RF.Ciclo.cfg();
    const TABS = [['locais', 'Clínicas e agenda'], ['site', 'Site e contatos'], ['estrelas', 'Estrelas e presentes'], ['termos', 'Termos LGPD e TCLE'], ['ciclo', 'Fim de ciclo'], ['senha', 'Minha senha'], ['equipe', 'Equipe'], ['seguranca', 'Segurança e LGPD']];
    return { corpo: `<div class="subtabs">${TABS.map(([k, n]) => `<button class="subtab" aria-selected="${tab === k}" data-act="cfg-tab" data-tab="${k}">${n}</button>`).join('')}</div>${conteudo}` };
  }
  Acoes['cfg-tab'] = (b) => { G.cfgTab = b.dataset.tab; G.locsEd = null; G.gFases = null; App.render(); };
  Acoes['salvar-locais'] = async (form) => {
    const locs = Dados.locais().map((l, i) => {
      const box = form.querySelector(`[data-loc="${i}"]`); const g = (k) => box.querySelector(`[data-k="${k}"]`).value.trim();
      const dias = $$('[data-dia]', box).filter((s) => s.value).map((s) => ({ d: +s.dataset.dia, turno: s.value }));
      return { ...l, nome: g('nome'), cidade: g('cidade'), endereco: g('endereco'), whatsapp: Whats.numero(g('whatsapp')), email: g('email'), maps: g('maps'), dias };
    });
    const bad = locs.find((l) => l.email && !Valida.email(l.email)); if (bad) { UI.toast(`E-mail inválido em ${bad.nome}.`, 'bad'); return; }
    await Dados.salvar('config', 'site', { ...Dados.config(), locais: locs }); UI.toast('Locais atualizados no site.');
  };
  Acoes['salvar-site'] = async () => {
    const link = val('cf-link').trim(); if (link && !/^https?:\/\//.test(link)) { UI.toast('O link precisa começar com https://', 'bad'); return; }
    await Dados.salvar('config', 'site', { ...Dados.config(), linkSite: link, sobre: { titulo: val('cf-sobre-t').trim(), paragrafos: val('cf-sobre-p').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) } });
    UI.toast('Textos salvos. O site já mostra as mudanças.');
  };
  Acoes['trocar-senha-gestao'] = async () => {
    const err = $('#ts-err'); const reg = Dados.get('equipe', eu().usuario); if (!reg) { err.textContent = 'Usuário de demonstração não tem senha.'; return; }
    const a = val('ts-1'), b = val('ts-2'); if (!/^\d{6,8}$/.test(a)) { err.textContent = 'Use de 6 a 8 números.'; return; } if (senhaFraca(a)) { err.textContent = 'Senha fácil de adivinhar.'; return; } if (a !== b) { err.textContent = 'As senhas não são iguais.'; return; }
    if (Dados.modo === 'supabase') {
      err.textContent = 'Salvando…';
      try { await Auth.trocarSenha(a, val('ts-0')); } catch (e) { err.textContent = (e && e.message) || 'Não foi possível alterar a senha.'; return; }
      err.textContent = ''; UI.toast('Senha alterada.'); App.render(); return;
    }
    if (!(await Senha.confere(val('ts-0'), reg))) { err.textContent = 'A senha atual não confere.'; return; }
    await Dados.atualizar('equipe', reg.id, { ...(await Senha.hash(a)), senhaTrocadaEm: new Date().toISOString() }); err.textContent = ''; UI.toast('Senha alterada.'); App.render();
  };

  RF.G = { pac, respsDe, pacientesAtivos, nomeLocal, botoesWhats, exTag, salvarRel, preencherIdent, atualizarPrev, modalEnvio, textoEvolucao };
})();
