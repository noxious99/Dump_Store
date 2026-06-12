# Tracero — Product Improvement Plan

**Date:** 2026-06-12
**Status:** Proposed (not yet started)
**Scope:** Whole app, with deep focus on the Expense Tracker

---

## 1. Where the product stands

Tracero has three pillars: **Expense Tracker** (fully built), **Goal Tracker** (backend complete, no page), **IOU Tracker** (backend complete, no page). Auth, profile, dark mode, and the redesigned dashboard/expense-tracker UI are solid.

The core product problem is **not missing features — it's the gap between what's built and what's visible**:

| Issue | Evidence | User impact |
|---|---|---|
| 2 of 3 pillars have no page | `GoalsSummaryCard` links to `/goals-tracker`, `IouSummaryCard` references `/iou-tracker` — neither route exists | Dead-end clicks on the dashboard |
| Visible fake data | Dashboard Smart Insights are 3 hardcoded strings; profile stats (goals/expenses/IOU counts) are hardcoded | Numbers never change → app reads as broken |
| Settings that don't save | Currency + email-notification toggles in Preferences persist nowhere; "Export Data" button is dead | Erodes trust |
| Dormant backend capability | `alertThreshold` on budgets never triggers anything; full goals/IOU APIs unused | Built value delivering zero |
| Dead code | Posts (social feed + voting) and Notes routes have no frontend | Attack surface, maintenance noise |
| No email verification on signup | Resend is wired for password reset only | Account security + blocks future email features |
| No onboarding/empty states designed | New user lands on a mostly-empty dashboard | Weak first-session experience |

**Guiding principle for this plan: finish before extending.** Every phase below either closes a built-but-invisible gap or attacks the two things that decide expense-tracker retention: logging speed and insight quality.

---

## 2. Self-review notes (what changed from the initial analysis)

Recorded so future-us knows why the plan looks this way:

- **Dropped** keyword-based category prediction as a priority — the note field is typed *after* (and optionally) the category, so there's nothing to predict from. Replaced with frequency/recency-ranked category selection.
- **Changed** recurring transactions from cron-job to **lazy materialization** — the server runs on sleep-prone hosting (see `_keepwarm` health endpoint), so scheduled jobs are unreliable. Due recurring records get materialized when month details are fetched.
- **Changed** charts from "add Recharts/Victory" to **server-computed series + custom CSS/SVG bars** — consistent with the design system's strict color budget and custom progress bars, and keeps the UI layer RN-portable.
- **Merged** budget rollover into goal-linking — full YNAB envelope rollover fights the data model (independent months, unique `(userId, month, year)` index). "Sweep month-end surplus into a goal" gives the same payoff with far less complexity.
- **Promoted** income record management from feature gap to **data-integrity bug** — income is append-only with no list/edit/delete, so one mistyped salary permanently corrupts every balance figure.
- **Added** the missing dependency: persisted **user preferences** must land before currency display, budget alert emails, or notification toggles can work.

---

## 3. The plan — six phases

Phases are ordered by (impact ÷ effort) and by dependency. Each phase is shippable on its own.

---

### Phase 1 — Finish the triangle *(highest ROI: backends already exist)*

> Goal: no dead ends, no fake numbers. The app honestly shows what it does.

| # | Item | Notes |
|---|---|---|
| 1.1 | **Build `/iou-tracker` page** | Full backend exists: CRUD, partial settlements (`/settle`), cancel, per-person summary, overdue virtuals. UI: list with status filters (pending/partial/settled), per-person grouping, settle flow (full + partial), add IOU sheet. This is the most differentiated feature in the app — almost no mainstream tracker does "who owes whom" well. |
| 1.2 | **Build `/goals-tracker` page** | Backend exists: goals CRUD, tasks (Daily/Weekly/Monthly) with `completedDates` toggle. UI: goal list with progress, goal detail with task check-off, create/edit flows. |
| 1.3 | **Real profile stats** | Replace hardcoded goals/expenses/IOU counts with a small `GET /v1/user/stats` (or extend `/profile`). |
| 1.4 | **Remove dead code** | Delete Posts + Notes routes/controllers/schemas (or archive on a branch). |
| 1.5 | **Empty states** | Designed empty states for dashboard cards and both new pages — first-session experience for new users. |

