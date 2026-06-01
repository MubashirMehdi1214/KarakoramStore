/* Product catalog for KarakoramStore */
const BOOKS = [
  {
    id: "gilgiti-cap",
    slug: "gilgiti-cap",
    title: "Gilgiti Cap",
    categories: ["traditional-wear"],
    cover: "traditional",
    price: "PKR 1,500",
    excerpt: "Authentic hand-crafted Gilgiti cap from the Karakoram region — warm, durable and a timeless symbol of mountain heritage.",
    description: [
      "## Authentic Mountain Heritage",
      "The Gilgiti Cap is one of the most recognizable symbols of culture in Gilgit-Baltistan and the wider Karakoram region. Worn for generations by locals and visitors alike, it represents warmth, craftsmanship and pride in mountain heritage.",
      "Each cap is made with care using quality wool and traditional stitching techniques passed down through local artisans. The classic design features a rounded crown and soft brim, ideal for cold mountain weather while remaining comfortable for everyday wear.",
      "## Quality & Craftsmanship",
      "Our Gilgiti caps are sourced from trusted local makers who understand the original patterns, materials and finishing that define a genuine cap. Whether you are looking for a cultural keepsake, a gift for someone who loves the mountains, or practical winter headwear, this cap delivers on all fronts.",
      "## Perfect For",
      "Tourists and expats seeking an authentic souvenir, residents who want a reliable winter cap, and anyone who appreciates handmade goods from Pakistan's northern regions. Available for order across Pakistan with delivery arranged after confirmation via our contact page."
    ]
  },
  {
    id: "asli-aftabi-shilajit",
    slug: "asli-aftabi-shilajit",
    title: "Asli Aftabi Shilajit",
    categories: ["health-wellness"],
    cover: "health",
    price: "PKR 2,500",
    excerpt: "Pure Himalayan shilajit resin from the Karakoram — traditionally valued for vitality, stamina and natural wellness support.",
    description: [
      "## Pure From the Karakoram",
      "Asli Aftabi Shilajit is natural mineral-rich resin formed over centuries in the high-altitude rocks of the Himalayas and Karakoram. For generations it has been used in traditional wellness practices across Gilgit-Baltistan and surrounding regions.",
      "Our shilajit is carefully collected, purified and packed to preserve its natural properties. We work with trusted suppliers who understand proper sourcing and handling so you receive a product you can trust.",
      "## Traditional Wellness Support",
      "Shilajit is widely valued for supporting energy, stamina, recovery after physical exertion and general vitality. Many customers use a small daily amount dissolved in warm water, milk or tea as part of their routine.",
      "As with any natural supplement, results vary by individual. We recommend starting with the suggested serving size and consulting a healthcare professional if you have existing health conditions or take medication.",
      "## How to Use",
      "Take a pea-sized portion (approximately 300–500 mg) once or twice daily. Dissolve fully in warm liquid before drinking. Store in a cool, dry place away from direct sunlight. Keep the jar tightly closed to maintain freshness.",
      "## Order With Confidence",
      "Every jar is labeled with batch information and usage guidance. Contact us via phone or WhatsApp to place your order — we ship across Pakistan with secure packaging."
    ]
  }
];

const CATEGORIES = [
  { slug: "traditional-wear", label: "Traditional Wear" },
  { slug: "health-wellness", label: "Health & Wellness" }
];

if (typeof module !== "undefined") {
  module.exports = { BOOKS, CATEGORIES };
}
