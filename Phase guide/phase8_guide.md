# Phase 8: Opik Integration & Evaluation Suite

> **Duration**: Days 19-20  
> **Prerequisites**: Phases 5-6 completed (AI agents working)  
> **Goal**: Complete Opik observability with comprehensive evaluation  
> **Status**: ❌ **NOT STARTED** (0%)

---

## 📋 websitelook.md Alignment

This phase is **infrastructure-focused** and doesn't add new user-facing pages.

### Purpose:
Ensure all AI features from Phases 5-6 have proper observability.

| AI Feature | Element Reference | Observability |
|------------|-------------------|---------------|
| Categorization | Element 3.3 | ❌ |
| Weekly Reports | Element 6.2 | ❌ |
| AI Advisor | Screen 8 | ❌ |
| Chart Generation | Element 6.5 | ❌ |

### Opik Dashboard Metrics:
- [ ] Trace coverage percentage
- [ ] Categorization accuracy (precision/recall)
- [ ] Response latency (P50/P95)
- [ ] Token usage per feature
- [ ] Error rate tracking

### Evaluation Datasets:
| Dataset | Size | Purpose |
|---------|------|---------|
| Categorization Golden | 200 | Transaction classification |
| Advice Quality | 50 | LLM-as-judge scoring |
| Chart Commands | 30 | NL to chart accuracy |

---

## Phase Overview

By the end of this phase, you will have:
- Comprehensive trace coverage for all AI features
- Evaluation datasets for each agent
- LLM-as-judge configurations
- Performance dashboards
- Regression test suite
- **Loan/Split Detection Evaluation** - Test AI's ability to detect loans and splits (NEW)
- **Recurring Expense Linking Evaluation** - Test AI's suggestion accuracy (NEW)


---

## Task Checklist

### 1. Complete Trace Coverage

#### 1.1 Audit All AI Calls
- [ ] Verify categorization agent traced
- [ ] Verify report agent traced
- [ ] Verify advisor agent traced
- [ ] Verify chart agent traced
- [ ] Add metadata to all traces

**Trace Metadata Template:**
```javascript
opik.trace({
  name: 'categorization',
  metadata: {
    householdId: 'xxx',
    transactionCount: 1,
    promptVersion: 'v2.1',
    model: 'gemini-1.5-flash'
  }
});
```

---

### 2. Evaluation Datasets

#### 2.1 Create All Datasets
- [ ] Categorization dataset (200 samples)
- [ ] Weekly report dataset (50 samples)
- [ ] Advice quality dataset (30 samples)
- [ ] Chart query dataset (100 samples)

**Directory Structure:**
```
backend/evaluation/datasets/
├── categorization.json
├── reports.json
├── advice.json
└── charts.json
```

---

### 3. LLM-as-Judge Setup

#### 3.1 Configure Judges for Each Agent
- [ ] Categorization accuracy judge
- [ ] Report quality judge (relevance, actionability, tone)
- [ ] Advice quality judge
- [ ] Chart relevance judge

**LLM Prompt for Report Judge:**
```
You are evaluating a financial report. Score 1-5 on:
1. Relevance: Does it address the actual spending data?
2. Actionability: Does it suggest specific actions?
3. Tone: Is it encouraging and non-judgmental?

Report: {report}
Spending Data: {data}

Return JSON: { relevance: X, actionability: Y, tone: Z, reasoning: "..." }
```

---

### 4. Regression Test Suite

#### 4.1 Automated Testing
- [ ] Create test runner script
- [ ] Run on deployments
- [ ] Alert on accuracy drops

**Test Runner:**
```bash
npm run eval:all
# Runs all evaluation datasets
# Compares to baseline
# Alerts if metrics drop >5%
```

---

### 5. Performance Dashboards

#### 5.1 Configure Opik Dashboards
- [ ] Accuracy trends over time
- [ ] Latency percentiles
- [ ] Token usage by feature
- [ ] Error rates

**Dashboard Metrics:**
| Metric | Target | Alert |
|--------|--------|-------|
| Categorization accuracy | >90% | <85% |
| Advice actionability | >4.0 | <3.5 |
| P95 latency | <3s | >5s |
| Error rate | <2% | >5% |

---

## Opik Testing Steps

1. Go to https://www.comet.com/opik
2. Navigate to your project
3. View Experiments tab
4. Run: `npm run eval:categorization`
5. Refresh dashboard
6. Verify results appear

---

## Completion Criteria

- [ ] 100% AI calls traced
- [ ] 4 evaluation datasets created
- [ ] LLM-as-judge configured
- [ ] Regression tests automated
- [ ] Dashboard ready for demo

---

## Next Phase Preview

**Phase 9: Testing & Polish** will finalize everything for launch.
