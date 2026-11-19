/* Núcleo: utilitários, validadores, segurança de senha, camada de dados, IA, PDF e roteamento. */
window.RF = window.RF || {};

/* ---------------- Utilitários ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const so = (s) => String(s || '').replace(/\D/g, '');
const semAcento = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const ls = {
  get(k, d) { try { const v = localStorage.getItem('rf:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('rf:' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('rf:' + k); } catch {} }
};
const ss = {
  get(k) { try { return JSON.parse(sessionStorage.getItem('rf:' + k) || 'null'); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem('rf:' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { sessionStorage.removeItem('rf:' + k); } catch {} }
};

const fmt = {
  data(d) { if (!d) return ''; const x = new Date(d.length === 10 ? d + 'T12:00:00' : d); return x.toLocaleDateString('pt-BR'); },
  dataHora(d) { if (!d) return ''; const x = new Date(d); return x.toLocaleDateString('pt-BR') + ' às ' + x.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); },
  dataLonga(d) { const x = new Date(d.length === 10 ? d + 'T12:00:00' : d); return x.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); },
  idade(nasc) {
    if (!nasc) return '';
    const n = new Date(nasc + 'T12:00:00'), h = new Date();
    let a = h.getFullYear() - n.getFullYear(), m = h.getMonth() - n.getMonth();
    if (h.getDate() < n.getDate()) m--;
    if (m < 0) { a--; m += 12; }
    if (a < 0) return '';
    if (a === 0) return m + (m === 1 ? ' mês' : ' meses');
    return a + (a === 1 ? ' ano' : ' anos') + (m ? ' e ' + m + (m === 1 ? ' mês' : ' meses') : '');
  },
  tel(t) { const d = so(t); if (d.length === 13) return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`; if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; if (d.length === 12) return `(${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`; if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; return t || ''; },
  iniciais(n) { return String(n || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); },
  num(n) { return Number(n || 0).toLocaleString('pt-BR'); },
  moeda(n) { return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
};

/* ---------------- Ícones (traço fino, desenhados para o sistema) ---------------- */
const ic = (name) => {
  const p = {
    whats: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.3 1.7 1.8 3.6 3.6 4.4l1.2-1.1 1.9.9c-.1 1-1 1.8-2 1.8A6 6 0 0 1 8 9.8c0-1 .8-1.9 1.8-2l.9 1.9z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="3"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9.5 13h6M9.5 17h6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    puzzle: '<path d="M9 4h3v2a2 2 0 1 0 4 0V4h4v5h-2a2 2 0 1 0 0 4h2v7h-6v-2a2 2 0 1 0-4 0v2H4v-6h2a2 2 0 1 0 0-4H4V4z"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>',
    up: '<path d="M7 11v9H4v-9z"/><path d="M7 11l4-8a2.5 2.5 0 0 1 3 2.5V9h5a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 17.7 20H7"/>',
    down: '<path d="M7 13V4H4v9z"/><path d="M7 13l4 8a2.5 2.5 0 0 0 3-2.5V15h5a2 2 0 0 0 2-2.3l-1.3-7A2 2 0 0 0 17.7 4H7"/>',
    wand: '<path d="M4 20l11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.6 1.4L21 13l-1.4.6L19 15l-.6-1.4L17 13l1.4-.6z"/><path d="M13 10l1 1"/>',
    canva: '<path d="M15.5 8.5a4.5 4.5 0 1 0 0 7" stroke-width="2.4"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    download: '<path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/>',
    upload: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M4.5 19.5h15"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    baby: '<circle cx="12" cy="11" r="7"/><path d="M9.5 10h.01M14.5 10h.01M10 14c1.2 1 2.8 1 4 0M12 4c0-1 1-1.5 2-1"/>',
    tongue: '<path d="M4 9c2 2 4.5 3 8 3s6-1 8-3"/><path d="M8.5 11.5v2.5a3.5 3.5 0 0 0 7 0v-2.5"/><path d="M12 12v3"/>',
    board: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M3.5 9.5h17M3.5 15h17M9.5 3.5v17M15 3.5v17"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    out: '<path d="M14 4h6v16h-6M10 8l-4 4 4 4M6 12h10"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    megaphone: '<path d="M3.5 10v4h3l7 4.5v-13L6.5 10z"/><path d="M17 9a3.5 3.5 0 0 1 0 6M8 14l1.3 5.5H12L11 14"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    shirt: '<path d="M8.5 3.5L4 6l1.5 4.5 2-1V20.5h9V9.5l2 1L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20v-4h-4"/>'
  }[name] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
};

