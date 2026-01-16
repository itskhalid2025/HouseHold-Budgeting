# HomeHarmony Budget

> **AI-Powered Financial Clarity for the Whole Household**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-red.svg)](https://ai.google.dev/)

---

## 📋 Overview

HomeHarmony Budget is a collaborative household financial tracking application that combines multi-user access with advanced Large Language Model (LLM) technology. It actively analyzes spending habits to generate dynamic visual reports and offers personalized, conversational guidance on saving money.

### Key Features

- 🏠 **Multi-User Households** - Invite family members via email or phone
- 🎤 **Voice & Text Input** - Log expenses naturally using speech or text
- 🤖 **AI Smart Categorization** - Automatic Needs vs Wants classification
- 📊 **Dynamic Reports** - Weekly and monthly pulse reports
- 💡 **Savings Guidance** - Personalized AI recommendations
- 📈 **Natural Language Charts** - "Show me dining vs groceries last 3 months"
- 🔍 **Full Observability** - Opik integration for LLM tracing and evaluation

---

## 🏗️ Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Recharts (visualization)
- Web Speech API (voice input)

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Polling (auto-refresh sync)

### AI & Observability
- Google Gemini API (Free Tier)
- Opik by Comet (LLM Observability)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Gemini API Key ([Get one free](https://ai.google.dev/))
- Opik API Key ([Get one free](https://www.comet.com/opik))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/household-budgeting.git
cd household-budgeting

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npx prisma migrate dev --name init
npx prisma generate

# Start development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Environment Variables

Create a `.env` file in the backend folder:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/household_budget"

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Opik Observability
OPIK_API_KEY=your-opik-api-key
OPIK_PROJECT_NAME=household-budget
```

---

## 📁 Project Structure

```
household-budgeting/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client services
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Request/response logic
│   │   ├── services/        # Business logic
│   │   ├── agents/          # AI agent implementations
│   │   ├── middleware/      # Auth, validation, error handling
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema and migrations
│   └── package.json
│
├── shared/                   # Shared types and utilities
├── docs/                     # Documentation
│   ├── phase1_guide.md      # Phase 1 implementation guide
│   └── ...
│
└── README.md
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

### Opik Evaluations

```bash
# Run AI evaluation suite
cd backend
npm run eval

# View results in Opik dashboard
# https://www.comet.com/opik
```

---

## 📊 AI Features

### Transaction Categorization

```javascript
// Input
"spent 45.50 at Whole Foods yesterday"

// AI Output
{
  "amount": 45.50,
  "merchant": "Whole Foods",
  "category": "Food",
  "subcategory": "Groceries",
  "type": "Need",
  "confidence": 0.95
}
```

### Natural Language Charts

```javascript
// Input
"Show me dining out vs groceries for the last 3 months"

// AI generates chart specification and renders
// Bar chart comparing two categories over time
```

### Weekly Reports

```javascript
// Auto-generated every Sunday
{
  "highlight": "Great week! You stayed within budget at 78% used.",
  "trend": "Dining out decreased 15% compared to last week.",
  "recommendation": "Moving $50 less to dining could fund your vacation goal by March."
}
```

---

## 🔒 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |

### Households
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/households` | Create household | ✅ |
| GET | `/api/households/:id` | Get household | ✅ Member |
| POST | `/api/invitations` | Send invite | ✅ Admin |

### Transactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transactions` | Add transaction | ✅ Member |
| GET | `/api/transactions` | List transactions | ✅ Member |
| PUT | `/api/transactions/:id` | Update transaction | ✅ Owner |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/categorize` | Categorize transaction | ✅ |
| POST | `/api/ai/advice` | Get savings advice | ✅ |
| POST | `/api/ai/chart` | Generate chart | ✅ |

---

## 🎯 Implementation Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Project Setup & Core Infrastructure | 🔄 In Progress |
| Phase 2 | Authentication & User Management | ⏳ Pending |
| Phase 3 | Household & Invitation System | ⏳ Pending |
| Phase 4 | Transaction & Income Tracking | ⏳ Pending |
| Phase 5 | AI Categorization Agent | ⏳ Pending |
| Phase 6 | AI Advisory & Insights Agent | ⏳ Pending |
| Phase 7 | Reporting & Visualization | ⏳ Pending |
| Phase 8 | Opik Integration & Evaluation | ⏳ Pending |
| Phase 9 | Testing & Polish | ⏳ Pending |
| Phase 10 | Deployment & Hosting | ⏳ Pending |

See individual `phaseX_guide.md` files for detailed implementation instructions.

---

## 📈 Opik Integration

This project showcases comprehensive LLM observability using Opik:

- **Tracing**: Every AI call logged with input/output
- **Evaluation**: LLM-as-judge scoring for advice quality
- **Experiments**: A/B testing for prompt optimization
- **Dashboards**: Real-time metrics visualization

### Key Metrics Tracked
- Categorization accuracy (target: 90%+)
- Advice actionability score (target: 4.0/5.0)
- Response latency (target: <2s)
- Token usage per request

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the AI capabilities
- [Opik by Comet](https://www.comet.com/opik) for LLM observability
- Built for the Comet Opik Hackathon 2024

---

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/household-budgeting](https://github.com/yourusername/household-budgeting)
