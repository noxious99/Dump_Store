const crypto = require('crypto');

const expenseService = require('./expenseServices');
const goalService = require('./goalService');
const iouService = require('./iouService');
const iouRepository = require('../db/iou');
const gemini = require('../utils/geminiClient');
const AiInsight = require('../Schemas/aiInsightSchema');

// Insights are regenerated when the data changes (inputHash) or when the cache
// ages past this TTL — whichever comes first. The TTL keeps time-relative
// phrasing ("5 days left", "owed for 3 weeks") from drifting stale.
const TTL_MS = Number(process.env.INSIGHTS_TTL_MS) || 12 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_INSIGHTS = 4;

// The client swaps this token for the user's currency symbol (same convention
// as the analytics sheet), so amounts stay correct per user.
const CUR = '¤';
const money = (n) => `${CUR}${Math.round(n).toLocaleString('en-US')}`;
const round = (n) => Math.round(n || 0);
const daysBetween = (from, to) => Math.round((to - from) / DAY_MS);


// ── Snapshot ─────────────────────────────────────────────
// A compact, cross-domain picture of the user's finances, goals and IOUs.
// Doubles as the LLM prompt input and the fallback engine's source data.

const gatherSnapshot = async (userId) => {
    const [analytics, extras, goalsRes, iouSummary, ious] = await Promise.all([
        expenseService.getAnalytics(userId, 'this-month'),
        expenseService.getInsightExtras(userId).catch(() => ({})),
        goalService.getUserGoals(userId).catch(() => ({ goals: [] })),
        iouService.getDashboardSummary(userId).catch(() => null),
        iouRepository.findIousByUser(userId, {}).catch(() => []),
    ]);

    const now = Date.now();
    const nowDate = new Date(now);
    const daysInMonth = new Date(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 0).getUTCDate();
    const daysLeftInMonth = Math.max(daysInMonth - nowDate.getUTCDate(), 0);

    // ── Expense ──
    const totals = analytics.totals || { spend: 0, income: 0, balance: 0 };
    const expense = {
        spend: round(totals.spend),
        income: round(totals.income),
        balance: round(totals.balance),
        budget: round(analytics.budget),
        daysLeftInMonth,
        topCategories: (analytics.categories || []).slice(0, 5)
            .map((c) => ({ name: c.name, amount: round(c.total), pct: c.pct })),
        // Rule-based observations, already grounded in real numbers and
        // ¤-tokenized. We hand these to the LLM as trustworthy raw material.
        observations: (analytics.insights || []).map((i) => i.text),
        // Enriched signals: weekday/weekend rhythm, category movement vs last
        // month, and bills due in the next 7 days (null when not meaningful).
        spendingPattern: extras.spendingPattern ?? null,
        categoryTrends: extras.categoryTrends ?? [],
        upcomingBills: extras.upcomingBills ?? null,
        hasData: round(totals.spend) > 0 || round(totals.income) > 0,
    };

    // ── Goals ──
    const allGoals = goalsRes.goals || [];
    const activeGoals = allGoals.filter((g) => !g.isCompleted);
    const goals = {
        activeCount: activeGoals.length,
        completedCount: allGoals.filter((g) => g.isCompleted).length,
        items: activeGoals.slice(0, 5).map((g) => {
            const tasksTotal = g.progress?.tasksTotal ?? 0;
            const tasksDone = g.progress?.tasksStarted ?? 0;
            const timePct = g.progress?.pct ?? 0;
            const taskPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : null;
            return {
                title: g.title,
                daysToTarget: g.targetDate ? daysBetween(now, new Date(g.targetDate).getTime()) : null,
                timeElapsedPct: timePct,
                tasksDone,
                tasksTotal,
                // True when task progress trails the timeline by a clear margin.
                behindPace: taskPct !== null && tasksTotal > 0 && taskPct + 15 < timePct,
            };
        }),
        hasData: allGoals.length > 0,
    };

    // ── IOU ──
    const pending = (ious || []).filter((i) => i.status === 'pending' || i.status === 'partial');
    const people = (iouSummary?.people || []).map((p) => {
        const theirs = pending.filter((i) => i.counterpartyName === p.name);
        const oldest = theirs.reduce(
            (min, i) => Math.min(min, new Date(i.transactionDate).getTime()),
            now
        );
        return {
            name: p.name,
            net: round(p.net),                       // + they owe you, − you owe them
            daysOutstanding: theirs.length ? Math.max(daysBetween(oldest, now), 0) : 0,
        };
    });
    const iou = {
        owedToYou: round(iouSummary?.owedToYou),
        youOwe: round(iouSummary?.youOwe),
        net: round(iouSummary?.net),
        pendingCount: iouSummary?.pendingCount ?? 0,
        people,
        hasData: (iouSummary?.pendingCount ?? 0) > 0,
    };

    return { expense, goals, iou };
};

