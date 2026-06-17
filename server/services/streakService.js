const streakRepository = require('../db/streak');

const MS_DAY = 24 * 60 * 60 * 1000;
// How far back to look when measuring runs. A streak longer than this is
// reported as the cap — far beyond any realistic value, so effectively exact.
const LOOKBACK_DAYS = 365;

// UTC day-string for a Date, matching the repository's $dateToString format.
const toDayStr = (d) => d.toISOString().slice(0, 10);

/**
 * Current and longest activity streaks (consecutive UTC days with any action).
 *
 * The current run anchors on today, but an empty *today* doesn't break it —
 * if yesterday has activity we count from there. That grace stops the badge
 * from reading "broken" first thing in the morning before the user has logged.
 * Miss a full day (no activity yesterday or today) and the current run is 0.
 */
const getActivityStreak = async (userId) => {
  const now = new Date();
  const since = new Date(now.getTime() - LOOKBACK_DAYS * MS_DAY);
  const days = await streakRepository.getActivityDays(userId, since);

  const todayStr = toDayStr(now);
  const loggedToday = days.has(todayStr);

  // Anchor the current run on today (if active) else yesterday (grace day).
  let cursor;
  if (loggedToday) {
    cursor = new Date(now);
  } else {
    const yesterday = new Date(now.getTime() - MS_DAY);
    cursor = days.has(toDayStr(yesterday)) ? yesterday : null;
  }

  let current = 0;
  while (cursor && days.has(toDayStr(cursor))) {
    current++;
    cursor = new Date(cursor.getTime() - MS_DAY);
  }

  // Longest run anywhere in the window: walk the sorted days, counting
  // consecutive-day chains (Date.parse of a 'YYYY-MM-DD' string is UTC midnight).
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const d of [...days].sort()) {
    run = prev && Date.parse(d) - Date.parse(prev) === MS_DAY ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }

  return { current, longest, loggedToday };
};

module.exports = { getActivityStreak };
