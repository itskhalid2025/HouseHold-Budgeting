# Phase 4: Transaction & Income Tracking

> **Duration**: Days 8-10  
> **Prerequisites**: Phase 3 completed (households working)  
> **Goal**: Implement transaction and income CRUD with voice/text input, loans, and bill splitting  
> **Status**: ❌ **NOT STARTED** (0%)

---

## 📋 websitelook.md Alignment

This phase implements **Screens 3 and 4** from `websitelook.md`.

| Page # | Page Name | Status | Description |
|--------|-----------|--------|-------------|
| 3 | Transactions | ❌ | Expense tracking with filters |
| 4 | Income | ❌ | Income sources and tracking |

### Screen 3 Elements (Transactions):
| Element | Description | Status |
|---------|-------------|--------|
| 3.1 | Filter Bar | ❌ | Date range, category, type filters |
| 3.2 | Transaction List | ❌ | Cards with amount, category, date |
| 3.3 | AI Categorization Badge | ❌ | Accept/Edit buttons for AI suggestions |
| 3.4 | Add Transaction Modal | ❌ | Form with all fields |
| 3.5 | Floating Add Button | ❌ | FAB for quick add |
| 3.6 | Voice Input Modal | ❌ | Microphone button, listening state |

### Screen 4 Elements (Income):
| Element | Description | Status |
|---------|-------------|--------|
| 4.1 | Income Summary Card | ❌ | Total monthly income |
| 4.2 | Income Sources List | ❌ | Salary, freelance, etc. |
| 4.3 | Add Income Modal | ❌ | Frequency options |

### Image States (9 total):
**Screen 3**: Empty, List View, Filter Applied, Add Modal, Voice Listening, Voice Ready  
**Screen 4**: Empty, Income List, Add Income Modal

### Database Tables Used:
- Transaction (Table #5)
- Income (Table #6)
- Loan (Table #10)
- BillSplit (Table #11)

---

## Phase Overview

By the end of this phase, you will have:
- Transaction CRUD operations
- Income tracking with frequency support
- Voice input via Web Speech API
- Text input parsing
- Opik tracing for all inputs
- Polling-based updates for new transactions
- **Loans & Debts Tracking** - Lend/borrow money with repayment tracking (NEW)
- **Bill Splitting** - Split expenses with friends, track who paid back (NEW)


---

## Task Checklist

### 1. Transaction CRUD

#### 1.1 Create Transaction Endpoints
- [ ] Create transaction controller
- [ ] Implement add transaction (with AI categorization trigger)
- [ ] Implement list transactions (with filters)
- [ ] Implement update transaction
- [ ] Implement delete transaction
- [ ] Add lastModified timestamp for polling

**LLM Prompt for Transaction Controller:**
```
Create a transaction controller (backend/src/controllers/transactionController.js).

Requirements:
- addTransaction(req, res): 
  - Extract: description, amount, date, merchant (optional), category (optional)
  - If no category: trigger AI categorization (placeholder for Phase 5)
  - Save to database with householdId and userId from req.user
  - Update household's lastModifiedAt timestamp (for polling)
  - Return transaction with Opik trace ID

- listTransactions(req, res):
  - Filter by: dateRange, category, type, userId (who logged it)
  - Pagination: page, limit (default 20)
  - Sort by date descending
  - Include householdLastModified for polling
  - Return transactions with total count

- updateTransaction(req, res):
  - Only owner or ADMIN can update
  - Track if user overrode AI categorization
  - Update household's lastModifiedAt

- deleteTransaction(req, res):
  - Only owner or ADMIN can delete
  - Soft delete (set deletedAt) or hard delete
  - Update household's lastModifiedAt
```

**Testing (Manual):**
| Test | Method | Expected Output |
|------|--------|-----------------|
| Add transaction | POST /api/transactions | 201, transaction created |
| List transactions | GET /api/transactions | 200, paginated list |
| Update (owner) | PUT /api/transactions/:id | 200, updated |
| Delete (admin) | DELETE /api/transactions/:id | 200, deleted |

**Example Input:**
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description":"Whole Foods groceries","amount":87.50,"date":"2024-01-16"}'
```

**Example Output:**
```json
{
  "success": true,
  "transaction": {
    "id": "txn_123",
    "description": "Whole Foods groceries",
    "amount": 87.50,
    "merchant": "Whole Foods",
    "category": "Food",
    "subcategory": "Groceries",
    "type": "NEED",
    "date": "2024-01-16",
    "aiCategorized": true,
    "confidence": 0.95
  },
  "householdLastModified": "2024-01-16T10:30:00Z"
}
```

---

### 2. Income Tracking

#### 2.1 Create Income Endpoints
- [ ] Create income controller
- [ ] Add income entry (one-time or recurring)
- [ ] List income sources
- [ ] Calculate monthly total

**LLM Prompt:**
```
Create income controller with:
- addIncome: Create income source with frequency (ONE_TIME, WEEKLY, BIWEEKLY, MONTHLY, YEARLY)
- listIncome: Get all active income sources
- getMonthlyTotal: Calculate expected income for a month based on frequencies
- updateIncome/deleteIncome: Standard CRUD
```

---

### 3. Voice Input (Frontend)

#### 3.1 Implement Web Speech API
- [ ] Create voice input hook
- [ ] Handle transcription
- [ ] Send to parsing endpoint

**LLM Prompt for Voice Hook:**
```
Create a React hook (frontend/src/hooks/useVoiceInput.js) for voice transcription.

Requirements:
- Use Web Speech API (SpeechRecognition)
- Return: { isListening, transcript, startListening, stopListening, error }
- Handle browser compatibility
- Continuous mode for longer inputs
- Language: en-US
```

---

### 4. Polling Integration

#### 4.1 Update Polling for Transactions
- [ ] Extend usePolling to check for new transactions
- [ ] Show notification when new data available
- [ ] Manual refresh button

**LLM Prompt:**
```
Extend the usePolling hook to support transaction updates:
- Track lastFetchedAt timestamp
- Compare with server's householdLastModified
- If server is newer: show "New transactions available" toast
- Allow manual refresh via refetch()
```

---

### 5. Opik Integration

#### 5.1 Trace All Input Processing
- [ ] Wrap transaction creation with Opik trace
- [ ] Log input text and parsed output
- [ ] Track latency

**Opik Testing:**
1. Add transaction via API
2. Check Opik dashboard for trace
3. Verify input/output logged

---

## Integration with Previous Phases

1. **Use Polling** from Phase 3 for sync updates
2. **Use auth middleware** from Phase 2
3. **Use Prisma** from Phase 1

---

## Completion Criteria

- [ ] Transactions can be created, listed, updated, deleted
- [ ] Income sources tracked with frequency
- [ ] Voice input works in browser
- [ ] Opik traces visible for all operations
- [ ] Polling detects new transactions

---

## Next Phase Preview

**Phase 5: AI Categorization Agent** will add smart categorization using Gemini.
