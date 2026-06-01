/* Send orders to backend + optional Web3Forms email fallback */

function buildOrderPayload(form) {
  const product = PRODUCTS.find(function(p) { return p.id === form.productId; });
  const variant = product ? getVariant(product, form.variantId) : null;
  return {
    product: product ? product.title : form.productId,
    option: product && variant ? getVariantLabel(product, variant) : form.variantId,
    price: variant ? formatPKR(variant.price) : '',
    payment: 'Cash on Delivery',
    name: form.name,
    phone: form.phone,
    city: form.city,
    email: form.email || '',
    notes: form.notes || ''
  };
}

function submitOrder(payload) {
  const s = typeof SITE !== 'undefined' ? SITE : {};

  if (s.orderApiUrl && s.orderApiUrl.indexOf('script.google.com') !== -1) {
    return fetch(s.orderApiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    })
      .then(function(res) { return res.json(); })
      .catch(function(err) {
        console.error('Order API error:', err);
        return { ok: false, error: String(err) };
      });
  }

  if (s.web3formsAccessKey) {
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: s.web3formsAccessKey,
        subject: 'New COD Order — KarakoramStore',
        from_name: payload.name,
        email: s.orderNotifyEmail || 'munashirmehdi@gmail.com',
        message: formatOrderEmailBody(payload)
      })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) { return { ok: data.success, orderId: data.message || 'email' }; });
  }

  return Promise.resolve({ ok: false, fallback: true });
}

function formatOrderEmailBody(p) {
  return [
    'New Cash on Delivery Order',
    '',
    'Product: ' + p.product,
    'Option: ' + p.option,
    'Price: ' + p.price,
    'Payment: ' + p.payment,
    '',
    'Name: ' + p.name,
    'Phone: ' + p.phone,
    'Address: ' + p.city,
    p.email ? 'Email: ' + p.email : '',
    p.notes ? '\nNotes:\n' + p.notes : ''
  ].filter(Boolean).join('\n');
}

function fetchOrders(adminPassword) {
  const s = typeof SITE !== 'undefined' ? SITE : {};
  if (!s.orderApiUrl) return Promise.reject(new Error('Order API not configured'));
  const url = s.orderApiUrl + '?action=orders&password=' + encodeURIComponent(adminPassword);
  return fetch(url)
    .then(function(res) { return res.json(); });
}
