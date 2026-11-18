/* Versão para o domínio próprio (rebecafonseca.com.br): só o site público.
   Usa as Configurações do sistema copiadas no momento da publicação (config-publicado.js).
   A Área do Usuário e a Gestão continuam no sistema do claude.ai até a migração para um banco próprio. */
(function () {
  const SISTEMA = 'https://claude.ai/artifact/GSmuDND8xVNSCuMdSDVP1A';
  window.RF_SITE = true;
  Dados.semearLocal = function () {};
  Dados.salvar = async function () { return null; };
  Dados.iniciar = async function () {
    this.modo = 'site';
    this.cache = { config: { site: RF.configPublicado || {} } };
    for (const c of this.COLS) { this.cache[c] = this.cache[c] || {}; this.prontos[c] = true; }
    App.render();
  };

  function tela(titulo, sub, corpo) {
    return `<div class="auth"><div class="side pattern" style="background-color:var(--terra)">
      <button class="btn btn-sm" style="background:rgba(255,255,255,.18);color:#fff;align-self:flex-start" data-act="ir" data-rota="inicio">← Voltar ao site</button>
      <div class="stack auth-id" style="gap:18px"><div class="photo"><img src="img/rebeca-perfil.jpg" alt="Rebeca Fonseca, fonoaudióloga"></div><div class="auth-txt"><div class="quem"><b>Rebeca Fonseca</b><span>Fonoaudióloga · ${esc(RF.marca.crfa)}</span></div><h2>${titulo}</h2><p class="hide-sm" style="opacity:.88;max-width:380px">${sub}</p></div></div>
      <img class="hide-sm" src="img/logo-branco.png" alt="Rebeca Fonseca Fonoaudióloga" style="width:220px">
    </div><div class="main"><div class="stack" style="max-width:440px;width:100%;gap:16px">${corpo}</div></div></div>`;
  }
  App.views.area = () => tela('Área do Usuário', 'Relatórios, recados e jogos que a Rebeca preparou para o seu filho, em um só lugar.',
    `<div class="eyebrow">Pais e responsáveis</div><h1 style="font-size:clamp(30px,5vw,40px)">O portal abre em breve</h1>
     <p class="muted">Em breve você vai entrar aqui para ver relatórios, recados e os jogos liberados pela Rebeca. Enquanto isso, fale direto com ela pelo WhatsApp.</p>
     <a class="btn btn-wa" href="${Whats.link(RF.marca.whatsapp, RF.marca.msgAgenda)}" target="_blank" rel="noopener">${ic('whats')} Falar com a Rebeca</a>`);
  App.views.gestao = () => tela('Gestão', 'Acesso da equipe da Rebeca Fonseca.',
    `<div class="eyebrow">Equipe</div><h1 style="font-size:clamp(30px,5vw,40px)">Sistema de gestão</h1>
     <p class="muted">Pacientes, relatórios, evoluções e redes sociais ficam no sistema da Rebeca. Entre com a sua conta para acessar.</p>
     <a class="btn btn-primary" href="${SISTEMA}#gestao" rel="noopener">${ic('lock')} Abrir o sistema</a>`);
})();
