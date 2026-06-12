# Expense Tracker — Improvement Plan

**Date:** 2026-06-12
**Status:** Proposed (not yet started)
**Scope:** Expense Tracker only (records, income, budgets, categories, analytics).
**Parent doc:** [product-improvement-plan.md](product-improvement-plan.md) — app-wide plan. This doc supersedes its expense-tracker sections with a deeper, market-benchmarked version.

---

## 1. Competitive reality check (June 2026)

Benchmarked against the current market leaders before planning:

| App | Model | Price | Wins on | Weak on |
|---|---|---|---|---|
| **YNAB** | Zero-based, manual-leaning | $109/yr | Envelope discipline, "give every dollar a job" | No subscription auto-detection, steep learning curve |
| **Monarch** | Bank-sync, passive | $99.99/yr | Account aggregation, household/couples | Less habit-forming, US-centric |
| **Copilot** | Bank-sync + AI | $95/yr | AI auto-categorization, beautiful trends/viz | Apple-centric, passive observer model |
| **Monefy / Money Manager** (Play Store mass market) | Manual | Freemium | Fast entry, simple | Shallow insights, no goals, ad-heavy |

**Two structural facts shape everything below:**

1. **Tracero is manual-entry in an automated world.** Industry data: automated/bank-synced apps see ~40–68% higher retention; the average manual log takes ~45 seconds; most manual-tracker users quit within weeks because of entry friction. Tracero cannot do bank sync (infra, cost, region). Therefore entry speed is not a feature — it is *the* survival requirement. **Hard target: log a typical expense in ≤ 5 seconds / ≤ 3 taps.**
2. **Tracero's counter-positioning is real:** free (incumbents charge $95–109/yr), manual-as-intentional ("you feel every expense" — an actual 2026 niche), and the only one with habit goals + budget + IOU in one product. The plan leans into these instead of imitating bank-sync apps.

**What we deliberately do NOT chase:** bank sync, AI/LLM categorization (cost), investment tracking, household sharing. Monarch/Copilot win those; competing there is unwinnable from this codebase.

---

## 2. Current state — honest scorecard

| Capability | State | vs. market bar |
|---|---|---|
| Monthly budget + per-category allocations, virtual unbudgeted rows | ✅ Shipped, good | At or above mass-market; the "unallocated" footer is proto-YNAB |
| Pace indicator, daily allowance, left-to-spend hero | ✅ Shipped | Above average |
| Entry UX | Calculator input, category dropdown, optional date/note — dialog/sheet | ~4 interactions; **far from the ≤5s bar** |
| Recurring transactions | ❌ None | Below table stakes |
| Income records | Append-only; no list/edit/delete, aggregate display only | **Data-integrity bug** — a mistyped salary is permanently stuck |
| History | One month at a time; no search, no filters, no pagination | Below table stakes |
| Charts | None (custom CSS bars only for budget) | Below average |
| Insights | 3 hardcoded dummy strings on dashboard | Fake — worse than absent |
| Currency | ✅ Fixed 2026-06-13 — locale-detected at signup, persisted, editable in Preferences, symbol dynamic everywhere | Done (E2.2) |
| Export | Dead button | Broken promise in UI |
| Subscriptions | Category exists; no detection/view | Gap — and notably YNAB lacks this too (exploitable) |
| Categories | 10 defaults, emoji-mapped; schema supports custom but no UI | Adequate for v1 |

---

## 3. Self-review notes (what changed vs. the parent plan)

