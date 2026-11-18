/* Ciclo do paciente: finalizar com motivo, relatório de alta, inativos, reativar e exclusão com prazo e vínculos */
(function () {
  const H = () => RF.G;
  const G = App.sub.g;
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hoje = () => ymd(new Date());
  const quem = () => (App.sessao.gestao || {}).nome || '';
  const primeiro = (n) => String(n || '').split(' ')[0];
  const iniciais = (n) => String(n || '').split(/\s+/).filter(Boolean).map((x) => x[0].toUpperCase() + '.').join(' ');

  const C = RF.Ciclo = {
    meses() { return Math.max(RF.ciclo.mesesExclusao, +((Dados.config().ciclo || {}).mesesExclusao) || RF.ciclo.mesesExclusao); },
    tituloAlta(m) { return m === 'Alta fonoaudiológica' ? 'Relatório de alta fonoaudiológica' : 'Relatório de encerramento do acompanhamento'; },
    tituloPadrao(t) { return t === 'Relatório de alta fonoaudiológica' || t === 'Relatório de encerramento do acompanhamento'; },
    relsDe(pid) { return Dados.lista('relatorios').filter((r) => r.pacienteId === pid); },
    /* Prazo de exclusão: conta do relatório de alta ou do último relatório emitido (o mais recente) */
    base(p) {
      const datas = C.relsDe(p.id).filter((r) => r.status === 'publicado').map((r) => String(r.publicadoEm || r.data || '').slice(0, 10)).filter(Boolean);
      if (!datas.length && p.ciclo && p.ciclo.finalizadoEm) datas.push(p.ciclo.finalizadoEm.slice(0, 10));
      if (!datas.length && p.inativoEm) datas.push(String(p.inativoEm).slice(0, 10));
      return datas.sort().pop() || hoje();
    },
    prazo(p) { const b = C.base(p); const d = new Date(b + 'T12:00:00'); d.setMonth(d.getMonth() + C.meses()); const lib = ymd(d); return { base: b, data: lib, liberado: hoje() >= lib }; },

    /* ---------- Ficha ---------- */
    botoesFicha(p) {
      if (p.ativo === false) return `<button class="btn btn-ghost btn-sm" data-act="ciclo-reativar" data-id="${p.id}">${ic('refresh')} Reativar</button>`;
      if (p.ciclo && p.ciclo.status === 'encerrando') return '';
      return `<button class="btn btn-ghost btn-sm" data-act="ciclo-abrir" data-id="${p.id}">${ic('flag')} Finalizar ciclo</button>`;
    },
    banner(p) {
      const c = p.ciclo || {};
      if (p.ativo === false) {
        const pr = C.prazo(p);
        return `<div class="ciclo-aviso inativo"><div class="grow"><div><b>${ic('flag')} Ciclo finalizado${c.finalizadoEm ? ` em ${fmt.data(c.data || c.finalizadoEm)}` : ''}</b>${c.motivo ? ` · ${esc(c.motivo)}` : ''}</div>
          <p class="small">Paciente inativo. Os responsáveis continuam com acesso ao portal.</p>
          <p class="small muted">${pr.liberado ? `Exclusão liberada: já se passaram ${C.meses()} meses do último relatório emitido (${fmt.data(pr.base)}).` : `Exclusão liberada a partir de <b>${fmt.data(pr.data)}</b>, ${C.meses()} meses após o último relatório emitido (${fmt.data(pr.base)}).`}</p></div>
          <div class="row">${c.relatorioId && Dados.get('relatorios', c.relatorioId) ? `<button class="btn btn-ghost btn-sm" data-act="abrir-relatorio" data-id="${c.relatorioId}">${ic('file')} Relatório de alta</button>` : ''}<button class="btn btn-danger btn-sm" data-act="pac-excluir" data-id="${p.id}" ${pr.liberado ? '' : 'disabled'}>${ic('trash')} Excluir paciente</button></div></div>`;
      }
      if (c.status === 'encerrando') return `<div class="ciclo-aviso"><div class="grow"><div><b>${ic('flag')} Ciclo em finalização</b> · ${esc(c.motivo || '')}</div><p class="small">Falta publicar o relatório de alta. Ao publicar, ${esc(primeiro(p.nome))} passa para inativos.</p></div>
        <div class="row"><button class="btn btn-primary btn-sm" data-act="ciclo-continuar" data-id="${p.id}">${ic('file')} Continuar relatório de alta</button><button class="btn btn-ghost btn-sm" data-act="ciclo-cancelar" data-id="${p.id}">Cancelar finalização</button></div></div>`;
      return '';
    },

    /* ---------- Lista de pacientes ---------- */
    abas() {
      const ps = Dados.lista('pacientes'); const ina = ps.filter((p) => p.ativo === false).length; const f = G.pacFiltro || 'ativos';
      return `<div class="subtabs" style="margin-bottom:14px"><button class="subtab" aria-selected="${f === 'ativos'}" data-act="pac-filtro" data-f="ativos">Ativos · ${ps.length - ina}</button><button class="subtab" aria-selected="${f === 'inativos'}" data-act="pac-filtro" data-f="inativos">Inativos · ${ina}</button></div>`;
    },
    tabelaInativos() {
      const ps = Dados.lista('pacientes').filter((p) => p.ativo === false).sort((a, b) => a.nome.localeCompare(b.nome));
      if (!ps.length) return `<div class="panel"><div class="empty">${ic('flag')}<div>Nenhum paciente inativo. Quando um ciclo é finalizado, o paciente aparece aqui.</div></div></div>`;
      return `<div class="panel"><p class="small muted" style="margin-bottom:10px">Pacientes com ciclo finalizado. A exclusão fica liberada ${C.meses()} meses após o relatório de alta ou o último relatório emitido.</p><div class="table-wrap"><table class="t"><thead><tr><th>Paciente</th><th>Motivo</th><th>Fim do ciclo</th><th>Último relatório</th><th>Exclusão</th><th></th></tr></thead><tbody>
        ${ps.map((p) => { const c = p.ciclo || {}; const pr = C.prazo(p); return `<tr><td><div class="row" style="flex-wrap:nowrap">${UI.avatar(p)}<b>${esc(p.nome)}</b>${H().exTag(p)}</div></td><td>${esc(c.motivo || 'Arquivado')}</td><td class="tnum">${fmt.data(c.data || c.finalizadoEm || p.inativoEm || '')}</td><td class="tnum">${fmt.data(pr.base)}</td><td>${pr.liberado ? '<span class="pill ok">Liberada</span>' : `<span class="pill">a partir de ${fmt.data(pr.data)}</span>`}</td>
          <td><div class="row" style="flex-wrap:nowrap;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-act="abrir-ficha" data-id="${p.id}">Ficha</button><button class="btn btn-danger btn-sm" data-act="pac-excluir" data-id="${p.id}" ${pr.liberado ? '' : 'disabled'} aria-label="Excluir ${esc(p.nome)}">${ic('trash')}</button></div></td></tr>`; }).join('')}
      </tbody></table></div></div>`;
    },

    /* ---------- Relatório de alta ---------- */
    prepararAlta(rel) {
      const p = H().pac(rel.pacienteId); const c = (p && p.ciclo) || {};
      rel.alta = rel.alta || { motivo: c.motivo || 'Alta fonoaudiológica', data: c.data || hoje() };
      if (!rel.titulo || C.tituloPadrao(rel.titulo) || rel.titulo === RF.tiposRelatorio.alta.nome) rel.titulo = C.tituloAlta(rel.alta.motivo);
      const per = (rel.secoes || []).find((x) => x.titulo === 'Período de acompanhamento');
      if (per && !per.texto && p && p.criadoEm) per.texto = `Acompanhamento fonoaudiológico de ${fmt.data(String(p.criadoEm).slice(0, 10))} a ${fmt.data(rel.alta.data)}, na ${H().nomeLocal(p.local)}.`;
      return rel;
    },
    blocoEditor(r) {
      if (r.tipo !== 'alta') return '';
      const a = r.alta || {}; const p = H().pac(r.pacienteId); const fin = p && p.ativo === false;
      return `<div class="ciclo-aviso col"><div class="row between"><b>${ic('flag')} Fim do ciclo</b>${fin ? '<span class="pill">Paciente inativo</span>' : '<span class="pill warn">Ao publicar, o paciente fica inativo</span>'}</div>
        <div class="field"><span class="label">Motivo *</span><div class="row" role="radiogroup" aria-label="Motivo do fim do ciclo">${Rel.motivos().map((m) => `<button type="button" class="chip" role="radio" aria-checked="${a.motivo === m}" aria-pressed="${a.motivo === m}" data-act="rel-alta-motivo" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
          <div class="row" style="margin-top:6px"><input class="input" id="re-alta-outro" placeholder="Outro motivo" style="max-width:260px"><button type="button" class="btn btn-ghost btn-sm" data-act="rel-alta-novo">${ic('plus')} Cadastrar</button></div></div>
        <div class="field" style="max-width:240px"><label for="re-alta-data">Data do encerramento</label><input class="input" type="date" id="re-alta-data" data-input="rel-alta-data" value="${esc(a.data || '')}"></div>
        <p class="small muted">Os responsáveis continuam com acesso ao portal e recebem este relatório.</p></div>`;
    },
    async publicarAlta() {
      const r = G.rel; const p = H().pac(r.pacienteId);
      if (!p) { UI.toast('Escolha o paciente.', 'bad'); return; }
      if (!r.alta || !r.alta.motivo) { UI.toast('Escolha o motivo do fim do ciclo.', 'bad'); return; }
      const jaFinal = p.ativo === false;
      if (!jaFinal && !(await UI.confirmar('Publicar e finalizar o ciclo?', `O relatório fica disponível no portal e ${p.nome} passa para inativos. Os responsáveis continuam com acesso ao sistema.`, 'Publicar e finalizar'))) return;
      const s = await H().salvarRel('publicado'); if (!s) return;
      await C.finalizar(p.id, s);
      App.render();
      if (!jaFinal) H().modalEnvio(s, true); else UI.toast('Relatório de alta atualizado no portal.');
    },
    async finalizar(pid, rel) {
      const p = H().pac(pid); const agora = new Date().toISOString(); const c = p.ciclo || {};
      const ciclo = { ...c, status: 'finalizado', motivo: rel.alta.motivo, data: rel.alta.data || hoje(), relatorioId: rel.id, finalizadoEm: (c.status === 'finalizado' && c.finalizadoEm) || agora, por: c.por || quem() };
      await Dados.atualizar('pacientes', pid, { ativo: false, inativoEm: p.inativoEm && p.ativo === false ? p.inativoEm : agora, ciclo });
    },

    /* ---------- Plano e execução da exclusão ---------- */
    plano(pid) {
      const p = H().pac(pid); const doPac = (col) => Dados.lista(col).filter((x) => x.pacienteId === pid);
      const ids = new Set([...(p.responsaveis || []), ...Dados.lista('responsaveis').filter((r) => (r.pacientes || []).includes(pid)).map((r) => r.id)]);
      const excluir = [], manter = [];
      ids.forEach((id) => {
        const r = Dados.get('responsaveis', id); if (!r) return;
        const outros = new Set([...(r.pacientes || []).filter((x) => x !== pid && Dados.get('pacientes', x)), ...Dados.lista('pacientes').filter((x) => x.id !== pid && (x.responsaveis || []).includes(id)).map((x) => x.id)]);
        (outros.size ? manter : excluir).push({ r, outros: [...outros].map((x) => Dados.get('pacientes', x)).filter(Boolean) });
      });
      return { p, excluir, manter, rels: doPac('relatorios'), recs: doPac('recados'), evs: doPac('evolucoes'), rcs: doPac('recursos'), conq: Dados.get('conquistas', pid) };
    },
    async excluir(pid) {
      const pl = C.plano(pid); const p = pl.p;
      for (const [col, itens] of [['relatorios', pl.rels], ['recados', pl.recs], ['evolucoes', pl.evs], ['recursos', pl.rcs]]) for (const x of itens) await Dados.remover(col, x.id);
      if (pl.conq) await Dados.remover('conquistas', pid);
      for (const { r } of pl.manter) { const tcle = { ...(r.tcle || {}) }; delete tcle[pid]; await Dados.atualizar('responsaveis', r.id, { pacientes: (r.pacientes || []).filter((x) => x !== pid), tcle }); }
      for (const { r } of pl.excluir) {
        if (Dados.modo === 'supabase') { try { await Auth.acesso('remover-acesso', 'responsavel', r.id); } catch {} } // apaga também o login
        await Dados.remover('responsaveis', r.id);
      }
      await Dados.remover('pacientes', pid);
      const c = Dados.config();
      await Dados.salvar('config', 'site', { ...c, exclusoes: [...(c.exclusoes || []), { em: new Date().toISOString(), por: quem(), paciente: iniciais(p.nome), motivo: (p.ciclo || {}).motivo || '', responsaveisExcluidos: pl.excluir.length, responsaveisMantidos: pl.manter.length }].slice(-300) });
      return pl;
    },
    /* Arquivo completo do paciente em PDF, para guardar fora do sistema antes da exclusão */
    async arquivo(pid) {
      const pl = C.plano(pid); const p = pl.p; const c = p.ciclo || {};
      const secoes = [];
      secoes.push(['Dados do paciente', [`Nome: ${p.nome}`, `Nascimento: ${fmt.data(p.nascimento)}`, `Documento: ${p.docTipo || ''} ${p.docNumero || ''}`, `Local: ${H().nomeLocal(p.local)}`, p.criadoEm ? `Cadastro no sistema: ${fmt.data(String(p.criadoEm).slice(0, 10))}` : '', p.queixa ? `Queixa: ${p.queixa}` : ''].filter(Boolean).join('\n')]);
      secoes.push(['Ciclo', [`Motivo do fim: ${c.motivo || 'não informado'}`, `Encerramento: ${fmt.data(c.data || c.finalizadoEm || p.inativoEm || '')}`, c.obs ? `Observação interna: ${c.obs}` : '', ...(p.ciclos || []).map((x, i) => `Ciclo anterior ${i + 1}: ${x.motivo || ''} em ${fmt.data(x.data || x.finalizadoEm || '')}`)].filter(Boolean).join('\n')]);
      const rs = [...pl.excluir, ...pl.manter].map((x) => x.r);
      if (rs.length) secoes.push(['Responsáveis', rs.map((r) => { const t = (r.tcle || {})[pid]; return [`${r.nome} (${r.parentesco || 'responsável'})`, `Documento: ${r.docTipo || ''} ${r.docNumero || ''}`, r.whatsapp ? `WhatsApp: ${fmt.tel ? fmt.tel(r.whatsapp) : r.whatsapp}` : '', r.email ? `E-mail: ${r.email}` : '', r.lgpd ? `Termo LGPD aceito em ${fmt.dataHora(r.lgpd.em)} (versão ${r.lgpd.versao})` : 'Termo LGPD: não aceito', t ? `TCLE de imagem: ${t.resposta === 'sim' ? 'autorizou' : 'não autorizou'} em ${fmt.dataHora(t.em)}${t.revogadoEm ? `, revogado em ${fmt.dataHora(t.revogadoEm)}` : ''}` : 'TCLE de imagem: sem resposta'].filter(Boolean).join('\n'); }).join('\n\n')]);
      pl.rels.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).forEach((r) => secoes.push([`Relatório · ${fmt.data(r.data)} · ${r.titulo}${r.status === 'publicado' ? '' : ' (rascunho)'}`, Rel.secoes(r).map((s) => `${s.titulo}\n${s.texto}`).join('\n\n') || '(sem conteúdo)']));
      if (pl.evs.length) secoes.push(['Evoluções (registro interno)', pl.evs.slice().sort((a, b) => String(a.data).localeCompare(String(b.data))).map((e) => H().textoEvolucao(e)).join('\n\n— — —\n\n')]);
      if (pl.recs.length) secoes.push(['Recados enviados aos responsáveis', pl.recs.slice().sort((a, b) => String(a.enviadoEm || a.criadoEm).localeCompare(String(b.enviadoEm || b.criadoEm))).map((x) => `${fmt.dataHora(x.enviadoEm || x.criadoEm)}: ${x.texto}`).join('\n\n')]);
      await PDF.salvarTermo({ titulo: `Arquivo do paciente · ${p.nome}`, secoes, registro: [['Gerado em', fmt.dataHora(new Date().toISOString())], ['Gerado por', quem() || 'equipe'], ['Finalidade', 'Guarda do registro fonoaudiológico fora do sistema']], nomeArquivo: `Arquivo-paciente_${semAcento(p.nome).replace(/[^A-Za-z0-9]+/g, '-')}.pdf` });
    },

    /* ---------- Configurações ---------- */
    cfg() {
      const c = Dados.config(); const extras = (c.motivosFim || []); const exc = (c.exclusoes || []).slice().reverse();
      return `<div class="cols-2" style="margin-top:16px"><div class="panel stack"><h3>Motivos de fim de ciclo</h3><p class="small muted">Aparecem ao finalizar o ciclo e no relatório de alta. Os quatro primeiros são fixos.</p>
          <div class="row">${RF.motivosFim.map((m) => `<span class="pill sage">${esc(m)}</span>`).join('')}${extras.map((m, i) => `<span class="pill terra">${esc(m)} <button class="linkbtn" data-act="cfg-motivo-del" data-i="${i}" aria-label="Remover ${esc(m)}">${ic('x')}</button></span>`).join('')}</div>
          <div class="row"><input class="input" id="cfg-motivo-novo" placeholder="Novo motivo" style="max-width:280px"><button class="btn btn-ghost btn-sm" data-act="cfg-motivo-add">${ic('plus')} Cadastrar</button></div></div>
        <div class="panel stack"><h3>Exclusão de pacientes inativos</h3>
          <div class="field"><label for="cfg-meses">Prazo mínimo após o relatório de alta ou o último relatório emitido (meses)</label><input class="input" type="number" min="${RF.ciclo.mesesExclusao}" step="1" id="cfg-meses" value="${C.meses()}" style="max-width:120px"><span class="hint">Mínimo de ${RF.ciclo.mesesExclusao} meses.</span></div>
          <div class="note warn">${ic('info')}<div>A Resolução CFFa nº 777/2025 pede a guarda do registro fonoaudiológico por <b>20 anos após o último registro</b>. Antes de excluir, o sistema gera o arquivo completo do paciente em PDF para ser guardado fora daqui. Se o prontuário oficial já estiver no sistema da clínica, ele cumpre esse papel.</div></div>
          <div class="row"><button class="btn btn-primary btn-sm" data-act="cfg-ciclo-salvar">${ic('check')} Salvar prazo</button></div>
          <h4 style="margin-top:8px">Registro de exclusões</h4>${exc.length ? `<div class="list">${exc.slice(0, 30).map((x) => `<div class="li"><div class="grow"><div class="t">Paciente ${esc(x.paciente)}${x.motivo ? ` · ${esc(x.motivo)}` : ''}</div><div class="s">${fmt.dataHora(x.em)} · por ${esc(x.por || '—')} · ${x.responsaveisExcluidos} acesso(s) de responsável excluído(s), ${x.responsaveisMantidos} mantido(s)</div></div></div>`).join('')}</div>` : '<p class="small muted">Nenhuma exclusão feita.</p>'}
          <p class="small muted">O registro guarda só as iniciais, para comprovar a exclusão sem manter dados do paciente.</p></div></div>`;
    }
  };

  /* ---------- Modal: finalizar ciclo ---------- */
  function htmlFinalizar() {
    const s = G.ciclo; const p = H().pac(s.pid);
    return `<div class="modal-head"><div><div class="eyebrow">Finalizar ciclo</div><h2>${esc(p.nome)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="stack">
        <div class="field"><span class="label">Motivo do fim do ciclo *</span><div class="row" role="radiogroup" aria-label="Motivo">${Rel.motivos().map((m) => `<button type="button" class="chip" role="radio" aria-checked="${s.motivo === m}" aria-pressed="${s.motivo === m}" data-act="ciclo-motivo" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
          <div class="row" style="margin-top:8px"><input class="input" id="ciclo-outro" placeholder="Outro motivo" style="max-width:280px"><button type="button" class="btn btn-ghost btn-sm" data-act="ciclo-motivo-novo">${ic('plus')} Cadastrar</button></div></div>
        <div class="field" style="max-width:240px"><label for="ciclo-data">Data do encerramento</label><input class="input" type="date" id="ciclo-data" value="${esc(s.data)}"></div>
        <div class="field"><label for="ciclo-obs">Observação interna (opcional)</label><textarea class="input" id="ciclo-obs" rows="2" placeholder="Não aparece para os pais">${esc(s.obs)}</textarea></div>
        <div class="note">${ic('info')}<div>Em seguida abre o <b>relatório de alta fonoaudiológica</b>. Quando você publicar, ${esc(primeiro(p.nome))} passa para <b>inativos</b> e os responsáveis continuam com acesso ao portal, onde recebem o relatório.</div></div>
        <div class="err" id="ciclo-err" role="alert"></div>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-act="fechar">Cancelar</button><button class="btn btn-primary" data-act="ciclo-confirmar">${ic('file')} Finalizar e gerar relatório de alta</button></div>
      </div>`;
  }
  function redesenharModal(html) { const s = G.ciclo; if (s) { s.data = val('ciclo-data') || s.data; s.obs = val('ciclo-obs'); } const m = $('#modal .modal'); if (m) m.innerHTML = html(); }
  async function cadastrarMotivo(v) {
    v = String(v || '').trim(); if (!v) { UI.toast('Escreva o motivo.', 'bad'); return ''; }
    if (!Rel.motivos().some((m) => semAcento(m.toLowerCase()) === semAcento(v.toLowerCase()))) { const c = Dados.config(); await Dados.salvar('config', 'site', { ...c, motivosFim: [...(c.motivosFim || []), v] }); UI.toast('Motivo cadastrado.'); }
    return Rel.motivos().find((m) => semAcento(m.toLowerCase()) === semAcento(v.toLowerCase())) || v;
  }

  Acoes['ciclo-abrir'] = (b) => { const p = H().pac(b.dataset.id); if (!p) return; G.ciclo = { pid: p.id, motivo: '', data: hoje(), obs: '' }; UI.modal(htmlFinalizar()); };
  Acoes['ciclo-motivo'] = (b) => { G.ciclo.motivo = b.dataset.v; redesenharModal(htmlFinalizar); };
  Acoes['ciclo-motivo-novo'] = async () => { const v = await cadastrarMotivo(val('ciclo-outro')); if (!v) return; G.ciclo.motivo = v; redesenharModal(htmlFinalizar); };
  Acoes['ciclo-confirmar'] = async () => {
    const s = G.ciclo; s.data = val('ciclo-data') || hoje(); s.obs = val('ciclo-obs').trim();
    if (!s.motivo) { $('#ciclo-err').textContent = 'Escolha o motivo do fim do ciclo.'; return; }
    const p = H().pac(s.pid);
    await Dados.atualizar('pacientes', p.id, { ciclo: { ...(p.ciclo || {}), status: 'encerrando', motivo: s.motivo, data: s.data, obs: s.obs, iniciadoEm: new Date().toISOString(), por: quem() } });
    UI.fechar(); await abrirRelatorioAlta(p.id);
    UI.toast('Ciclo em finalização. Revise o relatório de alta e publique para concluir.');
  };
  async function abrirRelatorioAlta(pid) {
    const p = H().pac(pid); const c = p.ciclo || {}; const alta = { motivo: c.motivo || 'Alta fonoaudiológica', data: c.data || hoje() };
    const exist = c.relatorioId && Dados.get('relatorios', c.relatorioId);
    if (exist && exist.status !== 'publicado') { G.rel = JSON.parse(JSON.stringify(exist)); G.rel.alta = alta; if (C.tituloPadrao(G.rel.titulo)) G.rel.titulo = C.tituloAlta(alta.motivo); }
    else {
      G.rel = { id: '', pacienteId: pid, tipo: 'alta', titulo: C.tituloAlta(alta.motivo), data: hoje(), status: 'rascunho', alta, secoes: RF.tiposRelatorio.alta.secoes.map((t) => ({ titulo: t, texto: '' })) };
      H().preencherIdent(); C.prepararAlta(G.rel);
      const salvo = await H().salvarRel(); if (salvo) await Dados.atualizar('pacientes', pid, { ciclo: { ...(H().pac(pid).ciclo || {}), relatorioId: salvo.id } });
    }
    G.sec = 'rel-editor'; App.render(); window.scrollTo(0, 0);
  }
  Acoes['ciclo-continuar'] = (b) => abrirRelatorioAlta(b.dataset.id);
  Acoes['ciclo-cancelar'] = async (b) => {
    const p = H().pac(b.dataset.id); if (!p) return; const c = p.ciclo || {};
    if (!(await UI.confirmar('Cancelar a finalização?', `${p.nome} continua ativo. O rascunho do relatório de alta será apagado.`, 'Cancelar finalização'))) return;
    const r = c.relatorioId && Dados.get('relatorios', c.relatorioId); if (r && r.status !== 'publicado') await Dados.remover('relatorios', r.id);
    await Dados.atualizar('pacientes', p.id, { ciclo: null }); App.render(); UI.toast('Finalização cancelada.');
  };
  Acoes['ciclo-reativar'] = async (b) => {
    const p = H().pac(b.dataset.id); if (!p) return;
    if (!(await UI.confirmar('Reativar paciente?', `${p.nome} volta para a lista de ativos em um novo ciclo. O ciclo anterior fica no histórico.`, 'Reativar'))) return;
    await Dados.atualizar('pacientes', p.id, { ativo: true, inativoEm: null, ciclo: null, ciclos: [...(p.ciclos || []), ...(p.ciclo ? [p.ciclo] : [])] });
    App.render(); UI.toast('Paciente reativado.');
  };
  Acoes['pac-filtro'] = (b) => { G.pacFiltro = b.dataset.f; App.render(); };

  /* No editor de relatório (tipo Alta) */
  Acoes['rel-alta-motivo'] = (b) => { G.rel.alta = { ...(G.rel.alta || {}), motivo: b.dataset.v }; if (C.tituloPadrao(G.rel.titulo)) G.rel.titulo = C.tituloAlta(b.dataset.v); App.render(); };
  Acoes['rel-alta-novo'] = async () => { const v = await cadastrarMotivo(val('re-alta-outro')); if (!v) return; G.rel.alta = { ...(G.rel.alta || {}), motivo: v }; if (C.tituloPadrao(G.rel.titulo)) G.rel.titulo = C.tituloAlta(v); App.render(); };
  Acoes['rel-alta-data'] = (i) => { G.rel.alta = { ...(G.rel.alta || {}), data: i.value }; H().atualizarPrev(); };

  /* ---------- Modal: excluir paciente ---------- */
  Acoes['pac-excluir'] = (b) => {
    const p = H().pac(b.dataset.id); if (!p) return; if (p.ativo !== false) { UI.toast('Só é possível excluir pacientes com o ciclo finalizado.', 'bad'); return; }
    const pr = C.prazo(p); if (!pr.liberado) { UI.toast(`A exclusão fica liberada a partir de ${fmt.data(pr.data)}.`, 'bad'); return; }
    const pl = C.plano(p.id); const n = (x, s, pl2) => `${x} ${x === 1 ? s : pl2}`;
    UI.modal(`<div class="modal-head"><div><div class="eyebrow">Excluir paciente</div><h2>${esc(p.nome)}</h2></div><button class="btn btn-ghost btn-icon" data-act="fechar" aria-label="Fechar">${ic('x')}</button></div>
      <div class="stack">
        <p>Esta ação apaga definitivamente do sistema:</p>
        <ul class="exc-lista"><li>Cadastro de ${esc(primeiro(p.nome))}</li><li>${n(pl.rels.length, 'relatório', 'relatórios')}, ${n(pl.recs.length, 'recado', 'recados')} e ${n(pl.evs.length, 'evolução', 'evoluções')}</li><li>${n(pl.rcs.length, 'recurso liberado', 'recursos liberados')}${pl.conq ? ', estrelas e presentes' : ''}</li></ul>
        <div><span class="label">Responsáveis</span><ul class="exc-lista">${pl.excluir.map(({ r }) => `<li><b>${esc(r.nome)}</b> (${esc(r.usuario)}): acesso <b>excluído</b>, sem outro vínculo</li>`).join('')}${pl.manter.map(({ r, outros }) => `<li><b>${esc(r.nome)}</b> (${esc(r.usuario)}): acesso <b>mantido</b>, ainda vinculado a ${outros.map((o) => esc(primeiro(o.nome))).join(', ')}</li>`).join('') || ''}${!pl.excluir.length && !pl.manter.length ? '<li>Nenhum responsável vinculado.</li>' : ''}</ul></div>
        <div class="note warn">${ic('info')}<div>A Resolução CFFa nº 777/2025 pede a guarda do registro fonoaudiológico por 20 anos após o último registro. Baixe o arquivo completo e guarde-o fora do sistema, a menos que o prontuário já esteja no sistema da clínica.</div></div>
        <div class="row"><button class="btn btn-olive btn-sm" data-act="pac-arquivo" data-id="${p.id}">${ic('download')} Baixar arquivo do paciente (PDF)</button></div>
        <label class="check"><input type="checkbox" id="exc-ok"><span>Guardei o arquivo do paciente fora do sistema (ou o prontuário está no sistema da clínica) e entendo que a exclusão não pode ser desfeita.</span></label>
        <div class="field" style="max-width:280px"><label for="exc-conf">Para confirmar, digite EXCLUIR</label><input class="input" id="exc-conf" autocomplete="off"></div>
        <div class="err" id="exc-err" role="alert"></div>
        <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-act="fechar">Cancelar</button><button class="btn btn-danger" data-act="pac-excluir-ok" data-id="${p.id}">${ic('trash')} Excluir definitivamente</button></div>
      </div>`);
  };
  Acoes['pac-arquivo'] = async (b) => { b.disabled = true; try { await C.arquivo(b.dataset.id); } catch (e) { UI.toast(e.message || 'Não foi possível gerar o arquivo.', 'bad'); } b.disabled = false; };
  Acoes['pac-excluir-ok'] = async (b) => {
    const err = $('#exc-err');
    if (!$('#exc-ok').checked) { err.textContent = 'Confirme que guardou o arquivo do paciente.'; return; }
    if (val('exc-conf').trim().toUpperCase() !== 'EXCLUIR') { err.textContent = 'Digite EXCLUIR para confirmar.'; return; }
    const p = H().pac(b.dataset.id); if (!p || !C.prazo(p).liberado) { err.textContent = 'O prazo para exclusão ainda não terminou.'; return; }
    b.disabled = true; err.textContent = '';
    const pl = await C.excluir(p.id);
    UI.fechar(); G.sec = 'pacientes'; G.pacFiltro = 'inativos'; App.render();
    UI.toast(`Paciente excluído. ${pl.excluir.length ? `${pl.excluir.length} acesso(s) de responsável excluído(s). ` : ''}${pl.manter.length ? `${pl.manter.length} mantido(s) por outro vínculo.` : ''}`);
  };

  /* ---------- Configurações ---------- */
  Acoes['cfg-motivo-add'] = async () => { const v = await cadastrarMotivo(val('cfg-motivo-novo')); if (v) App.render(); };
  Acoes['cfg-motivo-del'] = async (b) => { const c = Dados.config(); const l = [...(c.motivosFim || [])]; l.splice(+b.dataset.i, 1); await Dados.salvar('config', 'site', { ...c, motivosFim: l }); App.render(); };
  Acoes['cfg-ciclo-salvar'] = async () => { const n = Math.max(RF.ciclo.mesesExclusao, Math.round(+val('cfg-meses') || RF.ciclo.mesesExclusao)); const c = Dados.config(); await Dados.salvar('config', 'site', { ...c, ciclo: { ...(c.ciclo || {}), mesesExclusao: n } }); UI.toast(`Prazo salvo: ${n} meses.`); App.render(); };
})();
