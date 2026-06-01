/* KarakoramStore - shared site behaviour */

/* ---------- Helpers ---------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function siteContact() {
  return typeof SITE !== 'undefined' ? SITE : {
    phone: '+92 318 0699050',
    phoneTel: '+923180699050',
    whatsapp: '923180699050',
    email: 'info@lifewithbooks.com',
    hours: 'Mon–Fri, 9am–6pm',
    location: 'Gilgit-Baltistan, Pakistan',
    codLabel: 'Cash on Delivery',
    codNote: 'Pay when your order arrives.'
  };
}

function whatsappUrl(message) {
  const s = siteContact();
  const text = encodeURIComponent(message || 'Hi, I would like to place an order from KarakoramStore.');
  return 'https://wa.me/' + s.whatsapp + '?text=' + text;
}

function orderContactUrl(product, variantId) {
  let url = 'contact.html?payment=cod';
  if (product) url += '&product=' + encodeURIComponent(product.id);
  if (variantId) url += '&variant=' + encodeURIComponent(variantId);
  return url;
}

/* ---------- Header / footer injection ---------- */
function buildCategoryDropdown() {
  if (typeof CATEGORIES === 'undefined') return '';
  return CATEGORIES
    .map(c => `<li><a href="category.html?cat=${encodeURIComponent(c.slug)}">${c.label}</a></li>`)
    .join('');
}

function injectHeader() {
  const headerHost = $('#site-header-host');
  if (!headerHost) return;
  const s = siteContact();
  const currentPage = (document.body.dataset.page || '').toLowerCase();
  const isHome = currentPage === 'home';
  const isAll = currentPage === 'all-products';
  const isAbout = currentPage === 'about';
  const isContact = currentPage === 'contact';

  headerHost.innerHTML = `
    <div class="header-cod-strip">${escapeHtml(s.codLabel)} available — pay when you receive</div>
    <header class="site-header">
      <a class="site-logo" href="index.html" aria-label="KarakoramStore home">
        <span class="logo-mark">K</span>
        <span class="logo-text">
          <strong>KarakoramStore</strong>
          <span>Gilgit-Baltistan · Pakistan</span>
        </span>
      </a>
    </header>
    <nav class="main-nav" id="mainNav" aria-label="Main">
      <div class="nav-inner">
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
        <ul>
          <li${isHome ? ' class="active"' : ''}><a href="index.html">Home</a></li>
          <li class="has-dropdown${isAll ? ' active' : ''}">
            <a href="all-products.html">Shop</a>
            <ul>${buildCategoryDropdown()}</ul>
          </li>
          <li${isAbout ? ' class="active"' : ''}><a href="about.html">About</a></li>
          <li${isContact ? ' class="active"' : ''}><a href="contact.html">Order / Contact</a></li>
        </ul>
        <a class="nav-whatsapp" href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </nav>
  `;

  const nav = $('#mainNav');
  const toggle = $('#menuToggle');
  toggle && toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('#mainNav li.has-dropdown > a').forEach(a => {
    a.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        a.parentElement.classList.toggle('is-open');
      }
    });
  });
}

function injectFooter() {
  const footerHost = $('#site-footer-host');
  if (!footerHost) return;
  const s = siteContact();
  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <span class="brand-name">Karakoram<br>Store</span>
          <p>Authentic Gilgiti caps and pure Himalayan shilajit from the Karakoram. <strong>${escapeHtml(s.codLabel)}</strong> across Pakistan.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="product.html?id=gilgiti-cap">Gilgiti Cap</a></li>
            <li><a href="product.html?id=asli-aftabi-shilajit">Asli Aftabi Shilajit</a></li>
            <li><a href="all-products.html">All Products</a></li>
          </ul>
        </div>
        <div class="contact-info">
          <h4>Contact us</h4>
          <p><span class="icon">&#9742;</span> <a href="tel:${escapeHtml(s.phoneTel)}">${escapeHtml(s.phone)}</a></p>
          <p><span class="icon">&#9993;</span> <a href="mailto:${escapeHtml(s.email)}">${escapeHtml(s.email)}</a></p>
          <p><span class="icon">&#128337;</span> ${escapeHtml(s.hours)}</p>
          <p><span class="icon">&#128205;</span> ${escapeHtml(s.location)}</p>
        </div>
        <div>
          <h4>${escapeHtml(s.codLabel)}</h4>
          <div class="quote-box">
            <span class="phone">${escapeHtml(s.phone)}</span>
            <p>${escapeHtml(s.codNote)} Call or WhatsApp to confirm your order.</p>
            <a class="btn btn-sm" href="${whatsappUrl()}" target="_blank" rel="noopener" style="margin-top:12px;">Order on WhatsApp</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">&copy; ${new Date().getFullYear()} KarakoramStore &middot; All Rights Reserved</div>
    </footer>
    <a href="#top" class="back-to-top" id="backToTop" aria-label="Back to top">&#8593;</a>
  `;

  const backBtn = $('#backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backBtn.classList.add('show');
    else backBtn.classList.remove('show');
  }, { passive: true });
}

/* ---------- Card renderer ---------- */
function productThumbHTML(product) {
  if (product.image) {
    return `<img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" width="400" height="400">`;
  }
  return `
    <div class="cover">
      <div class="product-tile">
        <span class="title-on-cover">${escapeHtml(product.title)}</span>
        <span class="ribbon"></span>
      </div>
    </div>
  `;
}

