import { useState, useEffect, type FormEvent } from 'react';
import { tasksApi, dashboardApi, getErrorMessage } from '../api/client';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskPayload,
  DashboardStats,
} from '../types';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import TaskTable from '../components/tasks/TaskTable';
import EmptyState from '../components/tasks/EmptyState';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import ConfirmModal from '../components/common/ConfirmModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial metadata and stats
  const loadInitialData = async () => {
    try {
      const [meta, statsData] = await Promise.all([
        tasksApi.getMetadata(),
        dashboardApi.getStats(),
      ]);
      setStatuses(meta.statuses);
      setPriorities(meta.priorities);
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch tasks with search and filters
  const loadTasks = async (overrides?: {
    search?: string;
    status?: string;
    priority?: string;
  }) => {
    setLoading(true);
    setError('');
    try {
      const q = overrides?.search !== undefined ? overrides.search : searchQuery;
      const s = overrides?.status !== undefined ? overrides.status : statusFilter;
      const p = overrides?.priority !== undefined ? overrides.priority : priorityFilter;

      const [data, statsData] = await Promise.all([
        tasksApi.getTasks({
          search: q.trim() || undefined,
          status: s || undefined,
          priority: p || undefined,
        }),
        dashboardApi.getStats(),
      ]);
      setTasks(data);
      setStats(statsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever dropdown filters change
  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadTasks();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    loadTasks({ search: '', status: '', priority: '' });
  };

  // Add Task
  const handleAddTask = async (payload: CreateTaskPayload) => {
    await tasksApi.createTask(payload);
    setSuccessMessage('Task created successfully!');
    await loadTasks();
  };

  // Edit Task
  const handleUpdateTask = async (payload: CreateTaskPayload) => {
    if (!editingTask) return;
    await tasksApi.updateTask(editingTask.id, payload);
    setSuccessMessage('Task updated successfully!');
    setEditingTask(null);
    await loadTasks();
  };

  // Delete Task
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await tasksApi.deleteTask(deletingTask.id);
      setSuccessMessage('Task deleted successfully.');
      setDeletingTask(null);
      await loadTasks();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || statusFilter || priorityFilter
  );

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="content-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-heading">To Do</h1>
              <p className="page-subheading">
                Simple task management: view, add, edit, and organize your tasks.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Task
            </button>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}
          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}

          {/* Task Metrics Summary Bar (Clean inline summary: no cards, no emojis) */}
          <div className="summary-bar">
            <span className="summary-item">
              Total: <strong>{stats?.totalTasks ?? tasks.length}</strong>
            </span>
            <span className="summary-divider">|</span>
            <span className="summary-item">
              To Do: <strong>{stats?.todoTasks ?? 0}</strong>
            </span>
            <span className="summary-divider">|</span>
            <span className="summary-item">
              In Progress: <strong>{stats?.inProgressTasks ?? 0}</strong>
            </span>
            <span className="summary-divider">|</span>
            <span className="summary-item">
              Completed: <strong>{stats?.completedTasks ?? 0}</strong>
            </span>
            <span className="summary-divider">|</span>
            <span className={`summary-item ${stats?.overdueTasks ? 'text-danger font-medium' : ''}`}>
              Overdue: <strong>{stats?.overdueTasks ?? 0}</strong>
            </span>
          </div>

          {/* Search and Filters Bar */}
          <div className="filter-card">
            <form onSubmit={handleSearchSubmit} className="filter-form">
              <div className="filter-item filter-search">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Search
                </button>
              </div>

              <div className="filter-item">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  {priorities.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm filter-reset-btn"
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </button>
              )}
            </form>
          </div>

          {/* Tasks Table Area */}
          {loading ? (
            <div className="center-page py-12">
              <LoadingSpinner text="Loading tasks..." />
            </div>
          ) : tasks.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No matching tasks"
                description="No tasks match your current search or filter criteria."
                actionLabel="Clear Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Your task list is empty. Add your first task to get started."
                actionLabel="+ Add your first task"
                onAction={() => setIsAddOpen(true)}
              />
            )
          ) : (
            <div className="tasks-table-wrapper">
              <div className="table-count-label">
                Showing <strong>{tasks.length}</strong> {tasks.length === 1 ? 'task' : 'tasks'}
              </div>
              <TaskTable
                tasks={tasks}
                onView={(task) => setViewingTask(task)}
                onEdit={(task) => setEditingTask(task)}
                onDelete={(task) => setDeletingTask(task)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={Boolean(viewingTask)}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
        onEdit={(task) => {
          setViewingTask(null);
          setEditingTask(task);
        }}
      />

      {/* Add Task Modal */}
      <TaskFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddTask}
        statuses={statuses}
        priorities={priorities}
      />

      {/* Edit Task Modal */}
      <TaskFormModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        task={editingTask}
        statuses={statuses}
        priorities={priorities}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        confirmLabel="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
