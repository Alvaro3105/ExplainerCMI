# ExplAIner · Landing CMI

Página institucional do **ExplAIner** para o **Circuito Mineiro de Inovação (CMI)**: apresentação no computador do estande, link da bio do Instagram e destino do QR Code.

A plataforma em si está em [Alvaro3105/Explainer](https://github.com/Alvaro3105/Explainer). Esta landing **não altera** a plataforma: é um site estático (HTML, CSS e JavaScript, sem dependências e sem build) que reaproveita a identidade visual da área do estudante.

## Antes do evento: o que precisa ser preenchido

| O quê | Onde | Situação |
|---|---|---|
| Endereço da plataforma | `js/config.js` → `plataformaUrl` | **Pendente.** Sem ele, os botões aparecem desativados com o selo "em breve". |
| Instagram oficial | `js/config.js` → `instagramUrl` e `instagramUsuario` | **Pendente.** Sem ele, os links do Instagram ficam ocultos. |
| QR Code | `js/config.js` → `qrCodeImagem` e `landingUrlVisivel` | **Pendente.** Gere depois de publicar a landing (veja abaixo). |
| Prévia no WhatsApp/Instagram | `index.html` → tags marcadas com `CONFIGURAR` | **Pendente.** `og:image` e `twitter:image` precisam do endereço absoluto; descomente `og:url`. |

Nenhum desses endereços foi inventado. Tudo fica em um só arquivo (`js/config.js`), exceto as tags de compartilhamento, que precisam estar no HTML porque os aplicativos de mensagem não executam JavaScript.

## Estrutura

```
index.html                 página única, HTML semântico
css/landing.css            estilos e tokens (mesmos --corN de frontend/estudar.css da plataforma)
js/config.js               endereços oficiais (único ponto de configuração)
js/landing.js              menu, seção ativa, jornada, galeria, links
assets/telas/*.webp        capturas reais da plataforma (ver "Capturas")
assets/marca/              logotipo, astronauta, favicon e imagem de compartilhamento (1200×630)
assets/fontes/             Montserrat (a mesma da plataforma, licença OFL)
assets/decoracao/          estrelas e formas usadas pela plataforma
tools/gerar_qrcode.py      gera o QR Code definitivo
tools/capturar_telas.js    refaz as capturas a partir da plataforma rodando localmente
```

## Como publicar

Escolha **uma** das opções. Todas as referências da página são relativas, então ela funciona na raiz de um domínio ou dentro de uma pasta.

### Opção A — dentro da própria plataforma (recomendada)

O Flask do ExplAIner já serve a pasta `frontend/` como arquivos estáticos e sem login. Basta copiar esta landing para `frontend/cmi/`:

```bash
cp -r index.html css js assets ../Explainer/frontend/cmi/
```

A página fica em `https://SEU-ENDERECO/cmi/index.html`, e em `js/config.js` o endereço da plataforma pode ser só `"/"`. Isso foi testado com o servidor da plataforma: todas as páginas e arquivos respondem 200, sem mexer no backend.

Para um endereço mais curto (`/cmi`), seria preciso adicionar uma rota em `backend/app.py` (opcional, não incluída aqui para não alterar o backend):

```python
@app.get("/cmi")
def landing_cmi():
    return send_from_directory(os.path.join(frontend_path, "cmi"), "index.html")
```

### Opção B — GitHub Pages deste repositório

Em *Settings → Pages*, escolha a branch e a pasta raiz (`/`). O endereço será `https://<usuario>.github.io/ExplainerCMI/`.

## QR Code

Só gere o QR Code depois que o endereço definitivo da landing estiver publicado e funcionando.

```bash
pip install "qrcode[pil]"
```

```bash
python tools/gerar_qrcode.py https://SEU-ENDERECO-DA-LANDING/
```

O script cria `assets/qrcode-landing.png` (1200 px, para impressão) e `assets/qrcode-landing-web.png` (para a página). Depois, em `js/config.js`:

```js
qrCodeImagem: "assets/qrcode-landing-web.png",
landingUrlVisivel: "SEU-ENDERECO-DA-LANDING"
```

O bloco "Está no estande?" aparece sozinho na seção final. Teste a leitura com dois celulares antes de imprimir.

## Capturas de tela

As imagens em `assets/telas/` são capturas **reais** da plataforma, feitas com o Playwright a partir do código de `Alvaro3105/Explainer` rodando localmente (banco SQLite, banco local de questões, sem chave de IA). O ranking usa contas de demonstração (`estudante01` a `estudante05` e `visitante`), e a página informa isso na seção de demonstração.

Para refazer as capturas depois de mudanças na plataforma, veja os comentários em `tools/capturar_telas.js`.

## Decisões de design

- **Identidade:** paleta, fonte (Montserrat), botão lima com "degrau" 3D, bolinhas de fase, astronauta em pixel art e céu com cruzes vêm da área do estudante (`frontend/estudar.css` e `frontend/assets/`).
- **Narrativa:** o que é → problema → solução → jornada → funcionalidades → para quem é → demonstração → propósito → convite. A página fala com estudantes, visitantes curiosos e possíveis parceiros e investidores, sem detalhes técnicos.
- **Fidelidade:** toda funcionalidade, regra de pontuação e tecnologia citada foi conferida no código e no README da plataforma. O texto do problema e o lema do propósito vêm da apresentação da equipe.
- **Acessibilidade:** HTML semântico, link "pular para o conteúdo", abas com teclado (setas, Home, End), foco visível, textos alternativos, contraste AA e respeito a "reduzir movimento".
- **Desempenho:** sem bibliotecas externas; imagens em WebP (cerca de 550 KB no total, carregadas sob demanda abaixo da primeira dobra) e fontes locais com `font-display: swap`.