// Hash only the stable signals (amounts, counts, progress) — NOT time-relative
// fields like daysToTarget, which drift daily and would needlessly bust the
// cache. Time freshness is handled by the TTL instead.
const hashSnapshot = (s) => {
    const sig = JSON.stringify({
        spend: s.expense.spend, income: s.expense.income, budget: s.expense.budget,
        cats: s.expense.topCategories.map((c) => [c.name, c.amount]),
        goals: s.goals.items.map((g) => [g.title, g.timeElapsedPct, g.tasksDone, g.tasksTotal]),
        goalCounts: [s.goals.activeCount, s.goals.completedCount],
        iou: [s.iou.owedToYou, s.iou.youOwe, s.iou.pendingCount],
    });
    return crypto.createHash('sha1').update(sig).digest('hex');
};


// ── Fallback engine (no AI) ──────────────────────────────
// Used when Gemini is unavailable or returns nothing usable. Produces a
// cross-domain mix from the same snapshot, reusing the rule-based expense
// observations and templating goal/IOU lines.

const TONE_EMOJI = { good: '✅', warn: '⚠️', neutral: '💡' };

const expenseFallback = (e) => {
    if (!e.hasData) {
        return [{ text: 'Log your first expense to start seeing where your money goes.', emoji: '💸', tone: 'neutral', domain: 'expense' }];
    }

    const candidates = [];

    // Bills landing this week are time-relative and actionable — lead with them.
    if (e.upcomingBills && e.upcomingBills.total > 0) {
        const b = e.upcomingBills;
        candidates.push({
            text: `${money(b.total)} in recurring ${b.count === 1 ? 'bill is' : 'bills are'} due in the next 7 days — plan for it.`,
            emoji: '📅', tone: 'neutral', domain: 'expense',
        });
    }

    // Weekend rhythm, when it's clearly heavier than weekdays.
    const sp = e.spendingPattern;
    if (sp && sp.weekdayAvgPerDay > 0 && sp.weekendAvgPerDay > sp.weekdayAvgPerDay * 1.5) {
        const x = (sp.weekendAvgPerDay / sp.weekdayAvgPerDay).toFixed(1);
        candidates.push({
            text: `Your weekend spending runs about ${x}× your weekdays — a weekend cap could help.`,
            emoji: '⚡', tone: 'warn', domain: 'expense',
        });
    }

    // Fill the rest from the rule-based observations — they're already sharp.
    e.observations.forEach((text) => candidates.push({ text, emoji: '📊', tone: 'neutral', domain: 'expense' }));

    return candidates.slice(0, 2);
};

const goalFallback = (g) => {
    if (!g.hasData) {
        return { text: 'Set a goal to give your ambitions a deadline — it makes them stick.', emoji: '🎯', tone: 'neutral', domain: 'goals' };
    }
    const behind = g.items.find((it) => it.behindPace);
    if (behind) {
        return { text: `'${behind.title}' is falling behind pace — ${behind.tasksDone}/${behind.tasksTotal} tasks done. A small push helps.`, emoji: '🔥', tone: 'warn', domain: 'goals' };
    }
    const soon = g.items
        .filter((it) => it.daysToTarget !== null && it.daysToTarget >= 0)
        .sort((a, b) => a.daysToTarget - b.daysToTarget)[0];
    if (soon) {
        return { text: `'${soon.title}' is due in ${soon.daysToTarget} ${soon.daysToTarget === 1 ? 'day' : 'days'}. Keep chipping away.`, emoji: '🎯', tone: 'neutral', domain: 'goals' };
    }
    return { text: `You're tracking ${g.activeCount} active ${g.activeCount === 1 ? 'goal' : 'goals'} — staying consistent is what counts.`, emoji: '🎯', tone: 'good', domain: 'goals' };
};

const iouFallback = (i) => {
    if (!i.hasData) return null; // nothing pending — don't nag
    const aged = i.people
        .filter((p) => p.net > 0 && p.daysOutstanding >= 14)
        .sort((a, b) => b.daysOutstanding - a.daysOutstanding)[0];
    if (aged) {
        return { text: `${aged.name} has owed you ${money(aged.net)} for ${aged.daysOutstanding} days — a friendly nudge usually works.`, emoji: '🤝', tone: 'warn', domain: 'iou' };
    }
    if (i.net > 0) {
        return { text: `You're owed ${money(i.owedToYou)} across ${i.pendingCount} open ${i.pendingCount === 1 ? 'IOU' : 'IOUs'}.`, emoji: '🤝', tone: 'neutral', domain: 'iou' };
    }
    if (i.net < 0) {
        return { text: `You owe ${money(i.youOwe)} in total — settling the oldest first keeps things tidy.`, emoji: '🤝', tone: 'neutral', domain: 'iou' };
    }
    return null;
};

