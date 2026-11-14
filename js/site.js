/* ExplAIner · Landing CMI — interações. Sem dependências. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Endereços (js/config.js) ---------- */
  const cfg = window.EXPLAINER_CONFIG || {};
  const limpo = (v) => String(v || '').trim();
  const plataforma = limpo(cfg.plataformaUrl);
  const instagram = limpo(cfg.instagramUrl);
  const usuarioInsta = limpo(cfg.instagramUsuario).replace(/^@/, '');

  // Os links da plataforma já vêm com o endereço oficial no HTML (funcionam sem JavaScript).
  // Se js/config.js trouxer outro endereço, ele passa a valer em todos os botões e links.
  if (plataforma) {
    $$('[data-link="plataforma"]').forEach((a) => {
      a.href = plataforma;
      if (/^https?:\/\//i.test(plataforma)) { a.target = '_blank'; a.rel = 'noopener'; }
    });
  }
  if (instagram) {
    $$('[data-link="instagram"]').forEach((a) => {
      a.href = instagram; a.target = '_blank'; a.rel = 'noopener'; a.hidden = false;
      a.setAttribute('aria-label', usuarioInsta ? `Instagram do ExplAIner, @${usuarioInsta}` : 'Instagram do ExplAIner');
    });
    $$('[data-se-instagram]').forEach((el) => { el.hidden = false; });
    $$('[data-instagram-rotulo]').forEach((el) => { el.textContent = usuarioInsta ? `@${usuarioInsta}` : 'Instagram'; });
  }

  /* ---------- Cabeçalho e menu do celular ---------- */
  const topo = $('#topo');
  const nav = $('#nav');
  const botaoMenu = $('#botao-menu');
  const aoRolar = () => topo.classList.toggle('rolado', window.scrollY > 12);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  function definirMenu(aberto) {
    nav.classList.toggle('aberta', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }
  botaoMenu.addEventListener('click', () => definirMenu(!nav.classList.contains('aberta')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => definirMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('aberta')) { definirMenu(false); botaoMenu.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('aberta') && !nav.contains(e.target) && !botaoMenu.contains(e.target)) definirMenu(false);
  });
  window.matchMedia('(min-width: 981px)').addEventListener('change', (m) => { if (m.matches) definirMenu(false); });

  /* ---------- Seção ativa no menu ---------- */
  const linksNav = $$('.nav ul a');
  if ('IntersectionObserver' in window) {
    const marcar = (id) => linksNav.forEach((a) => {
      const ativo = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('ativo', ativo);
      if (ativo) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    const espia = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) marcar(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'como-funciona', 'recursos', 'proposito', 'equipe', 'experimentar']
      .map((id) => document.getElementById(id)).filter(Boolean).forEach((s) => espia.observe(s));
  }

  /* ---------- Revelação ao rolar ---------- */
  const revelar = $$('.revelar');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelar.forEach((el) => obs.observe(el));
  } else {
    revelar.forEach((el) => el.classList.add('visivel'));
  }

  const ano = $('#ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
