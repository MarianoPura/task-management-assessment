import type { Task } from '../../types';
import Badge from '../common/Badge';

interface TaskTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskTable({
  tasks,
  onView,
  onEdit,
  onDelete,
}: TaskTableProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    if (task.status.name === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="table-responsive">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <tr key={task.id} className={overdue ? 'row-overdue' : ''}>
                <td className="task-cell-title">
                  <button
                    type="button"
                    className="task-title-button"
                    onClick={() => onView(task)}
                    title="Click to view full task details"
                  >
                    {task.title}
                  </button>
                  {overdue && (
                    <span className="overdue-tag" title="Task is overdue!">
                      Overdue
                    </span>
                  )}
                </td>
                <td className="task-cell-desc">
                  {task.description || <span className="text-muted italic">-</span>}
                </td>
                <td>
                  <Badge type="status" label={task.status.name} />
                </td>
                <td>
                  <Badge type="priority" label={task.priority.name} />
                </td>
                <td className={overdue ? 'text-danger font-medium' : ''}>
                  {formatDate(task.dueDate)}
                </td>
                <td className="text-right task-actions-cell">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => onView(task)}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => onEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-danger-outline"
                    onClick={() => onDelete(task)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
