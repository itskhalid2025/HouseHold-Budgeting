# ⭐ PLATFORM ADMIN & AI USAGE TRACKING GUIDE

> **Version:** 1.0
> **Status:** Phase 5 Specification
> **Target:** Admin Portal (Web)

---

## 📖 TABLE OF CONTENTS

1.  [Overview & Goals](#1-overview--goals)
2.  [Architecture & Security](#2-architecture--security)
3.  [Database Schema](#3-database-schema)
4.  [Backend Implementation](#4-backend-implementation)
5.  [Frontend Admin Portal](#5-frontend-admin-portal)
6.  [AI Usage Tracking System](#6-ai-usage-tracking-system)

---

# 1️⃣ OVERVIEW & GOALS

The **Platform Admin Portal** is a restricted interface for super-admins to oversee the entire application. It is distinct from the "Household Owner" role.

### Key Capabilities:
*   **Global Oversight:** View all users and households.
*   **AI Management:** Track Gemini API token usage per user/household and enforce limits.
*   **System Health:** Monitor server status and logs.
*   **Announcements:** Broadcast messages to all users.
*   **Security:** Ban users or lock households.

---

# 2️⃣ ARCHITECTURE & SECURITY

### 🔐 Authentication Strategy
*   **Distinct Model:** Use `PlatformAdmin` model, NOT the standard `User` model.
*   **Separate Auth Flow:**
    *   Login: `POST /api/admin/auth/login`
    *   Guard: `AdminRoute` wrapper in frontend.
    *   Token: `adminToken` stored in localStorage (separate from `token`).

---

# 3️⃣ DATABASE SCHEMA

### 🛠 New Models

#### `PlatformAdmin`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Admin ID |
| `email` | String | Login Email |
| `passwordHash` | String | Hashed Password |
| `role` | Enum | `SUPER_ADMIN`, `MODERATOR` |
| `createdAt` | DateTime | |

#### `Announcement`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | |
| `title` | String | |
| `message` | String | Markdown supported |
| `type` | Enum | `INFO`, `WARNING`, `CRITICAL` |
| `isActive` | Boolean | |

#### `SystemSetting`
| Field | Type | Description |
| :--- | :--- | :--- |
| `key` | String | e.g., `maintenance_mode` |
| `value` | String | e.g., `true` |

### 🔄 Updates to Existing Models

#### `User` & `Household`
*   `aiRequestCount` (Int): Total requests made.
*   `aiTokenCount` (Int): Total tokens consumed.
*   `isAiRestricted` (Boolean): If true, block API calls.

---

# 4️⃣ BACKEND IMPLEMENTATION

## 🕹 Controllers

### `adminController.js`
*   `login`: Validate admin credentials.
*   `getStats`: Aggregate total users, total transaction volume, total AI tokens.
*   `getUsers`: Paginated list of users with search.
*   `getHouseholds`: Paginated list of households.
*   `banUser`: Toggle `isActive` on User.
*   `restrictAI`: Toggle `isAiRestricted`.
*   `createAnnouncement`: Post new global message.

## 🤖 AI Service (`geminiService.js`)
*   **Middleware:** Check `user.isAiRestricted` BEFORE calling Google API.
*   **Post-Processing:**
    *   Calculate token usage (input + output).
    *   Increment `aiTokenCount` on User and Household.
    *   Check if daily limit exceeded (optional).

---

# 5️⃣ FRONTEND ADMIN PORTAL

## 🎨 UI Layout
*   **AdminLayout:** Sidebar navigation (Dashboard, Users, Households, System).
*   **Theme:** Darker/Professional themes to distinguish from main app.

## 📱 Pages

### 1. Admin Login (`/admin/login`)
*   Dedicated login form. Does not use the main app's login.

### 2. Dashboard (`/admin/dashboard`)
*   **KPI Cards:** Total Users, Active Households, AI Token Usage (This Month).
*   **Chart:** AI Usage Trend (Daily).

### 3. User Management (`/admin/users`)
*   **Table:** Avatar, Name, Email, Household, AI Usage.
*   **Actions:**
    *   "Ban AI" (Toggle)
    *   "Reset Password"
    *   "Delete"

### 4. System Health (`/admin/system`)
*   **Maintenance Toggle:** Switch to lock main app.
*   **Logs:** Recent error logs (tail).
*   **Announcements:** Form to push new alerts.

---

# 6️⃣ AI USAGE TRACKING SYSTEM

### 📊 Metric Definition
*   **Request:** 1 call to `parseVoiceInput` or `Advisor`.
*   **Token:** Estimated characters / 4 (standard approximation).

### 🚦 Enforcement Logic
1.  **User Initiation:** User speaks or types.
2.  **Check:** Middleware verfies `!user.isAiRestricted`.
3.  **Execute:** Call Gemini API.
4.  **Track:**
    ```javascript
    await prisma.user.update({
        where: { id: userId },
        data: {
            aiRequestCount: { increment: 1 },
            aiTokenCount: { increment: estimatedTokens }
        }
    });
    ```
5.  **Limit (Optional):** If `aiTokenCount > MONTHLY_LIMIT`, auto-set `isAiRestricted = true`.
