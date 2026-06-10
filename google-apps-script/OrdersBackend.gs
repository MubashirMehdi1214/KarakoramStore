/**
 * KarakoramStore — Order backend (Google Apps Script)
 * Dashboard at admin.html + emails to munashirmehdi@gmail.com
 *
 * SETUP: see SETUP-ORDERS.md
 */

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const NOTIFY_EMAIL = 'munashirmehdi@gmail.com';
const ADMIN_PASSWORD = 'karakoram2026';

function setupSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Orders');
  if (!sheet) sheet = ss.insertSheet('Orders');
  const headers = [
    'Date', 'Order ID', 'Product', 'Option', 'Subtotal (PKR)', 'Delivery (PKR)', 'Total (PKR)',
    'Payment', 'Transaction ID', 'Customer Name', 'Phone', 'City / Address', 'Email', 'Notes',
    'Est. Delivery', 'Screenshot', 'Status'
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1E565C').setFontColor('#ffffff');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders') || setupSheetAndGet();
    const orderId = 'KS-' + Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyyMMdd-HHmmss');

    sheet.appendRow([
      new Date(),
      orderId,
      data.product || '',
      data.option || '',
      data.subtotal || data.price || '',
      data.delivery || 'PKR 250',
      data.total || data.price || '',
      data.payment || 'Cash on Delivery',
      data.transactionId || '',
      data.name || '',
      data.phone || '',
      data.city || '',
      data.email || '',
      data.notes || '',
      data.deliveryEstimate || '3–5 business days',
      data.screenshotName ? 'Yes: ' + data.screenshotName : '',
      'New'
    ]);

    let body =
      'New order on KarakoramStore\n\n' +
      'Order ID: ' + orderId + '\n' +
      'Product: ' + (data.product || '') + '\n' +
      'Option: ' + (data.option || '') + '\n' +
      'Subtotal: ' + (data.subtotal || data.price || '') + '\n' +
      'Delivery: ' + (data.delivery || 'PKR 250') + '\n' +
      'Total: ' + (data.total || data.price || '') + '\n' +
      'Payment: ' + (data.payment || '') + '\n' +
      'Estimated delivery: ' + (data.deliveryEstimate || '3–5 business days') + '\n';
    if (data.transactionId) body += 'Transaction ID: ' + data.transactionId + '\n';
    body +=
      '\nCustomer: ' + (data.name || '') + '\n' +
      'Phone: ' + (data.phone || '') + '\n' +
      'Address: ' + (data.city || '') + '\n';
    if (data.email) body += 'Email: ' + data.email + '\n';
    if (data.notes) body += '\nNotes:\n' + data.notes + '\n';
    body += '\nDashboard: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit\n';

    const emailOptions = { name: 'KarakoramStore Orders' };
    if (data.screenshotData && data.screenshotName) {
      const blob = dataURLToBlob(data.screenshotData, data.screenshotName);
      emailOptions.attachments = [blob];
      body += '\n(Payment screenshot attached)\n';
    }

    GmailApp.sendEmail(
      NOTIFY_EMAIL,
      '[KarakoramStore] New Order — ' + orderId,
      body,
      emailOptions
    );

    return jsonOut({ ok: true, orderId: orderId });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function dataURLToBlob(dataUrl, filename) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bytes = Utilities.base64Decode(parts[1]);
  return Utilities.newBlob(bytes, mime, filename);
}

function normalizePhone_(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phonesMatch_(stored, entered) {
  const a = normalizePhone_(stored);
  const b = normalizePhone_(entered);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.slice(-10) === b.slice(-10);
}

function doGet(e) {
  const p = e.parameter;
  if (p.action === 'track') {
    const orderId = String(p.orderId || '').trim();
    const phone = normalizePhone_(p.phone);
    if (!orderId || !phone) {
      return jsonOut({ ok: false, error: 'Order ID and phone are required' });
    }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
    if (!sheet) return jsonOut({ ok: false, error: 'Order not found' });
    const values = sheet.getDataRange().getValues();
    const headers = values.shift();
    const idIdx = headers.indexOf('Order ID');
    const phoneIdx = headers.indexOf('Phone');
    if (idIdx < 0 || phoneIdx < 0) {
      return jsonOut({ ok: false, error: 'Order not found' });
    }
    for (var i = values.length - 1; i >= 0; i--) {
      const row = values[i];
      if (String(row[idIdx] || '').trim() === orderId && phonesMatch_(row[phoneIdx], phone)) {
        const o = {};
        headers.forEach(function(h, j) { o[h] = row[j]; });
        return jsonOut({ ok: true, order: o });
      }
    }
    return jsonOut({ ok: false, error: 'Order not found. Check your order number and phone.' });
  }
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
