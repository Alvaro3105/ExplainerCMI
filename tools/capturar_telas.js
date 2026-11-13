/*
 * Refaz as capturas reais de assets/telas/ a partir da plataforma rodando localmente.
 *
 * 1. Na pasta da plataforma (Alvaro3105/Explainer), com o banco vazio e sem chave de IA
 *    (as questões vêm do banco local), inicie:  python backend/app.py
 * 2. Gere o gabarito do banco local, usado para mostrar acertos reais (rode em backend/):
 *    python -c "import json;from services.aprendizado.gerador_questoes import BANCO_TEMATICO,LETRAS;json.dump({e.strip():o[LETRAS.index(c)] for q in BANCO_TEMATICO.values() for e,o,c,x in q},open('gabarito.json','w'),ensure_ascii=False)"
 *    e copie gabarito.json para esta pasta (tools/).
 * 3. Rode:  node tools/capturar_telas.js /pasta/de/saida
 *    (cria as contas de demonstração estudante01..05 e visitante e salva PNGs "raw-*")
 * 4. Recorte e converta para WebP (1600 px de largura nas telas cheias, qualidade 82).
 */
// Captura telas reais da plataforma ExplAIner rodando localmente (banco local de questões, sem chave de IA).
// As respostas certas vêm do próprio banco local da plataforma (gabarito.json), para mostrar acertos reais.
const { chromium, request } = require('playwright');
const path = require('path');
const OUT = process.argv[2];
const GAB = require(path.join(__dirname, 'gabarito.json'));
const BASE = 'http://127.0.0.1:5000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const letraCerta = (q) => Object.keys(q.alternativas).find((l) => q.alternativas[l] === GAB[q.enunciado.trim()]);
const letraErrada = (q) => Object.keys(q.alternativas).find((l) => q.alternativas[l] !== GAB[q.enunciado.trim()]);

async function seed() {
  // Contas de demonstração (estudante01..05) para o ranking ter conteúdo.
  const perfis = [[5, 5], [5, 4], [4, 4], [4], [3]]; // acertos por fase jogada
  for (let i = 0; i < perfis.length; i++) {
    const ctx = await request.newContext({ baseURL: BASE });
    const email = `estudante0${i + 1}@demo.local`;
    await ctx.post('/api/auth/register', { data: { nome: `Estudante ${i + 1}`, nick: `estudante0${i + 1}`, email, senha: 'demonstracao123', aceite_termos: true } });
    const cat = await (await ctx.get('/api/learning/catalog')).json();
    const temas = [];
    JSON.stringify(cat, (k, v) => { if (v && v.id_tema && !temas.find((t) => t.id_tema === v.id_tema)) temas.push(v); return v; });
    for (const [f, acertos] of perfis[i].entries()) {
      const tema = temas[(i * 3 + f) % temas.length];
      const c = await (await ctx.post('/api/learning/challenges', { data: { id_tema: tema.id_tema, quantidade_questoes: 5, dificuldade: 'normal' } })).json();
      const d = c.desafio || c;
      const qs = d.questoes || c.questoes || [];
      for (let q = 0; q < qs.length; q++) {
        await ctx.post(`/api/learning/challenges/${d.id_desafio}/answer`, { data: { id_questao: qs[q].id_questao, alternativa: q < acertos ? letraCerta(qs[q]) : letraErrada(qs[q]), segundos_gastos: 15 } });
      }
      await ctx.post(`/api/learning/challenges/${d.id_desafio}/complete`, { data: {} });
    }
    await ctx.dispose();
  }
}

async function letraNaTela(page, certa) {
  return page.evaluate(([gab, certa]) => {
    const enun = document.getElementById('titulo-questao-quiz').textContent.trim();
    const alvo = gab[enun];
    const bts = [...document.querySelectorAll('.opcao-resposta')];
    const b = bts.find((x) => (x.querySelector('.texto-resposta').textContent === alvo) === certa);
    return b.dataset.resposta;
  }, [GAB, certa]);
}

(async () => {
  await seed();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(BASE + '/');
  await sleep(1200);
  await page.screenshot({ path: `${OUT}/raw-login.png` });

  await page.click('#aba-acesso-cadastro');
  const f = page.locator('#formulario-cadastro');
  await f.locator('input[name=nome]').fill('Visitante CMI');
  await f.locator('input[name=nick]').fill('visitante');
  await f.locator('input[name=email]').fill('visitante@demo.local');
  await f.locator('input[name=senha]').fill('demonstracao123');
  await f.locator('input[name=aceite_termos]').check();
  await f.locator('button[type=submit]').click();
  await sleep(2500);

  await page.selectOption('#selecao-materia', { label: 'Ciências' });
  await sleep(300);
  await page.selectOption('#selecao-tema', { label: 'Sistema solar' });
  await sleep(400);
  await page.screenshot({ path: `${OUT}/raw-montagem.png` });
  await page.click('#botao-criar-desafio');
  await sleep(3000);
  await page.screenshot({ path: `${OUT}/raw-mapa.png` });

  for (let q = 0; q < 5; q++) {
    await page.click('.bolinha-mapa.bolinha-atual');
    await sleep(700);
    const certa = q !== 3; // 4 acertos e 1 erro
    const letra = await letraNaTela(page, certa);
    await page.click(`.opcao-resposta[data-resposta="${letra}"]`);
    await sleep(250);
    if (q === 0) await page.screenshot({ path: `${OUT}/raw-questao.png` });
    await page.click('#proxima-questao');
    await sleep(1300);
    await page.screenshot({ path: `${OUT}/raw-feedback-${q}.png` });
    await page.click('#proxima-questao');
    await sleep(1600);
    if (q === 3) await page.screenshot({ path: `${OUT}/raw-mapa-meio.png` });
  }
  await sleep(3500);
  await page.screenshot({ path: `${OUT}/raw-resultado.png` });
  // Fecha o elogio para ver o resultado limpo.
  const fechar = page.locator('#fechar-elogio');
  if (await fechar.isVisible()) { await fechar.click(); await sleep(900); }
  await page.screenshot({ path: `${OUT}/raw-resultado-limpo.png` });

  await page.goto(BASE + '/');
  await sleep(2500);
  await page.screenshot({ path: `${OUT}/raw-inicio.png` });
  await page.click('.item-nav[data-visao=ranking]');
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/raw-ranking.png` });
  await page.click('.item-nav[data-visao=progresso]');
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/raw-progresso.png` });

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addCookies(await page.context().cookies());
  const m = await ctx.newPage();
  await m.goto(BASE + '/');
  await sleep(2500);
  await m.screenshot({ path: `${OUT}/raw-mobile-inicio.png` });
  await browser.close();
})();
