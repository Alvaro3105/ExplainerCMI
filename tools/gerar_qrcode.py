"""Gera o QR Code oficial da landing do ExplAIner para o estande do CMI.

Uso (depois que o endereço definitivo da landing existir):

    pip install "qrcode[pil]"
    python tools/gerar_qrcode.py https://SEU-ENDERECO-DA-LANDING/

Saída:
    assets/qrcode-landing.png   (1200 x 1200 px, para impressão em banner, cartaz ou mesa)
    assets/qrcode-landing-web.png (360 x 360 px, usado na própria página)

Depois, em js/config.js, preencha:
    qrCodeImagem: "assets/qrcode-landing-web.png",
    landingUrlVisivel: "SEU-ENDERECO-DA-LANDING"

O script recusa endereços sem https:// para evitar um QR Code que leve a um link provisório.
"""
import sys
from pathlib import Path

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_Q
except ImportError:
    sys.exit('Instale a biblioteca antes: pip install "qrcode[pil]"')

RAIZ = Path(__file__).resolve().parent.parent
COR_ESCURA = "#1E2C32"  # --cor4 da plataforma: contraste alto sobre branco, leitura segura


def gerar(url: str) -> None:
    if not url.startswith("https://"):
        sys.exit("Informe o endereço completo e definitivo, começando com https://")
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    imagem = qr.make_image(fill_color=COR_ESCURA, back_color="white").convert("RGB")
    destino = RAIZ / "assets"
    imagem.resize((1200, 1200), resample=0).save(destino / "qrcode-landing.png")
    imagem.resize((360, 360), resample=0).save(destino / "qrcode-landing-web.png")
    print(f"QR Code gerado para {url}")
    print(f"  {destino / 'qrcode-landing.png'} (impressão)")
    print(f"  {destino / 'qrcode-landing-web.png'} (página)")
    print("Teste com a câmera de dois celulares diferentes antes de imprimir.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python tools/gerar_qrcode.py https://SEU-ENDERECO-DA-LANDING/")
    gerar(sys.argv[1].strip())
