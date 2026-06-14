import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Target } from 'lucide-react'
import { toast } from 'sonner'

import axiosInstance from '@/utils/axiosInstance'
import GoalCard from '@/feature-component/goal-tracker/GoalCard'
import GoalFormSheet from '@/feature-component/goal-tracker/GoalFormSheet'
import GoalDetailSheet from '@/feature-component/goal-tracker/GoalDetailSheet'
import type { Goal, GoalPayload, TaskPayload } from '@/types/goal'

const GoalsTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

  // Detail sheet always reads the freshest copy from the list after a refetch.
  const selectedGoal = goals.find((g) => g._id === selectedGoalId) ?? null

  const fetchGoals = async () => {
    try {
      const res = await axiosInstance.get('/v1/goals')
      setGoals(res.data?.goals ?? [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleSubmitGoal = async (payload: GoalPayload) => {
    try {
      if (editingGoal) {
        await axiosInstance.patch(`/v1/goals/${editingGoal._id}`, payload)
        toast.success('Goal updated')
      } else {
        await axiosInstance.post('/v1/goals', payload)
        toast.success('Goal created')
      }
      await fetchGoals()
    } catch (error: any) {
      console.error('Error saving goal:', error)
      toast.error(error?.message || 'Failed to save goal')
      throw error
    }
  }

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return
    try {
      await axiosInstance.delete(`/v1/goals/${selectedGoal._id}`)
      setSelectedGoalId(null)
      await fetchGoals()
      toast.success('Goal deleted')
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to delete goal')
    }
  }

  const handleToggleComplete = async (isCompleted: boolean) => {
    if (!selectedGoal) return
    try {
      await axiosInstance.patch(`/v1/goals/${selectedGoal._id}`, { isCompleted })
      await fetchGoals()
      toast.success(isCompleted ? 'Goal completed 🎉' : 'Goal reopened')
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Failed to update goal')
    }
  }

  const handleAddTask = async (payload: TaskPayload) => {
    if (!selectedGoal) return
    try {
      await axiosInstance.post(`/v1/goals/${selectedGoal._id}/tasks`, payload)
      await fetchGoals()
      toast.success('Task added')
    } catch (error: any) {
      console.error('Error adding task:', error)
      toast.error(error?.message || 'Failed to add task')
    }
  }

  const handleToggleTask = async (taskId: string, date: string) => {
    if (!selectedGoal) return
    try {
      await axiosInstance.post(
        `/v1/goals/${selectedGoal._id}/tasks/${taskId}/toggle`,
        { date }
      )
      await fetchGoals()
    } catch (error) {
      console.error('Error toggling task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedGoal) return
    try {
      await axiosInstance.delete(`/v1/goals/${selectedGoal._id}/tasks/${taskId}`)
      await fetchGoals()
      toast.success('Task deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const openCreate = () => {
    setEditingGoal(null)
    setFormOpen(true)
  }

  const openEdit = () => {
    if (!selectedGoal) return
    setEditingGoal(selectedGoal)
    setSelectedGoalId(null)
    setFormOpen(true)
  }

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const completedGoals = goals.filter((g) => g.isCompleted)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
        {/* ── Header ─────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Goal Tracker
            </p>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5 font-heading">
              Your goals<span className="text-primary">.</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="h-10 px-4 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No goals yet</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
              Set your first goal, break it into tasks, and start building momentum.
            </p>
            <button
              onClick={openCreate}
              className="h-10 px-5 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create a goal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Active · {activeGoals.length}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onClick={() => setSelectedGoalId(goal._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {completedGoals.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Completed · {completedGoals.length}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onClick={() => setSelectedGoalId(goal._id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <GoalFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSubmit={handleSubmitGoal}
      />

      <GoalDetailSheet
        goal={selectedGoal}
        open={Boolean(selectedGoalId)}
        onOpenChange={(o) => !o && setSelectedGoalId(null)}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onEdit={openEdit}
        onDelete={handleDeleteGoal}
      />
    </div>
  )
}

export default GoalsTracker
