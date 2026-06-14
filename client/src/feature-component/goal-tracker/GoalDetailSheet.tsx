import React, { useState } from 'react'
import moment from 'moment'
import { Check, Plus, Pencil, Trash2, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Goal, Task, TaskType, TaskPayload } from '@/types/goal'

interface GoalDetailSheetProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleTask: (taskId: string, date: string) => Promise<void> | void
  onAddTask: (payload: TaskPayload) => Promise<void> | void
  onDeleteTask: (taskId: string) => Promise<void> | void
  onToggleComplete: (isCompleted: boolean) => Promise<void> | void
  onEdit: () => void
  onDelete: () => Promise<void> | void
}

const TASK_TYPES: TaskType[] = ['Daily', 'Weekly', 'Monthly']

// Completion is keyed by UTC calendar day on the server, so compare date-only.
const todayStr = () => moment().format('YYYY-MM-DD')
const isDoneOn = (task: Task, dayStr: string) =>
  (task.completedDates || []).some((d) => moment.utc(d).format('YYYY-MM-DD') === dayStr)

const GoalDetailSheet: React.FC<GoalDetailSheetProps> = ({
  goal,
  open,
  onOpenChange,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('Daily')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  if (!goal) return null

  const today = todayStr()

  const resetAddTask = () => {
    setShowAddTask(false)
    setTaskTitle('')
    setTaskType('Daily')
  }

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return
    setBusy(true)
    try {
      await onAddTask({
        title: taskTitle.trim(),
        type: taskType,
        startDate: moment().format('YYYY-MM-DD'),
        repeatUntil: moment(goal.targetDate).format('YYYY-MM-DD'),
      })
      resetAddTask()
    } finally {
      setBusy(false)
    }
  }

  const handleToggleTask = async (task: Task) => {
    setTogglingId(task._id)
    try {
      await onToggleTask(task._id, today)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteGoal = async () => {
    setBusy(true)
    try {
      await onDelete()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0 sm:max-w-md sm:mx-auto"
      >
        <SheetHeader className="px-5 pt-5 pb-0 text-left">
          <SheetTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Goal
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 pb-6 pt-2">
          {/* ── Title + meta ───────────────────────────── */}
          <h2 className="text-lg font-extrabold text-foreground">{goal.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target {moment(goal.targetDate).format('MMM D, YYYY')}
            {goal.isCompleted && (
              <span className="text-success font-semibold"> · Completed</span>
            )}
          </p>

          {/* ── Complete / reopen ──────────────────────── */}
          <button
            onClick={() => onToggleComplete(!goal.isCompleted)}
            className={`mt-3 w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              goal.isCompleted
                ? 'border border-border text-foreground hover:bg-grey-x100'
                : 'bg-success/10 text-success hover:bg-success/20'
            }`}
          >
            {goal.isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Reopen goal
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark complete
              </>
            )}
          </button>

          {/* ── Tasks ──────────────────────────────────── */}
          <div className="flex items-center justify-between mt-5 mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tasks
            </span>
            {!showAddTask && (
              <button
                onClick={() => setShowAddTask(true)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add task
              </button>
            )}
          </div>

          {/* Add-task inline form */}
          {showAddTask && (
            <div className="bg-grey-x100 rounded-xl p-3 mb-3 space-y-2.5">
              <input
                type="text"
                autoFocus
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Run 5km"
                className="w-full h-10 px-3 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary text-foreground"
              />
              <div className="grid grid-cols-3 gap-1.5">
                {TASK_TYPES.map((t) => {
                  const selected = taskType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTaskType(t)}
                      aria-pressed={selected}
                      className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                        selected
                          ? 'bg-primary/5 ring-2 ring-primary text-foreground'
                          : 'bg-card border border-border text-muted-foreground hover:bg-grey-x200'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetAddTask}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={busy || !taskTitle.trim()}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add
                </button>
              </div>
            </div>
          )}

          {goal.tasks.length === 0 && !showAddTask ? (
            <div className="text-center py-6 bg-grey-x100 rounded-xl">
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Break this goal into repeatable tasks
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {goal.tasks.map((task) => {
                const doneToday = isDoneOn(task, today)
                const total = (task.completedDates || []).length
                return (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      disabled={togglingId === task._id}
                      aria-pressed={doneToday}
                      aria-label={doneToday ? 'Mark not done today' : 'Mark done today'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        doneToday
                          ? 'bg-success text-white'
                          : 'border-2 border-border hover:border-primary'
                      }`}
                    >
                      {togglingId === task._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        doneToday && <Check className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {task.type} · done {total} {total === 1 ? 'time' : 'times'}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task._id)}
                      aria-label="Delete task"
                      className="text-muted-foreground hover:text-error p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Goal actions ───────────────────────────── */}
          {confirmDelete ? (
            <div className="mt-5 bg-error/5 border border-error/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Delete this goal?</p>
              <p className="text-xs text-muted-foreground mb-3">
                This removes the goal and all its tasks. This can't be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGoal}
                  disabled={busy}
                  className="flex-1 h-9 rounded-lg bg-error text-white text-sm font-semibold hover:bg-error/90 flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
              <button
                onClick={onEdit}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-grey-x100 flex items-center justify-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 h-10 rounded-lg border border-error/30 text-sm font-semibold text-error hover:bg-error/5 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default GoalDetailSheet
