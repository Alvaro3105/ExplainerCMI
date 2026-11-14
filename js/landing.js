/* ExplAIner · Landing CMI — interações. Sem dependências. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Links centralizados (js/config.js) ---------- */
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
      a.href = instagram; a.target = '_blank'; a.rel = 'noopener';
      a.hidden = false;
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
  window.matchMedia('(min-width: 1061px)').addEventListener('change', (m) => { if (m.matches) definirMenu(false); });

  /* ---------- Seção ativa no menu ---------- */
  const linksNav = $$('.nav ul a');
  const secoes = linksNav.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const espia = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        linksNav.forEach((a) => {
          const ativo = a.getAttribute('href') === `#${en.target.id}`;
          a.classList.toggle('ativo', ativo);
          if (ativo) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach((s) => espia.observe(s));
    // Ao voltar ao topo, nenhum item fica marcado.
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) linksNav.forEach((a) => { a.classList.remove('ativo'); a.removeAttribute('aria-current'); });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#inicio'));
  }

  /* ---------- Revelação ao rolar ---------- */
  const revelar = $$('.revelar');
  if (!reduzMovimento && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelar.forEach((el) => obs.observe(el));
  } else {
    revelar.forEach((el) => el.classList.add('visivel'));
  }

  /* ---------- Troca de imagem com transição curta ---------- */
  function trocarImagem(img, src, alt) {
    if (img.getAttribute('src') === src) { img.alt = alt; return; }
    const aplicar = () => { img.src = src; img.alt = alt; };
    if (reduzMovimento) { aplicar(); return; }
    img.classList.add('trocando');
    const pre = new Image();
    pre.onload = pre.onerror = () => { setTimeout(() => { aplicar(); img.classList.remove('trocando'); }, 120); };
    pre.src = src;
  }

  /* ---------- Abas acessíveis (setas, Home, End) ---------- */
  function abas(botoes, aoSelecionar) {
    function selecionar(i, focar) {
      botoes.forEach((b, j) => {
        const sel = i === j;
        b.setAttribute('aria-selected', String(sel));
        b.tabIndex = sel ? 0 : -1;
      });
      if (focar) botoes[i].focus();
      aoSelecionar(i);
    }
    botoes.forEach((b, i) => {
      b.addEventListener('click', () => selecionar(i, false));
      b.addEventListener('keydown', (e) => {
        const mapa = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: botoes.length - 1 };
        if (!(e.key in mapa)) return;
        e.preventDefault();
        selecionar((mapa[e.key] + botoes.length) % botoes.length, true);
      });
    });
    return selecionar;
  }

  /* ---------- Jornada do estudante ---------- */
  const ETAPAS = [
    {
      titulo: 'Escolha o conteúdo',
      texto: 'Selecione a matéria e o tema. Depois, defina quantas questões cada fase terá e a dificuldade inicial da jornada.',
      fatos: ['5, 10, 15 ou 20 questões por fase', 'Fácil, Médio ou Difícil'],
      img: 'assets/telas/montagem.webp',
      alt: 'Painel Monte sua jornada, com matéria, tema, quantidade de questões e dificuldade.'
    },
    {
      titulo: 'Inicie um desafio',
      texto: 'Ao gerar o desafio, as questões de múltipla escolha são criadas por IA para o tema e a dificuldade escolhidos. A fase abre como um mapa, e cada bolinha é uma questão.',
      fatos: ['Questões criadas por IA', 'Progresso salvo automaticamente'],
      img: 'assets/telas/mapa.webp',
      alt: 'Mapa do desafio com a trilha de questões: três acertos, um erro e a próxima questão disponível.'
    },
    {
      titulo: 'Responda às questões',
      texto: 'Cada resposta é corrigida na hora. A alternativa fica verde no acerto e vermelha no erro, e a explicação aparece logo abaixo.',
      fatos: ['Correção imediata', 'Explicação em toda questão'],
      img: 'assets/telas/acerto.webp',
      alt: 'Questão respondida corretamente, com a alternativa Netuno em verde e a explicação.'
    },
    {
      titulo: 'Ganhe pontos e avance',
      texto: 'Acertos valem 10, 15 ou 20 pontos conforme a dificuldade, e errar desconta 25% desse valor. Concluir a fase rende bônus e libera a próxima, um nível mais difícil.',
      fatos: ['+10 por fase concluída', '+25 por fase perfeita', '+50 por jornada completa'],
      img: 'assets/telas/resultado.webp',
      alt: 'Tela de fase concluída: 4 de 5 acertos, 80% de precisão e bônus de 10 XP.'
    },
    {
      titulo: 'Acompanhe sua evolução',
      texto: 'Em Meu progresso ficam as fases concluídas, a precisão das respostas e o histórico de desafios, com a opção de refazer. O ranking mostra a sua posição.',
      fatos: ['Histórico com as 30 atividades recentes', 'Posição no ranking'],
      img: 'assets/telas/progresso.webp',
      alt: 'Tela Meu progresso com desafios concluídos, precisão de 80%, questões respondidas e o histórico.'
    }
  ];
  const botoesEtapa = $$('.etapa');
  const painelEtapa = $('#painel-etapa');
  let etapaAtual = 0;
  const selecionarEtapa = abas(botoesEtapa, (i) => {
    etapaAtual = i;
    const e = ETAPAS[i];
    botoesEtapa.forEach((b, j) => b.classList.toggle('feita', j < i));
    painelEtapa.setAttribute('aria-labelledby', botoesEtapa[i].id);
    $('#etapa-numero').textContent = String(i + 1).padStart(2, '0');
    $('#etapa-titulo').textContent = e.titulo;
    $('#etapa-descricao').textContent = e.texto;
    $('#etapa-fatos').replaceChildren(...e.fatos.map((f) => { const li = document.createElement('li'); li.textContent = f; return li; }));
    trocarImagem($('#etapa-imagem'), e.img, e.alt);
  });
  $('#etapa-anterior').addEventListener('click', () => selecionarEtapa((etapaAtual + ETAPAS.length - 1) % ETAPAS.length, false));
  $('#etapa-proxima').addEventListener('click', () => selecionarEtapa((etapaAtual + 1) % ETAPAS.length, false));

  /* ---------- Galeria de demonstração ---------- */
  const TELAS = [
    { img: 'assets/telas/mapa.webp', alt: 'Mapa do desafio com a trilha de questões.', legenda: 'Mapa do desafio: cada bolinha é uma questão. Acertos ficam marcados, erros aparecem em vermelho e a próxima questão é liberada em ordem.' },
    { img: 'assets/telas/questao.webp', alt: 'Questão de múltipla escolha com a alternativa C selecionada.', legenda: 'Questão de múltipla escolha sobre o tema escolhido, com quatro alternativas.' },
    { img: 'assets/telas/erro.webp', alt: 'Resposta incorreta em vermelho, a correta em verde e a explicação.', legenda: 'Quando o estudante erra, a plataforma mostra a alternativa correta e explica o conteúdo.' },
    { img: 'assets/telas/resultado.webp', alt: 'Resultado da fase com acertos, pontos e precisão.', legenda: 'Fim da fase: acertos, pontos ganhos, precisão e o caminho para a próxima fase.' },
    { img: 'assets/telas/ranking.webp', alt: 'Ranking da comunidade com posição, sequência, tempo ativo e pontos.', legenda: 'Ranking da comunidade, ordenado pelos pontos acumulados, com a linha do próprio estudante destacada.' },
    { img: 'assets/telas/inicio.webp', alt: 'Tela inicial da área do estudante.', legenda: 'Painel do estudante: pontos, sequência, posição no ranking, a montagem do próximo desafio e o mapa de conquistas.' },
    { img: 'assets/telas/acesso.webp', alt: 'Tela de acesso com o astronauta do ExplAIner e o formulário de login.', legenda: 'Tela de acesso: entrar ou criar conta, com aceite dos Termos de Uso e do Termo de Consentimento.' }
  ];
  const palcoImg = $('#palco-imagem');
  const palco = $('#palco');
  abas($$('.galeria-aba'), (i) => {
    palco.setAttribute('aria-labelledby', `aba-tela-${i}`);
    trocarImagem(palcoImg, TELAS[i].img, TELAS[i].alt);
    $('#palco-legenda').textContent = TELAS[i].legenda;
  });

  /* ---------- Trilha da jornada: passa pelo centro de cada bolinha (como desenharTrilha na plataforma) ---------- */
  const trilha = $('.trilha');
  const caminho = $('#trilha-path');
  function desenharTrilha() {
    const base = trilha.getBoundingClientRect();
    const pts = $$('.etapa-bolinha', trilha).map((b) => {
      const r = b.getBoundingClientRect();
      return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
    });
    if (pts.length < 2) return;
    let d = `M ${pts[0].x - 70} ${pts[0].y + 14} Q ${pts[0].x - 35} ${pts[0].y} ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2;
      d += ` C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
    }
    const u = pts[pts.length - 1];
    d += ` Q ${u.x + 35} ${u.y} ${u.x + 70} ${u.y - 14}`;
    caminho.setAttribute('d', d);
  }
  desenharTrilha();
  if ('ResizeObserver' in window) new ResizeObserver(desenharTrilha).observe(trilha);
  else window.addEventListener('resize', desenharTrilha);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenharTrilha);

  /* ---------- Ano no rodapé ---------- */
  $('#ano').textContent = String(new Date().getFullYear());
})();
