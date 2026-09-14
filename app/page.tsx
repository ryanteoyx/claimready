"use client";

import { useMemo, useState } from "react";

type Role = "employee" | "reviewer" | "finance";
type Section = "home" | "submit" | "decision" | "queue" | "policy" | "audit";
type ClaimStatus = "Draft" | "Needs evidence" | "Submitted" | "Human review" | "Duplicate risk" | "Approved for export" | "Returned";

type Scenario = {
  id: string;
  label: string;
  short: string;
  employee: string;
  date: string;
  category: "Meal" | "Taxi" | "Hotel";
  requested: number;
  status: ClaimStatus;
  policy: "V1" | "V2";
  receipt: string;
  facts: string[];
  allowed: number;
  excluded: number;
  reason: string;
  next: string;
  rule: string;
  clause: string;
};

const scenarios: Scenario[] = [
  {
    id: "C03", label: "Mixed dinner with alcohol", short: "Food can proceed; alcohol is excluded", employee: "Jun Tan", date: "2026-08-22", category: "Meal", requested: 120, status: "Draft", policy: "V1",
    receipt: "The Green Table · SGD 120.00", facts: ["Food SGD 92.00", "Wine SGD 28.00", "2 attendees", "Itemised receipt", "No corporate-event ID"], allowed: 92, excluded: 28,
    reason: "Alcohol is excluded because no pre-approved corporate-event reference was supplied. Eligible food remains claimable.", next: "Remove the wine line or add an approved event ID and manager reference.", rule: "MEAL_ALCOHOL_EVENT_CAP", clause: "V1 §2 Alcohol exception"
  },
  {
    id: "C05", label: "Non-itemised team dinner", short: "Ask for an itemised receipt; do not guess", employee: "Jun Tan", date: "2026-08-27", category: "Meal", requested: 150, status: "Draft", policy: "V1",
    receipt: "Riverside Social · SGD 150.00", facts: ["Receipt total SGD 150.00", "No line items", "2 attendees", "Business purpose entered"], allowed: 0, excluded: 0,
    reason: "The receipt does not distinguish food from alcohol. ClaimReady must not estimate the alcohol allocation.", next: "Attach an itemised receipt before submitting this claim.", rule: "MEAL_ITEMISATION_REQUIRED", clause: "V1 §1–2 Meal and alcohol evidence"
  },
  {
    id: "C09", label: "Taxi after policy change", short: "21:45 taxi becomes eligible in V2", employee: "Mira Goh", date: "2026-10-02", category: "Taxi", requested: 48, status: "Draft", policy: "V2",
    receipt: "CityRide · SGD 48.00 · 21:45", facts: ["Origin: client site", "Destination: home", "Client workshop completed", "Receipt time 21:45"], allowed: 48, excluded: 0,
    reason: "V2 lowers the late-taxi threshold to 21:30 and raises the cap to SGD 55.00. The date is after V2 takes effect.", next: "Submit for Claim Department review.", rule: "LATE_TAXI_CAP", clause: "V2 §3 Late-night taxi"
  },
  {
    id: "C12", label: "Hotel folio with personal extras", short: "Room and tax allowed; minibar and laundry excluded", employee: "Mira Goh", date: "2026-08-12", category: "Hotel", requested: 504, status: "Human review", policy: "V1",
    receipt: "Harbour Hotel · SGD 504.00", facts: ["Room SGD 420.00", "Tax SGD 42.00", "Minibar SGD 18.00", "Laundry SGD 24.00", "2 approved business nights"], allowed: 462, excluded: 42,
    reason: "V1 permits room and tax for the approved stay. Personal minibar and laundry charges are excluded.", next: "Reviewer confirms business-stay dates before approving the reimbursement draft.", rule: "HOTEL_PERSONAL_EXTRAS", clause: "V1 §4 Hotel"
  },
  {
    id: "C14", label: "Possible duplicate taxi", short: "A similar prior claim needs a human decision", employee: "Mira Goh", date: "2026-09-05", category: "Taxi", requested: 38, status: "Duplicate risk", policy: "V1",
    receipt: "CityRide · SGD 38.00 · 22:15", facts: ["Same employee", "Same merchant/date/amount", "Prior claim CR-006 already approved", "Origin/destination present"], allowed: 38, excluded: 0,
    reason: "A matching approved claim exists. Duplicate risk is never automatically declined because group or correction claims can be legitimate.", next: "Claim Department compares CR-014 with CR-006 and records its rationale.", rule: "DUPLICATE_RISK", clause: "V1 §5 Duplicates"
  },
  {
    id: "C16", label: "Meal at V2 boundary", short: "Expense date selects the higher V2 cap", employee: "Jun Tan", date: "2026-10-01", category: "Meal", requested: 104, status: "Submitted", policy: "V2",
    receipt: "Makan House · SGD 104.00", facts: ["Food SGD 104.00", "2 attendees", "Itemised receipt", "Business purpose present"], allowed: 104, excluded: 0,
    reason: "The 1 October expense date selects V2. The V2 food cap is SGD 55 per attendee, so SGD 104 is eligible.", next: "Normal reviewer check, then approve for export.", rule: "MEAL_FOOD_CAP", clause: "V2 §1 Business meals"
  }
];

