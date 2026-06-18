// ContextCart — Shop Page Logic
// NOTE: API_BASE, SESSION_ID come from tracker.js via window.CC

// Display session ID in navbar
document.getElementById('sessionDisplay').textContent = window.CC.getSessionId().slice(0, 16) + '…';

const PRODUCTS = [
  { id: 'p1', name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', price: 29999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', desc: 'Industry-leading noise cancellation' },
  { id: 'p2', name: 'Samsung 65" 4K QLED TV', category: 'Electronics', price: 89999, img: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300', desc: 'Quantum HDR, 120Hz refresh' },
  { id: 'p3', name: 'Apple MacBook Air M2', category: 'Electronics', price: 114999, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300', desc: '18-hour battery, 8-core GPU' },
  { id: 'p4', name: 'Nike Air Max 270', category: 'Fashion', price: 12995, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', desc: 'Max Air cushioning, streetwear icon' },
  { id: 'p5', name: "Levi's 511 Slim Jeans", category: 'Fashion', price: 3999, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', desc: 'Classic slim fit, premium denim' },
  { id: 'p6', name: 'Zara Oversized Blazer', category: 'Fashion', price: 5990, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300', desc: 'Relaxed fit, versatile styling' },
  { id: 'p7', name: 'Instant Pot Duo 7-in-1', category: 'Home & Kitchen', price: 8999, img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300', desc: 'Pressure cooker, slow cooker & more' },
  { id: 'p8', name: 'Dyson V15 Vacuum', category: 'Home & Kitchen', price: 52900, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', desc: 'Laser dust detection, 60-min runtime' },
  { id: 'p9', name: 'IKEA KALLAX Shelf Unit', category: 'Home & Kitchen', price: 7999, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', desc: 'Versatile storage & display' },
  { id: 'p10', name: 'The Alchemist — Paulo Coelho', category: 'Books', price: 299, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300', desc: '25M+ copies sold worldwide' },
  { id: 'p11', name: 'Atomic Habits — James Clear', category: 'Books', price: 499, img: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=300', desc: 'Tiny changes, remarkable results' },
  { id: 'p12', name: 'Creatine Monohydrate 500g', category: 'Sports & Fitness', price: 1299, img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', desc: 'Micronized, unflavored, lab-tested' },
  { id: 'p13', name: 'Yoga Mat Premium 6mm', category: 'Sports & Fitness', price: 1999, img: 'https://images.unsplash.com/photo-1601925228925-39a1b5a6e0fd?w=300', desc: 'Non-slip, eco-friendly TPE' },
  { id: 'p14', name: 'JBL Flip 6 Bluetooth Speaker', category: 'Electronics', price: 9999, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300', desc: 'IP67 waterproof, 12hr battery' },
  { id: 'p15', name: 'Scented Candle Gift Set', category: 'Home & Kitchen', price: 1499, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300', desc: 'Soy wax, 6 relaxing fragrances' },
];

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports & Fitness'];
let activeFilter = 'all';

const CAT_COLORS = {
  'Electronics': 'E8F4FD',
  'Fashion': 'FDF2F8',
  'Home & Kitchen': 'F0FDF4',
  'Books': 'FFFBEB',
  'Sports & Fitness': 'FFF1F0',
};

function getCatEmoji(cat) {
  const map = { 'Electronics': '💻', 'Fashion': '👗', 'Home & Kitchen': '🏠', 'Books': '📚', 'Sports & Fitness': '🏋️' };
  return map[cat] || '🛍️';
}

function renderCatalog(filter) {
  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = '';
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  filtered.forEach(p => {
    const card = createProductCard(p, false);
    grid.appendChild(card);
    window.CC.initTracker(p.id, p.category, card);
  });
}

function createProductCard(p, isRec) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const bg = CAT_COLORS[p.category] || 'F8F9FE';
  const imgSrc = p.img || p.image || '';
  const descText = p.desc || p.description || '';
  card.innerHTML = `
    ${isRec && p.intentScore ? `<div class="intent-tag">⚡ ${(p.intentScore * 100).toFixed(0)}% match</div>` : ''}
    <div style="width:100%;height:160px;background:#${bg};display:flex;align-items:center;justify-content:center;overflow:hidden;">
      <img src="${imgSrc}" alt="${p.name}" loading="lazy"
        style="width:100%;height:160px;object-fit:cover;"
        onerror="this.parentElement.innerHTML='<span style=font-size:3rem>${getCatEmoji(p.category)}</span>'" />
    </div>
    <div class="product-info">
      <div class="product-cat">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${descText}</div>
      <div class="product-footer">
        <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
        <button class="add-btn">Add to Cart</button>
      </div>
    </div>`;
  return card;
}

async function fetchRecommendations() {
  const grid = document.getElementById('recommendationsGrid');
  const sid = window.CC.getSessionId();
  try {
    const res = await fetch(`${window.CC.API_BASE}/recommendations/${sid}?limit=6`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const { recommendations, categoryScores } = data;
    if (!recommendations || recommendations.length === 0) {
      grid.innerHTML = '<div class="empty-state">Keep browsing — recommendations will appear here.</div>';
    } else {
      grid.innerHTML = '';
      recommendations.forEach(p => {
        const card = createProductCard(p, true);
        grid.appendChild(card);
        window.CC.initTracker(p.id, p.category, card);
      });
    }
    updateIntentBars(categoryScores);
  } catch {
    showDemoRecommendations();
  }
}

function showDemoRecommendations() {
  const catScores = {};
  Object.values(window.CC.cardState).forEach(s => {
    if (!catScores[s.category]) catScores[s.category] = 0;
    const hoverNorm = Math.min((s.totalHover || 0) / 30, 1);
    const revisitNorm = Math.min((s.revisits || 0) / 5, 1);
    catScores[s.category] += hoverNorm * 0.5 + revisitNorm * 0.5;
  });
  updateIntentBars(catScores);
  const sorted = Object.entries(catScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return;
  const topCats = sorted.slice(0, 2).map(([cat]) => cat);
  const recs = PRODUCTS.filter(p => topCats.includes(p.category)).slice(0, 6);
  if (recs.length === 0) return;
  const grid = document.getElementById('recommendationsGrid');
  grid.innerHTML = '';
  recs.forEach(p => {
    const card = createProductCard(p, false);
    grid.appendChild(card);
    window.CC.initTracker(p.id, p.category, card);
  });
}

function updateIntentBars(scores) {
  const container = document.getElementById('intentBars');
  if (!scores || Object.keys(scores).length === 0) {
    container.innerHTML = '<div style="opacity:0.6;font-size:0.8rem;">Browse products to see intent build up...</div>';
    return;
  }
  const max = Math.max(...Object.values(scores), 0.01);
  container.innerHTML = CATEGORIES.map(cat => {
    const score = scores[cat] || 0;
    const pct = Math.round((score / max) * 100);
    return `
      <div class="intent-bar-item">
        <div class="intent-bar-label">${cat}</div>
        <div class="intent-bar-track">
          <div class="intent-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="intent-bar-score">${(score * 100).toFixed(0)}%</div>
      </div>`;
  }).join('');
}

document.getElementById('categoryFilters').addEventListener('click', e => {
  if (!e.target.classList.contains('filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  activeFilter = e.target.dataset.cat;
  renderCatalog(activeFilter);
});

renderCatalog('all');
fetchRecommendations();
setInterval(fetchRecommendations, 5000);