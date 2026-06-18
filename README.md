# ContextCart — Real-Time Purchase Intent Prediction

**Epsilon TeXpedition Hackathon 2026**

---

## What it does

ContextCart predicts purchase intent **passively** — by watching how users behave on a page (scroll patterns, hover duration, section revisits, click events) and surfaces hyper-personalized product recommendations **in real time**, before the user consciously knows what they want.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| Frontend | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js |
| API | REST (JSON) |

---

## Project Structure

```
contextcart/
├── backend/                   ← Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/contextcart/
│       ├── ContextCartApplication.java
│       ├── controller/ContextCartController.java
│       ├── model/BehaviorEvent.java
│       ├── model/Product.java
│       └── service/IntentScoringService.java
└── frontend/                  ← Static web app
    ├── index.html             ← Shop page (demo canvas)
    ├── dashboard.html         ← Marketer dashboard
    ├── style.css
    ├── tracker.js             ← Behavior capture engine
    ├── app.js                 ← Shop page logic
    └── dashboard.js           ← Dashboard charts & data
```

---

## How to Run

### Prerequisites
- Java 17+
- Maven 3.6+
- Any modern browser

### Step 1 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`

Verify it's running:
```
GET http://localhost:8080/api/health
```

### Step 2 — Open the Frontend

Open `frontend/index.html` directly in your browser, or serve it with VS Code Live Server.

> **Note:** No build step needed for the frontend — it's plain HTML/JS.

### Step 3 — Demo Flow

1. Open `frontend/index.html` — this is the shop page
2. Hover over product cards in different categories (Electronics, Fashion, etc.)
3. Scroll through sections, click on items
4. Watch the **"Recommended For You"** panel update live
5. Watch the **intent bars** in the hero section fill up
6. Open `frontend/dashboard.html` in another tab to see the **Marketer Dashboard**
7. The dashboard shows real-time category intent heatmap, trend lines, and session breakdown

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/event` | Receive a behavior event |
| GET | `/api/recommendations/{sessionId}` | Get personalized product recommendations |
| GET | `/api/dashboard` | Marketer view — all sessions + scores |
| GET | `/api/health` | Health check |

### Sample Event Payload

```json
{
  "sessionId": "sess_abc123",
  "productId": "p1",
  "category": "Electronics",
  "hoverTime": 4.5,
  "scrollDepth": 0.65,
  "revisits": 2,
  "clicks": 1
}
```

### Intent Score Formula

```
score = (hoverTime_normalized × 0.35)
      + (scrollDepth × 0.25)
      + (revisits_normalized × 0.25)
      + (clicks_normalized × 0.15)
```

---

## Demo without Backend

The frontend works in **demo mode** even if the backend is offline — it computes intent scores locally from the tracker state and shows recommendations. Great for a quick frontend-only demo.

---

## Built by

Team — VIT-AP University  
Epsilon TeXpedition 2026
