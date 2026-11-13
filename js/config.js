/*
 * ExplAIner · Landing CMI — configuração central de endereços.
 *
 * Este é o ÚNICO lugar para colocar os links oficiais. Enquanto um campo estiver vazio:
 *  - os botões que levam à plataforma aparecem desativados, com o aviso "Link em breve";
 *  - os links do Instagram ficam ocultos;
 *  - o bloco de QR Code não aparece.
 * Nenhum endereço foi inventado: preencha com os valores reais antes do evento.
 *
 * Também atualize, no <head> do index.html, as tags marcadas com "CONFIGURAR"
 * (og:url, og:image e twitter:image precisam de endereço absoluto para a prévia
 * funcionar no WhatsApp e no Instagram, já que esses serviços não executam JavaScript).
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
  qrCodeImagem: "",

  // Endereço público desta landing, mostrado embaixo do QR Code. Ex.: "explainer.exemplo.com"
  landingUrlVisivel: ""
};
