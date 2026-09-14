# ClaimReady product specification

## Problem statement

Employees and Finance teams lose time interpreting company-specific expense policy, collecting missing evidence, and manually splitting mixed receipts. Generic claim tools often route submissions but do not transparently apply changing, company-specific exceptions.

## Product objective

Provide an employee-facing pre-check and reviewer-facing decision trace that applies a human-approved, versioned policy rule set. The product should reduce avoidable back-and-forth without removing Finance’s authority to approve, post, or pay.

## Personas

- **Employee:** submits receipt details and sees what is eligible, excluded, or missing before submission.
- **Claim Department reviewer:** reviews exceptions and makes the final decision.
- **Finance policy owner:** reviews AI-assisted candidate rules, runs regression tests, and publishes policy versions.

## Policy examples

| Rule | V1: 1 Aug–30 Sep | V2: from 1 Oct |
| --- | --- | --- |
| Business food | $50 per person | $55 per person |
| Alcohol at approved corporate event | $40 per person | $45 per person |
| Late taxi | After 22:00, cap $45 | After 21:30, cap $55 |

The expense date determines the applicable version; the submission date does not.

## Functional requirements

1. Display a clear pre-submission claim result with eligible, excluded, and evidence-needed amounts.
2. Show the effective policy version, rule ID, and plain-language rationale for each conclusion.
3. Preserve uncertain cases for human review rather than auto-approving them.
4. Require a Finance owner to test and publish a candidate policy version.
5. Support a Claim Department queue with approve, return, and decline routes.
6. Create export drafts only; do not post or pay.
7. Preserve an auditable decision trace.

## Acceptance criteria for the prototype

- C03 excludes alcohol while preserving the eligible meal amount.
- C05 asks for itemisation instead of guessing.
- C09 applies V2 based on an October expense date after V2 is published.
- C14 routes duplicate risk to a reviewer.
- Every screen maintains the authority boundary: explain, recommend, and draft—never post or pay.

## Success measures for a production pilot

- Percentage of claims resolved without Finance follow-up.
- Median time from employee submission to reviewer-ready state.
- Evidence-request and resubmission rate.
- Policy version test-pass rate and policy-change regression incidents.
- Reviewer agreement rate with deterministic recommendations.
