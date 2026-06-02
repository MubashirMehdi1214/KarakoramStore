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
    phone: '+92 311 5189291',
    phoneTel: '+923115189291',
    whatsapp: '923115189291',
    email: 'munashirmehdi@gmail.com',
    easypaisaAccount: '03115189291',
    jazzcashAccount: '03419485217',
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

function buildVariantSelectOptions(product, sizeId) {
  const list = productHasSizes(product) ? getVariantsForSize(product, sizeId) : (product.variants || []);
  return list.map(function(v) {
    return '<option value="' + escapeHtml(v.id) + '" data-price="' + v.price + '">' +
      escapeHtml(v.label) + ' — ' + escapeHtml(formatPKR(v.price)) + '</option>';
  }).join('');
}

function buildProductOptionsHTML(product) {
  if (productHasSizes(product)) {
    const defaultSize = product.sizes[0];
    const sizeOptions = product.sizes.map(function(s, i) {
      return '<option value="' + escapeHtml(s.id) + '"' + (i === 0 ? ' selected' : '') + '>' +
        escapeHtml(s.label) + '</option>';
    }).join('');
    const defaultVariant = getVariantsForSize(product, defaultSize.id)[0];
    return `
      <div class="product-options product-options-sized">
        <div class="option-row">
          <label for="size-select">Size</label>
          <select id="size-select" class="variant-select size-select" data-product-id="${escapeHtml(product.id)}">
            ${sizeOptions}
          </select>
        </div>
        <div class="option-row">
          <label for="variant-select">Quantity</label>
          <select id="variant-select" class="variant-select qty-select">
            ${buildVariantSelectOptions(product, defaultSize.id)}
          </select>
        </div>
        <p class="product-price-detail" id="variant-price">${escapeHtml(formatPKR(defaultVariant.price))}</p>
      </div>
    `;
  }
  const defaultVariant = product.variants[0];
  return `
    <div class="product-options">
      <label for="variant-select">Choose option</label>
      <select id="variant-select" class="variant-select">${buildVariantSelectOptions(product)}</select>
      <p class="product-price-detail" id="variant-price">${escapeHtml(formatPKR(defaultVariant.price))}</p>
    </div>
  `;
}

