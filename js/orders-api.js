/* Send orders — Web3Forms / Google Apps Script / FormSubmit (redirect) */

function buildOrderPayload(form) {
  const product = PRODUCTS.find(function(p) { return p.id === form.productId; });
  const variant = product ? getVariant(product, form.variantId) : null;
  const paymentLabels = {
    cod: 'Cash on Delivery',
    easypaisa: 'Easypaisa',
    jazzcash: 'JazzCash'
  };
  return {
    product: product ? product.title : form.productId,
    option: product && variant ? getVariantLabel(product, variant) : form.variantId,
    price: variant ? formatPKR(variant.price) : '',
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
    'Product: ' + p.product,
    'Option: ' + p.option,
    'Price: ' + p.price,
    'Payment: ' + p.payment
  ];
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
    subject: 'New Order — KarakoramStore — ' + payload.payment,
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
        if (data.success) return { ok: true, orderId: 'email', via: 'web3forms' };
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
      if (data.ok) return { ok: true, orderId: data.orderId, via: 'google' };
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

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://formsubmit.co/' + notifyEmail;
  form.enctype = 'multipart/form-data';
  form.acceptCharset = 'UTF-8';

  appendHiddenField(form, 'name', payload.name);
  appendHiddenField(form, 'email', payload.email || 'order@karakoramstore.local');
  appendHiddenField(form, 'phone', payload.phone);
  appendHiddenField(form, '_subject', 'New Order — KarakoramStore — ' + payload.payment);
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
  return Promise.resolve({ ok: true, redirecting: true, via: 'formsubmit' });
}

function submitOrder(payload, screenshotFile) {
  return submitViaGoogleScript(payload, screenshotFile).then(function(googleResult) {
    if (googleResult && googleResult.ok) return googleResult;
    return submitViaWeb3Forms(payload, screenshotFile).then(function(w3Result) {
      if (w3Result && w3Result.ok) return w3Result;
      if (w3Result && w3Result.ok === false) return w3Result;
      return redirectViaFormSubmit(payload, screenshotFile);
    });
  });
}

function fetchOrders(adminPassword) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl) {
    return Promise.reject(new Error('Order API not configured. Add orderApiUrl in js/site.js — see SETUP-ORDERS.md'));
  }
  const url = s.orderApiUrl + '?action=orders&password=' + encodeURIComponent(adminPassword);
  return fetch(url).then(function(res) { return res.json(); });
}
