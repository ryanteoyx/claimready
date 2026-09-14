# ClaimReady demo runbook

This is an 8–10 minute demonstration designed for the ACCT437 project brief. Start from a fresh page load so V2 is not yet published.

## 1. Frame the problem — 45 seconds

Say: “Generic expense systems can collect a receipt and route it. The hard part is applying our company’s changing policy consistently when one receipt contains mixed eligibility, missing evidence, time conditions, or duplicate risk.”

Point to the authority boundary: **Explain · Recommend · Draft. Never post or pay.**

## 2. Employee journey: partial eligibility — 2 minutes

1. Select **Start Workspace**, then **Employee**.
2. Choose **C03 · Client dinner / alcohol split**.
3. Explain that an itemised receipt includes food and alcohol.
4. Show the outcome: eligible food remains claimable; alcohol is excluded because the corporate-event approval condition is absent.
5. Select **Submit to Claim Department**.

Key message: the engine explains a line-level conclusion instead of making an opaque yes/no decision.

## 3. Employee journey: missing evidence — 1 minute

1. In **Employee**, select **C05 · Non-itemised meal**.
2. Show that the system does not guess whether alcohol is present.
3. Point to the requested itemised receipt and human-review route.

Key message: uncertainty produces an exception, not an automated payout.

## 4. Finance controls: policy update — 2 minutes

1. Select **Finance Policy**.
2. Explain that V1 applies through 30 September and V2 applies from 1 October.
3. Select **Run regression tests** and show the test status.
4. Select **Publish V2 with approval**.
5. Emphasise that an LLM can turn policy prose into a candidate rule, but a policy owner must review, test, and explicitly publish it.

Key message: policy changes are governed versions, not prompt changes made in production.

## 5. Date-effective decision — 1 minute

1. Return to **Employee**.
2. Choose **C09 · 21:45 taxi after policy change**.
3. Explain that C09’s *expense date* is after 1 October, so V2’s $55 late-taxi cap applies and $52 is eligible.
4. Contrast it with the pre-change case, where the same pattern would have used V1.

Key message: the system applies the policy that was effective when the expense occurred, not when the employee submits it.

## 6. Claim Department: human decision — 1 minute

1. Select **Claim Department**.
2. Open **C14 · Duplicate risk**.
3. Explain that deterministic matching found a probable duplicate, but the reviewer—not the software—decides whether to approve, return, or decline.

Key message: automation prioritises and explains; accountable staff retain decision authority.

## 7. Audit and export — 45 seconds

1. Select **Audit & export**.
2. Show the policy version, rule IDs, evidence basis, and reviewer action.
3. Generate the export draft and point out that it is not an ERP posting or payment instruction.

## Close — 30 seconds

Say: “ClaimReady makes a policy decision explainable before Finance spends time chasing the employee. It is deliberately a cost-efficient hybrid: candidate rule drafting is the AI task, while scalable runtime decisions are deterministic scripts with human controls.”

## Presenter checks

- Use the live app only with synthetic data.
- Reload the page if a prior demo has already published V2.
- Do not call the outputs “approvals” or “payments”; they are recommendations and reviewer routes.
- If asked about real-world rollout, use the limitations and roadmap in [Architecture and limitations](ARCHITECTURE_AND_LIMITS.md).
