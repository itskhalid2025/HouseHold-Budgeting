# Phase 1: Project Setup & Core Infrastructure

> **Duration**: Days 1-3  
> **Prerequisites**: Node.js 18+, npm, PostgreSQL installed  
> **Goal**: Set up the complete development environment with frontend, backend, database, and AI integrations

---

## Phase Overview

This phase establishes the foundation for the entire application. By the end, you will have:
- A working React frontend with Vite
- A Node.js/Express backend server
- PostgreSQL database with Prisma ORM
- Gemini API integration for AI features
- Opik integration for LLM observability
- Environment configuration management

---

## Task Checklist

### 1. Project Structure Setup

#### 1.1 Initialize Monorepo Structure
- [ ] Create root project directory
- [ ] Initialize git repository
- [ ] Create frontend and backend folders

**Detailed Steps:**
```bash
# Create project root
mkdir household-budgeting
cd household-budgeting

# Initialize git
git init

# Create folder structure
mkdir -p frontend/src/{components,pages,hooks,services,utils}
mkdir -p backend/src/{routes,controllers,services,agents,middleware,utils}
mkdir -p backend/prisma
mkdir -p shared/types

# Create essential files
touch frontend/package.json
touch backend/package.json
touch .gitignore
touch .env.example
touch docker-compose.yml
touch README.md
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Folder structure exists | Run `ls -la` in project root | See frontend/, backend/, shared/ folders |
| Git initialized | Run `git status` | Shows "On branch main" |

**Example Output:**
```
household-budgeting/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       └── utils/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── agents/
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/
├── shared/
│   └── types/
├── .gitignore
├── .env.example
└── README.md
```

---

#### 1.2 Initialize Frontend (React + Vite)
- [ ] Create Vite React project
- [ ] Install frontend dependencies
- [ ] Configure Vite for development
- [ ] Create basic App component

**Detailed Steps:**
```bash
cd frontend

# Initialize Vite React project
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom@6 recharts axios

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind (optional)
npx tailwindcss init -p
```

**LLM Prompt for Component Generation:**
```
Create a basic React App.jsx component for a household budgeting application called "HomeHarmony Budget". 

Requirements:
- Use React Router v6 for routing
- Include placeholder routes for: Dashboard, Transactions, Reports, Settings
- Add a simple navigation header with app name and nav links
- Use modern React functional components with hooks
- Include a footer with copyright text
- Export the App component as default

The component should be clean and minimal - we'll add features in later phases.
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Frontend starts | Run `npm run dev` | Vite dev server starts on http://localhost:5173 |
| React app loads | Open browser to localhost:5173 | See "HomeHarmony Budget" header |
| Routes work | Click navigation links | URL changes, no errors in console |

**Example Input:**
```bash
npm run dev
```

**Example Output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

---

#### 1.3 Initialize Backend (Node.js + Express)
- [ ] Create Node.js project with Express
- [ ] Install backend dependencies
- [ ] Create basic server file
- [ ] Set up middleware (CORS, JSON parsing)

**Detailed Steps:**
```bash
cd backend

# Initialize package.json
npm init -y

# Install production dependencies
npm install express cors dotenv helmet morgan jsonwebtoken bcryptjs uuid

# Install Prisma
npm install prisma @prisma/client

# Install AI/Observability
npm install @google/generative-ai opik

# Install dev dependencies
npm install -D nodemon

# Initialize Prisma
npx prisma init
```

**LLM Prompt for Server Generation:**
```
Create an Express.js server file (server.js) for a household budgeting backend API.

Requirements:
- Import and configure: express, cors, helmet, morgan, dotenv
- Load environment variables from .env
- Configure middleware: JSON parsing, CORS (allow localhost:5173), helmet for security, morgan for logging
- Create a health check route at GET /api/health that returns { status: 'ok', timestamp: Date.now() }
- Create placeholder route imports for: auth, users, households, transactions, income, reports, ai, invitations
- Start server on PORT from env (default 3001)
- Add graceful shutdown handling
- Export the app (for testing)

Use ES6 modules (import/export) and include proper error handling middleware.
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Backend starts | Run `npm run dev` | Server starts on http://localhost:3001 |
| Health check works | GET http://localhost:3001/api/health | Returns `{"status":"ok","timestamp":...}` |
| CORS configured | Request from localhost:5173 | No CORS errors |

**Example Input:**
```bash
curl http://localhost:3001/api/health
```

**Example Output:**
```json
{
  "status": "ok",
  "timestamp": 1705420800000,
  "version": "1.0.0"
}
```

---

### 2. Database Setup (PostgreSQL + Prisma)

#### 2.1 Configure PostgreSQL Database
- [ ] Create PostgreSQL database
- [ ] Configure connection string in .env
- [ ] Test database connection

**Detailed Steps:**
```bash
# Connect to PostgreSQL (adjust for your system)
psql -U postgres