function productCardHTML(product) {
  const priceTag = `<span class="product-price">${escapeHtml(getProductPriceDisplay(product))}</span>`;
  const variantLine = product.variants && product.variants.length
    ? `<p class="product-variants-hint">${escapeHtml(getVariantsSummary(product))}</p>`
    : '';
  const codTag = '<span class="card-cod-tag">COD</span>';
  const hasImage = !!product.image;
  return `
    <article class="product-card cover-${escapeHtml(product.cover || 'traditional')}${hasImage ? ' has-image' : ''}">
      ${codTag}
      <a class="thumb" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHtml(product.title)}">
        ${productThumbHTML(product)}
      </a>
      <div class="info">
        <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.title)}</a></h3>
        ${priceTag}
        ${variantLine}
        <a class="read-more" href="product.html?id=${encodeURIComponent(product.id)}">View &amp; Order</a>
      </div>
    </article>
  `;
}

function featuredProductCardHTML(product) {
  const defaultVariant = product.variants[0];
  const optionsHTML = product.variants.map(function(v) {
    return `<option value="${escapeHtml(v.id)}" data-price="${v.price}">${escapeHtml(v.label)} — ${escapeHtml(formatPKR(v.price))}</option>`;
  }).join('');

  return `
    <article class="featured-card" data-product-id="${escapeHtml(product.id)}">
      <span class="card-cod-tag">Cash on Delivery</span>
      <a class="featured-card-image" href="product.html?id=${encodeURIComponent(product.id)}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy">
      </a>
      <div class="featured-card-body">
        <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.title)}</a></h3>
        <p class="featured-excerpt">${escapeHtml(product.excerpt)}</p>
        <label class="variant-label" for="feat-${escapeHtml(product.id)}">Select option</label>
        <select class="variant-select featured-variant" id="feat-${escapeHtml(product.id)}" data-product-id="${escapeHtml(product.id)}">
          ${optionsHTML}
        </select>
        <p class="featured-price" data-price-for="${escapeHtml(product.id)}">${escapeHtml(formatPKR(defaultVariant.price))}</p>
        <div class="featured-card-actions">
          <a class="btn btn-order" href="${orderContactUrl(product, defaultVariant.id)}">Order with COD</a>
          <a class="btn outline btn-detail" href="product.html?id=${encodeURIComponent(product.id)}">Details</a>
        </div>
      </div>
    </article>
  `;
}

function bindFeaturedVariantSelects() {
  $$('.featured-variant').forEach(function(select) {
    select.addEventListener('change', function() {
      const productId = select.dataset.productId;
      const product = PRODUCTS.find(function(p) { return p.id === productId; });
      const opt = select.selectedOptions[0];
      const priceEl = document.querySelector('[data-price-for="' + productId + '"]');
      const orderBtn = select.closest('.featured-card').querySelector('.btn-order');
      if (priceEl && opt) priceEl.textContent = formatPKR(Number(opt.dataset.price));
      if (orderBtn && product) orderBtn.href = orderContactUrl(product, opt.value);
    });
  });
}

function renderProductGrid(containerSel, products, limit) {
  const el = $(containerSel);
  if (!el) return;
  const list = (typeof limit === 'number' ? products.slice(0, limit) : products);
  el.innerHTML = list.map(productCardHTML).join('') ||
    '<p style="grid-column:1/-1;text-align:center;color:#999;">No products found.</p>';
}

/* ---------- Home page ---------- */
function initHome() {
  if (document.body.dataset.page !== 'home') return;

  const s = siteContact();
  const trustPhone = $('#trust-phone');
  if (trustPhone) trustPhone.textContent = s.phone;

  const heroWa = $('#hero-whatsapp');
  if (heroWa) heroWa.href = whatsappUrl('Hi, I want to order from KarakoramStore with Cash on Delivery.');

  const featuredHost = $('#featured-products');
  if (featuredHost && typeof PRODUCTS !== 'undefined') {
    featuredHost.innerHTML = PRODUCTS.map(featuredProductCardHTML).join('');
    bindFeaturedVariantSelects();
  }
}

