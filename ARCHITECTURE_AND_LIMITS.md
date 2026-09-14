# Architecture and limitations

## Intended operating model

```text
Policy document
  -> LLM candidate-rule extraction
  -> Finance owner review, citation, test, approval
  -> versioned deterministic rule set

Employee receipt + declared context
  -> OCR / receipt extraction + confidence score
  -> deterministic evaluation against expense-date policy version
  -> explainable eligible / excluded / evidence-needed result
  -> Claim Department human decision
  -> approved export draft only
```

## AI and authority boundary

The proposed LLM is a constrained drafting assistant. It may extract a candidate condition, threshold, exception, citation, and question for the policy owner. It does **not** become the policy source of truth, publish a rule, make the final claim decision, post a journal, or release payment.

The runtime decision engine should use deterministic scripts because caps, dates, arithmetic, evidence checks, and audit reproduction must be stable, low-cost, and explainable at volume. An LLM is useful when a human is interpreting newly changed prose; it is unnecessarily expensive and harder to control for each repeated claim calculation.

## What this repository implements

- A Next.js client-side interface hosted on Vercel.
- Synthetic scenarios, personas, policy-version states, decision explanations, and export drafts.
- Visual demonstration of review and approval boundaries.

## What it intentionally does not implement

- Real receipt upload, OCR, identity/login, database, or immutable audit store.
- A live LLM connection or automatic policy-rule publication.
- ERP, payroll, bank, accounting-ledger, posting, or payment integration.
- A production duplicate-detection model or fraud decision.

Reloading the page resets application state because the prototype uses local client state.

## Production path

1. Add identity and role-based access for employees, reviewers, and policy owners.
2. Store receipts and approved policy versions securely with retention controls.
3. Add an extraction service with confidence scoring and an evidence-review queue.
4. Implement the deterministic rule engine as tested server-side functions.
5. Require citations, dual review where appropriate, regression tests, and an immutable policy-publication audit event.
6. Produce export files only after a reviewer approves; keep ERP posting and payment as separately authorised downstream actions.
7. Measure exception rate, average review time, employee resubmission rate, and policy-change regressions before expanding scope.

## Privacy and safety

Use synthetic data for coursework. A real deployment should minimise receipt data, protect access, define retention/deletion rules, and keep the decision trace available to the employee and reviewer. Low-confidence extraction, missing evidence, policy ambiguity, and duplicate-risk signals should default to human review.