/* ---------------- Validadores de documentos e contatos ---------------- */
const Valida = {
  cpf(v) {
    const c = so(v);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    const dv = (n) => { let s = 0; for (let i = 0; i < n; i++) s += +c[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    return dv(9) === +c[9] && dv(10) === +c[10];
  },
  cnh(v) {
    const c = so(v);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    // Algoritmo DETRAN clássico
    let s = 0; for (let i = 0, j = 9; i < 9; i++, j--) s += +c[i] * j;
    let dv1 = s % 11, dsc = 0; if (dv1 >= 10) { dv1 = 0; dsc = 2; }
    s = 0; for (let i = 0, j = 1; i < 9; i++, j++) s += +c[i] * j;
    const x = s % 11; const dv2 = x >= 10 ? 0 : x - dsc;
    if (`${dv1}${dv2}` === c.slice(9)) return true;
    // Variante usada em CNHs emitidas a partir de 2020
    let a = 0; for (let i = 0; i < 9; i++) a += +c[i] * (2 + i);
    let d1 = a % 11; if (d1 >= 10) d1 = 0;
    const m2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 2]; const base = c.slice(0, 9) + d1;
    let b = 0; for (let i = 0; i < 10; i++) b += +base[i] * m2[i];
    let d2 = b % 11; if (d2 >= 10) d2 = 0;
    return `${d1}${d2}` === c.slice(9);
  },
  rg(v) {
    const c = String(v || '').toUpperCase().replace(/[^0-9X]/g, '');
    if (c.length < 5 || c.length > 14) return false;
    if (/^(\d)\1+$/.test(c)) return false;
    return /^\d+X?$/.test(c);
  },
  certidao(v) {
    // Matrícula da certidão de nascimento (padrão nacional): 32 números
    const c = so(v);
    return c.length === 32 && !/^(\d)\1+$/.test(c);
  },
  passaporte(v) { return /^[A-Z]{2}\d{6}$/.test(String(v || '').toUpperCase().replace(/\s/g, '')); },
  doc(tipo, v) {
    switch (tipo) {
      case 'CPF': case 'CIN': return Valida.cpf(v);
      case 'CNH': return Valida.cnh(v);
      case 'RG': return Valida.rg(v);
      case 'Certidão de nascimento': return Valida.certidao(v);
      case 'Passaporte': return Valida.passaporte(v);
      default: return String(v || '').trim().length >= 3;
    }
  },
  msgDoc(tipo) {
    return {
      'CPF': 'CPF inválido. Confira os 11 números.',
      'CIN': 'A CIN usa o número do CPF. Confira os 11 números.',
      'CNH': 'Número da CNH inválido. Confira os 11 números do registro.',
      'RG': 'RG inválido. Use só números (e X no final, se houver).',
      'Certidão de nascimento': 'A matrícula da certidão tem 32 números.',
      'Passaporte': 'Passaporte no formato AA123456.'
    }[tipo] || 'Informe o número do documento.';
  },
  mascaraDoc(tipo, v) {
    const d = so(v);
    if (tipo === 'CPF' || tipo === 'CIN') return d.slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    if (tipo === 'CNH') return d.slice(0, 11);
    if (tipo === 'Certidão de nascimento') return d.slice(0, 32).replace(/(\d{6})(\d{2})(\d{2})(\d{4})(\d)(\d{5})(\d{3})(\d{7})(\d{2})/, '$1 $2 $3 $4 $5 $6 $7 $8 $9');
    if (tipo === 'Passaporte') return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (tipo === 'RG') return String(v || '').toUpperCase().replace(/[^0-9X.\-]/g, '').slice(0, 16);
    return v;
  },
  ddds: '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '),
  celular(v) { let d = so(v); if (d.length === 13 && d.startsWith('55')) d = d.slice(2); return d.length === 11 && Valida.ddds.includes(d.slice(0, 2)) && d[2] === '9'; },
  mascaraCel(v) { const d = so(v).slice(0, 11); return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); },
  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }
};

/* ---------------- Senhas (PBKDF2-SHA256 no navegador; nunca guardamos a senha em texto) ---------------- */
const Senha = {
  ITER: 150000,
  hex(buf) { return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''); },
  unhex(h) { return new Uint8Array(h.match(/.{2}/g).map((x) => parseInt(x, 16))); },
  async hash(senha, saltHex, iter = Senha.ITER) {
    const salt = saltHex ? Senha.unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(senha)), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
    return { salt: Senha.hex(salt), hash: Senha.hex(bits), iter };
  },
  async confere(senha, reg) {
    if (!reg || !reg.salt || !reg.hash) return false;
    const r = await Senha.hash(senha, reg.salt, reg.iter || Senha.ITER);
    return r.hash === reg.hash;
  },
  usuarioSugerido(nome, existentes = []) {
    const partes = semAcento(nome).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((p) => p && !['de', 'da', 'do', 'dos', 'das', 'e'].includes(p));
    if (!partes.length) return '';
    let base = partes.length > 1 ? `${partes[0]}.${partes[partes.length - 1]}` : partes[0];
    let u = base, i = 2;
    while (existentes.includes(u)) u = base + i++;
    return u;
  }
};

const Hash = { async sha256(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(t))); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); } };