/* ---------- All products page ---------- */
function initAllProducts() {
  if (document.body.dataset.page !== 'all-products') return;
  const q = (getParam('q') || '').toLowerCase().trim();
  let list = PRODUCTS.slice();
  if (q) {
    list = list.filter(p => p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q));
    const qEl = $('#current-query');
    if (qEl) qEl.textContent = ' matching "' + q + '"';
    const input = $('#searchInput');
    if (input) input.value = q;
  }
  renderProductGrid('#all-products-grid', list);

  const searchForm = $('#searchForm');
  searchForm && searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = $('#searchInput').value.trim();
    window.location.href = 'all-products.html' + (val ? '?q=' + encodeURIComponent(val) : '');
  });
}

/* ---------- Category page ---------- */
function initCategory() {
  if (document.body.dataset.page !== 'category') return;
  const slug = getParam('cat') || 'traditional-wear';
  const cat = CATEGORIES.find(c => c.slug === slug);
  const title = $('#cat-title');
  const desc = $('#cat-description');
  if (title) title.textContent = cat ? cat.label : 'Category';
  if (desc) desc.textContent = cat
    ? 'Browse our collection of ' + cat.label.toLowerCase() + ' from the Karakoram region. Cash on Delivery available.'
    : '';
  document.title = (cat ? cat.label : 'Category') + ' - KarakoramStore';
  const items = PRODUCTS.filter(p => p.categories.includes(slug));
  renderProductGrid('#category-grid', items);
}

/* ---------- Product detail page ---------- */
function initProductDetail() {
  if (document.body.dataset.page !== 'product') return;
  const id = getParam('id');
  const product = PRODUCTS.find(p => p.id === id);
  const wrap = $('#product-detail');
  if (!product) {
    wrap.innerHTML = '<p style="text-align:center;padding:40px 0;">Sorry, this product could not be found. <a href="all-products.html">Browse all products</a>.</p>';
    return;
  }
  document.title = product.title + ' - KarakoramStore';

  const s = siteContact();
  const primaryCat = product.categories[0] || 'traditional-wear';
  const catObj = CATEGORIES.find(c => c.slug === primaryCat);
  const tags = product.categories.map(slug => {
    const c = CATEGORIES.find(x => x.slug === slug);
    return c ? '<span class="tag">' + escapeHtml(c.label) + '</span>' : '';
  }).join('') + '<span class="tag tag-cod">' + escapeHtml(s.codLabel) + '</span>';

  const paragraphs = (product.description || []).map(function(p) {
    if (p.indexOf('## ') === 0) return '<h2>' + escapeHtml(p.slice(3)) + '</h2>';
    return '<p>' + escapeHtml(p) + '</p>';
  }).join('');

  const defaultVariant = product.variants[0];
  const variantOptions = product.variants.map(function(v, i) {
    return `<option value="${escapeHtml(v.id)}" data-price="${v.price}"${i === 0 ? ' selected' : ''}>${escapeHtml(v.label)} — ${escapeHtml(formatPKR(v.price))}</option>`;
  }).join('');

  const variantHTML = `
    <div class="product-options">
      <label for="variant-select">Choose option</label>
      <select id="variant-select" class="variant-select">${variantOptions}</select>
      <p class="product-price-detail" id="variant-price">${escapeHtml(formatPKR(defaultVariant.price))}</p>
    </div>
  `;

  const related = PRODUCTS.filter(p => p.id !== product.id);
  const relatedHTML = related.map(p => `
    <li><a href="product.html?id=${encodeURIComponent(p.id)}">
      <span>${escapeHtml(p.title)}</span>
      <span class="arrow">View Product &raquo;</span>
    </a></li>
  `).join('');

  const imageHTML = product.image
    ? `<div class="product-hero-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}"></div>`
    : '';

  if (product.image) wrap.classList.add('has-image');

  wrap.innerHTML = `
    <div class="breadcrumb">
      <a href="index.html">Home</a> &raquo;
      <a href="category.html?cat=${primaryCat}">${catObj ? escapeHtml(catObj.label) : 'Products'}</a> &raquo;
      <span>${escapeHtml(product.title)}</span>
    </div>

    ${imageHTML}

    <h1>${escapeHtml(product.title)}</h1>
    <div class="meta">${tags}</div>

    ${variantHTML}

    <div class="cod-badge">
      <strong>${escapeHtml(s.codLabel)}</strong>
      <p>${escapeHtml(s.codNote)}</p>
    </div>

    <article class="article">
      ${paragraphs}
    </article>

    <div class="order-block">
      <p style="margin-bottom:16px;font-size:15px;">Select your option above, then place your order. We confirm by phone or WhatsApp before dispatch.</p>
      <div class="order-block-actions">
        <a class="btn" id="order-btn" href="${orderContactUrl(product, defaultVariant.id)}">Order with Cash on Delivery</a>
        <a class="btn outline" id="wa-order-btn" href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp Order</a>
      </div>
    </div>

    <div class="related-posts">
      <h3>Also Shop</h3>
      <ul>${relatedHTML}</ul>
    </div>
  `;

  const variantSelect = $('#variant-select');
  const priceEl = $('#variant-price');
  const orderBtn = $('#order-btn');
  const waBtn = $('#wa-order-btn');

  function updateVariant() {
    const opt = variantSelect.selectedOptions[0];
    const variant = getVariant(product, opt.value);
    if (priceEl) priceEl.textContent = formatPKR(variant.price);
    if (orderBtn) orderBtn.href = orderContactUrl(product, variant.id);
    if (waBtn) {
      waBtn.href = whatsappUrl(
        'Hi, I want to order:\n' + product.title + '\nOption: ' + variant.label + '\nPrice: ' + formatPKR(variant.price) + '\nPayment: Cash on Delivery\n\nMy name:\nCity:\nPhone:'
      );
    }
  }

  variantSelect && variantSelect.addEventListener('change', updateVariant);
  updateVariant();
}

