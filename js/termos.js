/* Termos LGPD e TCLE: textos vigentes, aceite, assinatura eletrônica e PDF */
(function () {
  const T = RF.Termos = {
    atual(tipo) { const c = (Dados.config().termos || {})[tipo]; return c && c.secoes && c.secoes.length ? c : RF.termos[tipo]; },
    preencher(txt, v = {}) { return String(txt).replace(/\{(\w+)\}/g, (_, k) => v[k] || '________'); },
    secoes(tipo, v) { return T.atual(tipo).secoes.map(([t, x]) => [t, T.preencher(x, v)]); },
    html(tipo, v) { return T.secoes(tipo, v).map(([t, x]) => `<h4>${esc(t)}</h4><p>${esc(x)}</p>`).join(''); },
    lgpdOk(r) { return !!(r && r.lgpd && r.lgpd.versao === T.atual('lgpd').versao); },
    tcle(r, pid) { return r && r.tcle ? r.tcle[pid] || null : null; },
    tclePendentes(r) { return (r.pacientes || []).filter((pid) => { const p = Dados.get('pacientes', pid); return p && p.ativo !== false && !T.tcle(r, pid); }); },
    imagemPaciente(p) {
      const rs = (p.responsaveis || []).map((id) => Dados.get('responsaveis', id)).filter(Boolean);
      const resp = rs.map((r) => T.tcle(r, p.id)).filter(Boolean).filter((x) => !x.revogadoEm);
      const revog = rs.map((r) => T.tcle(r, p.id)).filter((x) => x && x.revogadoEm);
      if (resp.some((x) => x.resposta === 'nao') || (revog.length && !resp.some((x) => x.resposta === 'sim'))) return { st: 'negado', txt: 'Imagem não autorizada', cls: 'bad' };
      if (resp.some((x) => x.resposta === 'sim')) return { st: 'autorizado', txt: 'Imagem autorizada', cls: 'ok' };
      return { st: 'pendente', txt: 'Imagem: aguardando resposta', cls: 'warn' };
    },
    async pdfLGPD(r) {
      const t = T.atual('lgpd'); const reg = r.lgpd ? [['Responsável', r.nome], ['Documento', `${r.docTipo} ${r.docNumero}`], ['Usuário', r.usuario], ['Versão do termo', t.versao], ['Aceito em', fmt.dataHora(r.lgpd.em)], ['Código de verificação', (r.lgpd.hash || '').slice(0, 24)]] : [['Situação', 'Ainda não aceito']];
      await PDF.salvarTermo({ titulo: t.titulo, secoes: T.secoes('lgpd'), registro: reg, nomeArquivo: `Termo-LGPD_${semAcento(r.nome.split(' ')[0])}.pdf` });
    },
    async pdfTCLE(r, pid) {
      const p = Dados.get('pacientes', pid); const t = T.atual('tcle'); const x = T.tcle(r, pid) || {};
      const v = { responsavel: x.nome || r.nome, documento: x.documento || `${r.docTipo} ${r.docNumero}`, crianca: p ? p.nome : '' };
      const reg = x.resposta ? [['Resposta', x.resposta === 'sim' ? 'AUTORIZO o uso de imagem, vídeo e voz' : 'NÃO AUTORIZO o uso de imagem, vídeo e voz'], ['Criança', v.crianca], ['Responsável', v.responsavel], ['Documento', v.documento], ['Versão do termo', x.versao || t.versao], ['Registrado em', fmt.dataHora(x.em)], ...(x.revogadoEm ? [['Revogado em', fmt.dataHora(x.revogadoEm)]] : []), ['Código de verificação', (x.hash || '').slice(0, 24)]] : [['Situação', 'Aguardando resposta']];
      await PDF.salvarTermo({ titulo: t.titulo, secoes: T.secoes('tcle', v), registro: reg, assinatura: x.resposta === 'sim' ? x.assinatura : '', nomeArquivo: `TCLE-imagem_${semAcento((p ? p.nome : 'crianca').split(' ')[0])}.pdf` });
    },
    /* Área de assinatura com dedo, caneta ou mouse */
    pad(id) { return `<div class="assina"><canvas id="${id}" width="600" height="190" aria-label="Área para assinatura"></canvas><div class="row between"><span class="small muted">Assine com o dedo ou o mouse</span><button type="button" class="btn btn-ghost btn-xs" data-act="pad-limpar" data-id="${id}">Limpar</button></div></div>`; },
    iniciarPad(id) {
      const cv = document.getElementById(id); if (!cv) return; const g = cv.getContext('2d'); g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#2f2a25';
      cv.dataset.vazio = '1'; let desenhando = false, ult = null;
      const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)]; };
      cv.addEventListener('pointerdown', (e) => { desenhando = true; ult = pt(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); });
      cv.addEventListener('pointermove', (e) => { if (!desenhando) return; const p = pt(e); g.beginPath(); g.moveTo(ult[0], ult[1]); g.lineTo(p[0], p[1]); g.stroke(); ult = p; cv.dataset.vazio = ''; e.preventDefault(); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => cv.addEventListener(ev, () => { desenhando = false; }));
    },
    lerPad(id) { const cv = document.getElementById(id); return cv && !cv.dataset.vazio ? cv.toDataURL('image/png') : ''; }
  };
  Acoes['pad-limpar'] = (b) => { const cv = document.getElementById(b.dataset.id); if (!cv) return; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); cv.dataset.vazio = '1'; };
})();