/* ---------------- Interface: toast, modal, cópia ---------------- */
const UI = {
  toast(msg, tipo = '') {
    let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + tipo; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  },
  modal(html, { wide = false, onClose } = {}) {
    UI.fechar();
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'modal';
    bg.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
    bg.addEventListener('click', (e) => { if (e.target === bg) UI.fechar(); });
    document.body.appendChild(bg); UI._onClose = onClose;
    const f = bg.querySelector('input, select, textarea, button:not([data-act="fechar"])'); if (f) setTimeout(() => f.focus(), 30);
    return bg;
  },
  fechar() { const m = $('#modal'); if (m) { m.remove(); if (UI._onClose) { const f = UI._onClose; UI._onClose = null; f(); } } },
  async copiar(texto, el) {
    try { await navigator.clipboard.writeText(texto); UI.toast('Copiado.'); }
    catch { if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } UI.toast('Selecionei o texto. Use Ctrl+C para copiar.'); }
  },
  confirmar(titulo, texto, acaoTexto = 'Confirmar') {
    return new Promise((res) => {
      UI.modal(`<div class="modal-head"><h2>${esc(titulo)}</h2></div><p class="muted">${esc(texto)}</p>
        <div class="row" style="justify-content:flex-end;margin-top:22px"><button class="btn btn-ghost" id="cf-n">Cancelar</button><button class="btn btn-primary" id="cf-s">${esc(acaoTexto)}</button></div>`);
      $('#cf-n').onclick = () => { UI.fechar(); res(false); };
      $('#cf-s').onclick = () => { UI.fechar(); res(true); };
    });
  },
  pw(id, ph = '', extra = '') {
    return `<div class="pw"><input class="input" id="${id}" type="password" placeholder="${esc(ph)}" ${extra}><button type="button" data-act="ver-senha" data-alvo="${id}" aria-label="Mostrar senha">${ic('eye')}</button></div>`;
  },
  avatar(p, cls = '') { const s = p && p.foto ? Arquivos.src(p.foto) : ''; return s ? `<span class="avatar ${cls}"><img src="${esc(s)}" alt=""></span>` : `<span class="avatar ${cls}">${esc(fmt.iniciais(p && p.nome))}</span>`; }
};

/* ---------------- WhatsApp ---------------- */
const Whats = {
  numero(n) { let d = so(n); if (d.length === 10 || d.length === 11) d = '55' + d; return d; },
  link(n, texto) { return `https://wa.me/${Whats.numero(n)}?text=${encodeURIComponent(texto || '')}`; },
  preencher(modelo, dados) { return String(modelo).replace(/\{(\w+)\}/g, (_, k) => dados[k] ?? ''); }
};

/* ---------------- Camada de dados ----------------
   Modo 'supabase': banco no Supabase, com login no servidor, regras de acesso por família e tempo real.
   Modo 'local': dados de exemplo só neste navegador (desenvolvimento e testes; abra com ?local).
   A interface (iniciar, assinar, lista, get, salvar, atualizar, remover) é a mesma nos dois modos. */
