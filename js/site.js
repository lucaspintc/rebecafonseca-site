/* Página inicial pública */
(function () {
  const M = RF.marca;
  const logo = (h = '') => `<img class="brand-logo light-only" src="img/logo-verde.png" alt="Rebeca Fonseca Fonoaudióloga" ${h}><img class="brand-logo dark-only" src="img/logo-branco.png" alt="" aria-hidden="true" ${h}>`;

  const areas = [
    { i: 'chat', t: 'Atraso de fala e linguagem', d: 'Avaliação e terapia para crianças que falam pouco, trocam sons ou têm dificuldade para se expressar e compreender.' },
    { i: 'board', t: 'Comunicação Alternativa (CAA)', d: 'Pranchas e sistemas como o PODD para dar voz agora a crianças que ainda não falam ou falam pouco.' },
    { i: 'tongue', t: 'Método PROMPT', d: 'Terapia da fala com pistas táteis e de movimento, indicada para dificuldades motoras de fala, como a apraxia.' },
    { i: 'baby', t: 'Teste da Linguinha', d: 'Avaliação do frênulo da língua em bebês, com orientação para a amamentação e para o desenvolvimento oral.' },
    { i: 'heart', t: 'Crianças atípicas', d: 'Acompanhamento de crianças com autismo, síndromes e outros diagnósticos, sempre com a família junto.' },
    { i: 'users', t: 'Orientação às famílias', d: 'Estratégias simples para o dia a dia, relatórios claros e recados direto no seu WhatsApp e no portal.' }
  ];

  const F = RF.Feriados;
  const NUM = ['', 'Uma', 'Duas', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez'];
  const quantas = (n, s, p) => `${NUM[n] || n} ${n === 1 ? s : p}`;
  const listaCidades = (cs) => cs.length > 1 ? cs.slice(0, -1).join(', ') + ' e ' + cs[cs.length - 1] : (cs[0] || '');
  const unicos = (xs) => xs.filter((v, i, a) => a.indexOf(v) === i);
  const nomesFer = (fs) => listaCidades(unicos(fs.map(F.curto)));

  /* Hoje e os próximos dias, sem domingo, com a data de cada um */
  function proximosDias(n) {
    const out = []; let dia = F.hojeISO();
    while (out.length < n) { if (F.diaSemana(dia) !== 0) out.push(dia); dia = F.somar(dia, 1); }
    return out;
  }

  function semana(locais) {
    const hoje = F.hojeISO();
    return `<div class="semana" role="list" aria-label="Agenda dos próximos dias">${proximosDias(6).map((dia) => {
      const d = F.diaSemana(dia); const geral = F.geral(dia); const ehHoje = dia === hoje;
      const aqui = locais.flatMap((l) => l.dias.filter((x) => x.d === d).map((x) => ({ l, t: x.turno, mun: F.municipal(dia, l.cidade) })));
      const lugar = (a) => {
        const fechado = geral.length || a.mun.length;
        return `<div class="lugar ${fechado ? 'fechado' : ''}"><span class="lnome">${esc(a.l.nome.replace('Clínica ', ''))}</span><small>${esc(a.l.cidade)}${a.t !== 'Dia todo' ? ' · ' + esc(a.t.toLowerCase()) : ''}</small>${!geral.length && a.mun.length ? `<span class="fer-tag">${ic('flag')}<span>Feriado em ${esc(a.l.cidade)}: ${esc(nomesFer(a.mun))} · sem atendimento</span></span>` : fechado ? '<span class="sr-only"> · sem atendimento</span>' : ''}</div>`;
      };
      return `<div class="dia ${ehHoje ? 'hoje' : ''} ${geral.length ? 'feriado' : ''}" role="listitem"><div class="nome">${RF.diasSemana[d]} <span class="tnum">${F.dataCurta(dia)}</span>${ehHoje ? ' · hoje' : ''}</div>${geral.length ? `<div class="fer">${ic('flag')}<span><b>${esc(F.rotulo(geral[0]))}</b>${esc(nomesFer(geral))}${aqui.length ? '<br>Sem atendimento' : ''}</span></div>` : ''}${aqui.map(lugar).join('')}</div>`;
    }).join('')}</div>`;
  }

  /* Etiqueta “Hoje” da foto do topo */
  function hojeTag(locais) {
    const dia = F.hojeISO(); const d = F.diaSemana(dia); const geral = F.geral(dia);
    if (geral.length) return `<strong>Hoje: feriado</strong>${esc(nomesFer(geral))} · sem atendimento`;
    const l = locais.filter((x) => x.dias.some((y) => y.d === d));
    const abertas = l.filter((x) => !F.municipal(dia, x.cidade).length);
    const fechadas = l.filter((x) => F.municipal(dia, x.cidade).length);
    const cAbertas = unicos(abertas.map((x) => x.cidade)), cFechadas = unicos(fechadas.map((x) => x.cidade));
    const topo = cAbertas.length ? esc(cAbertas.join(' e ')) : fechadas.length ? 'feriado' : 'dia de descanso';
    const linha = fechadas.length ? `Feriado em ${esc(listaCidades(cFechadas))}: ${esc(nomesFer(fechadas.flatMap((x) => F.municipal(dia, x.cidade))))} · sem atendimento${cAbertas.length ? ' lá' : ''}` : `${RF.diasSemana[d]} na agenda da Rebeca`;
    return `<strong>Hoje: ${topo}</strong>${linha}`;
  }

  function cardLocal(l) {
    const msg = M.msgAgenda;
    const quando = l.dias.map((x) => `<span class="pill ${x.turno === 'Dia todo' ? 'sage' : 'rose'}">${RF.diasSemana[x.d]}${x.turno !== 'Dia todo' ? ' · ' + x.turno.toLowerCase() : ''}</span>`).join('');
    const fer = F.proximos(l, 60).slice(0, 3);
    return `<article class="local" id="local-${l.id}">
      <div class="row between"><div><div class="eyebrow">${esc(l.cidade)}</div><h3 style="margin-top:6px">${esc(l.nome)}</h3></div></div>
      <div class="quando">${quando}</div>
      ${fer.length ? `<div class="linha fer-prox">${ic('flag')}<span><b>Sem atendimento por feriado:</b> ${fer.map((p) => `${esc(RF.diasSemana[p.d].toLowerCase())}, <span class="tnum">${F.dataCurta(p.dia)}</span> (${esc(nomesFer(p.feriados))})`).join('; ')}</span></div>` : ''}
      <div class="linha">${ic('pin')}<span>${esc(l.endereco)}</span></div>
      ${l.whatsapp ? `<div class="linha">${ic('whats')}<span data-copia>WhatsApp da clínica: <b class="tnum">${esc(fmt.tel(l.whatsapp))}</b></span></div>` : ''}
      ${l.tel && so(l.tel) !== so(l.whatsapp).slice(-so(l.tel).length) ? `<div class="linha">${ic('phone')}<span data-copia>Telefone: <b class="tnum">${esc(l.tel)}</b></span></div>` : ''}
      ${l.email ? `<div class="linha">${ic('mail')}<span data-copia>E-mail: <b>${esc(l.email)}</b></span></div>` : ''}
      <div class="acoes">
        ${l.whatsapp ? `<a class="btn btn-wa btn-sm" href="${Whats.link(l.whatsapp, msg)}" target="_blank" rel="noopener">${ic('whats')} Agendar pelo WhatsApp</a>` : ''}
        <a class="btn btn-ghost btn-sm" href="${esc(l.maps)}" target="_blank" rel="noopener">${ic('pin')} Abrir no Google Maps</a>
        ${l.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${esc(l.email)}?subject=${encodeURIComponent('Agendamento — Fono Rebeca Fonseca')}&body=${encodeURIComponent(msg)}">${ic('mail')} Escrever e-mail</a><button class="btn btn-ghost btn-sm" data-act="copiar" data-texto="${esc(l.email)}">${ic('copy')} Copiar e-mail</button>` : ''}
      </div>
    </article>`;
  }

  function mapa(locais, sel) {
    // Mapa esquemático: posições proporcionais às coordenadas reais de cada clínica
    locais = locais.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)); if (!locais.length) return '';
    const lats = locais.map((l) => l.lat), lngs = locais.map((l) => l.lng);
    const minLat = Math.min(...lats) - 0.04, maxLat = Math.max(...lats) + 0.04, minLng = Math.min(...lngs) - 0.06, maxLng = Math.max(...lngs) + 0.06;
    const Wd = 360, Hd = 380;
    const px = (l) => [((l.lng - minLng) / (maxLng - minLng)) * Wd, ((maxLat - l.lat) / (maxLat - minLat)) * Hd];
    const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
    const cid = {}; locais.forEach((l) => { (cid[l.cidade] = cid[l.cidade] || []).push(l); });
    const centros = Object.entries(cid).map(([c, ls]) => ({ c, lat: ls.reduce((s, l) => s + l.lat, 0) / ls.length, lng: ls.reduce((s, l) => s + l.lng, 0) / ls.length, ls }));
    const linhas = [];
    for (let i = 0; i < centros.length; i++) for (let j = i + 1; j < centros.length; j++) {
      const [x1, y1] = px(centros[i]), [x2, y2] = px(centros[j]);
      linhas.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line)" stroke-width="2" stroke-dasharray="4 6"/><text x="${(x1 + x2) / 2 + 6}" y="${(y1 + y2) / 2 - 6}">≈ ${km(centros[i], centros[j])} km</text>`);
    }
    const pinos = centros.map((c) => {
      const [x, y] = px(c); const ativo = !sel.length || sel.includes(c.c);
      return `<g style="cursor:pointer" data-act="mapa-cidade" data-cidade="${esc(c.c)}" opacity="${ativo ? 1 : .35}">
        <circle cx="${x}" cy="${y}" r="${18 + c.ls.length * 4}" fill="var(--sage)" fill-opacity=".25"/>
        <path d="M${x} ${y + 2}c-4-6-12-7-12 0 0 7 12 13 12 13s12-6 12-13c0-7-8-6-12 0z" transform="translate(0 -14)" fill="var(--terra)"/>
        <text x="${x}" y="${y + 30}" text-anchor="middle" style="font-weight:600;fill:var(--ink);font-size:12.5px">${esc(c.c)}</text>
        <text x="${x}" y="${y + 45}" text-anchor="middle">${c.ls.length} ${c.ls.length > 1 ? 'clínicas' : 'clínica'}</text></g>`;
    }).join('');
    return `<div class="mapa" aria-label="Mapa das cidades de atendimento"><svg viewBox="-30 -20 ${Wd + 60} ${Hd + 60}" role="img">${linhas.join('')}${pinos}</svg>
      <div class="legend">Mapa esquemático com distâncias em linha reta. Toque numa cidade para filtrar. Para o trajeto, use “Abrir no Google Maps” em cada clínica.</div></div>`;
  }

  App.views.inicio = function () {
    const locais = Dados.locais(); const cidades = RF.Clinicas.cidades(locais);
    const sel = App.sub.cidades || [];
    const filtrados = sel.length ? locais.filter((l) => sel.includes(l.cidade)) : locais;
    const aberto = App.sub.filtroAberto;
    const cfg = Dados.config();
    const sobre = cfg.sobre || RF.sobre;
    return `
<header class="site-head"><div class="wrap">
  <a href="#" data-act="ir" data-rota="inicio" aria-label="Início">${logo()}</a>
  <nav class="site-nav" aria-label="Seções"><a href="#sobre" data-act="rolar" data-alvo="sobre">Sobre mim</a><a href="#atendimento" data-act="rolar" data-alvo="atendimento">Atendimento</a><a href="#locais" data-act="rolar" data-alvo="locais">Locais</a><a href="#contato" data-act="rolar" data-alvo="contato">Contato</a></nav>
  <div class="site-cta"><button class="btn btn-ghost" data-act="ir" data-rota="area">${ic('user')} Área do usuário</button><button class="btn btn-primary" data-act="ir" data-rota="gestao">${ic('lock')} Gestão</button></div>
</div></header>

<section class="hero"><div class="pat pattern"></div><div class="wrap">
  <div>
    <div class="eyebrow">Fonoaudiologia infantil · ${esc(listaCidades(cidades))}</div>
    <h1 style="margin-top:16px">A primeira palavra do seu filho pode chegar de <em>muitos jeitos</em>. Eu ajudo a encontrar o dele.</h1>
    <p class="lead">Sou a Rebeca, fonoaudióloga especialista em linguagem infantil. Atendo bebês, crianças que falam pouco e crianças atípicas, com a família participando de cada passo.</p>
    <div class="creds"><span class="pill terra">${esc(M.crfa)}</span><span class="pill sage">UFBA</span><span class="pill sage">PROMPT Institute</span><span class="pill rose">CAA · PODD</span><span class="pill rose">Teste da Linguinha</span></div>
    <div class="actions"><a class="btn btn-wa" href="${Whats.link(M.whatsapp, M.msgAgenda)}" target="_blank" rel="noopener">${ic('whats')} Agendar pelo WhatsApp</a><button class="btn btn-ghost" data-act="rolar" data-alvo="locais">${ic('pin')} Onde eu atendo</button></div>
  </div>
  <div class="hero-photo">
    <div class="frame"><img src="img/hero.jpg" alt="Rebeca Fonseca, fonoaudióloga, sorrindo"></div>
    <img class="mark" src="img/marca.png" alt="" aria-hidden="true">
    <div class="tag">${hojeTag(locais)}</div>
  </div>
</div></section>

<section class="sec alt" id="atendimento"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Como posso ajudar</div><h2>Quem me procura quer uma resposta. <em>Eu começo pela escuta.</em></h2><p>Cada plano de terapia nasce de uma avaliação cuidadosa e de uma conversa franca com a família sobre o que está acontecendo e o que fazer a partir de agora.</p></div>
  <div class="areas">${areas.map((a) => `<div class="area"><div class="ic">${ic(a.i)}</div><h3>${a.t}</h3><p>${a.d}</p></div>`).join('')}</div>
</div></section>

<section class="sec" id="sobre"><div class="wrap about">
  <div class="photo"><img src="img/formatura.jpg" alt="Rebeca Fonseca na formatura em Fonoaudiologia pela UFBA"></div>
  <div class="text">
    <div class="eyebrow">Sobre mim</div>
    <blockquote>${esc(sobre.titulo)}</blockquote>
    ${(sobre.paragrafos || []).map((p) => `<p>${esc(p)}</p>`).join('')}
    <ul class="creds-list">${RF.formacao.map((f) => `<li><span>${esc(f.tipo)}</span><span><b>${esc(f.titulo)}</b><br><span class="muted">${esc(f.inst)}</span></span></li>`).join('')}<li><span>Registro</span><span><b>${esc(M.crfa)}</b><br><span class="muted">Conselho Regional de Fonoaudiologia</span></span></li></ul>
  </div>
</div></section>

<section class="sec alt"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Sinais para acompanhar</div><h2>O que a maioria das crianças já faz em cada idade</h2><p>Estes marcos mostram o que 75% das crianças já fazem. Se o seu filho ainda não chegou lá, isso não é motivo para culpa, e sim para buscar uma avaliação cedo.</p></div>
  <div class="marcos">${RF.marcos.map((m) => `<div class="marco"><div class="age">${esc(m.idade)}</div><ul>${m.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
  <p class="small muted" style="margin-top:18px">Fonte: CDC/AAP, marcos revisados em 2022 (Zubler et al., Pediatrics, 2022). Este guia não substitui avaliação profissional.</p>
</div></section>

<section class="sec" id="locais"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Locais de atendimento</div><h2>${quantas(cidades.length, 'cidade', 'cidades')}, ${quantas(locais.length, 'clínica', 'clínicas').toLowerCase()}, uma agenda pensada para estar perto de você</h2></div>
  ${semana(locais)}
  <div class="filtro">
    <button class="btn ${aberto || sel.length ? 'btn-olive' : 'btn-ghost'}" data-act="filtro-cidade" aria-expanded="${aberto ? 'true' : 'false'}">${ic('search')} Buscar por cidade${sel.length ? ` · ${sel.length}` : ''}</button>
    ${sel.length ? `<button class="linkbtn" data-act="limpar-cidades">Mostrar todas</button>` : ''}
    ${aberto ? `<div class="cidade-box" role="group" aria-label="Escolha uma ou mais cidades">${cidades.map((c) => `<button class="chip" data-act="cidade" data-cidade="${esc(c)}" aria-pressed="${sel.includes(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
  </div>
  <div class="locais-layout">
    <div class="locais">${filtrados.map(cardLocal).join('')}</div>
    ${mapa(locais, sel)}
  </div>
</div></section>

<section class="sec alt" id="contato"><div class="wrap">
  <div class="sec-head"><div class="eyebrow">Contato</div><h2>Vamos conversar sobre o seu filho?</h2><p>Para agendar, escolha a clínica mais perto de você acima ou fale direto comigo.</p></div>
  <div class="contato">
    <div class="card"><div class="eyebrow">WhatsApp</div><div class="valor tnum" data-copia>${esc(M.whatsappTexto)}</div><div class="row"><a class="btn btn-wa btn-sm" href="${Whats.link(M.whatsapp, M.msgAgenda)}" target="_blank" rel="noopener">${ic('whats')} Chamar no WhatsApp</a></div></div>
    <div class="card"><div class="eyebrow">E-mail</div><div class="valor" data-copia>${esc(M.email)}</div><div class="row"><a class="btn btn-ghost btn-sm" href="mailto:${esc(M.email)}?subject=${encodeURIComponent('Contato pelo site')}">${ic('mail')} Escrever e-mail</a><button class="btn btn-ghost btn-sm" data-act="copiar" data-texto="${esc(M.email)}">${ic('copy')} Copiar</button></div></div>
    <div class="card"><div class="eyebrow">Redes sociais</div><div class="valor">@${esc(M.instagram)}</div><div class="row"><a class="btn btn-ghost btn-sm" href="https://www.instagram.com/${esc(M.instagram)}/" target="_blank" rel="noopener">${ic('insta')} Instagram</a><a class="btn btn-ghost btn-sm" href="https://www.tiktok.com/@${esc(M.tiktok)}" target="_blank" rel="noopener">${ic('tiktok')} TikTok</a></div></div>
  </div>
</div></section>

<footer class="site-foot"><div class="wrap">
  <img src="img/logo-branco.png" alt="Rebeca Fonseca Fonoaudióloga">
  <small>${esc(M.crfa)} · Fonoaudiologia infantil · ${esc(listaCidades(cidades))} — BA</small>
  <div class="row"><button class="btn btn-sm" style="background:rgba(255,255,255,.16);color:#fff" data-act="ir" data-rota="area">Área do usuário</button><button class="btn btn-sm" style="background:#fff;color:#788035" data-act="ir" data-rota="gestao">Gestão</button></div>
</div></footer>`;
  };

  Acoes['rolar'] = (a, e) => { if (e) e.preventDefault(); const el = document.getElementById(a.dataset.alvo); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  Acoes['filtro-cidade'] = () => { App.sub.filtroAberto = !App.sub.filtroAberto; App.render(); };
  Acoes['cidade'] = (b) => { const c = b.dataset.cidade; const s = new Set(App.sub.cidades || []); s.has(c) ? s.delete(c) : s.add(c); App.sub.cidades = [...s]; App.render(); };
  Acoes['limpar-cidades'] = () => { App.sub.cidades = []; App.render(); };
  Acoes['mapa-cidade'] = (g) => { const c = g.dataset.cidade; App.sub.cidades = [c]; App.sub.filtroAberto = true; App.render(); const el = $('.locais'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
})();
