import type { Project } from '@/lib/types';

// TODO(kunal): replace with the real repository URL before deploying.
const REPO = 'https://github.com/DAISHINKAN7/RevenueOS';

export const revenueos: Project = {
  slug: 'revenueos',
  name: 'RevenueOS',
  wordmark: 'RevenueOS',
  subtitle: 'Autonomous Revenue Recovery with a Deterministic Authority Boundary',
  hook: 'The highest-converting recovery action often loses money. This system is built to refuse it.',
  summary:
    'An agentic revenue-recovery system for ecommerce checkout abandonment and payment failure. An LLM plans; a frozen model predicts; a deterministic economics layer ranks by incremental contribution margin; a policy engine authorizes; Razorpay executes; webhooks verify. The LLM cannot touch money — and that is enforced structurally, not by a filter.',
  domainLine: 'Agentic AI · Applied ML · Payments engineering',
  categories: ['Agentic AI', 'Machine Learning', 'LLM Engineering', 'MLOps'],
  period: 'Jun 2026 — Aug 2026',
  role: 'Sole author — simulator, ML, economics, policy, payments, agent layer, frontend',
  status: 'Working end to end · Razorpay Test Mode',
  statusTone: 'benchmark',
  repo: REPO,
  scale: '353 passing tests · FastAPI backend + Next.js 15 frontend',
  headline: {
    value: '41.0%',
    label: 'of opportunities where the conversion-maximising and contribution-maximising actions disagree',
    note: 'That divergence is the entire product thesis',
    prov: 'reported',
  },
  cardMetrics: [
    { value: '41.0%', label: 'objectives disagree', prov: 'reported' },
    { value: '0 / 0', label: 'unauthorized executions · policy bypasses', prov: 'verified' },
    { value: '353', label: 'passing tests', prov: 'verified' },
    { value: '2,127', label: 'Kish effective sample size (OPE)', prov: 'verified' },
  ],
  tech: ['Python', 'FastAPI', 'XGBoost', 'SQLAlchemy', 'Razorpay', 'Next.js', 'TypeScript'],
  techGrouped: [
    { group: 'ML & evaluation', items: ['XGBoost', 'scikit-learn', 'isotonic calibration (rejected)', 'IPS / SNIPS / Doubly Robust', 'bootstrap CIs'] },
    { group: 'Backend', items: ['Python 3.11', 'FastAPI', 'SQLAlchemy', 'PostgreSQL / SQLite', 'Pydantic'] },
    { group: 'Agent layer', items: ['OpenAI-compatible provider adapter', 'JSON-schema-forced planning', 'bounded tool surface', 'deterministic fallback router'] },
    { group: 'Payments', items: ['Razorpay Test Mode', 'HMAC-SHA256 raw-body verification', 'webhook inbox + reconciler', 'idempotency keys'] },
    { group: 'Simulation', items: ['NumPy', 'pandas', 'Parquet', 'seeded generators', 'stored propensities'] },
    { group: 'Frontend', items: ['Next.js 15', 'React 19', 'TypeScript strict', 'Tailwind'] },
  ],
  glance: [
    { k: 'Problem', v: 'Recovery products ask whether a transaction can be recovered. The better question is which intervention creates the most incremental contribution margin — and whether the agent is authorized to take it.' },
    { k: 'The finding', v: 'Conversion and contribution disagree on 41.0% of opportunities. A conversion-optimising system reaches for a discount roughly a third of the time; the economics layer picks it 2.2% of the time.' },
    { k: 'Safety thesis', v: 'The LLM proposes which bounded tool runs next. It cannot set an amount, a probability, a policy outcome or a payment state — no tool accepts a monetary argument, and a test asserts the function signature so the property cannot regress.' },
    { k: 'Data', v: 'A purpose-built behavioural simulator: 8,000 customers, 120,000 sessions, 70,087 checkouts, 44,066 payment attempts, 36,265 recovery opportunities with stored propensities and a ~25% randomised exploration cohort.' },
    { k: 'Evaluation', v: 'Three independent streams — observed held-out outcomes, off-policy estimation from logged data only, and a labelled synthetic oracle. Where they disagree, the disagreement is reported.' },
    { k: 'Deliberately absent', v: 'No real-merchant data and no causal claim. This is policy evaluation under a documented behavioural model. Two findings that went against the project are published rather than buried.' },
  ],
  heroDiagram: 'revenueos-authority',
  accentIndex: 5,
  related: ['astroguard', 'adaptive-beta'],
  sections: [
    {
      id: 'problem',
      nav: 'Problem',
      title: 'Recovering the transaction is not the same as making money',
      blocks: [
        {
          type: 'lede',
          text: 'A 10% discount recovers more carts than doing nothing. It also frequently earns less than doing nothing.',
        },
        {
          type: 'prose',
          text: [
            'Ecommerce loses revenue at two well-defined points: a customer abandons a checkout, or a payment fails. Recovery products exist for both, and almost all of them optimise the same objective — the probability that the transaction completes.',
            'That objective is wrong whenever the incentive costs more than the uplift is worth. A medium discount can have the highest recovery probability in the candidate set and a negative incremental expected value at the same time, because the discount is paid on every recovered order including the ones that would have converted unaided.',
          ],
        },
        {
          type: 'image',
          src: '/projects/revenueos/decision.svg',
          alt: 'Decision receipt showing the highest-converting action carrying negative incremental value',
          caption: 'A decision receipt from the running system: the highest-converting action carries negative incremental value. Every conversion-optimising recovery product fires it anyway.',
          theme: 'dark',
          prov: 'reported',
        },
        {
          type: 'quote',
          text: 'Most recovery systems ask whether a transaction can be recovered. The better question is what caused the loss, which intervention creates the most incremental contribution margin, whether the agent is authorized to take it, and whether the money actually arrived.',
        },
      ],
    },
    {
      id: 'economics',
      nav: 'Economics',
      title: 'The objective function, and the four invariants that protect it',
      blocks: [
        {
          type: 'code',
          lang: 'python',
          file: 'ml/financial_engine.py',
          why: 'Ranking on ΔEV rather than EV is the single decision the whole product rests on. Incentive costs are conditional on recovery — a discount costs nothing if the customer does not convert — while fixed action costs are paid regardless.',
          code: `EV(a) = P(recovery | context, a)
        × ( base_contribution_margin
          − incentive_cost_if_recovered(a)     # conditional
          − expected_return_loss(a)
          − expected_cancellation_loss(a) )
        − fixed_action_cost(a)                 # unconditional

ΔEV(a) = EV(a) − EV(DO_NOTHING)               # ranked on this, not EV`,
        },
        {
          type: 'list',
          title: 'Four invariants · 28 unit tests',
          ordered: true,
          items: [
            'Incentive cost is conditional on recovery',
            'An incentive is subtracted exactly once',
            'Reported GMV is net of discount',
            'If no action has positive ΔEV, DO_NOTHING is actively selected rather than defaulted to',
          ],
        },
        { type: 'chart', id: 'revenueos-split', caption: 'Which action each objective picks, across sampled opportunities. The two objectives disagree on 41.0% of cases.', prov: 'reported' },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The two objectives are not close',
          body: 'A conversion-maximising system reaches for MEDIUM_DISCOUNT on 32.1% of opportunities. The economics layer picks it on 2.2%, preferring free shipping (32.8%) or doing nothing at all (26.0%). Doing nothing being the second-most-selected action is not a failure of ambition — it is the correct answer whenever no intervention clears its own cost.',
        },
        {
          type: 'image',
          src: '/projects/revenueos/economics.svg',
          alt: 'Flat ten percent discount converts better and earns less than doing nothing',
          caption: 'The flat-discount baseline converts better than doing nothing and earns less. This contrast is the demonstration, not an inconvenience.',
          theme: 'dark',
          prov: 'reported',
        },
      ],
    },
    {
      id: 'authority',
      nav: 'Authority',
      title: 'Six components, none of which can do the next one\u2019s job',
      blocks: [
        { type: 'diagram', id: 'revenueos-authority', caption: 'ML predicts. Economics ranks. Policy authorizes. Razorpay executes. Webhooks verify. Audit records. The predictor returns probabilities and nothing else; the financial engine takes no model; the policy engine takes no text.' },
        {
          type: 'image',
          src: '/projects/revenueos/architecture.svg',
          alt: 'RevenueOS system architecture',
          caption: 'The full system as shipped, including the webhook inbox, reconciler and append-only audit store.',
          theme: 'dark',
        },
        {
          type: 'table',
          caption: 'Merchant policy — deterministic, no model, no LLM, no text input',
          prov: 'verified',
          head: ['Rule', 'Threshold'],
          num: [1],
          rows: [
            ['max_autonomous_discount_percent', '7'],
            ['max_autonomous_discount_amount', '₹300'],
            ['max_free_shipping_cost', '₹150'],
            ['minimum_contribution_margin_percent', '15'],
            ['max_recovery_attempts', '2'],
            ['minimum_action_confidence', '0.65'],
            ['high_value_order_threshold', '₹10,000'],
            ['human_approval_required_above_discount', '₹250'],
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Good economics are not sufficient authority',
          body: 'Demonstrated live on a ₹55,116 cart: ΔEV is +₹235.90 — positive economics — and the gate still returns REQUIRE_APPROVAL because the order exceeds the high-value threshold. Executions created: zero. Every rule is evaluated and recorded individually with its input, threshold and verdict, and every PASS carries an explicit maximum authorized downside in rupees.',
        },
      ],
    },
    {
      id: 'agent',
      nav: 'Agent layer',
      title: 'There is an LLM. It does exactly one thing.',
      blocks: [
        { type: 'diagram', id: 'revenueos-boundary', caption: 'Three independent defences sit between the planner and any monetary effect. None of them is a content filter.' },
        {
          type: 'definitions',
          items: [
            {
              term: 'Why prompt injection structurally cannot work',
              body: 'A customer note demanding a 50% discount changes nothing, for three reasons that compound. No 50% discount exists — the action space is closed and enumerated, and no code path constructs an action from a string. PolicyEngine.evaluate() accepts no text parameter, so there is no channel through which text could reach it, and a test asserts the function signature itself so the property cannot regress silently. And no agent tool accepts a monetary argument; an unknown tool name is treated as a hallucination rather than an instruction.',
            },
            {
              term: 'The tool surface is eight tools and two verbs',
              body: 'Read-only: get_opportunity_state, get_policy_summary, get_audit_summary. Advisory: diagnose_recovery_context. Mutating: analyze_opportunity, request_execution, request_human_approval, stop_workflow. Plus WAIT and STOP. request_execution accepts no action, no amount and no approval flag — it names a policy-evaluation id, and the backend re-reads that evaluation, re-checks the workflow state, confirms the action still matches, and executes only what policy authorized.',
            },
            {
              term: 'The LLM is optional, not load-bearing',
              body: 'With AGENT_LLM_ENABLED=false a deterministic planner drives the identical workflow and the backend behaves exactly as it did before the agent layer existed. The agent is an ergonomic enhancement, never a dependency for correctness. Planner timeouts, malformed output and unknown tool names all fall through to the deterministic fallback router rather than failing the run.',
            },
            {
              term: 'Budgets bound every run',
              body: 'max_tool_calls 6, max_replans 3, max_diagnosis_calls 1, max_steps 12. Exceeding any of them ends the run as STOPPED_BUDGET with no financial action taken. A no-progress detector stops runs where state, attempt, policy decision and evidence are all unchanged across calls.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The blocked-call count matters as much as the zeros',
          body: 'Unauthorized executions: 0. Policy bypasses: 0. Blocked tool calls: non-zero. The third number is what makes the first two meaningful — a gate that never blocks anything is decorative. Every proposal is audited as a chain: AGENT_TOOL_PROPOSED → ALLOWED or BLOCKED → RESULT, with blocked calls carrying the state, the permitted tool set, the reason and an arguments hash. Only concise decision summaries are persisted, never hidden chain-of-thought.',
        },
        {
          type: 'image',
          src: '/projects/revenueos/authority.svg',
          alt: 'Authority matrix showing what the planner may and may not do',
          caption: 'The authority matrix — the picture to put on screen when someone asks what stops the LLM from giving a 50% discount.',
          theme: 'dark',
        },
      ],
    },
    {
      id: 'ml',
      nav: 'The model',
      title: 'A deliberately modest model, and two findings that went the wrong way',
      kicker: 'Calibration is the primary metric, because decisions are expected-value comparisons rather than rankings.',
      blocks: [
        {
          type: 'prose',
          text: [
            'The model estimates P(recovery | context, action) — action-conditioned, scored independently for every eligible action, not a single "will this recover" score. XGBoost over 58 features across six groups, with all simulator latents, oracle probabilities and realised outcomes excluded and the exclusion enforced programmatically.',
            'A test ROC-AUC near 0.60 is modest by classification standards and is expected here. The simulator injects shared logit noise plus hidden environment windows the feature set cannot observe — bank outages, competitor sales, courier disruption, payday effects. High AUC would mean the environment is too easy or something leaked, which is why the project treats ROC-AUC above 0.85 as a defect condition rather than a success.',
          ],
        },
        {
          type: 'table',
          caption: 'Held-out TEST metrics, as recorded in the model card',
          prov: 'reported',
          head: ['Metric', 'Value'],
          num: [1],
          rows: [
            ['ROC-AUC', '0.5942'],
            ['PR-AUC', '0.4593'],
            ['Brier', '0.2287'],
            ['Log loss', '0.6586'],
            ['ECE', '0.0204'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'Finding one — the calibration decision was reversed',
          body: 'Isotonic calibration appeared best until the selection protocol was corrected: it had been scored on its own fitting partition. Under the corrected protocol, raw XGBoost has lower ECE and no post-hoc calibration ships. The reversal is documented in the model card rather than quietly patched. Note that the model card and the current README disagree on this point — the README reflects the corrected protocol and is the later document.',
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'Finding two — a segment lookup table beats the model economically',
          body: 'The audit surfaced that a plain segment lookup earns ₹866.85 per opportunity against XGBoost\u2019s ₹857.05. The ML contribution to the economic result is slightly negative. Publishing this makes the actual claim precise and stronger: a modest response model combined with a correct incremental-economics layer and a deterministic policy gate beats both naive discounting and conversion-maximisation. The economics layer is doing the work, and saying so is more defensible than pretending otherwise.',
        },
        {
          type: 'table',
          caption: 'Where the model response is and is not learned (synthetic oracle)',
          prov: 'reported',
          head: ['Action family', 'Predicted vs true ΔP correlation'],
          rows: [
            ['Discounts', '≈0.48 — strongest'],
            ['Free shipping', '≈0.33'],
            ['Retries', '0.15 – 0.22 — weak'],
            ['PAYMENT_METHOD_SWITCH', '−0.046 — not learned'],
          ],
        },
        {
          type: 'callout',
          tone: 'caution',
          title: 'A known cost, stated as a cost',
          body: 'Because PAYMENT_METHOD_SWITCH response is not learned, the policy never selects it — despite it being genuinely effective for CARD_DECLINED failures. That costs real contribution. PAYMENT_LINK and HUMAN_ESCALATION are also never selected, so the effective action space is narrower than the nominal ten.',
        },
      ],
    },
    {
      id: 'evaluation',
      nav: 'Evaluation',
      title: 'Three streams, because one would be circular',
      blocks: [
        {
          type: 'quote',
          text: 'The simulator generates the data, the model trains on that data, and the oracle comes from the same simulator. A result measured only against the oracle is partly a measurement of how well the model recovered structure we injected ourselves.',
        },
        {
          type: 'steps',
          items: [
            { n: 'A', title: 'Observed held-out outcomes', meta: 'the factual floor', body: 'What actually happened on the newest 15% of opportunities under the logged historical policy — action taken, observed recovery, observed contribution. No counterfactual claims of any kind.' },
            { n: 'B', title: 'Off-policy evaluation', meta: 'the headline', body: 'Because every logged row stores P(action | context), the policy can be valued from logged data alone with no simulator involvement. IPS, SNIPS and Doubly Robust, with DR as the headline. This is what breaks the circularity of a model trained on its own generator and evaluated by that same generator.' },
            { n: 'C', title: 'Synthetic oracle', meta: 'labelled synthetic everywhere', body: 'The simulator holds P(recovery | context, action) for every action, enabling exact counterfactual regret, true incremental contribution and per-action ΔP error. Never presented as production causal lift.' },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The reward definition is load-bearing',
          body: 'The DR reward is net contribution in rupees — recovered contribution minus realised incentive cost minus fixed action cost — not binary recovery. A binary reward would silently reintroduce the conversion-maximising objective the entire project argues against, and would not be comparable to the business baseline table.',
        },
        {
          type: 'table',
          caption: 'Mandatory diagnostics reported alongside every off-policy estimate',
          prov: 'verified',
          head: ['Diagnostic', 'Value'],
          rows: [
            ['Kish effective sample size', '2,127 on the held-out fold'],
            ['Minimum logged propensity', '0.0196'],
            ['Maximum importance weight', '51'],
            ['Minimum per-action held-out support', '72'],
            ['Clipping sensitivity', 'unclipped / clip@20 / clip@10, always all three'],
            ['Propensity overlap', 'histogram reported'],
          ],
        },
        {
          type: 'prose',
          text: [
            'Weight clipping is never silent. If the estimate moves materially across the sensitivity rows, the overlap is inadequate and the result is reported as such rather than quoting the most flattering variant. An OPE point estimate without these diagnostics is not interpretable.',
          ],
        },
        { type: 'chart', id: 'revenueos-policies', caption: 'Net contribution per opportunity by policy (synthetic oracle, TEST). RevenueOS trails only the oracle-optimal policy.', prov: 'reported' },
        { type: 'chart', id: 'revenueos-conversion', caption: 'The same policies ranked by conversion instead. The conversion-maximising policy beats RevenueOS here — and earns less.', prov: 'reported' },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Losing on conversion is the demonstration',
          body: 'MODEL_CONVERSION_MAX converts at 45.60% against RevenueOS at 43.85%, and earns ₹806.15 against ₹838.48 per opportunity. Flat 10% converts better than doing nothing and earns ₹188 less. The project\u2019s scientific integrity rule is explicit: if RevenueOS fails to beat a baseline under any stream, report it and explain the mechanism — do not adjust the seed, split, threshold or simulator assumptions until the result improves.',
        },
      ],
    },
    {
      id: 'payments',
      nav: 'Payments',
      title: 'Five things that make this payments engineering rather than an API call',
      blocks: [
        {
          type: 'definitions',
          items: [
            { term: 'Signatures are computed over raw bytes', body: 'The body is read before any JSON parsing, and HMAC-SHA256 is keyed by the webhook secret with constant-time comparison. A test asserts that re-serialising the payload invalidates the signature. Invalid means 400, with no inbox row and no state change.' },
            { term: 'The browser callback is never trusted', body: 'Standard Checkout returns its own signature over order_id|payment_id, verified separately — but success UI alone never marks recovery. The interface literally reads "payment submitted — awaiting verified webhook" until a server-side event confirms it.' },
            { term: 'Deduplication is event-id based, not time-windowed', body: 'Enforced by UNIQUE(provider, event_id). Razorpay retries legitimately for up to 24 hours, so a strict timestamp window would reject valid deliveries. A duplicate returns 200 without reprocessing.' },
            { term: 'Acknowledge fast, process after', body: 'Razorpay requires a 2xx within 5 seconds. The handler verifies, persists, commits and returns; processing happens after that commit so slow work never blocks the acknowledgement.' },
            { term: 'Correlation is explicit, never guessed', body: 'Order of resolution is notes.execution_id, then order_id, then payment_id. No match produces UNMATCHED_WEBHOOK rather than a guess. The notes field carries IDs only — no customer data.' },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'Double-counting recovered revenue is structurally impossible',
          body: 'recovery_outcomes.opportunity_id is the PRIMARY KEY, so one opportunity has exactly one outcome row. Alongside it: recovery_executions.idempotency_key is UNIQUE, which makes duplicate orders from an API retry impossible, and audit_events (opportunity_id, sequence_number) is UNIQUE, which makes gaps or reordering in the trail impossible. These properties are not maintained by careful code — they are enforced by the schema.',
        },
        {
          type: 'prose',
          text: [
            'Reconciliation is semantic rather than arrival-ordered, because Razorpay does not guarantee webhook ordering. RECOVERED is absorbing: a late payment.failed is recorded as an AUDIT_CORRECTION and ignored for state. A failed payment moves to PAYMENT_FAILED_RECOVERABLE rather than directly to NOT_RECOVERED, because the same journey may still be captured.',
            'The idempotency key is committed before any external call is made, so a retry cannot produce a second order. An API timeout, 5xx or auth error produces EXECUTION_FAILED, never an invented success.',
          ],
        },
        {
          type: 'image',
          src: '/projects/revenueos/retry.svg',
          alt: 'Adaptive retry: new evidence reclassifies the blocker and the decision changes',
          caption: 'Adaptive retry. A provider failure between attempt one and attempt two reclassifies the blocker, the analysis reruns, and the second attempt carries a distinct idempotency key.',
          theme: 'dark',
          prov: 'reported',
        },
      ],
    },
    {
      id: 'commerce',
      nav: 'Agentic commerce',
      title: 'The same policy layer prices for an AI buyer',
      blocks: [
        {
          type: 'quote',
          text: 'The same contribution-margin arithmetic that decides whether a discount is worth offering decides what price a buyer agent may be quoted.',
        },
        {
          type: 'prose',
          text: [
            'An AI buyer states constraints in natural language, searches the catalog and requests a price. The merchant returns its reserve price — the lowest price at which every merchant policy still holds — with the binding constraint named. The reserve is solved in closed form from COGS, fulfilment cost, return rate and the policy file. Ask twice, get the same number, because there is no conversation in the arithmetic.',
          ],
        },
        {
          type: 'code',
          lang: 'text',
          file: 'live negotiation transcript',
          why: 'The rule ledger names which constraint binds, so a counter-offer is explainable rather than opaque. The margin floor passes; the percentage ceiling is what actually stops the buyer\u2019s request.',
          code: `buyer asks  ₹4,100   on a ₹5,019 SKU        (18.3% off)
merchant    COUNTER ₹4,769                   margin 34.2% · contribution ₹1,631

  PASS   RULE_AC_MARGIN_FLOOR               23.90 / 15     ← passes
  FAIL   RULE_AC_DISCOUNT_PERCENT_CEILING   18.31 / 7      ← binds
  FAIL   RULE_AC_DISCOUNT_AMOUNT_CEILING   919.00 / 300`,
        },
        {
          type: 'definitions',
          items: [
            { term: 'evaluate_offer() accepts no text parameter', body: 'A buyer agent\u2019s prose has no channel into pricing. A test asserts the function signature, so a future refactor cannot quietly open one. This is the same structural defence PolicyEngine.evaluate() uses on the recovery side.' },
            { term: 'COGS never crosses the API boundary', body: 'PublicProduct and ProductEconomics are separate objects. A buyer that could read cost of goods would compute the reserve exactly, and the negotiation would be theatre.' },
            { term: 'Two reserves, not one', body: 'reserve_hard is the lowest lawful price. reserve_autonomous is raised further so the discount also stays under the human-approval threshold — that is what gets quoted, so a counter the buyer accepts is always immediately executable. A request landing between the two is a genuine REQUIRE_APPROVAL: lawful, but not the agent\u2019s call.' },
            { term: 'The buyer\u2019s decision is arithmetic too', body: 'It accepts if and only if the total fits the budget it declared at the start. The model writes the sentence; it does not choose the answer.' },
          ],
        },
        {
          type: 'callout',
          tone: 'insight',
          title: 'The bridge is deliberately thin',
          body: 'POST /api/agent-commerce/checkout reimplements no payment code and adds no Razorpay surface. An agreed negotiation becomes an ordinary Opportunity in DETECTED carrying the negotiated economics — and from there the same predictor, policy engine and Razorpay path apply. In one continuous run: negotiate ₹4,769 → analyse → AUTHORIZED with DELAYED_RETRY → payment fails on a card decline → re-analyse, blocker reclassified → PAYMENT_METHOD_SWITCH → RECOVERED at ₹4,769 GMV and ₹1,629 contribution. An AI buyer negotiates, the policy engine bounds the counter-offer to protect margin, the payment fails, and the same recovery loop takes over — now constrained by the margin the negotiation already spent.',
        },
      ],
    },
    {
      id: 'limitations',
      nav: 'Limitations',
      title: 'What this does not establish',
      blocks: [
        {
          type: 'limitations',
          items: [
            {
              severity: 'critical',
              title: 'Synthetic environment throughout',
              detail: 'This is policy evaluation under a documented behavioural model, not measured real-world causal uplift. Public retail data calibrates only the order-value distribution shape and the customer-activity concentration curve — nothing about intervention response. Every response surface is a modelled assumption.',
              fix: 'A real-merchant pilot with a randomised holdout. Nothing short of that converts these numbers into causal claims.',
            },
            {
              severity: 'high',
              title: 'The ML contribution is small and slightly negative',
              detail: 'A segment lookup table earns ₹866.85 per opportunity against XGBoost\u2019s ₹857.05. The economics layer and the policy gate carry the result, not the model.',
              fix: 'Either improve action-response modelling — starting with PAYMENT_METHOD_SWITCH, which is not learned at all — or ship the lookup table and be explicit that the ML layer is not yet earning its place.',
            },
            {
              severity: 'high',
              title: 'The negotiation is not evaluated',
              detail: 'Bounds are verified by tests, but the pricing strategy is not, because the buyer agent is our own. "The buyer accepted" proves the price was lawful and within a declared budget — not that it was optimal. There is also no model of buyer utility.',
              fix: 'An independent buyer model, or a human study. Until then the claim stays limited to boundedness.',
            },
            {
              severity: 'medium',
              title: 'Off-policy estimates depend on overlap',
              detail: 'ESS and maximum importance weight are reported alongside every estimate, and thin per-action support is flagged rather than suppressed. The estimates remain assumption-dependent.',
              fix: 'A larger exploration cohort, or targeted exploration on the actions with the weakest held-out support.',
            },
            {
              severity: 'medium',
              title: 'No inventory reservation in the negotiation path',
              detail: 'Two concurrent negotiations for the last unit can both reach AGREED. Correct for a demo, wrong for production.',
              fix: 'A row-level hold on the SKU for the duration of a session — the first thing to add.',
            },
            {
              severity: 'medium',
              title: 'Webhook processing runs inline',
              detail: 'Processing happens after the acknowledgement commit rather than in a worker. Adequate at demo scale, not at production volume.',
              fix: 'Move processing to a queue consumer, keeping the acknowledge-fast property.',
            },
            {
              severity: 'low',
              title: 'SQLite by default, and a demo operator token',
              detail: 'The UNIQUE-constraint behaviour idempotency relies on is portable, but the concurrency test should be re-run against PostgreSQL. Human approval is a demo token rather than real RBAC.',
              fix: 'Re-run the concurrency suite on PostgreSQL; replace the token with proper role-based access control.',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'note',
          title: 'A known simulator tuning issue, recorded rather than patched',
          body: 'HUMAN_ESCALATION is selected as economics-max more often than a real merchant would tolerate, because its fixed cost is too cheap relative to its flat uplift. The recommended fix — raising the fixed cost toward ₹120–150 or making the uplift depend on cart value — is written down in the simulator documentation rather than silently applied, per the project\u2019s integrity rule.',
        },
      ],
    },
  ],
};