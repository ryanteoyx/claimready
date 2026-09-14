# Policy regression test register

These tests demonstrate that policy rules are explicit, versioned, and testable. Test IDs are synthetic fixtures defined for the ACCT437 demonstration. The interactive UI directly walks through C03, C05, C09, C12, C14, and C16; the remaining entries define the expected coverage as the engine is expanded.

| ID | Scenario | Expected deterministic result | Human route / control |
| --- | --- | --- | --- |
| C01 | Itemised meal within V1 cap | Eligible up to the itemised business-food amount. | Standard review. |
| C02 | Itemised meal over V1 per-person cap | Cap eligible food; exclude excess. | Explain cap calculation. |
| C03 | Food plus alcohol, no corporate-event approval | Claim eligible food; exclude alcohol line. | Reviewer verifies extraction and context. |
| C04 | Corporate event with manager approval and alcohol | Apply eligible food and approved-alcohol caps separately. | Verify pre-approval reference and attendee count. |
| C05 | Non-itemised meal | Do not infer alcohol split; hold for itemised receipt. | Return for evidence. |
| C06 | Taxi before late-night threshold | Not eligible under late-taxi rule. | Explain time condition. |
| C07 | V1 late taxi over $45 | Eligible amount capped at $45. | Standard review. |
| C08 | 21:45 taxi before 1 October | V1 applies; before V1’s 22:00 threshold, therefore not eligible. | Date-effective rule trace. |
| C09 | 21:45 taxi on/after 1 October | V2 applies; eligible up to $55. | Date-effective rule trace. |
| C10 | V2 late taxi over $55 | Eligible amount capped at $55. | Standard review. |
| C11 | Corporate-event claim missing approval | Do not apply exception; flag missing evidence. | Return for manager approval. |
| C12 | Hotel folio includes personal extras | Allow business accommodation; exclude personal extras. | Review itemised folio. |
| C13 | Hotel claim without folio | Do not allocate unsupported business portion. | Return for folio. |
| C14 | Potential duplicate receipt/amount/date | Do not auto-decline; flag duplicate confidence. | Human duplicate investigation. |
| C15 | Expense submitted after a policy update | Use expense date, not submission date, to choose version. | Audit trace must show both dates. |
| C16 | V2 taxi exactly $55 after 21:30 | Eligible in full. | Boundary regression test. |
| C17 | Blurry or unreadable receipt | Low extraction confidence; do not infer claim facts. | Request readable image. |
| C18 | V2 corporate-event alcohol over $45 per person | Cap alcohol at $45 per approved attendee. | Verify approval and attendee count. |

## Minimum release gate

Before a Finance policy owner publishes a new version, the release must:

1. Pass all affected boundary cases, including effective-date transitions.
2. Confirm every candidate rule has a policy citation, rule ID, approver, and effective date.
3. Confirm failure modes route to human review rather than auto-approval.
4. Record the published version and regression-test result in the audit log.

The prototype represents the release gate visually. A production implementation would execute the tests in CI and make policy publication conditional on the recorded result.