function bindProductOptionControls(scope, product, callbacks) {
  const root = scope || document;
  const sizeSelect = root.querySelector('#size-select');
  const variantSelect = root.querySelector('#variant-select');
  const heroImg = root.querySelector('#product-hero-img') || root.querySelector('.featured-product-img');

  function refreshQtyOptions() {
    if (!sizeSelect || !variantSelect) return;
    const sizeId = sizeSelect.value;
    const prev = variantSelect.value;
    variantSelect.innerHTML = buildVariantSelectOptions(product, sizeId);
    const still = getVariantsForSize(product, sizeId).find(function(v) { return v.id === prev; });
    variantSelect.value = still ? still.id : variantSelect.options[0].value;
    if (heroImg && productHasSizes(product)) {
      heroImg.src = getProductImage(product, sizeId);
      const size = getSize(product, sizeId);
      heroImg.alt = product.title + ' — ' + size.label;
    }
    fireUpdate();
  }

  function fireUpdate() {
    if (!variantSelect) return;
    const variant = getVariant(product, variantSelect.value);
    if (callbacks && callbacks.onChange) callbacks.onChange(variant, sizeSelect ? sizeSelect.value : null);
  }

  if (sizeSelect) {
    sizeSelect.addEventListener('change', refreshQtyOptions);
  }
  if (variantSelect) {
    variantSelect.addEventListener('change', fireUpdate);
  }
  fireUpdate();
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

  const searchAction = isAll || currentPage === 'category'
    ? ' onsubmit="event.preventDefault();var q=document.getElementById(\'header-search\').value.trim();window.location.href=\'all-products.html\'+(q?\'?q=\'+encodeURIComponent(q):\'\');"'
    : ' action="all-products.html" method="get"';

  headerHost.innerHTML = `
    <div class="store-topbar">
      <span><strong>${escapeHtml(s.codLabel)}</strong> — Pay when you receive your order · Authentic Gilgit-Baltistan products</span>
    </div>
    <div class="store-header">
      <div class="store-header-inner store-container">
        <a class="store-logo" href="index.html" aria-label="KarakoramStore home">
          <span class="store-logo-text">karakoram</span>
          <span class="store-logo-sub">store</span>
        </a>
        <div class="store-header-utils">
          <p class="store-header-phone">Customer: <a href="tel:${escapeHtml(s.phoneTel)}">${escapeHtml(s.phone)}</a></p>
          <form class="store-header-search"${searchAction} role="search">
            <input type="search" name="q" id="header-search" placeholder="Search products…" aria-label="Search">
            <button type="submit" aria-label="Search">&#128269;</button>
          </form>
          <a class="store-header-link" href="contact.html">Place Order</a>
          <a class="store-header-link store-header-wa" href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <button class="menu-toggle store-menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
      </div>
    </div>
    <nav class="store-nav" id="mainNav" aria-label="Main">
      <div class="store-nav-inner store-container">
        <ul>
          <li${isAll ? ' class="active"' : ''}><a href="all-products.html">All Products</a></li>
          <li><a href="product.html?id=gilgiti-cap">Gilgiti Cap</a></li>
          <li><a href="product.html?id=asli-aftabi-shilajit">Shilajit</a></li>
          <li><a href="category.html?cat=traditional-wear">Traditional Wear</a></li>
          <li><a href="category.html?cat=health-wellness">Health &amp; Wellness</a></li>
          <li${isContact ? ' class="active"' : ''}><a href="contact.html">Order / Contact</a></li>
          <li${isAbout ? ' class="active"' : ''}><a href="about.html">About</a></li>
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
      <div class="footer-bottom">&copy; ${new Date().getFullYear()} KarakoramStore &middot; All Rights Reserved &middot; <a href="admin.html" style="color:#9fa89f;">Orders dashboard</a></div>
    </footer>
    <a href="#top" class="back-to-top" id="backToTop" aria-label="Back to top">&#8593;</a>
    <a class="float-whatsapp" href="${whatsappUrl()}" target="_blank" rel="noopener" aria-label="WhatsApp us">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
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
  const defaultSize = productHasSizes(product) ? product.sizes[0] : null;
  const defaultVariant = productHasSizes(product)
    ? getVariantsForSize(product, defaultSize.id)[0]
    : product.variants[0];
  const imgSrc = getProductImage(product, defaultSize ? defaultSize.id : null);

  let optionsBlock = '';
  if (productHasSizes(product)) {
    const sizeOptions = product.sizes.map(function(s, i) {
      return '<option value="' + escapeHtml(s.id) + '"' + (i === 0 ? ' selected' : '') + '>' + escapeHtml(s.label) + '</option>';
    }).join('');
    optionsBlock = `
      <label class="variant-label" for="feat-size-${escapeHtml(product.id)}">Size</label>
      <select class="variant-select featured-size-select" id="feat-size-${escapeHtml(product.id)}" data-product-id="${escapeHtml(product.id)}">
        ${sizeOptions}
      </select>
      <label class="variant-label" for="feat-qty-${escapeHtml(product.id)}">Quantity</label>
      <select class="variant-select featured-qty-select" id="feat-qty-${escapeHtml(product.id)}" data-product-id="${escapeHtml(product.id)}">
        ${buildVariantSelectOptions(product, defaultSize.id)}
      </select>
    `;
  } else {
    optionsBlock = `
      <label class="variant-label" for="feat-${escapeHtml(product.id)}">Select option</label>
      <select class="variant-select featured-qty-select" id="feat-${escapeHtml(product.id)}" data-product-id="${escapeHtml(product.id)}">
        ${buildVariantSelectOptions(product)}
      </select>
    `;
  }

  return `
    <article class="featured-card" data-product-id="${escapeHtml(product.id)}">
      <span class="card-cod-tag">Cash on Delivery</span>
      <a class="featured-card-image" href="product.html?id=${encodeURIComponent(product.id)}">
        <img class="featured-product-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.title)}" loading="lazy">
      </a>
      <div class="featured-card-body">
        <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.title)}</a></h3>
        <p class="featured-tagline">${escapeHtml(getVariantsSummary(product))}</p>
        ${optionsBlock}
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
  $$('.featured-card').forEach(function(card) {
    const productId = card.dataset.productId;
    const product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;

    const sizeSelect = card.querySelector('.featured-size-select');
    const qtySelect = card.querySelector('.featured-qty-select');
    const priceEl = card.querySelector('[data-price-for="' + productId + '"]');
    const orderBtn = card.querySelector('.btn-order');
    const heroImg = card.querySelector('.featured-product-img');

    function updateFeatured() {
      const variant = getVariant(product, qtySelect.value);
      if (priceEl) priceEl.textContent = formatPKR(variant.price);
      if (orderBtn) orderBtn.href = orderContactUrl(product, variant.id);
    }

    if (sizeSelect && qtySelect) {
      sizeSelect.addEventListener('change', function() {
        const sizeId = sizeSelect.value;
        qtySelect.innerHTML = buildVariantSelectOptions(product, sizeId);
        if (heroImg) {
          heroImg.src = getProductImage(product, sizeId);
          heroImg.alt = product.title + ' — ' + getSize(product, sizeId).label;
        }
        updateFeatured();
      });
    }

    qtySelect && qtySelect.addEventListener('change', updateFeatured);
    updateFeatured();
  });
}

