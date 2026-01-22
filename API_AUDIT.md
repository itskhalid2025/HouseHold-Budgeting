# API Endpoints Audit & Comparison

> Generated: January 22, 2026

## Configuration

| Location | Value |
|----------|-------|
| **Backend Base** | `http://localhost:3001` |
| **Frontend API_BASE_URL** | `http://localhost:3001/api` ([api.js:2](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L2)) |

---

## Backend Route Mounting (server.js)

| Mount Path | Router File | Line |
|------------|-------------|------|
| `/api/admin` | adminRoutes | [server.js:38](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L38) |
| `/api/auth` | authRoutes | [server.js:39](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L39) |
| `/api/households` | householdRoutes | [server.js:40](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L40) |
| `/api/invitations` | invitationRoutes | [server.js:41](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L41) |
| `/api/transactions` | transactionRoutes | [server.js:42](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L42) |
| `/api/incomes` | incomeRoutes | [server.js:43](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/server.js#L43) |

---

## Auth Endpoints

| Method | Backend Route | Backend Line | Frontend Call | Frontend Line | Status |
|--------|--------------|--------------|---------------|---------------|--------|
| POST | `/api/auth/register` | [auth.js:72](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L72) | `/auth/register` | [api.js:52](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L52) | ✅ Match |
| POST | `/api/auth/login` | [auth.js:110](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L110) | `/auth/login` | [api.js:66](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L66) | ✅ Match |
| POST | `/api/auth/forgot-password` | [auth.js:134](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L134) | `/auth/forgot-password` | [api.js:84](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L84) | ✅ Match |
| POST | `/api/auth/reset-password` | [auth.js:163](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L163) | `/auth/reset-password` | [api.js:93](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L93) | ✅ Match |
| GET | `/api/auth/me` | [auth.js:184](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L184) | `/auth/me` | [api.js:102](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L102) | ✅ Match |
| POST | `/api/auth/logout` | [auth.js:199](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/auth.js#L199) | ❌ Not called | - | ⚠️ Frontend missing |

---

## Household Endpoints

| Method | Backend Route | Backend Line | Frontend Call | Frontend Line | Status |
|--------|--------------|--------------|---------------|---------------|--------|
| POST | `/api/households` | [households.js:63](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/households.js#L63) | `/households` | [api.js:111](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L111) | ✅ Match |
| GET | `/api/households` | [households.js:64](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/households.js#L64) | `/households` | [api.js:120](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L120) | ✅ Match |
| POST | `/api/households/join` | [households.js:90](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/households.js#L90) | `/households/join` | [api.js:127](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L127) | ✅ Match |
| POST | `/api/households/leave` | [households.js:105](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/households.js#L105) | `/households/leave` | [api.js:136](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L136) | ✅ Match |

---

## Invitation Endpoints

| Method | Backend Route | Backend Line | Frontend Call | Frontend Line | Status |
|--------|--------------|--------------|---------------|---------------|--------|
| POST | `/api/invitations` | [invitations.js:90](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/invitations.js#L90) | `/invitations` | [api.js:146](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L146) | ✅ Match |
| GET | `/api/invitations` | [invitations.js:93](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/invitations.js#L93) | `/invitations` | [api.js:155](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L155) | ✅ Match |
| POST | `/api/invitations/:token/accept` | [invitations.js:117](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/invitations.js#L117) | `/invitations/${token}/accept` | [api.js:162](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L162) | ✅ Match |

---

## Transaction Endpoints

| Method | Backend Route | Backend Line | Frontend Call | Frontend Line | Status |
|--------|--------------|--------------|---------------|---------------|--------|
| POST | `/api/transactions` | [transactions.js:70](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L70) | `/transactions` | [api.js:172](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L172) | ✅ Match |
| GET | `/api/transactions` | [transactions.js:120](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L120) | `/transactions` + query | [api.js:183](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L183) | ✅ Match |
| GET | `/api/transactions/summary` | [transactions.js:147](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L147) | `/transactions/summary` | [api.js:193](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L193) | ✅ Match |
| GET | `/api/transactions/:id` | [transactions.js:169](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L169) | ❌ Not called | - | ⚠️ Frontend missing |
| PUT | `/api/transactions/:id` | [transactions.js:212](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L212) | `/transactions/${id}` | [api.js:202](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L202) | ✅ Match |
| DELETE | `/api/transactions/:id` | [transactions.js:236](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/transactions.js#L236) | `/transactions/${id}` | [api.js:211](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L211) | ✅ Match |

---

## Income Endpoints

| Method | Backend Route | Backend Line | Frontend Call | Frontend Line | Status |
|--------|--------------|--------------|---------------|---------------|--------|
| POST | `/api/incomes` | [incomes.js:68](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L68) | `/incomes` | [api.js:221](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L221) | ✅ Match |
| GET | `/api/incomes` | [incomes.js:91](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L91) | `/incomes?active=` | [api.js:230](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L230) | ✅ Match |
| GET | `/api/incomes/monthly-total` | [incomes.js:120](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L120) | `/incomes/monthly-total` | [api.js:237](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L237) | ✅ Match |
| GET | `/api/incomes/:id` | [incomes.js:142](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L142) | ❌ Not called | - | ⚠️ Frontend missing |
| PUT | `/api/incomes/:id` | [incomes.js:185](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L185) | `/incomes/${id}` | [api.js:244](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L244) | ✅ Match |
| DELETE | `/api/incomes/:id` | [incomes.js:209](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/incomes.js#L209) | `/incomes/${id}` | [api.js:253](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js#L253) | ✅ Match |

---

## Summary

### ✅ All Critical Endpoints Match

The API_BASE_URL is correctly set to `http://localhost:3001/api`, and all frontend calls properly concatenate paths like `/transactions` to form `http://localhost:3001/api/transactions`.

### ⚠️ Minor Missing (Not Critical)
- `GET /api/auth/logout` - Not used in frontend
- `GET /api/transactions/:id` - Single transaction fetch not implemented
- `GET /api/incomes/:id` - Single income fetch not implemented

### 🔍 Potential Issues to Check

1. **400 Errors**: The validation expects `amount` as a **number**, not a string. Fixed in recent changes.

2. **Check Backend Terminal**: If requests fail, look for validation errors in the backend console.

3. **Check Request Body**: Open browser DevTools → Network tab → Check the request payload.
