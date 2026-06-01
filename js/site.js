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
  orderApiUrl: "", // paste Google Apps Script Web App URL after setup
  web3formsAccessKey: "", // optional: from https://web3forms.com (quick email-only)
  adminPassword: "karakoram2026" // must match ADMIN_PASSWORD in Google Apps Script
};

if (typeof module !== "undefined") {
  module.exports = { SITE };
}