# Create database
CREATE DATABASE household_budget;

# Create user (optional, for security)
CREATE USER budget_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE household_budget TO budget_user;

# Exit
\q
```

**Environment Configuration (.env):**
```env
# Database
DATABASE_URL="postgresql://budget_user:your_secure_password@localhost:5432/household_budget"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Opik
OPIK_API_KEY=your-opik-api-key
OPIK_PROJECT_NAME=household-budget
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Database exists | `psql -U postgres -c "\l"` | See "household_budget" in list |
| Connection works | `npx prisma db pull` | No connection errors |

---

#### 2.2 Create Prisma Schema
- [ ] Define User model
- [ ] Define Household model
- [ ] Define Transaction model
- [ ] Define Income model
- [ ] Define Invitation model
- [ ] Define Goal model

**LLM Prompt for Schema Generation:**
```
Create a Prisma schema (schema.prisma) for a household budgeting application.

Models needed:
1. User
   - id (UUID, primary key, default auto-generated)
   - email (unique, required)
   - phone (unique, required)
   - passwordHash (required)
   - firstName, lastName (required)
   - currency (default 'USD')
   - avatarUrl (optional)
   - timezone (default 'UTC')
   - notificationPreferences (JSON)
   - householdId (foreign key, optional)
   - role (enum: ADMIN, EDITOR, VIEWER, default VIEWER)
   - emailVerified, phoneVerified (boolean, default false)
   - createdAt, updatedAt (timestamps)

2. Household
   - id (UUID)
   - name (required)
   - inviteCode (unique)
   - createdAt
   - adminId (foreign key to User)

3. Transaction
   - id (UUID)
   - householdId (foreign key)
   - userId (foreign key - who logged it)
   - amount (Decimal)
   - currency
   - merchant (optional)
   - description
   - category, subcategory
   - type (enum: NEED, WANT)
   - date
   - aiCategorized (boolean)
   - confidence (Float, optional)
   - createdAt, updatedAt

4. Income
   - id (UUID)
   - householdId, userId (foreign keys)
   - amount, currency
   - source (description)
   - type (enum: PRIMARY, VARIABLE, PASSIVE)
   - frequency (enum: ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY)
   - startDate, endDate (optional)
   - isActive (boolean)
   - createdAt, updatedAt

5. Invitation
   - id (UUID)
   - householdId (foreign key)
   - invitedById (foreign key to User)
   - recipientEmail (optional)
   - recipientPhone (optional)
   - role (enum)
   - token (unique)
   - status (enum: PENDING, ACCEPTED, EXPIRED, CANCELLED)
   - expiresAt
   - acceptedAt (optional)
   - createdAt

6. Goal
   - id (UUID)
   - householdId (foreign key)
   - name
   - type (enum: EMERGENCY_FUND, SINKING_FUND, DEBT_PAYOFF, LONG_TERM)
   - targetAmount
   - currentAmount (default 0)
   - deadline (optional)
   - isActive (boolean)
   - createdAt, updatedAt

Include appropriate relations, indexes, and enums. Use PostgreSQL as the provider.
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Schema valid | `npx prisma validate` | "Prisma schema is valid" |
| Migration runs | `npx prisma migrate dev --name init` | Tables created successfully |
| Prisma Studio works | `npx prisma studio` | Opens browser with data viewer |

**Example Input:**
```bash
npx prisma migrate dev --name init
```

**Example Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "household_budget"

Applying migration `20240116_init`

The following migration(s) have been created and applied:
migrations/
  └─ 20240116_init/
    └─ migration.sql

Your database is now in sync with your schema.
✔ Generated Prisma Client
```

---

### 3. Gemini API Integration

#### 3.1 Set Up Gemini Service
- [ ] Create Gemini API wrapper service
- [ ] Implement retry logic with exponential backoff
- [ ] Add error handling for rate limits
- [ ] Create test function for API connectivity

