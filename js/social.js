/* Gestão de redes sociais: conteúdos, análises, roteiros e vídeos, ADS e integrações */
(function () {
  const S = RF.Social = { tab: 'conteudos', filtro: 'proposto', vista: 'cards', rede: 'ambas', chat: [], ideias: [], sos: false };
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const FORMATO = { carrossel: 'Carrossel', card: 'Card', reels: 'Reels', video: 'Vídeo' };
  const REDE = { instagram: 'Instagram', tiktok: 'TikTok' };
  const FOTOS = { amamentacao: 'img/amamentacao.jpg', rotina: 'img/hero.jpg', looks: 'img/hero.jpg', atipicos: 'img/criancas.jpg', dicas: 'img/criancas.jpg', desenvolvimento: '' };
  const conteudos = () => Dados.lista('conteudos');
  const pad = (n) => String(n).padStart(2, '0');
  const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  const quando = (iso) => { const d = new Date(iso); return `${RF.diasSemana[d.getDay()].slice(0, 3)}, ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  function proximoHorario(rede) {
    const slots = RF.melhoresHorarios[rede] || RF.melhoresHorarios.instagram;
    const ocupados = conteudos().filter((c) => c.status === 'agendado' && c.rede === rede).map((c) => c.agendadoPara);
    const agora = new Date();
    for (let add = 1; add <= 42; add++) {
      const d = new Date(agora); d.setDate(d.getDate() + add);
      for (const s of slots.filter((x) => x.d === d.getDay())) { const [h, m] = s.h.split(':'); d.setHours(+h, +m, 0, 0); const iso = isoLocal(d); if (!ocupados.includes(iso)) return iso; }
    }
    return isoLocal(new Date(Date.now() + 864e5));
  }

  /* ---------------- Prévia do post na identidade ---------------- */
  function mock(c, extra = '') {
    const foto = c.foto || FOTOS[c.pilar];
    const cor = { desenvolvimento: 'sage', amamentacao: 'rose', atipicos: 'sage', dicas: '', rotina: '', looks: 'rose' }[c.pilar] || '';
    const video = c.formato === 'reels' || c.formato === 'video';
    return `<div class="mock ${cor} ${extra}">${foto ? `<div class="bg" style="background-image:url('${foto}')"></div><div class="shade"></div>` : ''}
      <span class="hand">@${esc(c.rede === 'tiktok' ? RF.marca.tiktok : RF.marca.instagram)}</span>
      ${video ? `<span class="play">${ic('play')}</span>` : ''}
      <div class="lbl">${esc(FORMATO[c.formato] || '')} · ${esc((RF.pilares[c.pilar] || {}).nome || '')}</div>
      <div class="ttl">${esc(c.gancho && video ? c.gancho : c.titulo)}</div>
      ${c.formato === 'carrossel' ? `<div class="dots">${(c.slides || [1, 2, 3]).map(() => '<i></i>').join('')}</div>` : ''}</div>`;
  }
  function statusPill(c) {
    if (c.status === 'proposto') return '<span class="pill warn">Aguardando aprovação</span>';
    if (c.status === 'agendado') return c.agendadoPara ? `<span class="pill ok">${ic('clock').replace('<svg', '<svg style="width:13px;height:13px"')} ${quando(c.agendadoPara)}</span>` : '<span class="pill ok">Aprovado</span>';
    if (c.status === 'publicado') return '<span class="pill sage">Publicado</span>';
    if (c.status === 'reprovado') return '<span class="pill bad">Reprovado</span>';
    return '';
  }
  function cardPost(c) {
    return `<article class="post">${mock(c)}
      <div class="meta"><span class="pill ${c.rede === 'tiktok' ? 'rose' : 'sage'}">${REDE[c.rede]}</span>${statusPill(c)}${c.iaFontes ? '<span class="pill warn">fontes a conferir</span>' : ''}</div>
      <div class="body"><h4>${esc(c.titulo)}</h4><p class="cap">${esc(c.legenda)}</p><span class="src">${(c.fontes || []).length ? `${ic('book').replace('<svg', '<svg style="width:13px;height:13px;vertical-align:-2px"')} ${(c.fontes || []).length} fonte${c.fontes.length > 1 ? 's' : ''} citada${c.fontes.length > 1 ? 's' : ''}` : 'Conteúdo pessoal: sem fonte necessária'}</span></div>
      <div class="acts">
        <button class="act up" data-act="ct-aprovar" data-id="${c.id}" aria-label="Aprovar" title="Aprovar" aria-pressed="${c.status === 'agendado' || c.status === 'publicado'}">${ic('up')}</button>
        <button class="act down" data-act="ct-reprovar" data-id="${c.id}" aria-label="Reprovar" title="Reprovar" aria-pressed="${c.status === 'reprovado'}">${ic('down')}</button>
        <button class="act edit" data-act="ct-editar" data-id="${c.id}" aria-label="Editar com comando" title="Editar com comando">${ic('wand')}</button>
        <button class="act canva" data-act="ct-canva" data-id="${c.id}" aria-label="Editar no Canva" title="Editar no Canva">${ic('canva')}</button>
        <button class="btn btn-ghost btn-xs" style="margin-left:auto" data-act="ct-ver" data-id="${c.id}">Ver tudo</button>
      </div></article>`;
  }

  /* ---------------- Gestão de conteúdos ---------------- */
  function abaConteudos() {
    const todos = conteudos();
    const cont = { proposto: 0, agendado: 0, publicado: 0, reprovado: 0 }; todos.forEach((c) => { cont[c.status] = (cont[c.status] || 0) + 1; });
    const lista = todos.filter((c) => c.status === S.filtro).sort((a, b) => S.filtro === 'agendado' ? (a.agendadoPara || '').localeCompare(b.agendadoPara || '') : (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    const FIL = [['proposto', 'Para aprovar'], ['agendado', 'Aprovados e agendados'], ['publicado', 'Publicados'], ['reprovado', 'Reprovados']];
    return `<div class="row between"><div class="row">${FIL.map(([k, n]) => `<button class="chip" aria-pressed="${S.filtro === k}" data-act="ct-filtro" data-f="${k}">${n} · ${cont[k] || 0}</button>`).join('')}</div>
      <div class="row"><button class="btn btn-ghost btn-sm" data-act="ct-vista" data-v="${S.vista === 'cards' ? 'cal' : 'cards'}">${ic(S.vista === 'cards' ? 'cal' : 'board')} ${S.vista === 'cards' ? 'Calendário' : 'Cards'}</button><button class="btn btn-primary btn-sm" data-act="ct-gerar">${ic('spark')} Gerar novas propostas</button></div></div>
      <div class="note">${ic('clock')}<div><strong>Agendamento inteligente:</strong> ao aprovar, o sistema escolhe o próximo melhor horário de cada rede para o público de mães (Instagram: dias úteis no fim da manhã e começo da tarde, com teste às 20h30; TikTok: noites e domingo de manhã). A publicação automática liga quando a integração com Instagram e TikTok for conectada. <button class="linkbtn" data-act="soc-tab" data-tab="integracoes">Ver integrações</button></div></div>
      ${S.vista === 'cal' ? calendario() : lista.length ? `<div class="posts">${lista.map(cardPost).join('')}</div>` : `<div class="empty">${ic('insta')}<div>Nada aqui por enquanto.</div>${S.filtro === 'proposto' ? `<button class="btn btn-primary" data-act="ct-gerar">${ic('spark')} Gerar propostas</button>` : ''}</div>`}
      <details class="panel"><summary style="cursor:pointer;font-weight:500">De onde vêm os melhores horários</summary><ul class="small" style="margin:10px 0 0;padding-left:18px;display:grid;gap:6px">${RF.melhoresHorarios.fontes.map((f) => `<li><a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.t)}</a></li>`).join('')}</ul><p class="small muted" style="margin-top:8px">Quando a integração de métricas estiver ativa, os horários passam a ser os do próprio público da Rebeca.</p></details>`;
  }
  function calendario() {
    const ini = new Date(); ini.setHours(0, 0, 0, 0); ini.setDate(ini.getDate() - ini.getDay());
    const dias = Array.from({ length: 21 }, (_, i) => { const d = new Date(ini); d.setDate(d.getDate() + i); return d; });
    const ag = conteudos().filter((c) => c.agendadoPara && (c.status === 'agendado' || c.status === 'publicado'));
    const hoje = new Date().toDateString();
    return `<div class="cal">${RF.diasSemana.map((d) => `<div class="small muted" style="text-align:center;font-weight:600">${d.slice(0, 3)}</div>`).join('')}${dias.map((d) => {
      const evs = ag.filter((c) => new Date(c.agendadoPara).toDateString() === d.toDateString());
      return `<div class="c ${d.toDateString() === hoje ? 'today' : ''}"><span class="d">${d.getDate()}/${d.getMonth() + 1}</span>${evs.map((c) => `<button class="ev ${c.rede}" data-act="ct-ver" data-id="${c.id}" title="${esc(c.titulo)}" style="border:0;text-align:left;cursor:pointer">${pad(new Date(c.agendadoPara).getHours())}:${pad(new Date(c.agendadoPara).getMinutes())} ${esc(c.titulo)}</button>`).join('')}</div>`;
    }).join('')}</div>`;
  }
  Acoes['ct-filtro'] = (b) => { S.filtro = b.dataset.f; S.vista = 'cards'; App.render(); };
  Acoes['ct-vista'] = (b) => { S.vista = b.dataset.v; App.render(); };
  Acoes['soc-tab'] = (b) => { S.tab = b.dataset.tab; App.render(); window.scrollTo(0, 0); };
  Acoes['ct-aprovar'] = async (b) => {
    const c = Dados.get('conteudos', b.dataset.id); if (!c) return;
    const data = proximoHorario(c.rede);
    await Dados.atualizar('conteudos', c.id, { status: 'agendado', agendadoPara: data, aprovadoEm: new Date().toISOString() });
    UI.toast(`Aprovado e agendado para ${quando(data)} no ${REDE[c.rede]}.`); UI.fechar();
  };
  Acoes['ct-reprovar'] = (b) => {
    const c = Dados.get('conteudos', b.dataset.id); if (!c) return;
    UI.modal(`<div class="modal-head"><h2>Reprovar proposta</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <p class="muted">O motivo ajuda a próxima leva de propostas a acertar mais (opcional).</p>
      <div class="row" style="margin:12px 0">${['Tema não combina comigo', 'Muito técnico', 'Já falei disso', 'Tom não é o meu', 'Formato não funciona'].map((m) => `<button class="chip" data-act="motivo" data-m="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <textarea class="input" id="rp-motivo" rows="2" placeholder="Outro motivo"></textarea>
      <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn btn-ghost" data-act="fechar">Cancelar</button><button class="btn btn-danger" data-act="ct-reprovar-ok" data-id="${c.id}">${ic('down')} Reprovar</button></div>`);
  };
  Acoes['motivo'] = (b) => { $('#rp-motivo').value = b.dataset.m; };
  Acoes['ct-reprovar-ok'] = async (b) => { await Dados.atualizar('conteudos', b.dataset.id, { status: 'reprovado', motivo: val('rp-motivo').trim(), agendadoPara: '' }); UI.fechar(); UI.toast('Proposta reprovada.'); };
  Acoes['ct-ver'] = (b) => {
    const c = Dados.get('conteudos', b.dataset.id); if (!c) return;
    const corpoCriativo = c.slides && c.slides.length ? `<div class="slides">${c.slides.map((s, i) => `<div class="slide"><span class="n">${i + 1}/${c.slides.length}</span>${esc(s)}<span class="h">@${esc(RF.marca.instagram)}</span></div>`).join('')}</div>` : c.roteiro && c.roteiro.length ? `<div class="cuts">${c.roteiro.map((r) => `<div class="cut"><span class="tc">Cena</span><span>${esc(r)}</span></div>`).join('')}</div>` : '';
    UI.modal(`<div class="modal-head"><div><div class="row">${statusPill(c)}<span class="pill">${REDE[c.rede]} · ${FORMATO[c.formato]}</span></div><h2 style="margin-top:8px">${esc(c.titulo)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      ${c.gancho ? `<p><span class="label">Gancho (primeiros 3 segundos)</span><br><b>${esc(c.gancho)}</b></p>` : ''}
      <div style="margin-top:14px">${corpoCriativo}</div>
      <div class="field" style="margin-top:14px"><span class="label">Legenda</span><div class="bubble soft" data-copia style="white-space:pre-wrap">${esc(c.legenda)}\n\n${esc(c.hashtags || '')}</div><div class="row"><button class="btn btn-ghost btn-xs" data-act="copiar" data-texto="${esc(c.legenda + '\n\n' + (c.hashtags || ''))}">${ic('copy')} Copiar legenda</button></div></div>
      ${(c.fontes || []).length ? `<div class="field" style="margin-top:14px"><span class="label">Fontes ${c.iaFontes ? '(sugeridas pela IA: abra e confira antes de aprovar)' : ''}</span><ul style="margin:0;padding-left:18px;display:grid;gap:4px" class="small">${c.fontes.map((f) => `<li>${f.u ? `<a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.t)}</a>` : esc(f.t)}</li>`).join('')}</ul></div>` : ''}
      ${c.video ? `<div class="video-stage" style="margin-top:14px"><video src="${esc(Arquivos.src(c.video))}" controls playsinline></video></div>` : ''}
      <div class="row" style="justify-content:flex-end;margin-top:20px">${c.status === 'agendado' ? `<button class="btn btn-ghost" data-act="ct-publicado" data-id="${c.id}">Marcar como publicado</button>` : ''}<button class="btn btn-ghost" data-act="ct-reprovar" data-id="${c.id}">${ic('down')} Reprovar</button><button class="btn btn-ghost" data-act="ct-editar" data-id="${c.id}">${ic('wand')} Editar com comando</button><button class="btn btn-primary" data-act="ct-aprovar" data-id="${c.id}">${ic('up')} ${c.status === 'agendado' ? 'Reagendar' : 'Aprovar'}</button></div>`, { wide: true });
  };
  Acoes['ct-publicado'] = async (b) => { await Dados.atualizar('conteudos', b.dataset.id, { status: 'publicado', publicadoEm: new Date().toISOString() }); UI.fechar(); UI.toast('Marcado como publicado.'); };

  Acoes['ct-editar'] = (b) => {
    const c = Dados.get('conteudos', b.dataset.id); if (!c) return;
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Editar com comando</div><h2>${esc(c.titulo)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="row" style="margin-bottom:10px">${['Deixe mais curto e direto', 'Tom mais acolhedor, para mãe aflita', 'Fale com mães de crianças atípicas', 'Transforme em Reels de 30 segundos', 'Mais números e dados'].map((m) => `<button class="chip" data-act="cmd-sug" data-m="${esc(m)}">${esc(m)}</button>`).join('')}</div>
      <div class="ask"><textarea id="cmd-txt" rows="2" placeholder="Diga o que quer mudar. Ex.: troque o gancho por uma pergunta e termine convidando para comentar"></textarea><button class="btn btn-primary btn-icon" data-act="cmd-ir" data-id="${c.id}" aria-label="Aplicar comando">${ic('send')}</button></div>
      <div id="cmd-out" style="margin-top:16px"></div>`, { wide: true });
  };
  Acoes['cmd-sug'] = (b) => { $('#cmd-txt').value = b.dataset.m; $('#cmd-txt').focus(); };
  Acoes['cmd-ir'] = async (b) => {
    const c = Dados.get('conteudos', b.dataset.id); const cmd = val('cmd-txt').trim(); if (!cmd) return;
    const out = $('#cmd-out'); out.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>'; b.disabled = true;
    try {
      const novo = await IA.json(`Reescreva este conteúdo de rede social seguindo o comando da Rebeca. Mantenha os fatos e as fontes; não acrescente dados que não estejam nas fontes.
Comando: "${cmd}"
Conteúdo atual (JSON): ${JSON.stringify({ formato: c.formato, rede: c.rede, titulo: c.titulo, gancho: c.gancho, slides: c.slides, roteiro: c.roteiro, legenda: c.legenda, hashtags: c.hashtags, fontes: c.fontes })}
Responda somente com JSON com as chaves: formato ("carrossel","card","reels" ou "video"), titulo, gancho, slides (lista de textos curtos, só para carrossel/card), roteiro (lista de cenas, só para reels/vídeo), legenda, hashtags.`);
      S.edicao = { id: c.id, novo };
      out.innerHTML = `<div class="cols-2"><div>${mock({ ...c, ...novo })}</div><div class="stack"><b>${esc(novo.titulo || '')}</b>${novo.gancho ? `<p><span class="label">Gancho</span><br>${esc(novo.gancho)}</p>` : ''}${(novo.slides || []).length ? `<ol class="small" style="margin:0;padding-left:18px">${novo.slides.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}${(novo.roteiro || []).length ? `<ol class="small" style="margin:0;padding-left:18px">${novo.roteiro.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}<p class="small">${esc(novo.legenda || '')}</p><div class="row"><button class="btn btn-primary" data-act="cmd-aplicar">${ic('check')} Aplicar</button><button class="btn btn-ghost" data-act="cmd-ir" data-id="${c.id}">Gerar outra versão</button></div></div></div>`;
    } catch (e) { out.innerHTML = `<div class="note warn">${ic('info')}<div>${esc(IA.erro(e))}</div></div>`; }
    b.disabled = false;
  };
  Acoes['cmd-aplicar'] = async () => {
    const { id, novo } = S.edicao || {}; if (!id) return; const permitidos = ['formato', 'titulo', 'gancho', 'slides', 'roteiro', 'legenda', 'hashtags'];
    const upd = {}; permitidos.forEach((k) => { if (novo[k] !== undefined) upd[k] = novo[k]; }); if (!FORMATO[upd.formato]) delete upd.formato;
    await Dados.atualizar('conteudos', id, upd); UI.fechar(); UI.toast('Alterações aplicadas.');
  };

  Acoes['ct-canva'] = (b) => {
    const c = Dados.get('conteudos', b.dataset.id); if (!c) return;
    const textos = [c.titulo, ...(c.slides || []), ...(c.roteiro || []), '', 'Legenda:', c.legenda, c.hashtags || ''].join('\n');
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Canva</div><h2>Editar no Canva</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="note">${ic('plug')}<div>Com o <b>Canva conectado ao Claude</b>, esta proposta vira um design editável na conta da Rebeca, já com a paleta e as fontes da marca. Enquanto a conexão não é feita, copie os textos e abra um modelo do tamanho certo.</div></div>
      <div class="bubble soft small" data-copia style="white-space:pre-wrap;margin-top:14px;max-height:240px;overflow:auto">${esc(textos)}</div>
      <div class="row" style="margin-top:14px"><button class="btn btn-ghost" data-act="copiar" data-texto="${esc(textos)}">${ic('copy')} Copiar textos</button><a class="btn btn-primary" href="${c.formato === 'reels' || c.formato === 'video' ? 'https://www.canva.com/create/instagram-reels/' : 'https://www.canva.com/create/instagram-posts/'}" target="_blank" rel="noopener">Abrir o Canva</a></div>
      <p class="small muted" style="margin-top:12px">Cores da marca: terracota #8F5C3D · oliva #788035 · sálvia #ADB778 · rosé #D4958F. Fontes: The Seasons (títulos) e Poppins (textos).</p>`);
  };

  Acoes['ct-gerar'] = () => {
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Novas propostas</div><h2>O que você quer receber?</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="field"><span class="label">Pilares</span><div class="row" id="gp-pilares">${Object.entries(RF.pilares).map(([k, p]) => `<button class="chip" data-act="toggle-chip" data-k="${k}" aria-pressed="${['desenvolvimento', 'atipicos', 'dicas'].includes(k)}">${esc(p.nome)}</button>`).join('')}</div></div>
      <div class="grid-form" style="margin-top:14px"><div class="field"><label for="gp-qtd">Quantidade</label><select class="input" id="gp-qtd"><option>3</option><option selected>6</option></select></div><div class="field"><label for="gp-rede">Rede</label><select class="input" id="gp-rede"><option value="misto">Instagram e TikTok</option><option value="instagram">Só Instagram</option><option value="tiktok">Só TikTok</option></select></div></div>
      <div class="field" style="margin-top:14px"><label for="gp-tema">Tema ou contexto (opcional)</label><input class="input" id="gp-tema" placeholder="Ex.: Abril Azul, volta às aulas, mês do aleitamento materno"></div>
      <div class="row" style="justify-content:flex-end;margin-top:18px"><span class="small muted grow" id="gp-st"></span><button class="btn btn-primary" data-act="ct-gerar-ok">${ic('spark')} Gerar propostas</button></div>`);
  };
  Acoes['toggle-chip'] = (b) => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  Acoes['ct-gerar-ok'] = async (b) => {
    const pilares = $$('#gp-pilares [aria-pressed="true"]').map((x) => x.dataset.k); const qtd = +val('gp-qtd'); const rede = val('gp-rede'); const tema = val('gp-tema').trim();
    if (!pilares.length) { UI.toast('Escolha pelo menos um pilar.', 'bad'); return; }
    const st = $('#gp-st'); b.disabled = true; st.innerHTML = 'Criando propostas com base em diretrizes e estudos…';
    const recusados = conteudos().filter((c) => c.status === 'reprovado').slice(-6).map((c) => `${c.titulo} (${c.motivo || 'sem motivo'})`);
    const existentes = conteudos().map((c) => c.titulo);
    try {
      const arr = await IA.json(`Você também é uma publicitária especialista em marketing digital para profissionais de saúde. Crie ${qtd} propostas de conteúdo para o perfil da Rebeca (Instagram @${RF.marca.instagram} e TikTok @${RF.marca.tiktok}), que mistura vida pessoal e profissional.
Pilares escolhidos: ${pilares.map((p) => RF.pilares[p].nome).join(', ')}. Rede: ${rede === 'misto' ? 'misture Instagram e TikTok' : rede}. ${tema ? 'Contexto: ' + tema + '.' : ''}
Regras: cada conteúdo resolve uma dúvida real de mãe/pai ("como resolvo o problema do meu filho?") ou acolhe uma mãe aflita; gancho forte nos 3 primeiros segundos com texto na tela; termine com CTA para salvar, enviar a outra mãe ou chamar no WhatsApp (envios e salvamentos pesam no algoritmo). Pilares de rotina e looks são pessoais e não precisam de fonte. Para saúde, cite só instituições reconhecidas ou estudos amplamente conhecidos, com autor/instituição e ano; não invente links: use só o domínio oficial da instituição como link (ex.: https://www.sbp.com.br/) ou deixe o link vazio.
Evite repetir: ${JSON.stringify(existentes)}. Evite o que foi reprovado: ${JSON.stringify(recusados)}.
Responda somente com uma lista JSON de objetos: {"formato":"carrossel|card|reels|video","rede":"instagram|tiktok","pilar":"${Object.keys(RF.pilares).join('|')}","titulo":"","gancho":"","slides":["…"] (carrossel/card, 4 a 7 telas curtas),"roteiro":["…"] (reels/vídeo, cenas com tempo e texto na tela),"legenda":"","hashtags":"","fontes":[{"t":"","u":""}]}`, { modelTier: 'default' });
      const lista = Array.isArray(arr) ? arr : (arr && arr.propostas) || [];
      let n = 0;
      for (const p of lista.slice(0, qtd)) {
        if (!p || !p.titulo) continue;
        await Dados.salvar('conteudos', null, { formato: FORMATO[p.formato] ? p.formato : 'carrossel', rede: REDE[p.rede] ? p.rede : 'instagram', pilar: RF.pilares[p.pilar] ? p.pilar : pilares[0], titulo: String(p.titulo), gancho: String(p.gancho || ''), slides: Array.isArray(p.slides) ? p.slides.map(String) : [], roteiro: Array.isArray(p.roteiro) ? p.roteiro.map(String) : [], legenda: String(p.legenda || ''), hashtags: String(p.hashtags || ''), fontes: Array.isArray(p.fontes) ? p.fontes.filter((f) => f && f.t).map((f) => ({ t: String(f.t), u: /^https:\/\//.test(f.u || '') ? f.u : '' })) : [], iaFontes: Array.isArray(p.fontes) && p.fontes.length > 0, status: 'proposto', criadoEm: new Date().toISOString(), geradoPorIA: true });
        n++;
      }
      UI.fechar(); S.filtro = 'proposto'; App.render(); UI.toast(`${n} nova${n > 1 ? 's' : ''} proposta${n > 1 ? 's' : ''} para aprovar.`);
    } catch (e) { st.textContent = IA.erro(e); b.disabled = false; }
  };

  /* ---------------- Análises ---------------- */
  function series(rede) {
    const m = Dados.lista('metricas').filter((x) => rede === 'ambas' || x.rede === rede);
    const sem = [...new Set(m.map((x) => x.semana))].sort();
    return sem.map((s) => { const xs = m.filter((x) => x.semana === s); const soma = (k) => xs.reduce((t, x) => t + (+x[k] || 0), 0); return { semana: s, seguidores: soma('seguidores'), alcance: soma('alcance'), interacoes: soma('interacoes'), salvamentos: soma('salvamentos'), compartilhamentos: soma('compartilhamentos'), visitasPerfil: soma('visitasPerfil'), cliquesWhats: soma('cliquesWhats'), exemplo: xs.some((x) => x.exemplo) }; });
  }
  function linha(dados, chave, cor = 'var(--terra)') {
    if (dados.length < 2) return '<p class="muted small">Lance pelo menos duas semanas para ver a curva.</p>';
    const W = 560, H = 190, P = { l: 46, r: 14, t: 14, b: 26 }; const vs = dados.map((d) => d[chave]);
    let min = Math.min(...vs), max = Math.max(...vs); const folga = (max - min) * .15 || 10; min = Math.max(0, min - folga); max += folga;
    const x = (i) => P.l + (i * (W - P.l - P.r)) / (dados.length - 1), y = (v) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
    const ticks = [0, .5, 1].map((f) => min + f * (max - min));
    const path = dados.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d[chave]).toFixed(1)}`).join(' ');
    const area = `${path} L${x(dados.length - 1)} ${H - P.b} L${x(0)} ${H - P.b} Z`;
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução de ${chave}">
      ${ticks.map((t) => `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l - 8}" y="${y(t) + 4}" text-anchor="end">${fmt.num(Math.round(t))}</text>`).join('')}
      <path d="${area}" fill="${cor}" fill-opacity=".1"/><path d="${path}" fill="none" stroke="${cor}" stroke-width="2.5" stroke-linejoin="round"/>
      ${dados.map((d, i) => `<circle cx="${x(i)}" cy="${y(d[chave])}" r="${i === dados.length - 1 ? 5 : 3}" fill="${cor}"/>`).join('')}
      ${dados.map((d, i) => (i % 2 === dados.length % 2 || i === dados.length - 1) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${d.semana.slice(8, 10)}/${d.semana.slice(5, 7)}</text>` : '').join('')}
    </svg></div>`;
  }
  function abaAnalises() {
    const dados = series(S.rede); const u = dados[dados.length - 1], a = dados[dados.length - 2];
    const temExemplo = dados.some((d) => d.exemplo);
    const delta = (k) => { if (!u || !a || !a[k]) return ''; const d = ((u[k] - a[k]) / a[k]) * 100; return `<div class="d ${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}% na semana</div>`; };
    const eng = (d) => d && d.alcance ? (d.interacoes / d.alcance) * 100 : 0;
    const media = dados.length ? dados.reduce((t, d) => t + d.alcance, 0) / dados.length : 0;
    const pico = dados.reduce((m, d) => (!m || d.alcance > m.alcance ? d : m), null);
    const refs = Dados.config().referencias || [];
    const engRefs = refs.filter((r) => r.seguidores && r.mediaInteracoes).map((r) => (r.mediaInteracoes / r.seguidores) * 100);
    const minhaTaxaSeg = u && u.seguidores ? ((u.interacoes / Math.max(1, (Dados.lista('metricas').filter((x) => x.semana === u.semana).reduce((t, x) => t + (+x.posts || 0), 0)))) / u.seguidores) * 100 : 0;
    return `<div class="row between"><div class="row">${[['ambas', 'Instagram + TikTok'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']].map(([k, n]) => `<button class="chip" aria-pressed="${S.rede === k}" data-act="an-rede" data-r="${k}">${n}</button>`).join('')}</div><div class="row"><button class="btn btn-ghost btn-sm" data-act="an-lancar">${ic('plus')} Lançar métricas da semana</button><button class="btn btn-olive btn-sm" data-act="an-ia">${ic('spark')} Analisar com IA</button></div></div>
      ${temExemplo ? `<div class="note warn">${ic('info')}<div><strong>Dados de exemplo.</strong> Os gráficos mostram números fictícios até a integração com Instagram e TikTok ser conectada (ou até você lançar as métricas reais da semana a partir do Instagram Insights e do TikTok Studio).</div></div>` : ''}
      ${u ? `<div class="kpis six">
        <div class="kpi"><div class="eyebrow">Seguidores</div><div class="v">${fmt.num(u.seguidores)}</div>${delta('seguidores')}</div>
        <div class="kpi"><div class="eyebrow">Alcance na semana</div><div class="v">${fmt.num(u.alcance)}</div>${delta('alcance')}</div>
        <div class="kpi"><div class="eyebrow">Engajamento</div><div class="v">${eng(u).toFixed(1).replace('.', ',')}%</div><div class="d muted">interações ÷ alcance</div></div>
        <div class="kpi"><div class="eyebrow">Envios</div><div class="v">${fmt.num(u.compartilhamentos)}</div>${delta('compartilhamentos')}</div>
        <div class="kpi"><div class="eyebrow">Salvamentos</div><div class="v">${fmt.num(u.salvamentos)}</div>${delta('salvamentos')}</div>
        <div class="kpi"><div class="eyebrow">Cliques no WhatsApp</div><div class="v">${fmt.num(u.cliquesWhats)}</div>${delta('cliquesWhats')}</div>
      </div>
      <div class="cols-2"><div class="panel"><div class="panel-head"><h3>Alcance por semana</h3></div>${linha(dados, 'alcance', 'var(--terra)')}</div><div class="panel"><div class="panel-head"><h3>Seguidores</h3></div>${linha(dados, 'seguidores', 'var(--olive)')}</div></div>
      <div class="cols-2">
        <div class="panel"><div class="panel-head"><h3>Destaque para impulsionar</h3></div>${pico ? `<p>A semana de <b>${fmt.data(pico.semana)}</b> teve alcance de <b>${fmt.num(pico.alcance)}</b>, ${media ? Math.round((pico.alcance / media - 1) * 100) : 0}% acima da média do período. Conteúdo que já performa no orgânico costuma render mais com tráfego pago.</p><div class="row" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-act="soc-ads" >${ic('megaphone')} Impulsionar com tráfego pago</button></div>` : ''}</div>
        <div class="panel"><div class="panel-head"><h3>Perfis semelhantes</h3><button class="btn btn-ghost btn-xs" data-act="an-ref">${ic('plus')} Adicionar referência</button></div>
          ${refs.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Perfil</th><th>Seguidores</th><th>Interações/post</th><th>Taxa</th></tr></thead><tbody>${refs.map((r, i) => `<tr><td>@${esc(r.perfil)} <span class="muted small">${esc(r.rede || '')}</span></td><td class="tnum">${fmt.num(r.seguidores)}</td><td class="tnum">${fmt.num(r.mediaInteracoes)}</td><td class="tnum">${r.seguidores ? ((r.mediaInteracoes / r.seguidores) * 100).toFixed(1).replace('.', ',') + '%' : '—'} <button class="linkbtn small" data-act="an-ref-del" data-i="${i}">remover</button></td></tr>`).join('')}<tr><td><b>Rebeca (média por post)</b></td><td class="tnum">${fmt.num(u.seguidores)}</td><td class="tnum">—</td><td class="tnum"><b>${minhaTaxaSeg.toFixed(1).replace('.', ',')}%</b></td></tr></tbody></table></div>${engRefs.length ? `<p class="small muted" style="margin-top:10px">Média das referências: ${(engRefs.reduce((a, b) => a + b, 0) / engRefs.length).toFixed(1).replace('.', ',')}% de interações por seguidor em cada post.</p>` : ''}` : `<p class="muted small">Adicione 3 a 5 perfis de fonoaudiologia infantil que você admira, com seguidores e média de curtidas + comentários dos últimos posts. O sistema compara a sua taxa com a deles.</p>`}
        </div>
      </div>
      <div class="panel" id="an-ia-out" ${S.analise ? '' : 'hidden'}>${S.analise || ''}</div>` : `<div class="empty">${ic('chart')}<div>Nenhuma métrica lançada.</div></div>`}`;
  }
  Acoes['an-rede'] = (b) => { S.rede = b.dataset.r; App.render(); };
  Acoes['soc-ads'] = () => { S.tab = 'ads'; App.render(); window.scrollTo(0, 0); };
  Acoes['an-lancar'] = () => {
    const campos = [['seguidores', 'Seguidores (total)'], ['alcance', 'Contas alcançadas'], ['interacoes', 'Interações'], ['salvamentos', 'Salvamentos'], ['compartilhamentos', 'Compartilhamentos / envios'], ['visitasPerfil', 'Visitas ao perfil'], ['cliquesWhats', 'Cliques no WhatsApp / link'], ['posts', 'Posts na semana']];
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Métricas reais</div><h2>Lançar a semana</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <p class="small muted">Copie os números do Instagram (Painel profissional › Insights, últimos 7 dias) ou do TikTok Studio. Ao lançar a primeira semana real, os dados de exemplo saem dos gráficos.</p>
      <form data-submit="an-salvar" class="stack" style="margin-top:12px"><div class="grid-form"><div class="field"><label for="m-rede">Rede</label><select class="input" id="m-rede"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option></select></div><div class="field"><label for="m-sem">Semana que termina em</label><input class="input" type="date" id="m-sem" value="${new Date().toISOString().slice(0, 10)}"></div>
      ${campos.map(([k, n]) => `<div class="field"><label for="m-${k}">${n}</label><input class="input tnum" id="m-${k}" inputmode="numeric" data-k="${k}"></div>`).join('')}</div><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Salvar</button></div></form>`);
  };
  Acoes['an-salvar'] = async () => {
    const d = { rede: val('m-rede'), semana: val('m-sem') }; $$('[data-k]', $('#modal')).forEach((i) => { d[i.dataset.k] = +so(i.value) || 0; });
    if (!d.seguidores || !d.alcance) { UI.toast('Informe pelo menos seguidores e alcance.', 'bad'); return; }
    for (const m of Dados.lista('metricas').filter((x) => x.exemplo)) await Dados.remover('metricas', m.id);
    await Dados.salvar('metricas', `m-${d.rede}-${d.semana}`, d); UI.fechar(); UI.toast('Métricas salvas.');
  };
  Acoes['an-ref'] = () => {
    UI.modal(`<div class="modal-head"><h2>Perfil de referência</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div><form class="stack" data-submit="an-ref-ok"><div class="grid-form"><div class="field"><label for="rf-p">Perfil (sem @)</label><input class="input" id="rf-p" required></div><div class="field"><label for="rf-r">Rede</label><select class="input" id="rf-r"><option>Instagram</option><option>TikTok</option></select></div><div class="field"><label for="rf-s">Seguidores</label><input class="input" id="rf-s" inputmode="numeric" required></div><div class="field"><label for="rf-m">Média de curtidas + comentários por post</label><input class="input" id="rf-m" inputmode="numeric" required></div></div><div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Adicionar</button></div></form>`);
  };
  Acoes['an-ref-ok'] = async () => { const c = Dados.config(); const refs = [...(c.referencias || []), { perfil: val('rf-p').replace('@', '').trim(), rede: val('rf-r'), seguidores: +so(val('rf-s')), mediaInteracoes: +so(val('rf-m')) }]; await Dados.salvar('config', 'site', { ...c, referencias: refs }); UI.fechar(); };
  Acoes['an-ref-del'] = async (b) => { const c = Dados.config(); const refs = (c.referencias || []).filter((_, i) => i !== +b.dataset.i); await Dados.salvar('config', 'site', { ...c, referencias: refs }); };
  Acoes['an-ia'] = async (b) => {
    const dados = series(S.rede); const cont = conteudos().filter((c) => c.status === 'publicado' || c.status === 'agendado').map((c) => ({ titulo: c.titulo, formato: c.formato, pilar: c.pilar, rede: c.rede }));
    b.disabled = true; S.analise = '<div class="typing"><i></i><i></i><i></i></div>'; App.render();
    try {
      const o = await IA.json(`Aja como gestora de marketing digital e tráfego. Analise as métricas semanais (${S.rede}) da fonoaudióloga e diga o que fazer. ${dados.some((d) => d.exemplo) ? 'Atenção: os dados são de exemplo; deixe isso claro no resumo.' : ''}
Métricas: ${JSON.stringify(dados)}
Conteúdos recentes: ${JSON.stringify(cont)}
Perfis de referência: ${JSON.stringify(Dados.config().referencias || [])}
Sinais de algoritmo a considerar: tempo de exibição, curtidas por alcance e envios por alcance (envios pesam mais para alcançar não seguidores).
Responda somente JSON: {"resumo":"2 frases","pontos_fortes":["…"],"atencao":["…"],"acoes":[{"acao":"…","por_que":"…"}],"impulsionar":"qual tipo de conteúdo vale impulsionar e com qual objetivo"}`);
      S.analise = `<div class="panel-head"><h3>Análise da IA</h3><span class="small muted">${new Date().toLocaleString('pt-BR')}</span></div><p>${esc(o.resumo || '')}</p><div class="cols-3" style="margin-top:14px"><div><span class="label">O que está funcionando</span><ul class="small" style="padding-left:18px">${(o.pontos_fortes || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><span class="label">Pontos de atenção</span><ul class="small" style="padding-left:18px">${(o.atencao || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div><span class="label">Próximas ações</span><ul class="small" style="padding-left:18px">${(o.acoes || []).map((x) => `<li><b>${esc(x.acao)}</b> — ${esc(x.por_que)}</li>`).join('')}</ul></div></div>${o.impulsionar ? `<div class="note" style="margin-top:14px">${ic('megaphone')}<div><b>Tráfego pago:</b> ${esc(o.impulsionar)} <button class="linkbtn" data-act="soc-ads">Planejar campanha</button></div></div>` : ''}`;
    } catch (e) { S.analise = `<div class="note warn">${ic('info')}<div>${esc(IA.erro(e))}</div></div>`; }
    App.render();
  };

  /* ---------------- Roteiros e vídeos ---------------- */
  function cartaoRoteiro(r) {
    const st = { roteiro: ['warn', 'Roteiro pronto'], gravado: ['sage', 'Vídeo enviado'], editado: ['rose', 'Edição pronta'], aprovado: ['ok', 'Aprovado'] }[r.status] || ['', ''];
    return `<div class="li"><span class="avatar" style="background:var(--rose-soft);color:var(--terra)">${ic('video')}</span><div class="grow"><div class="t">${esc(r.titulo)}</div><div class="s">${esc(r.categoria || '')} · ${REDE[r.rede] || 'Reels e TikTok'} · ${fmt.data(r.criadoEm)}</div></div><span class="pill ${st[0]}">${st[1]}</span><button class="btn btn-ghost btn-sm" data-act="rt-abrir" data-id="${r.id}">Abrir</button></div>`;
  }
  function abaRoteiros() {
    const salvos = Dados.lista('roteiros').sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    return `<div class="stack" style="gap:14px;max-width:880px;width:100%;margin:0 auto">
      <div style="text-align:center"><div class="eyebrow">Roteiros para Reels e TikTok</div><h2 style="font-size:clamp(26px,3.4vw,38px);margin-top:8px">Sobre o que você quer falar hoje?</h2></div>
      <form data-submit="chat-enviar" class="ask"><textarea id="chat-txt" rows="2" placeholder="Ex.: quero explicar para mães por que a criança troca o R pelo L, num vídeo de 30 segundos" aria-label="Escreva o tema"></textarea><button class="btn btn-primary btn-icon" type="submit" aria-label="Enviar">${ic('send')}</button></form>
      <div class="row" style="justify-content:center"><button class="btn btn-ghost btn-sm" data-act="sos" aria-expanded="${S.sos}">${ic('spark')} SOS Ideias</button>${S.chat.length ? '<button class="linkbtn small" data-act="chat-limpar">Nova conversa</button>' : ''}</div>
      ${S.sos ? `<div class="bubble soft" style="text-align:center"><p style="margin-bottom:12px">Sobre o que você quer gravar?</p><div class="sos" style="justify-content:center">${[['Looks', 'shirt'], ['Posicionamento profissional', 'star'], ['Linguagem infantil', 'chat'], ['Jogue-me à sorte', 'dice']].map(([t, i]) => `<button class="btn btn-ghost" data-act="sos-ir" data-t="${esc(t)}">${ic(i)} ${t}</button>`).join('')}</div></div>` : ''}
      ${S.ideias.length ? `<div class="cols-3">${S.ideias.map((x, i) => `<div class="panel stack"><span class="pill rose" style="justify-self:start">${esc(x.formato || 'Reels')} · ${esc(x.duracao || '')}</span><b>${esc(x.titulo)}</b><p class="small"><span class="label">Gancho</span><br>${esc(x.gancho)}</p><p class="small muted">${esc(x.por_que || '')}</p><button class="btn btn-primary btn-sm" data-act="ideia-roteiro" data-i="${i}">Criar roteiro completo</button></div>`).join('')}</div>` : ''}
      ${S.chat.length ? `<div class="chat panel" id="chat">${S.chat.map((m) => `<div class="msg ${m.role === 'user' ? 'me' : ''}">${m.role === 'user' ? esc(m.content) : formatarRoteiro(m.content)}</div>`).join('')}${S.pensando ? '<div class="msg"><span class="typing"><i></i><i></i><i></i></span></div>' : ''}${!S.pensando && S.chat[S.chat.length - 1].role === 'assistant' ? `<div class="row"><button class="btn btn-primary btn-sm" data-act="rt-salvar">${ic('check')} Salvar este roteiro</button><span class="small muted">ou continue a conversa para ajustar</span></div>` : ''}</div>` : ''}
      <div class="note">${ic('info')}<div>Para temas de fonoaudiologia, a IA usa diretrizes e estudos reconhecidos e lista as fontes no fim do roteiro. Confira as fontes antes de gravar: a IA não navega na internet e pode errar referência.</div></div>
      <div class="panel"><div class="panel-head"><h3>Roteiros salvos</h3><span class="small muted">Grave, envie o vídeo cru e a edição é montada aqui</span></div>${salvos.length ? `<div class="list">${salvos.map(cartaoRoteiro).join('')}</div>` : '<p class="muted small">Nenhum roteiro salvo ainda.</p>'}</div>
    </div>`;
  }
  function formatarRoteiro(t) { return esc(t).replace(/^#+\s*(.+)$/gm, '<h4>$1</h4>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  const promptRoteiro = `Você é roteirista de vídeos curtos (Reels e TikTok) para a Rebeca. Converse para entender o que ela quer; quando tiver o suficiente, entregue o roteiro neste formato, em texto simples com títulos:
# Título
# Gancho (0–3s) — fala e texto na tela
# Roteiro — cenas com tempo aproximado (ex.: 3–8s), o que ela fala e o lettering
# CTA final
# Legenda
# Hashtags
# Dicas de gravação (enquadramento, luz, figurino, duração ideal)
# Fontes (só para temas de saúde: instituições ou estudos reconhecidos com autor/ano; escreva "fonte a confirmar" quando não tiver certeza)
Tom: próximo, seguro e acolhedor; frases curtas para falar olhando para a câmera. O conteúdo resolve a dúvida da mãe ("como resolvo o problema do meu filho?") ou acolhe a mãe aflita. Para Looks e Posicionamento, fale de moda corporativa na rotina clínica infantil e de postura profissional, sem fontes.`;
  async function perguntar(texto) {
    S.chat.push({ role: 'user', content: texto }); S.pensando = true; App.render();
    try {
      const msgs = S.chat.map((m, i) => (i === 0 ? { role: 'user', content: IA.base + '\n\n' + promptRoteiro + '\n\nMensagem da Rebeca: ' + m.content } : { role: m.role, content: m.content }));
      const r = await IA.texto(msgs);
      S.chat.push({ role: 'assistant', content: r });
    } catch (e) { S.chat.push({ role: 'assistant', content: IA.erro(e) }); }
    S.pensando = false; App.render(); const c = $('#chat'); if (c) c.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }
  Acoes['chat-enviar'] = () => { const t = val('chat-txt').trim(); if (!t || S.pensando) return; $('#chat-txt').value = ''; S.ideias = []; S.sos = false; perguntar(t); };
  Acoes['chat-limpar'] = () => { S.chat = []; S.ideias = []; App.render(); };
  Acoes['sos'] = () => { S.sos = !S.sos; App.render(); };
  Acoes['sos-ir'] = async (b) => {
    const t = b.dataset.t; S.sos = false; S.ideias = []; S.pensando = true; App.render();
    const pub = conteudos().map((c) => c.titulo).slice(-20);
    try {
      const arr = await IA.json(`Sugira 3 ideias de vídeo curto (Reels/TikTok) para a Rebeca gravar sobre: ${t === 'Jogue-me à sorte' ? 'o que você achar mais forte agora para o perfil dela, misturando vida pessoal (rotina de 3 cidades, moda corporativa) e profissional (linguagem infantil, CAA, PROMPT, Teste da Linguinha, crianças atípicas)' : t}.
Evite repetir: ${JSON.stringify(pub)}.
Responda somente JSON: [{"titulo":"","gancho":"frase dos 3 primeiros segundos","formato":"Reels|TikTok|Reels e TikTok","duracao":"ex.: 30s","por_que":"por que deve performar (dor da mãe, salvamento, envio)"}]`, { modelTier: 'quick' });
      S.ideias = Array.isArray(arr) ? arr.slice(0, 3) : []; S.ideiaCat = t;
    } catch (e) { UI.toast(IA.erro(e), 'bad'); }
    S.pensando = false; App.render();
  };
  Acoes['ideia-roteiro'] = (b) => { const x = S.ideias[+b.dataset.i]; S.ideias = []; perguntar(`Quero o roteiro completo desta ideia (${S.ideiaCat || ''}): "${x.titulo}". Gancho: "${x.gancho}". Duração: ${x.duracao || '30s'}.`); };
  Acoes['rt-salvar'] = async () => {
    const txt = S.chat.filter((m) => m.role === 'assistant').pop().content;
    const titulo = (txt.match(/^#\s*T[ií]tulo\s*\n+(.+)$/mi) || txt.match(/^#\s*(.+)$/m) || [])[1] || S.chat[0].content.slice(0, 70);
    const r = await Dados.salvar('roteiros', null, { titulo: titulo.replace(/^#+\s*/, '').trim(), texto: txt, categoria: S.ideiaCat || 'Tema livre', rede: '', status: 'roteiro', criadoEm: new Date().toISOString() });
    UI.toast('Roteiro salvo. Depois de gravar, envie o vídeo por aqui.'); abrirRoteiro(r.id);
  };

  function abrirRoteiro(id) {
    const r = Dados.get('roteiros', id); if (!r) return;
    const ed = r.edicao;
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">${esc(r.categoria || 'Roteiro')}</div><h2>${esc(r.titulo)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="cols-2"><div class="stack">
        <details ${r.video ? '' : 'open'}><summary style="cursor:pointer;font-weight:500">Roteiro</summary><div class="msg" style="max-width:none;margin-top:8px">${formatarRoteiro(r.texto)}</div></details>
        ${r.video ? '' : `<label class="bubble soft stack" style="cursor:pointer;text-align:center;align-items:center">${ic('upload').replace('<svg', '<svg style="width:34px;height:34px;color:var(--olive)"')}<b>Enviar o vídeo gravado (cru)</b><span class="small muted">MP4 ou MOV, até 20 MB. Grave na vertical.</span><input type="file" accept="video/*" class="sr" data-change="rt-video" data-id="${r.id}"></label><span class="small muted" id="rt-up"></span>`}
        ${ed ? `<div class="panel"><h3>Plano de edição</h3><div class="cuts" style="margin-top:8px">${(ed.cortes || []).map((c) => `<div class="cut"><span class="tc">${esc(c.de)}–${esc(c.ate)}</span><span>${esc(c.acao)}</span></div>`).join('')}</div>${ed.capa ? `<p class="small" style="margin-top:8px"><b>Capa:</b> ${esc(ed.capa)}</p>` : ''}${ed.musica ? `<p class="small"><b>Áudio:</b> ${esc(ed.musica)}</p>` : ''}</div>` : ''}
      </div>
      <div class="stack">
        ${r.video ? `<div class="video-stage"><video id="rt-v" src="${esc(Arquivos.src(r.video))}" controls playsinline></video><div class="ov top" id="ov-top"></div><div class="ov sub" id="ov-sub"></div></div>
          <div class="row" style="justify-content:center">${ed ? '' : `<button class="btn btn-olive" data-act="rt-editar" data-id="${r.id}">${ic('wand')} Montar edição</button>`}${ed ? `<button class="btn btn-ghost btn-sm" data-act="rt-editar" data-id="${r.id}">Refazer edição</button><button class="btn btn-primary" data-act="rt-aprovar" data-id="${r.id}">${ic('up')} Aprovar e agendar</button>` : ''}</div><span class="small muted" id="rt-ed-st" style="text-align:center"></span>
          <p class="small muted">A prévia mostra os letterings, as legendas e o corte do gancho por cima do vídeo. A exportação com tudo gravado no arquivo final entra com a integração do editor de vídeo (CapCut ou Canva).</p>` : `<div class="empty">${ic('video')}<div>Depois de gravar, envie o vídeo cru e o sistema monta a edição com gancho, letterings e legendas.</div></div>`}
      </div></div>`, { wide: true });
    if (r.video && ed) {
      const v = $('#rt-v'); const t2s = (t) => { const [m, s] = String(t).split(':').map(Number); return s === undefined ? m : m * 60 + s; };
      v.addEventListener('timeupdate', () => {
        const t = v.currentTime; const L = (ed.letterings || []).find((x) => t >= t2s(x.de) && t < t2s(x.ate)); const Lg = (ed.legendas || []).find((x) => t >= t2s(x.de) && t < t2s(x.ate));
        $('#ov-top').innerHTML = L ? `<span>${esc(L.texto)}</span>` : ''; $('#ov-sub').textContent = Lg ? Lg.texto : '';
      });
      if (ed.gancho && ed.gancho.de) v.addEventListener('loadedmetadata', () => { v.currentTime = t2s(ed.gancho.de); }, { once: true });
    }
  }
  Acoes['rt-abrir'] = (b) => abrirRoteiro(b.dataset.id);
  Acoes['rt-video'] = async (inp) => {
    const f = inp.files && inp.files[0]; if (!f) return; const st = $('#rt-up');
    if (f.size > 20 * 1024 * 1024) { st.textContent = 'O arquivo passa de 20 MB. Exporte em 1080p ou corte o vídeo antes de enviar.'; return; }
    st.textContent = 'Enviando…';
    const id = inp.dataset.id; let url = '', asset = '';
    const local = URL.createObjectURL(f);
    if (Dados.modo === 'supabase') {
      try { const ext = (f.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, ''); url = await Arquivos.enviar('videos', `${id}/${Date.now()}.${ext}`, f); }
      catch (e) { st.textContent = 'Não consegui guardar o vídeo no sistema: ' + ((e && e.message) || 'tente novamente.'); return; }
    } else {
      const assets = await Cap.assets();
      if (assets) { try { const up = await assets.upload(f); url = up.url; asset = up.id; } catch (e) { st.textContent = 'Não consegui guardar o vídeo no sistema: ' + ((e && e.message) || 'tente novamente.'); return; } }
      else { url = local; UI.toast('Vídeo carregado só nesta sessão: esta visualização não guarda arquivos.', 'bad'); }
    }
    const dur = await new Promise((res) => { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => res(Math.round(v.duration)); v.onerror = () => res(0); v.src = local; });
    await Dados.atualizar('roteiros', id, { video: url, videoAsset: asset, duracao: dur, status: 'gravado' }); UI.fechar(); abrirRoteiro(id);
  };
  Acoes['rt-editar'] = async (b) => {
    const r = Dados.get('roteiros', b.dataset.id); const st = $('#rt-ed-st'); b.disabled = true; st.textContent = 'Montando a edição…';
    try {
      const ed = await IA.json(`Monte o plano de edição de um vídeo vertical de ${r.duracao || 30} segundos gravado a partir deste roteiro. Use tempos no formato m:ss, sem passar da duração.
Roteiro: """${r.texto}"""
Responda somente JSON: {"gancho":{"de":"0:00","ate":"0:03"},"cortes":[{"de":"","ate":"","acao":"o que cortar, acelerar ou destacar"}],"letterings":[{"de":"","ate":"","texto":"frase curta de impacto, até 7 palavras"}],"legendas":[{"de":"","ate":"","texto":"legenda falada, até 10 palavras"}],"capa":"texto e momento sugerido para a capa","musica":"tipo de áudio em alta adequado e volume"}`);
      await Dados.atualizar('roteiros', r.id, { edicao: ed, status: 'editado' }); UI.fechar(); abrirRoteiro(r.id);
    } catch (e) { st.textContent = IA.erro(e); b.disabled = false; }
  };
  Acoes['rt-aprovar'] = async (b) => {
    const r = Dados.get('roteiros', b.dataset.id); if (!r) return;
    const leg = (r.texto.match(/#\s*Legenda\s*\n+([\s\S]*?)(\n#|$)/i) || [])[1] || '';
    const tags = (r.texto.match(/#\s*Hashtags\s*\n+([\s\S]*?)(\n#\s|$)/i) || [])[1] || '';
    const gancho = (r.texto.match(/#\s*Gancho[^\n]*\n+([\s\S]*?)(\n#|$)/i) || [])[1] || '';
    for (const rede of ['instagram', 'tiktok']) {
      const data = proximoHorario(rede);
      await Dados.salvar('conteudos', null, { formato: rede === 'tiktok' ? 'video' : 'reels', rede, pilar: /look/i.test(r.categoria) ? 'looks' : /posicionamento/i.test(r.categoria) ? 'rotina' : 'dicas', titulo: r.titulo, gancho: gancho.trim().split('\n')[0], roteiro: [], legenda: leg.trim(), hashtags: tags.trim(), fontes: [], video: r.video, videoAsset: r.videoAsset || '', foto: 'img/hero.jpg', status: 'agendado', agendadoPara: data, aprovadoEm: new Date().toISOString(), criadoEm: new Date().toISOString(), deRoteiro: r.id });
    }
    await Dados.atualizar('roteiros', r.id, { status: 'aprovado' }); UI.fechar(); S.tab = 'conteudos'; S.filtro = 'agendado'; App.render(); UI.toast('Vídeo aprovado e agendado no Instagram e no TikTok.');
  };

  /* ---------------- ADS ---------------- */
  function abaAds() {
    const c = S.camp = S.camp || { objetivo: 'mensagens', cidades: ['Feira de Santana'], raio: 25, idadeMin: 24, idadeMax: 45, publico: 'todos', interesses: ['Maternidade', 'Desenvolvimento infantil'], diario: 20, dias: 7, cpm: 12, cpc: 6, post: '' };
    const posts = conteudos().filter((x) => x.status === 'agendado' || x.status === 'publicado');
    const total = c.diario * c.dias; const alcance = Math.round((total / c.cpm) * 1000 * .55); const conversas = Math.round(total / c.cpc);
    const campanhas = Dados.lista('campanhas').sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    const INT = ['Maternidade', 'Desenvolvimento infantil', 'Autismo', 'TDAH', 'Amamentação', 'Educação infantil', 'Pais de primeira viagem', 'Gestantes'];
    return `<div class="note">${ic('megaphone')}<div><strong>Recomendação de gestão de tráfego:</strong> para uma fonoaudióloga com atendimento presencial em cidades próximas, o melhor primeiro teste é uma campanha de <b>Mensagens no WhatsApp</b> com um conteúdo que já foi bem no orgânico, público local (raio de 20 a 30 km), por 7 dias, avaliando o custo por conversa no 3º dia antes de aumentar a verba.</div></div>
      <div class="cols-2"><div class="panel stack">
        <h3>Planejar campanha</h3>
        <div class="field"><span class="label">Objetivo</span><div class="row">${[['mensagens', 'Conversas no WhatsApp'], ['seguidores', 'Seguidores e engajamento'], ['alcance', 'Alcance local']].map(([k, n]) => `<button class="chip" data-act="ads-set" data-k="objetivo" data-v="${k}" aria-pressed="${c.objetivo === k}">${n}</button>`).join('')}</div></div>
        <div class="field"><label for="ads-post">Conteúdo para impulsionar</label><select class="input" id="ads-post" data-change="ads-campo" data-k="post"><option value="">Escolha um post aprovado</option>${posts.map((p) => `<option value="${p.id}" ${c.post === p.id ? 'selected' : ''}>${esc(p.titulo)}</option>`).join('')}</select></div>
        <div class="field"><span class="label">Cidades (raio de ${c.raio} km)</span><div class="row">${RF.Clinicas.cidades().map((ci) => `<button class="chip" data-act="ads-cidade" data-v="${esc(ci)}" aria-pressed="${c.cidades.includes(ci)}">${esc(ci)}</button>`).join('')}</div><input type="range" id="ads-raio" min="5" max="60" step="5" value="${c.raio}" data-change="ads-campo" data-k="raio" aria-label="Raio em km"></div>
        <div class="grid-form"><div class="field"><label for="ads-imin">Idade mínima</label><input class="input tnum" id="ads-imin" type="number" min="18" max="65" value="${c.idadeMin}" data-change="ads-campo" data-k="idadeMin"></div><div class="field"><label for="ads-imax">Idade máxima</label><input class="input tnum" id="ads-imax" type="number" min="18" max="65" value="${c.idadeMax}" data-change="ads-campo" data-k="idadeMax"></div></div>
        <div class="field"><span class="label">Interesses</span><div class="row">${INT.map((i) => `<button class="chip" data-act="ads-int" data-v="${esc(i)}" aria-pressed="${c.interesses.includes(i)}">${esc(i)}</button>`).join('')}</div></div>
        <div class="grid-form"><div class="field"><label for="ads-d">Orçamento por dia (R$)</label><input class="input tnum" id="ads-d" type="number" min="6" step="1" value="${c.diario}" data-change="ads-campo" data-k="diario"></div><div class="field"><label for="ads-n">Duração (dias)</label><input class="input tnum" id="ads-n" type="number" min="3" max="60" value="${c.dias}" data-change="ads-campo" data-k="dias"></div></div>
        <details><summary class="small" style="cursor:pointer">Premissas da estimativa (ajuste com o que o Gerenciador de Anúncios mostrar)</summary><div class="grid-form" style="margin-top:8px"><div class="field"><label for="ads-cpm">Custo por mil impressões (R$)</label><input class="input tnum" id="ads-cpm" type="number" min="1" value="${c.cpm}" data-change="ads-campo" data-k="cpm"></div><div class="field"><label for="ads-cpc">Custo por conversa (R$)</label><input class="input tnum" id="ads-cpc" type="number" min="1" value="${c.cpc}" data-change="ads-campo" data-k="cpc"></div></div><p class="small muted">Valores iniciais são suposições conservadoras para começar o teste. Troque pelos números reais depois dos primeiros 3 dias.</p></details>
      </div>
      <div class="stack" style="gap:20px">
        <div class="panel"><h3>Estimativa</h3><div class="kpis" style="margin-top:12px"><div class="kpi"><div class="eyebrow">Investimento total</div><div class="v">${fmt.moeda(total)}</div></div><div class="kpi"><div class="eyebrow">Pessoas alcançadas</div><div class="v">~${fmt.num(alcance)}</div></div>${c.objetivo === 'mensagens' ? `<div class="kpi"><div class="eyebrow">Conversas</div><div class="v">~${fmt.num(conversas)}</div></div>` : ''}</div><p class="small muted" style="margin-top:10px">Estimativa a partir das premissas ao lado; o resultado real aparece no Gerenciador de Anúncios.</p>
          <div class="row" style="margin-top:14px"><button class="btn btn-olive btn-sm" data-act="ads-ia">${ic('spark')} Montar plano completo com IA</button><button class="btn btn-primary btn-sm" data-act="ads-salvar">Salvar campanha</button></div></div>
        <div class="panel" ${S.plano ? '' : 'hidden'}>${S.plano || ''}</div>
        <div class="panel"><h3>Checklist ético antes de anunciar</h3><ul class="small" style="margin:10px 0 0;padding-left:18px;display:grid;gap:6px"><li>Sem promessa de cura, resultado ou prazo.</li><li>Sem fotos de “antes e depois” de pacientes.</li><li>Imagem de criança só com autorização assinada dos responsáveis.</li><li>Nome completo e número do CRFa visíveis no perfil e no anúncio.</li><li>Confira as regras de publicidade do Código de Ética da Fonoaudiologia (CFFa).</li></ul></div>
      </div></div>
      <div class="panel"><div class="panel-head"><h3>Campanhas</h3></div>${campanhas.length ? `<div class="list">${campanhas.map((x) => `<div class="li"><span class="avatar" style="background:var(--terra-soft);color:var(--terra)">${ic('target')}</span><div class="grow"><div class="t">${esc(x.nome)}</div><div class="s">${fmt.moeda(x.diario)}/dia · ${x.dias} dias · ${esc(x.cidades.join(', '))}</div></div><span class="pill ${x.status === 'ativa' ? 'ok' : 'warn'}">${x.status === 'ativa' ? 'No ar' : 'Rascunho'}</span><button class="btn btn-ghost btn-sm" data-act="ads-config" data-id="${x.id}">Configurar nas redes</button></div>`).join('')}</div>` : '<p class="muted small">Nenhuma campanha salva.</p>'}</div>`;
  }
  Acoes['ads-set'] = (b) => { S.camp[b.dataset.k] = b.dataset.v; App.render(); };
  Acoes['ads-campo'] = (i) => { S.camp[i.dataset.k] = i.type === 'range' || i.type === 'number' ? +i.value : i.value; App.render(); };
  Acoes['ads-cidade'] = (b) => { const s = new Set(S.camp.cidades); s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); S.camp.cidades = [...s]; App.render(); };
  Acoes['ads-int'] = (b) => { const s = new Set(S.camp.interesses); s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); S.camp.interesses = [...s]; App.render(); };
  Acoes['ads-salvar'] = async () => { const c = S.camp; if (!c.cidades.length) { UI.toast('Escolha pelo menos uma cidade.', 'bad'); return; } const p = Dados.get('conteudos', c.post); await Dados.salvar('campanhas', null, { ...c, nome: `${{ mensagens: 'Conversas', seguidores: 'Seguidores', alcance: 'Alcance' }[c.objetivo]} · ${p ? p.titulo.slice(0, 40) : 'sem criativo'}`, status: 'rascunho', criadoEm: new Date().toISOString(), plano: S.planoTxt || '' }); UI.toast('Campanha salva.'); };
  Acoes['ads-ia'] = async (b) => {
    const c = S.camp; const p = Dados.get('conteudos', c.post); b.disabled = true; S.plano = '<div class="typing"><i></i><i></i><i></i></div>'; App.render();
    try {
      const o = await IA.json(`Aja como a melhor gestora de tráfego pago para profissionais de saúde no Brasil. Monte um plano de campanha (Meta Ads e, se fizer sentido, TikTok Ads) para a fonoaudióloga infantil Rebeca, com estes parâmetros: ${JSON.stringify({ ...c, post: p ? { titulo: p.titulo, formato: p.formato, legenda: p.legenda } : null })}.
Respeite o Código de Ética da Fonoaudiologia: nada de promessa de resultado. Use linguagem que acolhe a mãe e convida para conversar no WhatsApp.
Responda somente JSON: {"estrutura":"campanha > conjuntos > anúncios em uma frase","publico":"descrição do público e exclusões","criativos":[{"texto":"copy até 125 caracteres","titulo":"","cta":""}],"orcamento":"como distribuir e quando aumentar","otimizacao":["regras para o 3º e o 7º dia"],"metricas_alvo":["métrica e valor de referência a acompanhar"]}`);
      S.planoTxt = JSON.stringify(o);
      S.plano = `<h3>Plano da campanha</h3><p style="margin-top:8px"><b>Estrutura:</b> ${esc(o.estrutura || '')}</p><p><b>Público:</b> ${esc(o.publico || '')}</p><div style="margin-top:8px"><span class="label">Anúncios</span>${(o.criativos || []).map((x) => `<div class="bubble soft small" style="margin-top:6px"><b>${esc(x.titulo || '')}</b><br>${esc(x.texto || '')}<br><span class="muted">Botão: ${esc(x.cta || '')}</span></div>`).join('')}</div><p style="margin-top:8px"><b>Orçamento:</b> ${esc(o.orcamento || '')}</p><span class="label">Otimização</span><ul class="small" style="padding-left:18px">${(o.otimizacao || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><span class="label">Acompanhar</span><ul class="small" style="padding-left:18px">${(o.metricas_alvo || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    } catch (e) { S.plano = `<div class="note warn">${ic('info')}<div>${esc(IA.erro(e))}</div></div>`; }
    App.render();
  };
  Acoes['ads-config'] = (b) => {
    const x = Dados.get('campanhas', b.dataset.id); if (!x) return;
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Configurar nas redes</div><h2>${esc(x.nome)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="note">${ic('plug')}<div>Com uma conta de anúncios conectada ao Claude (por exemplo, pelo conector <b>Adspirer</b> para Meta e TikTok, ou <b>TikTok for Business</b>), o sistema cria a campanha pausada para você só revisar e ligar. Até lá, siga o passo a passo:</div></div>
      <ol style="margin-top:14px;padding-left:20px;display:grid;gap:8px"><li>Abra o Gerenciador de Anúncios e crie uma campanha com objetivo <b>${{ mensagens: 'Engajamento › Mensagens (WhatsApp)', seguidores: 'Engajamento › Perfil do Instagram', alcance: 'Reconhecimento › Alcance' }[x.objetivo]}</b>.</li><li>Orçamento diário de <b>${fmt.moeda(x.diario)}</b> por <b>${x.dias} dias</b>.</li><li>Localização: ${esc(x.cidades.join(', '))}, raio de ${x.raio} km. Idade ${x.idadeMin}–${x.idadeMax}. Interesses: ${esc(x.interesses.join(', '))}.</li><li>Use o post escolhido como anúncio e o botão “Enviar mensagem” para o WhatsApp ${esc(RF.marca.whatsappTexto)}.</li><li>No 3º dia, compare o custo por conversa com a meta; pause anúncios com custo 2× maior que a média.</li></ol>
      <div class="row" style="margin-top:16px"><a class="btn btn-primary" href="https://adsmanager.facebook.com/" target="_blank" rel="noopener">Abrir Meta Ads</a><a class="btn btn-ghost" href="https://ads.tiktok.com/" target="_blank" rel="noopener">Abrir TikTok Ads</a><button class="btn btn-ghost" data-act="ads-ativa" data-id="${x.id}">Marcar como no ar</button></div>`);
  };
  Acoes['ads-ativa'] = async (b) => { await Dados.atualizar('campanhas', b.dataset.id, { status: 'ativa' }); UI.fechar(); };

  /* ---------------- Integrações ---------------- */
  function abaIntegracoes() {
    const it = [
      { n: 'WhatsApp', i: 'whats', st: ['ok', 'Ativo por link'], d: 'Recados, acessos, avisos de relatório e lembretes já saem com a mensagem pronta no WhatsApp da Rebeca; ela só toca em enviar.', prox: 'Envio 100% automático (sem tocar em enviar) exige a API oficial do WhatsApp Business da Meta, com número dedicado e servidor próprio.' },
      { n: 'Instagram e TikTok', i: 'insta', st: ['warn', 'Conectar'], d: 'Publicação automática dos posts aprovados, métricas reais no painel e melhor horário calculado com o público da própria Rebeca.', prox: 'Conecte o Metricool (agenda posts, puxa métricas e mostra o melhor horário de Instagram e TikTok) em claude.ai › Conectores.' },
      { n: 'Canva', i: 'canva', st: ['warn', 'Conectar'], d: 'Cada proposta vira um design editável na conta da Rebeca, com as cores e fontes da marca.', prox: 'Conecte o Canva em claude.ai › Conectores.' },
      { n: 'Tráfego pago', i: 'megaphone', st: ['warn', 'Conectar'], d: 'Criação das campanhas planejadas no Meta Ads e no TikTok Ads, pausadas para revisão, com acompanhamento de resultados.', prox: 'Conecte o Adspirer (Meta e TikTok Ads) ou o TikTok for Business em claude.ai › Conectores.' },
      { n: 'Google Agenda', i: 'cal', st: ['sage', 'Disponível'], d: 'Próximo passo: agenda de sessões por paciente, com lembrete automático na véspera.', prox: 'Já conectado na conta do Lucas no Claude.' }
    ];
    return `<p class="muted">Depois de conectar um serviço no claude.ai, peça ao Claude para ligá-lo ao sistema e os botões passam a agir sozinhos.</p><div class="cols-3">${it.map((x) => `<div class="panel stack"><div class="row between"><span class="avatar" style="background:var(--sage-soft);color:var(--olive)">${ic(x.i)}</span><span class="pill ${x.st[0]}">${x.st[1]}</span></div><h3>${x.n}</h3><p class="small">${x.d}</p><p class="small muted">${x.prox}</p></div>`).join('')}</div>`;
  }

  S.render = function () {
    const TABS = [['conteudos', 'Gestão de conteúdos', 'board'], ['analises', 'Análises', 'chart'], ['roteiros', 'Roteiros e vídeos', 'video'], ['ads', 'ADS e tráfego', 'megaphone'], ['integracoes', 'Integrações', 'plug']];
    const n = conteudos().filter((c) => c.status === 'proposto').length;
    const corpo = { conteudos: abaConteudos, analises: abaAnalises, roteiros: abaRoteiros, ads: abaAds, integracoes: abaIntegracoes }[S.tab] || abaConteudos;
    return `<div class="row between"><div class="row"><a class="btn btn-ghost btn-sm" href="https://www.instagram.com/${RF.marca.instagram}/" target="_blank" rel="noopener">${ic('insta')} @${RF.marca.instagram}</a><a class="btn btn-ghost btn-sm" href="https://www.tiktok.com/@${RF.marca.tiktok}" target="_blank" rel="noopener">${ic('tiktok')} @${RF.marca.tiktok}</a></div></div>
      <div class="subtabs" role="tablist">${TABS.map(([k, t, i]) => `<button class="subtab" role="tab" aria-selected="${S.tab === k}" data-act="soc-tab" data-tab="${k}">${t}${k === 'conteudos' && n ? ` <span class="pill rose">${n}</span>` : ''}</button>`).join('')}</div>${corpo()}`;
  };
})();
