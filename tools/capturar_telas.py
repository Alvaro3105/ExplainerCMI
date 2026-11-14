"""Refaz as capturas reais de assets/telas/ a partir da plataforma rodando localmente.

As telas vêm da própria plataforma (Alvaro3105/Explainer), num banco vazio e sem chave de IA:
as questões saem do banco local de questões, e o gabarito é lido do banco SQLite da execução.

1. Na pasta da plataforma, inicie o servidor com um banco NOVO, sem IA e sem limites de geração
   (bash):

       DATABASE_URL=sqlite:////tmp/telas-landing.db GEMINI_API_KEY= OPENAI_API_KEY= \\
       INTERVALO_ENTRE_GERACOES=0 GERACOES_POR_JANELA=0 GERACOES_POR_DIA=0 \\
       CADASTROS_POR_HORA_POR_IP=0 python backend/app.py

2. Nesta pasta, com o Playwright e o Pillow instalados (pip install playwright pillow):

       python tools/capturar_telas.py http://127.0.0.1:5000 /tmp/telas-landing.db

   O script cria as contas de demonstração estudante01..05 (que jogam uma fase pela API) e
   visitante (que joga no navegador), e grava os WebP em assets/telas/.
   Usa o Edge ou o Chrome instalado; sem eles, o Chromium do Playwright (playwright install chromium).
"""
import io
import sqlite3
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets" / "telas"
SENHA = "demonstracao123"
# acertos de cada conta de demonstração numa fase de 5 questões (o ranking fica variado)
DEMONSTRACAO = [5, 5, 4, 4, 3]