- **Hosting assumption (decision 2026-06-13):** plan assumes fast, paid hosting at deployment — do NOT design around free-tier cold starts. Optimistic UI is kept as a snappiness nicety, not survival infrastructure.
- **Reinstated category prediction in a corrected form.** First plan killed keyword prediction (note is typed after category — nothing to predict from). The working version is **learned merchant memory**: per-user `note keyword → category` mappings learned from past entries, applied as a default on repeat logs. No AI cost; mimics Copilot's auto-categorization for the entries that dominate real usage (repeats).
- **Added habit infrastructure:** daily log reminder / end-of-day nudge. Research is unanimous that consistency, not accuracy, is where manual trackers die; the first plan had streaks but no trigger mechanism.
- **Leaned into zero-based budgeting instead of inventing mechanics.** The existing unallocated footer ≈ YNAB's "to be budgeted." Surfacing it harder + an optional "allocate every taka/dollar" flow borrows a loved mental model for near-zero engineering cost.
- **Confirmed unchanged after review:** lazy-materialized recurring (no cron — hosting sleeps), subscriptions view (YNAB's known gap), income CRUD as an integrity fix, custom CSS/SVG charts (design-system + RN-portability), CSV export, aggregation-dressed-as-insight.

---

## 4. The plan — four phases

Ordered by retention impact. E = effort (S/M/L).

---

### Phase E1 — Make logging instant *(survival tier)*

> Target: typical repeat expense logged in ≤ 5 seconds / ≤ 3 taps.

| # | Item | E | Detail |
|---|---|---|---|
| E1.1 | **Optimistic UI on add/edit** | S | On submit: update local state immediately, close the sheet, toast success; sync the API call in background with rollback + retry toast on failure. (Today every mutation blocks on a full re-fetch — noted as a known gap in the redesign spec.) |
| E1.2 | **"Log again" quick-repeat** | S | One tap on any recent record (records list, dashboard recents) pre-fills amount/category/note, dated now. Edit-before-save optional. Most users repeat the same 5–10 expenses. |
| E1.3 | **Category-first tile grid** | S | Replace dropdown in `ExpenseAdder` with emoji tile grid **ranked by user's frequency/recency** (computable client-side from month records). Tap tile → amount → save. |
| E1.4 | **Learned merchant memory** | M | Per-user mapping of note keywords → category, built from past records (server endpoint or client cache). When a note matches, pre-select category on next entries. No AI, no cost. |
| E1.5 | **Last-used defaults** | S | Default category = last used; amount field auto-focused with numpad open. |
| E1.6 | **Daily nudge** | S/M | Evening "anything to log today?" reminder. Web: opt-in push or visible streak prompt on open; full push lands with the RN app. Pairs with streaks (E4.3). |

**Definition of done:** stopwatch test — repeat expense from app-open to saved in ≤5s on mobile.

---

### Phase E2 — Trust the numbers *(integrity tier)*

| # | Item | E | Detail |
|---|---|---|---|
| E2.1 | **Income list / edit / delete** | M | Endpoints: `GET` month income records, `PATCH /:id`, `DELETE /:id`. UI: income entries in the records list (tab or inline with distinct styling), same detail-sheet pattern as expenses. *Bug-class fix: today a mistyped salary permanently corrupts every balance.* |
| E2.2 | **Persisted preferences + currency** | M | ✅ **Shipped 2026-06-13** (currency portion). `preferences.currency` on User; `GET/PUT /v1/user/preferences`; signup auto-detects currency from browser locale (`navigator.language` region → currency, fallback USD); Preferences tab saves with optimistic rollback; `utils/currency.ts` + `useCurrency` hook replaced every hardcoded `$` (15 supported currencies). Remaining: `emailNotifications` preference persistence. |
| E2.3 | **CSV export** | S | `GET /v1/expenses/export?from&to` → expenses + income CSV. Wire the dead "Export Data" button. Trust feature: "your data isn't hostage" — sharper given competitors charge $100/yr. |
| E2.4 | **Income source breakdown** | S | Per-source totals in Month Glance (depends E2.1). |

---

### Phase E3 — Automate the predictable *(recurring + subscriptions)*

| # | Item | E | Detail |
|---|---|---|---|
| E3.1 | **`RecurringRule` model** | M | `userId, kind (expense/income), amount, categoryId/source, note, frequency (weekly/monthly), anchorDay, nextRunDate, isActive`. |
| E3.2 | **Lazy materialization** | M | On `GET /expenses/details` + dashboard summary: materialize due records (`nextRunDate <= now`), advance pointer. Idempotent; survives sleeping hosting (no cron). Records carry `recurringRuleId`, remain individually editable. Careful with month-end anchors + the UTC `getMonthBoundaries` logic. |
| E3.3 | **Mark-as-recurring UI** | S | Checkbox + frequency in `ExpenseAdder`/`IncomeAdder`; rules management list (pause/edit/delete). |
| E3.4 | **Subscriptions view** | S | "$43/mo across 6 subscriptions" from rules + Subscriptions category. Screenshot-worthy; a known YNAB gap. |

---

### Phase E4 — See and feel progress *(insight + habit tier)*

| # | Item | E | Detail |
|---|---|---|---|
| E4.1 | **Real insights (kill the dummies)** | M | Server-computed, aggregation-dressed-as-intelligence: "Food 32% above last month", "Entertainment 4 weekends straight", "At this pace you end June $120 over" (pace already computed — one step further). 3–5 rules, ranked by relevance; replaces the hardcoded dashboard strings. |
| E4.2 | **History: search, filters, ranges** | M | Note text search + category filter on records; `from/to` ranges beyond one month; yearly per-month summary; pagination once ranges exceed a month. |
| E4.3 | **Streaks + celebrations** | M | Logging streak + under-budget month streak, server-computed from record dates. Dashboard header already has the streak TODO. Confetti on an under-budget month close. Powered by E1.6 nudges. |
| E4.4 | **Two charts, custom-rendered** | M | (a) Daily spend bars for the month with the pace line overlaid; (b) 6-month spend-vs-income trend. Server computes series; client renders CSS/SVG in the existing design language — **no chart library** (color-budget compliance + RN portability). |
| E4.5 | **Zero-based mode (opt-in)** | S | Lean into the existing unallocated footer: prominent "you have $X unallocated — give it a job" prompt + one-tap allocate-remainder flow. YNAB's mental model, near-zero new mechanics. |
| E4.6 | **Budget alert email** | S | Honor the existing `alertThreshold` field: one email per budget per month when a write crosses it (Resend wired; gate on E2.2 preference). |

---

## 5. Explicitly rejected / deferred

| Idea | Verdict | Why |
|---|---|---|
| Bank sync / SMS parsing | **Rejected** | Infra/compliance heavy, region-dependent; Monarch/Copilot own this. Our wedge is fast intentional logging. |
| AI/LLM categorization | **Rejected for now** | Recurring cost per log; learned merchant memory (E1.4) captures most of the value free. |
| Voice entry | **Deferred** | Trendy in 2026 but web speech APIs are uneven; revisit with the RN app where it shines. |
| Chart library (Recharts/Victory) | **Rejected** | Violates design-system color budget; hurts RN portability. Custom CSS/SVG instead. |
| YNAB-style envelope rollover | **Rejected** | Fights the independent-months model. Month-end surplus → goal sweep (app-wide plan, Phase 6) gives the payoff. |
| Multi-currency conversion | **Deferred** | Single persisted currency (E2.2) covers the real need. |
| Receipt attachments | **Deferred** | Cheap (Cloudinary wired) but low pull vs. the tiers above; add on user demand. |
| Tags / payment method / split transactions / custom categories UI | **Deferred** | Schema-ready or small adds; introduce alongside E4.2 filters only if asked. |
| Multi-account / wallets / shared budgets | **Deferred** | Post single-player retention. |

---

## 6. Positioning statement (informs copy + landing page)

> **Tracero is the free, intentional expense tracker.** No bank logins, no $100/year subscription, no passive feed of transactions you never look at. You log in five seconds, you feel every expense, and your budget connects to your actual goals — including who owes you money.

---

## 7. Cross-cutting requirements

- **Mobile-first**, desktop adapts.
- **RN portability:** outbox/sync util, merchant-memory logic, formatters, insight types all framework-agnostic (hooks/utils, no DOM). No new DOM-coupled deps.
- **Design system:** strict color budget, divider-list patterns, type/button scales per `client/docs/DESIGN_SYSTEM.md` + `client/plans/redesign_expense_tracker.md`.
- **Per-phase implementation specs** in `client/plans/` before building (existing convention).

## 8. Success measures

| Phase | Watch |
|---|---|
| E1 | Median seconds/taps to log; logs per active user per week; week-2 logging retention |
| E2 | Preference saves; exports; income edits (proves the bug mattered) |
| E3 | % users with ≥1 rule; subscription view repeat visits |
| E4 | D30 retention; streak length distribution; insight tap-through |

## 9. Sources (market benchmarks)

- [Engadget — Best budgeting apps 2026](https://www.engadget.com/apps/best-budgeting-apps-120036303.html)
- [NerdWallet — Best budget apps](https://www.nerdwallet.com/finance/learn/best-budget-apps)
- [Monarch vs YNAB comparison](https://www.monarch.com/compare/ynab-alternative)
- [Copilot Money review 2026](https://www.thepennyhoarder.com/budgeting/budgeting-copilot-money-review/)
- [Why expense-tracking apps don't work — Lemon](https://lemonapp.app/education/why-so-many-expense-tracking-apps-dont-actually-work/)
- [Manual tracking benefits (intentional-tracking positioning)](https://pocketclear.app/blog/manual-expense-tracking-benefits.html)
- [AI vs manual expense tracking — Finny](https://getfinny.app/blog/ai-expense-tracking-vs-manual)
