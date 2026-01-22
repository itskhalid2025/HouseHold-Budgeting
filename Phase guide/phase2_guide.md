# Phase 2: Authentication & User Management

> **Duration**: Days 4-5  
> **Prerequisites**: Phase 1 completed, database running  
> **Goal**: Implement secure user registration, login, and session management  
> **Status**: 🟡 **IN PROGRESS** (70% - Backend ✅, Frontend ✅, Routing ❌)

---

## 📋 websitelook.md Alignment

This phase implements **Screens 1.1, 1.2, 1.3** from `websitelook.md`.

| Page # | Page Name | Status | Image States |
|--------|-----------|--------|--------------|
| 1.1 | Login Page | ✅ | Default, Error, Loading |
| 1.2 | Register Page | ✅ | Default, Validation Error, Success |
| 1.3 | Forgot Password | ✅ | Default, Email Sent Confirmation |

### Frontend Components Built:
- ✅ `api/api.js` - API service with auth endpoints
- ✅ `context/AuthContext.jsx` - Auth state management
- ✅ `pages/Login.jsx` - Login form with glassmorphism
- ✅ `pages/Register.jsx` - Registration with all fields
- ✅ `pages/ForgotPassword.jsx` - Password reset flow
- ✅ `pages/Auth.css` - Dark mode styling

### Remaining Tasks:
- [ ] Update `App.jsx` with auth routes
- [ ] Add `ProtectedRoute` component
- [ ] Add header with login/logout state

---

## Phase Overview

This phase builds the authentication system. By the end, you will have:
- User registration with email + phone (both unique identifiers)
- Secure password hashing with bcrypt
- JWT-based authentication
- Login/logout functionality
- Protected route middleware

---

## Task Checklist

### 1. User Registration

#### 1.1 Create Registration Endpoint
- [ ] Create auth routes file
- [ ] Implement registration controller
- [ ] Add input validation (email, phone, password)
- [ ] Hash password with bcrypt
- [ ] Generate JWT on successful registration

**LLM Prompt for Registration Controller:**
```
Create an Express.js registration controller (backend/src/controllers/authController.js) for user registration.

Requirements:
- Export async function: register(req, res, next)
- Extract from req.body: email, phone, password, firstName, lastName, currency
- Validate inputs:
  - Email: valid format, unique (check database)
  - Phone: valid format (E.164), unique
  - Password: min 8 chars, 1 uppercase, 1 number
  - firstName, lastName: 2-50 characters
  - currency: valid ISO 4217 code (USD, EUR, etc.)
- Hash password using bcrypt with 12 rounds
- Create user in database using Prisma
- Generate JWT with userId, email, role
- Return: { success: true, user: { id, email, firstName, lastName }, token }
- Handle errors: duplicate email/phone, validation errors

Use try-catch with proper error responses.
Include JSDoc comments.
```

**Testing (Manual):**
| Test | Method | Input | Expected Output |
|------|--------|-------|-----------------|
| Valid registration | POST /api/auth/register | `{"email":"test@example.com","phone":"+1234567890","password":"SecurePass1","firstName":"John","lastName":"Doe","currency":"USD"}` | 201, user object + token |
| Duplicate email | POST /api/auth/register | Same email again | 400, "Email already registered" |
| Duplicate phone | POST /api/auth/register | Same phone again | 400, "Phone already registered" |
| Weak password | POST /api/auth/register | `{"password":"weak"}` | 400, validation errors |

**Example Input:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "currency": "USD"
  }'
```

**Example Output:**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "VIEWER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 1.2 Create Input Validation Middleware
- [ ] Create validation schemas with Zod
- [ ] Implement validation middleware
- [ ] Add custom error messages

**LLM Prompt for Validation:**
```
Create a validation middleware (backend/src/middleware/validate.js) using Zod.

Requirements:
- Create Zod schemas for:
  - registerSchema: email, phone, password, firstName, lastName, currency
  - loginSchema: email, password
  - updateUserSchema: firstName?, lastName?, timezone?, avatar?
- Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Phone validation: E.164 format (+1234567890)
- Create validate(schema) middleware function that:
  - Validates req.body against schema
  - Returns 400 with error details if validation fails
  - Calls next() on success
- Include helpful error messages for each field

Export schemas and validate function.
```

---

### 2. User Login

#### 2.1 Create Login Endpoint
- [ ] Implement login controller
- [ ] Verify password with bcrypt.compare
- [ ] Generate JWT on successful login
- [ ] Track login timestamp

**LLM Prompt for Login Controller:**
```
Create a login function in authController.js.

Requirements:
- Export async function: login(req, res, next)
- Extract from req.body: email, password
- Find user by email in database
- If not found: return 401 "Invalid credentials"
- Compare password with hashed password using bcrypt
- If mismatch: return 401 "Invalid credentials"
- Generate JWT with: userId, email, householdId, role
- Set token expiry from config (default 7 days)
- Return: { success: true, user: { id, email, firstName, lastName, householdId, role }, token }
- Log login event (optional: track failed attempts)

Use consistent error messages to prevent user enumeration.
```

**Testing (Manual):**
| Test | Input | Expected Output |
|------|-------|-----------------|
| Valid login | Correct email + password | 200, user + token |
| Wrong password | Correct email, wrong password | 401, "Invalid credentials" |
| Unknown email | Non-existent email | 401, "Invalid credentials" |
| Missing fields | Empty email or password | 400, validation error |

**Example Input:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Example Output:**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "householdId": null,
    "role": "VIEWER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. JWT Middleware

#### 3.1 Create Authentication Middleware
- [ ] Create JWT verification middleware
- [ ] Attach user to request object
- [ ] Handle expired tokens
- [ ] Handle invalid tokens

**LLM Prompt for Auth Middleware:**
```
Create an authentication middleware (backend/src/middleware/auth.js).