/* ---------- Contact / order page ---------- */
function initContact() {
  if (document.body.dataset.page !== 'contact') return;
  const s = siteContact();
  const productId = getParam('product');
  const variantId = getParam('variant');
  const payment = getParam('payment') || 'cod';

  const productSelect = $('#order-product');
  const variantSelect = $('#order-variant');
  const paymentCod = $('#payment-cod');
  const messageInput = $('#messageInput');
  const subjectInput = $('#subjectInput');
  const phoneDisplay = $('#contact-page-phone');
  const emailDisplay = $('#contact-page-email');
  const hoursDisplay = $('#contact-page-hours');

  if (phoneDisplay) phoneDisplay.innerHTML = '<a href="tel:' + escapeHtml(s.phoneTel) + '">' + escapeHtml(s.phone) + '</a>';
  if (emailDisplay) emailDisplay.innerHTML = '<a href="mailto:' + escapeHtml(s.email) + '">' + escapeHtml(s.email) + '</a>';
  if (hoursDisplay) hoursDisplay.textContent = s.hours;

  function fillVariants(product) {
    if (!variantSelect || !product || !product.variants) return;
    variantSelect.innerHTML = product.variants.map(function(v) {
      return '<option value="' + escapeHtml(v.id) + '">' + escapeHtml(v.label) + ' — ' + escapeHtml(formatPKR(v.price)) + '</option>';
    }).join('');
  }

  function updateMessage() {
    const pid = productSelect ? productSelect.value : productId;
    const product = PRODUCTS.find(function(p) { return p.id === pid; });
    if (!product) return;
    const vid = variantSelect ? variantSelect.value : variantId;
    const variant = getVariant(product, vid);
    if (subjectInput) subjectInput.value = 'COD Order: ' + product.title;
    if (messageInput) {
      messageInput.value =
        'Hi, I would like to place a Cash on Delivery order:\n\n' +
        'Product: ' + product.title + '\n' +
        'Option: ' + variant.label + '\n' +
        'Price: ' + formatPKR(variant.price) + '\n' +
        'Payment: Cash on Delivery\n\n' +
        'Full name:\n' +
        'Phone:\n' +
        'City / Address:\n' +
        'Notes:\n';
    }
  }

  if (productSelect) {
    productSelect.addEventListener('change', function() {
      const product = PRODUCTS.find(function(p) { return p.id === productSelect.value; });
      fillVariants(product);
      updateMessage();
    });
  }
  if (variantSelect) variantSelect.addEventListener('change', updateMessage);

  if (productSelect && productId) {
    productSelect.value = productId;
    const product = PRODUCTS.find(function(p) { return p.id === productId; });
    fillVariants(product);
    if (variantSelect && variantId) variantSelect.value = variantId;
    updateMessage();
  }

  if (paymentCod) paymentCod.checked = payment === 'cod';
}


/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  initHome();
  initAllProducts();
  initCategory();
  initProductDetail();
  initContact();
});