function renderProductGrid(containerSel, products, limit) {
  const el = $(containerSel);
  if (!el) return;
  const list = (typeof limit === 'number' ? products.slice(0, limit) : products);
  el.innerHTML = list.map(productCardHTML).join('') ||
    '<p style="grid-column:1/-1;text-align:center;color:#999;">No products found.</p>';
}

function getProductMinPrice(product) {
  if (!product.variants || !product.variants.length) return 0;
  return Math.min.apply(null, product.variants.map(function(v) { return v.price; }));
}

function sortProducts(list, sortKey) {
  const sorted = list.slice();
  if (sortKey === 'name-asc') {
    sorted.sort(function(a, b) { return a.title.localeCompare(b.title); });
  } else if (sortKey === 'price-asc') {
    sorted.sort(function(a, b) { return getProductMinPrice(a) - getProductMinPrice(b); });
  } else if (sortKey === 'price-desc') {
    sorted.sort(function(a, b) { return getProductMinPrice(b) - getProductMinPrice(a); });
  }
  return sorted;
}

function shopProductCardHTML(product) {
  const defaultSize = productHasSizes(product) ? product.sizes[0] : null;
  const defaultVariant = productHasSizes(product)
    ? getVariantsForSize(product, defaultSize.id)[0]
    : product.variants[0];
  const imgSrc = getProductImage(product, defaultSize ? defaultSize.id : null);
  const compare = getCompareAtPrice(defaultVariant.price);
  const minPrice = getProductMinPrice(product);
  const showFrom = getProductMinPrice(product) !== defaultVariant.price || product.variants.length > 1;

  let optionsBlock = '';
  if (productHasSizes(product)) {
    const sizeOptions = product.sizes.map(function(s, i) {
      return '<option value="' + escapeHtml(s.id) + '"' + (i === 0 ? ' selected' : '') + '>' + escapeHtml(s.label) + '</option>';
    }).join('');
    optionsBlock =
      '<select class="shop-select shop-size-select" aria-label="Size" data-product-id="' + escapeHtml(product.id) + '">' + sizeOptions + '</select>' +
      '<select class="shop-select shop-qty-select" aria-label="Quantity" data-product-id="' + escapeHtml(product.id) + '">' +
      buildVariantSelectOptions(product, defaultSize.id) + '</select>';
  } else {
    optionsBlock =
      '<select class="shop-select shop-qty-select shop-select-full" aria-label="Option" data-product-id="' + escapeHtml(product.id) + '">' +
      buildVariantSelectOptions(product) + '</select>';
  }

  return (
    '<article class="shop-card" data-product-id="' + escapeHtml(product.id) + '" data-min-price="' + minPrice + '">' +
      '<div class="shop-card-media">' +
        '<span class="shop-badge shop-badge-sale">Sale</span>' +
        '<a class="shop-card-img-link" href="product.html?id=' + encodeURIComponent(product.id) + '">' +
          '<img class="shop-card-img" src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(product.title) + '" loading="lazy">' +
        '</a>' +
        '<a class="shop-quick-view" href="product.html?id=' + encodeURIComponent(product.id) + '">Quick view</a>' +
      '</div>' +
      '<div class="shop-card-body">' +
        '<p class="shop-vendor">KarakoramStore</p>' +
        '<h3 class="shop-card-title"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' + escapeHtml(product.title) + '</a></h3>' +
        '<div class="shop-card-price">' +
          (showFrom ? '<span class="shop-price-prefix">From </span>' : '') +
          '<span class="shop-price-compare">' + escapeHtml(formatPKR(compare)) + '</span>' +
          '<span class="shop-price-sale">' + escapeHtml(formatPKR(defaultVariant.price)) + '</span>' +
        '</div>' +
        '<div class="shop-card-options">' + optionsBlock + '</div>' +
        '<a class="btn shop-add-btn shop-order-btn" href="' + orderContactUrl(product, defaultVariant.id) + '">Add</a>' +
      '</div>' +
    '</article>'
  );
}