const Dados = {
  modo: 'carregando', sb: null, cache: {}, ouvintes: {}, canais: {}, prontos: {}, papel: 'anon', meuId: null, _saindo: false,
  COLS: ['pacientes', 'responsaveis', 'relatorios', 'recados', 'evolucoes', 'recursos', 'conteudos', 'roteiros', 'metricas', 'config', 'equipe', 'campanhas', 'conquistas'],
  COLS_RESPONSAVEL: ['config', 'responsaveis', 'pacientes', 'relatorios', 'recados', 'recursos', 'conquistas'],
  async iniciar() {
    const cfg = window.RF_CONFIG || {};
    const forcarLocal = /[?&]local\b/.test(location.search);
    if (!forcarLocal && cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient) {
      this.modo = 'supabase';
      App.sessao = { gestao: null, area: null };
      this.sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage } });
      this.sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT' && !this._saindo) this.recarregar(); });
      await this.recarregar();
    } else {
      this.modo = 'local'; this.semearLocal();
      for (const c of this.COLS) this.assinar(c);
      App.render();
    }
  },
  /* Descobre quem está conectado (equipe, responsável ou visitante) e carrega só o que essa pessoa pode ver */
  async recarregar() {
    for (const ch of Object.values(this.canais)) { try { await this.sb.removeChannel(ch); } catch {} }
    this.canais = {}; this.cache = {}; this.prontos = {}; this.papel = 'anon'; this.meuId = null;
    const { data } = await this.sb.auth.getSession(); const uidAtual = data && data.session && data.session.user.id;
    if (uidAtual) {
      const eq = await this.sb.from('equipe').select('id').eq('user_id', uidAtual).maybeSingle();
      if (eq.data) { this.papel = 'equipe'; this.meuId = eq.data.id; }
      else { const rs = await this.sb.from('responsaveis').select('id').eq('user_id', uidAtual).maybeSingle(); if (rs.data) { this.papel = 'responsavel'; this.meuId = rs.data.id; } }
    }
    const cols = this.papel === 'equipe' ? this.COLS : this.papel === 'responsavel' ? this.COLS_RESPONSAVEL : ['config'];
    for (const c of this.COLS) if (!cols.includes(c)) { this.cache[c] = {}; this.prontos[c] = true; }
    await Promise.all(cols.map((c) => this.assinar(c)));
    if (this.papel === 'equipe') {
      const e = this.get('equipe', this.meuId) || {};
      App.sessao.gestao = { usuario: this.meuId, nome: e.nome || this.meuId, apelido: e.apelido || String(e.nome || this.meuId).split(' ')[0], trocarSenha: e.primeiroAcesso !== false };
      App.sessao.area = null;
    } else if (this.papel === 'responsavel') { App.sessao.area = { id: this.meuId }; App.sessao.gestao = null; }
    else { App.sessao.area = null; App.sessao.gestao = null; }
    App.render();
  },
  _doc(col, r) { const id = col === 'config' && r.id === 'publico' && this.papel !== 'equipe' ? 'site' : r.id; return { ...(r.dados || {}), id }; },
  async assinar(col) {
    if (this.modo !== 'supabase') { this.cache[col] = ls.get('db:' + col, {}); this.prontos[col] = true; return; }
    if (this.canais[col]) return;
    const soPublico = col === 'config' && this.papel !== 'equipe';
    const m = {}; let de = 0; const PAG = 1000;
    for (;;) { // busca em páginas para coleções grandes
      let q = this.sb.from(col).select('id,dados').range(de, de + PAG - 1);
      if (soPublico) q = q.eq('id', 'publico');
      const { data, error } = await q;
      if (error) { console.error('Dados.assinar', col, error); break; }
      (data || []).forEach((r) => { const d = this._doc(col, r); m[d.id] = d; });
      if (!data || data.length < PAG) break; de += PAG;
    }
    this.cache[col] = m; this.prontos[col] = true;
    this.canais[col] = this.sb.channel('rf-' + col).on('postgres_changes', { event: '*', schema: 'public', table: col }, (p) => {
      const c = this.cache[col] = this.cache[col] || {};
      if (p.eventType === 'DELETE') { const id = p.old && p.old.id; if (id) delete c[soPublico && id === 'publico' ? 'site' : id]; }
      else { if (soPublico && p.new.id !== 'publico') return; const d = this._doc(col, p.new); c[d.id] = d; }
      this.avisar(col);
    }).subscribe();
  },
  avisar(col) { (this.ouvintes[col] || []).forEach((f) => f()); App.agendarRender(); },
  lista(col) { return Object.values(this.cache[col] || {}); },
  get(col, id) { return (this.cache[col] || {})[id] || null; },
  pronto(col) { return !!this.prontos[col]; },
  async salvar(col, id, dados, opts = {}) {
    id = id || uid(col.slice(0, 3) + '-');
    const doc = { ...dados, id, atualizadoEm: new Date().toISOString() };
    this.cache[col] = this.cache[col] || {}; this.cache[col][id] = doc;
    if (this.modo === 'supabase') {
      const { id: _i, salt: _s, hash: _h, iter: _it, ...semId } = doc; // senhas nunca vão para o banco: ficam no login do servidor
      try {
        if (this.papel === 'responsavel' && col === 'responsaveis') {
          const { data, error } = await this.sb.rpc('salvar_meu_cadastro', { novo: semId }); if (error) throw error;
          this.cache[col][id] = { ...this.cache[col][id], ...data };
        } else if (col === 'conquistas' && this.papel !== 'equipe') {
          const { error } = await this.sb.rpc('salvar_conquista', { pid: id, novo: semId }); if (error) throw error;
        } else {
          const { error } = await this.sb.from(col).upsert({ id, dados: semId }); if (error) throw error;
        }
      } catch (e) {
        console.error('Dados.salvar', col, e);
        if (!opts.silencioso) UI.toast('Não foi possível salvar. Verifique a conexão e tente de novo.', 'bad');
      }
    } else { ls.set('db:' + col, this.cache[col]); }
    App.agendarRender();
    return doc;
  },
  async atualizar(col, id, parcial, opts) { const atual = this.get(col, id) || {}; return this.salvar(col, id, { ...atual, ...parcial }, opts); },
  async remover(col, id) {
    if (this.cache[col]) delete this.cache[col][id];
    if (this.modo === 'supabase') { const { error } = await this.sb.from(col).delete().eq('id', id); if (error) UI.toast('Não foi possível excluir. Tente de novo.', 'bad'); }
    else ls.set('db:' + col, this.cache[col]);
    App.agendarRender();
  },
  config() { return this.get('config', 'site') || {}; },
  locais() { const c = this.config(); return (c.locais && c.locais.length) ? c.locais : RF.locais; },
  local(id) { return this.locais().find((l) => l.id === id); },
  semearLocal() {
    if (ls.get('semeado:v1')) return;
    const put = (col, arr) => { const m = ls.get('db:' + col, {}); arr.forEach((d) => { m[d.id] = d; }); ls.set('db:' + col, m); };
    const ex = RF.exemplos ? RF.exemplos() : null;
    if (ex) Object.entries(ex).forEach(([col, arr]) => put(col, arr));
    put('conteudos', RF.propostasIniciais.map((p) => ({ ...p, status: 'proposto', criadoEm: new Date().toISOString() })));
    ls.set('semeado:v1', true);
  }
};

/* ---------------- Capacidades extras: IA, arquivos e downloads ---------------- */
const Cap = {
  _s: null, _a: null, _d: null,
  async sample() { if (this._s === null) { try { this._s = (await window.claude?.use?.('sample')) || false; } catch { this._s = false; } } return this._s || null; },
  async assets() { if (this._a === null) { try { this._a = (await window.claude?.use?.('assets')) || false; } catch { this._a = false; } } return this._a || null; },
  async downloads() { if (this._d === null) { try { this._d = (await window.claude?.use?.('downloads')) || false; } catch { this._d = false; } } return this._d || null; }
};

