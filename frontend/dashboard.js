// ContextCart — Marketer Dashboard
const API_BASE = 'http://localhost:8080/api';
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports & Fitness'];

let barChart = null;
let lineChart = null;
let eventCount = 0;
let timeLabels = [];
let timeScoreData = {}; // category -> [scores over time]
let refreshTimer = 5;

// ── Chart setup ──────────────────────────────────────────────────
function initCharts() {
  const barCtx = document.getElementById('intentBarChart').getContext('2d');
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: CATEGORIES,
      datasets: [{
        label: 'Intent Score',
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#6C63FF','#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF'],
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          max: 1,
          ticks: { color: '#94A3B8', callback: v => (v * 100).toFixed(0) + '%' },
          grid: { color: '#2D2D44' }
        },
        x: { ticks: { color: '#94A3B8' }, grid: { display: false } }
      }
    }
  });

  const lineCtx = document.getElementById('intentLineChart').getContext('2d');
  lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: CATEGORIES.map((cat, i) => ({
        label: cat,
        data: [],
        borderColor: ['#6C63FF','#FF6B6B','#4ECDC4','#FFE66D','#A8E6CF'][i],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
      }))
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } } },
      scales: {
        y: {
          max: 1,
          ticks: { color: '#94A3B8', callback: v => (v * 100).toFixed(0) + '%' },
          grid: { color: '#2D2D44' }
        },
        x: { ticks: { color: '#94A3B8', maxTicksLimit: 8 }, grid: { display: false } }
      }
    }
  });
}

// ── Fetch dashboard data ─────────────────────────────────────────
async function fetchDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    updateDashboard(data);
  } catch {
    showOfflineDemo();
  }
}

function updateDashboard(data) {
  const { activeSessions, sessionScores } = data;

  // Aggregate scores across all sessions
  const aggScores = {};
  CATEGORIES.forEach(c => aggScores[c] = 0);

  Object.values(sessionScores).forEach(scores => {
    CATEGORIES.forEach(cat => {
      aggScores[cat] = Math.max(aggScores[cat], scores[cat] || 0);
    });
    eventCount += 1;
  });

  // KPIs
  document.getElementById('kpiSessions').textContent = activeSessions || 0;
  document.getElementById('kpiEvents').textContent = eventCount;

  const sorted = Object.entries(aggScores).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];
  document.getElementById('kpiTopCat').textContent = topCat[1] > 0 ? topCat[0].split(' ')[0] : '—';

  const avg = Object.values(aggScores).reduce((a, b) => a + b, 0) / CATEGORIES.length;
  document.getElementById('kpiAvgScore').textContent = (avg * 100).toFixed(0) + '%';

  // Bar chart
  barChart.data.datasets[0].data = CATEGORIES.map(c => aggScores[c]);
  barChart.update();

  // Line chart
  const now = new Date().toLocaleTimeString();
  timeLabels.push(now);
  if (timeLabels.length > 12) timeLabels.shift();
  lineChart.data.labels = timeLabels;

  CATEGORIES.forEach((cat, i) => {
    if (!timeScoreData[cat]) timeScoreData[cat] = [];
    timeScoreData[cat].push(aggScores[cat]);
    if (timeScoreData[cat].length > 12) timeScoreData[cat].shift();
    lineChart.data.datasets[i].data = timeScoreData[cat];
  });
  lineChart.update();

  // Session table
  updateSessionTable(sessionScores);

  // Insight
  updateInsight(sorted, activeSessions);
}

function updateSessionTable(sessionScores) {
  const tbody = document.getElementById('sessionTableBody');
  const entries = Object.entries(sessionScores);

  if (entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No sessions yet — open the shop and browse.</td></tr>';
    return;
  }

  tbody.innerHTML = entries.map(([sid, scores]) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    return `<tr>
      <td style="font-family:monospace;font-size:0.78rem;color:#94A3B8">${sid.slice(0, 20)}…</td>
      ${CATEGORIES.map(cat => `<td class="score-cell">${((scores[cat] || 0) * 100).toFixed(0)}%</td>`).join('')}
      <td><span class="top-cat-badge">${top && top[1] > 0 ? top[0] : '—'}</span></td>
    </tr>`;
  }).join('');
}

function updateInsight(sorted, sessions) {
  const el = document.getElementById('insightText');
  const top = sorted[0];
  if (!top || top[1] === 0) {
    el.textContent = 'Waiting for user activity — open the shop page and start browsing to see insights populate.';
    return;
  }
  const confidence = top[1] > 0.6 ? 'high' : top[1] > 0.3 ? 'moderate' : 'early';
  el.innerHTML = `<strong>${sessions} active session${sessions !== 1 ? 's' : ''}</strong> show ${confidence} intent toward <strong>${top[0]}</strong> (score: ${(top[1] * 100).toFixed(0)}%). Consider surfacing <strong>${top[0]}</strong> ads or promotions — users in this cohort are primed to convert.`;
}

// ── Offline demo mode ────────────────────────────────────────────
function showOfflineDemo() {
  // Simulate rising scores for demo purposes
  const demoScores = {
    'Electronics': Math.min((timeScoreData['Electronics']?.slice(-1)[0] || 0) + Math.random() * 0.08, 0.85),
    'Fashion': Math.min((timeScoreData['Fashion']?.slice(-1)[0] || 0) + Math.random() * 0.05, 0.6),
    'Home & Kitchen': Math.random() * 0.2,
    'Books': Math.random() * 0.15,
    'Sports & Fitness': Math.random() * 0.1,
  };

  updateDashboard({
    activeSessions: 1,
    sessionScores: { 'demo_session': demoScores },
  });
}

// ── Countdown timer ──────────────────────────────────────────────
function startCountdown() {
  const el = document.getElementById('refreshCountdown');
  setInterval(() => {
    refreshTimer -= 1;
    if (refreshTimer <= 0) {
      refreshTimer = 5;
      fetchDashboard();
    }
    el.textContent = refreshTimer + 's';
  }, 1000);
}

// ── Init ─────────────────────────────────────────────────────────
initCharts();
fetchDashboard();
startCountdown();