**LLM Prompt for Gemini Service:**
```
Create a Gemini API service (backend/src/services/geminiService.js) for a household budgeting app.

Requirements:
- Import GoogleGenerativeAI from @google/generative-ai
- Load API key from environment variables
- Initialize Gemini 1.5 Flash model (free tier)
- Create async function: generateContent(prompt, options = {})
  - Options: temperature (default 0.7), maxTokens (default 1024)
  - Include retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
  - Handle errors: RATE_LIMIT (wait and retry), INVALID_ARGUMENT (throw user-friendly error)
  - Return parsed response text
- Create async function: generateJSON(prompt, schema = null)
  - Same as above but parse response as JSON
  - Validate against schema if provided
  - Handle JSON parse errors
- Create test function: testConnection()
  - Send simple prompt "Hello"
  - Return { success: true/false, latency: ms, error?: message }
- Export all functions

Include proper JSDoc comments.
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| API key valid | Run test script | `{ success: true, latency: ~500ms }` |
| Rate limit handled | Spam 20 requests | Retries work, no crashes |
| JSON parsing works | Request JSON output | Valid JSON returned |

**Example Input (Test Script):**
```javascript
// test-gemini.js
import { testConnection, generateJSON } from './src/services/geminiService.js';

async function test() {
  console.log('Testing Gemini connection...');
  const result = await testConnection();
  console.log('Connection test:', result);
  
  console.log('\nTesting JSON generation...');
  const json = await generateJSON(
    'Categorize this expense: "Starbucks $5.50". Return JSON with: type (Need/Want), category, subcategory, confidence (0-1)'
  );
  console.log('JSON result:', json);
}

test();
```

**Example Output:**
```
Testing Gemini connection...
Connection test: { success: true, latency: 456 }

Testing JSON generation...
JSON result: {
  type: "Want",
  category: "Dining",
  subcategory: "Coffee",
  confidence: 0.95
}
```

---

### 4. Opik Integration

#### 4.1 Set Up Opik Tracing
- [ ] Create Opik service wrapper
- [ ] Implement trace decorator/wrapper
- [ ] Add span support for multi-step operations
- [ ] Test trace visibility in Opik dashboard

**LLM Prompt for Opik Service:**
```
Create an Opik tracing service (backend/src/services/opikService.js) for LLM observability.

Requirements:
- Import opik SDK
- Initialize with API key and project name from environment
- Create function: startTrace(name, metadata = {})
  - Returns trace object with methods: addSpan, end, logError
  - Track: startTime, input, output, status
- Create function: wrapGeminiCall(geminiFunction, traceName)
  - Returns wrapped async function that:
    - Starts a trace before calling Gemini
    - Logs input prompt
    - Measures latency
    - Logs output and token usage
    - Ends trace on success
    - Logs error on failure
    - Returns original result
- Create function: logEvaluation(traceName, input, output, expected, score)
  - For logging evaluation results
- Create function: getTraceUrl(traceId)
  - Returns link to trace in Opik dashboard
- Create function: testConnection()
  - Verify Opik API is reachable
  - Return { success: boolean, projectName: string }

If Opik is not configured or unavailable, all functions should gracefully fallback to console logging with a warning.

Include proper error handling and JSDoc comments.
```

**Testing (Opik Dashboard):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Opik configured | Run `testConnection()` | `{ success: true, projectName: 'household-budget' }` |
| Traces appear | Make AI call, check dashboard | See trace with input/output |
| Latency tracked | Check trace details | See latency in ms |
| Errors logged | Force an error | See error in Opik |

**Opik Testing Steps:**
1. Go to https://www.comet.com/opik
2. Log in to your account
3. Navigate to your project
4. Look for traces after running test script

**Example Input:**
```javascript
import { wrapGeminiCall, testConnection } from './src/services/opikService.js';
import { generateContent } from './src/services/geminiService.js';

// Test Opik connection
const opikStatus = await testConnection();
console.log('Opik status:', opikStatus);

// Wrapped Gemini call with tracing
const trackedGenerate = wrapGeminiCall(generateContent, 'test_categorization');
const result = await trackedGenerate('Categorize: Starbucks $5.50');
console.log('Result:', result);
console.log('Check Opik dashboard for trace!');
```

**Example Output:**
```
Opik status: { success: true, projectName: 'household-budget' }
Result: { type: "Want", category: "Dining", ... }
Check Opik dashboard for trace!

