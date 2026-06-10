/* Send orders — Web3Forms / Google Apps Script / FormSubmit (redirect) */

function getDeliveryChargePKR() {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  return Number(s.deliveryChargePKR) || 250;
}

function generateOrderId() {
  const d = new Date();
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return 'KS-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}

function getDeliveryEstimateDates(fromDate) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  const minDays = Number(s.deliveryDaysMin) || 3;
  const maxDays = Number(s.deliveryDaysMax) || 5;
  const orderDate = fromDate ? new Date(fromDate) : new Date();
  const minDate = new Date(orderDate);
  minDate.setDate(minDate.getDate() + minDays);
  const maxDate = new Date(orderDate);
  maxDate.setDate(maxDate.getDate() + maxDays);
  const fmt = function(d) {
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  return {
    minDays: minDays,
    maxDays: maxDays,
    label: minDays + '–' + maxDays + ' business days',
    range: fmt(minDate) + ' – ' + fmt(maxDate),
    minDate: minDate,
    maxDate: maxDate
  };
}

function calculateOrderTotals(subtotalNum) {
  const subtotal = Math.max(0, Number(subtotalNum) || 0);
  const delivery = subtotal > 0 ? getDeliveryChargePKR() : 0;
  return {
    subtotal: subtotal,
    delivery: delivery,
    total: subtotal + delivery
  };
}

function buildOrderPayload(form) {
  const product = PRODUCTS.find(function(p) { return p.id === form.productId; });
  const variant = product ? getVariant(product, form.variantId) : null;
  const paymentLabels = {
    cod: 'Cash on Delivery',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash'
  };
  const priceNum = variant ? Number(variant.price) : 0;
  const totals = calculateOrderTotals(priceNum);
  const estimate = getDeliveryEstimateDates();
  return {
    orderId: form.orderId || generateOrderId(),
    product: product ? product.title : form.productId,
    option: product && variant ? getVariantLabel(product, variant) : form.variantId,
    price: variant ? formatPKR(variant.price) : '',
    subtotal: formatPKR(totals.subtotal),
    delivery: formatPKR(totals.delivery),
    total: formatPKR(totals.total),
    subtotalNum: totals.subtotal,
    deliveryNum: totals.delivery,
    totalNum: totals.total,
    deliveryEstimate: estimate.label,
    deliveryRange: estimate.range,
    payment: paymentLabels[form.paymentMethod] || form.paymentMethod || 'Cash on Delivery',
    paymentMethod: form.paymentMethod || 'cod',
    transactionId: form.transactionId || '',
    name: form.name,
    phone: form.phone,
    city: form.city,
    email: form.email || '',
    notes: form.notes || ''
  };
}

function formatOrderEmailBody(p) {
  const lines = [
    'New order — KarakoramStore',
    '',
    'Order ID: ' + (p.orderId || ''),
    'Product: ' + p.product,
    'Option: ' + p.option,
    'Subtotal: ' + (p.subtotal || p.price),
    'Delivery: ' + (p.delivery || formatPKR(getDeliveryChargePKR())),
    'Total: ' + (p.total || p.price),
    'Payment: ' + p.payment,
    'Estimated delivery: ' + (p.deliveryEstimate || '3–5 business days')
  ];
  if (p.deliveryRange) lines.push('Expected by: ' + p.deliveryRange);
  if (p.transactionId) lines.push('Transaction ID: ' + p.transactionId);
  lines.push(
    '',
    'Name: ' + p.name,
    'Phone: ' + p.phone,
    'Address: ' + p.city
  );
  if (p.email) lines.push('Email: ' + p.email);
  if (p.notes) lines.push('', 'Notes:', p.notes);
  if (p.paymentMethod !== 'cod') lines.push('', '(Payment screenshot attached if uploaded)');
  return lines.join('\n');
}

function appendHiddenField(form, name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function submitViaWeb3Forms(payload, screenshotFile) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  const key = s.web3formsAccessKey;
  if (!key) return Promise.resolve(null);

  const body = {
    access_key: key,
    subject: '[KarakoramStore] Order ' + (payload.orderId || '') + ' — ' + payload.payment,
    from_name: payload.name,
    email: payload.email || 'order@karakoramstore.local',
    phone: payload.phone,
    message: formatOrderEmailBody(payload)
  };

  const send = function() {
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) return { ok: true, orderId: payload.orderId, via: 'web3forms' };
        return { ok: false, error: data.message || 'Email send failed' };
      });
  };

  if (!screenshotFile) return send();

  return fileToBase64(screenshotFile).then(function(dataUrl) {
    body.attachment = dataUrl;
    body.attachment_name = screenshotFile.name || 'payment-proof.jpg';
    return send();
  });
}

