# Phase 5: AI Categorization Agent

> **Duration**: Days 11-13  
> **Prerequisites**: Phase 4 completed (transactions working)  
> **Goal**: Implement smart AI categorization with Opik evaluation and advanced transaction detection  
> **Status**: ✅ **COMPLETED** (100%)
> **Completion Date**: January 23, 2026

---

## 📋 websitelook.md Alignment

This phase implements AI features visible in **Element 3.3** from `websitelook.md`.

| websitelook.md Element | Description | Status |
|------------------------|-------------|--------|
| 3.3 AI Categorization Badge | Shows AI suggestion with Accept/Edit | ❌ |

### AI Features This Phase Implements:
| Feature | User-Facing Element | Status |
|---------|---------------------|--------|
| Auto-categorization | Badge shows category guess | ❌ |
| Confidence scoring | Icon shows AI confidence level | ❌ |
| Accept suggestion | "Accept" button on transaction | ❌ |
| Override suggestion | "Edit" button opens category picker | ❌ |
| User correction learning | Stored in UserCategoryOverride table | ❌ |

### Backend Components:
- [ ] `agents/categorizationAgent.js` - Gemini-powered classifier
- [ ] `services/geminiService.js` - API wrapper
- [ ] Golden dataset (200 samples)
- [ ] Opik evaluation pipeline

