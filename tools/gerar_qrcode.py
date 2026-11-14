"""Gera o QR Code oficial do ExplAIner, que abre direto a plataforma.

Uso:

    pip install "qrcode[pil]"
    python tools/gerar_qrcode.py                      # usa o endereço oficial da plataforma
    python tools/gerar_qrcode.py https://OUTRO-ENDERECO/

Saída (módulos escuros sobre fundo branco, com a margem de segurança de 4 módulos):
    assets/qrcode-plataforma.svg   usado na página (vetorial, nítido em qualquer tamanho)
    assets/qrcode-plataforma.png   1200 x 1200 px, para impressão em banner, cartaz ou mesa

Se tiver o OpenCV instalado (pip install opencv-python-headless), o script lê o PNG gerado
e confere se o conteúdo decodificado é exatamente o endereço pedido.

O script recusa endereços sem https:// para evitar um QR Code que leve a um link provisório.
"""
import sys
from pathlib import Path

try:
    import qrcode
    import qrcode.image.svg
    from qrcode.constants import ERROR_CORRECT_Q
except ImportError:
    sys.exit('Instale a biblioteca antes: pip install "qrcode[pil]"')

RAIZ = Path(__file__).resolve().parent.parent
PLATAFORMA = "https://explainerprojeto.pythonanywhere.com/"
COR_ESCURA = "#131F24"  # --cor1 da plataforma: contraste máximo sobre branco
MARGEM = 4               # quiet zone recomendada pela norma do QR Code


def _qr(url):
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, box_size=10, border=MARGEM)
    qr.add_data(url)
    qr.make(fit=True)
    return qr


def _conferir(png, url):
    try:
        import cv2
    except ImportError:
        print("  (OpenCV não instalado: confira a leitura com a câmera do celular)")
        return
    lido, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread(str(png)))
    if lido != url:
        sys.exit(f"ERRO: o QR Code gerado foi lido como {lido!r}, e não {url!r}")
    print(f"  Leitura conferida: {lido}")


def gerar(url):
    if not url.startswith("https://"):
        sys.exit("Informe o endereço completo e definitivo, começando com https://")
    destino = RAIZ / "assets"

    imagem = _qr(url).make_image(fill_color=COR_ESCURA, back_color="white").convert("RGB")
    png = destino / "qrcode-plataforma.png"
    imagem.resize((1200, 1200), resample=0).save(png)

    svg = _qr(url).make_image(image_factory=qrcode.image.svg.SvgPathFillImage)
    texto = (svg.to_string(encoding="unicode")
             .replace('fill="#000000"', f'fill="{COR_ESCURA}"')
             .replace('stroke="none"', 'stroke="none" shape-rendering="crispEdges"'))
    (destino / "qrcode-plataforma.svg").write_text(texto, encoding="utf-8")

    print(f"QR Code gerado para {url}")
    print(f"  {destino / 'qrcode-plataforma.svg'} (página)")
    print(f"  {png} (impressão)")
    _conferir(png, url)
    print("Teste também com a câmera de dois celulares diferentes antes de imprimir.")


if __name__ == "__main__":
    if len(sys.argv) > 2:
        sys.exit("Uso: python tools/gerar_qrcode.py [https://ENDERECO/]")
    gerar(sys.argv[1].strip() if len(sys.argv) == 2 else PLATAFORMA)
