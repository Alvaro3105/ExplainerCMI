# ExplAIner · Landing CMI

Página institucional do **ExplAIner** para o **Circuito Mineiro de Inovação (CMI)**: apresentação no computador do estande e link da bio do Instagram. Os botões e o QR Code da página levam direto à plataforma.

**Site no ar:** https://alvaro3105.github.io/ExplainerCMI/

**Plataforma:** https://explainerprojeto.pythonanywhere.com/

A plataforma em si está em [Alvaro3105/Explainer](https://github.com/Alvaro3105/Explainer). Esta landing **não altera** a plataforma: é um site estático (HTML, CSS e JavaScript, sem dependências e sem build) que reaproveita a identidade visual da área do estudante.

## Endereços e situação

| O quê | Onde | Situação |
|---|---|---|
| Endereço da plataforma | `index.html` (links com `data-link="plataforma"`) e `js/config.js` → `plataformaUrl` | **Pronto.** Todos os botões abrem https://explainerprojeto.pythonanywhere.com/ em nova aba. |
| Instagram oficial | `js/config.js` → `instagramUrl` e `instagramUsuario` | **Pendente.** Sem ele, os links do Instagram ficam ocultos. |
| QR Code | `assets/qrcode-plataforma.svg` (página) e `assets/qrcode-plataforma.png` (impressão, 1200 px) | **Pronto.** Abre https://explainerprojeto.pythonanywhere.com/ |
| Prévia no WhatsApp/Instagram | `index.html` → `og:url`, `og:image`, `twitter:image` | **Pronto.** Usa o endereço do GitHub Pages. |

Nenhum desses endereços foi inventado. O endereço da plataforma já está escrito no HTML, então os botões funcionam mesmo sem JavaScript; `js/config.js` só precisa mudar se a plataforma mudar de endereço (e, nesse caso, gere um QR Code novo). As tags de compartilhamento ficam no HTML porque os aplicativos de mensagem não executam JavaScript.

## Estrutura

```
index.html                 página única, HTML semântico
css/landing.css            estilos e tokens (mesmos --corN de frontend/estudar.css da plataforma)
js/config.js               endereços oficiais (único ponto de configuração)
js/landing.js              menu, seção ativa, jornada, galeria, links
assets/telas/*.webp        capturas reais da plataforma (ver "Capturas")
assets/marca/              logotipo (o mesmo da plataforma), astronauta, favicon e imagem de compartilhamento (1200×630)
assets/qrcode-plataforma.* QR Code da plataforma (SVG para a página, PNG para impressão)
assets/fontes/             Montserrat (a mesma da plataforma, licença OFL)
assets/decoracao/          estrelas e formas usadas pela plataforma
tools/gerar_qrcode.py      gera e confere o QR Code da plataforma
tools/capturar_telas.py    refaz as capturas a partir da plataforma rodando localmente
```

## Como publicar

Escolha **uma** das opções. Todas as referências da página são relativas, então ela funciona na raiz de um domínio ou dentro de uma pasta.

### Opção A — dentro da própria plataforma (recomendada)

O Flask do ExplAIner já serve a pasta `frontend/` como arquivos estáticos e sem login. Basta copiar esta landing para `frontend/cmi/`:

```bash
cp -r index.html css js assets ../Explainer/frontend/cmi/
```

A página fica em `https://SEU-ENDERECO/cmi/index.html`, e em `js/config.js` o endereço da plataforma pode ser só `"/"` (o script troca o destino de todos os botões ao carregar). Isso foi testado com o servidor da plataforma: todas as páginas e arquivos respondem 200, sem mexer no backend.

Para um endereço mais curto (`/cmi`), seria preciso adicionar uma rota em `backend/app.py` (opcional, não incluída aqui para não alterar o backend):

```python
@app.get("/cmi")
def landing_cmi():
    return send_from_directory(os.path.join(frontend_path, "cmi"), "index.html")
```

### Opção B — GitHub Pages deste repositório (em uso)

O site é publicado a partir da branch `gh-pages`, na pasta raiz (`/`), em https://alvaro3105.github.io/ExplainerCMI/. Para atualizar o site, envie as mudanças para a `main` e também para a `gh-pages`, ou mude em *Settings → Pages* a fonte para a `main`.

## QR Code

O QR Code fica no cartão "Está no estande?", na seção final, e abre direto a plataforma: https://explainerprojeto.pythonanywhere.com/. Ele é gerado localmente, sem serviço externo, e fica no repositório:

- `assets/qrcode-plataforma.svg`: usado na página (vetorial, nítido em qualquer tamanho);
- `assets/qrcode-plataforma.png`: 1200 px, para impressão.

Para gerar de novo (por exemplo, se a plataforma mudar de endereço):

```bash
pip install "qrcode[pil]" opencv-python-headless
```

```bash
python tools/gerar_qrcode.py https://NOVO-ENDERECO/
```

O script grava os dois arquivos e lê o PNG de volta para conferir que o conteúdo é exatamente o endereço informado. Sem argumento, usa o endereço atual da plataforma. Depois, atualize os links com `data-link="plataforma"` no `index.html`, o texto do link abaixo do QR e `js/config.js`. Teste a leitura com dois celulares antes de imprimir.

## Capturas de tela

As imagens em `assets/telas/` são capturas **reais** da plataforma, feitas com o Playwright a partir do código de `Alvaro3105/Explainer` rodando localmente (banco SQLite, banco local de questões, sem chave de IA). O ranking usa contas de demonstração (`estudante01` a `estudante05` e `visitante`), e a página informa isso na seção de demonstração.

Para refazer as capturas depois de mudanças na plataforma, rode a plataforma localmente com um banco de teste e use:

```bash
python tools/capturar_telas.py http://127.0.0.1:5000 CAMINHO/DO/BANCO_DE_TESTE.db
```

O script cria as contas de demonstração, joga uma fase de Física › Sistema Solar e salva as imagens em `assets/telas/`. Use sempre um banco de teste, nunca o de produção.

## Decisões de design

- **Identidade:** paleta, fonte (Montserrat), botão lima com "degrau" 3D, bolinhas de fase, astronauta em pixel art e céu com cruzes vêm da área do estudante (`frontend/estudar.css` e `frontend/assets/`).
- **Narrativa:** o que é → problema → solução → jornada → funcionalidades → para quem é → demonstração → propósito → convite. A página fala com estudantes, visitantes curiosos e possíveis parceiros e investidores, sem detalhes técnicos.
- **Fidelidade:** toda funcionalidade, regra de pontuação e tecnologia citada foi conferida no código e no README da plataforma. O texto do problema e o lema do propósito vêm da apresentação da equipe.
- **Acessibilidade:** HTML semântico, link "pular para o conteúdo", abas com teclado (setas, Home, End), foco visível, textos alternativos, contraste AA e respeito a "reduzir movimento".
- **Desempenho:** sem bibliotecas externas; imagens em WebP (cerca de 590 KB no total, carregadas sob demanda abaixo da primeira dobra) e fontes locais com `font-display: swap`.
- **Cache:** o GitHub Pages deixa os navegadores guardarem os arquivos por alguns minutos. Por isso o `index.html` chama o CSS, o JS e as capturas com `?v=AAAAMMDD`. Ao alterar `css/landing.css`, `js/*.js` ou `assets/telas/*`, troque esse número no `index.html` e no `js/landing.js` (todas as ocorrências) para que ninguém veja a página nova com arquivos antigos.