### Database Tables Used:
- Category (Table #7)
- UserCategoryOverride (Table #13)

---

## Phase Overview

By the end of this phase, you will have:
- AI-powered transaction categorization
- Needs vs Wants classification
- Golden dataset for evaluation (200 samples)
- Opik evaluation pipeline
- User correction feedback loop
- **Loan Detection** - AI detects "gave loan to John" and creates Loan record (NEW)
- **Split Detection** - AI detects "restaurant with friends" and creates SplitExpense (NEW)
- **Recurring Detection** - AI suggests linking to existing recurring expenses (NEW)


---

## Task Checklist

### 1. Unified Smart Router & Categorization Agent

#### 1.1 Create Smart Entry Endpoint
- [ ] `POST /api/smart/process`
- [ ] Accepts: `{ text: "transcript or text input" }`
- [ ] Returns: `{ action: "CREATED", type: "INCOME|EXPENSE|SAVINGS", data: { ... } }`

#### 1.2 Implement Categorization Logic (Gemini)
- [ ] Classify intent: INCOME vs EXPENSE (NEED/WANT) vs SAVINGS
- [ ] Map to specific categories from User Image:
    - **INCOME**: Primary, Variable, Passive
    - **NEEDS**: Housing, Utilities, Food, Transportation, Healthcare, Childcare, Debt
    - **WANTS**: Dining & Entertainment, Shopping, Travel, Gifts
    - **SAVINGS**: Emergency Fund, Long-Term, Sinking Funds
- [ ] Extract entities: Amount, Source/Merchant, Description, Date (default to now if missing)

#### 1.3 Routing Logic
- [ ] If **INCOME** -> Create `Income` record
- [ ] If **EXPENSE** (Need/Want) -> Create `Transaction` record
- [ ] If **SAVINGS** -> Create `Goal` contribution (or generic transfer transaction if goal doesn't exist? For Phase 5, maybe just a Transaction with type SAVINGS or separate logic. *Correction*: Database has `CategoryType.SAVINGS` but `Transaction` model only has `NEED/WANT`. We might need to map Savings to a Transfer or update TransactionType enum. **Decision**: For now, map simple "Saved" to `Goal` deposit if possible, or simple Transaction if not linked to a specific goal. *Actually, user said "store them in backend... make appropriate table".* The schema has `Goal` and `Transaction`. I will try to map Savings to `Transaction` with a new Type if possible, OR strictly use `Goal`. Given the image shows "Savings" as a parallel type to "Needs/Wants", I should probably add `SAVINGS` to `TransactionType` enum to allow simple tracking without complex Goal logic, OR create a new `SavingsTransaction` model. 
*Simpler approach*: Add `SAVINGS` to `TransactionType` enum in Prisma to support the 4-quadrant model directly in Transactions for simple tracking, whilst keeping Goals for targets. 

**Wait**, the User said "make a appropriate table". Schema already has `Transaction`, `Income`, `Goal`. 
Let's stick to:
- Income -> `Income` table
- Expense (Need/Want) -> `Transaction` table
- Savings -> `Goal` table (add to currentAmount) OR `Transaction` (if just tracking outflow to savings).
*Refined Decision*: To strictly follow the image "Type" column, I will modify `TransactionType` to include `SAVINGS` (if it's just an expense that goes to savings) AND/OR ensure the router puts it in `Goal`. 
*Actually*, the image implies a unified view. I will implement the router to put:
- Income -> `Income` table
- Need/Want -> `Transaction` table
- Savings -> `Transaction` table (Type=SAVINGS) *or* `Goal` update. 
*Let's check Schema again*. `TransactionType` is `NEED, WANT`. I should add `SAVINGS` to `TransactionType` to align with the image's "Type" column. This allows unified querying of all "Outflows" (Needs, Wants, Savings contributions). income is "Inflow".

**Updated Plan**:
1. Update `TransactionType` enum to include `SAVINGS`.
2. Categorization Agent maps to one of the 4 quadrants.


**LLM Prompt for Categorization Agent:**
```
Create a categorization agent (backend/src/agents/categorizationAgent.js).

Requirements:
- categorizeTransaction(transaction):
  - Use Gemini to classify transaction
  - Return: { category, subcategory, type (NEED/WANT), confidence, reasoning }
  
- Prompt template:
  "You are a financial categorization expert. Classify this transaction:
   Merchant: {merchant}
   Amount: ${amount}
   Description: {description}
   
   Categories:
   NEEDS: Housing, Utilities, Food, Transportation, Healthcare, Childcare, Debt
   WANTS: Dining, Entertainment, Shopping, Travel, Gifts
   
   Return JSON: { type, category, subcategory, confidence, reasoning }"

- Use smart context fetching (only recent similar transactions)
- Wrap with Opik tracing
- Handle JSON parsing errors
```

**Testing (Opik):**
| Test | Metric | Target |
|------|--------|--------|
| Categorization accuracy | category_match | 90%+ |
| Type accuracy | type_match (Need/Want) | 95%+ |
| Latency | response_time | <2s |

---

### 2. Golden Dataset

#### 2.1 Create Evaluation Dataset
- [ ] Create 200 labeled transactions
- [ ] Cover all categories
- [ ] Include edge cases

**Dataset Format (evaluation/datasets/categorization.json):**
```json
[
  {
    "input": { "merchant": "Whole Foods", "amount": 87.50, "description": "groceries" },
    "expected": { "category": "Food", "subcategory": "Groceries", "type": "NEED" }
  },
  {
    "input": { "merchant": "Netflix", "amount": 15.99, "description": "subscription" },
    "expected": { "category": "Entertainment", "subcategory": "Streaming", "type": "WANT" }
  }
]
```

---

### 3. Opik Evaluation Pipeline

#### 3.1 Set Up Automated Evaluation
- [ ] Create evaluation runner
- [ ] Define accuracy metrics
- [ ] Run on golden dataset
- [ ] Compare prompt versions

**LLM Prompt for Evaluation:**
```
Create an evaluation runner (backend/src/evaluation/runCategorization.js).

Requirements:
- Load golden dataset
- For each sample: call categorization agent
- Score: category_match, type_match, subcategory_match
- Log results to Opik
- Calculate aggregate metrics
- Return summary report
```

**Opik Testing Steps:**
1. Run: `npm run eval:categorization`
2. Check Opik dashboard
3. View accuracy metrics
4. Compare to baseline

---

### 4. User Correction Feedback

#### 4.1 Implement Correction Loop
- [ ] Allow users to override categories
- [ ] Log corrections to Opik
- [ ] Flag for future training

---

## Integration with Previous Phases

1. **Call categorization** when transaction added (Phase 4)
2. **Use Gemini service** from Phase 1
3. **Use Opik tracing** from Phase 1

---

## Completion Criteria

- [ ] Categorization agent working (90%+ accuracy)
- [ ] Golden dataset complete (200 samples)
- [ ] Opik evaluation pipeline running
- [ ] User corrections logged
- [ ] Batch categorization optimized

---

## Next Phase Preview

**Phase 6: AI Advisory & Insights Agent** will add savings recommendations and report generation.