const nav: { id: Section; title: string; role: Role | "all"; note: string }[] = [
  { id: "home", title: "Workspace", role: "all", note: "Overview" },
  { id: "submit", title: "New claim", role: "employee", note: "Employee" },
  { id: "decision", title: "My claim decision", role: "employee", note: "Employee" },
  { id: "queue", title: "Review queue", role: "reviewer", note: "Claim Department" },
  { id: "policy", title: "Policy Studio", role: "finance", note: "Finance" },
  { id: "audit", title: "Audit & export", role: "all", note: "Evidence" }
];

const money = (amount: number) => new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(amount);

function Status({ children }: { children: string }) {
  const key = children.toLowerCase().replaceAll(" ", "-");
  return <span className={`status ${key}`}>{children}</span>;
}

export default function ClaimReady() {
  const [role, setRole] = useState<Role>("employee");
  const [section, setSection] = useState<Section>("home");
  const [selectedId, setSelectedId] = useState("C03");
  const [evaluated, setEvaluated] = useState(false);
  const [testsRun, setTestsRun] = useState(false);
  const [v2Published, setV2Published] = useState(false);
  const [claimStatuses, setClaimStatuses] = useState<Record<string, ClaimStatus>>({ C12: "Human review", C14: "Duplicate risk", C16: "Submitted" });
  const [purpose, setPurpose] = useState("Client relationship dinner after Q3 workshop");
  const [notice, setNotice] = useState("Synthetic demo data only. No payment, ERP posting, or external message is sent.");

  const selected = scenarios.find((item) => item.id === selectedId) ?? scenarios[0];
  const visibleNav = nav.filter((item) => item.role === "all" || item.role === role);
  const currentStatus = claimStatuses[selected.id] ?? selected.status;
  const policyAvailable = selected.policy === "V1" || v2Published;
  const queue = scenarios.filter((item) => ["C12", "C14", "C16"].includes(item.id));
  const submittedCount = scenarios.filter((item) => (claimStatuses[item.id] ?? item.status) === "Submitted").length;
  const approvalCount = scenarios.filter((item) => (claimStatuses[item.id] ?? item.status) === "Approved for export").length;

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setSection(nextRole === "employee" ? "home" : nextRole === "reviewer" ? "queue" : "policy");
    setNotice(`Viewing the synthetic ${nextRole === "reviewer" ? "Claim Department Reviewer" : nextRole === "finance" ? "Finance Policy Owner" : "Employee"} experience.`);
  }

  function runDecision() {
    setEvaluated(true);
    if (selected.policy === "V2" && !v2Published) {
      setNotice("V2 is still a Finance draft. ClaimReady blocks submission until an approved policy version covers this expense date.");
      return;
    }
    setNotice(`${selected.id} evaluated against ${selected.policy === "V1" ? "CR-EXP-2026-01" : "CR-EXP-2026-02"}. The recommendation is explained below.`);
  }

  function submitClaim() {
    if (!evaluated || !policyAvailable) {
      setNotice("Run the policy check after the active policy version is available before submitting.");
      return;
    }
    const status: ClaimStatus = selected.id === "C05" ? "Needs evidence" : selected.id === "C14" ? "Duplicate risk" : selected.id === "C12" ? "Human review" : "Submitted";
    setClaimStatuses((current) => ({ ...current, [selected.id]: status }));
    setSection("decision");
    setNotice(`${selected.id} is ${status.toLowerCase()}. A decision trace, policy version, and submitted facts are retained.`);
  }

  function reviewClaim(action: "return" | "decline" | "approve") {
    const status: ClaimStatus = action === "approve" ? "Approved for export" : action === "return" ? "Returned" : "Human review";
    setClaimStatuses((current) => ({ ...current, [selected.id]: status }));
    setNotice(action === "approve" ? `${selected.id} is approved for a reimbursement CSV draft. ClaimReady has not paid anyone.` : action === "return" ? `${selected.id} was returned with an evidence request.` : `${selected.id} was declined and remains visible in the audit trace.`);
  }

  function publishV2() {
    if (!testsRun) {
      setNotice("Publication blocked: run the mandatory V1/V2 boundary tests first.");
      return;
    }
    setV2Published(true);
    setNotice("CR-EXP-2026-02 published by Finance Policy Owner. V1 remains immutable for expenses dated before 1 October.");
  }

  function reset() {
    setRole("employee"); setSection("home"); setSelectedId("C03"); setEvaluated(false); setTestsRun(false); setV2Published(false);
    setClaimStatuses({ C12: "Human review", C14: "Duplicate risk", C16: "Submitted" });
    setNotice("Demo reset. V1 is active; V2 is a reviewed-but-unpublished candidate.");
  }

  const policyLabel = selected.policy === "V1" ? "CR-EXP-2026-01" : "CR-EXP-2026-02";

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="logo"><span className="logo-mark">✓</span><div><strong>ClaimReady</strong><small>Policy-to-claim engine</small></div></div>
        <div className="demo-flag"><span /> SYNTHETIC COURSE DEMO</div>
        <div className="role-switch" aria-label="Switch demo persona">
          <p>VIEW AS</p>
          {(["employee", "reviewer", "finance"] as Role[]).map((item) => <button key={item} className={role === item ? "active" : ""} onClick={() => changeRole(item)}>{item === "employee" ? "Employee" : item === "reviewer" ? "Claim Department" : "Finance"}</button>)}
        </div>
        <nav aria-label="ClaimReady sections">
          {visibleNav.map((item) => <button key={item.id} className={`nav-button ${section === item.id ? "active" : ""}`} onClick={() => setSection(item.id)}><span>{item.title}</span><small>{item.note}</small></button>)}
        </nav>
        <div className="boundary"><p>AUTHORITY BOUNDARY</p><strong>Explain · Recommend · Draft</strong><span>Never post or pay.</span></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">ACCT437 · SINGAPORE · EXPENSE CLAIM POLICY DEMO</p><h1>{nav.find((item) => item.id === section)?.title ?? "Workspace"}</h1></div>
          <div className="top-actions"><span className={`policy-chip ${v2Published ? "v2" : ""}`}>{v2Published ? "V2 active from 1 Oct" : "V1 active · V2 draft"}</span><button className="button ghost" onClick={reset}>Reset demo</button></div>
        </header>
        <div className="notice"><b>✦</b>{notice}</div>

        {section === "home" && <>
          <section className="hero">
            <div><p className="eyebrow">MAKE POLICY CLEAR BEFORE SUBMISSION</p><h2>Turn company policy into a reviewer-ready claim.</h2><p>ClaimReady separates AI-assisted policy translation from deterministic claim decisions. Employees receive immediate explanations; Finance approves every policy version; the Claim Department keeps the final reimbursement judgement.</p><div className="hero-actions"><button className="button primary" onClick={() => { setRole("employee"); setSection("submit"); }}>Start a synthetic claim</button><button className="button secondary" onClick={() => { setRole("finance"); setSection("policy"); }}>Review policy change</button></div></div>
            <div className="decision-card"><span>LIVE DESIGN RULE</span><strong>Policy → approved rules → explained result</strong><p>LLM drafts once. Human reviews. Deterministic rules run every claim.</p><div className="step-dots"><i>1</i><i>2</i><i>3</i></div></div>
          </section>
          <section className="metric-grid">
            <article><b>{submittedCount}</b><span>claims in reviewer workflow</span></article><article><b>{v2Published ? "V2" : "V1"}</b><span>latest published policy</span></article><article><b>18</b><span>synthetic edge-case tests</span></article><article><b>{approvalCount}</b><span>reimbursement drafts approved</span></article>
          </section>
          <section className="two-column"><article className="panel"><p className="eyebrow">PRODUCT FLOW</p><h3>One safe path from receipt to review</h3><div className="flow"><div><b>1</b><span>Employee submits facts</span><small>Receipt + business context</small></div><i>→</i><div><b>2</b><span>Approved rules evaluate</span><small>Correct policy version</small></div><i>→</i><div><b>3</b><span>Human reviews exceptions</span><small>Audit-ready decision</small></div><i>→</i><div><b>4</b><span>Draft export only</span><small>No payment action</small></div></div></article><article className="panel"><p className="eyebrow">WHAT THIS DEMO PROVES</p><h3>Complex policy is manageable without an agent deciding money.</h3><ul className="plain-list"><li><b>Mixed meal:</b> keep eligible food, exclude unsupported alcohol.</li><li><b>Taxi change:</b> choose V1 or V2 using expense date.</li><li><b>Ambiguity:</b> request evidence or route to a person.</li><li><b>Duplicate:</b> flag risk, never auto-decline.</li></ul></article></section>
        </>}

        {section === "submit" && <section className="submission-grid">
          <article className="panel scenario-list"><p className="eyebrow">SELECT A DEMO RECEIPT</p><h2>New claim</h2><p className="muted">Each receipt includes its realistic edge case and expected data.</p><div className="scenario-items">{scenarios.filter((item) => item.id !== "C14").map((item) => <button key={item.id} onClick={() => { setSelectedId(item.id); setEvaluated(false); }} className={selected.id === item.id ? "selected" : ""}><span>{item.id}</span><div><strong>{item.label}</strong><small>{item.short}</small></div><em>{money(item.requested)}</em></button>)}</div></article>
          <article className="panel claim-form"><div className="panel-head"><div><p className="eyebrow">RECEIPT AND CONTEXT</p><h2>{selected.label}</h2></div><Status>{selected.policy === "V1" ? "V1 applies" : v2Published ? "V2 applies" : "V2 draft"}</Status></div><div className="receipt"><div className="receipt-icon">▧</div><div><strong>{selected.receipt}</strong><span>Expense date {selected.date} · {selected.category}</span></div><button className="text-button" onClick={() => setNotice("Synthetic receipt preview selected. In production this remains private storage.")}>View receipt</button></div><div className="facts">{selected.facts.map((fact) => <span key={fact}>✓ {fact}</span>)}</div><label>Business purpose<textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} /></label><div className="form-row"><label>Cost centre<select defaultValue="Client Services"><option>Client Services</option><option>Marketing</option><option>Operations</option></select></label><label>{selected.category === "Meal" ? "Attendees" : selected.category === "Taxi" ? "Trip purpose" : "Business stay dates"}<input key={selected.id} defaultValue={selected.category === "Meal" ? "2" : selected.category === "Taxi" ? "Client workshop" : "12–14 Aug"} /></label></div><div className="form-actions"><button className="button primary" onClick={runDecision}>Run ClaimReady check</button><button className="button secondary" onClick={() => setNotice("Draft saved locally in this synthetic demo.")}>Save draft</button></div>{evaluated && <div className={`inline-result ${policyAvailable ? "" : "blocked"}`}><b>{policyAvailable ? "Policy check ready" : "Policy coverage gap"}</b><span>{policyAvailable ? `${policyLabel} selected from expense date. Review the decision before submitting.` : "Finance must publish the version that covers this expense date."}</span></div>}</article>
        </section>}

        {section === "decision" && <section className="decision-layout">
          <article className="panel decision-main"><div className="panel-head"><div><p className="eyebrow">EXPLAINED RECOMMENDATION</p><h2>{selected.label}</h2><span className="muted">{selected.receipt}</span></div><Status>{currentStatus}</Status></div>{selected.policy === "V2" && !v2Published ? <div className="coverage-warning"><b>Submission is blocked.</b><span>CR-EXP-2026-02 is a Finance draft and has not yet been published. This prevents an unapproved policy from deciding a claim.</span><button className="button secondary" onClick={() => { setRole("finance"); setSection("policy"); }}>Open Policy Studio</button></div> : <><div className="amount-grid"><div className="requested"><span>Requested</span><b>{money(selected.requested)}</b></div><div className="allowed"><span>Recommended claimable</span><b>{money(selected.allowed)}</b></div><div className="excluded"><span>{selected.excluded ? "Excluded" : "Additional evidence"}</span><b>{selected.excluded ? money(selected.excluded) : "Needed"}</b></div></div><div className="reason-card"><p className="eyebrow">WHY</p><h3>{selected.reason}</h3><p><b>Next step:</b> {selected.next}</p></div><div className="trace-card"><div><span>Policy version</span><b>{policyLabel}</b></div><div><span>Rule ID</span><b>{selected.rule}</b></div><div><span>Source clause</span><b>{selected.clause}</b></div><div><span>Decision authority</span><b>Reviewer retains final approval</b></div></div><div className="submit-bar"><div><strong>Before you submit</strong><span>Your receipt facts, corrections, policy version, and decision trace will be retained.</span></div><button className="button primary" onClick={submitClaim}>{selected.id === "C05" ? "Request evidence guidance" : "Submit for review"}</button></div></>}</article>
          <article className="panel evidence-panel"><p className="eyebrow">ITEM-LEVEL TRACE</p><h3>What the rule did</h3><div className="item-row"><span>{selected.category === "Meal" ? "Eligible food / business meal" : selected.category === "Taxi" ? "Eligible trip fare" : "Eligible business stay"}</span><b>{money(selected.allowed)}</b></div>{selected.excluded > 0 && <div className="item-row excluded"><span>{selected.category === "Meal" ? "Alcohol or excess cap" : "Personal extras / excess fare"}</span><b>− {money(selected.excluded)}</b></div>}<p className="fine-print">This is a transparent recommendation from approved rules. It is not an automated reimbursement approval.</p></article>
        </section>}

        {section === "queue" && <section className="queue-layout">
          <article className="panel queue-panel"><div className="panel-head"><div><p className="eyebrow">EXCEPTION-LED WORK QUEUE</p><h2>Claims needing judgement</h2></div><span className="count">{queue.length} cases</span></div><div className="queue-list">{queue.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={selected.id === item.id ? "selected" : ""}><div><small>{item.id} · {item.category}</small><strong>{item.label}</strong><span>{item.employee} · {money(item.requested)} · {item.policy}</span></div><Status>{claimStatuses[item.id] ?? item.status}</Status></button>)}</div></article>
          <article className="panel review-detail"><div className="panel-head"><div><p className="eyebrow">CLAIM DEPARTMENT REVIEW</p><h2>{selected.label}</h2></div><Status>{currentStatus}</Status></div><div className="review-summary"><span>{selected.receipt}</span><b>{money(selected.requested)} requested · {money(selected.allowed)} recommended</b><p>{selected.reason}</p></div><div className="review-grid"><div><span>Employee context</span><b>{selected.facts.join(" · ")}</b></div><div><span>Rule trace</span><b>{policyLabel} · {selected.rule}</b></div><div><span>Audit instruction</span><b>{selected.next}</b></div><div><span>Prior-match check</span><b>{selected.id === "C14" ? "CR-006 found — compare before action" : "No same-key claim found"}</b></div></div><div className="review-actions"><button className="button secondary" onClick={() => reviewClaim("return")}>Return for evidence</button><button className="button danger" onClick={() => reviewClaim("decline")}>Decline with rationale</button><button className="button primary" onClick={() => reviewClaim("approve")}>Approve for export</button></div><p className="fine-print">Every reviewer action is append-only in the audit record. The CSV draft is not a payment instruction.</p></article>
        </section>}

        {section === "policy" && <section className="policy-layout">
          <article className="panel policy-hero"><p className="eyebrow">FINANCE POLICY OWNER</p><h2>Policy changes are reviewed, tested, and versioned.</h2><p>Candidate rules below are pre-seeded LLM translation output for this course demo. They are constrained decision tables, not arbitrary code. Finance must still test and publish the result.</p><div className="version-grid"><div className="version published"><span>PUBLISHED</span><strong>CR-EXP-2026-01</strong><small>Effective 1 Aug–30 Sep 2026</small><ul><li>Food: SGD 50 / attendee</li><li>Alcohol event cap: SGD 40 / attendee</li><li>Taxi: 22:00 onward; cap SGD 45</li></ul></div><div className={`version ${v2Published ? "published" : "candidate"}`}><span>{v2Published ? "PUBLISHED" : "CANDIDATE"}</span><strong>CR-EXP-2026-02</strong><small>Effective from 1 Oct 2026</small><ul><li>Food: SGD 55 / attendee</li><li>Alcohol event cap: SGD 45 / attendee</li><li>Taxi: 21:30 onward; cap SGD 55</li></ul></div></div></article>
          <section className="policy-split"><article className="panel"><p className="eyebrow">GENERATED RULE CARD · REVIEW REQUIRED</p><h3>LATE_TAXI_CAP</h3><div className="rule-schema"><span>Source clause</span><b>V2 §3 Late-night taxi</b><span>Applies when</span><b>category = taxi AND receipt time ≥ 21:30</b><span>Requires</span><b>origin, destination, approved work/client/event purpose</b><span>Calculation</span><b>min(receipt total, SGD 55)</b><span>Missing evidence</span><b>Route to employee action; never guess</b></div><div className="code-block">{`{\n  "id": "LATE_TAXI_CAP",\n  "version": "CR-EXP-2026-02",\n  "threshold": "21:30",\n  "cap": 55,\n  "on_missing": "needs_employee_action"\n}`}</div></article><article className="panel test-panel"><p className="eyebrow">PUBLISH GATE</p><h3>{testsRun ? "All mandatory boundary tests passed" : "Test V1 and V2 boundaries"}</h3><p>Checks C08/C09 and C15/C16 prove that expense date—not submission date—selects the policy version.</p><div className="test-list"><span className={testsRun ? "pass" : ""}>C08 · 25 Sep 21:45 taxi → not eligible under V1</span><span className={testsRun ? "pass" : ""}>C09 · 2 Oct 21:45 taxi → SGD 48 under V2</span><span className={testsRun ? "pass" : ""}>C15 · 30 Sep receipt submitted in Oct → V1</span><span className={testsRun ? "pass" : ""}>C16 · 1 Oct meal → V2</span></div><button className="button secondary" onClick={() => { setTestsRun(true); setNotice("Mandatory V1/V2 regression tests passed against synthetic fixtures C08, C09, C15 and C16."); }}>Run regression tests</button><button className="button primary" disabled={!testsRun || v2Published} onClick={publishV2}>{v2Published ? "V2 published" : "Publish V2 with approval"}</button><small>Publication records the approver, timestamp, source-policy checksum, and test outcomes.</small></article></section>
        </section>}

        {section === "audit" && <section className="audit-layout"><article className="panel"><p className="eyebrow">APPEND-ONLY AUDIT TIMELINE</p><h2>Evidence that supports, not replaces, professional judgement.</h2><div className="timeline"><div><time>08:45</time><b>CR-EXP-2026-01 published</b><span>Finance Policy Owner approved V1 after mandatory rule tests passed.</span></div><div><time>09:12</time><b>C03 evaluated</b><span>MEAL_ALCOHOL_EVENT_CAP allowed SGD 92.00 food and excluded SGD 28.00 wine.</span></div><div><time>09:18</time><b>C05 held for evidence</b><span>System requested itemised receipt; no allocation was guessed.</span></div><div><time>{v2Published ? "10:05" : "Pending"}</time><b>{v2Published ? "CR-EXP-2026-02 published" : "CR-EXP-2026-02 awaiting Finance publication"}</b><span>{v2Published ? "V2 test suite and approval were recorded. V1 remains immutable." : "Publication will be blocked until tests and human approval complete."}</span></div></div></article><article className="panel export-panel"><p className="eyebrow">REIMBURSEMENT DRAFT</p><h3>Export only after human approval</h3><div className="export-number"><b>{approvalCount}</b><span>claims approved for export</span></div><p>The export contains claim ID, employee pseudonym, approved amount, cost centre, category, policy version and reviewer reference.</p><button className="button primary" disabled={!approvalCount} onClick={() => setNotice(`${approvalCount} synthetic reimbursement row(s) drafted as CSV. No payment or payroll instruction was created.`)}>Generate CSV draft</button><div className="export-boundary"><b>Deliberate limit</b><span>ClaimReady does not post, pay, or mark a claim as paid.</span></div></article></section>}
      </section>
    </main>
  );
}
