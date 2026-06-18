// ContextCart Behavior Tracker
// Captures micro-signals: hover time, scroll depth, revisits, clicks

const API_BASE = 'http://localhost:8080/api';

// Generate or retrieve session ID
function getSessionId() {
  let sid = sessionStorage.getItem('cc_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    sessionStorage.setItem('cc_session', sid);
  }
  return sid;
}

const SESSION_ID = getSessionId();

// Per-card tracking state
const cardState = {};

function initTracker(productId, category, cardEl) {
  if (cardState[productId]) return;

  cardState[productId] = {
    productId,
    category,
    hoverStart: null,
    totalHover: 0,
    revisits: 0,
    clicks: 0,
    maxScroll: 0,
  };

  const state = cardState[productId];

  // Hover tracking
  cardEl.addEventListener('mouseenter', () => {
    state.hoverStart = Date.now();
    state.revisits += 1;
    cardEl.classList.add('hovered');
    logEvent(`Hover start → ${productId} (${category}), visit #${state.revisits}`);
  });

  cardEl.addEventListener('mouseleave', () => {
    if (state.hoverStart) {
      const elapsed = (Date.now() - state.hoverStart) / 1000;
      state.totalHover += elapsed;
      state.hoverStart = null;
    }
    cardEl.classList.remove('hovered');
    sendEvent(state);
  });

  // Click tracking
  cardEl.addEventListener('click', () => {
    state.clicks += 1;
    logEvent(`Click → ${productId} (total: ${state.clicks})`, 'event');
    sendEvent(state);
  });
}

// Scroll depth tracking (global)
function trackScrollDepth() {
  const scrollDepth = () => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    return total > 0 ? Math.min(scrolled / total, 1.0) : 0;
  };

  window.addEventListener('scroll', () => {
    const depth = scrollDepth();
    // Update all active cards' scroll depth
    Object.values(cardState).forEach(state => {
      state.maxScroll = Math.max(state.maxScroll, depth);
    });
  }, { passive: true });
}

trackScrollDepth();

// Send event to backend
async function sendEvent(state) {
  const payload = {
    sessionId: SESSION_ID,
    productId: state.productId,
    category: state.category,
    hoverTime: Math.round(state.totalHover * 10) / 10,
    scrollDepth: Math.round(state.maxScroll * 100) / 100,
    revisits: state.revisits,
    clicks: state.clicks
  };

  try {
    await fetch(`${API_BASE}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    logEvent(`Sent → ${state.category}: hover=${payload.hoverTime}s, scroll=${(payload.scrollDepth * 100).toFixed(0)}%, revisits=${payload.revisits}`);
  } catch (e) {
    logEvent('⚠️ Backend offline — running in demo mode', 'event');
  }
}

function logEvent(msg, type = 'log') {
  const log = document.getElementById('behaviorLog');
  if (!log) return;
  const el = document.createElement('div');
  el.className = `log-entry ${type}`;
  el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  log.prepend(el);
  // Keep log clean
  while (log.children.length > 50) log.removeChild(log.lastChild);
}

window.CC = { getSessionId, initTracker, logEvent, sendEvent, cardState, API_BASE };
