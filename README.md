# ClaimReady

**[Open the live prototype](https://claimready-black.vercel.app)**

ClaimReady is a synthetic ACCT437 prototype that turns changing company expense-policy prose into reviewer-approved, deterministic claim checks. An AI assistant may draft a candidate rule from policy language, but a Finance policy owner must review, test, and publish it before it affects a claim outcome.

> **Course prototype only.** All people, receipts, policies, claim IDs, and outcomes are synthetic. The app does not post journals, pay employees, connect to an ERP, or make live AI calls.

## How to use the live demo

1. Open the [live prototype](https://claimready-black.vercel.app) and select **Start Workspace**.
2. In **Employee**, choose **C03 · Client dinner / alcohol split**. The eligible food is preserved; the $40 alcohol item is excluded without corporate-event approval.
3. In **Finance Policy**, run regression tests and select **Publish V2 with approval**.
4. Return to **Employee** and select **C09 · 21:45 taxi after policy change**. The October expense date selects V2, making the $52 taxi eligible under its $55 cap.
5. In **Claim Department**, open **C14 · Duplicate risk** and show that a reviewer, not the system, chooses approve, return, or decline.
6. In **Audit & export**, inspect the policy version, rule IDs and evidence basis, then generate an export draft. No payment or ERP posting occurs.

Reload the page to reset the synthetic demo state.

## Product flow

```text
Policy prose → AI-assisted candidate rule draft → human review + tests → published version
Receipt + employee context → extraction → deterministic rule engine → explainable outcome
Outcome → Claim Department review → approved export draft → downstream ERP/payroll (out of scope)
```

## Key scenarios

| Scenario | Demonstration |
| --- | --- |
| C03 | Split a mixed food-and-alcohol receipt; only the ineligible line is excluded. |
| C05 | Missing itemisation routes to an evidence request, not a guess. |
| C09 | Expense date—not submission date—selects the right policy version. |
| C12 | Business hotel spend is separated from personal extras. |
| C14 | Duplicate risk is flagged for human review rather than auto-rejected. |
| C16 | Exact late-taxi threshold under V2. |

## Design boundary

The LLM is deliberately constrained to candidate-rule drafting and ambiguity flagging. The runtime uses low-cost deterministic scripts for caps, dates, arithmetic, and evidence checks. Humans retain authority to publish policy, approve claims, post journals, and pay.

## Local run

```bash
npm install
npm run dev
```

The prototype is deployed on Vercel at [claimready-black.vercel.app](https://claimready-black.vercel.app).
