/* Product catalog for KarakoramStore */
const PRODUCTS = [
  {
    id: "gilgiti-cap",
    slug: "gilgiti-cap",
    title: "Gilgiti Cap",
    categories: ["traditional-wear"],
    cover: "traditional",
    image: "images/GilgitiCap.png",
    excerpt: "Authentic hand-crafted Gilgiti cap — available in Elders (adult) and Kids sizes. Order 1, 2, 3 or 5 caps with Cash on Delivery.",
    sizes: [
      { id: "elders", label: "Elders (Adult)", image: "images/GilgitiCap.png" },
      { id: "kids", label: "Kids", image: "images/GilgitcapKids.jpeg" }
    ],
    variants: [
      { id: "elders-1-cap", size: "elders", label: "1 Cap", price: 1500 },
      { id: "elders-2-caps", size: "elders", label: "2 Caps", price: 2800 },
      { id: "elders-3-caps", size: "elders", label: "3 Caps", price: 4000 },
      { id: "elders-5-caps", size: "elders", label: "5 Caps", price: 6500 },
      { id: "kids-1-cap", size: "kids", label: "1 Cap", price: 1500 },
      { id: "kids-2-caps", size: "kids", label: "2 Caps", price: 2800 },
      { id: "kids-3-caps", size: "kids", label: "3 Caps", price: 4000 },
      { id: "kids-5-caps", size: "kids", label: "5 Caps", price: 6500 }
    ],
    description: [
      "## Two Sizes — Elders & Kids",
      "Our Gilgiti caps come in two fits: **Elders (Adult)** for men and women, and **Kids** for children. Both are handmade with the same traditional wool, velvet front and feather detail — sized correctly for each age group.",
      "## Authentic Mountain Heritage",
      "The Gilgiti Cap is one of the most recognizable symbols of culture in Gilgit-Baltistan and the wider Karakoram region. Each cap is made with care using quality wool and stitching techniques passed down through local artisans.",
      "## Order Your Quantity",
      "Choose your size (Elders or Kids), then select how many caps you need — 1, 2, 3 or 5. Perfect for family orders and gifts.",
      "## Cash on Delivery",
      "Select size and quantity, place your order, and pay cash when the courier delivers anywhere in Pakistan."
    ]
  },
  {
    id: "asli-aftabi-shilajit",
    slug: "asli-aftabi-shilajit",
    title: "Asli Aftabi Shilajit",
    categories: ["health-wellness"],
    cover: "health",
    image: "images/Shilajit.png",
    excerpt: "Pure Himalayan shilajit resin from the Karakoram — traditionally valued for vitality, stamina and natural wellness support.",
    variants: [
      { id: "250g", label: "250 Gram", price: 2500 },
      { id: "500g", label: "500 Gram", price: 4500 },
      { id: "1kg", label: "1 KG", price: 8000 }
    ],
    description: [
      "## Pure From the Karakoram",
      "Asli Aftabi Shilajit is natural mineral-rich resin formed over centuries in the high-altitude rocks of the Himalayas and Karakoram. For generations it has been used in traditional wellness practices across Gilgit-Baltistan and surrounding regions.",
      "Our shilajit is carefully collected, purified and packed to preserve its natural properties. Choose the size that suits you — 250 gram, 500 gram or 1 KG jars.",
      "## Traditional Wellness Support",
      "Shilajit is widely valued for supporting energy, stamina, recovery after physical exertion and general vitality. Many customers use a small daily amount dissolved in warm water, milk or tea as part of their routine.",
      "## How to Use",
      "Take a pea-sized portion (approximately 300–500 mg) once or twice daily. Dissolve fully in warm liquid before drinking. Store in a cool, dry place away from direct sunlight.",
      "## Cash on Delivery",
      "Order online with confidence — pay cash on delivery when your package arrives at your home."
    ]
  }
];

const CATEGORIES = [
  { slug: "traditional-wear", label: "Traditional Wear" },
  { slug: "health-wellness", label: "Health & Wellness" }
];

function formatPKR(amount) {
  return "PKR " + Number(amount).toLocaleString("en-PK");
}

function productHasSizes(product) {
  return !!(product && product.sizes && product.sizes.length);
}

function getSize(product, sizeId) {
  if (!productHasSizes(product)) return null;
  return product.sizes.find(function(s) { return s.id === sizeId; }) || product.sizes[0];
}

function getVariantsForSize(product, sizeId) {
  if (!product || !product.variants) return [];
  if (!productHasSizes(product)) return product.variants;
  return product.variants.filter(function(v) { return v.size === sizeId; });
}

function getVariant(product, variantId) {
  if (!product || !product.variants) return null;
  return product.variants.find(function(v) { return v.id === variantId; }) || product.variants[0];
}

function getVariantLabel(product, variant) {
  if (!variant) return "";
  if (productHasSizes(product) && variant.size) {
    var size = getSize(product, variant.size);
    return (size ? size.label : "") + " · " + variant.label;
  }
  return variant.label;
}

function getProductImage(product, sizeId) {
  if (productHasSizes(product) && sizeId) {
    var size = getSize(product, sizeId);
    if (size && size.image) return size.image;
  }
  return product.image || "";
}

function getProductPriceDisplay(product) {
  if (!product.variants || !product.variants.length) return product.price || "";
  var prices = product.variants.map(function(v) { return v.price; });
  var min = Math.min.apply(null, prices);
  var max = Math.max.apply(null, prices);
  if (min === max) return formatPKR(min);
  return "From " + formatPKR(min);
}

function getVariantsSummary(product) {
  if (productHasSizes(product)) {
    return "Elders & Kids · 1, 2, 3 or 5 caps";
  }
  if (!product.variants || !product.variants.length) return "";
  return product.variants.map(function(v) { return v.label; }).join(" · ");
}

if (typeof module !== "undefined") {
  module.exports = {
    PRODUCTS, CATEGORIES, formatPKR, productHasSizes, getSize, getVariantsForSize,
    getVariant, getVariantLabel, getProductImage, getProductPriceDisplay, getVariantsSummary
  };
}