function bindShopProductCards() {
  $$('.shop-card').forEach(function(card) {
    const productId = card.dataset.productId;
    const product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;

    const sizeSelect = card.querySelector('.shop-size-select');
    const qtySelect = card.querySelector('.shop-qty-select');
    const orderBtn = card.querySelector('.shop-order-btn');
    const heroImg = card.querySelector('.shop-card-img');
    const compareEl = card.querySelector('.shop-price-compare');
    const saleEl = card.querySelector('.shop-price-sale');

    function updateCard() {
      const variant = getVariant(product, qtySelect.value);
      if (orderBtn) orderBtn.href = orderContactUrl(product, variant.id);
      if (compareEl) compareEl.textContent = formatPKR(getCompareAtPrice(variant.price));
      if (saleEl) saleEl.textContent = formatPKR(variant.price);
    }

    if (sizeSelect && qtySelect) {
      sizeSelect.addEventListener('change', function() {
        const sizeId = sizeSelect.value;
        qtySelect.innerHTML = buildVariantSelectOptions(product, sizeId);
        if (heroImg) {
          heroImg.src = getProductImage(product, sizeId);
          heroImg.alt = product.title + ' — ' + getSize(product, sizeId).label;
        }
        updateCard();
      });
    }
    qtySelect && qtySelect.addEventListener('change', updateCard);
    updateCard();
  });
}

function renderShopGrid(products, totalCount) {
  const grid = $('#shop-products-grid');
  const countEl = $('#shop-results-count');
  const sidebarCount = $('#shop-results-sidebar');
  const count = totalCount != null ? totalCount : products.length;
  const label = count + ' result' + (count === 1 ? '' : 's');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = '<p class="shop-empty">No products match your filters. <a href="all-products.html">View all products</a></p>';
    if (countEl) countEl.textContent = '0 results';
    if (sidebarCount) sidebarCount.textContent = '0 results';
    return;
  }
  grid.innerHTML = products.map(shopProductCardHTML).join('');
  if (countEl) countEl.textContent = label;
  if (sidebarCount) sidebarCount.textContent = label;
  bindShopProductCards();
}

function getCatalogMaxPrice() {
  return Math.max.apply(null, PRODUCTS.map(function(p) { return getProductMaxPrice(p); }));
}

function buildShopCategoryList(activeSlug) {
  const items = ['<li><a class="shop-cat-link' + (!activeSlug ? ' is-active' : '') + '" href="all-products.html">All Products</a></li>'];
  items.push('<li><a class="shop-cat-link" href="product.html?id=gilgiti-cap">Gilgiti Cap</a></li>');
  items.push('<li><a class="shop-cat-link" href="product.html?id=asli-aftabi-shilajit">Shilajit</a></li>');
  CATEGORIES.forEach(function(c) {
    const active = activeSlug === c.slug ? ' is-active' : '';
    items.push('<li><a class="shop-cat-link' + active + '" href="category.html?cat=' + encodeURIComponent(c.slug) + '">' + escapeHtml(c.label) + '</a></li>');
  });
  return items.join('');
}