function submitViaGoogleScript(payload, screenshotFile) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl || s.orderApiUrl.indexOf('script.google.com') === -1) {
    return Promise.resolve(null);
  }

  if (screenshotFile) {
    return fileToBase64(screenshotFile).then(function(base64) {
      payload.screenshotName = screenshotFile.name;
      payload.screenshotData = base64;
      return postToGoogleScript(payload, s.orderApiUrl);
    });
  }
  return postToGoogleScript(payload, s.orderApiUrl);
}

function postToGoogleScript(payload, url) {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.ok) return { ok: true, orderId: data.orderId || payload.orderId, via: 'google' };
      return { ok: false, error: data.error || 'Server error' };
    })
    .catch(function(err) {
      return { ok: false, error: String(err) };
    });
}

function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* Full-page POST — FormSubmit only delivers mail reliably this way (not iframe/ajax) */
function redirectViaFormSubmit(payload, screenshotFile) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  const notifyEmail = s.orderNotifyEmail || 'munashirmehdi@gmail.com';
  const returnUrl = window.location.href.split('?')[0] + '?order=sent';

  try {
    sessionStorage.setItem('ks_pending_order', JSON.stringify({
      orderId: payload.orderId,
      product: payload.product,
      option: payload.option,
      subtotal: payload.subtotal,
      delivery: payload.delivery,
      total: payload.total,
      payment: payload.payment,
      name: payload.name,
      phone: payload.phone,
      city: payload.city,
      deliveryEstimate: payload.deliveryEstimate,
      deliveryRange: payload.deliveryRange,
      placedAt: new Date().toISOString()
    }));
  } catch (err) { /* ignore */ }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://formsubmit.co/' + notifyEmail;
  form.enctype = 'multipart/form-data';
  form.acceptCharset = 'UTF-8';

  appendHiddenField(form, 'name', payload.name);
  appendHiddenField(form, 'email', payload.email || 'order@karakoramstore.local');
  appendHiddenField(form, 'phone', payload.phone);
  appendHiddenField(form, '_subject', '[KarakoramStore] Order ' + payload.orderId + ' — ' + payload.payment);
  appendHiddenField(form, 'message', formatOrderEmailBody(payload));
  appendHiddenField(form, '_template', 'table');
  appendHiddenField(form, '_captcha', 'false');
  appendHiddenField(form, '_next', returnUrl);

  if (screenshotFile) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'attachment';
    try {
      const dt = new DataTransfer();
      dt.items.add(screenshotFile);
      fileInput.files = dt.files;
      form.appendChild(fileInput);
    } catch (err) {
      return Promise.resolve({ ok: false, error: 'Could not attach screenshot. Try WhatsApp us.' });
    }
  }

  document.body.appendChild(form);
  form.submit();
  return Promise.resolve({ ok: true, redirecting: true, orderId: payload.orderId, via: 'formsubmit' });
}

function submitOrder(payload, screenshotFile) {
  const googlePromise = submitViaGoogleScript(payload, screenshotFile);
  const w3Promise = submitViaWeb3Forms(payload, screenshotFile);

  return Promise.all([googlePromise, w3Promise]).then(function(results) {
    const googleResult = results[0];
    const w3Result = results[1];
    if (googleResult && googleResult.ok) return googleResult;
    if (w3Result && w3Result.ok) return w3Result;
    if (w3Result && w3Result.ok === false) return w3Result;
    if (googleResult && googleResult.ok === false) return googleResult;
    return redirectViaFormSubmit(payload, screenshotFile);
  });
}

function normalizeOrderPhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phonesMatch(stored, entered) {
  const a = normalizeOrderPhone(stored);
  const b = normalizeOrderPhone(entered);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.slice(-10) === b.slice(-10);
}

function saveOrderToHistory(orderData) {
  try {
    const key = 'ks_orders_v1';
    const orders = JSON.parse(localStorage.getItem(key) || '[]');
    orders.unshift(orderData);
    localStorage.setItem(key, JSON.stringify(orders.slice(0, 20)));
  } catch (err) { /* ignore */ }
}

function getLocalOrder(orderId, phone) {
  try {
    const id = String(orderId || '').trim().toUpperCase();
    const orders = JSON.parse(localStorage.getItem('ks_orders_v1') || '[]');
    return orders.find(function(o) {
      if (!o.orderId || o.orderId.toUpperCase() !== id) return false;
      return !phone || phonesMatch(o.phone, phone);
    }) || null;
  } catch (err) {
    return null;
  }
}

function mapSheetOrderToTrack(row) {
  const dateVal = row['Date'] || row.date;
  const placedAt = dateVal ? new Date(dateVal).toISOString() : null;
  return {
    orderId: row['Order ID'] || row.orderId || '',
    product: row['Product'] || row.product || '',
    option: row['Option'] || row.option || '',
    subtotal: row['Subtotal (PKR)'] || row.subtotal || row['Price (PKR)'] || '',
    delivery: row['Delivery (PKR)'] || row.delivery || '',
    total: row['Total (PKR)'] || row.total || row['Price (PKR)'] || '',
    payment: row['Payment'] || row.payment || '',
    name: row['Customer Name'] || row.name || '',
    phone: row['Phone'] || row.phone || '',
    city: row['City / Address'] || row.city || '',
    deliveryEstimate: row['Est. Delivery'] || row.deliveryEstimate || '3–5 business days',
    status: row['Status'] || row.status || 'New',
    placedAt: placedAt
  };
}

function fetchOrderTrack(orderId, phone) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl || s.orderApiUrl.indexOf('script.google.com') === -1) {
    return Promise.resolve(null);
  }
  const url = s.orderApiUrl + '?action=track&orderId=' + encodeURIComponent(orderId) +
    '&phone=' + encodeURIComponent(phone);
  return fetch(url)
    .then(function(res) { return res.json(); })
    .catch(function() { return { ok: false, error: 'Could not reach order server' }; });
}

function lookupOrder(orderId, phone) {
  const local = getLocalOrder(orderId, phone);
  return fetchOrderTrack(orderId, phone).then(function(result) {
    if (result && result.ok && result.order) return result;
    if (local && phonesMatch(local.phone, phone)) {
      return { ok: true, order: local, via: 'local' };
    }
    if (result && result.ok === false) return result;
    return {
      ok: false,
      error: 'Order not found. Check your order number and phone, or contact us on WhatsApp.'
    };
  });
}

function getOrderTrackingStage(order) {
  const status = String(order.status || '').toLowerCase();
  if (status.indexOf('deliver') !== -1) return 4;
  if (status.indexOf('ship') !== -1) return 3;
  const placedAt = order.placedAt ? new Date(order.placedAt) : null;
  if (!placedAt || isNaN(placedAt.getTime())) return 2;
  const days = Math.floor((Date.now() - placedAt.getTime()) / 86400000);
  const s = typeof SITE !== 'undefined' ? SITE : {};
  const minDays = Number(s.deliveryDaysMin) || 3;
  const maxDays = Number(s.deliveryDaysMax) || 5;
  if (days >= maxDays) return 4;
  if (days >= minDays) return 3;
  if (days >= 1) return 2;
  return 2;
}

function fetchOrders(adminPassword) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl) {
    return Promise.reject(new Error('Order API not configured. Add orderApiUrl in js/site.js — see SETUP-ORDERS.md'));
  }
  const url = s.orderApiUrl + '?action=orders&password=' + encodeURIComponent(adminPassword);
  return fetch(url).then(function(res) { return res.json(); });
}
