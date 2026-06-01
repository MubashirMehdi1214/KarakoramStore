/* Product catalog for KarakoramStore */
const PRODUCTS = [
  {
    id: "gilgiti-cap",
    slug: "gilgiti-cap",
    title: "Gilgiti Cap",
    categories: ["traditional-wear"],
    cover: "traditional",
    image: "images/GilgitiCap.png",
    excerpt: "Authentic hand-crafted Gilgiti cap from the Karakoram region — warm, durable and a timeless symbol of mountain heritage.",
    variants: [
      { id: "1-cap", label: "1 Cap", price: 1500 },
      { id: "2-caps", label: "2 Caps", price: 2800 },
      { id: "3-caps", label: "3 Caps", price: 4000 },
      { id: "5-caps", label: "5 Caps", price: 6500 }
    ],
    description: [
      "## Authentic Mountain Heritage",
      "The Gilgiti Cap is one of the most recognizable symbols of culture in Gilgit-Baltistan and the wider Karakoram region. Worn for generations by locals and visitors alike, it represents warmth, craftsmanship and pride in mountain heritage.",
      "Each cap is made with care using quality wool and traditional stitching techniques passed down through local artisans. The classic design features a rounded crown and soft brim, ideal for cold mountain weather while remaining comfortable for everyday wear.",
      "## Quality & Craftsmanship",
      "Our Gilgiti caps are sourced from trusted local makers who understand the original patterns, materials and finishing that define a genuine cap. Order 1, 2, 3 or more caps — perfect as gifts for family and friends.",
      "## Cash on Delivery",
      "Select your quantity, place your order and pay cash when the courier delivers to your doorstep anywhere in Pakistan."
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

function getVariant(product, variantId) {
  if (!product || !product.variants) return null;
  return product.variants.find(function(v) { return v.id === variantId; }) || product.variants[0];
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
  if (!product.variants || !product.variants.length) return "";
  return product.variants.map(function(v) { return v.label; }).join(" · ");
}

if (typeof module !== "undefined") {
  module.exports = { PRODUCTS, CATEGORIES, formatPKR, getVariant, getProductPriceDisplay, getVariantsSummary };
}