function initShopSidebar() {
  const sidebar = $('#shop-sidebar');
  const backdrop = $('#shop-sidebar-backdrop');
  const openBtn = $('#shop-filter-open');
  const closeBtn = $('#shop-sidebar-close');
  function open() {
    if (sidebar) sidebar.classList.add('is-open');
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add('shop-sidebar-open');
  }
  function close() {
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('shop-sidebar-open');
  }
  openBtn && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  backdrop && backdrop.addEventListener('click', close);
}

function initShopPage(getProductList) {
  const page = document.body.dataset.page;
  if (page !== 'all-products' && page !== 'category') return;

  const catList = $('#shop-cat-list');
  const sortSelect = $('#shop-sort');
  const perPageSelect = $('#shop-per-page');
  const grid = $('#shop-products-grid');
  const activeCat = page === 'category' ? (getParam('cat') || '') : '';
  const maxCatalog = getCatalogMaxPrice();
  const rangeMin = $('#price-range-min');
  const rangeMax = $('#price-range-max');
  const inputMin = $('#price-input-min');
  const inputMax = $('#price-input-max');
  const filterStock = $('#filter-in-stock');
  const countStock = $('#count-in-stock');
  const clearBtn = $('#shop-clear-filters');
  const headerSearch = $('#header-search');

  if (catList) catList.innerHTML = buildShopCategoryList(activeCat);

  const list = getProductList();
  if (countStock) countStock.textContent = '(' + list.length + ')';

  [rangeMin, rangeMax, inputMin, inputMax].forEach(function(el) {
    if (!el) return;
    if (el.id.indexOf('max') !== -1) {
      el.max = maxCatalog;
      el.value = maxCatalog;
    } else if (el.id.indexOf('min') !== -1) {
      el.max = maxCatalog;
      el.value = 0;
    }
  });

  const qParam = getParam('q');
  if (headerSearch && qParam) headerSearch.value = qParam;

  function applyAndRender() {
    const q = (getParam('q') || '').toLowerCase().trim();
    const minP = inputMin ? parseInt(inputMin.value, 10) || 0 : 0;
    const maxP = inputMax ? parseInt(inputMax.value, 10) || maxCatalog : maxCatalog;
    const inStockOnly = !filterStock || filterStock.checked;

    let filtered = list.slice();
    if (q) {
      filtered = filtered.filter(function(p) {
        return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
      });
    }
    filtered = filtered.filter(function(p) {
      const min = getProductMinPrice(p);
      return min >= minP && min <= maxP;
    });
    if (!inStockOnly) filtered = [];

    const sortKey = sortSelect ? sortSelect.value : 'featured';
    const sorted = sortProducts(filtered, sortKey);
    const perPage = perPageSelect ? parseInt(perPageSelect.value, 10) || 20 : 20;
    renderShopGrid(sorted.slice(0, perPage), filtered.length);
  }

  function syncPriceFromRange() {
    if (rangeMin && inputMin) inputMin.value = rangeMin.value;
    if (rangeMax && inputMax) inputMax.value = rangeMax.value;
    applyAndRender();
  }

  function syncRangeFromInput() {
    if (rangeMin && inputMin) rangeMin.value = Math.min(parseInt(inputMin.value, 10) || 0, maxCatalog);
    if (rangeMax && inputMax) rangeMax.value = Math.min(parseInt(inputMax.value, 10) || maxCatalog, maxCatalog);
    applyAndRender();
  }

  applyAndRender();
  initShopSidebar();

  if (sortSelect) sortSelect.addEventListener('change', applyAndRender);
  if (perPageSelect) perPageSelect.addEventListener('change', applyAndRender);
  if (filterStock) filterStock.addEventListener('change', applyAndRender);
  if (rangeMin) rangeMin.addEventListener('input', syncPriceFromRange);
  if (rangeMax) rangeMax.addEventListener('input', syncPriceFromRange);
  if (inputMin) inputMin.addEventListener('change', syncRangeFromInput);
  if (inputMax) inputMax.addEventListener('change', syncRangeFromInput);

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (filterStock) filterStock.checked = true;
      if (rangeMin) rangeMin.value = 0;
      if (rangeMax) rangeMax.value = maxCatalog;
      if (inputMin) inputMin.value = 0;
      if (inputMax) inputMax.value = maxCatalog;
      if (sortSelect) sortSelect.value = 'featured';
      applyAndRender();
    });
  }

  $$('.shop-view-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      $$('.shop-view-btn').forEach(function(b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      if (grid) {
        grid.classList.remove('cols-2', 'cols-3', 'cols-4');
        grid.classList.add('cols-' + btn.dataset.cols);
      }
    });
  });
}

