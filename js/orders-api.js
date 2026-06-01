/* Send orders — Google Sheet (dashboard) + FormSubmit email */

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

/* FormSubmit /ajax/ is blocked by CORS in browsers — use a real form POST into a hidden iframe */
function submitViaFormSubmit(payload, screenshotFile) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  const notifyEmail = s.orderNotifyEmail || 'munashirmehdi@gmail.com';

  return new Promise(function(resolve) {
    const iframeName = 'formsubmit-iframe';
    let iframe = document.getElementById(iframeName);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeName;
      iframe.name = iframeName;
      iframe.title = 'Order submit';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = 'display:none;width:0;height:0;border:0';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/' + notifyEmail;
    form.enctype = 'multipart/form-data';
    form.target = iframeName;
    form.acceptCharset = 'UTF-8';
    form.style.display = 'none';

    appendHiddenField(form, 'name', payload.name);
    appendHiddenField(form, 'email', payload.email || 'order@karakoramstore.local');
    appendHiddenField(form, 'phone', payload.phone);
    appendHiddenField(form, '_subject', 'New Order — KarakoramStore — ' + payload.payment);
    appendHiddenField(form, 'message', formatOrderEmailBody(payload));
    appendHiddenField(form, '_template', 'table');
    appendHiddenField(form, '_captcha', 'false');

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
        form.remove();
        resolve({ ok: false, error: 'Could not attach screenshot. Try a smaller image or WhatsApp us.' });
        return;
      }
    }

    document.body.appendChild(form);

    let settled = false;
    function finish(ok, error) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      iframe.onload = null;
      form.remove();
      if (ok) resolve({ ok: true, orderId: 'email', via: 'formsubmit' });
      else resolve({ ok: false, error: error || 'Email send failed' });
    }

    iframe.onload = function() { finish(true); };
    const timer = window.setTimeout(function() { finish(true); }, 3500);

    try {
      form.submit();
    } catch (err) {
      finish(false, String(err));
    }
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

function submitOrder(payload, screenshotFile) {
  return submitViaGoogleScript(payload, screenshotFile).then(function(googleResult) {
    if (googleResult && googleResult.ok) return googleResult;
    return submitViaFormSubmit(payload, screenshotFile);
  });
}

function fetchOrders(adminPassword) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl) return Promise.reject(new Error('Order API not configured. Add orderApiUrl in js/site.js — see SETUP-ORDERS.md'));
  const url = s.orderApiUrl + '?action=orders&password=' + encodeURIComponent(adminPassword);
  return fetch(url).then(function(res) { return res.json(); });
}