const IA = {
  base: 'Você é a assistente de conteúdo e gestão da fonoaudióloga Rebeca Fonseca (CRFa 4-15570), especialista em linguagem infantil, PROMPT, CAA/PODD e Teste da Linguinha, que atende em Feira de Santana, Conceição do Jacuípe e Irará (Bahia). Escreva sempre em português do Brasil, com tom acolhedor, claro e profissional, focado em resolver a dúvida da mãe ou do pai e em tranquilizar famílias aflitas, inclusive de crianças atípicas. Nunca prometa resultados nem faça diagnóstico pelas redes, em respeito ao Código de Ética da Fonoaudiologia. Para afirmações sobre saúde, use apenas o consenso de instituições reconhecidas (OMS, Ministério da Saúde, Sociedade Brasileira de Pediatria, CFFa, SBFa, ASHA, CDC/AAP) ou estudos científicos amplamente citados; quando citar uma fonte, dê o nome exato da instituição ou dos autores e o ano, e nunca invente números, títulos ou links. Se não tiver certeza de uma fonte, diga "fonte a confirmar".',
  async texto(prompt, opts = {}) {
    const input = Array.isArray(prompt) ? prompt : this.base + '\n\n' + prompt;
    if (Dados.modo === 'supabase') return (await Auth.chamar('ia', { entrada: input })).texto;
    const s = await Cap.sample();
    if (!s) throw { code: 'indisponivel', message: 'A IA não está disponível nesta visualização. Abra o sistema pelo claude.ai com sua conta.' };
    return (await s(input, { cache: false, ...opts })).text;
  },
  async json(prompt, opts = {}) {
    if (Dados.modo === 'supabase') return (await Auth.chamar('ia', { entrada: this.base + '\n\n' + prompt, json: true })).json;
    const s = await Cap.sample();
    if (!s) throw { code: 'indisponivel', message: 'A IA não está disponível nesta visualização. Abra o sistema pelo claude.ai com sua conta.' };
    return s.json(this.base + '\n\n' + prompt, { cache: false, ...opts });
  },
  erro(e) {
    const c = e && e.code;
    if (c === 'not_granted') return 'Você não autorizou a IA nesta página. Libere em Permissões do artefato para usar este recurso.';
    if (c === 'rate_limited') return 'Muitas solicitações seguidas. Aguarde um minuto e tente de novo.';
    if (c === 'invalid_json') return 'A resposta veio fora do formato esperado. Tente de novo com um pedido mais curto.';
    return (e && e.message) || 'Não consegui gerar agora. Tente novamente.';
  }
};

/* ---------------- Login e contas (funções do servidor no Supabase) ---------------- */
const Auth = {
  async chamar(nome, corpo) {
    if (!Dados.sb) throw { code: 'indisponivel', message: 'O sistema ainda está carregando. Tente de novo em instantes.' };
    const { data, error } = await Dados.sb.functions.invoke(nome, { body: corpo });
    if (error) {
      let codigo = 'falha', msg = 'Não foi possível concluir agora. Verifique a conexão e tente de novo.';
      try { const j = await error.context.json(); if (j && j.erro) { codigo = j.erro.codigo; msg = j.erro.mensagem; } } catch {}
      throw { code: codigo, message: msg };
    }
    return data;
  },
  /* area: 'gestao' (equipe) ou 'area' (responsáveis) */
  async entrar(usuario, senha, area) {
    const r = await this.chamar('entrar', { usuario, senha, area });
    const { error } = await Dados.sb.auth.setSession(r.sessao);
    if (error) throw { code: 'sessao', message: 'Não foi possível abrir a sessão. Tente de novo.' };
    await Dados.recarregar();
    return r;
  },
  async sair() {
    Dados._saindo = true;
    // Avisa o servidor (se a sessão ainda existir lá) e sempre limpa o login deste navegador
    try { await Dados.sb.auth.signOut(); } catch {}
    try { await Dados.sb.auth.signOut({ scope: 'local' }); } catch {}
    try { for (const k of Object.keys(sessionStorage)) if (/^sb-.*-auth-token/.test(k)) sessionStorage.removeItem(k); } catch {}
    Dados._saindo = false;
    await Dados.recarregar();
  },
  async trocarSenha(nova, atual) {
    const resp = await this.chamar('conta', { acao: 'trocar-senha', nova, atual });
    // A troca de senha encerra as sessões antigas no servidor; passa a usar a sessão nova
    if (resp && resp.sessao) { try { await Dados.sb.auth.setSession(resp.sessao); } catch {} }
    const col = Dados.papel === 'equipe' ? 'equipe' : 'responsaveis'; const r = Dados.get(col, Dados.meuId);
    if (r) { r.primeiroAcesso = false; r.senhaTrocadaEm = new Date().toISOString(); }
    if (App.sessao.gestao) App.sessao.gestao.trocarSenha = false;
  },
  /* acao: 'criar-acesso' | 'redefinir' | 'remover-acesso'; tipo: 'responsavel' | 'equipe' */
  acesso(acao, tipo, id) { return this.chamar('conta', { acao, tipo, id }); }
};

/* ---------------- Arquivos (fotos, assinaturas e vídeos no Storage do Supabase) ----------------
   O documento guarda uma referência "sb://balde/caminho"; a tela pede um link temporário para exibir. */
