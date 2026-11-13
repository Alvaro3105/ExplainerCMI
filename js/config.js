/*
 * ExplAIner · Landing CMI — configuração central de endereços.
 *
 * Este é o ÚNICO lugar para colocar os links oficiais. Enquanto um campo estiver vazio:
 *  - os botões que levam à plataforma aparecem desativados, com o aviso "Link em breve";
 *  - os links do Instagram ficam ocultos;
 *  - o bloco de QR Code não aparece.
 * Nenhum endereço foi inventado: preencha com os valores reais antes do evento.
 *
 * Endereço público desta landing (GitHub Pages): https://alvaro3105.github.io/ExplainerCMI/
 * Se ele mudar, atualize também og:url, og:image, twitter:image e canonical no index.html
 * e gere um novo QR Code com tools/gerar_qrcode.py.
 */
window.EXPLAINER_CONFIG = {
  // Endereço da plataforma (área do estudante). Ex.: "https://SEU-ENDERECO" ou "/" se a
  // landing for servida pelo próprio Flask do ExplAIner (veja o README).
  plataformaUrl: "",

  // Perfil oficial no Instagram. Ex.: "https://www.instagram.com/SEU_PERFIL/"
  instagramUrl: "",

  // Nome de usuário exibido ao lado do ícone, sem o @. Ex.: "SEU_PERFIL"
  instagramUsuario: "",

  // Imagem do QR Code que aponta para a landing (gere com tools/gerar_qrcode.py).
  // Ex.: "assets/qrcode-landing.png". Vazio = bloco de QR oculto.
  qrCodeImagem: "assets/qrcode-landing-web.png",

  // Endereço público desta landing, mostrado embaixo do QR Code. Ex.: "explainer.exemplo.com"
  landingUrlVisivel: "alvaro3105.github.io/ExplainerCMI"
};
