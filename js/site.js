/* Site-wide settings (contact from LifeWithBooks) */
const SITE = {
  name: "KarakoramStore",
  phone: "+92 318 0699050",
  phoneTel: "+923180699050",
  whatsapp: "923180699050",
  email: "info@lifewithbooks.com",
  hours: "Mon–Fri, 9am–6pm",
  location: "Gilgit-Baltistan, Pakistan",
  codLabel: "Cash on Delivery",
  codNote: "Pay when your order arrives — available across Pakistan.",

  /* Order notifications — see SETUP-ORDERS.md */
  orderNotifyEmail: "munashirmehdi@gmail.com",
  orderApiUrl: "", // paste Google Apps Script Web App URL for dashboard — see SETUP-ORDERS.md
  adminPassword: "karakoram2026",

  easypaisaAccount: "03XX XXXXXXX", // your Easypaisa number — shown to customers
  jazzcashAccount: "03XX XXXXXXX"  // your JazzCash number
};

if (typeof module !== "undefined") {
  module.exports = { SITE };
}
