# ⭐ HOUSEHOLD BUDGETING – FULL PWA MOBILE INTERFACE DESIGN GUIDE

> **Version:** 1.0  
> **Status:** Draft / Master Blueprint  
> **Target Platform:** Mobile PWA (iOS/Android)  
> **Tech Stack:** React (Vite), Node.js (Express), MongoDB (Prisma)

---

## 📖 TABLE OF CONTENTS

1.  [Mobile Goals & Philosophy](#1-mobile-goals--philosophy)
2.  [Design System & Visual Identity](#2-design-system--visual-identity)
3.  [Architecture & API Integration](#3-architecture--api-integration)
4.  [Navigation & Interaction Patterns](#4-navigation--interaction-patterns)
5.  [Phase 1: Foundation & PWA Setup](#phase-1-foundation--pwa-setup)
6.  [Phase 2: Component Library](#phase-2-component-library)
7.  [Phase 3: Core Features (Dashboard & Transactions)](#phase-3-core-features-dashboard--transactions)
8.  [Phase 4: Advanced Features (Savings, Reports, AI)](#phase-4-advanced-features-savings-reports-ai)
9.  [Phase 5: Offline-First & Sync](#phase-5-offline-first--sync)
10. [Phase 6: Performance & Deployment](#phase-6-performance--deployment)

---

# 1️⃣ MOBILE GOALS & PHILOSOPHY

Your PWA must behave like a **native mobile app**. It should not feel like a website.

### ✔ Native App Feel
*   **Full-screen Experience:** `display: standalone` in manifest. No browser address bar.
*   **Fluid Navigation:** SPA (Single Page Application) transitions. No page reloads.
*   **Touch Optimised:** Large touch targets (min 44px), swipe gestures, bottom-sheet modals.

### ✔ Offline Reliability
*   **Read-Only Offline:** Dashboard and cached lists work without internet.
*   **Write-Queue Offline:** Transactions added offline are queued and synced when online.

### ✔ High Performance
*   **First Point of Paint:** < 1.0s.
*   **Interactive:** < 1.5s.
*   **Smoothness:** 60fps animations.

---

# 2️⃣ DESIGN SYSTEM & VISUAL IDENTITY

### 🎨 Color Palette

| Usage | Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | **Purple** | `#6A35FF` | Branding, Primary Buttons, Active States |
| **Secondary** | **Soft Purple** | `#A98CFF` | Gradients, Accents |
| **Background** | **Off-White** | `#F7F8F9` | App Background (Light Mode) |
| **Surface** | **White** | `#FFFFFF` | Cards, Modals, Nav Bar |
| **Income** | **Green** | `#00C27C` | Income, Positive Trends |
| **Expense** | **Red** | `#FF4D67` | Spending, Negative Trends, Alerts |
| **Savings** | **Blue** | `#3699FF` | Goals, Progress Bars |
| **Text Main** | **Dark Slate** | `#1E293B` | Headings, Primary Text |
| **Text Muted** | **Gray** | `#64748B` | Subtitles, Captions |

### 🔠 Typography

*   **Font Family:** Inter, Roboto, or System UI.
*   **Headings:**
    *   `h1`: 24px Bold (Page Titles)
    *   `h2`: 20px Semi-Bold (Section Headers)
    *   `h3`: 18px Medium (Card Titles)
*   **Body:**
    *   `body-lg`: 16px Regular (Standard Text)
    *   `body-sm`: 14px Regular (Secondary Text)
*   **Labels:** 12px Medium/Bold (Badges, Captions)

### 🧱 Layout & Spacing

*   **Grid:** 4-column mobile grid.
*   **Padding:** 16px horizontal padding (safe area).
*   **Gaps:**
    *   Components: 12px
    *   Sections: 20px
*   **Border Radius:**
    *   Cards: `14px`
    *   Buttons: `12px`
    *   Modals: `24px` (top corners only)

### ✨ Shadows & Depth

*   **Card Shadow:** `0px 4px 16px rgba(0,0,0,0.06)` (Soft, elevated)
*   **Floating Button (FAB):** `0px 8px 20px rgba(106, 53, 255, 0.3)`
Absolutely — here is the **extended version of your PWA Mobile Interface Guide WITH FULL STYLE DETAILS**, including:

✔ Spacing scale
✔ Radius scale
✔ Elevation & shadow system
✔ Component sizing
✔ Button hierarchy
✔ Icons & illustration guidelines
✔ Chart styling
✔ Animation guidelines
✔ Color usage rules
✔ Dark mode rules
✔ Accessibility guidelines

This transforms your guide into a **complete Figma-grade design system**.

---

# 🎨 **FULL STYLE SYSTEM FOR HOUSEHOLD BUDGETING – MOBILE PWA**

### *(Add this as Section 2.1 under “Design System & Visual Identity”)*

---

# 2.1️⃣ **STYLE DETAILS (FULL DESIGN SYSTEM)**

This section covers the **UI rules**, **spacing**, **sizing**, **elevation**, and **interaction behaviors** your PWA must follow.

---

# 🎨 1. Color System – Full Specification

### 🎯 **Brand Colors**

| Token             | Hex         | Usage                    |
| ----------------- | ----------- | ------------------------ |
| `--primary`       | **#6A35FF** | Buttons, active elements |
| `--primary-light` | **#A98CFF** | Gradients, accents       |
| `--primary-dark`  | **#4A1ECF** | Pressed states           |

### 📊 **Semantic Colors**

| Type    | Color | Hex         | Usage                         |
| ------- | ----- | ----------- | ----------------------------- |
| Income  | Green | **#00C27C** | Income values, success badges |
| Expense | Red   | **#FF4D67** | Expense values, warnings      |
| Savings | Blue  | **#3699FF** | Goals, charts                 |

### ⚪ **Neutrals**

| Token           | Hex         | Purpose         |
| --------------- | ----------- | --------------- |
| `--bg`          | **#F7F8F9** | Page background |
| `--card`        | **#FFFFFF** | Cards, sheets   |
| `--line`        | **#E2E8F0** | Dividers        |
| `--t-primary`   | **#1E293B** | Main text       |
| `--t-secondary` | **#64748B** | Muted text      |

### 🌙 **Dark Mode Neutral Colors**

| Token                | Hex         |
| -------------------- | ----------- |
| `--bg-dark`          | **#0F1217** |
| `--card-dark`        | **#1C1F26** |
| `--t-primary-dark`   | **#E2E8F0** |
| `--t-secondary-dark` | **#94A3B8** |

---

# 🔠 2. Typography Rules

### Font Family:

**Inter** (Primary)
Fallback: `-apple-system`, `Roboto`, `system-ui`

### Text Styles:

| Token     | Size | Weight | Usage            |
| --------- | ---- | ------ | ---------------- |
| `h1`      | 24px | 700    | Screen titles    |
| `h2`      | 20px | 600    | Section titles   |
| `h3`      | 18px | 600    | Cards            |
| `body-lg` | 16px | 400    | General text     |
| `body`    | 14px | 400    | Secondary text   |
| `label`   | 12px | 500    | Badges, captions |

### Line Height:

* Titles → **125%**
* Body → **140%**

---

# 📏 3. Spacing System

Use this scale:

| Token      | px   |
| ---------- | ---- |
| `space-2`  | 2px  |
| `space-4`  | 4px  |
| `space-8`  | 8px  |
| `space-12` | 12px |
| `space-16` | 16px |
| `space-20` | 20px |
| `space-24` | 24px |
| `space-32` | 32px |

### Layout Padding:

```
Page horizontal padding → 16px  
Section gap → 20px  
Component gap → 12px  
Card padding → 16px  
```

---

# 🔳 4. Radius System

Use rounded, friendly shapes.

| Token                  | Value    |
| ---------------------- | -------- |
| Button radius          | **12px** |
| Card radius            | **14px** |
| Sheet/Modal top radius | **24px** |
| Tag radius             | **8px**  |
| Input radius           | **14px** |

This creates a smooth, modern fintech feel.

---

# ☁ 5. Elevation & Shadow Guidelines

### Base Card Shadow:

```
0px 4px 16px rgba(0,0,0,0.06)
```

### FAB Shadow:

```
0px 8px 20px rgba(106, 53, 255, 0.3)
```

### Modal Drop Shadow:

```
0px -4px 24px rgba(0,0,0,0.15)
```

---

# 🎛 6. Component Sizing Rules

### 🔘 Buttons

* Height: **48px**
* Padding: `12px 16px`
* Full width on mobile

Button types:

#### PRIMARY BUTTON (solid)

```
background: linear-gradient(135deg, #6A35FF, #A98CFF)
color: white
```

#### SECONDARY BUTTON

```
background: #FFFFFF
border: 1px solid #E2E8F0
color: #6A35FF
```

#### DANGER BUTTON

```
background: #FF4D67
color: white
```

---

### 🧾 Input Fields

* Height: 48px
* Border: `1px solid #E5E7EB`
* Placeholder: Muted grey

---

### 🃏 Cards

* Padding: 16px
* Radius: 14px
* Shadow: soft
* Background: white

Variants:

* Stat card
* Metric card
* Transaction card

---

### 📊 Charts

Use **Recharts** with:

#### Pie / Donut:

* Stroke width: 3px
* Gap: 2px
* Central label: 16px medium

#### Bar chart:

* Bar width: 20px
* Rounded tops
* Income → Green
* Expense → Red
* Savings → Blue

#### Line chart:

* Curve: monotone
* Dot radius: 4px
* Stroke width: 3px

---

# 📱 7. Interaction & Motion

### Page Transitions

```
Slide-in: 150–200ms  
Opacity fade: 100–150ms
```

### Modal Transitions

```
Slide-up: 180ms ease-out  
Backdrop fade: 120ms  
```

### Swipe Interactions

* Swipe left to reveal edit/delete
* Swipe horizontally to change transaction tabs

### Pull to Refresh

* Use 50px pull distance trigger
* Animation: rotate arrow → loading spinner

---

# 🌙 8. Dark Mode Rules

#### Automatic Based on System:

```css
@media (prefers-color-scheme: dark) { ... }
```

### Light → Dark conversions:

| Element    | Light   | Dark          |
| ---------- | ------- | ------------- |
| Background | #F7F8F9 | #0F1217       |
| Cards      | #FFFFFF | #1C1F26       |
| Shadow     | subtle  | none / deeper |
| Text       | #1E293B | #E2E8F0       |
| Muted Text | #64748B | #94A3B8       |

### Keep financial colors the same:

* Income green
* Expense red
* Savings blue

These should **not** shift in dark mode.

---

# 🧩 9. Icon Rules

### Icon Type:

* Feather Icons
* Simple, round, consistent stroke width

### Icon Sizes:

| Usage                  | Size    |
| ---------------------- | ------- |
| Bottom nav             | 24px    |
| Buttons                | 20px    |
| Cards                  | 28px    |
| Transaction categories | 32–36px |

---

# 🎯 10. Accessibility Requirements

* Minimum touch target: **44x44 px**
* Minimum contrast ratio: **4.5 : 1**
* Avoid low contrast text on gradients
* Provide haptic feedback for:

  * Add transaction
  * Delete
  * Swipe actions
  * Voice input start

---

# 🔐 11. Safe Area Insets (iPhone Notch Support)

Use:

```css
padding-bottom: env(safe-area-inset-bottom);
```

Apply to:

* Bottom nav
* Modals
* FAB position

---

# 🌬 12. Micro-interactions & Feedback

### Transaction Added:

* Bottom snackbar:

```
"Transaction added!"
duration: 1500ms
```

### Goal Completed:

* Confetti burst animation
* Success modal

### Errors:

* Red shake animation for invalid input

---

# 📦 13. Component Library Tokens

Add these design tokens to your codebase:

```
--color-primary: #6A35FF;
--color-primary-light: #A98CFF;
--color-income: #00C27C;
--color-expense: #FF4D67;
--color-savings: #3699FF;

--radius-card: 14px;
--radius-button: 12px;
--radius-modal: 24px;

--shadow-card: 0 4px 16px rgba(0,0,0,0.06);
--shadow-fab: 0 8px 20px rgba(106,53,255,0.3);

--space-4: 4px;
--space-8: 8px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
```

---

# 🎉 DONE — FULL STYLE DETAILS ADDED

Your guide now qualifies as a **complete PWA mobile design system**, comparable to:

* Stripe Mobile Design Spec
* Apple HIG
* Google Material 3
* Monzo’s fintech style

---


---

# 3️⃣ ARCHITECTURE & API INTEGRATION

The PWA interacts with the Node.js/Express backend. Ensure these endpoints are hooked up correctly.

### 🔗 Key Endpoints

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | JWT Login |
| **Dashboard** | `GET` | `/api/transactions/summary` | Stats (Income vs Expense) |
| | `GET` | `/api/incomes/monthly` | Monthly Income Total |
| | `GET` | `/api/goals/summary` | Savings Summary |
| **Transactions** | `GET` | `/api/transactions` | List all (supports pagination & filters) |
| | `POST` | `/api/transactions` | Add new transaction |
| | `PUT` | `/api/transactions/:id` | Update transaction |
| | `DELETE` | `/api/transactions/:id` | Delete transaction |
| **Members** | `GET` | `/api/households/members` | Get household members for dropdowns |
| **Voice AI** | `POST` | `/api/smart/parse-voice` | Parse voice/text input (mock or real) |

---

# 4️⃣ NAVIGATION & INTERACTION PATTERNS

### Bottom Navigation Bar
Fixed at the bottom. 5 Icons.
1.  **Dashboard** (Home)
2.  **Transactions** (List & Search)
3.  **Savings** (Goals)
4.  **Reports** (Analytics)
5.  **Settings** (Profile & Prefs)

> **Floating Action Button (FAB):** A generic "+" button is often better placed *above* the nav bar or as a prominent button in the header/bottom-right for quick adding. In this design, we use a **Floating Add Button** centered or contextual.

### Interaction Rules
*   **Modals:** Use "Bottom Sheets" (slide up from bottom) for adding transactions, viewing details, and filters. Do *not* use centered alerts/dialogs for complex forms.
*   **Swipe Actions:** Swipe left on a list item to Reveal "Edit" and "Delete" buttons.
*   **Pull to Refresh:** Implement on Dashboard and Transaction lists to re-sync data.

---

# 5️⃣ PHASE IMPLEMENTATION GUIDE

## PHASE 1: FOUNDATION & PWA SETUP

**Goal:** Create the shell that installs as an app.

1.  **Manifest File (`public/manifest.json`):**
    *   `name`: "HouseHold Budgeting"
    *   `display`: "standalone"
    *   `background_color`: "#F7F8F9"
    *   `theme_color`: "#6A35FF"
    *   `icons`: Provide 192x192 and 512x512 PNGs.
2.  **Service Worker (`src/sw.js`):**
    *   Use **Workbox** or standard Service Worker API.
    *   Cache strategy: **Stale-While-Revalidate** for API calls, **Cache-First** for assets (images, fonts).
3.  **Meta Tags (`index.html`):**
    *   `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` (Prevents zooming, feels native).
    *   `<meta name="theme-color" content="#6A35FF">`.

## PHASE 2: COMPONENT LIBRARY

**Goal:** Build reusable UI blocks to ensure consistency.

*   `Button.jsx`: Props for `variant` (primary, secondary, danger), `size` (full, sm), `icon`.
*   `Card.jsx`: Base white container with shadow and radius.
*   `Input.jsx`: Styled text/number inputs with floating labels or clear placeholders.
*   `Modal.jsx`: Reusable Bottom Sheet component. Should handle open/close animations.
*   `Navbar.jsx`: Fixed bottom navigation with active state highlighting.
*   `TransactionItem.jsx`: List item showing icon, description, date, user avatar, and amount.

## PHASE 3: CORE FEATURES (DASHBOARD & TRANSACTIONS)

**Goal:** The main daily usage flows.

### Dashboard (Home)
*   **Header:** Welcome message + Notification bell.
*   **Summary Cards:** Income, Expenses, Savings (Horizontal scroll if needed or Grid).
*   **Chart:** Simple Trend Line (Last 7 days). Use `recharts`.
*   **Recent Activity:** Show last 5 transactions. "View All" button links to Transactions tab.
*   **Voice/Text Action:** Two prominent buttons or a FAB to trigger "Smart Entry" modal.

### Transactions Page
*   **Filters:** Sticky bar at top (Type, Monthly, Category).
*   **List:** Infinite scroll (Load More) or Pagination (Next/Prev).
*   **Swipe-to-Edit:** Use a library like `react-swipeable-list` or custom CSS transforms.
*   **Add Transaction Modal:**
    *   Large Amount Input (Auto-focus).
    *   Date Picker (Native mobile picker).
    *   Category Selection (Grid of icons).
    *   "Paid By" User Dropdown (Critical for household attribution).

## PHASE 4: ADVANCED FEATURES (SAVINGS, REPORTS, AI)

### Savings & Goals
*   **Goal Cards:** Visual progress bar (calculated from `savedAmount / targetAmount`).
*   **Confetti:** Trigger animation when a goal is reached.

### Reports
*   **Visuals:** Pie chart for Categories. Bar chart for Monthly comparison.
*   **Date Range:** "This Month", "Last Month", "Custom".

### AI Advisor
*   **Chat Interface:** Bubble style.
*   **Suggestions:** Chips like "How much did I spend on food?" or "Predict next month".
*   **Integration:** Calls `/api/advisor/chat`.

## PHASE 5: OFFLINE-FIRST & SYNC

**Goal:** Ensure data safety when connection drops.

1.  **Redux/Context Store:** Keep `transactions` in global state.
2.  **Persistence:** Use `redux-persist` or manual `localStorage` to save the store.
3.  **Queue System:**
    *   If `navigator.onLine` is false:
        *   Save `POST /transactions` data to `localStorage.syncQueue`.
        *   Update UI optimistically (add to list immediately with "pending" icon).
    *   When `window.addEventListener('online')` fires:
        *   Loop through `syncQueue` and send requests.
        *   On success, remove from queue and update UI status.

## PHASE 6: PERFORMANCE & DEPLOYMENT

**Goal:** 100/100 Lighthouse Score.

1.  **Code Splitting:** Use `React.lazy()` for routes (`Dashboard`, `Settings`, etc.).
2.  **Image Optimization:** Serve `.webp` images. Use distinct sizes for avatars.
3.  **Font Loading:** Use `font-display: swap`.
4.  **Deployment:**
    *   Build command: `npm run build`.
    *   Host: **Netlify** (Ensure `_redirects` file exists for SPA routing: `/* /index.html 200`).

---

# 📝 DEVELOPMENT CHECKLIST

### 1. Setup
- [ ] Initialize Vite project (done).
- [ ] Configure `manifest.json`.
- [ ] Setup simple Service Worker.

### 2. UI Foundation
- [ ] Create `variables.css` with Color Palette.
- [ ] Build `Navbar` and `Layout` components.

### 3. Feature Implementation
- [ ] **Dashboard:** Fetch stats from API, display charts.
- [ ] **Transactions:** Fetch list, implement Add/Edit Modal.
- [ ] **Add Logic:** Hook up `POST /transactions` with "Paid By" field.
- [ ] **Settings:** Theme toggle, Profile view.

### 4. Polish
- [ ] Add Loading skeletons (shimmer effect).
- [ ] Add Toast notifications for success/error.
- [ ] Test "Add to Home Screen" on iOS/Android.

---

> **Note:** This guide assumes the backend is running and accessible. If developing locally on mobile, ensure your backend is exposed via LAN IP (e.g., `http://192.168.1.50:5000`) or use a tunnel like Ngrok.
