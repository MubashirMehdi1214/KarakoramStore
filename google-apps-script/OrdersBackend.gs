/**
 * KarakoramStore — Order backend (Google Apps Script)
 *
 * SETUP (one time, ~10 minutes):
 * 1. Go to https://sheets.google.com → New spreadsheet → name it "KarakoramStore Orders"
 * 2. Copy the Sheet ID from the URL: docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * 3. Go to https://script.google.com → New project → paste this entire file
 * 4. Set SHEET_ID, NOTIFY_EMAIL, ADMIN_PASSWORD below
 * 5. Run setupSheet() once from the editor (authorize when asked)
 * 6. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the Web App URL into js/site.js → orderApiUrl
 */

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const NOTIFY_EMAIL = 'munashirmehdi@gmail.com';
const ADMIN_PASSWORD = 'karakoram2026'; // change this to your own secret password

function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) sheet = ss.insertSheet('Orders');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date', 'Order ID', 'Product', 'Option', 'Price (PKR)', 'Payment',
      'Customer Name', 'Phone', 'City / Address', 'Email', 'Notes', 'Status'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1E565C').setFontColor('#ffffff');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders') || setupSheetAndGet();
    const orderId = 'KS-' + Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyyMMdd-HHmmss');
    const row = [
      new Date(),
      orderId,
      data.product || '',
      data.option || '',
      data.price || '',
      data.payment || 'Cash on Delivery',
      data.name || '',
      data.phone || '',
      data.city || '',
      data.email || '',
      data.notes || '',
      'New'
    ];
    sheet.appendRow(row);

    const body =
      'New Cash on Delivery order on KarakoramStore\n\n' +
      'Order ID: ' + orderId + '\n' +
      'Product: ' + (data.product || '') + '\n' +
      'Option: ' + (data.option || '') + '\n' +
      'Price: ' + (data.price || '') + '\n' +
      'Payment: ' + (data.payment || 'COD') + '\n\n' +
      'Customer: ' + (data.name || '') + '\n' +
      'Phone: ' + (data.phone || '') + '\n' +
      'Address: ' + (data.city || '') + '\n' +
      (data.email ? 'Email: ' + data.email + '\n' : '') +
      (data.notes ? '\nNotes:\n' + data.notes : '') + '\n\n' +
      'Open your dashboard:\n' +
      'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit\n';

    GmailApp.sendEmail(
      NOTIFY_EMAIL,
      '[KarakoramStore] New COD Order — ' + orderId,
      body,
      { name: 'KarakoramStore Orders' }
    );

    return jsonOut({ ok: true, orderId: orderId });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const p = e.parameter;
  if (p.password !== ADMIN_PASSWORD) {
    return jsonOut({ ok: false, error: 'Unauthorized' });
  }
  if (p.action === 'orders') {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    const values = sheet.getDataRange().getValues();
    const headers = values.shift();
    const orders = values.reverse().slice(0, 200).map(function(row) {
      const o = {};
      headers.forEach(function(h, i) { o[h] = row[i]; });
      return o;
    });
    return jsonOut({ ok: true, orders: orders });
  }
  return jsonOut({ ok: true, message: 'KarakoramStore Orders API' });
}

function setupSheetAndGet() {
  setupSheet();
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