/* ---------- Home page ---------- */
function initHome() {
  if (document.body.dataset.page !== 'home') return;

  const s = siteContact();
  const trustPhone = $('#trust-phone');
  if (trustPhone) trustPhone.textContent = s.phone;

  const heroWa = $('#hero-whatsapp');
  if (heroWa) heroWa.href = whatsappUrl('Hi, I have a question about KarakoramStore.');
  const contactWa = $('#contact-wa-btn');
  if (contactWa) contactWa.href = whatsappUrl('Hi, I have a question about my KarakoramStore order.');

  const featuredHost = $('#featured-products');
  if (featuredHost && typeof PRODUCTS !== 'undefined') {
    featuredHost.innerHTML = PRODUCTS.map(featuredProductCardHTML).join('');
    bindFeaturedVariantSelects();
  }
}

/* ---------- All products / category shop ---------- */
function initAllProducts() {
  initShopPage(function() { return PRODUCTS.slice(); });
}

function initCategory() {
  const slug = getParam('cat') || 'traditional-wear';
  const cat = CATEGORIES.find(function(c) { return c.slug === slug; });
  const title = $('#cat-title');
  const desc = $('#cat-description');
  const breadcrumbCat = $('#breadcrumb-cat');
  if (title) title.textContent = cat ? cat.label : 'Category';
  if (breadcrumbCat) breadcrumbCat.textContent = cat ? cat.label : 'Category';
  if (desc) {
    desc.textContent = cat
      ? 'Browse ' + cat.label.toLowerCase() + ' from Gilgit-Baltistan. Cash on Delivery across Pakistan.'
      : '';
  }
  document.title = (cat ? cat.label : 'Category') + ' - KarakoramStore';
  initShopPage(function() {
    return PRODUCTS.filter(function(p) { return p.categories.includes(slug); });
  });
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

  const sizeParam = getParam('size');
  let defaultSize = productHasSizes(product) ? product.sizes[0].id : null;
  if (productHasSizes(product) && sizeParam) {
    const match = product.sizes.find(function(s) { return s.id === sizeParam; });
    if (match) defaultSize = match.id;
  }
  const defaultVariant = productHasSizes(product)
    ? getVariantsForSize(product, defaultSize)[0]
    : product.variants[0];
  const variantHTML = buildProductOptionsHTML(product);

  const related = PRODUCTS.filter(p => p.id !== product.id);
  const relatedHTML = related.map(p => `
    <li><a href="product.html?id=${encodeURIComponent(p.id)}">
      <span>${escapeHtml(p.title)}</span>
      <span class="arrow">View Product &raquo;</span>
    </a></li>
  `).join('');

  const heroImgSrc = getProductImage(product, defaultSize);
  const imageHTML = heroImgSrc
    ? `<div class="product-hero-image"><img id="product-hero-img" src="${escapeHtml(heroImgSrc)}" alt="${escapeHtml(product.title)}"></div>`
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

  const orderBtn = $('#order-btn');
  const waBtn = $('#wa-order-btn');

  if (productHasSizes(product) && sizeParam) {
    const sizeSelectEl = wrap.querySelector('#size-select');
    if (sizeSelectEl) sizeSelectEl.value = defaultSize;
    const variantSelectEl = wrap.querySelector('#variant-select');
    if (variantSelectEl) {
      variantSelectEl.innerHTML = buildVariantSelectOptions(product, defaultSize);
      variantSelectEl.value = defaultVariant.id;
    }
    const heroImg = wrap.querySelector('#product-hero-img');
    if (heroImg) {
      heroImg.src = getProductImage(product, defaultSize);
      heroImg.alt = product.title + ' — ' + getSize(product, defaultSize).label;
    }
  }

  bindProductOptionControls(wrap, product, {
    onChange: function(variant, sizeId) {
      const priceEl = $('#variant-price');
      if (priceEl) priceEl.textContent = formatPKR(variant.price);
      if (orderBtn) orderBtn.href = orderContactUrl(product, variant.id);
      if (waBtn) {
        var sizeLabel = sizeId && productHasSizes(product) ? getSize(product, sizeId).label + ' · ' : '';
        waBtn.href = whatsappUrl(
          'Hi, I want to order:\n' + product.title + '\n' + sizeLabel + variant.label + '\nPrice: ' + formatPKR(variant.price) + '\nPayment: Cash on Delivery\n\nMy name:\nCity:\nPhone:'
        );
      }
    }
  });
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
  const messageInput = $('#messageInput');
  const prepaidFields = $('#prepaid-fields');
  const prepaidInstructions = $('#prepaid-instructions');
  const txnInput = $('#order-txn');
  const screenshotInput = $('#order-screenshot');
  const contactWa = $('#contact-wa-btn');
  if (contactWa) contactWa.href = whatsappUrl('Hi, I have a question about my KarakoramStore order.');

  const phoneDisplay = $('#contact-page-phone');
  const emailDisplay = $('#contact-page-email');
  const hoursDisplay = $('#contact-page-hours');

  if (phoneDisplay) phoneDisplay.innerHTML = '<a href="tel:' + escapeHtml(s.phoneTel) + '">' + escapeHtml(s.phone) + '</a>';
  if (emailDisplay) emailDisplay.innerHTML = '<a href="mailto:' + escapeHtml(s.email) + '">' + escapeHtml(s.email) + '</a>';
  if (hoursDisplay) hoursDisplay.textContent = s.hours;
  const epDisplay = $('#contact-easypaisa');
  const jcDisplay = $('#contact-jazzcash');
  if (epDisplay && s.easypaisaAccount) epDisplay.textContent = s.easypaisaAccount;
  if (jcDisplay && s.jazzcashAccount) jcDisplay.textContent = s.jazzcashAccount;

  function fillVariants(product) {
    if (!variantSelect || !product || !product.variants) return;
    variantSelect.innerHTML = product.variants.map(function(v) {
      return '<option value="' + escapeHtml(v.id) + '">' + escapeHtml(getVariantLabel(product, v)) + ' — ' + escapeHtml(formatPKR(v.price)) + '</option>';
    }).join('');
  }

  function getSelectedPayment() {
    const checked = document.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : 'cod';
  }

  function updatePaymentUI() {
    const method = getSelectedPayment();
    const isPrepaid = method === 'easypaisa' || method === 'jazzcash';
    if (prepaidFields) prepaidFields.hidden = !isPrepaid;
    if (txnInput) txnInput.required = isPrepaid;
    if (screenshotInput) screenshotInput.required = isPrepaid;
    if (prepaidInstructions && isPrepaid) {
      const acct = method === 'easypaisa' ? s.easypaisaAccount : s.jazzcashAccount;
      const label = method === 'easypaisa' ? 'Easypaisa' : 'JazzCash';
      prepaidInstructions.innerHTML = 'Send payment to <strong>' + escapeHtml(acct) + '</strong> (' + label + '), then enter your <strong>Transaction ID</strong> and upload a <strong>screenshot</strong> below.';
    }
    const submitBtn = $('#submit-order-btn');
    if (submitBtn) {
      submitBtn.textContent = isPrepaid ? 'Submit Order (Prepaid)' : 'Submit Order (COD)';
    }
  }

  $$('input[name="payment"]').forEach(function(radio) {
    radio.addEventListener('change', updatePaymentUI);
  });
  updatePaymentUI();

  if (productSelect) {
    productSelect.addEventListener('change', function() {
      const product = PRODUCTS.find(function(p) { return p.id === productSelect.value; });
      fillVariants(product);
    });
  }

  if (productSelect && productId) {
    productSelect.value = productId;
    const product = PRODUCTS.find(function(p) { return p.id === productId; });
    fillVariants(product);
    if (variantSelect && variantId) variantSelect.value = variantId;
  }

  if (payment === 'easypaisa' || payment === 'jazzcash') {
    const payRadio = document.querySelector('input[name="payment"][value="' + payment + '"]');
    if (payRadio) payRadio.checked = true;
    updatePaymentUI();
  }

  const statusElOnLoad = $('#order-status');
  if (getParam('order') === 'sent' && statusElOnLoad) {
    statusElOnLoad.innerHTML =
      '<span class="order-success"><strong>Order sent!</strong> We will call or WhatsApp you to confirm.' +
      ' Check <strong>munashirmehdi@gmail.com</strong> (and spam) for the order email.' +
      ' First time only: if FormSubmit emailed you an activation link, click it so future orders arrive.</span>';
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = ($('#order-name') || {}).value ? $('#order-name').value.trim() : '';
      const phone = ($('#order-phone') || {}).value ? $('#order-phone').value.trim() : '';
      const city = ($('#order-city') || {}).value ? $('#order-city').value.trim() : '';
      const email = ($('#order-email') || {}).value ? $('#order-email').value.trim() : '';
      const pid = productSelect ? productSelect.value : '';
      const product = PRODUCTS.find(function(p) { return p.id === pid; });
      const vid = variantSelect ? variantSelect.value : '';
      const variant = product ? getVariant(product, vid) : null;

      if (!product || !variant) {
        alert('Please select a product and option.');
        return;
      }
      if (!name || !phone || !city) {
        alert('Please fill in your name, phone and delivery address.');
        return;
      }

      const paymentMethod = getSelectedPayment();
      if ((paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash')) {
        const txn = txnInput ? txnInput.value.trim() : '';
        const file = screenshotInput && screenshotInput.files && screenshotInput.files[0];
        if (!txn) {
          alert('Please enter your Transaction ID.');
          return;
        }
        if (!file) {
          alert('Please upload your payment screenshot.');
          return;
        }
      }

      const payload = buildOrderPayload({
        productId: pid,
        variantId: vid,
        paymentMethod: paymentMethod,
        transactionId: txnInput ? txnInput.value.trim() : '',
        name: name,
        phone: phone,
        city: city,
        email: email,
        notes: messageInput ? messageInput.value.trim() : ''
      });

      const screenshotFile = screenshotInput && screenshotInput.files && screenshotInput.files[0]
        ? screenshotInput.files[0] : null;

      const btn = $('#submit-order-btn');
      const statusEl = $('#order-status');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending order…'; }
      if (statusEl) statusEl.textContent = '';

      submitOrder(payload, screenshotFile).then(function(result) {
        if (result && result.redirecting) {
          if (statusEl) statusEl.textContent = 'Sending your order — please wait…';
          return;
        }
        if (result && result.ok) {
          var msg = 'Order sent! We will call or WhatsApp you to confirm.';
          if (result.via === 'web3forms' || result.via === 'google') {
            msg += ' A copy was emailed to <strong>munashirmehdi@gmail.com</strong>.';
          }
          var waExtra = '';
          if (typeof formatOrderEmailBody === 'function') {
            const waText = encodeURIComponent(formatOrderEmailBody(payload));
            waExtra = ' <a class="btn outline" style="margin-top:12px;display:inline-block" href="https://wa.me/' +
              escapeHtml(s.whatsapp) + '?text=' + waText + '" target="_blank" rel="noopener">Also send order on WhatsApp</a>';
          }
          if (statusEl) {
            statusEl.innerHTML = '<span class="order-success">' + msg +
              (result.orderId && result.orderId !== 'email' ? ' Ref: <strong>' + escapeHtml(result.orderId) + '</strong>' : '') +
              '</span>' + waExtra;
          }
          form.reset();
          document.querySelector('input[name="payment"][value="cod"]').checked = true;
          updatePaymentUI();
        } else if (result) {
          if (statusEl) {
            statusEl.innerHTML = '<span class="order-error">Could not send order: ' + escapeHtml(result.error || 'Please try again or WhatsApp us below.') + '</span>';
          }
        }
      }).finally(function() {
        if (btn && !document.hidden) {
          btn.disabled = false;
          updatePaymentUI();
        }
      });
    });
  }
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