const Arquivos = {
  urls: {}, pendentes: {},
  ehRef(v) { return typeof v === 'string' && v.startsWith('sb://'); },
  partes(ref) { const s = ref.slice(5); const i = s.indexOf('/'); return { balde: s.slice(0, i), caminho: s.slice(i + 1) }; },
  async enviar(balde, caminho, blob) {
    const { error } = await Dados.sb.storage.from(balde).upload(caminho, blob, { upsert: true, contentType: blob.type || undefined });
    if (error) throw { code: 'upload', message: 'Não consegui guardar o arquivo. Tente de novo.' };
    return `sb://${balde}/${caminho}`;
  },
  /* Imagem que veio como data URL (foto reduzida, assinatura): no Supabase vira arquivo; no modo local continua igual */
  async guardarDataURL(balde, caminho, dataURL) {
    if (Dados.modo !== 'supabase' || !dataURL || !String(dataURL).startsWith('data:')) return dataURL;
    const blob = await (await fetch(dataURL)).blob();
    return this.enviar(balde, caminho, blob);
  },
  /* Link para <img>/<video>. Se ainda não há link, pede em segundo plano e redesenha quando chegar. */
  src(ref) {
    if (!this.ehRef(ref)) return ref || '';
    const u = this.urls[ref]; if (u && u.ate > Date.now()) return u.url;
    if (!this.pendentes[ref] && Dados.sb) {
      this.pendentes[ref] = true; const { balde, caminho } = this.partes(ref);
      Dados.sb.storage.from(balde).createSignedUrl(caminho, 3600).then(({ data }) => {
        delete this.pendentes[ref];
        if (data && data.signedUrl) { this.urls[ref] = { url: data.signedUrl, ate: Date.now() + 50 * 60 * 1000 }; App.agendarRender(); }
      });
    }
    return u ? u.url : '';
  },
  async comoDataURL(ref) {
    if (!this.ehRef(ref)) return ref;
    const { balde, caminho } = this.partes(ref);
    const { data, error } = await Dados.sb.storage.from(balde).download(caminho); if (error || !data) return '';
    return new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(''); fr.readAsDataURL(data); });
  }
};

/* ---------------- Downloads e impressão direto no navegador ---------------- */
const Baixar = {
  arquivo(blob, nome) {
    const u = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = u; a.download = nome; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 60000);
  },
  imprimir(blob) {
    const u = URL.createObjectURL(blob); const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    f.onload = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { window.open(u, '_blank', 'noopener'); } };
    f.src = u; document.body.appendChild(f);
    setTimeout(() => { f.remove(); URL.revokeObjectURL(u); }, 10 * 60 * 1000);
  },
  /* No claude.ai usa o salvamento do artefato; fora dele, baixa direto */
  async salvar(blob, nome) {
    const dl = await Cap.downloads();
    if (dl) { await dl.save({ filename: nome, data: blob }); return; }
    Baixar.arquivo(blob, nome);
  }
};