const buildFallbackInsights = (snapshot) => {
    const out = [
        ...expenseFallback(snapshot.expense),
        goalFallback(snapshot.goals),
        iouFallback(snapshot.iou),
    ].filter(Boolean);

    // Brand-new user with nothing anywhere — onboarding trio.
    const final = (!snapshot.expense.hasData && !snapshot.goals.hasData && !snapshot.iou.hasData)
        ? [
            { text: 'Log your first expense to start seeing where your money goes.', emoji: '💸', tone: 'neutral', domain: 'expense' },
            { text: 'Set a goal to give your ambitions a deadline — it makes them stick.', emoji: '🎯', tone: 'neutral', domain: 'goals' },
            { text: 'Lent or borrowed money? Track it so nothing slips through the cracks.', emoji: '🤝', tone: 'neutral', domain: 'iou' },
        ]
        : out.slice(0, MAX_INSIGHTS);

    return final.map((ins, i) => ({ ...ins, id: `fb-${i}` }));
};


// ── AI generation ────────────────────────────────────────

const RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        insights: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    emoji: { type: 'string' },
                    tone: { type: 'string', enum: ['good', 'warn', 'neutral'] },
                    domain: { type: 'string', enum: ['expense', 'goals', 'iou', 'general'] },
                },
                required: ['text', 'emoji', 'tone', 'domain'],
            },
        },
    },
    required: ['insights'],
};

const SYSTEM_PROMPT = `You are the insight engine for Tracero, a personal finance + goals + IOU app. You speak to the user like a sharp, warm friend who happens to be great with money — encouraging, never preachy, never robotic.

Write 3-4 short insights from the user's data. Rules:
- Each insight is ONE sentence, max ~110 characters. Punchy and specific.
- Ground EVERY number strictly in the provided data. Never invent figures, names, dates, or categories.
- Put the token "¤" immediately before any money amount (e.g. "¤1,200"). No currency codes or symbols.
- Cover a MIX of areas that actually have data (spending/budget, goals, IOUs). Skip an area if it has no data — don't pad.
- Lead with what matters most: budget risk, overspending, a goal slipping, or an aging IOU. Include at least one encouraging note when things look healthy.
- Vary the wording and emojis. Pick one emoji per insight that fits its meaning. Don't reuse the same emoji.
- Synthesize and rephrase the raw observations in your own warm voice — do not copy them verbatim.
- tone: "warn" for risks/attention, "good" for wins/encouragement, "neutral" otherwise.

The expense data also carries richer signals — use them when they say something interesting:
- expense.spendingPattern: weekdayAvgPerDay vs weekendAvgPerDay (e.g. "weekends run ~2× your weekday spending"), and topDay (your priciest day of the week).
- expense.categoryTrends: per-category thisMonth vs lastMonth with changePct — surface a notable jump or drop.
- expense.upcomingBills: recurring bills due in the next 7 days (total, count, items with inDays) — a useful heads-up.`;

const sanitizeAi = (raw) => {
    const items = Array.isArray(raw?.insights) ? raw.insights : [];
    const valid = ['good', 'warn', 'neutral'];
    const domains = ['expense', 'goals', 'iou', 'general'];
    return items
        .filter((i) => i && typeof i.text === 'string' && i.text.trim())
        .slice(0, MAX_INSIGHTS)
        .map((i, idx) => ({
            id: `ai-${idx}`,
            text: i.text.trim(),
            emoji: (typeof i.emoji === 'string' && i.emoji.trim()) ? i.emoji.trim() : '💡',
            tone: valid.includes(i.tone) ? i.tone : 'neutral',
            domain: domains.includes(i.domain) ? i.domain : 'general',
        }));
};

const generateWithGemini = async (snapshot) => {
    const prompt = `Here is the user's current data (JSON). Generate the insights.\n\n${JSON.stringify(snapshot)}`;
    const raw = await gemini.generateJson({
        system: SYSTEM_PROMPT,
        prompt,
        schema: RESPONSE_SCHEMA,
    });
    const insights = sanitizeAi(raw);
    if (!insights.length) throw new Error('Gemini returned no usable insights');
    return insights;
};


// ── Public API ───────────────────────────────────────────

const getDashboardInsights = async (userId, { refresh = false } = {}) => {
    const snapshot = await gatherSnapshot(userId);
    const inputHash = hashSnapshot(snapshot);

    const cached = await AiInsight.findOne({ userId }).lean();
    const isFresh = cached
        && cached.inputHash === inputHash
        && Date.now() - new Date(cached.generatedAt).getTime() < TTL_MS;

    if (cached && isFresh && !refresh) {
        return { insights: cached.insights, source: cached.source, cached: true };
    }

    let insights;
    let source;
    try {
        insights = await generateWithGemini(snapshot);
        source = 'ai';
    } catch (err) {
        console.warn('[insights] AI unavailable, using fallback:', err.message);
        insights = buildFallbackInsights(snapshot);
        source = 'fallback';
    }
    if (!insights.length) {
        insights = buildFallbackInsights(snapshot);
        source = 'fallback';
    }

    await AiInsight.findOneAndUpdate(
        { userId },
        { userId, insights, source, inputHash, generatedAt: new Date() },
        { upsert: true, new: true }
    );

    return { insights, source, cached: false };
};

module.exports = {
    getDashboardInsights,
    // exported for potential reuse/testing
    gatherSnapshot,
    buildFallbackInsights,
};