**Dependencies:** none. **Risk:** low.

---

### Phase 2 — Expense entry speed *(the #1 retention lever for trackers)*

> Goal: logging a typical expense takes ≤ 2 interactions. The habit is the product.

| # | Item | Notes |
|---|---|---|
| 2.1 | **"Log again" quick-repeat** | One tap on any recent expense (record list / dashboard recent) pre-fills amount + category + note, dated today. Most users repeat the same 5–10 expenses. |
| 2.2 | **Category-first entry grid** | Replace the dropdown with a tappable emoji-tile grid in `ExpenseAdder`, **sorted by the user's usage frequency/recency** (server returns ranked categories, or client computes from the month's records). Tap tile → type amount → done. |
| 2.3 | **Remember last-used category** | Default the form to the last category used. |
| 2.4 | *(nice-to-have)* Note keyword → category suggestion | Only fires if user types a note before picking a category. Simple keyword map, client-side. |

**Dependencies:** none. **Risk:** low — pure client work except optional ranked-category endpoint.

---

### Phase 3 — Recurring transactions + subscriptions view

> Goal: rent, salary, and subscriptions track themselves.

| # | Item | Notes |
|---|---|---|
| 3.1 | **Recurring rule schema** | New `RecurringRule` model: `userId, kind (expense/income), amount, categoryId/source, note, frequency (monthly/weekly), anchorDay, nextRunDate, isActive`. |
| 3.2 | **Lazy materialization** | On `GET /expenses/details` (and dashboard summary), materialize any due records (`nextRunDate <= now`), advance `nextRunDate`. Idempotent; no cron/scheduler needed — works on sleep-prone hosting. Materialized records get a `recurringRuleId` ref so they're editable/deletable like normal records. |
| 3.3 | **UI: mark-as-recurring** | Checkbox + frequency in `ExpenseAdder`/`IncomeAdder`; manage list (pause/edit/delete rules) — a section in expense tracker or profile. |
| 3.4 | **Subscriptions view** | "You pay $43/mo across 6 subscriptions" — derived from recurring rules + Subscriptions category. Shareable, screenshot-worthy. |

**Dependencies:** none, but 3.4 depends on 3.1–3.3. **Risk:** medium — date math (month-end anchors, timezone vs `getMonthBoundaries` UTC logic) needs care.

---

### Phase 4 — Trust the data: income parity, preferences, currency, export

> Goal: every number is correctable, every setting persists, data isn't hostage.

| # | Item | Notes |
|---|---|---|
| 4.1 | **Income records: list / edit / delete** | *Data-integrity fix.* Endpoints: `GET` income list for month, `PATCH /:id`, `DELETE /:id`. UI: income entries appear in the records list (or a toggle tab) with the same detail-sheet edit pattern as expenses. |
| 4.2 | **Persist user preferences** | ✅ Partially shipped 2026-06-13: `preferences.currency` subdocument + `GET/PUT /v1/user/preferences`, Preferences tab wired. Remaining: `emailNotifications` persistence. |
| 4.3 | **Currency display** | ✅ Shipped 2026-06-13. Locale-detected at signup, single currency per user, dynamic symbol via `utils/currency.ts` + `useCurrency` across all money displays. Note: IOU schema's own `currency` field still defaults to USD — align when the IOU page is built. |
| 4.4 | **CSV export** | `GET /v1/expenses/export?from&to` → CSV of expenses + income. Wire the dead "Export Data" button. Trust feature + cheap. |
| 4.5 | **Email verification on signup** | Resend is already configured; mirrors the password-reset token flow. |

**Dependencies:** 4.3 needs 4.2. **Risk:** low.

---

### Phase 5 — History depth: search, filters, trends

> Goal: answer "how much have I spent on X this year?" and "when did I buy that?"

| # | Item | Notes |
|---|---|---|
| 5.1 | **Filter & search on records** | Category filter + text search on notes within `GET /expenses/details` (regex is fine at current data scale); client filter bar above `ExpenseRecordsList`. |
| 5.2 | **Custom date ranges / yearly view** | Extend the details endpoint to accept `from/to` instead of only month; add a year summary (per-month totals). Add pagination (`limit/skip`) once ranges exceed a month. |
| 5.3 | **Daily spend chart** | Server returns per-day totals for the month; client renders **custom CSS/SVG bars** (no chart library — consistent with design system, RN-portable) with the existing pace line concept overlaid. |
| 5.4 | **6-month trend** | Per-month spend vs income mini-chart, same custom rendering approach. |
| 5.5 | **Income by source breakdown** | Small addition to Month Glance once 4.1 exists. |

