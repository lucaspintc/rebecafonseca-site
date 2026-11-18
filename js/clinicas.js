/* Configurações: cadastro de clínicas (sem agendas simultâneas) e contatos do site. Tudo o que é salvo aqui aparece no site. */
(function () {
  const G = App.sub.g = App.sub.g || { sec: 'painel' };
  const TURNOS = ['Manhã', 'Tarde', 'Dia todo'];
  const DIAS = [1, 2, 3, 4, 5, 6];
  const choca = (a, b) => a === 'Dia todo' || b === 'Dia todo' || a === b;
  const turnoTxt = (t) => (t === 'Dia todo' ? 'dia todo' : t.toLowerCase());
  const nomeCurto = (l) => (l.nome || 'clínica sem nome');

  const C = RF.Clinicas = {
    ed() { if (!G.locsEd) G.locsEd = JSON.parse(JSON.stringify(Dados.locais())).map((l) => ({ ...l, _coords: Number.isFinite(l.lat) && Number.isFinite(l.lng) ? `${l.lat}, ${l.lng}` : '' })); return G.locsEd; },
    /* Primeira agenda de outra clínica que coincide com o dia e o turno */
    conflito(locs, i, d, turno) {
      for (let k = 0; k < locs.length; k++) { if (k === i) continue; const x = (locs[k].dias || []).find((y) => y.d === d && choca(y.turno, turno)); if (x) return { k, l: locs[k], turno: x.turno }; }
      return null;
    },
    conflitos(locs) {
      const out = [];
      locs.forEach((l, i) => (l.dias || []).forEach((x) => { const c = C.conflito(locs, i, x.d, x.turno); if (c && c.k > i) out.push({ a: l, b: c.l, d: x.d, ta: x.turno, tb: c.turno }); }));
      return out;
    },
    cidades(locs) { return [...new Set((locs || Dados.locais()).map((l) => l.cidade).filter(Boolean))]; },
    coords(txt, maps) {
      const num = (s) => parseFloat(String(s).replace(',', '.'));
      let m = String(txt || '').trim().match(/^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/);
      if (m) return [num(m[1]), num(m[2])];
      m = String(maps || '').match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || String(maps || '').match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || String(maps || '').match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
      return m ? [num(m[1]), num(m[2])] : null;
    },
    cfg() {
      const locs = C.ed(); const pacs = Dados.lista('pacientes');
      return `<datalist id="dl-cidades">${[...new Set([...C.cidades(locs), ...RF.cidades])].map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
        <div class="note" style="margin-top:16px">${ic('info')}<div>O que você salvar aqui aparece no site: cartões das clínicas, agenda da semana, filtro por cidade e mapa. A Rebeca não pode estar em dois lugares ao mesmo tempo: o sistema não deixa marcar o mesmo dia e turno em duas clínicas.</div></div>
        <div class="stack" style="margin-top:16px">${locs.map((l, i) => { const n = pacs.filter((p) => p.local === l.id).length; return `<div class="panel stack loc-ed" id="loc-${i}" data-loc-i="${i}">
          <div class="row between"><div class="row"><b style="font-size:16px">${esc(l.nome || 'Nova clínica')}</b>${l.cidade ? `<span class="pill sage">${esc(l.cidade)}</span>` : ''}${l.nova ? '<span class="pill warn">nova</span>' : ''}${n ? `<span class="pill">${n} paciente${n > 1 ? 's' : ''}</span>` : ''}</div><button type="button" class="btn btn-ghost btn-sm" data-act="loc-del" data-i="${i}">${ic('trash')} Remover</button></div>
          <div class="grid-form">
            <div class="field"><label for="lc-nome-${i}">Nome *</label><input class="input" id="lc-nome-${i}" data-input="loc-campo" data-i="${i}" data-k="nome" value="${esc(l.nome || '')}"></div>
            <div class="field"><label for="lc-cid-${i}">Cidade *</label><input class="input" id="lc-cid-${i}" list="dl-cidades" data-input="loc-campo" data-i="${i}" data-k="cidade" value="${esc(l.cidade || '')}"></div>
            <div class="field full"><label for="lc-end-${i}">Endereço *</label><input class="input" id="lc-end-${i}" data-input="loc-campo" data-i="${i}" data-k="endereco" value="${esc(l.endereco || '')}"></div>
            <div class="field"><label for="lc-wa-${i}">WhatsApp da clínica</label><input class="input" id="lc-wa-${i}" inputmode="tel" data-input="loc-campo" data-i="${i}" data-k="whatsapp" value="${esc(l.whatsapp ? fmt.tel(l.whatsapp) : '')}"></div>
            <div class="field"><label for="lc-tel-${i}">Telefone fixo (opcional)</label><input class="input" id="lc-tel-${i}" inputmode="tel" data-input="loc-campo" data-i="${i}" data-k="tel" value="${esc(l.tel || '')}"></div>
            <div class="field"><label for="lc-em-${i}">E-mail da clínica</label><input class="input" id="lc-em-${i}" inputmode="email" data-input="loc-campo" data-i="${i}" data-k="email" value="${esc(l.email || '')}" placeholder="opcional"></div>
            <div class="field"><label for="lc-maps-${i}">Link do Google Maps</label><input class="input" id="lc-maps-${i}" data-input="loc-campo" data-i="${i}" data-k="maps" value="${esc(l.maps || '')}" placeholder="https://maps.app.goo.gl/..."></div>
            <div class="field full"><label for="lc-co-${i}">Coordenadas no mapa (latitude, longitude)</label><input class="input" id="lc-co-${i}" data-input="loc-campo" data-i="${i}" data-k="_coords" value="${esc(l._coords || '')}" placeholder="-12.2667, -38.9667"><span class="hint">No Google Maps, toque e segure no local (ou clique com o botão direito) e copie os números que aparecem. Sem coordenadas, a clínica não aparece no mapa do site.</span></div>
          </div>
          <div class="field"><span class="label">Agenda da Rebeca nesta clínica</span><div class="agenda-ed">${DIAS.map((d) => { const x = (l.dias || []).find((y) => y.d === d); return `<label class="field"><span class="small">${RF.diasSemana[d]}</span><select class="input" data-change="loc-dia" data-i="${i}" data-d="${d}"><option value="">—</option>${TURNOS.map((t) => `<option ${x && x.turno === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`; }).join('')}</div></div>
        </div>`; }).join('')}</div>
        <div class="row" style="justify-content:space-between;margin-top:16px"><button type="button" class="btn btn-ghost" data-act="loc-add">${ic('plus')} Adicionar clínica</button>
          <div class="row"><button type="button" class="btn btn-ghost" data-act="loc-desfazer">Desfazer alterações</button><button type="button" class="btn btn-primary" data-act="loc-salvar">${ic('check')} Salvar clínicas</button></div></div>`;
    },
    avisoConflito(i, d, turno, c) {
      const l = G.locsEd[i];
      UI.modal(`<div class="modal-head"><div><div class="eyebrow">Agenda em conflito</div><h2>${esc(RF.diasSemana[d])} · ${esc(turnoTxt(turno))}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
        <p>Esse horário já está na agenda da <b>${esc(nomeCurto(c.l))}</b>${c.l.cidade ? ` (${esc(c.l.cidade)})` : ''}: ${esc(RF.diasSemana[d].toLowerCase())}, ${esc(turnoTxt(c.turno))}.</p>
        <p class="muted" style="margin-top:8px">A Rebeca não pode atender em dois lugares ao mesmo tempo. Para marcar esse horário na ${esc(nomeCurto(l))}, primeiro altere ou retire a agenda da ${esc(nomeCurto(c.l))}.</p>
        <div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-ghost" data-act="fechar">Entendi</button><button class="btn btn-primary" data-act="loc-ir" data-i="${c.k}">Ir para a ${esc(nomeCurto(c.l))}</button></div>`);
    }
  };

  Acoes['loc-campo'] = (el) => { const l = C.ed()[+el.dataset.i]; if (l) l[el.dataset.k] = el.value; };
  Acoes['loc-dia'] = (s) => {
    const locs = C.ed(); const i = +s.dataset.i, d = +s.dataset.d; const l = locs[i]; const atual = (l.dias || []).find((y) => y.d === d);
    if (s.value) { const tentou = s.value; const c = C.conflito(locs, i, d, tentou); if (c) { s.value = atual ? atual.turno : ''; C.avisoConflito(i, d, tentou, c); return; } }
    l.dias = (l.dias || []).filter((y) => y.d !== d); if (s.value) l.dias.push({ d, turno: s.value }); l.dias.sort((a, b) => a.d - b.d);
  };
  Acoes['loc-ir'] = (b) => { UI.fechar(); const el = document.getElementById('loc-' + b.dataset.i); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('pisca'); setTimeout(() => el.classList.remove('pisca'), 1600); } };
  Acoes['loc-add'] = () => { const locs = C.ed(); locs.push({ id: 'loc-' + uid(), nome: '', cidade: '', endereco: '', whatsapp: '', tel: '', email: '', maps: '', lat: null, lng: null, dias: [], nova: true, _coords: '' }); App.render(); App.apos(() => { const el = document.getElementById('lc-nome-' + (locs.length - 1)); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }); };
  Acoes['loc-del'] = async (b) => {
    const locs = C.ed(); const i = +b.dataset.i; const l = locs[i]; const n = Dados.lista('pacientes').filter((p) => p.local === l.id).length;
    if (n) { UI.modal(`<div class="modal-head"><h2>Não dá para remover agora</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div><p>${n} paciente${n > 1 ? 's estão ligados' : ' está ligado'} à ${esc(nomeCurto(l))}. Mude o local de atendimento ${n > 1 ? 'deles' : 'dele'} no cadastro antes de remover a clínica.</p><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-primary" data-act="fechar">Entendi</button></div>`); return; }
    if (locs.length < 2) { UI.toast('O site precisa de pelo menos uma clínica.', 'bad'); return; }
    if (!(await UI.confirmar('Remover clínica?', `${nomeCurto(l)} sai do site quando você salvar.`, 'Remover'))) return;
    locs.splice(i, 1); App.render();
  };
  Acoes['loc-desfazer'] = () => { G.locsEd = null; App.render(); UI.toast('Alterações desfeitas.'); };
  Acoes['loc-salvar'] = async () => {
    const locs = C.ed(); const erros = [];
    locs.forEach((l) => {
      const nome = nomeCurto(l);
      if (!String(l.nome || '').trim()) erros.push('Uma clínica está sem nome.');
      if (!String(l.cidade || '').trim()) erros.push(`${nome}: informe a cidade.`);
      if (!String(l.endereco || '').trim()) erros.push(`${nome}: informe o endereço.`);
      if (l.email && !Valida.email(String(l.email).trim())) erros.push(`${nome}: e-mail inválido.`);
      const w = so(l.whatsapp || ''); if (w && (w.length < 10 || w.length > 13)) erros.push(`${nome}: WhatsApp inválido.`);
      if (l._coords && !C.coords(l._coords)) erros.push(`${nome}: coordenadas no formato -12.2667, -38.9667.`);
      if (!(l.dias || []).length) erros.push(`${nome}: marque pelo menos um dia de atendimento.`);
    });
    const cf = C.conflitos(locs);
    cf.forEach((x) => erros.push(`${RF.diasSemana[x.d]} (${turnoTxt(x.ta)}) está na ${nomeCurto(x.a)} e na ${nomeCurto(x.b)}.`));
    if (erros.length) { UI.modal(`<div class="modal-head"><h2>Revise antes de salvar</h2><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div><ul class="exc-lista">${erros.map((e) => `<li>${esc(e)}</li>`).join('')}</ul><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn btn-primary" data-act="fechar">Entendi</button></div>`); return; }
    const semMapa = [];
    const limpo = locs.map((l) => {
      const c = C.coords(l._coords, l.maps); const { _coords, nova, ...resto } = l;
      const out = { ...resto, nome: l.nome.trim(), cidade: l.cidade.trim(), endereco: l.endereco.trim(), email: String(l.email || '').trim(), whatsapp: l.whatsapp ? Whats.numero(l.whatsapp) : '', tel: String(l.tel || '').trim(), maps: String(l.maps || '').trim(), lat: c ? c[0] : (Number.isFinite(l.lat) ? l.lat : null), lng: c ? c[1] : (Number.isFinite(l.lng) ? l.lng : null) };
      if (!Number.isFinite(out.lat)) semMapa.push(out.nome);
      return out;
    });
    await Dados.salvar('config', 'site', { ...Dados.config(), locais: limpo });
    G.locsEd = null; App.render();
    UI.toast(`Clínicas salvas. O site já mostra as mudanças.${semMapa.length ? ` Sem coordenadas, fora do mapa: ${semMapa.join(', ')}.` : ''}`);
  };

  /* Contatos do site (WhatsApp, e-mail, redes) */
  RF.marcaBase = { ...RF.marca };
  RF.aplicarMarca = function () {
    const m = Dados.config().marca || {};
    Object.assign(RF.marca, RF.marcaBase, Object.fromEntries(Object.entries(m).filter(([, v]) => v)));
    if (m.whatsapp) RF.marca.whatsappTexto = fmt.tel(m.whatsapp);
  };
  C.cfgContatos = function () {
    const M = RF.marca;
    return `<div class="panel stack"><h3>Contatos que aparecem no site</h3>
      <div class="grid-form">
        <div class="field"><label for="ct-wa">WhatsApp principal</label><input class="input" id="ct-wa" inputmode="tel" value="${esc(fmt.tel(M.whatsapp))}"></div>
        <div class="field"><label for="ct-em">E-mail</label><input class="input" id="ct-em" inputmode="email" value="${esc(M.email)}"></div>
        <div class="field"><label for="ct-ig">Instagram (sem @)</label><input class="input" id="ct-ig" value="${esc(M.instagram)}"></div>
        <div class="field"><label for="ct-tt">TikTok (sem @)</label><input class="input" id="ct-tt" value="${esc(M.tiktok)}"></div>
        <div class="field full"><label for="ct-msg">Mensagem padrão do botão “Agendar pelo WhatsApp”</label><textarea class="input" id="ct-msg" rows="2">${esc(M.msgAgenda)}</textarea></div>
      </div>
      <div class="row" style="justify-content:flex-end"><button type="button" class="btn btn-primary" data-act="salvar-contatos">Salvar contatos</button></div></div>`;
  };
  Acoes['salvar-contatos'] = async () => {
    const v = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const w = so(v('ct-wa')); if (w.length < 10 || w.length > 13) { UI.toast('WhatsApp inválido. Use DDD + número.', 'bad'); return; }
    if (!Valida.email(v('ct-em'))) { UI.toast('E-mail inválido.', 'bad'); return; }
    const marca = { whatsapp: Whats.numero(w), email: v('ct-em'), instagram: v('ct-ig').replace(/^@/, ''), tiktok: v('ct-tt').replace(/^@/, ''), msgAgenda: v('ct-msg') || RF.marcaBase.msgAgenda };
    await Dados.salvar('config', 'site', { ...Dados.config(), marca }); RF.aplicarMarca(); App.render(); UI.toast('Contatos salvos. O site já mostra as mudanças.');
  };
})();
