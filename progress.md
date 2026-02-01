# Project Progress Report
**Date:** February 2, 2026
**Status:** Phase 2 Complete (Admin & AI Controls)

## 1. AI Integration & Controls

### Features Implemented
The platform now supports three distinct AI-powered features:
1.  **Advisor Chat**: GPT-4 powered financial assistant.
2.  **Smart Entry**: AI transaction parsing and categorization.
3.  **Financial Reports**: AI-generated monthly summaries.

### Usage & Rate Limiting Logic
*   **Tracking**: Every AI request is logged with `type`, `tokens`, and `country` (IP-based).
*   **User Quotas**:
    *   Admins can set specific numeric limits for *each* feature per user (e.g., "50 Chats/month", "5 Reports/month").
    *   Defaults applied if no specific limit is set.
*   **Household Controls**:
    *   **Master Switch**: Admins can Enable/Disable specific features for an entire household.
    *   *Note*: Numeric quotas at the household level were removed to favor granular user-level control.
*   **Priority**: 
    *   If a Household has a feature **Disabled**, it overrides the User's permission (Access Blocked).
    *   If Household is **Enabled**, the User's personal quota applies.

### Notification System
A robust, real-time notification system handles AI usage feedback.
*   **Visual Style**: Responsive "Banner" style (Top-center mobile, Top-right desktop). White glassmorphism card with colored status borders.
*   **Triggers**:
    1.  **Low Usage Warning** (⚠️ Orange):
        *   Fires when a user has **3 or fewer** requests remaining.
        *   *Message*: "2 Smart Entry uses remaining."
    2.  **Limit Reached** (🚫 Red):
        *   Fires when quota is exhausted.
        *   *Message*: "Your monthly limit of 50 reached for Chat."
    3.  **Access Blocked** (🚫 Red):
        *   Fires if the feature is disabled by an Admin (User or Household level).
        *   *Message*: "Household AI access is restricted."
*   **Technical Implementation**:
    *   Backend sends `X-AI-Warning` headers.
    *   Frontend listens for `ai-warning` and `ai-error` events.
    *   **CORS Fix**: `Access-Control-Expose-Headers` is configured to allow the frontend to read these signals.

---

## 2. Admin Dashboard & Management

### Analytics Dashboard
*   **Real-time Stats**: Total Users, Households, AI Requests (Daily/Monthly).
*   **Trend Graph**: 
    *   Stacked bar chart showing daily usage volume.
    *   **Interactive Tooltips**: Hovering over bars shows exact counts for Chat, Smart Entry, and Reports. (Fixed clipping issues).
*   **Service Distribution**: Visual breakdown of which AI features are most popular.

### User Management
*   **CRUD**: Create, Read, Update, Delete users.
*   **Profile Editing**: Modify names, reset passwords, verify emails manually.
*   **AI Settings**: Granular toggles and limit inputs for Chat, Smart Entry, and Reports.
*   **Search**: Filter users by name or email.

### Household Management
*   **Listing**: View all households, member counts, and countries.
*   **Feature Toggles**: Master switches to turn AI features On/Off for the whole group.
*   **Variable Consistency**: Standardized `reportsEnabled` / `reportsLimit` keys across the stack to ensure saving persistence.

---

## 3. Backend Architecture
*   **Stack**: Node.js, Express, Prisma (PostgreSQL).
*   **Middleware**:
    *   `trackAiUsage`: Centralized middleware for enforcement and logging.
    *   `auth`: Secure JWT authentication (User & Admin scopes).
*   **Security**: Role-based access control (Super Admin vs Standard Admin).

## 4. Next Steps / Pending
*   **Global Settings**: The "Platform Settings" page is currently a UI simulation and needs backend wiring.
*   **Mobile PWA**: formatting and Phase guide compliance (Active).
