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
  const currentPage = (document.body.dataset.page || '').toLowerCase();
  const isHome = currentPage === 'home';
  const isAll = currentPage === 'all-products';
  const isAbout = currentPage === 'about';
  const isContact = currentPage === 'contact';

  headerHost.innerHTML = `
    <header class="site-header">
      <a class="site-logo" href="index.html" aria-label="KarakoramStore home">
        <span class="logo-mark">K</span>
        <span class="logo-text">
          <strong>KarakoramStore</strong>
          <span>Authentic Karakoram Products</span>
        </span>
      </a>
    </header>
    <nav class="main-nav" id="mainNav" aria-label="Main">
      <div class="nav-inner">
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
        <ul>
          <li${isHome ? ' class="active"' : ''}><a href="index.html">Home</a></li>
          <li class="has-dropdown${isAll ? ' active' : ''}">
            <a href="all-products.html">All Products</a>
            <ul>${buildCategoryDropdown()}</ul>
          </li>
          <li${isAbout ? ' class="active"' : ''}><a href="about.html">About Us</a></li>
          <li${isContact ? ' class="active"' : ''}><a href="contact.html">Contact</a></li>
        </ul>
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
  footerHost.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <span class="brand-name">Karakoram<br>Store</span>
          <p>Your trusted source for authentic products from Gilgit-Baltistan and the Karakoram — traditional caps, pure Himalayan shilajit and more, delivered across Pakistan.</p>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            <li><a href="category.html?cat=traditional-wear">Traditional Wear</a></li>
            <li><a href="category.html?cat=health-wellness">Health &amp; Wellness</a></li>
          </ul>
        </div>
        <div class="contact-info">
          <h4>Contact us</h4>
          <p><span class="icon">&#9742;</span> Phone: +92 318 0699050</p>
          <p><span class="icon">&#9993;</span> info@karakoramstore.com</p>
          <p><span class="icon">&#127968;</span> Gilgit-Baltistan, Pakistan</p>
          <p><span class="icon">&#128205;</span> Nationwide delivery</p>
        </div>
        <div>
          <h4>Order Today</h4>
          <div class="quote-box">
            <span class="phone">+92 318 0699050</span>
            <p>Call or WhatsApp us for pricing, availability and delivery anywhere in Pakistan.</p>
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
  const priceTag = product.price
    ? `<span class="product-price">${escapeHtml(product.price)}</span>`
    : '';
  const hasImage = !!product.image;
  return `
    <article class="product-card cover-${escapeHtml(product.cover || 'traditional')}${hasImage ? ' has-image' : ''}">
      <a class="thumb" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHtml(product.title)}">
        ${productThumbHTML(product)}
      </a>
      <div class="info">
        <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.title)}</a></h3>
        ${priceTag}
        <a class="read-more" href="product.html?id=${encodeURIComponent(product.id)}">View Product</a>
      </div>
    </article>
  `;
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

  const featured = [
    "traditional-wear",
    "health-wellness"
  ];

  renderProductGrid('#all-products-grid', PRODUCTS);

  const host = $('#category-sections');
  if (host) {
    host.innerHTML = featured.map(slug => {
      const cat = CATEGORIES.find(c => c.slug === slug);
      const items = PRODUCTS.filter(p => p.categories.includes(slug));
      if (!items.length) return '';
      return `
        <section class="section">
          <div class="section-title"><a href="category.html?cat=${slug}">${cat.label}</a></div>
          <div class="product-grid">${items.map(productCardHTML).join('')}</div>
        </section>
      `;
    }).join('');
  }

  const searchForm = $('#heroSearch');
  searchForm && searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#heroSearch input').value.trim();
    if (q) window.location.href = 'all-products.html?q=' + encodeURIComponent(q);
  });
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
    ? 'Browse our collection of ' + cat.label.toLowerCase() + ' from the Karakoram region.'
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

  const primaryCat = product.categories[0] || 'traditional-wear';
  const catObj = CATEGORIES.find(c => c.slug === primaryCat);
  const tags = product.categories.map(slug => {
    const c = CATEGORIES.find(x => x.slug === slug);
    return c ? '<span class="tag">' + escapeHtml(c.label) + '</span>' : '';
  }).join('');

  const paragraphs = (product.description || []).map(function(p) {
    if (p.indexOf('## ') === 0) return '<h2>' + escapeHtml(p.slice(3)) + '</h2>';
    return '<p>' + escapeHtml(p) + '</p>';
  }).join('');

  const related = PRODUCTS
    .filter(p => p.id !== product.id && p.categories.includes(primaryCat))
    .slice(0, 30);
  const relatedHTML = related.length
    ? related.map(p => `
    <li><a href="product.html?id=${encodeURIComponent(p.id)}">
      <span>${escapeHtml(p.title)}</span>
      <span class="arrow">View Product &raquo;</span>
    </a></li>
  `).join('')
    : PRODUCTS.filter(p => p.id !== product.id).map(p => `
    <li><a href="product.html?id=${encodeURIComponent(p.id)}">
      <span>${escapeHtml(p.title)}</span>
      <span class="arrow">View Product &raquo;</span>
    </a></li>
  `).join('');

  const priceHTML = product.price
    ? '<p class="product-price-detail">' + escapeHtml(product.price) + '</p>'
    : '';

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
    ${priceHTML}
    <div class="meta">${tags}</div>

    <article class="article">
      ${paragraphs}
    </article>

    <div class="order-block">
      <p style="margin-bottom:16px;font-size:15px;">Ready to order? Contact us on WhatsApp or phone and we will confirm availability and delivery.</p>
      <a class="btn" href="contact.html?product=${encodeURIComponent(product.id)}">Order Now</a>
    </div>

    <div class="related-posts">
      <h3>Related Products</h3>
      <ul>${relatedHTML}</ul>
    </div>
  `;
}


/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  initHome();
  initAllProducts();
  initCategory();
  initProductDetail();
});
