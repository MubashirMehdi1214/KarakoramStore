/* Site-wide settings */
const SITE = {
  name: "KarakoramStore",
  phone: "+92 311 5189291",
  phoneTel: "+923115189291",
  whatsapp: "923115189291",
  email: "munashirmehdi@gmail.com",
  hours: "Mon–Fri, 9am–6pm",
  location: "Gilgit-Baltistan, Pakistan",
  codLabel: "Cash on Delivery",
  codNote: "Pay when your order arrives — available across Pakistan.",

  /* Order notifications — see SETUP-ORDERS.md */
  orderNotifyEmail: "munashirmehdi@gmail.com",
  orderApiUrl: "", // paste Google Apps Script Web App URL for dashboard — see SETUP-ORDERS.md
  adminPassword: "karakoram2026",

  easypaisaAccount: "03115189291",
  jazzcashAccount: "03419485217"
};

if (typeof module !== "undefined") {
  module.exports = { SITE };
}
