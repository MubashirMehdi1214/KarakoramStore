/* KarakoramStore — orders dashboard */

(function() {
  const web3Panel = document.getElementById('web3forms-panel');
  const loginPanel = document.getElementById('login-panel');
  const dashboardPanel = document.getElementById('dashboard-panel');
  const passInput = document.getElementById('admin-pass');
  const loginBtn = document.getElementById('admin-login-btn');
  const loginError = document.getElementById('login-error');
  const apiHint = document.getElementById('api-hint');
  const ordersBody = document.getElementById('orders-body');
  const ordersCount = document.getElementById('orders-count');
  const refreshBtn = document.getElementById('refresh-orders');
  const logoutBtn = document.getElementById('logout-btn');

  const STORAGE_KEY = 'ks_admin_session';
  const hasWeb3 = SITE.web3formsAccessKey && SITE.web3formsAccessKey.length > 10;
  const hasGoogle = SITE.orderApiUrl && SITE.orderApiUrl.indexOf('script.google.com') !== -1;

  if (web3Panel && hasWeb3) web3Panel.hidden = false;

  if (apiHint) {
    if (hasGoogle) {
      apiHint.textContent = 'Google backend connected. Password is in js/site.js (adminPassword) and OrdersBackend.gs.';
    } else {
      apiHint.textContent = 'Google Sheet table not connected yet. Paste orderApiUrl in js/site.js after SETUP-ORDERS.md — or use Web3Forms dashboard above.';
    }
  }

  function showError(msg) {
    loginError.textContent = msg;
    loginError.hidden = !msg;
  }

  function formatDate(val) {
    if (!val) return '';
    try {
      const d = new Date(val);
      return d.toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
      return String(val);
    }
  }

  function renderOrders(orders) {
    ordersBody.innerHTML = '';
    if (!orders || !orders.length) {
      ordersBody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;">No orders in Google Sheet yet. Submit a test order after connecting orderApiUrl.</td></tr>';
      ordersCount.textContent = '0 orders';
      return;
    }
    ordersCount.textContent = orders.length + ' order(s)';
    orders.forEach(function(o) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeCell(formatDate(o.Date)) + '</td>' +
        '<td><strong>' + escapeCell(o['Order ID']) + '</strong></td>' +
        '<td>' + escapeCell(o.Product) + '</td>' +
        '<td>' + escapeCell(o.Option) + '</td>' +
        '<td>' + escapeCell(o['Price (PKR)']) + '</td>' +
        '<td>' + escapeCell(o.Payment) + '</td>' +
        '<td>' + escapeCell(o['Customer Name']) + '</td>' +
        '<td><a href="tel:' + escapeCell(String(o.Phone).replace(/\s/g, '')) + '">' + escapeCell(o.Phone) + '</a></td>' +
        '<td>' + escapeCell(o['City / Address']) + '</td>' +
        '<td><span class="status-badge">' + escapeCell(o.Status || 'New') + '</span></td>';
      ordersBody.appendChild(tr);
    });
  }

  function escapeCell(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function loadOrders(password) {
    if (!hasGoogle) {
      showError('Google Sheet not connected. Add orderApiUrl in js/site.js — see SETUP-ORDERS.md. Use Web3Forms dashboard above for now.');
      return;
    }
    ordersBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Loading…</td></tr>';
    fetchOrders(password)
      .then(function(data) {
        if (!data.ok) throw new Error(data.error || 'Failed to load');
        sessionStorage.setItem(STORAGE_KEY, password);
        loginPanel.hidden = true;
        dashboardPanel.hidden = false;
        renderOrders(data.orders);
        showError('');
      })
      .catch(function(err) {
        showError(err.message || 'Could not load orders. Check password matches adminPassword in site.js and Apps Script.');
        ordersBody.innerHTML = '';
      });
  }

  loginBtn.addEventListener('click', function() {
    const pass = passInput.value.trim();
    if (!pass) {
      showError('Enter your password.');
      return;
    }
    loadOrders(pass);
  });

  passInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loginBtn.click();
  });

  refreshBtn.addEventListener('click', function() {
    const pass = sessionStorage.getItem(STORAGE_KEY);
    if (pass) loadOrders(pass);
  });

  logoutBtn.addEventListener('click', function() {
    sessionStorage.removeItem(STORAGE_KEY);
    dashboardPanel.hidden = true;
    loginPanel.hidden = false;
    passInput.value = '';
  });

  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved && hasGoogle) {
    loadOrders(saved);
  }
})();
