# Phase 5: AI Categorization Agent

> **Duration**: Days 11-13  
> **Prerequisites**: Phase 4 completed (transactions working)  
> **Goal**: Implement smart AI categorization with Opik evaluation and advanced transaction detection

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

### 1. Categorization Agent

#### 1.1 Create Categorization Service
- [ ] Build categorization prompt
- [ ] Implement category inference
- [ ] Handle batch categorization
- [ ] Add confidence scoring

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