Requirements:
- Export function: authenticate(req, res, next)
- Extract Bearer token from Authorization header
- If no token: return 401 "No token provided"
- Verify token using jsonwebtoken and JWT_SECRET from config
- If invalid: return 401 "Invalid token"
- If expired: return 401 "Token expired"
- Fetch user from database by userId from token
- If user not found: return 401 "User not found"
- Attach user object to req.user
- Attach token to req.token
- Call next()

- Export function: optionalAuth(req, res, next)
- Same as above but doesn't fail if no token
- Sets req.user to null if no valid token

Include proper error handling.
```

---

#### 3.2 Create Role-Based Authorization
- [ ] Create role checking middleware
- [ ] Implement permission checks
- [ ] Create helper for route protection

**LLM Prompt for Role Middleware:**
```
Create a role authorization middleware (backend/src/middleware/authorize.js).

Requirements:
- Export function: authorize(...allowedRoles)
- Returns middleware that:
  - Checks if req.user exists (must be authenticated first)
  - Checks if req.user.role is in allowedRoles array
  - If not authorized: return 403 "Insufficient permissions"
  - Calls next() if authorized

- Export function: requireHousehold
- Middleware that checks if user belongs to a household
- If no household: return 403 "No household assigned"

- Export function: requireHouseholdAccess(paramName = 'householdId')
- Checks if requested householdId matches user's householdId
- Allows if user is admin OR if IDs match

Usage example:
app.post('/invite', authenticate, authorize('ADMIN'), inviteController);
```

---

### 4. Password Security

#### 4.1 Implement Password Reset
- [ ] Create forgot password endpoint
- [ ] Generate reset token
- [ ] Create reset password endpoint
- [ ] Validate reset token

**LLM Prompt for Password Reset:**
```
Add password reset functionality to authController.js.

Requirements:
- Export async function: forgotPassword(req, res)
  - Extract email from req.body
  - Find user by email
  - If not found: return 200 "If email exists, reset link sent" (prevent enumeration)
  - Generate secure reset token (crypto.randomBytes)
  - Set token expiry (1 hour)
  - Save token hash to database (new field: resetToken, resetTokenExpiry)
  - Log that email would be sent (actual email in later phase)
  - Return 200 "If email exists, reset link sent"

- Export async function: resetPassword(req, res)
  - Extract token and newPassword from req.body
  - Find user with matching token that hasn't expired
  - If not found: return 400 "Invalid or expired token"
  - Hash new password
  - Update password in database
  - Clear reset token fields
  - Return 200 "Password reset successful"

Add resetToken and resetTokenExpiry fields to User model if not present.
```

---

### 5. Routes Setup

#### 5.1 Create Auth Routes
- [ ] Set up auth router
- [ ] Connect controllers to routes
- [ ] Add validation middleware

**File: backend/src/routes/auth.js**
```javascript
import { Router } from 'express';
import { register, login, logout, forgotPassword, resetPassword, me } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
```

---

## Testing Checklist

### Manual Testing

```bash
# Test 1: Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","phone":"+1555123456","password":"TestPass1","firstName":"Test","lastName":"User","currency":"USD"}'

# Test 2: Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass1"}'

# Test 3: Access protected route (replace TOKEN)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Test 4: Invalid token
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer invalid-token"
```

### Unit Tests

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Register with valid data | 201, user created | - [ ] Pass |
| Register duplicate email | 400, error message | - [ ] Pass |
| Register duplicate phone | 400, error message | - [ ] Pass |
| Register weak password | 400, validation error | - [ ] Pass |
| Login valid credentials | 200, token returned | - [ ] Pass |
| Login wrong password | 401, "Invalid credentials" | - [ ] Pass |
| Login unknown email | 401, "Invalid credentials" | - [ ] Pass |
| Protected route with token | 200, user data | - [ ] Pass |
| Protected route no token | 401, "No token" | - [ ] Pass |
| Protected route bad token | 401, "Invalid token" | - [ ] Pass |

---

## Files Created in This Phase

```
backend/src/
├── controllers/
│   └── authController.js
├── middleware/
│   ├── auth.js
│   ├── authorize.js
│   └── validate.js
├── routes/
│   └── auth.js
└── utils/
    └── jwt.js
```

---

## Integration with Previous Phase

### Connect to Phase 1

1. **Update server.js** to include auth routes:
```javascript
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);
```

2. **Update Prisma schema** if needed (add resetToken fields)

3. **Run migrations**:
```bash
npx prisma migrate dev --name add-reset-token
```

---

## Completion Criteria

Phase 2 is complete when:

- [ ] User can register with email + phone
- [ ] User can login and receive JWT
- [ ] Protected routes reject invalid tokens
- [ ] Protected routes accept valid tokens
- [ ] Password is properly hashed (not stored plain)
- [ ] Duplicate email/phone rejected
- [ ] All unit tests pass

---

## Next Phase Preview

**Phase 3: Household & Invitation System** will:
- Create households
- Implement invitation via email/phone
- Set up role-based permissions
- Set up polling for data sync

Before moving to Phase 3, ensure all Phase 2 tests pass!