def main(base, banco):
    def gabarito(enunciado):
        con = sqlite3.connect(f"file:{Path(banco).as_posix()}?mode=ro", uri=True)
        try:
            return con.execute('SELECT alternativa_correta FROM "Questao" WHERE enunciado = ? ORDER BY id_questao DESC',
                               (enunciado.strip(),)).fetchone()[0]
        finally:
            con.close()

    def salvar(png, nome, largura, qualidade=82):
        img = Image.open(io.BytesIO(png)).convert("RGB")
        if img.width != largura:
            img = img.resize((largura, round(img.height * largura / img.width)), Image.LANCZOS)
        img.save(SAIDA / f"{nome}.webp", "WEBP", quality=qualidade, method=6)
        print(f"  {nome}.webp {img.size}")

    with sync_playwright() as p:
        nav = None
        for opcoes in ({"channel": "msedge"}, {"channel": "chrome"}, {}):
            try:
                nav = p.chromium.launch(headless=True, **opcoes)
                break
            except Exception:  # noqa: BLE001 - tenta o próximo navegador
                continue
        if nav is None:
            sys.exit("Nenhum navegador disponível para o Playwright.")

        # --- contas de demonstração: cada uma joga uma fase de Sistema Solar pela API ---
        for n, acertos in enumerate(DEMONSTRACAO, 1):
            api = p.request.new_context(base_url=base)
            api.post("/api/auth/register", data={"nome": f"Estudante {n}", "nick": f"estudante0{n}",
                                                  "email": f"estudante0{n}@demo.local", "senha": SENHA,
                                                  "aceite_termos": True})
            mat = next(m for m in api.get("/api/learning/catalog?q=fisica").json()["materias"] if m["nome"] == "Física")
            tema = next(t for t in api.get(f"/api/learning/catalog/{mat['id_materia']}/themes?q=sistema solar").json()["temas"]
                        if t["nome"] == "Sistema Solar")
            dados = api.post("/api/learning/challenges", data={"id_tema": tema["id_tema"], "id_materia": mat["id_materia"],
                                                               "quantidade_questoes": 5, "dificuldade": "normal"}).json()
            id_desafio = dados["desafio"]["id_desafio"]
            for i, q in enumerate(dados["questoes"]):
                certa = gabarito(q["enunciado"])
                letra = certa if i < acertos else next(l for l in "ABCD" if l != certa)
                api.post(f"/api/learning/challenges/{id_desafio}/answer",
                         data={"id_questao": q["id_questao"], "alternativa": letra, "segundos_gastos": 15})
            api.post(f"/api/learning/challenges/{id_desafio}/complete", data={})
            api.dispose()

        ctx = nav.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=1.25, locale="pt-BR")
        pg = ctx.new_page()

        def clicar(seletor):
            pg.wait_for_selector(seletor, state="attached", timeout=15000)
            pg.evaluate("s => document.querySelector(s).click()", seletor)

        def tela(nome, espera=700):
            pg.wait_for_timeout(espera)
            salvar(pg.screenshot(), nome, 1600)

        # --- acesso e cadastro do visitante ---
        pg.goto(base + "/")
        pg.wait_for_selector("#tela-acesso:not([hidden])")
        tela("acesso")
        clicar("#aba-acesso-cadastro")
        f = "#formulario-cadastro"
        pg.fill(f + " input[name=nome]", "Visitante do CMI")
        pg.fill(f + " input[name=nick]", "visitante")
        pg.fill(f + " input[name=email]", "visitante@demo.local")
        pg.fill(f + " input[name=senha]", SENHA)
        pg.check(f + " input[name=aceite_termos]")
        clicar(f + " button[type=submit]")
        pg.wait_for_selector("#estrutura-app:not([hidden])")

        # --- montagem da jornada ---
        pg.click("#entrada-materia")
        pg.type("#entrada-materia", "fis", delay=20)
        pg.keyboard.press("Enter")
        pg.wait_for_function("() => !document.querySelector('#entrada-tema').disabled")
        pg.click("#entrada-tema")
        pg.type("#entrada-tema", "sistema solar", delay=20)
        pg.wait_for_function("() => [...document.querySelectorAll('#busca-tema [role=option]')]"
                             ".some(o => o.innerText.includes('Sistema Solar'))")
        pg.keyboard.press("Enter")
        clicar("input[name=quantidade][value='5']")
        pg.mouse.click(5, 5)
        tela("montagem")

        # --- fase: 4 acertos e 1 erro (a 4ª questão) ---
        clicar("#botao-criar-desafio")
        pg.wait_for_selector("#tela-mapa-desafio:not([hidden])", timeout=20000)
        pg.wait_for_function("() => document.querySelectorAll('.bolinha-mapa').length === 5")
        for i in range(5):
            pg.evaluate("i => document.querySelectorAll('.bolinha-mapa')[i].click()", i)
            pg.wait_for_selector("#janela-quiz:not([hidden])")
            pg.wait_for_function("() => document.querySelector('#titulo-questao-quiz').innerText.trim().length > 5")
            certa = gabarito(pg.evaluate("() => document.querySelector('#titulo-questao-quiz').innerText"))
            letra = certa if i != 3 else next(l for l in "ABCD" if l != certa)
            clicar(f".opcao-resposta[data-resposta='{letra}']")
            if i == 1:
                tela("questao")
            clicar("#proxima-questao")
            pg.wait_for_selector("#retorno-resposta:not([hidden])")
            pg.wait_for_function("() => !document.querySelector('#proxima-questao').disabled")
            if i == 0:
                pg.wait_for_timeout(700)
                salvar(pg.locator(".moldura-quiz").screenshot(), "acerto", 1200)
            if i == 3:
                tela("erro")
            pg.wait_for_timeout(400)
            clicar("#proxima-questao")
            if i < 4:
                pg.wait_for_function("i => /acertou|errou/.test(document.querySelectorAll('.bolinha-mapa')[i]"
                                     ".getAttribute('aria-label') || '')", arg=i)
                if i == 3:
                    tela("mapa")

        pg.wait_for_selector("#resultado-quiz:not([hidden])", timeout=15000)
        tela("resultado", espera=4500)   # espera a comemoração terminar
        clicar("#finalizar-quiz")
        pg.wait_for_timeout(1200)
        if pg.evaluate("() => !!document.querySelector('#tela-mapa-desafio:not([hidden])')"):
            clicar("#fechar-mapa-rodape")
        pg.wait_for_timeout(600)
        pg.evaluate("() => window.scrollTo(0, 0)")
        tela("inicio")

        clicar(".item-nav[data-visao='ranking']")
        pg.wait_for_function("() => (document.querySelector('[data-ranking=pagina]')?.innerText || '').includes('visitante')")
        tela("ranking")
        clicar(".item-nav[data-visao='progresso']")
        pg.wait_for_function("() => document.querySelector('#corpo-tabela-historico').innerText.includes('Sistema Solar')")
        tela("progresso")
        ctx.close()

        # --- celular ---
        cel = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, locale="pt-BR",
                              is_mobile=True, has_touch=True)
        pg = cel.new_page()
        pg.goto(base + "/")
        pg.wait_for_selector("#tela-acesso:not([hidden])")
        pg.fill("#formulario-login input[name=email]", "visitante@demo.local")
        pg.fill("#formulario-login input[name=senha]", SENHA)
        pg.evaluate("() => document.querySelector('#formulario-login button[type=submit]').click()")
        pg.wait_for_selector("#estrutura-app:not([hidden])")
        pg.wait_for_timeout(900)
        salvar(pg.screenshot(), "celular", 780)
        cel.close()
        nav.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Uso: python tools/capturar_telas.py http://127.0.0.1:5000 CAMINHO/DO/BANCO.db")
    SAIDA.mkdir(parents=True, exist_ok=True)
    main(sys.argv[1].rstrip("/"), sys.argv[2])
