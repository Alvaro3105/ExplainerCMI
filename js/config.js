/*
 * ExplAIner · Landing CMI — configuração central de endereços.
 *
 * - plataformaUrl: endereço da plataforma (área do estudante). Os botões e links da página já
 *   trazem esse endereço no HTML; este campo só precisa mudar se a plataforma mudar de endereço.
 *   Nesse caso, gere também um QR Code novo: python tools/gerar_qrcode.py https://NOVO-ENDERECO/
 * - instagramUrl / instagramUsuario: enquanto estiverem vazios, os links do Instagram ficam ocultos.
 *
 * Endereço público desta landing (GitHub Pages): https://alvaro3105.github.io/ExplainerCMI/
 * Se ele mudar, atualize também og:url, og:image, twitter:image e canonical no index.html.
 */
window.EXPLAINER_CONFIG = {
  // Plataforma hospedada no PythonAnywhere (o QR Code da página aponta para o mesmo endereço).
  plataformaUrl: "https://explainerprojeto.pythonanywhere.com/",

  // Perfil oficial no Instagram. Ex.: "https://www.instagram.com/SEU_PERFIL/"
  instagramUrl: "",

  // Nome de usuário exibido ao lado do ícone, sem o @. Ex.: "SEU_PERFIL"
  instagramUsuario: ""
};
