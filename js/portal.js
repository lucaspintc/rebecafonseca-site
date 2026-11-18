/* Área do Usuário (pais e responsáveis) */
(function () {
  const A = App.sub.a = App.sub.a || { tab: 'recursos' };
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const sess = () => App.sessao.area;
  const eu = () => sess() && Dados.get('responsaveis', sess().id);
  let falhas = 0, bloqueadoAte = 0;
  const DEMO = { usuario: 'mariana.santos', senha: '52998224725' };
  const T = () => RF.Termos;

  function telaAuth(titulo, corpo) {
    return `<div class="auth"><div class="side pattern" style="background-color:var(--terra)">
      <button class="btn btn-sm" style="background:rgba(255,255,255,.18);color:#fff;align-self:flex-start" data-act="ir" data-rota="inicio">← Voltar ao site</button>
      <div class="stack auth-id" style="gap:18px"><div class="photo"><img src="img/rebeca-perfil.jpg" alt="Rebeca Fonseca, fonoaudióloga"></div><div class="auth-txt"><div class="quem"><b>Rebeca Fonseca</b><span>Fonoaudióloga · ${esc(RF.marca.crfa)}</span></div><h2>${titulo}</h2><p class="hide-sm" style="opacity:.88;max-width:380px">Relatórios, recados e jogos que a Rebeca preparou para o seu filho, em um só lugar.</p></div></div>
      <img class="hide-sm" src="img/logo-branco.png" alt="Rebeca Fonseca Fonoaudióloga" style="width:220px">
    </div><div class="main">${corpo}</div></div>`;
  }
  const passos = (n) => `<div class="steps" aria-label="Etapa ${n} de 4">${[1, 2, 3, 4].map((i) => `<span class="${i <= n ? 'on' : ''}"></span>`).join('')}</div>`;

  function login() {
    if (Dados.modo === 'carregando' || !Dados.pronto('responsaveis')) return telaAuth('Área do Usuário', '<p class="muted">Carregando…</p>');
    const temDemo = Dados.modo === 'local' && !!Dados.lista('responsaveis').find((r) => r.usuario === DEMO.usuario && r.primeiroAcesso);
    return telaAuth('Área do Usuário', `<form data-submit="login-area" autocomplete="on">
      <div class="eyebrow">Pais e responsáveis</div><h1>Entrar</h1>
      <div class="field"><label for="la-u">Usuário</label><input class="input" id="la-u" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nome.sobrenome" required></div>
      <div class="field"><label for="la-p">Senha</label>${UI.pw('la-p', 'Somente números', 'inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" required')}<span class="hint">Primeiro acesso? Sua senha é o número do documento que você informou à Rebeca, só os números.</span></div>
      <div class="err" id="la-err" role="alert"></div>
      <button class="btn btn-primary" type="submit">Entrar</button>
      <p class="small muted">Esqueceu a senha? Fale com a Rebeca pelo <a href="${Whats.link(RF.marca.whatsapp, 'Olá, Rebeca! Esqueci minha senha da Área do Usuário.')}" target="_blank" rel="noopener">WhatsApp</a> para redefinir.</p>
      ${temDemo ? `<button class="btn btn-ghost" type="button" data-act="demo-area">Ver como responsável de exemplo</button>` : ''}
    </form>`);
  }
  async function entrar(u, p) {
    const err = $('#la-err');
    if (Dados.modo === 'supabase') {
      // Login conferido no servidor, com limite de tentativas e bloqueio temporário
      err.textContent = 'Conferindo…';
      try { await Auth.entrar(u, p, 'area'); A.tab = 'recursos'; const r = eu(); A.filho = r && (r.pacientes || [])[0]; App.render(); }
      catch (e) { const el = $('#la-err'); if (el) el.textContent = (e && e.message) || 'Usuário ou senha incorretos.'; }
      return;
    }
    if (Date.now() < bloqueadoAte) { err.textContent = 'Muitas tentativas. Aguarde 30 segundos.'; return; }
    const reg = Dados.lista('responsaveis').find((r) => r.usuario === u);
    err.textContent = 'Conferindo…';
    if (!reg || !(await Senha.confere(p, reg))) { err.textContent = 'Usuário ou senha incorretos.'; falhas++; if (falhas >= 5) { bloqueadoAte = Date.now() + 30000; falhas = 0; } return; }
    falhas = 0; App.sessao.area = { id: reg.id }; ss.set('sessao:area', App.sessao.area); A.tab = 'recursos'; A.filho = (reg.pacientes || [])[0]; App.render();
  }
  Acoes['login-area'] = () => entrar(val('la-u').trim().toLowerCase(), val('la-p').trim());
  Acoes['demo-area'] = () => { $('#la-u').value = DEMO.usuario; $('#la-p').value = DEMO.senha; entrar(DEMO.usuario, DEMO.senha); };
  Acoes['sair-area'] = async () => { App.sessao.area = null; ss.del('sessao:area'); if (Dados.modo === 'supabase') await Auth.sair(); App.render(); };

  /* Etapa 1: senha nova */
  function etapaSenha(r) {
    return telaAuth('Primeiro acesso', `<form data-submit="area-senha" autocomplete="off">${passos(1)}
      <div class="eyebrow">Olá, ${esc(r.nome.split(' ')[0])}</div><h1>Crie sua senha</h1>
      <p class="muted">Sua nova senha tem 6 números. Ela substitui o número do documento a partir de agora.</p>
      <div class="field"><label for="ap-1">Nova senha</label><input class="input pin" id="ap-1" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password" placeholder="••••••" required></div>
      <div class="field"><label for="ap-2">Repita a senha</label><input class="input pin" id="ap-2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="new-password" placeholder="••••••" required></div>
      <div class="err" id="ap-err" role="alert"></div>
      <button class="btn btn-primary" type="submit">Continuar</button><button class="linkbtn" type="button" data-act="sair-area">Sair</button>
    </form>`);
  }
  Acoes['area-senha'] = async () => {
    const a = val('ap-1'), b = val('ap-2'), err = $('#ap-err'), r = eu();
    if (!/^\d{6}$/.test(a)) { err.textContent = 'A senha precisa ter exatamente 6 números.'; return; }
    if (/^(\d)\1+$/.test(a) || '0123456789'.includes(a) || '9876543210'.includes(a)) { err.textContent = 'Essa senha é muito fácil de adivinhar. Escolha outra.'; return; }
    if (a !== b) { err.textContent = 'As senhas não são iguais.'; return; }
    err.textContent = 'Salvando…';
    if (Dados.modo === 'supabase') {
      try { await Auth.trocarSenha(a); } catch (e) { err.textContent = (e && e.message) || 'Não foi possível salvar a senha.'; return; }
    } else await Dados.atualizar('responsaveis', r.id, { ...(await Senha.hash(a)), primeiroAcesso: false, senhaTrocadaEm: new Date().toISOString() });
    App.render();
  };

  /* Etapa 2: dados do responsável */
  function etapaPerfil(r) {
    const tipo = RF.tiposDoc.responsavelPerfil.includes(r.docTipo) ? r.docTipo : 'CPF';
    return telaAuth('Quase lá', `<form data-submit="area-perfil" novalidate>${passos(2)}
      <div class="eyebrow">Seus dados</div><h1>Complete seu cadastro</h1>
      <p class="muted">Usamos o WhatsApp para enviar recados e avisos de relatório.</p>
      <div class="field"><label>Documento de identificação *</label><div class="inline-input"><select class="input" id="pp-tipo" data-change="pp-doc">${RF.tiposDoc.responsavelPerfil.map((t) => `<option ${t === tipo ? 'selected' : ''}>${t}</option>`).join('')}</select><input class="input" id="pp-doc" data-input="pp-doc" value="${esc(tipo === r.docTipo ? r.docNumero : '')}" inputmode="numeric" autocomplete="off"></div><span class="err" id="pp-doc-err"></span></div>
      <div class="field"><label for="pp-w">WhatsApp *</label><input class="input" id="pp-w" data-input="mask-cel" value="${esc(r.whatsapp ? Valida.mascaraCel(so(r.whatsapp).replace(/^55/, '')) : '')}" inputmode="tel" autocomplete="tel" placeholder="(75) 9 0000-0000"><span class="err" id="pp-w-err"></span></div>
      <div class="field"><label for="pp-e">E-mail <span class="muted">(opcional)</span></label><input class="input" id="pp-e" type="email" inputmode="email" autocomplete="email" value="${esc(r.email || '')}"><span class="err" id="pp-e-err"></span></div>
      <button class="btn btn-primary" type="submit">Continuar</button>
    </form>`);
  }
  Acoes['pp-doc'] = () => { const t = val('pp-tipo'); const i = $('#pp-doc'); i.value = Valida.mascaraDoc(t, i.value); i.setAttribute('inputmode', t === 'RG' ? 'text' : 'numeric'); i.classList.toggle('good', Valida.doc(t, i.value)); $('#pp-doc-err').textContent = ''; };
  Acoes['area-perfil'] = async () => {
    const t = val('pp-tipo'), d = val('pp-doc').trim(), w = val('pp-w'), e = val('pp-e').trim(); let ok = true;
    if (!Valida.doc(t, d)) { $('#pp-doc-err').textContent = Valida.msgDoc(t); $('#pp-doc').classList.add('bad'); ok = false; }
    if (!Valida.celular(w)) { $('#pp-w-err').textContent = 'Informe um celular com DDD, ex.: (75) 9 8367-8360.'; $('#pp-w').classList.add('bad'); ok = false; } else $('#pp-w-err').textContent = '';
    if (e && !Valida.email(e)) { $('#pp-e-err').textContent = 'E-mail inválido.'; ok = false; } else $('#pp-e-err').textContent = '';
    if (!ok) return;
    await Dados.atualizar('responsaveis', eu().id, { docTipo: t, docNumero: Valida.mascaraDoc(t, d), whatsapp: Whats.numero(w), email: e, perfilCompleto: true });
    App.render();
  };

  /* Etapa 3: LGPD (leitura obrigatória) */
  function etapaLGPD(r) {
    const t = T().atual('lgpd');
    return telaAuth('Privacidade e proteção de dados', `<div class="stack" style="width:100%;max-width:560px;gap:14px">${passos(3)}
      <div class="eyebrow">Lei Geral de Proteção de Dados</div><h1 style="font-size:28px">${esc(t.titulo)}</h1>
      <p class="muted small">Leia o termo até o fim para liberar a confirmação. Versão ${esc(t.versao)}.</p>
      <div class="termo" id="termo-lgpd" data-termo-scroll="lgpd-ok" tabindex="0">${T().html('lgpd')}</div>
      <p class="small" id="lgpd-dica" style="color:var(--warn)">Role até o fim do termo para confirmar a leitura.</p>
      <label class="check"><input type="checkbox" id="lgpd-ok" disabled><span>Li e compreendi o termo e <b>consinto</b> com o tratamento dos meus dados e dos dados da criança sob minha responsabilidade.</span></label>
      <div class="err" id="lgpd-err" role="alert"></div>
      <div class="row"><button class="btn btn-primary" data-act="lgpd-aceitar">Confirmar e continuar</button><button class="btn btn-ghost" data-act="lgpd-pdf">${ic('download')} Baixar PDF</button></div>
      <button class="linkbtn small" data-act="sair-area" style="align-self:flex-start">Sair</button>
    </div>`);
  }
  document.addEventListener('scroll', (e) => {
    const box = e.target; if (!box || !box.dataset || !box.dataset.termoScroll) return;
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 12) { const c = document.getElementById(box.dataset.termoScroll); if (c && c.disabled) { c.disabled = false; const d = $('#lgpd-dica') || $('#tcle-dica'); if (d) { d.textContent = 'Leitura concluída. Agora você pode confirmar.'; d.style.color = 'var(--ok)'; } } }
  }, true);
  function liberarSeCurto(id, cid) { setTimeout(() => { const box = document.getElementById(id); if (box && box.scrollHeight <= box.clientHeight + 12) { const c = document.getElementById(cid); if (c) c.disabled = false; } }, 50); }
  Acoes['lgpd-aceitar'] = async () => {
    const c = $('#lgpd-ok'); if (!c.checked) { $('#lgpd-err').textContent = c.disabled ? 'Role o termo até o fim para liberar a confirmação.' : 'Marque a caixa de confirmação para continuar.'; return; }
    const r = eu(); const t = T().atual('lgpd'); const em = new Date().toISOString();
    const hash = await Hash.sha256(JSON.stringify({ termo: T().secoes('lgpd'), versao: t.versao, usuario: r.usuario, em }));
    await Dados.atualizar('responsaveis', r.id, { lgpd: { versao: t.versao, em, hash, agente: navigator.userAgent.slice(0, 160) } }, { silencioso: true });
    UI.toast('Termo aceito. Obrigado!'); App.render();
  };
  Acoes['lgpd-pdf'] = () => T().pdfLGPD(eu());

  /* Etapa 4: TCLE de imagem, uma criança por vez */
  function etapaTCLE(r, pid) {
    const p = Dados.get('pacientes', pid); const nome = p ? p.nome : 'a criança';
    if (A.tcleSim !== pid) {
      return telaAuth('Uso de imagem', `<div class="stack" style="width:100%;max-width:520px;gap:16px">${passos(4)}
        <div class="eyebrow">Autorização de imagem · ${esc(nome.split(' ')[0])}</div>
        <h1 style="font-size:28px">Você autoriza que imagens, vídeos e voz de ${esc(nome.split(' ')[0])} sejam publicados nas redes sociais e no site da Fono Rebeca?</h1>
        <p class="muted">Usamos apenas em conteúdos educativos, sem diagnóstico, nome completo ou dados da família. Você pode mudar de ideia a qualquer momento, e a resposta não altera em nada o atendimento.</p>
        <div class="sim-nao"><button class="btn btn-primary" data-act="tcle-sim" data-pid="${pid}">${ic('check')} Sim, autorizo</button><button class="btn btn-ghost" data-act="tcle-nao" data-pid="${pid}">Não autorizo</button></div>
        <button class="linkbtn small" data-act="tcle-ler" style="align-self:flex-start">Ler o termo completo antes de responder</button>
        <div class="termo" id="tcle-previa" hidden>${T().html('tcle', { crianca: nome, responsavel: r.nome, documento: `${r.docTipo} ${r.docNumero}` })}</div>
      </div>`);
    }
    return telaAuth('Assinatura do termo', `<div class="stack" style="width:100%;max-width:560px;gap:14px">${passos(4)}
      <div class="eyebrow">TCLE · ${esc(nome)}</div><h1 style="font-size:26px">${esc(T().atual('tcle').titulo)}</h1>
      <div class="termo" id="termo-tcle" data-termo-scroll="tcle-li" tabindex="0">${T().html('tcle', { crianca: nome, responsavel: r.nome, documento: `${r.docTipo} ${r.docNumero}` })}</div>
      <p class="small" id="tcle-dica" style="color:var(--warn)">Role até o fim do termo para liberar a assinatura.</p>
      <label class="check"><input type="checkbox" id="tcle-li" disabled><span>Li o termo e autorizo o uso de imagem, vídeo e voz de ${esc(nome.split(' ')[0])}.</span></label>
      <div class="grid-form"><div class="field"><label for="tc-nome">Nome completo do responsável</label><input class="input" id="tc-nome" value="${esc(r.nome)}"></div><div class="field"><label for="tc-doc">Documento</label><input class="input" id="tc-doc" value="${esc(`${r.docTipo} ${r.docNumero}`)}" readonly></div></div>
      ${T().pad('tc-pad')}
      <div class="err" id="tc-err" role="alert"></div>
      <div class="row"><button class="btn btn-primary" data-act="tcle-assinar" data-pid="${pid}">${ic('edit')} Assinar e continuar</button><button class="btn btn-ghost" data-act="tcle-voltar">Voltar</button></div>
    </div>`);
  }
  Acoes['tcle-ler'] = () => { const b = $('#tcle-previa'); if (b) b.hidden = !b.hidden; };
  Acoes['tcle-sim'] = (b) => { A.tcleSim = b.dataset.pid; App.render(); window.scrollTo(0, 0); };
  Acoes['tcle-voltar'] = () => { A.tcleSim = null; App.render(); };
  Acoes['tcle-nao'] = async (b) => { await registrarTCLE(b.dataset.pid, { resposta: 'nao' }); UI.toast('Resposta registrada: não autorizado.'); };
  Acoes['tcle-assinar'] = async (b) => {
    const err = $('#tc-err'); if (!$('#tcle-li').checked) { err.textContent = $('#tcle-li').disabled ? 'Role o termo até o fim e marque a confirmação.' : 'Marque a confirmação de leitura.'; return; }
    const nome = val('tc-nome').trim(); if (nome.split(/\s+/).length < 2) { err.textContent = 'Escreva o nome completo.'; return; }
    const ass = T().lerPad('tc-pad'); if (!ass) { err.textContent = 'Faça sua assinatura no quadro.'; return; }
    await registrarTCLE(b.dataset.pid, { resposta: 'sim', nome, documento: val('tc-doc'), assinatura: ass }); UI.toast('Termo assinado. Obrigado!');
  };
  async function registrarTCLE(pid, dados) {
    const r = eu(); const t = T().atual('tcle'); const em = new Date().toISOString(); const p = Dados.get('pacientes', pid);
    const hash = await Hash.sha256(JSON.stringify({ termo: T().secoes('tcle', { crianca: p && p.nome, responsavel: dados.nome || r.nome, documento: dados.documento || '' }), versao: t.versao, resposta: dados.resposta, usuario: r.usuario, em }));
    if (dados.assinatura) dados = { ...dados, assinatura: await Arquivos.guardarDataURL('assinaturas', `${pid}/${r.id}-${Date.now()}.png`, dados.assinatura) };
    const tcle = { ...(r.tcle || {}), [pid]: { ...dados, versao: t.versao, em, hash, crianca: p ? p.nome : '' } };
    await Dados.atualizar('responsaveis', r.id, { tcle }, { silencioso: true }); A.tcleSim = null; App.render();
  }

  /* Portal */
  function sobreRebeca() {
    const c = Dados.config(); const s = c.sobre || RF.sobre;
    return `<div class="cols-2"><div class="panel stack"><div class="row" style="gap:16px"><span class="avatar lg"><img src="img/hero.jpg" alt=""></span><div><h2 style="font-size:28px">${esc(RF.marca.nome)}</h2><div class="muted">${esc(RF.marca.profissao)} · ${esc(RF.marca.crfa)}</div></div></div>
      <blockquote style="margin:0;font:italic 400 21px/1.35 var(--f-display);color:var(--terra-ink)">${esc(s.titulo)}</blockquote>${(s.paragrafos || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="stack" style="gap:20px"><div class="panel"><h3>Formação e cursos</h3><ul class="creds-list">${RF.formacao.map((f) => `<li><span>${esc(f.tipo)}</span><span><b>${esc(f.titulo)}</b><br><span class="muted">${esc(f.inst)}</span></span></li>`).join('')}</ul></div>
      <div class="panel"><h3>Onde ela atende</h3><div class="list" style="margin-top:8px">${Dados.locais().map((l) => `<div class="li"><div class="grow"><div class="t">${esc(l.nome)}</div><div class="s">${esc(l.dias.map((d) => RF.diasSemana[d.d] + (d.turno !== 'Dia todo' ? ' (' + d.turno.toLowerCase() + ')' : '')).join(', '))} · ${esc(l.cidade)}</div></div><a class="btn btn-ghost btn-xs" href="${esc(l.maps)}" target="_blank" rel="noopener">${ic('pin')} Mapa</a></div>`).join('')}</div></div>
      <div class="panel"><h3>Contato</h3><div class="stack" style="margin-top:10px"><a class="btn btn-wa" href="${Whats.link(RF.marca.whatsapp, 'Olá, Rebeca!')}" target="_blank" rel="noopener">${ic('whats')} WhatsApp ${esc(RF.marca.whatsappTexto)}</a><div class="row"><span data-copia>${esc(RF.marca.email)}</span><button class="btn btn-ghost btn-xs" data-act="copiar" data-texto="${esc(RF.marca.email)}">${ic('copy')} Copiar</button></div><div class="row"><a class="btn btn-ghost btn-sm" href="https://www.instagram.com/${esc(RF.marca.instagram)}/" target="_blank" rel="noopener">${ic('insta')} @${esc(RF.marca.instagram)}</a><a class="btn btn-ghost btn-sm" href="https://www.tiktok.com/@${esc(RF.marca.tiktok)}" target="_blank" rel="noopener">${ic('tiktok')} TikTok</a></div></div></div></div></div>`;
  }
  function abaTermos(r, filhos) {
    const lg = r.lgpd;
    return `<div class="cols-2"><div class="panel stack"><div class="row between"><h3>Proteção de dados (LGPD)</h3><span class="pill ok">Aceito</span></div><p class="small muted">Versão ${esc(lg ? lg.versao : '')} · aceito em ${fmt.dataHora(lg && lg.em)}</p>
        <div class="row"><button class="btn btn-ghost btn-sm" data-act="lgpd-ver">Ler o termo</button><button class="btn btn-ghost btn-sm" data-act="lgpd-pdf">${ic('download')} Baixar PDF</button></div>
        <div class="note">${ic('info')}<div>Você pode pedir acesso, correção, cópia ou exclusão dos seus dados pelo WhatsApp ${esc(RF.marca.whatsappTexto)} ou pelo e-mail ${esc(RF.marca.email)}.</div></div></div>
      <div class="panel stack"><h3>Uso de imagem (TCLE)</h3>${filhos.map((f) => { const x = T().tcle(r, f.id); const st = !x ? ['warn', 'Aguardando resposta'] : x.revogadoEm ? ['bad', 'Autorização revogada'] : x.resposta === 'sim' ? ['ok', 'Autorizado'] : ['bad', 'Não autorizado'];
        return `<div class="li" style="flex-wrap:wrap"><div class="grow"><div class="t">${esc(f.nome.split(' ')[0])}</div><div class="s">${x ? fmt.dataHora(x.revogadoEm || x.em) : ''}</div></div><span class="pill ${st[0]}">${st[1]}</span>${x ? `<button class="btn btn-ghost btn-xs" data-act="tcle-pdf" data-pid="${f.id}">${ic('download')} PDF</button>` : ''}${x && x.resposta === 'sim' && !x.revogadoEm ? `<button class="btn btn-danger btn-xs" data-act="tcle-revogar" data-pid="${f.id}">Revogar</button>` : `<button class="btn btn-ghost btn-xs" data-act="tcle-refazer" data-pid="${f.id}">${x ? 'Mudar resposta' : 'Responder'}</button>`}</div>`; }).join('')}
        <p class="small muted">A revogação vale para novas publicações e as postagens que identifiquem a criança serão removidas das contas da Rebeca.</p></div></div>`;
  }
  Acoes['lgpd-ver'] = () => UI.modal(`<div class="modal-head"><h2>${esc(T().atual('lgpd').titulo)}</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div><div class="termo" style="max-height:none">${T().html('lgpd')}</div>`, { wide: true });
  Acoes['tcle-pdf'] = (b) => T().pdfTCLE(eu(), b.dataset.pid);
  Acoes['tcle-revogar'] = async (b) => {
    if (!(await UI.confirmar('Revogar autorização de imagem?', 'A Rebeca não usará mais imagens, vídeos ou voz da criança e removerá as postagens que a identifiquem.', 'Revogar'))) return;
    const r = eu(); const atual = T().tcle(r, b.dataset.pid); await Dados.atualizar('responsaveis', r.id, { tcle: { ...(r.tcle || {}), [b.dataset.pid]: { ...atual, revogadoEm: new Date().toISOString() } } }, { silencioso: true }); UI.toast('Autorização revogada.');
  };
  Acoes['tcle-refazer'] = async (b) => { const r = eu(); const t = { ...(r.tcle || {}) }; delete t[b.dataset.pid]; await Dados.atualizar('responsaveis', r.id, { tcle: t }, { silencioso: true }); App.render(); };

  function selo(x, pid) {
    const p = Dados.get('pacientes', pid); if (!p || p.ativo === false || x.jogo === 'prancha') return '';
    const st = RF.Jogos.Estrelas.status(pid); if (!st.unicoPorFase) return '';
    return st.concluidos.includes(x.id) ? '<span class="pill ok">✓ Já valeu nesta fase</span>' : `<span class="pill vale" style="--fase:${esc(st.cor)}">★ Vale estrela</span>`;
  }
  function cartaoJogo(x, pid) {
    const j = RF.jogos[x.jogo]; if (!j) return '';
    return `<div class="game-card"><div class="row between"><span class="art">${j.icone}</span>${j.modo === 'junto' ? '<span class="pill rose">Brincar junto</span>' : ''}</div><h4>${esc(j.nome)}</h4><p class="small muted">${esc(j.desc)}</p>
      <div class="row" style="gap:6px"><span class="pill sage">${esc(RF.areas[j.area])}</span>${selo(x, pid)}</div>
      ${x.nota ? `<p class="small" style="color:var(--terra-ink)"><b>Dica da Rebeca:</b> ${esc(x.nota)}</p>` : ''}
      <div class="row" style="margin-top:auto"><button class="btn btn-primary btn-sm" data-act="jogar" data-id="${x.id}" data-pid="${pid}">${ic('play')} Jogar</button><button class="linkbtn small" data-act="porque" data-jogo="${x.jogo}">Por que este recurso?</button></div></div>`;
  }

  function portal(r) {
    const filhos = (r.pacientes || []).map((id) => Dados.get('pacientes', id)).filter(Boolean);
    if (!A.filho || !filhos.find((f) => f.id === A.filho)) A.filho = filhos[0] && filhos[0].id;
    const f = Dados.get('pacientes', A.filho); const tab = A.tab || 'recursos';
    const rcs = f ? Dados.lista('recursos').filter((x) => x.pacienteId === f.id && x.ativo && RF.jogos[x.jogo]) : [];
    const recs = f ? Dados.lista('recados').filter((x) => x.pacienteId === f.id).sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm)) : [];
    const rels = f ? Dados.lista('relatorios').filter((x) => x.pacienteId === f.id && x.status === 'publicado').sort((a, b) => (b.data || '').localeCompare(a.data || '')) : [];
    const loc = f && Dados.local(f.local);
    const E = RF.Jogos.Estrelas; const inativo = !!(f && f.ativo === false); const st = f && !inativo ? E.status(f.id) : null;
    const fc = (f && f.ciclo) || {};
    const avisoFim = inativo ? `<div class="ciclo-aviso inativo"><div class="grow"><div><b>${ic('heart')} Acompanhamento finalizado${fc.data ? ` em ${fmt.data(fc.data)}` : ''}</b>${fc.motivo ? ` · ${esc(fc.motivo)}` : ''}</div><p class="small">Os relatórios, recados e materiais de ${esc(f.nome.split(' ')[0])} continuam disponíveis aqui para você.${rels.length ? ' O relatório final está na aba Relatórios.' : ''}</p></div></div>` : '';
    let conteudo = '';
    if (tab === 'recursos' && st && st.progresso >= st.por && !st.bloqueado) E.sincronizar(f.id).then((x) => { if (x && x.ganhou) { UI.toast('A estrela guardada chegou! ★'); if (x.presente) RF.Jogos.Festa.grande('Uhuul! Presente da Fono Rebeca!'); App.render(); } });
    if (tab === 'recursos') conteudo = `${st ? `<div class="panel estrelas-panel" style="--fase:${esc(st.cor)}"><div><div class="eyebrow">Estrelas de ${esc(f.nome.split(' ')[0])} · <span class="fase-tag">${esc(st.nome)}${st.corNome ? ` · estrelas ${esc(st.corNome)}` : ''}</span></div>${E.barra(f.id, true)}
        <p class="small" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">Próxima estrela: ${E.pontos(f.id)} <span class="tnum">${Math.min(st.progresso, st.por)} de ${st.por} recursos concluídos</span></p>
        <p class="small muted">${st.por} recursos diferentes = 1 estrela · até ${st.limite} estrela${st.limite > 1 ? 's' : ''} por ${esc(st.nomePeriodo)} · a cada ${st.porPresente} estrelas, um presente da Fono Rebeca${st.unicoPorFase ? ' · cada recurso vale uma vez por fase' : ''}.${st.guardada ? ` <b>Estrela garantida: chega a partir de ${esc(E.dataProxima(st))}.</b>` : st.bloqueado ? ` <b>A estrela desta ${esc(st.nomePeriodo)} já foi conquistada!</b>` : ''}${st.pendentes ? ` <b style="color:var(--terra-ink)">${st.pendentes} presente${st.pendentes > 1 ? 's' : ''} para buscar na próxima sessão!</b>` : ''}</p></div></div>
      ${st.fase > 1 && !st.concluidos.length && !st.estrelasFase ? `<div class="note fase-nova" style="--fase:${esc(st.cor)}"><span class="fase-estrela">★</span><div>${esc(E.cfg().mensagemFase.replace('{cor}', st.corNome || 'de outra cor'))}</div></div>` : ''}` : ''}
      <div class="note">${ic('heart')}<div>${esc(RF.telas.texto)} <button class="linkbtn" data-act="ver-telas">Ver referências</button></div></div>
      ${rcs.length ? `<div class="games">${rcs.map((x) => cartaoJogo(x, f.id)).join('')}</div>` : `<div class="empty">${ic('puzzle')}<div>A Rebeca ainda não liberou jogos para ${esc(f ? f.nome.split(' ')[0] : 'seu filho')}.</div></div>`}`;
    if (tab === 'recados') conteudo = `<div class="panel"><div class="timeline">${recs.length ? recs.map((x) => `<div class="tl"><div class="when"><b>${fmt.data(x.enviadoEm)}</b>${new Date(x.enviadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div><div class="msg" style="max-width:none">${esc(x.texto)}</div></div>`).join('') : '<p class="muted">Nenhum recado ainda.</p>'}</div></div>`;
    if (tab === 'relatorios') conteudo = `<div class="panel">${rels.length ? `<div class="list">${rels.map((x) => `<div class="li"><span class="avatar" style="background:var(--sage-soft)">${ic('file')}</span><div class="grow"><div class="t">${esc(x.titulo)}</div><div class="s">${fmt.dataLonga(x.data)}</div></div><button class="btn btn-ghost btn-sm" data-act="ver-rel" data-id="${x.id}">Ler</button><button class="btn btn-ghost btn-sm" data-act="pdf-rel" data-id="${x.id}">${ic('download')} PDF</button></div>`).join('')}</div>` : '<p class="muted">Nenhum relatório publicado ainda.</p>'}</div>`;
    if (tab === 'sobre') conteudo = sobreRebeca();
    if (tab === 'termos') conteudo = abaTermos(r, filhos);
    const TABS = [['recursos', 'Jogos e recursos'], ['recados', 'Recados'], ['relatorios', 'Relatórios'], ['sobre', 'Sobre a Rebeca'], ['termos', 'Termos e privacidade']];
    return `<div style="min-height:100vh;background:var(--mist)">
      <header class="site-head"><div class="wrap"><a href="#" data-act="ir" data-rota="inicio" aria-label="Site"><img class="brand-logo light-only" src="img/logo-verde.png" alt="Rebeca Fonseca"><img class="brand-logo dark-only" src="img/logo-branco.png" alt="" aria-hidden="true"></a><div class="grow"></div><button class="btn btn-ghost btn-sm" data-act="sair-area">${ic('out')} Sair</button></div></header>
      <div class="wrap" style="padding-block:28px 60px;display:flex;flex-direction:column;gap:20px">
        ${f ? `<div class="bubble" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${UI.avatar(f, 'lg')}<div class="grow"><div class="eyebrow">Olá, ${esc(r.nome.split(' ')[0])}</div><h1 style="font-size:clamp(28px,4vw,38px);margin-top:4px">${esc(f.nome.split(' ')[0])}${f.exemplo ? ' <span class="ex">exemplo</span>' : ''}</h1><div class="row" style="margin-top:8px"><span class="pill terra">${esc(fmt.idade(f.nascimento))}</span>${loc ? `<span class="pill sage">${ic('pin')} ${esc(loc.nome)}</span>` : ''}</div></div>
          ${inativo ? '' : E.barra(f.id)}${filhos.length > 1 ? `<select class="input" style="max-width:220px" data-change="trocar-filho">${filhos.map((x) => `<option value="${x.id}" ${x.id === f.id ? 'selected' : ''}>${esc(x.nome.split(' ')[0])}</option>`).join('')}</select>` : ''}</div>` : `<div class="empty">Nenhuma criança vinculada a este acesso. Fale com a Rebeca.</div>`}
        <div class="subtabs" role="tablist">${TABS.map(([k, n]) => `<button class="subtab" role="tab" aria-selected="${tab === k}" data-act="area-tab" data-tab="${k}">${n}${k === 'recados' && recs.length ? ` <span class="pill rose">${recs.length}</span>` : ''}</button>`).join('')}</div>
        ${avisoFim}${conteudo}
      </div></div>`;
  }
  Acoes['ver-telas'] = () => UI.modal(`<div class="modal-head"><h2>Telas com propósito</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div><p>${esc(RF.telas.texto)}</p>${RF.Jogos.refsHtml(RF.telas.refs)}`);
  Acoes['area-tab'] = (b) => { A.tab = b.dataset.tab; App.render(); };
  Acoes['trocar-filho'] = (s) => { A.filho = s.value; App.render(); };
  Acoes['jogar'] = (b) => { const x = Dados.get('recursos', b.dataset.id); if (!x) return; const pp = Dados.get('pacientes', b.dataset.pid); const ina = !!(pp && pp.ativo === false); RF.Jogos.abrir(x.jogo, x.cfg || {}, x, { pacienteId: ina ? null : b.dataset.pid, semEstrelas: ina, aoConcluir: () => App.agendarRender() }); };
  Acoes['ver-rel'] = (b) => {
    const x = Dados.get('relatorios', b.dataset.id); if (!x) return; const p = Dados.get('pacientes', x.pacienteId);
    UI.modal(`<div class="modal-head"><h2>${esc(x.titulo)}</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="timbrado"><div class="th"><img src="img/logo-verde.png" alt="Rebeca Fonseca"><div class="crfa">${esc(RF.marca.crfa.toUpperCase())}</div></div><div class="tb" style="font-size:14px"><p style="text-align:center;color:#6d675f">${p ? esc(p.nome) + ' · ' : ''}${fmt.dataLonga(x.data)}</p>${Rel.secoes(x).map((s) => `${s.titulo !== 'Declaração' ? `<h4>${esc(s.titulo.toUpperCase())}</h4>` : ''}<p>${esc(s.texto)}</p>`).join('')}<div class="sign"><div class="ln"></div>${esc(RF.marca.nome)} — ${esc(RF.marca.profissao)}<br><span style="color:#6d675f">${esc(RF.marca.crfa)}</span></div></div><div class="tf"><span>WhatsApp ${esc(RF.marca.whatsappTexto)}</span><span>${esc(RF.marca.email)}</span></div></div>
      <div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn btn-ghost" data-act="pdf-rel" data-modo="imprimir" data-id="${x.id}">${ic('print')} Imprimir</button><button class="btn btn-primary" data-act="pdf-rel" data-id="${x.id}">${ic('download')} Baixar PDF</button></div>`, { wide: true });
  };
  Acoes['pdf-rel'] = async (b) => { const x = Dados.get('relatorios', b.dataset.id); if (!x) return; b.disabled = true; await PDF.salvar(x, Dados.get('pacientes', x.pacienteId), b.dataset.modo); b.disabled = false; };

  App.views.area = function () {
    if (!sess()) return login();
    const r = eu();
    if (!r) { if (!Dados.pronto('responsaveis')) return telaAuth('Área do Usuário', '<p class="muted">Carregando…</p>'); App.sessao.area = null; ss.del('sessao:area'); return login(); }
    if (r.primeiroAcesso) return etapaSenha(r);
    if (!r.perfilCompleto) return etapaPerfil(r);
    if (!T().lgpdOk(r)) { App.apos(() => liberarSeCurto('termo-lgpd', 'lgpd-ok')); return etapaLGPD(r); }
    const pend = T().tclePendentes(r);
    if (pend.length) { if (A.tcleSim) App.apos(() => { T().iniciarPad('tc-pad'); liberarSeCurto('termo-tcle', 'tcle-li'); }); return etapaTCLE(r, A.tcleSim && pend.includes(A.tcleSim) ? A.tcleSim : pend[0]); }
    return portal(r);
  };
})();
