# HouseHold Budgeting - Submission Explanation

## 1. Project Overview
**HouseHold Budgeting** is an AI-powered financial tracking application designed for multi-user households. Unlike traditional budgeting apps that focus on individuals, this platform enables families, couples, and roommates to track shared expenses with role-based visibility and receive intelligent, personalized financial guidance.

## 2. Problem Statement
Households struggle with collaborative budgeting. Existing apps often lack:
- **Shared Visibility**: Difficult for multiple users (e.g., spouses) to track joint spending.
- **Automated Categorization**: Manual entry is tedious and error-prone.
- **Personalized Advice**: Generic "save more" tips are ineffective.
- **Engagement**: Budgeting feels like a chore rather than a helpful tool.

## 3. The Solution
We have built a web application that leverages **Google Gemini 2.5** to automate and enhance the budgeting process:
- **Multi-User Support**: Create households and invite members with specific roles (Admin, Editor, Viewer).
- **Voice & Natural Language Input**: Log expenses by simply speaking or typing naturally (e.g., *"Spent $87 at Whole Foods"*).
- **AI Agents**:
    - **Categorization Agent**: Automatically classifies transactions as "Need" or "Want" and assigns categories (e.g., Food/Groceries) with high confidence.
    - **Advisor Agent**: Provides on-demand, context-aware savings advice based on actual spending patterns.
    - **Report Agent**: Generates weekly insights and trend analysis.
    - **Chart Agent**: Creates visualization configurations from natural language queries (e.g., *"Show me dining vs groceries"*).

## 4. Technical Architecture
The system is built on a modern, scalable stack:

### Frontend
- **Framework**: React 18 with Vite
- **UI**: Custom CSS/Design System (no heavy UI libraries) for premium aesthetics.
- **Visualization**: Recharts for dynamic data plotting.
- **Voice**: Web Speech API integration.

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM (schema supports Users, Households, Transactions, Budgets).
- **Authentication**: JWT-based secure auth.
- **AI Integration**: Google Gemini API (Flash/Pro calls via `backend/src/agents`).
- **Observability**: **Opik by Comet** is integrated to trace, monitor, and evaluate all LLM interactions (categorization accuracy, advice quality).

## 5. Development Process
The project has been executed in phases:
1.  **Foundation**: Setup of the monorepo structure, database schema (Prisma), and Node.js server.
2.  **Core Features**: Implementation of CRUD operations for Transactions and Households.
3.  **AI Integration**: Development of specialized agents (`categorizationAgent.js`, `advisorAgent.js`, etc.) in the backend.
4.  **UI Refinement**: Creating a responsive, "premium" feel interface with real-time updates.
5.  **Deployment Prep**: Configuration for Netlify (Frontend) and Render (Backend), documented in `netlify_setup.md`.

## 6. Current Status & Verification
- **Implemented**: Core backend architecture, AI agents for categorization and reporting, frontend structure with API integration.
- **In Progress**: Refining the UI for seamless real-time updates and finalizing the deployment pipeline.
- **Documentation**: Comprehensive guides (`Phase guide/*`, `HACKATHON_SUBMISSION.md`, `README.md`) capture the vision and execution steps.


## 7. Roadmap & Planned Improvements
The following features are prioritized for the immediate roadmap:
1.  **Advanced Observability**: Deepen Opik integration with more nuanced tracing and comprehensive testing scenarios.
2. **income and saving**: saving needs to be implemented properly.
2.  **PWA Capabilities**: Convert the application into a Progressive Web App (PWA) for installable, offline-capable mobile access.
3.  **UI/UX Refinement**: Polish the mobile experience to feel native and refined for smartphone users.
4.  **Enhanced AI Reports**: Upgrade the Advisor Agent to provide custom reports that include visualization graphs for deeper analysis.
5.  **Robust Verification**: Implement multi-factor authentication with email and phone number verification.
6.  **Extended Payment Tracking**: Add modules for tracking domestic help (maid) payments (including holidays), bill splitting among friends, and loan tracking.
7.  **User Onboarding**: Create a comprehensive guide/walkthrough on how to effectively use the platform.
8.  **Quality Assurance**: Conduct final rigorous testing across all modules.

## 8. Future Scope
- **Bank Integration**: Plaid support for auto-sync validation.
- **Mobile Native**: React Native adaptation.
- **Advanced Analytics**: Predictive forecasting for household savings.
