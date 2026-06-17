const mongoose = require('mongoose');
const { Expense, Income } = require('../Schemas/expenseSchema');
const Iou = require('../Schemas/iouSchema');
const { Goal } = require('../Schemas/goal/goalSchema');

// Group timestamps into UTC day-strings ('YYYY-MM-DD'). UTC keeps this aligned
// with how expense/recurring dates are stamped elsewhere (per the timezone
// decision on record) — per-user local days are deferred.
const DAY = { format: '%Y-%m-%d', timezone: 'UTC' };

/**
 * The distinct UTC day-strings on which the user took *any* action across the
 * app — expense/income logged, IOU created or updated, goal created or
 * completed. This is the raw material for the activity streak.
 *
 * Auto-logged recurring expenses/income are excluded (recurringRuleId set):
 * the app materializing a rule isn't the user "showing up", so it must not keep
 * a streak alive on its own.
 *
 * Note: per-day habit-task check-offs (Task.completedDates) are not yet counted
 * — Tasks carry no userId and would need a tasks→goals(author) join. TODO.
 */
const getActivityDays = async (userId, since) => {
  const dayGroup = (dateExpr) => ({
    $group: { _id: { $dateToString: { ...DAY, date: dateExpr } } },
  });

  const [exp, inc, iou, goal] = await Promise.all([
    Expense.aggregate([
      { $match: { userId, recurringRuleId: null, createdAt: { $gte: since } } },
      dayGroup('$createdAt'),
    ]),
    Income.aggregate([
      { $match: { userId, recurringRuleId: null, createdAt: { $gte: since } } },
      dayGroup('$createdAt'),
    ]),
    // Both creation and last-update days (created / settled / partial payment / edit).
    Iou.aggregate([
      { $match: { userId } },
      { $project: { dates: ['$createdAt', '$updatedAt'] } },
      { $unwind: '$dates' },
      { $match: { dates: { $gte: since } } },
      dayGroup('$dates'),
    ]),
    Goal.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      { $project: { dates: ['$createdAt', '$completionDate'] } },
      { $unwind: '$dates' },
      { $match: { dates: { $ne: null, $gte: since } } },
      dayGroup('$dates'),
    ]),
  ]);

  const days = new Set();
  for (const rows of [exp, inc, iou, goal]) {
    for (const r of rows) if (r._id) days.add(r._id);
  }
  return days;
};

module.exports = { getActivityDays };