/* ---------------- Imagens (logo para PDF, fotos de perfil) ---------------- */
const Img = {
  cache: {},
  async dataURL(src) {
    if (this.cache[src]) return this.cache[src];
    const r = await fetch(src); const b = await r.blob();
    const d = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
    this.cache[src] = d; return d;
  },
  reduzir(file, max = 320, q = 0.78) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onload = () => {
        const im = new Image();
        im.onload = () => {
          const s = Math.min(1, max / Math.max(im.width, im.height));
          const cv = document.createElement('canvas'); cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          res(cv.toDataURL('image/jpeg', q));
        };
        im.onerror = rej; im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
};

/* ---------------- Relatório: seções finais (sem subtítulos vazios) ---------------- */
const Rel = {
  PROC_TITULO: 'Procedimentos de avaliação',
  MOTIVO_TITULO: 'Motivo do encerramento',
  motivos() { const extra = (Dados.config().motivosFim || []); return [...RF.motivosFim, ...extra.filter((x) => !RF.motivosFim.includes(x))]; },
  procedimentos() { const extra = (Dados.config().procedimentosExtras || []); return [...RF.procedimentos, ...extra.filter((x) => !RF.procedimentos.includes(x))]; },
  texto(rel, s) {
    if (s.titulo === Rel.MOTIVO_TITULO && rel.alta && rel.alta.motivo) { const l = `Motivo: ${rel.alta.motivo}.${rel.alta.data ? ` Encerramento do acompanhamento em ${fmt.data(rel.alta.data)}.` : ''}`; return [l, (s.texto || '').trim()].filter(Boolean).join('\n'); }
    if (s.titulo === Rel.PROC_TITULO) { const lista = (rel.procedimentos || []).map((x) => '• ' + x).join('\n'); return [lista, (s.texto || '').trim()].filter(Boolean).join('\n'); }
    return String(s.texto || '').trim();
  },
  secoes(rel) { return (rel.secoes || []).map((s) => ({ titulo: s.titulo, texto: Rel.texto(rel, s) })).filter((s) => s.texto); }
};

/* ---------------- Relatório em PDF (papel timbrado) ---------------- */
const PDF = {
  async gerar(rel, paciente) {
    if (!window.jspdf) throw new Error('Gerador de PDF não carregou. Verifique a conexão e recarregue a página.');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297, M = 22;
    const logo = await Img.dataURL('img/logo-verde.png');
    const tipo = (RF.tiposRelatorio[rel.tipo] || {}).nome || 'Relatório';
    const cab = (d) => {
      d.addImage(logo, 'PNG', (W - 84) / 2, 13, 84, 13.7);
      d.setFont('helvetica', 'normal'); d.setFontSize(7.5); d.setTextColor(120, 128, 53);
      d.text(RF.marca.crfa.toUpperCase().split('').join(' '), W / 2, 31, { align: 'center' });
      d.setFillColor(120, 128, 53); d.rect(0, H - 14, W, 14, 'F');
      d.setTextColor(255, 255, 255); d.setFontSize(8);
      const locs = Dados.locais().map((l) => l.cidade).filter((v, i, a) => a.indexOf(v) === i).join(' · ');
      d.text(`WhatsApp ${RF.marca.whatsappTexto}   ·   ${RF.marca.email}   ·   @${RF.marca.instagram}`, M, H - 6);
      d.text(locs, W - M, H - 6, { align: 'right' });
    };
    cab(doc);
    let y = 44;
    doc.setTextColor(47, 42, 37); doc.setFont('times', 'normal'); doc.setFontSize(19);
    doc.text(rel.titulo || tipo, W / 2, y, { align: 'center', maxWidth: W - 2 * M }); y += 10;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(109, 103, 95);
    const ident = [`Paciente: ${paciente ? paciente.nome : ''}`, paciente && paciente.nascimento ? `Nascimento: ${fmt.data(paciente.nascimento)} (${fmt.idade(paciente.nascimento)})` : '', `Data: ${fmt.dataLonga(rel.data || new Date().toISOString().slice(0, 10))}`].filter(Boolean).join('   ·   ');
    doc.text(ident, W / 2, y, { align: 'center', maxWidth: W - 2 * M }); y += 9;
    const novaPagina = () => { doc.addPage(); cab(doc); y = 40; };
    Rel.secoes(rel).forEach((s) => {
      if (y > H - 40) novaPagina();
      if (s.titulo && s.titulo !== 'Declaração') { doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(143, 92, 61); doc.text(s.titulo.toUpperCase(), M, y); y += 6; }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(47, 42, 37);
      const linhas = doc.splitTextToSize(String(s.texto || ''), W - 2 * M);
      linhas.forEach((ln) => { if (y > H - 26) novaPagina(); doc.text(ln, M, y); y += 5.4; });
      y += 4;
    });
    if (y > H - 50) novaPagina();
    y = Math.max(y + 12, H - 52);
    doc.setDrawColor(47, 42, 37); doc.line(W / 2 - 38, y, W / 2 + 38, y);
    doc.setFontSize(10); doc.setTextColor(47, 42, 37); doc.text(RF.marca.nome + ' — ' + RF.marca.profissao, W / 2, y + 5.5, { align: 'center' });
    doc.setFontSize(8.5); doc.setTextColor(109, 103, 95); doc.text(RF.marca.crfa, W / 2, y + 10, { align: 'center' });
    return doc.output('blob');
  },
  /* Termos (LGPD e TCLE) com registro de aceite e assinatura */
  async termo({ titulo, secoes, registro = [], assinatura = '', nomeArquivo }) {
    if (!window.jspdf) throw new Error('Gerador de PDF não carregou. Verifique a conexão e recarregue a página.');
    if (Arquivos.ehRef(assinatura)) assinatura = await Arquivos.comoDataURL(assinatura);
    const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, H = 297, M = 20; const logo = await Img.dataURL('img/logo-verde.png');
    const cab = () => { doc.addImage(logo, 'PNG', (W - 70) / 2, 11, 70, 11.4); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120, 128, 53); doc.text(RF.marca.crfa.toUpperCase().split('').join(' '), W / 2, 27, { align: 'center' }); doc.setFillColor(120, 128, 53); doc.rect(0, H - 12, W, 12, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.text(`${RF.marca.nomeCompleto} · ${RF.marca.crfa} · WhatsApp ${RF.marca.whatsappTexto} · ${RF.marca.email}`, W / 2, H - 5, { align: 'center' }); };
    cab(); let y = 38;
    const nova = () => { doc.addPage(); cab(); y = 36; };
    doc.setFont('times', 'bold'); doc.setFontSize(14.5); doc.setTextColor(47, 42, 37);
    doc.splitTextToSize(titulo, W - 2 * M).forEach((l) => { doc.text(l, W / 2, y, { align: 'center' }); y += 6.5; }); y += 3;
    secoes.forEach(([t, txt]) => {
      if (y > H - 34) nova();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(143, 92, 61); doc.text(t, M, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(47, 42, 37);
      doc.splitTextToSize(txt, W - 2 * M).forEach((l) => { if (y > H - 20) nova(); doc.text(l, M, y); y += 4.6; }); y += 3;
    });
    if (registro.length || assinatura) {
      if (y > H - 70) nova();
      y += 2; doc.setDrawColor(173, 183, 120); doc.setFillColor(238, 241, 223); const alt = 8 + registro.length * 5.2 + (assinatura ? 26 : 0);
      doc.roundedRect(M, y, W - 2 * M, alt, 3, 3, 'F'); let yy = y + 6;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(120, 128, 53); doc.text('REGISTRO ELETRÔNICO', M + 5, yy); yy += 5.5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(47, 42, 37);
      registro.forEach(([k, v]) => { doc.setFont('helvetica', 'bold'); doc.text(k + ':', M + 5, yy); doc.setFont('helvetica', 'normal'); doc.text(String(v), M + 48, yy, { maxWidth: W - 2 * M - 52 }); yy += 5.2; });
      if (assinatura) { doc.addImage(assinatura, 'PNG', M + 5, yy - 1, 60, 19); doc.setDrawColor(47, 42, 37); doc.line(M + 5, yy + 19, M + 75, yy + 19); doc.setFontSize(7.5); doc.text('Assinatura do responsável', M + 5, yy + 23); }
    }
    return doc.output('blob');
  },
  async salvarTermo(opts) {
    try { const blob = await PDF.termo(opts); await Baixar.salvar(blob, opts.nomeArquivo || 'termo.pdf'); UI.toast('PDF pronto.'); }
    catch (e) { if (e && e.code === 'declined') return; UI.toast((e && e.message) || 'Não foi possível gerar o PDF.', 'bad'); }
  },
  nome(rel, paciente) { return `${semAcento((RF.tiposRelatorio[rel.tipo] || {}).nome || 'Relatorio').replace(/\s+/g, '-')}_${semAcento(paciente ? paciente.nome.split(' ')[0] : 'paciente')}_${(rel.data || '').slice(0, 10)}.pdf`; },
  /* modo 'imprimir' abre a impressão com o papel timbrado; senão baixa o PDF */
  async salvar(rel, paciente, modo) {
    try {
      const blob = await PDF.gerar(rel, paciente);
      if (modo === 'imprimir') { Baixar.imprimir(blob); return true; }
      await Baixar.salvar(blob, PDF.nome(rel, paciente));
      UI.toast('PDF baixado.');
      return true;
    } catch (e) { if (e && e.code === 'declined') return false; UI.toast((e && e.message) || 'Não foi possível gerar o PDF.', 'bad'); return false; }
  }
};

/* ---------------- Aplicação e roteamento ---------------- */
const App = {
  rota: 'inicio', sub: {}, _raf: 0,
  sessao: { gestao: ss.get('sessao:gestao'), area: ss.get('sessao:area') },
  views: {},
  iniciar() {
    const ir = () => { const h = (location.hash || '').replace('#', ''); this.rota = ['area', 'gestao'].includes(h) ? h : 'inicio'; this.render(); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', ir);
    ir();
    Dados.iniciar();
  },
  ir(rota) { if (location.hash.replace('#', '') === rota) { this.rota = rota; this.render(); } else location.hash = rota === 'inicio' ? '' : rota; },
  agendarRender() { cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(() => this.render(true)); },
  render(parcial) {
    if (RF.aplicarMarca) RF.aplicarMarca();
    const root = $('#app'); if (!root) return;
    const ativo = document.activeElement;
    const idFoco = ativo && ativo.id; const sel = ativo && ativo.selectionStart;
    if (parcial && ativo && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ativo.tagName) && !ativo.dataset.live) return; // não redesenha durante a digitação
    if (parcial && ($('#modal') || $('[data-termo-scroll]') || document.querySelector('canvas[data-vazio=""]'))) return;
    const v = this.views[this.rota]; root.innerHTML = v ? v() : '';
    document.title = this.rota === 'gestao' ? 'Gestão · Rebeca Fonseca Fono' : this.rota === 'area' ? 'Área do Usuário · Rebeca Fonseca Fono' : 'Rebeca Fonseca Fono';
    if (idFoco) { const el = document.getElementById(idFoco); if (el) { el.focus(); try { if (sel != null) el.setSelectionRange(sel, sel); } catch {} } }
    (this.depois || []).forEach((f) => f()); this.depois = [];
  },
  depois: [],
  apos(f) { this.depois.push(f); }
};

/* Ações por delegação de eventos: data-act="nome" */
const Acoes = {};
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const f = Acoes[a.dataset.act]; if (!f) return;
  if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault();
  f(a, e);
});
document.addEventListener('submit', (e) => {
  const f = Acoes[e.target.dataset.submit]; if (!f) return;
  e.preventDefault(); f(e.target, e);
});
document.addEventListener('input', (e) => { const f = Acoes[e.target.dataset.input]; if (f) f(e.target, e); });
document.addEventListener('change', (e) => { const f = Acoes[e.target.dataset.change]; if (f) f(e.target, e); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#modal')) UI.fechar(); });

Acoes['fechar'] = () => UI.fechar();
Acoes['ver-senha'] = (b) => { const i = document.getElementById(b.dataset.alvo); if (!i) return; const v = i.type === 'password'; i.type = v ? 'text' : 'password'; b.innerHTML = ic(v ? 'eyeoff' : 'eye'); b.setAttribute('aria-label', v ? 'Ocultar senha' : 'Mostrar senha'); };
Acoes['ir'] = (a) => App.ir(a.dataset.rota);
Acoes['copiar'] = (a) => UI.copiar(a.dataset.texto, a.closest('[data-copia]') || a);

Object.assign(window, { $, $$, esc, uid, so, semAcento, ls, ss, fmt, ic, Valida, Senha, Hash, Rel, UI, Whats, Dados, Cap, IA, Auth, Arquivos, Baixar, Img, PDF, App, Acoes });