**Dependencies:** 5.5 needs 4.1. **Risk:** low-medium (aggregation work).

---

### Phase 6 — Differentiators: insights, goal-linking, streaks, alerts

> Goal: feel smarter than the average Play Store tracker. Tracero's edge is **habit goals + budget + IOU in one place** — lean into the integration.

| # | Item | Notes |
|---|---|---|
| 6.1 | **Real Smart Insights** | Replace the 3 hardcoded dashboard insights with server-computed ones. Start with aggregations dressed as intelligence: "Food is 32% higher than last month", "Entertainment 4 weekends in a row", "At this pace you'll end the month $120 over budget" (pace is already computed — this is one step further). Ship 3–5 insight rules, rotate by relevance. |
| 6.2 | **Budget ↔ Goal linking + surplus sweep** | A goal can have a financial target (`targetAmount, fundedAmount`). At month close (lazy-evaluated on first visit of the new month), offer: "You closed June $80 under budget — add it to *Japan Trip*?" This **replaces YNAB-style rollover** — same payoff, fits the independent-months data model, and makes budgeting feel like progress instead of punishment. |
| 6.3 | **Streaks + celebrations** | Logging streak ("12-day streak") and under-budget month streak. Dashboard header already has the streak-badge TODO. Confetti on milestone/under-budget month (roadmap item). Streak computation server-side from record dates. |
| 6.4 | **Budget alert emails** | Honor the existing `alertThreshold` field: when a write pushes spend past the threshold, send one email per month per budget (Resend is wired). Gate on the 4.2 notification preference. |
| 6.5 | **Overdue IOU nudges** | "Rahim's payback was due 5 days ago" — dashboard insight first; email later. |

**Dependencies:** 6.2 needs Phase 1 goals page; 6.4 needs 4.2. **Risk:** medium — insight quality needs tuning to avoid feeling gimmicky.

---

## 4. Explicitly deferred (decided against for now)

| Feature | Why deferred |
|---|---|
| Multi-currency conversion | Single persisted currency covers the real need; conversion adds rate-feed complexity for little value at this stage |
| Multi-account / wallets | High complexity; the wedge is habit + goals, not aggregation |
| Bank sync / SMS parsing | Infra + compliance heavy; revisit post-RN app |
| Shared/family budgets | Needs invites, permissions, sync — not before single-player retention is strong |
| Full YNAB envelope rollover | Replaced by 6.2 surplus-sweep |
| Receipt attachments | Cloudinary/multer make it cheap, but low pull vs Tier 1–2 items; slot after Phase 6 if requested |
| Tags + payment method fields | Small schema additions; add alongside 5.1 filters only if users ask |
| Custom categories UI | Schema supports it (`userId` on Category); add when the default 10 prove insufficient |

---

## 5. Cross-cutting requirements (apply to every phase)

- **Mobile-first** — every new screen designed for mobile first; desktop is the adaptation.
- **RN portability** — business logic, API calls, types in framework-agnostic files (hooks/utils, not JSX); no new DOM-coupled libraries (this killed the chart-library idea).
- **Design system compliance** — strict color budget, existing type/button scales, divider-list patterns per `client/docs/DESIGN_SYSTEM.md` and `client/plans/redesign_expense_tracker.md`.
- **Per-feature specs** — before building a phase, write an implementation spec in `client/plans/` (existing convention).

---

## 6. Suggested success measures

| Phase | What to watch |
|---|---|
| 1 | Dashboard → IOU/Goals click-through actually lands somewhere; pages get repeat visits |
| 2 | Median time/taps to log an expense; expenses logged per active user per week |
| 3 | % of users with ≥1 recurring rule; subscription view visits |
| 4 | Preference save rate; export usage; income edit usage (proves the bug mattered) |
| 5 | Search/filter usage; chart interaction |
| 6 | D30 retention; streak length distribution; goal-funding events per month |