[Opik Dashboard shows:]
- Trace: test_categorization
- Input: "Categorize: Starbucks $5.50"
- Output: { type: "Want", ... }
- Latency: 523ms
- Tokens: 45 input, 32 output
- Status: Success
```

---

### 5. Environment Configuration

#### 5.1 Create Configuration Management
- [ ] Create .env.example with all variables
- [ ] Create config loader with validation
- [ ] Add environment-specific configs (dev, prod)
- [ ] Document all configuration options

**LLM Prompt for Config Service:**
```
Create a configuration service (backend/src/config/index.js) for a Node.js backend.

Requirements:
- Load environment variables using dotenv
- Validate required variables on startup
- Create config object with sections:
  - server: { port, nodeEnv, apiVersion }
  - database: { url, poolSize }
  - auth: { jwtSecret, jwtExpiresIn, bcryptRounds }
  - gemini: { apiKey, model, maxTokens, temperature }
  - opik: { apiKey, projectName, enabled }
  - cors: { origin, credentials }
- Throw descriptive errors for missing required variables
- Log config summary on startup (without secrets)
- Export frozen config object

List of required variables:
- DATABASE_URL
- JWT_SECRET
- GEMINI_API_KEY

List of optional variables (with defaults):
- PORT (3001)
- NODE_ENV (development)
- JWT_EXPIRES_IN (7d)
- OPIK_API_KEY (empty = disabled)
- OPIK_PROJECT_NAME (household-budget)
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Config loads | Import config, log it | See all sections populated |
| Missing var error | Remove DATABASE_URL | Error: "Missing required: DATABASE_URL" |
| Defaults work | Remove PORT | Defaults to 3001 |

---

## Manual Testing Checklist

### Full Phase 1 Verification

Run these tests after completing all tasks:

```bash
# Test 1: Frontend starts
cd frontend && npm run dev
# Expected: Vite dev server on http://localhost:5173

# Test 2: Backend starts
cd backend && npm run dev
# Expected: Express server on http://localhost:3001

# Test 3: Database connection
cd backend && npx prisma studio
# Expected: Opens Prisma Studio showing tables

# Test 4: Health check
curl http://localhost:3001/api/health
# Expected: {"status":"ok",...}

# Test 5: Gemini API
node backend/test-gemini.js
# Expected: Successfully generates categorization

# Test 6: Opik tracing
node backend/test-opik.js
# Expected: Trace appears in Opik dashboard
```

### Verification Checklist

| Component | Test | Status |
|-----------|------|--------|
| Frontend | Vite dev server starts | - [ ] Pass |
| Frontend | React app renders | - [ ] Pass |
| Frontend | Routes work | - [ ] Pass |
| Backend | Express server starts | - [ ] Pass |
| Backend | Health endpoint works | - [ ] Pass |
| Database | PostgreSQL connected | - [ ] Pass |
| Database | Prisma migrations run | - [ ] Pass |
| Database | Prisma Studio works | - [ ] Pass |
| Gemini | API connection works | - [ ] Pass |
| Gemini | JSON generation works | - [ ] Pass |
| Opik | Connection test passes | - [ ] Pass |
| Opik | Traces appear in dashboard | - [ ] Pass |
| Config | All env vars loaded | - [ ] Pass |

---

## Error Handling

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` on DB | PostgreSQL not running | Start PostgreSQL service |
| `Invalid API key` | Wrong Gemini key | Check key in .env |
| Prisma migration fails | Schema syntax error | Run `npx prisma validate` |
| CORS error in browser | Origin not allowed | Add localhost:5173 to CORS |
| Opik traces not appearing | Wrong API key | Verify key and project name |

---

## Files Created in This Phase

```
household-budgeting/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── index.js
│   │   └── services/
│   │       ├── geminiService.js
│   │       └── opikService.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
├── shared/
│   └── types/
├── .gitignore
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Completion Criteria

Phase 1 is complete when:

- [ ] Frontend dev server runs without errors
- [ ] Backend server starts and responds to health check
- [ ] Database tables created via Prisma migration
- [ ] Gemini API responds to test prompts
- [ ] Opik traces appear in dashboard
- [ ] All environment variables configured
- [ ] Git repository initialized with .gitignore

---

## Next Phase Preview

**Phase 2: Authentication & User Management** will:
- Build user registration with email + phone validation
- Implement JWT-based authentication
- Create login/logout flows
- Set up password hashing with bcrypt
- Connect auth routes to the database

Before moving to Phase 2, ensure all Phase 1 tests pass!
